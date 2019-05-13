
export default class Line {
  constructor(input) {
    this._input = input;
    this._processed = undefined;
    this._result = undefined;
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
    if (this.isCalculatable()) this._processed = this.value();
    return this._processed;
  }

  value() {
    return this._processed || this._input;
  }

  evaluated() {
    return this.result || this.value;
  }

  get result() {
    this.calculate();
    return this._result;
  }

  reset() {
    this._processed = undefined;
    this._result = undefined;
  }

  resultFormatted() {
    return this.result;
  }

  isCalculatable() {
    const valid_re = /^[0-9().<>\s&%!*/^+-]+$/;
    return valid_re.test(this.value());
  }

  calculate() {
    this._result = this._evaluate();
    return this._result;
  }

  _evaluate() {
    // [very bad] replace with 
    // actual arithmetic parser
    if (this.isCalculatable())
      return eval(this.value());
  }
}
