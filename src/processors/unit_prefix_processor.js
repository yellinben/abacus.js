import Processor from '../processor';
import Unit from '../unit';

export default class UnitPrefixProcessor extends Processor {
  constructor() {
    super({
        match: /[^0-9\s*/%&()<>.+-][0-9.]+/gi,
        priority: 4
      }, ({matches, input}) => {
        let tokens = input.split(' ');
        let units = [];

        for (let match of matches) {
          const val = match.match(/[0-9.]+/)[0];
          const suffix = match.replace(val, '').trim();
          units.push(Unit.withPrefix(suffix));
          
          tokens = tokens.map(token => (
            (token === match) ? val : token
          ));
        }

        return {
          units, output: tokens.filter(Boolean).join(' ')
        };
      },
    );
  }
}
