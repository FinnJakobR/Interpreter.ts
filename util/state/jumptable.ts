import { Expr, Stmt } from "../expressions/exp";


export default class JumpTable extends Map<Expr,Stmt[]> {
    constructor(){
        super();
    }
}