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
    } else if (typeof opts.handler == 'string') {
      const output = opts.handler;
      opts.handler = () => output;
      opts.handler = undefined;
    }

    if (!opts.handler && Object.keys(opts.replacements).length) {
      opts.handler = (matches) => this.replace(matches.line.value());
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

  replace(text) {
    const replacer = new TokenReplacer(this.replacements);
    return replacer.run(text);
  }

  matchLine(line) {
    const match = this.matchTest(line.value());
    if (match) return {...match, line};
  }

  run(line, context) {
    const matches = this.matchLine(line);
    return new Promise(resolve => {
      if (matches) resolve(this.handler(matches, context));
    });
  }
}
