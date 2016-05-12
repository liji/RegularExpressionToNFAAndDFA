/// <reference path="Parser.ts" />
/// <reference path="Compiler.ts" />


class Converter {
    convertToNFA(regx:string): Compiling.NFA {
        let parser = new Parsing.Parser();
        let ast = parser.parse(regx);
        let compiler = new Compiling.Compiler();
        return compiler.complieNFA(ast);
    }

    convertToDFA(regx: string): Compiling.DFA {
        let parser = new Parsing.Parser();
        let ast = parser.parse(regx);
        let compiler = new Compiling.Compiler();
        return compiler.compileDFA(compiler.complieNFA(ast));
    }
} 
