import Processor from '../processor';

export default class VariableAssignmentProcessor extends Processor {
  constructor() {
    super(
      'variable_assignment',
      {
        match: /(?<var>[\w]+) = (?<expr>.*)/,
        reserved: ['='],
        priority: 0,
      },
      (matches) => {
        // console.log('matches', matches);
        // const output = match.groups.expr;
        // const vars = {[match.groups.var]: line};

        const output = matches[2];
        const vars = {[matches[1]]: matches.line};

        return {output, vars};
      },
    );
  }
}
