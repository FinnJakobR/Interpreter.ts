import { runtimeError } from "../errors/error";
import { Token } from "../lexer/token";


export default class Enviroment {
    private value : Map<string, Object | null>;

    constructor(){
        this.value = new Map();
    }

    public define(name: string, value: Object | null){
        this.value.set(name, value);
    }

    public get(name: Token): Object | null {
        if(this.value.has(name.lexeme)) return this.value.get(name.lexeme)!;

        throw runtimeError(name, "Undefined variable '" + name.lexeme + "'.");
    }
}