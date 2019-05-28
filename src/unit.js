import convert from 'convert-units';

export default class Unit {
  static registry = {};

  static registerAbbreviation(abbr, unit) {
    Unit.registry[abbr] = unit;
  }

  static register(unit) {
    if (!unit.abbreviations().length) return
    unit.abbreviations().forEach(abbr => {
      Unit.registerAbbreviation(abbr, unit);
    });
  }

  static get(abbreviation) {
    return Unit.registry[abbreviation];
  }

  static abbreviation(unit) {
    if ('abbreviation' in unit)
      return unit.abbreviation();
    else
      return unit;
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

  static withPrefix(prefix) {
    return (
       Unit.registry[prefix] || 
       new Unit({prefix})
    );
  }

  static withSuffix(suffix) {
    return (
       Unit.registry[suffix] || 
       new Unit({suffix})
    );
  }

  static blank() {
    return (
      Unit.registry['blank'] ||
      new Unit({name: 'blank'})
    );
  }

  abbreviations() {
    return [this.prefix, this.suffix]
      .filter(Boolean);
  }

  abbreviation() {
    return this.abbreviations()[0];
  }

  format(value) {
    if (!value !== 0 && !value)
      return;
    else if (this.prefix)
      return `${this.prefix}${value}`;
    else if (this.suffix)
      return `${value} ${this.suffix}`;
    else
      return value.toString();
  }

  convert(value, destUnit) {
    try {
      return convert(value)
        .from(this.abbreviation())
        .to(Unit.abbreviation(destUnit))
    } catch (error) {
      console.error(error);
    }
  }
}
