'use strict';
/**
 * @typedef {Object} Column
 * @property {string?} label header label
 * @property {string?} source row data field name
 * @property {boolean} allowHtmlHeader allow HTML tags for header label
 * @property {boolean} allowHtmlContent allow HTML tags for cell content
 * @property {string?} type column type. now supporting only `autonumber`.
 * @property {string?} align text alignment in cell. now supporting only `left`, `center`, `right`.
 * 
 * @typedef {Cell[]} Row
 * 
 * @typedef {Object} Cell
 * @property {string} content cell content
 * @property {string?} align text alignment in cell. inherited from header.
 */


import sanitizeHtml from 'sanitize-html'

// Update config not to allow table related tags
const disallowedTags = ["table", "tbody", "td", "tfoot", "th", "thead", "tr"]
const allowedTags = sanitizeHtml.defaults.allowedTags.filter(tag => !disallowedTags.includes(tag))

const TYPE_AUTONUMBER = 'autonumber'
const HEADER_AUTONUMBER = '#'

/**
 * Create table object from source.
 * @param {Object} source Table source.
 * @returns {{ columns: Column[], rows: Row[]}} Table object.
 */
export const parseTable = (source) => {
  const table = {
    columns: generateHeader(source.columns),
    rows: [],
  }

  table.rows.push(...generateRows(table.columns, source.rows))

  return table
}

/**
 * Generate header object.
 * @param {Object} columns Source data to convert to table
 * @returns {Column[]} Column object
 */
function generateHeader(columns) {
  return columns.map(key => {
    const column = {
      label: (!!key.allowHtmlHeader ? sanitize(key.label) : escapeAll(key.label)) || '',
      source: key.source || '',
      allowHtmlHeader: !!key.allowHtmlHeader,
      allowHtmlContent: !!key.allowHtmlContent,
      type: key.type,
      align: key.align,
    }

    // Special column: auto numbering
    if (key.type === TYPE_AUTONUMBER) {
      column.label = column.label || HEADER_AUTONUMBER
      column.startFrom = key.startFrom || 1
      column.__autonumber__ = column.startFrom
      // default align is right
      column.align = column.align || 'right'
    }

    // Remove undefined keys
    Object.keys(column).forEach((k) => column[k] == null && delete column[k]);
    return column
  })
}

/**
 * 
 * @param {Column[]} columns Column list
 * @param {Object[]} rows Row sources
 * @returns {Cell[]} Row objects
 */
function generateRows(columns, rows) {
  return (rows || []).map(source =>
    columns.map(head => {
      function getContent() {
        // Raw column: rendering as HTML (not secure)
        if (head.allowHtmlContent) {
          return sanitize(source[head.source]) || ''
    
        // Auto numbering column
        } else if (head.type === TYPE_AUTONUMBER) {
          return (head.__autonumber__++).toString()
        }
  
        // Standard column: rendering as text
        return escapeAll(source[head.source]) || ''
      }
      const cell = {
        content: getContent(),
        align: head.align,
      }
      // Remove undefined keys
      Object.keys(cell).forEach((k) => cell[k] == null && delete cell[k]);
      return cell
    })
  )
}

/** Sanitize with custom configuration. */
function sanitize(dirty) {
  return sanitizeHtml(dirty, { allowedTags })
}
/** Escape all tags. */
function escapeAll(dirty) {
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'escape',
  })
}