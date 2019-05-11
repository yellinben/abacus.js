import TokenReplacer from './token_replacer';

export default class Processor {
  constructor(name, opts, handler) {
    opts = {
      priority: 1,
      reserved: [],
      ...opts,
    };

    this.name = name;
    this.reserved = opts.reserved;

    // 0 = highest priority
    // defaults to 1
    this.priority = opts.priority;

    if (typeof handler === 'function') {
      this.handler = handler;
    } else if (typeof handler === 'object') {
      this.handler = (matches) => {
        return TokenReplacer.run(handler, matches.line.value());
      };
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
