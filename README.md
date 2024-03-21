# Flox
# A dynamic Typed Language 


# Syntax 
``èbnf
program        → declaration* EOF ;

declaration    → varDecl
               | funcDecl
               | statement 
               | switchStmt ;
               

statement      → exprStmt
               | forStmt ;
               | printStmt ;
               | whileStmt ;
               | block ;

switchStmt →  "switch" expression :" caseStmt* 


funcDecl → "func" function ;

function → IDENTIFIER "("parameters ?")" block ;

parameters → IDENTIFIER ( "," IDENTIFIER )* ; 

caseStmt       → "case" expression ":" declaration ;
 
breakStmt       → "break" ";";
continueStmt    → "continue" ";";

whileStmt      → "while" "(" expression ")" statement ;
forStmt        → "for" "(" ( varDecl | exprStmt | ";" )
                 expression? ";"
                 expression? ")" statement ;
block          → "{" declaration | breakStmt | continueStmt* "}" ;
exprStmt       → expression ";" ;
printStmt      → "print" expression ";" 
varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;

lambda         → "func" lambda function 
lambdaFunction → IDENTIFIER "("parameters ?")" block

expression     → assignment ;
assignment     → IDENTIFIER "=" assignment
               | logic_or ;
logic_or       → logic_and ( "or" logic_and )* ;
logic_and      → equality ( "and" equality )* ; 
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary | call ;
call           → primary ("(" arguments? ")")* ;
arguments      → (expression | lambda) ( "," (expression | lambda) )* ;
primary        → NUMBER | STRING | "true" | "false" | "nil" | Template
Template       → "`" (IDENTIFIER | ("$" "{" expression "}"))* " "`""
               | "(" expression ")" ;
```