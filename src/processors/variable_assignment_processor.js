import Processor from '../processor';

export default class VariableAssignmentProcessor extends Processor {
  constructor() {
    super({
        match: /(?<var>[\w]+) = (?<expr>.*)/,
        reserved: ['='],
        priority: 0,
      },
      (matches) => ({
        output: matches[2], 
        variable: matches[1]
      }),
    );
  }
}
