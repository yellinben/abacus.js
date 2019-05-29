import Processor from '../processor';
import Unit from '../unit';

const percentageUnit = Unit.withSuffix('%', {name: 'percentage'});

export default class UnitSuffixProcessor extends Processor {
  constructor() {
    super({
        match: /(\b-?[0-9.]+)(\s*(?<unit>[a-z]+)|(?<symbol>[^\d\s().]))/gi,
        priority: 4
      }, ({matches, input}) => {
        let tokens = input.split(' ');
        let units = [];

        for (let match of matches) {
          const val = parseFloat(match);
          const suffix = match.replace(val, '').trim();
          units.push(Unit.withSuffix(suffix));

          let token = val;
          if (suffix === '%')
            token = `(${val}/100)`;
          
          tokens = tokens.map(t => (
            (t === match) ? token : t
          ));
        }

        return {
          units, output: tokens.filter(Boolean).join(' ')
        };
      },
    );
  }
}
