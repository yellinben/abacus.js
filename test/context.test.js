import test from 'ava';

import Context from '../src/context';
import processors from '../src/processors';

test('registers all available processors', t => {
  const ctx = new Context();
  t.is(ctx.allProcessors.length, processors.length);
});

test('returns sorted processors', t => {
  const ctx = new Context();
  const processorNames = ctx.allProcessors.map(p => p.constructor.name);
  const sortedProcessors = ["VariableAssignmentProcessor", "CommentProcessor", "WordMathProcessor", "PercentageProcessor", "VariableExpansionProcessor"];
  t.is(processorNames.toString(), sortedProcessors.toString());
});

test('insertLine appends line without processing', t => {
  const ctx = new Context();
  const input = '1 + 1';
  ctx.addLine(input);
  t.is(ctx.lines[0].value, input);
});

test('addLine appends and processes line', t => {
  const ctx = new Context();
  ctx.addLine('1 + 1');
  t.is(ctx.lines[0].result, 2);
});

test('processInput returns proper result object', t => {
  const ctx = new Context();
  const processor = Context.processors['variable_assignment'];
  const {output,variable} = ctx.processInput('bar = 4 * 2', 0, processor);
  const result = {output: '4 * 2', variable: 'bar'};
  t.is({output, variable}.toString(), result.toString());
});

test('assigns default line variable', t => {
  const ctx = new Context();
  const line = ctx.addLine('1 + 1');
  t.is(ctx.getVariable('line1'), line);
});

test('handles variable assignment', t => {
  const ctx = new Context();
  const line = ctx.addLine('foo = 1 + 1');
  t.is(ctx.getVariable('foo'), line);
});

test('variableExpressions returns object of processed content for variables', t => {
  const ctx = new Context();
  ctx.addLine('foo = 8 - 2');
  t.is(ctx.variableExpressions()['foo'], '8 - 2');
});

test('variableResults returns object of results for variables', t => {
  const ctx = new Context();
  ctx.addLine('foo = 8 - 2');
  t.is(ctx.variableResults()['foo'], 6);
});

test('receives reserved words from processors', t => {
  const ctx = new Context();
  const reserved = ['=', 'of', 'off', 'on'];
  t.true(reserved.every(r => ctx.reservedWords().includes(r)));
});

test('inputLines returns all line inputs', t => {
  const ctx = new Context();
  const lines = ['1 + 1', '2 + 2'];
  ctx.addLines(lines);
  t.is(ctx.inputLines().toString(), lines.toString());
});

test('processedLines returns all processed line content', t => {
  const ctx = new Context();
  ctx.addLines('foo = 1 + 1', '10% of 20', 'two plus five');
  const processed = ['1 + 1', '20 * 0.1', '2 + 5'];
  t.is(ctx.processedLines().toString(), processed.toString());
});

test('resultLines returns list of all line results or blank string if missing', t => {
  const ctx = new Context();
  ctx.addLines('1 + 1', '// comment', 'two plus five');
  t.is(ctx.resultLines().toString(), [2, "", 7].toString());
});

test('results returns list of all line results, excluding missing', t => {
  const ctx = new Context();
  ctx.addLines('1 + 1', '// comment', 'two plus five');
  t.is(ctx.results().length, 2);
});
