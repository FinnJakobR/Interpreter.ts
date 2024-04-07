import { runtimeError } from "../errors/error";
import { Binary, Expr, Stmt, Expression, Grouping, Literal, Print, Unary, Visitor, Var, Variable, Assign, Block, If, While, Logical, Break, Continue, Switch, Call, Function, Return, LambdaFunction, Template, Array, ArrayCall, ArrayAssign, Tupel } from "../expressions/exp";
import { Token, TokenType } from "../lexer/token";
import { BreakError, ContinueError, ReturnError } from "../parser/parser";
import Enviroment from "../state/environment";
import JumpTable from "../state/jumptable";
import FloxCallable from "../state/callable";
import ClockFunction, { FloxFunction } from "../native_functions/function";
import FloxArrayTable from "../state/array";

const replaceAt = function(str: string, index:number, replacement:any): string {
    return str.substring(0, index) + replacement.toString() + str.substring(index + replacement.toString().length);
}

export default class Interpreter implements Visitor<Object | null>{

    public globals: Enviroment;
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

        if(value instanceof FloxArrayTable){
            console.log( value.mutable ? "[" : "(")
            
            for(var [index, element] of value){
                console.log("index: " + index + ":" , element + ",");
            }

            console.log( value.mutable ? "]" : "(");

            return null;
        }

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

    visitFunctionStmt(stmt: Function): Object | null {
        var func: FloxFunction = new FloxFunction(stmt, this.enviroment);

        this.enviroment.define(stmt.name.lexeme, func);

        return null;

    }

    visitReturnStmt(stmt: Return): Object | null {
        var value = null;


        if(stmt.value){
            value = this.evaluate(stmt.value);
        }

        throw new ReturnError(value);
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

        if(expr.name instanceof Variable){
            this.enviroment.assign(expr.name.name, value);
        }
        
        return value;

    }
    public visitCallExpr(expr: Call): Object | null {
     
        var callee: Object | null = this.evaluate(expr.callee);

        if(!callee) return null;

        var args: (Object | null)[] = [];

        for(var arg of expr.args){
            args.push(this.evaluate(arg));
        }


        if(!(this.instanceOfCallable(callee))){
            throw runtimeError(expr.paren, "Call only call functions and Classes!");
        }

        var func: FloxCallable = <FloxCallable>callee;

        if(args.length != func.arity()){
            throw runtimeError(expr.paren, "Expected " +
            func.arity() + " arguments but got " +
            arguments.length + ".")
        }

        var returnValue = func.call(this, args);

        return returnValue;

    }

    public visitArrayExpr(expr: Array): Object | null {
        var arr_obj: FloxArrayTable = new FloxArrayTable(true);
        
        var index: number = 0;

        for(var ele of expr.elements){
            arr_obj.set(index, this.evaluate(ele));
            index++;
        }

        return arr_obj;
    }

    public visitTupelExpr(expr: Tupel): Object | null {
        var tuple_obj: FloxArrayTable = new FloxArrayTable(false);

        var index: number = 0;

        for(var ele of expr.elements){
            tuple_obj.set(index, this.evaluate(ele));
            index++;
        }

        return tuple_obj;
    }

    public visitArrayCallExpr(expr: ArrayCall): Object | null {
        var evaluated_paren = this.evaluate(expr.expr_paren);
        var evaluated_index = this.evaluate(expr.index);

        if( typeof evaluated_index != "number") throw runtimeError(expr.paren, "Cannot index with non-int value!");

        if(!evaluated_paren) throw runtimeError(expr.paren, "Cannot index nil!");

        if(typeof evaluated_paren === "number") throw runtimeError(expr.paren, "Cannot index at a number!");

        
        if(typeof evaluated_paren === "string") {
            return evaluated_paren[evaluated_index!] ?? "nil";
        }

        
        if(evaluated_paren instanceof FloxArrayTable){
            return evaluated_paren.get(evaluated_index!) ?? new Literal("nil");

        }

        return null;
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
    
    public visitArrayAssignExpr(expr: ArrayAssign): Object | null {
        var evaluated_index = this.evaluate(expr.callee.index);

        if(expr.callee.expr_paren instanceof Literal){
            var evaluated_paren = this.evaluate(expr.callee.expr_paren);

            if( typeof evaluated_index != "number") throw runtimeError(expr.callee.paren, "Cannot index with non-int value!");

            if(!evaluated_index) throw runtimeError(expr.callee.paren, "Cannot index nil!");
    
            if(typeof evaluated_paren === "number") throw runtimeError(expr.callee.paren, "Cannot index at a number!");
    
            
            if(typeof evaluated_paren === "string") {
                return replaceAt(evaluated_paren, evaluated_index!, this.evaluate(expr.value));
            }
    
        }

        if(expr.callee.expr_paren instanceof Variable){
            var variable = this.enviroment.get(expr.callee.expr_paren.name);

            if((variable instanceof FloxArrayTable)){
                
                if(variable.mutable){

                variable.set(<number>evaluated_index, expr.value);

                this.enviroment.assign(expr.callee.expr_paren.name, variable);

                }else {
                    throw runtimeError(expr.callee.expr_paren.name, "tuple is not mutable!");
                }


            }else throw runtimeError(expr.callee.expr_paren.name, "variable is not a type of Array!");

        }

        

        return null;
        
    }

    private instanceOfCallable(object: any): object is FloxCallable {
        return "call" in object;
    }

    public visitPlusAssignExpr(expr: Assign): Object | null {
        var value: Object | null = this.evaluate(expr.value);

        var variable_value: Object | null = null;

        if(expr.name instanceof Variable){
            var variable_value = this.enviroment.get(expr.name.name);
        }


        if(typeof value == "number" && typeof variable_value == "number") value = <number>value + <number>variable_value;

        if(typeof value === "string" && typeof variable_value == "string") value = <string>value + <string>variable_value;

        if((typeof value == "string" && typeof variable_value === "number") || (typeof value == "number" && typeof variable_value === "string") ) value = value.toString() + variable_value.toString();


        if(expr.name instanceof Variable){
            this.enviroment.assign(expr.name.name, value);
        }
        
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


        

        if(table.hasDefault()){

            var statements = table.getDefault();

            for(var statement of statements){
                try {
                    this.execute(statement);
                } catch (error) {
                    if(error instanceof BreakError){
                        return null;
                    }
                }
            }
        }

        return null;
    }


    public visitTemplateExpr(expr: Template): Object | null {
        var string = "";

        for(var exp of expr.blocks){
           string += this.evaluate(exp);

        }

        return string;
        
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


    visitLambdaFunctionExpr(expr: LambdaFunction): Object | null {
        var func: FloxFunction = new FloxFunction(expr, this.enviroment);

        return func;
    }

    visitBinaryExpr(expr: Binary): Object | null {
        var left = this.evaluate(expr.left);
        var right = this.evaluate(expr.right);

        switch(expr.operator.type){
            case TokenType.MINUS: {

                if(typeof left === "number" && right instanceof FloxArrayTable){
                    var sizeOfArray: number = right.size;

                    if(sizeOfArray < left) throw runtimeError(new Token(TokenType.MINUS, "-", "-", -1), "remove Size from left ist bigger than the Array Size");

                    right.removeFromStart(left);

                    return right;
                } 

                if(typeof right === "number" && left instanceof FloxArrayTable){
                    var sizeOfArray: number = left.size;

                    if(sizeOfArray < right) throw runtimeError(new Token(TokenType.MINUS, "-", "-", -1), "remove Size from right ist bigger than the Array Size");

                    left.removeFromEnd(right);

                    return left;
                }

                this.checkNumberOperands(expr.operator, left,right);
                return <number>left - <number>right;
            }

            case TokenType.PLUS : {
                if(typeof left == "number" && typeof right == "number") return <number>left + <number>right;

                if(typeof left === "string" && typeof right == "string") return <string>left + <string>right;

                if((typeof left == "string" && typeof right === "number") || (typeof left == "number" && typeof right === "string") ) return left.toString() + right.toString();
            
                if(left instanceof FloxArrayTable && !(right instanceof FloxArrayTable)) {
                    left.push(expr.right);
                    return left;
                }

                if(right instanceof FloxArrayTable && !(left instanceof FloxArrayTable)) {
                    right.unshift(expr.left);
                    return right;
                }

                if(left instanceof FloxArrayTable && (right instanceof FloxArrayTable)) {
                    left.concat(right);
                    return left;
                }

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