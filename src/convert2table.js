'use strict';

import jsyaml from 'js-yaml'
import { parseTable } from './parse-table';

export const convert2table = (yaml) => {
  let data;
  try {
    data = jsyaml.load(yaml)
  } catch (err) {
    console.error(err)
    return null
  }
  if (!data || !data.rows) {
    return null
  }
  if (!data.columns) {
    // Use the first row's property name as header
    data.columns = Object.keys(data.rows[0]).map(key => ({
      label: key,
      source: key,
    }))
  }

  const tableData = parseTable(data)
  if (tableData.columns.length === 0) return null

  // header
  return `| ${tableData.columns.map(h => h.label).join(' | ')} |\n`
    // separator
    + `|${tableData.columns.map(h =>
      h.align === 'left' ? ':---'
      : h.align === 'center' ? ':--:'
      : h.align === 'right' ? '---:'
      : '----'
    ).join('|')}|\n`
    // rows
    + tableData.rows.map(r => 
        `| ${r.map(cell =>
          cell.content.replaceAll('\n','<br/>').replaceAll('|', '\\|')
        ).join(' | ')} |`
      ).join('\n')
}
