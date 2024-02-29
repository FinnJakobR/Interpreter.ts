import { Visitor, Expr, Binary, Grouping, Literal, Unary } from "../expressions/exp";

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