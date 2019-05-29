import convert from 'convert-units';

import { 
  isMathematicalSuffix,
  isMeasurementTerm
} from './utils';

export default class Unit {
  static registry = {};
  static convert = convert;

  static registerAbbreviation(abbr, unit) {
    Unit.registry[abbr] = unit;
  }

  static register(unit) {
    if (!unit.abbreviations().length) return
    unit.abbreviations().forEach(abbr => {
      Unit.registerAbbreviation(abbr, unit);
    });
  }

  static find(abbreviation) {
    return Unit.registry[abbreviation];
  }

  static get(unit) {
    if (Unit.isUnit(unit)) return unit;
    return Unit.find(unit) || Unit.withSuffix(unit);
  }

  static withPrefix(prefix, opts = {}) {
    return (
       Unit.registry[prefix] || 
       new Unit({prefix, ...opts})
    );
  }

  static withSuffix(suffix, opts = {}) {
    return (
       Unit.registry[suffix] || 
       new Unit({suffix, ...opts})
    );
  }

  static blank() {
    return (
      Unit.registry['blank'] ||
      new Unit({name: 'blank'})
    );
  }

  static abbreviation(unit) {
    if ('abbreviation' in unit)
      return unit.abbreviation();
    else
      return unit;
  }

  static isUnit(unit) {
    return unit && unit.constructor.name === 'Unit';
  }

  constructor(opts) {
    Object.assign(this, {
      name: undefined,
      category: undefined,
      prefix: undefined,
      suffix: undefined
    }, opts);

    if (!this.name)
      this.name = this.abbreviations()[0];
    
    Unit.register(this);
  }

  abbreviations() {
    return [this.prefix, this.suffix]
      .filter(Boolean);
  }

  abbreviation() {
    return this.abbreviations()[0];
  }

  isMeasurement() {
    return isMeasurementTerm(this.abbreviation());
  }

  isMathematical() {
    return isMathematicalSuffix(this.abbreviation());
  }

  type() {
    if (this.isMathematical())
      return 'math';
    else if (this.isMeasurement())
      return 'measurement';
    else
      return false;
  }

  format(value) {
    return [
      this.prefixFormatted(), 
      value.toString(),
      this.suffixFormatted()
    ].join('');
  }

  prefixFormatted() {
    return `${this.prefix || ''}`;
  }

  suffixFormatted() {
    if (!this.suffix) return '';
    const padding = this.isMathematical() ? '' : ' ';
    return `${padding}${this.suffix || ''}`;
  }

  convert(value, destUnit) {
    if (this.isMathematical()) {
      const destMathUnit = Unit.withSuffix(destUnit);
      return destMathUnit.format(value);
    }

    try {
      return convert(value)
        .from(this.abbreviation())
        .to(Unit.abbreviation(destUnit))
    } catch (error) {
      console.error(error);
    }
  }
}
