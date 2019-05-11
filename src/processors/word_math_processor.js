import Processor from '../processor';

export default class WordMathProcessor extends Processor {
  constructor() {
    const replacements = {
      one: 1, two: 2, three: 3, four: 4, five: 5, 
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10, 
      quarter: "25%", third: "33.333333%", half: "50%",
      plus: "+", minus: "-", times: "*", over: "/"
    };

    super('word_math', {
        reserved: Object.keys(replacements),
        priority: 1
      }, replacements
    );
  }
}
