import { exit } from "process";
import promptSync from 'prompt-sync'
import fs from 'fs' 
import Scanner from "./util/lexer/lexer";
import Parser from "./util/parser/parser";
import { Expr, Stmt } from "./util/expressions/exp";
import AstPrinter from "./util/debug/astprinter";
import Interpreter from "./util/interpreter/interpreter";

export default class Flox {
    private hasError: boolean;
    constructor(){
        
        const args: string[] = process.argv.slice(2);
        this.hasError = false;

        if(args.length > 1){
            console.log("Usage: flox [script]");
            exit(64);
        }else if (args.length == 1) {
            this.runFile(args[0]);
        }else{
            this.runPrompt();
        }
    }

    runPrompt(): void {
        
        while(true){
            const prompt = promptSync();
            
            const line = prompt("> ");
            
            if(!line || line === "exit" ) return;

            this.run(line);

            this.hasError = false;
        }
    }

    runFile(path: string): void {    
        
        //TODO add a fileExtension check

        try {
            var source: string = fs.readFileSync(path, {encoding: "utf-8"});
            this.run(source);
        } catch (error) {
            console.log("File not Found!");

            if(this.hasError) exit(65);
        }

        return;

    }

    run(data: string){
        var s = new Scanner(data);
        var tokens = s.scanTokens();

        var parser: Parser = new Parser(tokens);

        var expression: Stmt[] = parser.parse();

        if(expression == null) return;

        //console.log(new AstPrinter().print(expression));

        var interpreter: Interpreter = new Interpreter();

        interpreter.interpret(expression);

    };
}