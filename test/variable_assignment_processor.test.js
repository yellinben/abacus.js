import test from 'ava';

import VariableAssignmentProcessor from '../src/processors/variable_assignment_processor';
const processor = new VariableAssignmentProcessor();

test('returns output as assigned expression', t => {
  t.is(processor.run('foo = 1 + 1').output, '1 + 1');
});

test('returns variable as assigned name', t => {
  t.is(processor.run('foo = 1 + 1').variable, 'foo');
});

test('ignores non-matching input', t => {
  t.falsy(processor.matchTest('1 + 1'));
});
