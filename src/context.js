import Line from './line';
import processors from './processors/index';

export default class Context {
  static processors = [];
  static reservedWords = [];

  constructor() {
    this.lines = [];
    this.variables = {};
  }

  static registerProcessor(processor) {
    if (typeof processor === 'function')
      processor = new processor();

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
      (a, b) => a.priority - b.priority,
    );
  }

  static addReservedWords(...reserved) {
    Context.reservedWords = [
      ...new Set([...Context.reservedWords, ...reserved]),
    ];
  }

  get processors() {
    return Context.processors;
  }

  get allProcessors() {
    return Context.allProcessors();
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
    this.processLine(line);
    return line;
  }

  editLine(index, input) {
    const line = this.setLine(index, input);
    this.processLines();
    return line;
  }

  addLines(...lines) {
    const prevLength = this.lines.length;

    [...lines].flat().forEach(input => {
      return this.insertLine(input)
    });

    this.processLines();
    return this.lines.slice(prevLength);
  }

  addText(text) {
    const lines = (text || '').split('\n');
    return this.addLines(lines);
  }

  eval(text) {
    return this.addLine(text).resultFormatted();
  }

  processLines = () => {
    this.lines.forEach((line, index) => {
      this.processLine(line, index);
    });
  }

  processLine = (line, index) => {
    if (typeof line === 'number' && this.lines[line]) {
      index = line;
      line = this.lines[index];
    } else if (typeof line === 'number') {
      line = null;
    }

    if (typeof index === 'undefined') {
      const lineIndex = this.lines.indexOf(line);
      if (lineIndex >= 0) index = lineIndex;
    }

    if (!line) return;

    let lineVars = [];
    let lineData = {};
    let lineValue = line.value;

    this.allProcessors.forEach(processor => {
      const response = this.processInput(lineValue, index, processor);

      if ('variable' in response) 
        lineVars.push(response.variable);

      if ('output' in response)
        lineValue = response.output;

      if ('result' in response) 
        lineData._result = response.result;

      if ('unit' in response)
        line.addUnit(response.unit);

      if ('units' in response)
        line.addUnits(response.units);
    });

    lineData._processed = lineValue;
    Object.assign(line, lineData);
    
    if (typeof index !== 'undefined')
      lineVars.push(`line${index+1}`);

    lineVars.filter(Boolean)
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

  reservedWords() {
    return [...new Set([
      ...Context.reservedWords, 
      Object.keys(this.variables)
    ])];
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

  getVariables(...names) {
    return [...names].map(name => this.getVariable(name));
  }

  hasVariable(name) {
    return !!this.getVariable(name);
  }

  variableExpression(name) {
    if (this.hasVariable(name))
      return this.getVariable().processed;
  }

  variableResult(name) {
    if (this.hasVariable(name))
      return this.getVariable().result;
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
    return this.lines.map(line => line.print());
  }

  output() {
    return this.outputLines().join('\n');
  }
}

Context.registerProcessors(processors);
