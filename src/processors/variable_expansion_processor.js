import Processor from '../processor';
import TokenReplacer from '../token_replacer';

export default class VariableExpansionProcessor extends Processor {
  constructor() {
    super({
      priority: 5
    }, ({input}, context) => {
      const replacer = new TokenReplacer(context.variableResults());
      return {output: replacer.run(input)};
    });
  }
}
