import Notebook from './notebook';
import Sheet from './sheet';

export class ServiceStorage {
  static hasLocalStorage = !(typeof localStorage === 'undefined');
  static _global = undefined;
  
  static global() {
    if (!ServiceStorage._global)
      ServiceStorage._global = new ServiceStorage();
    return ServiceStorage._global;
  }

  get(key, deserializer) {
    if (!ServiceStorage.hasLocalStorage) return;
    const data = localStorage.getItem(key);
    return this.deserialize(data, deserializer);
  }

  set(key, item, serializer) {
    if (!ServiceStorage.hasLocalStorage) return;
    const data = this.serialize(item, serializer);
    return localStorage.setItem(key, data);
  }

  remove(key) {
    if (!ServiceStorage.hasLocalStorage) return;
    return localStorage.removeItem(key);
  }

  serialize(item, serializer = undefined) {
    return (typeof serializer === 'function') ? 
      serializer(JSON.stringify(item)) : 
      JSON.stringify(item);
  }

  deserialize(data, deserializer = undefined) {
    return (typeof deserializer === 'function') ? 
      deserializer(JSON.parse(data)) : 
      JSON.parse(data);
  }

  length() {
    return ServiceStorage.hasLocalStorage 
      ? localStorage.length : 0;
  }
  
  keys() {
    const keys = [];
    for (let index = 0; index < this.length(); index++) {
      keys.push(localStorage.key(index));
    }
    return keys;
  }

  keep(validKeys = []) {
    const invalidKeys = this.keys()
      .filter(k => !validKeys.includes(k));
    invalidKeys.forEach(this.remove);
    return invalidKeys;
  }

  clear() {
    if (!ServiceStorage.hasLocalStorage) return;
    return localStorage.clear();
  }
}

export class NotebookService {
  static _global = undefined;

  static SHEET_IDS_KEY = 'sheet_ids';
  static NOTEBOOK_KEY = 'notebook';
  static SHEET_PREFIX = 'sheet_';

  static global() {
    if (!NotebookService._global)
      NotebookService._global = new NotebookService();
    return NotebookService._global;
  }

  constructor(opts = {}) {
    this.storage = new ServiceStorage();

    this.notebook = opts['notebook'] || this.loadNotebook();
    this.saved = opts['saved'];

    const sheets = this.loadSheets();
    this.notebook.addSheets(sheets);
    this.prune();

    this.saveNotebook();
  }

  loadNotebook() {
    const {id, author, saved} = this.storage
      .get(NotebookService.NOTEBOOK_KEY);

    if (this.saved)
      this.saved = saved;

    return new Notebook({id, author, service: this});
  }

  loadSheetIds() {
    return this.storage.get(NotebookService.SHEET_IDS_KEY);
  }

  loadSheet = (id) => {
    const sheet = this.storage.get(
      this.sheetKey(id), Sheet.fromJSON
    );
    
    sheet.notebook = this.notebook;
    return sheet;
  }

  loadSheets() {
    return this.loadSheetIds()
      .map(this.loadSheet)
      .filter(Boolean);
  }

  sheetKey(sheet) {
    const id = (sheet instanceof Sheet) ? sheet.id : sheet;
    return `${NotebookService.SHEET_PREFIX}${id}`;
  }

  sheets() {
    return this.notebook.recentSheets() || [];
  }

  sheetIds() {
    return this.notebook.recentIds() || [];
  }

  sheetKeys() {
    return this.sheetIds().map(this.sheetKey);
  }

  getSheet(sheet) {
    return this.notebook.findSheet(sheet);
  }

  ids() {
    return [this.notebook.id, ...this.sheetIds()];
  }

  keys() {
    return [
      NotebookService.NOTEBOOK_KEY,
      NotebookService.SHEET_IDS_KEY, 
      ...this.sheetKeys()
    ];
  }

  findOrCreateSheet(title) {
    return this.notebook.findByTitle(title) 
      || this.createSheet(title);
  }

  createSheet(title = undefined) {
    const sheet = this.notebook.newSheet(title);
    return this.saveSheet(sheet, true);
  }

  removeSheet(sheet) {
    this.notebook.removeSheet(sheet);
    return this.save(false);
  }

  saveSheet = (sheet, saveIds = true) => {
    const key = this.sheetKey(sheet.id);
    this.storage.set(key, sheet);

    if (saveIds) this.saveSheetIds();
    return sheet;
  }

  saveSheetIds = () => {
    return this.storage.set(
      NotebookService.SHEET_IDS_KEY, 
      this.sheetIds()
    );
  }

  saveSheets = (...sheets) => {
    if (!sheets.length)
      sheets = this.sheets();

    sheets.flat().forEach(sheet => {
      this.saveSheet(sheet, false)
    });

    this.saveSheetIds();
  }

  saveNotebook() {
    return this.storage.set(
      NotebookService.NOTEBOOK_KEY, {
      author: this.notebook.author,
      updated: this.notebook.lastUpdated(),
      saved: new Date().toISOString()
    });
  }

  save(...sheets) {
    this.saveSheetIds();
    this.saveNotebook();

    if (sheets.length)
      this.saveSheets(sheets);
  }

  saveAll() {
    return this.save(this.sheets());
  }

  prune() {
    return this.storage.keep(this.keys());
  }

  clear() {
    return this.storage.clear();
  }
}

export const service = NotebookService.global();
