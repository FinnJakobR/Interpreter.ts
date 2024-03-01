import { Visitor, Expr, Binary, Grouping, Literal, Unary, Print, Expression, Var, Variable, Assign } from "../expressions/exp";

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

      visitAssignExpr(expr: Assign): string {
        return this.parenthesize(`assignment ${expr.name.lexeme}`, expr.value);
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

      visitUnaryExpr(expr: Unary): string {
          return this.parenthesize(expr.operator.lexeme, expr.right);
      }
}