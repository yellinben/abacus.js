import TokenReplacer from './token_replacer';

export default class Processor {
  constructor(opts, handler) {
    // turn CamelCase class name 
    // into snake_case display name
    const name = this.constructor.name
      .replace('Processor', '')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();

    Object.assign(this, {
      name, handler,
      priority: 1,
      reserved: [],
      replacements: {},
      match: undefined,
      matchTest: undefined
    }, opts);

    console.log('[init]', this.constructor, this.constructor.name, this);

    // if handler is a dictionary of replacements
    if (typeof this.handler === 'object') {
      this.replacements = this.handler;
      this.handler = null;
    }

    if (!this.handler && Object.keys(this.replacements).length) {
      this.handler = (matches) => ({
        output: TokenReplacer.run(this.replacements, matches.input)
      });
    }

    // add replacement keys to reserved words
    if (Object.keys(this.replacements).length) {
      this.reserved = [...new Set([
        ...this.reserved, 
        ...Object.keys(this.replacements)
      ])];
    }
    
    // `match` can be either:
    //  * regular expression (string or RegExp object)
    //  * custom function returning truthy/falsy value
    if (typeof this.match === 'function') {
      this.matchTest = this.match;
      this.match = null;
    } else if (this.match) {
      this.match = new RegExp(this.match);
      this.matchTest = (text) => text.match(this.match);
    } else {
      this.matchTest = (text) => [text];
    }
  }

  matchInput(input) {
    const match = this.matchTest(`${input}`);
    if (match) return {...match, input};
  }

  run(text, context) {
    const result = {
      output: text, 
      variable: undefined,
      matched: false
    }

    const matches = this.matchInput(text);
    if (matches) Object.assign(result, this.exec(matches, context));

    return result;
  }

  exec(matches, context) {
    let result = this.handler(matches, context);
    if (typeof result !== 'object') 
      result = {output: result};
    return {matched: true, ...result};
  }

  get replacer() {
    return this._replacer = this._replacer || 
      new TokenReplacer(this.replacements);
  }
}
