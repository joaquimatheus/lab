import { 
    Stmt, 
    Program, 
    Expr, 
    BinaryExpr, 
    NumericLiteral, 
    Identifier,
} from "./ast.ts";

import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
    private tokens: Token[] = [];

    private not_eof (): boolean {
        return this.tokens[0].type != TokenType.EOF;
    }

    private at () {
        return this.tokens[0] as Token;
    }

    private eat() {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    public produceAST (sourceCode: string): Program {
        this.tokens = tokenize(sourceCode);
        const program: Program = {
            kind: "Program",
            body: [],
        };

        // Parse until end of file
        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }

        return program;
    }

    private parse_stmt (): Stmt {
        return this.parse_expr();
    }

    private parse_expr (): Expr {
        return this.parse_additive_expr();
    }

    private parse_additive_expr (): Expr {
        let left = this.parse_primary_expr();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            console.log(operator);
            const right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left, 
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_primary_expr (): Expr {
        const tk = this.at().type;

        switch (tk) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value } as Identifier;
            case TokenType.Number:
                return {
                    kind: 'NumericLiteral',
                    value: parseFloat(this.eat().value),
                } as NumericLiteral;
            default:
                console.error("Unexpected token found during parsing", this.at());
                Deno.exit(1);
        }
    }
}
