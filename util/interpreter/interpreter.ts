
import { off } from "process";
import { runtimeError } from "../errors/error";
import { Binary, Expr, Stmt, Expression, Grouping, Literal, Print, Unary, Visitor, Var, Variable, Assign, MinusAssign, SlashAssign, StarAssign, Block, If, While, Logical, Break, Continue, Switch, Call } from "../expressions/exp";
import { Token, TokenType } from "../lexer/token";
import { BreakError, ContinueError } from "../parser/parser";
import Enviroment from "../state/environment";
import JumpTable from "../state/jumptable";
import FloxCallable from "../state/callable";
import ClockFunction from "../native_functions/function";

export default class Interpreter implements Visitor<Object | null>{

    private globals: Enviroment;
    private enviroment: Enviroment;
    private REPL?: boolean; 

    constructor(REPL?: boolean){
        this.globals = new Enviroment();
        this.enviroment = this.globals;
        this.REPL = REPL ?? false;

        this.globals.define("clock", new ClockFunction());


    };

    public interpret(statements: Stmt[]){
        var repl_prints = [];
        try {
            
            for(var statement of statements){
                repl_prints.push(this.execute(statement));
            }

            if(this.REPL) return repl_prints;

        } catch (error) {
            return null;
        }
    }

    private evaluate(expr: Expr): Object | null {
        return expr.accept(this);
    }

    private execute(stmt: Stmt ) {
        return stmt.accept(this);
      }

    private isTruthly(object : Object | null){
        
        if(object == null) return false;
        if(typeof object === "boolean") return Boolean(object).valueOf();
        
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

    executeBlocks(statements: Stmt[], enviroment: Enviroment){
        
        
        //handle Scope 
        var previous: Enviroment = this.enviroment;
       
        try {
            this.enviroment = enviroment;

            for(var statement of statements){
                this.execute(statement);
            }

        } finally {
            this.enviroment = previous;
        }
    };

    public visitPrintStmt(stmt: Print): Object | null{
        var value:  Object | null = this.evaluate(stmt.expression);
        console.log(value);
        return null;
    }
    
    public visitBreakStmt(stmt: Break): Object | null {

        if(stmt.name.type == TokenType.BREAK) throw new BreakError();
        
        return null;
    }
    
    public visitContinueStmt(stmt: Continue): Object | null {
        
        if(stmt.name.type === TokenType.CONTINUE) throw new ContinueError();
        
        return null;
    }

    visitIfStmt(stmt: If): Object | null {
        if (this.isTruthly(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
          } else if (stmt.elseBranch != null) {
            this.execute(stmt.elseBranch);
          }

        return null;
    }

    visitBlockStmt(stmt: Block): Object | null {
        this.executeBlocks(stmt.statements, new Enviroment(this.enviroment));

        return null;
    }

    visitWhileStmt(stmt: While): Object | null {
        
        while(this.isTruthly(this.evaluate(stmt.condition))){
            try {
                this.execute(stmt.body);   
            } catch (error) {
             
                if(error instanceof BreakError){
                break;
                }
                if(error instanceof ContinueError) {
                    continue;
                }


            }
        }

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
        return this.evaluate(stmt.expression);
    }
    
    public visitLiteralExpr(expr: Literal): Object | null {
        return expr.value;
    }

    public visitAssignExpr(expr: Assign): Object | null {
        var value: Object | null = this.evaluate(expr.value);
        this.enviroment.assign(expr.name, value);
        
        return value;

    }
    public visitCallExpr(expr: Call): Object | null {
     
        var callee: Object | null = this.evaluate(expr.callee);

        if(!callee) return null;

        var args: (Object | null)[] = [];

        for(var arg of expr.arguments){
            args.push(this.evaluate(arg));
        }


        if(!(callee instanceof FloxCallable)){
            throw runtimeError(expr.paren, "Call only call functions and Classes!");
        }

        var func: FloxCallable = <FloxCallable>callee;

        if(args.length != func.arity()){
            throw runtimeError(expr.paren, "Expected " +
            func.arity() + " arguments but got " +
            arguments.length + ".")
        }

        return func.call(this, args);

    }

    public visitLogicalExpr(expr: Logical): Object | null {
        var left: Object | null = this.evaluate(expr.left);

        if(expr.operator.type == TokenType.OR){
            if(this.isTruthly(left)) return left;

        } else {
            if(!this.isTruthly(left)) return left;
        }

        return this.evaluate(expr.right);
    }

    public visitPlusAssignExpr(expr: Assign): Object | null {
        var value: Object | null = this.evaluate(expr.value);

        var variable_value: Object | null = this.enviroment.get(expr.name);

        if(typeof value == "number" && typeof variable_value == "number") value = <number>value + <number>variable_value;

        if(typeof value === "string" && typeof variable_value == "string") value = <string>value + <string>variable_value;

        if((typeof value == "string" && typeof variable_value === "number") || (typeof value == "number" && typeof variable_value === "string") ) value = value.toString() + variable_value.toString();


        this.enviroment.assign(expr.name, value);
        
        return value;

    }
    
    public visitSwitchStmt(stmt: Switch): Object | null {

        var table: JumpTable = stmt.cases;
    
        for (let [key, value] of table){
            var _case = this.evaluate(key);
            if(this.isEqual(_case, this.evaluate(stmt.rule))){
                for(var statement of value){
                    try {
                        this.execute(statement);
                    } catch (error) {
                        if(error instanceof BreakError){
                            return null;
                        }
                    }
                }
            }

        }

        return null;
    }

    public visitMinusAssignExpr(expr: MinusAssign): Object | null {
        var value: Object | null = this.evaluate(expr.value);

        var variable_value: Object | null = this.enviroment.get(expr.name);

        this.checkNumberOperands(expr.name, value,variable_value);

        value = <number>variable_value - <number>value;

        this.enviroment.assign(expr.name, value);

        return value;
    }

    public visitSlashAssignExpr(expr: SlashAssign): Object | null {
        var value: Object | null = this.evaluate(expr.value);

        var variable_value: Object | null = this.enviroment.get(expr.name);

        this.checkNumberOperands(expr.name, value,variable_value);
        this.checkIfNull(value, expr.name);
                
        value = <number> variable_value / <number>value;

        this.enviroment.assign(expr.name, value);

        return value;
    }

    public visitStarAssignExpr(expr: StarAssign): Object | null {
        
        var value: Object | null = this.evaluate(expr.value);

        var variable_value: Object | null = this.enviroment.get(expr.name);

        this.checkNumberOperands(expr.name, value,variable_value);

        value = <number> variable_value * <number>value;

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

            case TokenType.BANG_EQUAL: {
                return !this.isEqual(left,right);
            }

            case TokenType.EQUAL_EQUAL: {
                return this.isEqual(left, right);
            }

            case TokenType.MODULO: {
                return <number>left % <number>right;
            }
        }

        return null;
    }


}