import Interpreter from "../interpreter/interpreter";


export default interface FloxCallable {
    arity(): number,
    call(interpreter : Interpreter, args: (Object | null)): Object | null;
}