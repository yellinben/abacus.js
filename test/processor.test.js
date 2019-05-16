import test from 'ava';

import Processor from '../src/processor';

test('passes options to instance', t => {
  const processor = new Processor({priority: 0});
  t.is(processor.priority, 0);
});

test('matchTest returns handler if function', t => {
  const handler = (text) => text;
  const processor = new Processor({}, handler);
  t.is(processor.matchTest('test').toString(), handler('test').toString());
});

test('matchTest generates handler function if regex', t => {
  const regex = /^\d/;
  const regexMatch = (text) => text.match(regex);
  const processor = new Processor({match: regex});
  t.is(processor.matchTest('10').toString(), regexMatch('10').toString());
});

test('add replacements if handler is object', t => {
  const replacements = {foo: 1, bar: "hello"};
  const processor = new Processor({}, replacements);
  t.is(processor.replacements.toString(), replacements.toString());
});
