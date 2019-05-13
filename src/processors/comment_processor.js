import Processor from '../processor';

export default class CommentProcessor extends Processor {
  constructor() {
    super({ match: /^\s*[/]{2}/ }, () => undefined);
  }
}
