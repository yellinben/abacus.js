import Sheet from './sheet';

export default class Notebook {
  static DEFAULT_TITLE = 'Untitled';

  constructor(opts = {}) {
    Object.assign(this, {
      sheets: [],
      author: undefined
    }, opts);
  }

  recentSheets() {
    return this.sheets.sort((sheetA, sheetB) => (
      sheetB.updated - sheetA.updated
    ));
  }

  latestSheet() {
    if (this.sheets && this.sheets.length)
      return this.recentSheets()[0];
  }

  newSheet(title = this._defaultTitle()) {
    const sheet = new Sheet({
      title, author: this.author
    });
    this.sheets.push(sheet);
    return sheet;
  }

  removeSheet(sheet) {
    const title = (sheet instanceof Sheet) ? sheet.title : sheet;
    this.sheets = this.sheets.filter(s => s.title === title);
  }

  titles() {
    return this.sheets.map(sheet => sheet.title);
  }

  findSheet(title) {
    return this.sheets.find(sheet => sheet.title === title);
  }

  _titleExists(title) {
    return this.titles().includes(title);
  }

  _defaultTitle() {
    let count = 1;
    let title = Notebook.DEFAULT_TITLE;

    while (this._titleExists(title) && count < 100) {
      title = `${Notebook.DEFAULT_TITLE} ${count}`
      count++;
    }

    return title;
  }
}
