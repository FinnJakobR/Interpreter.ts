import { Expr } from "../expressions/exp";


export default class FloxArrayTable extends Map<number, (object | null)> {
    
    public mutable: boolean;
    constructor(mutable: boolean){
        super();
        this.mutable = mutable;
    }

    push(element: Expr) {
        var length: number = this.size;

        this.set(length, element);

        return;
    }

    unshift(element: Expr) {
        for (let i = this.size; i > 0; i--) {
            // Verschiebe jedes Element um eine Position nach oben
            if (this.has(i - 1)) {
                this.set(i, this.get(i - 1)!);
            }
        }
        this.set(0, element); // Füge das neue Element am Anfang hinzu
    }

    concat(otherTable: FloxArrayTable) {
        const offset = this.size;
        otherTable.forEach((value, key) => {
            this.set(key + offset, value); // Füge jedes Element von otherTable mit angepasstem Schlüssel hinzu
        });
    }

    removeFromStart(n: number){
        // Bestimme die neue Größe nach dem Entfernen der Elemente
        const newSize = Math.max(this.size - n, 0);
    
    // Temporäre Map zum Speichern der verschobenen Elemente
    let tempMap = new Map<number, (object | null)>();

    // Fülle die temporäre Map mit den neu indizierten Elementen
    Array.from(this.entries()).forEach(([key, value], index) => {
        if (index >= n) {
            tempMap.set(key - n, value);
        }
    });

    // Lösche alle Elemente aus der ursprünglichen Map
    this.clear();

    // Füge die Elemente aus der temporären Map zur ursprünglichen Map hinzu
    tempMap.forEach((value, key) => {
        this.set(key, value);
    }); 
        }

    removeFromEnd(n: number) {
            // Ermittle die Schlüssel, die entfernt werden sollen
            const keysToRemove = Array.from(this.keys()).slice(-n);
        
            // Entferne die ausgewählten Schlüssel
            keysToRemove.forEach(key => {
                this.delete(key);
            });
        }
}