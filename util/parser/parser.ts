import { Token, TokenType } from "../lexer/token";
import { Binary, Expr, Expression, Grouping, Literal, Print, Stmt, Unary } from "../expressions/exp";
import { runtimeError } from "../errors/error";

class ParseError extends Error {
    constructor(){
        super();
    };


};

export default class Parser {

    private tokens: Token[];
    private current: number;

    constructor(tokens: Token[]){
        this.tokens = tokens;
        this.current = 0;
    }

    private RuntimeError(token: Token, message: string): ParseError {
        runtimeError(token, message);
        return new ParseError();
    }

    public parse(): Stmt[] {
         var statements : Stmt[] = [];
            try {

              while(!this.isAtEnd()){
                statements.push(this.statement());
              }

              return statements;


            } catch (error: any) {
              return statements;
            }
    }

    private synchronize(){
        this.advance();

        while(!this.isAtEnd()){
            if (this.previous().type == TokenType.SEMICOLON) return;

            switch(this.peek().type){
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                return;
            }
            this.advance();
        }
    }

    private check(type: TokenType) : boolean{
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
      }

      private advance() :Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
      }

      private isAtEnd():boolean {
        return this.peek().type == TokenType.EOF;
      }

      private peek(): Token {
        return this.tokens[this.current];
      }
    
      private previous(): Token {
        return this.tokens[this.current - 1];
      }

      private consume(type: TokenType, message: string): Token{
        if(this.check(type)) return this.advance();

        throw this.RuntimeError(this.peek(), message);
      }




    private match(...types: TokenType[]): boolean{
        for (var type of types){
            if(this.check(type)){
                this.advance();
                return true;
            }
        }

        return false;
    }

    private statement(): Stmt {
        if(this.match(TokenType.PRINT)) return this.printStatement();

        return this.expressionStatement();
       
    }

    private printStatement() : Stmt {
        var value : Expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after Print Statement.");

        return new Print(value);

    }

    private expressionStatement(): Stmt{
        var value: Expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after Expression");

        return new Expression(value);
    }



    private expression(): Expr{
        return this.equality();
    }

    private equality(): Expr{
        var expr: Expr = this.comparison();

        while(this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL )){
            var operator: Token = this.previous();
            var right = this.comparison();
            expr = new Binary(expr, operator, right);
        }

        return expr;

    }

    private comparison(): Expr{
        var expr: Expr = this.term();

        while(this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)){
            var operator: Token = this.previous();
            var right = this.term();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private term(): Expr {
        var expr: Expr = this.factor();

        while(this.match(TokenType.MINUS, TokenType.PLUS)){
            var operator: Token = this.previous();
            var right = this.factor();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private factor(): Expr {
        var expr: Expr = this.unary();

        while(this.match(TokenType.SLASH, TokenType.STAR)){
            var operator: Token = this.previous();
            var right = this.unary();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private unary(): Expr {

        if(this.match(TokenType.BANG, TokenType.MINUS)){
            var operator: Token = this.previous(); 
            var right = this.unary();
            return new Unary(operator, right);
        }

        return this.primary();
    }

    private primary(): Expr {

        if(this.match(TokenType.TRUE)) return new Literal(true);
        if(this.match(TokenType.FALSE)) return new Literal(false);
        if(this.match(TokenType.NIL)) return new Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal);
          }

        if(this.match(TokenType.LEFT_PAREN)){
            var expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
            return new Grouping(expr);
        }

        throw this.RuntimeError(this.peek(), "Expect expression.");
    }


}