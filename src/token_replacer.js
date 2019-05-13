export default class TokenReplacer {
  constructor(replacements = {}) {
    this.replacements = replacements;
  }

  run(text) {
    return this.processTokens(text, this.replaceToken);
  }

  tokens(text) {
    return `${text}`.match(/\S+/g);
  }

  eachToken(text, callback) {
    return (this.tokens(text) || []).map(callback);
  }

  processTokens(text, callback) {
    return this.eachToken(text, callback)
      .join(' ').trim();
  }

  replaceToken(token) {
    return this.replacements[token] || token;
  }

  static run(replacements, text) {
    const replacer = new TokenReplacer(replacements);
    return replacer.run(text);
  }
}
