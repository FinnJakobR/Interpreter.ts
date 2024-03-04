import { Visitor, Expr, Binary, Grouping, Literal, Unary, Print, Expression, Var, Variable, Assign, MinusAssign, PlusAssign, SlashAssign, StarAssign, Block, If, While, Logical, Break, Continue, Switch, Stmt } from "../expressions/exp";

export default class AstPrinter implements Visitor<string>{
    
    constructor(){};

    private parenthesize(name: string, ...exprs : Expr[]){
        var str = "";

        str+=`(${name}`;

        for(var expr of exprs){
            str+=" ";
            str+= (expr.accept(this));
        }

        str+= ")";

        return str;

    }

    print(expr: Expr) :string {
        return expr.accept(this);
      }

      visitBinaryExpr(expr: Binary): string {
          return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
      }

      visitPrintStmt(stmt: Print): string {
          return this.parenthesize("print", stmt.expression);
      }

      visitVarStmt(stmt: Var): string {
          return this.parenthesize(`declaration ${stmt.name.lexeme}`, stmt.initializer ?? new Literal(null));
      }

      visitVariableExpr(expr: Variable): string {
          return expr.name.lexeme;
      }

      visitIfStmt(stmt: If): string {
        var condition : string = this.parenthesize("condition", stmt.condition);
        var thenBranch: string = this.parenthesize("then", stmt.thenBranch);
        var elseBranch: string =  stmt.elseBranch ? this.parenthesize("else", stmt.elseBranch) : "(else null)";
        return `(if ${condition} ${thenBranch} ${elseBranch})`;
      }

      visitBlockStmt(stmt: Block): string {
       //CHANGE ME 
       
        var s = "";
          for(var statement of stmt.statements){
            s += this.parenthesize("statement", statement);
          }

          return s;
      }

      visitAssignExpr(expr: Assign): string {
        return this.parenthesize(`assignment ${expr.name.lexeme}`, expr.value);
      }

      visitLogicalExpr(expr: Logical): string {
          return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
      }

      visitWhileStmt(stmt: While): string {
        return this.parenthesize("condition", stmt.condition, stmt.body);
      }

      visitMinusAssignExpr(expr: MinusAssign): string {
        return this.parenthesize(`minus assignment ${expr.name.lexeme}`, expr.value);
      }

      visitPlusAssignExpr(expr: PlusAssign): string {
        return this.parenthesize(`plus assignment ${expr.name.lexeme}`, expr.value);
      }

      visitSlashAssignExpr(expr: SlashAssign): string {
        return this.parenthesize(`slash assignment ${expr.name.lexeme}`, expr.value);
      }

      visitStarAssignExpr(expr: StarAssign): string {
        return this.parenthesize(`start assignment ${expr.name.lexeme}`, expr.value);
      }

      visitExpressionStmt(stmt: Expression): string {
        return this.parenthesize("expression", stmt.expression);
      }

      visitGroupingExpr(expr: Grouping): string {
          return this.parenthesize("group", expr.expression);
      }

      visitLiteralExpr(expr: Literal): string {
          if(expr.value == null) return "nil";
          return expr.value.toString();
      }

      visitBreakStmt(stmt: Break): string {
          return "break";
      }

      visitContinueStmt(stmt: Continue): string {
          return "continue";
      }

      visitSwitchStmt(stmt: Switch): string {
          return this.parenthesize("switch", stmt.rule);
          
      }

      visitUnaryExpr(expr: Unary): string {
          return this.parenthesize(expr.operator.lexeme, expr.right);
      }
}