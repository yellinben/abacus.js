import Unit from './unit';
import calc from './calculator';

export default class Line {
  constructor(input) {
    this._input = input;
    this._processed = undefined;
    this._result = undefined;
    this.units = [];
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
    const valid_re = /^[0-9().<>\s&!*/^+-]+$/;
    return valid_re.test(this.value);
  }

  calculate() {
    if (!this._result)
      this._result = this._evaluate();
    return this._result;
  }

  _evaluate() {
    if (this.isCalculatable())
      return calc(this.value);
  }

  print() {
    if (this.hasResult())
      return `${this.input} => ${this.resultFormatted()}`;
    else
      return this.input;
  }

  addUnit = (unit) => {
    if (!this.units) this.units = [];
    this.units.push(Unit.get(unit));
  }

  addUnits = (...units) => {
    [...units.flat()].forEach(this.addUnit);
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

  toJSON() {
    return {
      input: this.input,
      processed: this.processed,
      result: this.result,
      resultFormatted: this.resultFormatted,
      units: this.units.map(u => u.toString())
    };
  }
}
