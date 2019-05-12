import Processor from '../processor';

export default class CommentProcessor extends Processor {
  constructor() {
    super('comment',
      { match: /^\s*[/]{2}/ },
      () => undefined,
    );
  }
}
