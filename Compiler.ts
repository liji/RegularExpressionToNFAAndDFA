/// <reference path="Parser.ts" />

module Compiling {
    export class Compiler {
        inputChar: string = '';

        constructor() {
            NFAState.serial = 0;
            DFAState.serial = 0;
        }

        compileDFA(nfa: NFA): DFA {
            let dfa: DFA = new DFA();
            dfa.states.push(new DFAState(this.epsilonClosure([nfa.start])));
            for (let i = 0; i < dfa.states.length; i++) {
                let fromState = dfa.states[i];
                for (let j = 0; j < this.inputChar.length; j++) {
                    let char = this.inputChar[j];
                    var closureStates = this.move(fromState.nfaStates, char);
                    if (closureStates.length > 0) {
                        var toState = this.containsDFAStates(dfa.states, closureStates)
                        if (!toState) {
                            toState = new DFAState(closureStates);
                            dfa.states.push(toState);
                        }
                        fromState.transit(char, toState);
                    }
                }
            }
            return dfa;
        }

        complieNFA(exp: Parsing.Expression): NFA {
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
            let nfa = new NFA(new NFAState(), new NFAState());
            nfa.start.transit(exp.value, nfa.end);
            if (exp.value != '') {
                this.inputChar += exp.value;
            }
            return nfa;
        }

        private compileConcatenation(exp: Parsing.ConcatenationExpression): NFA {
            let left = this.complieNFA(exp.left);
            let right = this.complieNFA(exp.right);
            let nfa = new NFA(left.start, right.end);
            left.end.transit('', right.start);
            return nfa;
        }

        private compileClosure(exp: Parsing.ClosureExpression): NFA {
            let left = this.complieNFA(exp.exp);
            let nfa = new NFA(new NFAState(), new NFAState());
            nfa.start.transit('', left.start);
            nfa.start.transit('', nfa.end);
            left.end.transit('', left.start);
            left.end.transit('', nfa.end);
            return nfa;
        }

        private compileAlternation(exp: Parsing.AlternationExpression): NFA {
            let left = this.complieNFA(exp.left);
            let right = this.complieNFA(exp.right);
            let nfa = new NFA(new NFAState(), new NFAState());
            nfa.start.transit('', left.start);
            left.end.transit('', nfa.end);
            nfa.start.transit('', right.start);
            right.end.transit('', nfa.end);
            return nfa;
        }

        private epsilonClosure(states: NFAState[]): NFAState[] {
            let closureSet: State[] = [];
            closureSet = closureSet.concat(states);
            let stateStack: State[] = [];
            stateStack = stateStack.concat(states);
            while (stateStack.length > 0) {
                var state = stateStack.pop();
                for (let i = 0; i < state.transitions.length; i++) {
                    let transition = state.transitions[i];
                    if (transition.char == '') {
                        if (!this.containsNFAState(closureSet, transition.state)) {
                            closureSet.push(transition.state);
                            stateStack.push(transition.state);
                        }
                    }
                }
            }
            return closureSet;
        }

        private move(states: NFAState[], char: string): NFAState[] {
            let reachableStates: NFAState[] = [];
            for (let i = 0; i < states.length; i++) {
                for (let j = 0; j < states[i].transitions.length; j++) {
                    if (states[i].transitions[j].char == char) {
                        reachableStates.push(states[i].transitions[j].state);
                    }
                }
            }
            return this.epsilonClosure(reachableStates);
        }

        private containsNFAState(states: NFAState[], state: NFAState):boolean {
            for (let i = 0; i < states.length; i++) {
                if (states[i].id == state.id) {
                    return true;
                }
            }
            return false;
        }

        private containsDFAStates(states: DFAState[], nfaStates: NFAState[]):DFAState {
            var found;
            for (let i = 0; i < states.length; i++) {
                for (let j = 0; j < states[i].nfaStates.length; j++) {
                    found = false;
                    for (let k = 0; k < nfaStates.length; k++) {
                        if (states[i].nfaStates[j].id == nfaStates[k].id) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        break;
                    }
                }
                if (found) {
                    return states[i];
                }
            }
            return null;
        }
    }

    export class DFA {
        states: DFAState[] = [];
    }

    export class NFA {
        start: NFAState;
        end: NFAState;
        constructor(start: NFAState, end: NFAState) {
            this.start = start;
            this.end = end;
        }
    }


    export abstract class State {
        id: number;
        transitions: Transition[] = [];
        transit(char: string, state: State): void {
            this.transitions.push(new Transition(char, state));
        }
    }

    export class DFAState extends State {
        static serial: number = 0;
        nfaStates: NFAState[];
        constructor(states: NFAState[]) {
            super();
            this.id = ++DFAState.serial;
            this.nfaStates = states;
        }
    }

    class NFAState extends State {
        static serial: number = 0;
        constructor() {
            super();
            this.id = ++NFAState.serial;
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
