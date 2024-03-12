import { Token, TokenType } from "../lexer/token";
import { Assign, Binary, Block, Expr, Expression, Grouping, If, Literal, Logical, MinusAssign, PlusAssign, Print, SlashAssign, StarAssign, Stmt, Unary, Var, Variable, While, Break, Continue, Switch, Call, Function, Return } from "../expressions/exp";
import { runtimeError, staticError } from "../errors/error";
import JumpTable from "../state/jumptable";

class ParseError extends Error {
    constructor(){
        super();
    };


};

export class BreakError extends Error {
    constructor(){
        super();
    }
}

export class ContinueError extends Error {
    constructor(){
        super();
    }
} 


export class ReturnError extends Error {
    public value: object | null;

    constructor(value: object | null){
        super();
        this.value = value;
    }
}

export default class Parser {

    private tokens: Token[];
    private current: number;
    private max_args: number = 255; // like Java! 

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

                var dec: Stmt | null = this.declarations();
                if(dec) statements.push(dec);

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
        if(this.match(TokenType.LEFT_BRACE)) return new Block(this.block());
        if(this.match(TokenType.IF)) return this.ifStatement();
        if(this.match(TokenType.FOR)) return this.forStatement();
        if(this.match(TokenType.WHILE)) return this.whileStatement();
        if(this.match(TokenType.SWITCH)) return this.switchStatement();
        if(this.match(TokenType.RETURN)) return this.ReturnStatement();
        return this.expressionStatement();
    
    }


    private ReturnStatement() : Stmt{
        var keyWord: Token = this.previous();
        var value = null;

        if(!this.check(TokenType.SEMICOLON)){
            value = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ; after function return");

        return new Return(keyWord, value);
    }

    private block(): (Stmt)[]{
    
        var statements: (Stmt)[] = [];

        while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()){

            if(this.match(TokenType.BREAK)) statements.push(this.break());
            else if(this.match(TokenType.CONTINUE)) statements.push(this.continue());
            else statements.push(this.declarations());
        }

        this.consume(TokenType.RIGHT_BRACE, "except '}' after block end!");

        return statements;
    }

    private caseBlock(): Stmt[] {
        var statements: (Stmt)[] = [];
        while(!this.check(TokenType.CASE) && !this.isAtEnd()){
            if(this.match(TokenType.BREAK)) statements.push(this.break());
            else if(this.match(TokenType.CONTINUE)) statements.push(this.continue());
            else statements.push(this.declarations());
        }

        return statements;
    }

    private switchStatement(): Stmt {
        
        var rule:  Expr = this.expression();
        var case_table = new JumpTable();
        this.consume(TokenType.DOUBLE_DOT, "expect : after switch expression");
        //NOTE zuerst wollte ich jump tables nutzen das geht aber in diesem Fall nicht da expression und so evaluated werden müssen!

        while(this.match(TokenType.CASE) && !this.isAtEnd()){
            var case_expression: Expr = this.expression();
            this.consume(TokenType.DOUBLE_DOT, "Exprect : after case expression");
            
            var case_statements: Stmt[] = this.caseBlock();


            case_table.set(case_expression, case_statements);

        }

        return new Switch(rule, case_table);


    }

    private whileStatement(): Stmt{
        this.consume(TokenType.LEFT_PAREN, "expect ( after while keyword!");
        var condition: Expr = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "expect ) after while condition!");
        var body: Stmt = this.statement();

        return new While(condition, body);
    }

    private forStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "expect ( after for keyword!");

        var initializer: Stmt | null; 

        if(this.match(TokenType.SEMICOLON)) {
            //like for(;;){}
            initializer = null;
        }else if(this.match(TokenType.VAR)){
            initializer = this.varDeclaration();
        }else {
            initializer = this.expressionStatement();
        }

        var condition: Expr | null = null;

        if(!this.match(TokenType.SEMICOLON)){
            condition = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ; after expression");


        var increment: Expr | null = null;

        if(!this.match(TokenType.RIGHT_PAREN)){
            increment = this.expression();
        }

        this.consume(TokenType.RIGHT_PAREN, "Expect ) after for head!" );

        var body: Stmt = this.statement();

        if(increment != null){
            body = new Block([increment, body]);
        }

        if(condition == null) condition = new Literal(true);

        body = new While(condition, body);

        if(initializer != null){
            body = new Block([initializer, body]);
        }

        return body;

    }

    private break(): Stmt {
        var name: Token = this.previous();

        this.consume(TokenType.SEMICOLON, "expect ; after break statement!");

        return new Break(name);
    }

    private continue(): Stmt {
        var name: Token = this.previous();

        this.consume(TokenType.SEMICOLON, "expect ; after break statement!");

        return new Continue(name);
    }

    private ifStatement(): Stmt{
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");

        var condition: Expr = this.expression();

        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after 'if'.");

        var thenBranch: Stmt = this.statement();

        var elseBranch: Stmt | null = null;

        if(this.match(TokenType.ELSE)){
            elseBranch = this.statement();
        }

        return new If(condition, thenBranch, elseBranch as Stmt);
    }

    private declarations(): Stmt{
        try {
            if(this.match(TokenType.FUN)) return this.functionDeclaration("function");
            if(this.match(TokenType.VAR)) return this.varDeclaration();

            return this.statement();
        } catch (error) {
            this.synchronize();
            return this.statement();
        }
    }

    private functionDeclaration(kind: string): Stmt {
        var name: Token = this.consume(TokenType.IDENTIFIER, "Expect " + kind + " name.");

        this.consume(TokenType.LEFT_PAREN, "Expect '(' after " + kind + " name.");

        var paramters: Token[] = [];

        if(!this.check(TokenType.RIGHT_PAREN)){
            do {
                if(paramters.length >= this.max_args){
                    throw runtimeError(this.peek(),  "Can't have more than " + this.max_args + " parameters.")
                }

                paramters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
            } while(this.match(TokenType.COMMA))
        }

        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

        this.consume(TokenType.LEFT_BRACE,  "Expect '{' before " + kind + " body.");

        var body: Stmt[] = this.block();

        var f = new Function(name, paramters, body);

        return f;
    }

    private varDeclaration(): Stmt{
        var name: Token = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

        var initializer: Expr | null = null;

        if(this.match(TokenType.EQUAL)){
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");

        return new Var(name, initializer);
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
        return this.assignment();
    }

    private assignment(): Expr {
        var expr: Expr = this.or();

        if(this.match(TokenType.EQUAL)){
            var equals: Token = this.previous();
            var value: Expr = this.assignment();
            
            if(expr instanceof Variable){
                var name : Token = expr.name;
                return new Assign(name, value);
            }

            runtimeError(equals, `unknown variable ${equals.lexeme}.`);

        }

        if(this.match(TokenType.PLUS_EQUAL)){
            var equals: Token = this.previous();
            var value: Expr = this.assignment();
            
            if(expr instanceof Variable){
                var name : Token = expr.name;
                return new PlusAssign(name, value);
            }

            runtimeError(equals, `unknown variable ${equals.lexeme}.`);

        }

        if(this.match(TokenType.MINUS_EQUAL)){
            var equals: Token = this.previous();
            var value: Expr = this.assignment();
            
            if(expr instanceof Variable){
                var name : Token = expr.name;
                return new MinusAssign(name, value);
            }

            runtimeError(equals, `unknown variable ${equals.lexeme}.`);

        }

        if(this.match(TokenType.STAR_EQUAL)){
            var equals: Token = this.previous();
            var value: Expr = this.assignment();
            
            if(expr instanceof Variable){
                var name : Token = expr.name;
                return new StarAssign(name, value);
            }

            runtimeError(equals, `unknown variable ${equals.lexeme}.`);

        }

        if(this.match(TokenType.SLASH_EQUAL)){
            var equals: Token = this.previous();
            var value: Expr = this.assignment();
            
            if(expr instanceof Variable){
                var name : Token = expr.name;
                return new SlashAssign(name, value);
            }

            runtimeError(equals, `unknown variable ${equals.lexeme}.`);

        }

        return expr;
    }

    private or(): Expr{
        var expr: Expr = this.and();

        while(this.match(TokenType.OR)){
            var operator: Token = this.previous();
            var right: Expr = this.and();
            expr = new Logical(expr, operator, right);
        }

        return expr;
    }

    private and(): Expr{
        var expr: Expr = this.equality();

        while(this.match(TokenType.AND)){
            var operator: Token = this.previous();
            var right: Expr = this.equality();
            expr = new Logical(expr, operator, right);
        }

        return expr;
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

        while(this.match(TokenType.SLASH, TokenType.STAR, TokenType.MODULO)){
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

        return this.call();
 
       }

    private call(): Expr {
        var expr: Expr = this.primary();
        
        while(true){
            if(this.match(TokenType.LEFT_PAREN)){
                expr = this.finishCall(expr);
            }else{
                break;
            }
        }

        return expr;
    }

    private finishCall(callee: Expr) : Expr {
        var args: Expr[] = [];

        if(!this.check(TokenType.RIGHT_PAREN)){
            do {

                if(args.length >= this.max_args){
                    runtimeError(this.peek(),`Cant have more than ${this.max_args} arguments`);
                }
                
                args.push(this.expression());
            } while(this.match(TokenType.COMMA));
        }

        var paren: Token = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments");

        return new Call(callee, paren, args);
    }

    private primary(): Expr {

        if(this.match(TokenType.TRUE)) return new Literal(true);
        if(this.match(TokenType.FALSE)) return new Literal(false);
        if(this.match(TokenType.NIL)) return new Literal(null);
        if(this.match(TokenType.MAYBE)) return new Literal(Math.random() < 0.5);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal);
          }

        if(this.match(TokenType.IDENTIFIER)){
            return new Variable(this.previous());
        }

        if(this.match(TokenType.LEFT_PAREN)){
            var expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
            return new Grouping(expr);
        }

        throw this.RuntimeError(this.peek(), "Expect expression.");
    }


}