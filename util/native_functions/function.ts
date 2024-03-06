import Interpreter from "../interpreter/interpreter";
import FloxCallable from "../state/callable";


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