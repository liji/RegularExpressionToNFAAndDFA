/// <reference path="Parser.ts" />
/// <reference path="Compiler.ts" />


class Converter {
    convert(regx:string): Compiling.NFA {
        let parser = new Parsing.Parser();
        let ast = parser.parse(regx);
        let compiler = new Compiling.Compiler();
        return compiler.complie(ast);
    }
} 