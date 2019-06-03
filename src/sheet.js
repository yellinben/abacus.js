import Context from './context';

export default class Sheet {
  constructor(opts = {}, contents = []) {
    if ('contents' in opts) {
      contents = opts['contents'];
      delete opts['contents'];
    }

    Object.assign(this, {
      id: 0,
      title: "untitled",
      author: undefined,
      format: undefined,
      created: new Date(),
      updated: new Date()
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

  get text() {
    return this.contents.join('\n');
  }

  set text(text) {
    this.contents = text.split('\n');
  }

  _setContents(contents) {
    this._updateTimestamp();
    this._context.setLines(...contents.flat());
  }

  add(...inputLines) {
    this._updateTimestamp();
    return this._context.addLines(inputLines);
  }

  write(text) {
    this._updateTimestamp();
    return this.add(text.split('\n'));
  }

  _updateTimestamp() {
    this.updated = new Date();
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

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      format: this.format,
      created: this.created.toISOString(),
      updated: this.updated.toISOString(),
      contents: this.contents,
      lines: this.lines
    };
  }
}
