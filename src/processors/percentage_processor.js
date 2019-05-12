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
        const expr = `(${matches[3]})`;
        
        let output = `${expr} * ${percentage/100}`;
        
        switch (operator) {
          case 'off':
            output = `${expr} - (${output})`;
            break;
          case 'on':
            output = `${expr} + (${output})`;
            break;
          default:
            break;
        }

        return output;
      },
    );
  }
}
