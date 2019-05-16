import test from 'ava';

import PercentageProcessor from '../src/processors/percentage_processor';
const processor = new PercentageProcessor();

test('handles percentage of operation', t => {
  t.is(processor.run('15% of 30').output, '30 * 0.15');
});

test('handles percentage off operation', t => {
  t.is(processor.run('15% off 30').output, '30 - (30 * 0.15)');
});

test('handles percentage on operation', t => {
  t.is(processor.run('15% on 30').output, '30 + (30 * 0.15)');
});

test('ignores non-matching input', t => {
  t.falsy(processor.matchTest('1 + 1'));
});
