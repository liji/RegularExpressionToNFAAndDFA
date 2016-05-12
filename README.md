# Regular Expression To NFA and DFA
Convert Regular Expression to NFA and DFA

##There are 3 modules,

###Parser.ts - convert regular expression string to an AST (an AST is useful if we need support more features.);
###Compiler.ts - convert the AST to NFA or DFA data structure;
###Convert.ts - a wrapper on parser and complier, provides API for converting regular expression.
