import fs from "fs";

class GenerateAst {
    private outputdir: string;
    private source: string;
    private types: string[];
    constructor(outputdir: string){
        this.outputdir = outputdir;
        this.source = `import { Token } from "../lexer/token";\n\nimport JumpTable from "../state/jumptable";\n\n`;
        this.types = [];
    }

    defineAst(baseName: string, source: string){
        this.types = source.split("\n");
        this.source+= `export abstract class ${baseName} {\n`;
        this.source+= "  abstract accept<R>(visitor: Visitor<R>): R;\n"
        this.source += "}\n\n\n"

        this.defineVisitor(baseName, this.types);

        for(var type of this.types){
            var className: string = type.split(":")[0].trim();
            var fields: string = type.split(":")[1].trim();
            this.defineType(baseName, className, fields);
            
            this.source+="}\n\n\n";

        }

        fs.writeFileSync(this.outputdir, this.source, {encoding: "utf-8"});
    }

    defineType(baseName: string, className: string, fields: string){
        
        this.source += `export class ${className} extends ${baseName}{\n`;

        var fieldList = fields.split(",");
        for(var field of fieldList){ 
            var type = field.split(" ")[0];
            var name = field.split(" ")[1];
            this.source += `    public ${name} : ${type};\n`;
            
        }

        //constructor 

        this.source+= "    constructor (";


        for(var field of fieldList){ 
            var type = field.split(" ")[0];
            var name = field.split(" ")[1];
            this.source += ` ${name} : ${type},`;
            
        }

        this.source+= "){\n";

        this.source += "        super()\n"

        for(var field of fieldList){ 
            var name = field.split(" ")[1];
            this.source += `        this.${name} = ${name};\n`;
        }

        this.source+="  }\n";

        this.source+=` accept<R>(visitor: Visitor<R>): R {
            return visitor.visit${className}${baseName}(this);
        }`

        }

    defineVisitor(baseName:string, fields: string[] ){
            this.source += ` export interface Visitor <R> {\n`;

            for(var field of fields){

                var typeName = field.split(":")[0].trim();
                this.source += `visit${typeName}${baseName}( ${baseName.toLowerCase()}: ${typeName}) : R;\n`;


    
            }

            this.source+="}\n"
        }
    }


function main(){
    const args: string[] = process.argv.slice(2);

    var outputdir = args[0]+="exp.ts";

    var infoExpr = "./ast.exp";
    var infoStmt = "./ast.stmt";

    var c = new GenerateAst(outputdir);

    c.defineAst("Expr",fs.readFileSync(infoExpr, {encoding: "utf-8"}));

    c.defineAst("Stmt", fs.readFileSync(infoStmt, {encoding: "utf-8"}))
    return;
}

main();