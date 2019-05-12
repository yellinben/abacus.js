import Processor from '../processor';

export default class PercentageProcessor extends Processor {
  constructor() {
    super('percentage', {
        match: /(?<percentage>-?[\d.]+)% (?<operator>off?|on) (?<expr>.*$)/,
        reserved: ['of', 'off', 'on'],
        priority: 2
      },
      (matches) => {
        const percentage = parseFloat(matches[1]);
        const operator = matches[2];
        const line_expr = matches[3];
        const expr = `${line_expr} * ${percentage/100}`;
  
        let output;
        switch (operator) {
          case 'of':
            output = expr;
            break;
          case 'off':
            output = `${expr} - (${expr})`;
            break;
          case 'on':
            output = `${expr} + (${expr})`;
            break;
          default:
            break;
        }

        return output;
      },
    );
  }
}
