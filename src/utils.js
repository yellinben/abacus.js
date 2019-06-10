import { ulid } from 'ulid';
import convert from 'convert-units';

export const isNull = (obj) => obj === null;
export const isUndefined = (obj) => obj === null;
export const isUndefinedOrNull = (obj) => isUndefined(obj) || isNull(obj);

export const notNull = (obj) => ! isNull(obj);
export const notUndefined = (obj) => ! isUndefined(obj);
export const notUndefinedOrNull = (obj) => !isUndefinedOrNull(obj);

export const objLength = (obj, trim = true) => {
  if (isUndefinedOrNull(obj))
    return -1;
  else if (typeof obj === 'string' && trim)
    return obj.trim().length;
  else if (Array.isArray(obj) && trim)
    return objLength(obj.filter(Boolean));
  else if (obj.hasOwnProperty('length'))
    return obj.length;
  else if (typeof obj === 'object')
    return objLength(Object.values(obj), trim);
  else
    return -1;
}

export const isEmpty = (obj) => objLength(obj) > 0;
export const notEmpty = (obj) => !isEmpty(obj);

export const unique = (...arr) => {
  return [...new Set(arr.flat())];
}

export const uniqueId = (seed) => {
  return ulid(seed).toLowerCase();
}

export const isValidId = (id) => {
  return typeof id === 'string' 
    && id.length === 26 
    && !/[^a-zA-Z0-9]/.test(id)
}

export const parseJSON = (json) => {
  return (typeof json === 'string') ? JSON.parse(json) : json;
}

export const isMathematicalSuffix = (symbol) => {
  // right now just detect percentages
  return symbol && /^[%]$/.test(symbol);
}

export const isMeasurementTerm = (term) => {
  if (isMathematicalSuffix(term)) 
    return false;

  try {
    return term && !!convert().describe(term);
  } catch (error) {
    return false;
  }
}

export const isCurrencySymbol = (symbol) => {
  return symbol && /^[$£]$/.test(symbol);
}

export const isCurrencyTerm = (term) => {
  return term && /^(USD|EUR|CAD)$/.test(term);
}

// https://gist.github.com/hagemann/382adfc57adbd5af078dc93feef01fe1
export const slugify = (str) => {
  const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœøṕŕßśșțùúüûǘẃẍÿź·/_,:;'
  const b = 'aaaaaaaaceeeeghiiiimnnnooooooprssstuuuuuwxyz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return str.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export const isValidSlug = (slug) => {
  return typeof slug === 'string' 
    && /^[\w-]+$/.test(slug)
}

export const toDate = (date = undefined, defaultNow = true) => {
  if (date instanceof Date)
    return date;
  else if (date && date.length)
    return new Date(date);
  else if (defaultNow)
    return new Date();
}

export const toDateISO = (date = undefined, defaultNow = undefined) => {
  if (!date && !defaultNow) return;
  return toDate(date, defaultNow).toISOString();
}
