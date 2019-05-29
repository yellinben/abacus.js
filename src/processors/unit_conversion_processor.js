import Processor from '../processor';
import Unit from '../unit';

export default class UnitConversionProcessor extends Processor {
  constructor() {
    super({
        match: /^\s*(?<value>-?[0-9.]+)\s*(?<unit1>[a-zA-Z]+)\s*(?<operator>to|as|in|->)\s*(?<unit2>[a-zA-Z]+)\s*$/,
        priority: 3
      }, ({matches}) => {
        const value = matches[1];

        const unit1 = Unit.withSuffix(matches[2]);
        const unit2 = Unit.withSuffix(matches[4]);

        const result = unit1.convert(value, unit2);
        const units = [unit1, unit2];
        
        // output is blank to prevent any further processing
        // since result evaluation is already handled
        // by unit conversion

        return {
          output: '',
          result, units
        };
      },
    );
  }
}
