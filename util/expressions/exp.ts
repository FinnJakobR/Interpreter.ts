import { Token } from "../lexer/token";
import JumpTable from "../state/jumptable";

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}


 export interface Visitor <R> {
visitAssignExpr( expr: Assign) : R;
visitPlusAssignExpr( expr: PlusAssign) : R;
visitMinusAssignExpr( expr: MinusAssign) : R;
visitStarAssignExpr( expr: StarAssign) : R;
visitSlashAssignExpr( expr: SlashAssign) : R;
visitBinaryExpr( expr: Binary) : R;
visitGroupingExpr( expr: Grouping) : R;
visitLiteralExpr( expr: Literal) : R;
visitLogicalExpr( expr: Logical) : R;
visitUnaryExpr( expr: Unary) : R;
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


export class PlusAssign extends Expr{
    public name : Token;
    public value : Expr;
    constructor ( name : Token, value : Expr,){
        super()
        this.name = name;
        this.value = value;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitPlusAssignExpr(this);
        }}


export class MinusAssign extends Expr{
    public name : Token;
    public value : Expr;
    constructor ( name : Token, value : Expr,){
        super()
        this.name = name;
        this.value = value;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitMinusAssignExpr(this);
        }}


export class StarAssign extends Expr{
    public name : Token;
    public value : Expr;
    constructor ( name : Token, value : Expr,){
        super()
        this.name = name;
        this.value = value;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitStarAssignExpr(this);
        }}


export class SlashAssign extends Expr{
    public name : Token;
    public value : Expr;
    constructor ( name : Token, value : Expr,){
        super()
        this.name = name;
        this.value = value;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitSlashAssignExpr(this);
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


export class Grouping extends Expr{
    public expression : Expr;
    constructor ( expression : Expr,){
        super()
        this.expression = expression;
  }
 accept<R>(visitor: Visitor<R>): R {
            return visitor.visitGroupingExpr(this);
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
visitIfStmt( stmt: If) : R;
visitPrintStmt( stmt: Print) : R;
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


export class Var extends Stmt{
    public name : Token;
    public initializer : Expr|null;
    constructor ( name : Token, initializer : Expr|null,){
        super()
        this.name = name;
        this.initializer = initializer;
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


