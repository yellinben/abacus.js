import test from 'ava';

import Line from '../src/line';

test('value returns input when unprocessed', t => {
  const input = '1 + 1';
  const line = new Line(input);
  t.is(line.value, input);
});

test('isCalculable is true if value contains valid mathematical symbols', t => {
  const line = new Line('1 + 1');
  t.true(line.isCalculatable());
});

test('isCalculable is false if value contains invalid mathematical symbols', t => {
  const line = new Line('1 + foo');
  t.false(line.isCalculatable());
});

test('isProcessable is true if value is not blank and not calculatable', t => {
  const line = new Line('1 + foo');
  t.true(line.isProcessable());
});

test('isProcessable is false if value is not blank and calculatable', t => {
  const line = new Line('1 + 1');
  t.false(line.isProcessable());
});

test('isProcessable is false if value is blank', t => {
  const line = new Line('');
  t.false(line.isProcessable());
});

test('result is evaluated only if isCalculatable', t => {
  const line = new Line('1 + foo');
  t.falsy(line.result);
});

test('result is properly evaluated if isCalculatable', t => {
  const line = new Line('1 + 1');
  t.is(line.result, 2);
});
