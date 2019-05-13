import TokenReplacer from './token_replacer';

export default class Processor {
  constructor(name, opts, handler) {
    opts = {
      name, handler,
      priority: 1,
      reserved: [],
      replacements: {},
      ...opts,
    };

    if (typeof opts.handler === 'object') {
      // handler is a dictionary of replacements
      opts.replacements = opts.handler;
      opts.handler = undefined;
    }

    if (!opts.handler && Object.keys(opts.replacements).length) {
      opts.handler = (matches) => ({
        output: TokenReplacer.run(this.replacements, matches.input)
      });
    }

    // add replacement keys to reserved words
    if (Object.keys(opts.replacements).length) {
      opts.reserved = [...new Set([
        ...opts.reserved, 
        ...Object.keys(opts.replacements)
      ])];
    }
    
    // `match` can be either:
    //  * regular expression (string or RegExp object)
    //  * custom function returning truthy/falsy value
    if (typeof opts.match === 'function') {
      this.matchTest = opts.match;
    } else if (opts.match) {
      this.matchTest = (text) => {
        const regex = new RegExp(opts.match);
        return text.match(regex);
      };
    } else {
      this.matchTest = (text) => [text];
    }

    Object.assign(this, opts);
  }

  matchInput(input) {
    const match = this.matchTest(input);
    if (match) return {...match, input};
  }

  run(text, context) {
    const matches = this.matchInput(text || '');
    if (matches) return this.exec(matches, context);
  }

  exec(matches, context) {
    let result = this.handler(matches, context);
    if (result && typeof result !== 'object')
      result = {output: result.toString()};

    return {
      output: undefined, 
      variable: undefined,
      ...result
    };
  }
}
