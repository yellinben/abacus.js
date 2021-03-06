import CommentProcessor from './comment_processor';
import WordMathProcessor from './word_math_processor';
import PercentageProcessor from './percentage_processor';
import VariableAssignmentProcessor from './variable_assignment_processor';
import VariableExpansionProcessor from './variable_expansion_processor';
import UnitConversionProcessor from './unit_conversion_processor';
import UnitPrefixProcessor from './unit_prefix_processor';
import UnitSuffixProcessor from './unit_suffix_processor';

export default [
  VariableAssignmentProcessor,
  VariableExpansionProcessor,
  CommentProcessor,
  WordMathProcessor,
  PercentageProcessor,
  UnitConversionProcessor,
  UnitPrefixProcessor,
  UnitSuffixProcessor
];
