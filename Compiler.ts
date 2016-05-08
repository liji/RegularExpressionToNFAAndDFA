/// <reference path="Parser.ts" />

module Compiling {
    export class Compiler {
        constructor() {
            State.serial = 0;
        }
        complie(exp: Parsing.Expression): NFA {
            if (exp instanceof Parsing.AlternationExpression) {
                return this.compileAlternation(exp);
            }
            else if (exp instanceof Parsing.ConcatenationExpression) {
                return this.compileConcatenation(exp);
            }
            else if (exp instanceof Parsing.ClosureExpression) {
                return this.compileClosure(exp);
            }
            else {
                return this.complieChar(exp as Parsing.CharExpression);
            }
        }
        private complieChar(exp: Parsing.CharExpression): NFA {
            let nfa = new NFA(new State(), new State());
            nfa.start.transit(exp.value, nfa.end);
            return nfa;
        }
        private compileConcatenation(exp: Parsing.ConcatenationExpression): NFA {
            let left = this.complie(exp.left);
            let right = this.complie(exp.right);
            let nfa = new NFA(left.start, right.end);
            left.end.transit('', right.start);
            return nfa;
        }
        private compileClosure(exp: Parsing.ClosureExpression): NFA {
            let left = this.complie(exp.exp);
            let nfa = new NFA(new State(), new State());
            nfa.start.transit('', left.start);
            nfa.start.transit('', nfa.end);
            left.end.transit('', left.start);
            left.end.transit('', nfa.end);
            return nfa;
        }
        private compileAlternation(exp: Parsing.AlternationExpression): NFA {
            let left = this.complie(exp.left);
            let right = this.complie(exp.right);
            let nfa = new NFA(new State(), new State());
            nfa.start.transit('', left.start);
            left.end.transit('', nfa.end);
            nfa.start.transit('', right.start);
            right.end.transit('', nfa.end);
            return nfa;
        }
    }


    export class NFA {
        start: State;
        end: State;
        constructor(start: State, end: State) {
            this.start = start;
            this.end = end;
        }
    }

    class State {
        static serial: number = 0;
        id: number;
        transitions: Transition[] = [];
        transit(char: string, state: State): void {
            this.transitions.push(new Transition(char, state));
        }
        constructor() {
            this.id = ++State.serial;
        }
    }

    class Transition {
        char: string;
        state: State;
        constructor(char: string, state: State) {
            this.char = char;
            this.state = state;
        }
    }
} 