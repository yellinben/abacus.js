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
    return Context.reservedWords;
  }

  allProcessors() {
    return Context.allProcessors();
  }

  setVariable(name, value) {
    this.variables[name] = value;
  }

  setVariables(vars) {
    this.variables = {...this.variables, ...vars[0]};
  }

  setVars(...vars) {
    if (vars && vars.length == 2 && typeof vars[0] == 'string')
      this.setVariable(vars[0], vars[1]);
    else if (vars && vars.length > 1 && typeof vars[0] == 'string')
      this.setVariables(Object.fromEntries(chunk(vars, 2)));
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
    this.processLines();
    return line;
  }

  editLine(index, input) {
    const line = this.setLine(index, input);
    this.processLines();
    return line;
  }

  processLines() {
    this.lines.forEach((line, index) => {
      this.processLine(line, index);
    });
  }

  processLine(line, index) {
    this.allProcessors().forEach(processor => {
      this.runLineInProcessor(line, index, processor);
    });

    if (typeof index !== 'undefined')
      this.setVariable(`line${index+1}`, line);
  }

  runLineInProcessor(line, index, processor) {
    processor.run(line, this).then(result => {
      if (result && typeof(result) == 'object') {
        if ('output' in result)
          line.processed = result.output;
        if ('vars' in result)
          this.setVariables(result.vars);
      } else if (result) {
        line.processed = result.toString();
      } else {
        line.processed = result;
      }
    });
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
    return this.lines.map(line => line.result);
  }

  results() {
    return this.resultLines().filter(Boolean);
  }

  outputLines() {
    return this.resultLines().map(line => line || "");
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
