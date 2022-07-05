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
  // Most markdown parser requires header.
  if (!data || !data.headers || !data.rows) {
    return null
  }

  const tableData = parseTable(data)
  if (tableData.headers.length === 0) return null

  // header
  return `| ${tableData.headers.map(h => h.label).join(' | ')} |\n`
    // separator
    + `|${tableData.headers.map(h =>
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
