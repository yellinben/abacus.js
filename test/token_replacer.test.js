import test from 'ava';

import TokenReplacer from '../src/token_replacer';

let replacer = new TokenReplacer({foo: 1, bar: "hello"});

test('splits text into tokens', t => {
  t.is(replacer.tokens("foo and bar").length, 3);
});

test('ignores extra whitespace in tokens', t => {
  t.is(replacer.tokens(" foo and bar ").length, 3);
});

test('replaces tokens with specified values', t => {
  t.is(replacer.run("foo and bar"), "1 and hello");
});
