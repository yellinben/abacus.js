import Line from './line';
import processors from './processors';

export default class Context {
  static processors = [];
  static reservedWords = [];

  constructor() {
    this.lines = [];
    this.variables = {};
  }

  static registerProcessor(processor) {
    if (typeof processor === 'function') processor = new processor();

    if (processor && processor.name) {
      Context.processors[processor.name] = processor;
      Context.addReservedWords(...processor.reserved);
    }
  }

  static registerProcessors(...processors) {
    processors.flat().forEach(p => Context.registerProcessor(p));
  }

  static allProcessors() {
    return Object.values(Context.processors).sort(
      (a, b) => a.proirity - b.proirity,
    );
  }

  static addReservedWords(...reserved) {
    Context.reservedWords = [
      ...new Set([...Context.reservedWords, ...reserved]),
    ];
  }

  reservedWords() {
    return [...new Set([
      ...Context.reservedWords, 
      Object.keys(this.variables)
    ])];
  }

  get processors() {
    return Context.processors;
  }

  get allProcessors() {
    return Context.allProcessors();
  }

  setVariable(name, value) {
    this.variables[name] = value;
  }

  setVariables(vars) {
    this.variables = {...this.variables, ...vars};
  }

  setVars(...vars) {
    if (vars && vars.length == 2 && typeof vars[0] == 'string')
      this.setVariable(vars[0], vars[1]);
    else if (vars && vars.length && typeof vars[0] == 'object')
      this.setVariables(Object.assign({}, ...vars));
  }

  getVariable(name) {
    return this.variables[name];
  }

  hasVariable(name) {
    return !!this.getVariable(name);
  }

  insertLine(input) {
    const line = new Line(input);
    this.lines.push(line);
    return line;
  }

  setLine(index, input) {
    let line;
    if (this.lines[index]) {
      line = this.lines[index].input;
      line = input;
    } else {
      line = new Line(input);
      this.lines[index] = line;
    }
    return line;
  }

  addLine(input) {
    const line = this.insertLine(input);
    this.processLine(this.lines.length-1);
    return line;
  }

  editLine(index, input) {
    const line = this.setLine(index, input);
    this.processLines();
    return line;
  }

  addLines(...lines) {
    [...lines].flat().forEach(input => this.insertLine(input));
    this.processLines();
  }

  addText(text) {
    this.addLines((text || '').split('\n'));
  }

  processLines = () => {
    this.lines.forEach((line, index) => {
      this.processLine(line, index);
    });
  }

  processLine = (line, index) => {
    if (typeof index === 'undefined') {
      const lineIndex = this.lines.indexOf(line);
      if (lineIndex >= 0) index = lineIndex;
    }

    const vars = [];
    let lineValue = line.value();

    this.allProcessors.forEach(processor => {
      const result = this.processInput(lineValue, index, processor);
      if (result['output'])
        lineValue = result['output'];
      if (result['variable']) 
        vars.push(result['variable']);
    });

    line._processed = lineValue;

    if (typeof index !== 'undefined')
      vars.push(`line${index+1}`);

    vars.filter(Boolean)
      .forEach(name => this.setVariable(name, line));

    return line;
  }

  processInput = (input, index, processor) => {
    const result = processor.run(input, this);
    if (!result) return;

    return {
      output: undefined, 
      variable: undefined,
      ...result
    };
  }

  inputLines() {
    return this.lines.map(line => line.input);
  }

  processedLines() {
    return this.lines.map(line => line.processed);
  }

  processed() {
    return this.processLines().filter(Boolean);
  }

  resultLines() {
    return this.lines.map(line => line.result || "");
  }

  results() {
    return this.resultLines().filter(Boolean);
  }

  outputLines() {
    return this.resultLines()
      .map(line => `${line.input} => ${line.result}`);
  }

  output() {
    return this.outputLines().join('\n');
  }

  variableExpressions() {
    return Object.keys(this.variables).reduce((results, varName) => {
      results[varName] = this.variables[varName].processed;
      return results;
    }, {});
  }

  variableResults() {
    return Object.keys(this.variables).reduce((results, varName) => {
      results[varName] = this.variables[varName].result;
      return results;
    }, {});
  }
}

Context.registerProcessors(processors);
