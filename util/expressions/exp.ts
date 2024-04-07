import { Token } from "../lexer/token";

import JumpTable from "../state/jumptable";

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}


 export interface Visitor <R> {
visitAssignExpr( expr: Assign) : R;
visitBinaryExpr( expr: Binary) : R;
visitCallExpr( expr: Call) : R;
visitGroupingExpr( expr: Grouping) : R;
visitLambdaFunctionExpr( expr: LambdaFunction) : R;
visitLiteralExpr( expr: Literal) : R;
visitTemplateExpr( expr: Template) : R;
visitLogicalExpr( expr: Logical) : R;
visitUnaryExpr( expr: Unary) : R;
visitArrayExpr( expr: Array) : R;
visitTupelExpr( expr: Tupel) : R;
visitArrayCallExpr( expr: ArrayCall) : R;
visitArrayAssignExpr( expr: ArrayAssign) : R;
visitVariableExpr( expr: Variable) : R;
}
export class Assign extends Expr{
    public name : Token;
    public value : Expr;
    constructor ( name : Token, value : Expr,){
        super()
        this.name = name;
        this.value = value;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitAssignExpr(this);
        }}


export class Binary extends Expr{
    public left : Expr;
    public operator : Token;
    public right : Expr;
    constructor ( left : Expr, operator : Token, right : Expr,){
        super()
        this.left = left;
        this.operator = operator;
        this.right = right;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitBinaryExpr(this);
        }}


export class Call extends Expr{
    public callee : Expr;
    public paren : Token;
    public args : Expr[];
    constructor ( callee : Expr, paren : Token, args : Expr[],){
        super()
        this.callee = callee;
        this.paren = paren;
        this.args = args;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitCallExpr(this);
        }}


export class Grouping extends Expr{
    public expression : Expr;
    constructor ( expression : Expr,){
        super()
        this.expression = expression;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitGroupingExpr(this);
        }}


export class LambdaFunction extends Expr{
    public params : Token[];
    public body : Stmt[];
    constructor ( params : Token[], body : Stmt[],){
        super()
        this.params = params;
        this.body = body;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitLambdaFunctionExpr(this);
        }}


export class Literal extends Expr{
    public value : Object|null;
    constructor ( value : Object|null,){
        super()
        this.value = value;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitLiteralExpr(this);
        }}


export class Template extends Expr{
    public blocks : Expr[];
    constructor ( blocks : Expr[],){
        super()
        this.blocks = blocks;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitTemplateExpr(this);
        }}


export class Logical extends Expr{
    public left : Expr;
    public operator : Token;
    public right : Expr;
    constructor ( left : Expr, operator : Token, right : Expr,){
        super()
        this.left = left;
        this.operator = operator;
        this.right = right;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitLogicalExpr(this);
        }}


export class Unary extends Expr{
    public operator : Token;
    public right : Expr;
    constructor ( operator : Token, right : Expr,){
        super()
        this.operator = operator;
        this.right = right;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitUnaryExpr(this);
        }}


export class Array extends Expr{
    public elements : Expr[];
    constructor ( elements : Expr[],){
        super()
        this.elements = elements;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitArrayExpr(this);
        }}


export class Tupel extends Expr{
    public elements : Expr[];
    constructor ( elements : Expr[],){
        super()
        this.elements = elements;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitTupelExpr(this);
        }}


export class ArrayCall extends Expr{
    public paren : Token;
    public expr_paren : Expr;
    public index : Expr;
    constructor ( paren : Token, expr_paren : Expr, index : Expr,){
        super()
        this.paren = paren;
        this.expr_paren = expr_paren;
        this.index = index;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitArrayCallExpr(this);
        }}


export class ArrayAssign extends Expr{
    public callee : ArrayCall;
    public value : Expr;
    constructor ( callee : ArrayCall, value : Expr,){
        super()
        this.callee = callee;
        this.value = value;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitArrayAssignExpr(this);
        }}


export class Variable extends Expr{
    public name : Token;
    constructor ( name : Token,){
        super()
        this.name = name;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitVariableExpr(this);
        }}


export abstract class Stmt {
  abstract accept<R>(visitor: Visitor<R>): R;
}


 export interface Visitor <R> {
visitExpressionStmt( stmt: Expression) : R;
visitFunctionStmt( stmt: Function) : R;
visitIfStmt( stmt: If) : R;
visitPrintStmt( stmt: Print) : R;
visitReturnStmt( stmt: Return) : R;
visitVarStmt( stmt: Var) : R;
visitWhileStmt( stmt: While) : R;
visitBreakStmt( stmt: Break) : R;
visitContinueStmt( stmt: Continue) : R;
visitBlockStmt( stmt: Block) : R;
visitSwitchStmt( stmt: Switch) : R;
}
export class Expression extends Stmt{
    public expression : Expr;
    constructor ( expression : Expr,){
        super()
        this.expression = expression;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitExpressionStmt(this);
        }}


export class Function extends Stmt{
    public name : Token;
    public params : Token[];
    public body : Stmt[];
    constructor ( name : Token, params : Token[], body : Stmt[],){
        super()
        this.name = name;
        this.params = params;
        this.body = body;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitFunctionStmt(this);
        }}


export class If extends Stmt{
    public condition : Expr;
    public thenBranch : Stmt;
    public elseBranch : Stmt;
    constructor ( condition : Expr, thenBranch : Stmt, elseBranch : Stmt,){
        super()
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitIfStmt(this);
        }}


export class Print extends Stmt{
    public expression : Expr;
    constructor ( expression : Expr,){
        super()
        this.expression = expression;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitPrintStmt(this);
        }}


export class Return extends Stmt{
    public keyword : Token;
    public value : Expr|null;
    constructor ( keyword : Token, value : Expr|null,){
        super()
        this.keyword = keyword;
        this.value = value;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitReturnStmt(this);
        }}


export class Var extends Stmt{
    public name : Token;
    public initializer : Expr|null;
    public mutable : boolean;
    constructor ( name : Token, initializer : Expr|null, mutable : boolean,){
        super()
        this.name = name;
        this.initializer = initializer;
        this.mutable = mutable;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitVarStmt(this);
        }}


export class While extends Stmt{
    public condition : Expr;
    public body : Stmt;
    constructor ( condition : Expr, body : Stmt,){
        super()
        this.condition = condition;
        this.body = body;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitWhileStmt(this);
        }}


export class Break extends Stmt{
    public name : Token;
    constructor ( name : Token,){
        super()
        this.name = name;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitBreakStmt(this);
        }}


export class Continue extends Stmt{
    public name : Token;
    constructor ( name : Token,){
        super()
        this.name = name;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitContinueStmt(this);
        }}


export class Block extends Stmt{
    public statements : Stmt[];
    constructor ( statements : Stmt[],){
        super()
        this.statements = statements;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitBlockStmt(this);
        }}


export class Switch extends Stmt{
    public rule : Expr;
    public cases : JumpTable;
    constructor ( rule : Expr, cases : JumpTable,){
        super()
        this.rule = rule;
        this.cases = cases;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitSwitchStmt(this);
        }}


