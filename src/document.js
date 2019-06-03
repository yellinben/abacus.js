import Context from './context';

export default class Document {
  constructor(opts = {}, contents = []) {
    if ('contents' in opts) {
      contents = opts['contents'];
      delete opts['contents'];
    }

    Object.assign(this, {
      id: 0,
      title: "untitled",
      format: undefined,
      created_at: undefined,
      updated_at: undefined
    }, opts);

    this._context = new Context();
    
    if (contents && contents.length)
      this._setContents(contents);
  }

  get contents() {
    return this._context.inputLines();
  }

  set contents(contents) {
    this._setContents(contents);
  }

  _setContents(contents) {
    this._context.setLines(...contents.flat());
  }

  get text() {
    return this.contents.join('\n');
  }

  set text(text) {
    this.contents = text.split('\n');
  }

  add(...inputLines) {
    return this._context.addLines(inputLines);
  }

  write(text) {
    return this.add(text.split('\n'));
  }

  get lines() {
    return this._context.lines.map(line => {
      return {
        input: line.input,
        expression: line.processed,
        mode: "calculation",
        result: line.result,
        result_formatted: line.resultFormatted()
      }
    });
  }
}
