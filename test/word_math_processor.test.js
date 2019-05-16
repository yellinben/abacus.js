import test from 'ava';

import WordMathProcessor from '../src/processors/word_math_processor';
const processor = new WordMathProcessor();

test('replaces word numbers with numeric values', t => {
  t.is(processor.run('one + two').output, '1 + 2');
});

test('replaces word percentages with numeric values', t => {
  t.is(processor.run('half of 100').output, '50% of 100');
});

test('replaces word operators with symbols', t => {
  t.is(processor.run('(10 plus 8 minus 2) times 3').output, '(10 + 8 - 2) * 3');
});
