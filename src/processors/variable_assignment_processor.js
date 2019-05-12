import Processor from '../processor';

export default class VariableAssignmentProcessor extends Processor {
  constructor() {
    super('variable_assignment', {
        match: /(?<var>[\w]+) = (?<expr>.*)/,
        reserved: ['='],
        priority: 0,
      },
      (matches) => {
        const vars = {[matches[1]]: matches.line};
        return {output: matches[2], vars};
      },
    );
  }
}
