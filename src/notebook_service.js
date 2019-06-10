import Notebook from './notebook';
import Sheet from './sheet';
import { isNullOrUndefined } from 'util';

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

  has(key) {
    return !!this.get(key);
  }

  remove(key) {
    if (!ServiceStorage.hasLocalStorage) return;
    if (this.has(key)) return localStorage.removeItem(key);
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
  }

  loadNotebook() {
    const notebookData = this.storage
      .get(NotebookService.NOTEBOOK_KEY);
    let opts = {};
    
    if (notebookData) {
      const id = notebookData['id'];
      const author = notebookData['author'];
      const saved = notebookData['saved'];
      if (saved) this.saved = saved;
      opts = {id, author, service: this};
    }

    return new Notebook(opts);
  }

  loadSheetIds() {
    return this.storage.get(NotebookService.SHEET_IDS_KEY) || [];
  }

  loadSheet = (id) => {
    const sheet = this.storage.get(
      this.sheetKey(id), Sheet.fromJSON
    );
    
    if (!sheet) return;
    sheet.notebook = this.notebook;
    return sheet;
  }

  loadSheets() {
    const sheets = this.loadSheetIds()
      .map(this.loadSheet)
      .filter(Boolean);

    if (sheets.length < 1)
      sheets.push(this.createSheet());

    return sheets;
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
    this.storage.remove(this.sheetKey(sheet));
    this.saveSheetIds();
    return sheet;
  }

  saveSheet = (sheet, saveIds = true) => {
    const key = this.sheetKey(sheet.id);
    this.storage.set(key, sheet);

    if (saveIds) this.saveSheetIds();
    return sheet;
  }

  saveSheetIds = (prune = true) => {
    return this.storage.set(
      NotebookService.SHEET_IDS_KEY, 
      this.sheetIds()
    );

    if (prune) this.prune();
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
    this.saveSheetIds(false);

    if (sheets.length)
      this.saveSheets(sheets);

    return this;
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
