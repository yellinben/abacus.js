import convert from 'convert-units';

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
