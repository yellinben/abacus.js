import Unit from './unit';

export default class Line {
  constructor(input) {
    this._input = input;
    this._processed = undefined;
    this._result = undefined;
    this._units = [];
  }

  set input(input) {
    this._input = input;
    this.reset();
    this.calculate();
  }

  get input() {
    return this._input;
  }

  set processed(processed) {
    this._processed = processed;
    this.calculate();
  }

  get processed() {
    if (this.isCalculatable()) this._processed = this.value;
    return this._processed;
  }

  get value() {
    return this._processed || this._input;
  }

  get evaluated() {
    return this.result || this.value;
  }

  get result() {
    return this._result || this.calculate();
  }

  set result(result) {
    this._result = result;
  }

  reset() {
    this._processed = undefined;
    this._result = undefined;
  }

  resultFormatted() {
    return this.format(this.result);
  }

  hasResult() {
    return this.result && typeof this.result !== 'undefined';
  }

  isBlank() {
    return (this.value || '').length < 1;
  }

  isProcessable() {
    return !this.isBlank() && !this.isCalculatable();
  }

  isCalculatable() {
    // to be calculable, line must only contain
    // numeric and mathematical symbols
    const valid_re = /^[0-9().<>\s&%!*/^+-]+$/;
    return valid_re.test(this.value);
  }

  calculate() {
    if (!this._result)
      this._result = this._evaluate();
    return this._result;
  }

  _evaluate() {
    // [very bad] replace with 
    // actual arithmetic parser
    if (this.isCalculatable())
      return eval(this.value);
  }

  print() {
    if (this.hasResult())
      return `${this.input} => ${this.resultFormatted()}`;
    else
      return this.input;
  }

  get units() {
    return this._units || [];
  }

  set units(units) {
    this.units = (units) ? units : [];
  }

  addUnit(unit) {
    this.units.push(unit);
  }

  hasUnits() {
    return this.units.length;
  }

  srcUnit() {
    return this.units[0];
  }

  destUnit() {
    return this.units[this.units.length-1];
  }

  unit() {
    return this.destUnit() || Unit.blank();
  }

  format(value) {
    return this.unit().format(value);
  }
}
