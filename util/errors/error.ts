import { Token, TokenType } from "../lexer/token";

export function staticError(line: number, message: string){
    report(line, "", message);
}

export function runtimeError(token: Token, message: string){
    if(token.type == TokenType.EOF){
        report(token.line, " at end", message);
    } else {
      report(token.line, " at '" + token.lexeme + "'", message);
    }
}

function report(line: number, where: string, message: string): void{
    console.log("[line " + line + "] Error" + where + ": " + message);
    return;
}