//Seite 113 weiterprogrammieren 



import Flox from "./flox";
import { Binary, Expr, Unary, Grouping, Literal } from "./util/expressions/exp";
import { Token, TokenType } from "./util/lexer/token";

/*
var expr = new Binary(
    new Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Literal(123)),
    new Token(TokenType.STAR, "*", null, 1),
    new Grouping(
        new Literal(45.67)));

console.log(new AstPrinter().print(expr));
*/

var f = new Flox();

