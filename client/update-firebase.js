const { ScriptApp, UrlFetchApp } = require('./appscript-dependencies');
// Remove From This Line Up When Adding to AppScript

// Constants
const na = 'NA';

// Utils
const equals = (a) => (b) => a === b;
const equalsZero = equals(0);
const equalsFalse = equals(false);
const head = (a) => a[0];
const safeKey = (a) => (a || equalsZero(a) || equalsFalse(a) ? a : na);

// Convert Row Array To Object
const rowToObj = (row, headerRow) =>
  row.reduce((acc, cell, index) => {
    const key = safeKey(headerRow[index]);
    const value = safeKey(cell);
    const isIdCell = equalsZero(index);
    return isIdCell ? acc : Object.assign(acc, { [key]: value });
  }, {});

// Combine All Row Objects Into One Object
const combineRows = (rows, headerRow) =>
  rows.reduce((acc, row, index) => {
    const id = safeKey(head(row));
    const isHeaderRow = equalsZero(index);
    return isHeaderRow
      ? acc
      : Object.assign(acc, { [id]: rowToObj(row, headerRow) });
  }, {});

// Format Url
const formatUrl = (sheetName, token) => {
  const dbUrl = 'https://fir-sheets-sync.firebaseio.com/';
  // todo: add dbPath: sheets/
  const format = '.json';
  const querySymbol = '?';
  const accessToken = `access_token=${encodeURIComponent(token)}`;
  return `${dbUrl}${sheetName}${format}${querySymbol}${accessToken}`;
};

// Get Spreadsheet Data
const getSheet = (changeEvent) => changeEvent.range.getSheet();
const getRows = (changeEvent) =>
  getSheet(changeEvent)
    .getDataRange()
    .getValues();
const getSheetName = (changeEvent) => getSheet(changeEvent).getName();

// Update Database On Cell Change Event
const updateFirebase = (changeEvent) => {
  const rows = getRows(changeEvent);
  const headerRow = head(rows);
  const data = combineRows(rows, headerRow);
  const sheetName = getSheetName(changeEvent);
  const url = formatUrl(sheetName, ScriptApp.getOAuthToken());
  const fetchOptions = {
    method: 'put',
    payload: JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, fetchOptions);
};

// Remove From This Line Down When Copying To AppScript
module.exports = {
  combineRows,
  equals,
  equalsFalse,
  equalsZero,
  formatUrl,
  getSheet,
  getRows,
  getSheetName,
  head,
  na,
  rowToObj,
  safeKey,
  updateFirebase
};
