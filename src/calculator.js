import math from 'mathjs';
import { isValidArithmetic } from './utils';

const calc = (input) => {
  try {
    if (isValidArithmetic(input))
      return math.eval(input);
    else
      return input;
  } catch (SyntaxError) {
    console.error(error);
    return input;
  }
}

export default calc;
