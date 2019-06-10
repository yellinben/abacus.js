import Processor from '../processor';
import Unit from '../unit';

export default class UnitSuffixProcessor extends Processor {
  constructor() {
    super({
        match: /(\b-?[0-9.]+)(\s*(?<unit>[a-z]+)|(?<symbol>[^-~+!#&*,./:;=?|@<>\[\](){}\d\s]))/gi,
        priority: 4
      }, ({matches, input}) => {
        let tokens = input.split(' ');
        let units = [];

        for (let match of matches) {
          let val = parseFloat(match);
          const suffix = match.replace(val, '').trim();
          units.push(Unit.withSuffix(suffix));

          if (suffix === '%')
            val = `(${val}/100)`;
          
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
