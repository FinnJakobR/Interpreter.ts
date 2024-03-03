import { runtimeError } from "../errors/error";
import { Token } from "../lexer/token";


export default class Enviroment {
    private enclosing : Enviroment | null;
    private value : Map<string, Object | null>;

    constructor(enclosing?: Enviroment){
        this.value = new Map();
        this.enclosing = enclosing ?? null;
    }

    public define(name: string, value: Object | null){
        this.value.set(name, value);
    }

    public get(name: Token): Object | null {
        if(this.value.has(name.lexeme)) {

            if(this.value.get(name.lexeme) === null){
                throw runtimeError(name, "variable not assigned!");
            }

            return this.value.get(name.lexeme)!;
        };

        if(this.enclosing) return this.enclosing.get(name);

        throw runtimeError(name, "Undefined variable '" + name.lexeme + "'.");
    }

    public assign(name: Token, value: Object | null): void {
        if(this.value.has(name.lexeme)){
            this.value.set(name.lexeme, value);
            return;
        };

        if(this.enclosing) {
            this.enclosing.assign(name, value);
            return
        };

        runtimeError(name, "unknown variable!");
    }
}