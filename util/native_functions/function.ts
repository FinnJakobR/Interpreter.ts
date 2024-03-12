import { Function } from "../expressions/exp";
import Interpreter from "../interpreter/interpreter";
import { ReturnError } from "../parser/parser";
import FloxCallable from "../state/callable";
import Enviroment from "../state/environment";


export default class ClockFunction implements FloxCallable {
    
    public arity(): number {
        return 0;
    }

    public call(interpreter: Interpreter, args: (Object | null)[]): Object | null {
        // Hier verwenden wir Date.now() statt new Date().now(), da Date.now() die korrekte Methode ist
        return Date.now();
    }

    public toString(): string {
        return `<native fn>`;
    }
}

export class FloxFunction implements FloxCallable {
    private declaration: Function;
    private closure: Enviroment;

    constructor(declaration: Function, closure: Enviroment){
        this.declaration = declaration;
        this.closure = closure;
    }

    public arity(): number {
        return this.declaration.params.length;
    }

    public call(interpreter: Interpreter, args: (Object | null)[]): Object | null {
        var enviroment : Enviroment = new Enviroment(this.closure)

        for (var i = 0; i < this.declaration.params.length; i++) {
            enviroment.define(this.declaration.params[i].lexeme,
                args[i]);
          }

          try {
            interpreter.executeBlocks(this.declaration.body, enviroment);

          } catch(error){
            if(error instanceof ReturnError){
                return error.value;
            }
          }



          return null;
    }
}