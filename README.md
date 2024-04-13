# A dynamic Typed Language written in TypeScript

## Variables 

```
const x = 10; // not mutable
var x = 10; // mutable
```

## functions 

```
fun x () {
    return 10; // Return a Number
}

fun y () {
    var x = 100;
    const y = 10;

    return x, y; // Return Tuple
}
```

## Tuple and Array 
```
var tuple = (10,11,12); // not mutable
var array = [1,2,3,4,5]; // mutable 

var x = [1,2,3,4,5] + 1 // [1,2,3,4,5,1]
var y = 1 + [1,2,3,4,5] // [1,1,2,3,4,5]
var z = 1 - [1,2,3,4,5] // [2,3,4,5] -> how many indzies should be Deleted
var a = [1,2,3,4,5] - 2 // [1,2,3] 
var b = [1,2] * [3,4] // [(1,3), (1,4), (2,3), (3,4)] 
```

# Others

```
switch (expr) {
    case epxr : {
        // BODY
    }
}

if (expr) {
// BODY
}


while(expr) {
    //BODY
}

x+=1;
y-=1;
z*=1;
y/=1;
```

## Logical Expression 
```
- and 
- or 
- true 
- false 
- maybe -> random 50% true or false 
```

# String interpolation 

```
var x = 10;

var y = ` x is : ${x} `;

```


# Syntax 
```ebnf
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