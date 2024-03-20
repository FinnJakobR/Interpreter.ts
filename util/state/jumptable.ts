import { Expr, Literal, Stmt } from "../expressions/exp";


export default class JumpTable extends Map<Expr,Stmt[]> {
    constructor(){
        super();
    }

    hasDefault (): boolean {
        var has: boolean = false;
        this.forEach((a,b)=>{
            if(b instanceof Literal && b.value === "default") {
                has = true;
                return;
            };
        });

        return has;
    }

    getDefault(): Stmt[]{
        if(!this.hasDefault()) return [];

        var stmt: Stmt[] = [];
        this.forEach((a,b)=>{
            if(b instanceof Literal && b.value === "default") {
                stmt = a;
                return;
            };
        });

        return stmt;
    }
}