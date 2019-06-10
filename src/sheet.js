import Context from './context';

import { 
  parseJSON, 
  slugify, uniqueId, 
  toDateISO, toDate 
} from './utils';

export default class Sheet {
  constructor(opts = {}, contents = []) {
    if (contents && typeof contents === 'string') {
      opts['text'] = contents;
    } else if (Array.isArray(contents)) {
      opts['contents'] = contents;
    }

    this._context = new Context();

    Object.assign(this, {
      id: uniqueId(), notebook: undefined,
      title: undefined, author: undefined,
      created: toDate(opts['created']),
      updated: toDate(opts['updated']),
    }, opts);
  }

  slug() {
    return slugify(this.title);
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

  _setContents(...contents) {
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

  results() {
    return this._context.resultsFormatted();
  }

  resultsRaw() {
    return this._context.results();
  }

  get lines() {
    return this._context.lines
      .map(line => ({
        input: line.input,
        expression: line.processed,
        mode: "calculation",
        result: line.result,
        resultFormatted: line.resultFormatted()
      })
    );
  }

  save = () => {
    if (this.notebook) 
      return this.notebook.save(this);
  }

  update(contents) {
    if (typeof contents === 'string')
      this.text = contents;
    else
      this.contents = contents;    
    this.save();
  }

  remove() {
    if (this.notebook) 
      return this.notebook.removeSheet(this);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug(),
      author: this.author,
      created: toDateISO(this.created),
      updated: toDateISO(this.updated),
      contents: this.contents,
      text: this.text
    };
  }

  static toJSON(sheet) {
    console.log('[toJSON]', sheet);
    return {
      id: sheet.id,
      title: sheet.title,
      slug: sheet.slug(),
      author: sheet.author,
      created: sheet.created.toISOString(),
      updated: sheet.updated.toISOString(),
      text: sheet.text
    };
  }

  static fromJSON(json) {
    if (!json) return;

    const data = parseJSON(json);
    let sheet;
    console.log('[fromJSON]', data);

    if (typeof data === 'string') {
      sheet = new Sheet();
      sheet.text = data;
      return sheet;
    } else if (Array.isArray(data)) {
      sheet = new Sheet();
      sheet.contents = data;
      return sheet;
    } else if (typeof data !== 'object') {
      return new Sheet();
    }

    let {
      id, title, author,
      created, updated,
      text, contents
    } = data;

    sheet = new Sheet({ 
      id, title, author,
      created, updated
    });
    
    if (contents && contents.length > 0) {
      sheet.contents = contents;
    } else if (text && text.length > 0) {
      sheet.text = text;
    }
    
    return sheet;
  }
}
