import { ulid } from 'ulid';
import convert from 'convert-units';

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
