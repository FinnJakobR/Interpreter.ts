import { staticError } from "../errors/error";
import { keywords } from "./keywords";
import { Token, TokenType } from "./token";

export default class Scanner {
    private source: string; 
    private tokens: Token[]; 
    private start: number;
    private current: number;
    private line: number;

    constructor(source: string){
        this.source = source;
        this.tokens = [];
        this.start = 0; //erste Char des Lexemes
        this.current = 0 // current Char das Lexemes
        this.line = 1;
    }

    scanTokens(): Token[]{
        
        while(!this.isAtEnd()){
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, " ", null, this.line))

        return this.tokens;
    }

    private isAtEnd(){
        return this.current >= this.source.length;
    }

    private scanToken(){
       var c = this.advance();

       switch (c) {
            case "(": this.addToken(TokenType.LEFT_PAREN, null); break;
            case ")": this.addToken(TokenType.RIGHT_PAREN, null); break;
            case "{": this.addToken(TokenType.LEFT_BRACE, null); break;
            case "}": this.addToken(TokenType.RIGHT_BRACE, null); break;
            case ",": this.addToken(TokenType.COMMA, null); break;
            case ".": this.addToken(TokenType.DOT, null); break;
            case "-": this.addToken(TokenType.MINUS, null); break;
            case ";": this.addToken(TokenType.SEMICOLON, null); break;
            case "*": this.addToken(TokenType.STAR, null); break;
            case "+": this.addToken(TokenType.PLUS, null); break;

            case "!": 
                this.addToken(this.check("=") ? TokenType.BANG_EQUAL : TokenType.BANG, null);
                break;
            case "=": 
                this.addToken(this.check("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL, null);
                break;
            case "<": 
                this.addToken(this.check("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER, null);
                break;
            
            case ">": 
                this.addToken(this.check("=") ? TokenType.LESS_EQUAL : TokenType.LESS, null);
                break;
            
            case "/": 
                
                if(this.check("/")){
                    while(this.peek() != "\n" && !this.isAtEnd()) this.advance();
                }else{
                    this.addToken(TokenType.SLASH, null);
                }
                
                break;

            case " ": 
            case "\r": 
            case "\t": 
                break;

            case "\n": 
                this.line ++;
                break;

            case '"': 
                this.lex_string();
                break;

            


            default: 
                if(this.isDigit(c)){
                    this.lex_number();
                } else if(this.isAlpha(c)){
                    this.lex_identifier();
                }
                
                
                else{
                    staticError(this.line, "unexpected Token!"); break;
                }
       }
    }

    private advance(){
        return this.source[this.current++];  
    }

    private addToken(type: TokenType, literal: any){
        var text: string = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    private check(lexeme: string){
        
        if(this.isAtEnd()) return false;

       if(this.source[this.current] != lexeme) return false;
       
       this.current ++;

       return true;

    }

    private peek(){
        if(this.isAtEnd()) return "\0";
        return this.source[this.current];
    }

    private lex_string(){
        while(this.peek() != '"' && !this.isAtEnd()){
            if(this.peek() == "\n") this.line ++;
            this.advance();
        }

        if(this.isAtEnd()){
            staticError(this.line, "unterminated string!");
            return;
        }

        this.advance(); // for closing '"'

        var value: string = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);

    }

    isDigit(c: string){
        return c >= '0' && c <= '9';
    }

    lex_number(){
        
        while(this.isDigit(this.peek())) this.advance();

        if(this.peek() == '.' && this.isDigit(this.peekNext())){
           this.advance();

           while(this.isDigit(this.peek())) this.advance();
        
        }

        this.addToken(TokenType.NUMBER, parseFloat(this.source.substring(this.start, this.current)));

    }

    peekNext(){
        
        if(this.current + 1 >= this.source.length) return '\0';

        return this.source[this.current + 1];
    }

    isAlpha(c: string){
        return (c >= "a" &&  c <= "z") ||
               (c >= "A" &&  c <= "Z") ||
               c == "_";
    }

    isAlphaNum(c: string){
        return this.isAlpha(c) || this.isDigit(c);
    } 


    lex_identifier(){
        
        while(this.isAlphaNum(this.peek())) this.advance();

        var text = this.source.substring(this.start, this.current);
        var type: TokenType = keywords[text];

        if(!type) type = TokenType.IDENTIFIER;

        this.addToken(type, text);

    }
};