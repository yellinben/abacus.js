import Sheet from './sheet';

import { 
  parseJSON, unique,
  isValidId, uniqueId
} from './utils';

export default class Notebook {
  static DEFAULT_TITLE = 'Untitled';

  constructor(opts = {}) {
    if ('sheets' in opts && Array.isArray(opts.sheets)) {
      opts.sheets = opts.sheets.flat()
        .reduce((sheets, sheet) => {
          sheets[sheet.id] = sheet;
      }, {});
    }

    Object.assign(this, {
      id: uniqueId(),
      sheets: {},
      author: undefined,
      service: undefined
    }, opts);

    if (!this.author && this.hasSheets())
      this.author = this.authors()[0];
  }

  static withSheets(...sheets) {
    return new Notebook({sheets: [...sheets.flat()]});
  }

  allSheets(sort = 'id') {
    return Object.values(this.sheets).sort((sheetA, sheetB) => { 
      const sortA = sheetA[sort].toString();
      const sortB = sheetB[sort].toString();
      return sortB.localeCompare(sortA);
    });
  }

  recentSheets() {
    return this.allSheets('updated');
  }

  latestSheet() {
    if (this.hasSheets()) 
      return this.recentSheets()[0];
  }

  lastUpdated() {
    return (this.latestSheet() || {})['updated'];
  }

  findSheet(sheet) {
    if (sheet instanceof Sheet)
      return sheet;
    else if (typeof sheet === 'number') 
      return this.findByRecent(sheet);
    else if (isValidId(sheet))
      return this.findById(sheet);
    else if (sheet)
      return this.findByTitle(sheet);
  }

  findById(id) {
    return this.sheets[id];
  }

  findByTitle(title, searchSlug = true) {
    return this.recentSheets().find(sheet => {
      return sheet.title === title || 
        (searchSlug && sheet.slug() === title);
    });
  }

  findByRecent(index) {
    // supports negative index
    const recent = this.recentSheets();
    return recent[(index >= 0) ? index :
      recent.length - index];
  }

  hasSheets() {
    return this.ids().length > 0;
  }

  newSheet(title = this._defaultTitle()) {
    const sheet = new Sheet({
      title, author: this.author,
      notebook: this
    });
    
    this.sheets[sheet.id] = sheet;
    return sheet;
  }

  removeSheet(sheet) {
    const sheetObj = this.findSheet(sheet);
    if (sheetObj.id in this.sheets)
      delete this.sheets[sheetObj.id];
  }

  setSheet = (sheet) => {
    if (sheet && 'id' in sheet)
      this.sheets[sheet.id] = sheet;
  }

  addSheets(...sheets) {
    sheets.flat().forEach(this.setSheet);
  }

  addSheet(sheet) {
    if (this.sheets[sheet.id] && this.sheets[sheet.id] !== sheet)
      this.sheets[sheet.id] = sheet;
  }

  ids() {
    return Object.keys(this.sheets);
  }

  recentIds() {
    return this._sheetMap('id', 'updated');
  }

  titles() {
    return this._sheetMap('title');
  }

  slugs() {
    return this._sheetMap('slugs');
  }

  authors() {
    return unique(this._sheetMap('author', 'updated'));
  }
  
  _sheetMap(prop, sort = undefined) {
    return this.allSheets(sort).map(sheet => sheet[prop]);
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

  save(sheets = this.allSheets()) {
    if (this.service) this.service.save(sheets);
  }

  toJSON(includeSheets = true) {
    const json = {
      id: this.id,
      author: this.author,
      updated: this.lastUpdated(),
      recentSheetIds: this.recentIds()
    };

    if (includeSheets) {
      json['sheets'] = this.sheets.reduce((acc, sheet) => {
        acc[sheet.id] = sheet.toJSON(); return acc;
      }, {});
    }

    return json;
  }

  static fromJSON(json) {
    let { id, author, sheets } = parseJSON(json);

    if (typeof sheets === 'object') {
      sheets = Object.values(sheets);
    }
    
    return new Notebook({id, author, 
      sheets: sheets.map(Sheet.fromJSON)
    });
  }
}
