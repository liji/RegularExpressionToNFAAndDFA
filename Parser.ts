module Parsing {
    export class Parser {
        public parse(regx: string): Expression {
            let exp = this.preprocess(regx);
            let operatorStack: string[] = [];
            let operandsStack: Expression[] = [];
            for (let i = 0; i < exp.length; i++) {
                let char = exp.charAt(i);
                if (char == '(') {
                    operatorStack.push(char);
                }
                else if (char == ')') {
                    let operator = operatorStack.pop();
                    while (operator != '(' && operatorStack.length > 0) {
                        operandsStack.push(makeExpression(operator));
                        operator = operatorStack.pop();
                    }
                }
                else if (this.isOperator(char)) {
                    while (operatorStack.length > 0) {
                        let operator = operatorStack.pop();
                        if (operator != '(' && Operator.precedence(char) <= Operator.precedence(operator)) {
                            operandsStack.push(makeExpression(operator));
                        }
                        else {
                            operatorStack.push(operator);
                            break;
                        }
                    }
                    operatorStack.push(char);
                }
                else {
                    if (char == '\\' && exp.charAt(i + 1) == 'e') {
                        operandsStack.push(new CharExpression(''));
                        i++;
                    }
                    else {
                        operandsStack.push(new CharExpression(char));
                    }
                }
            }

            while (operatorStack.length > 0) {
                let operator = operatorStack.pop();
                operandsStack.push(makeExpression(operator));
            }

            return operandsStack.pop();

            function makeExpression(operator: string): Expression {
                if (operator == '|') {
                    let exp = new AlternationExpression();
                    exp.right = operandsStack.pop();
                    exp.left = operandsStack.pop();
                    return exp;
                }
                else if (operator == '.') {
                    let exp = new ConcatenationExpression();
                    exp.right = operandsStack.pop();
                    exp.left = operandsStack.pop();
                    return exp;
                }
                else if (operator == '*') {
                    let exp = new ClosureExpression();
                    exp.exp = operandsStack.pop();
                    return exp;
                }
                return null;
            }
        }

        private preprocess(regx: string): string {
            let concatedExp = '';
            for (let i = 0; i < regx.length - 1; i++) {
                let currentChar = regx.charAt(i);
                let nextChar = regx.charAt(i + 1);
                if (currentChar == '\\' && nextChar == 'e') {
                    i++;
                    concatedExp += (currentChar + nextChar);
                    continue;
                }
                if ((currentChar == ')' || currentChar == '*' || (!this.isOperator(currentChar) && currentChar != '('))
                    && (nextChar == '(' || (!this.isOperator(nextChar) && nextChar != ')'))) {
                    concatedExp += currentChar + '.';
                }
                else {
                    concatedExp += currentChar;
                }
            }
            return concatedExp + regx.charAt(regx.length - 1);
        }

        private isOperator(char: string): boolean {
            return Operator.literals.indexOf(char) >= 0;
        }
    }

    class Operator {
        static literals: string[] = ['*', '.', '|'];
        static precedence(literal: string): number {
            switch (literal) {
                case '*':
                    return 3;
                case '.':
                    return 2;
                case '|':
                    return 1;
            }
        }
    }

    export abstract class Expression {
    }

    export class CharExpression extends Expression {
        value: string;
        constructor(char: string) {
            super();
            this.value = char;
        }
    }

    export class ConcatenationExpression extends Expression {
        left: Expression;
        right: Expression;
    }

    export class AlternationExpression extends Expression {
        left: Expression;
        right: Expression;
    }

    export class ClosureExpression extends Expression {
        exp: Expression;
    }
}
