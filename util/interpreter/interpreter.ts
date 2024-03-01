
import { runtimeError } from "../errors/error";
import { Binary, Expr, Stmt, Expression, Grouping, Literal, Print, Unary, Visitor, Var, Variable, Assign } from "../expressions/exp";
import { Token, TokenType } from "../lexer/token";
import Enviroment from "../state/environment";

export default class Interpreter implements Visitor<Object | null>{

    private enviroment: Enviroment; 

    constructor(){
        this.enviroment = new Enviroment();
    };

    public interpret(statements: Stmt[]){
        try {
            
            for(var statement of statements){
                this.execute(statement);
            }

        } catch (error) {
            return null;
        }
    }

    private evaluate(expr: Expr): Object | null {
        return expr.accept(this);
    }

    private execute(stmt: Stmt ) {
        stmt.accept(this);
      }

    private isTruthly(object : Object | null){
        
        if(object == null) return false;
        if(object instanceof Boolean) return Boolean(object).valueOf();
        
        return true;

    }

    private isEqual(objectA : Object | null, objectB : Object | null): boolean{
        if (objectA == null && objectB == null) return true;
        if (objectA == null) return false;

        return objectA == objectB;
    }

    checkNumberOperand(operator: Token, operant: Object | null){
        if(typeof operant == "number") return;

        throw runtimeError(operator, "Operand must be a number.");
    }

    checkIfNull(operant : Object | null, operator: Token ){
        if(operant == null || operant  == 0){
            throw runtimeError(operator, "Divisior has to be not null.");
        }

    }

    checkNumberOperands(operator: Token, operantA: Object | null, operantB: Object | null){
        if(typeof operantA == "number" && typeof operantB == "number") return;

        throw runtimeError(operator, "Operand must be a number.");
    }

    public visitPrintStmt(stmt: Print): Object | null{
        var value:  Object | null = this.evaluate(stmt.expression);
        console.log(value);
        return null;
    }

    visitVarStmt(stmt: Var): Object | null {
        var value : Object | null = null;

        if(stmt.initializer != null){
            value = this.evaluate(stmt.initializer);
        }

        this.enviroment.define(stmt.name.lexeme, value);

        return null;
    }

    visitVariableExpr(expr: Variable): Object | null {
        return this.enviroment.get(expr.name);
    }

    public visitExpressionStmt(stmt: Expression) : Object | null{
        this.evaluate(stmt.expression);
        return null;
    }
    
    public visitLiteralExpr(expr: Literal): Object | null {
        return expr.value;
    }

    public visitAssignExpr(expr: Assign): Object | null {
        var value: Object | null = this.evaluate(expr.value);
        
        this.enviroment.assign(expr.name, value);
        
        return value;

    }

    
    public visitGroupingExpr(expr: Grouping): Object | null {
        return this.evaluate(expr.expression);
    }
    
    public visitUnaryExpr(expr: Unary): Object | null {
        var right = this.evaluate(expr.right);

        switch(expr.operator.type){
            case TokenType.MINUS: {
                return -<number>right;
            }

            case TokenType.BANG: {
                return !this.isTruthly(right);
            }

        }

        return null;
    }

    visitBinaryExpr(expr: Binary): Object | null {
        var left = this.evaluate(expr.left);
        var right = this.evaluate(expr.right);

        switch(expr.operator.type){
            case TokenType.MINUS: {
                this.checkNumberOperands(expr.operator, left,right);
                return <number>left - <number>right;
            }

            case TokenType.PLUS : {
                if(typeof left == "number" && typeof right == "number") return <number>left + <number>right;

                if(typeof left === "string" && typeof right == "string") return <string>left + <string>right;

                if((typeof left == "string" && typeof right === "number") || (typeof left == "number" && typeof right === "string") ) return left.toString() + right.toString();
            
                break;
            }

            case TokenType.SLASH : {
                this.checkNumberOperands(expr.operator, left,right);
                this.checkIfNull(right, expr.operator);
                
                return <number> left / <number>right;
            }

            case TokenType.STAR: {
                this.checkNumberOperands(expr.operator, left,right);
                return <number>left * <number> right;
            }

            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left,right);
                return <number>left > <number>right;
              case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left,right);
                return <number>left >= <number>right;
              case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left,right);
                return <number>left < <number>right;
              case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left,right);
                return <number>left <= <number>right;

            case TokenType.BANG: {
                return !this.isEqual(left, right);
            }

            case TokenType.BANG_EQUAL: {
                return this.isEqual(left,right);
            }
        }

        return null;
    }


}