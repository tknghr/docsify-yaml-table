'use strict';

import jsyaml from 'js-yaml'
import { parseTable } from './parse-table';

export const convert2table = (yaml) => {
  let data = jsyaml.load(yaml)
  // Most markdown parser requires header.
  if (!data || !data.headers || !data.rows) {
    return null
  }

  const tableData = parseTable(data)
  if (tableData.headers.length === 0) return null

  return '<table>'
    // header
    + `<thead><tr>${tableData.headers.map(h =>
        `<th>${h.label}</th>`
      ).join('')}</tr></thead>`
    // rows
    + tableData.rows.map(r => 
        `<tr>${
          r.map(cell =>
            `<td${!!cell.align ? ` style="text-align:${cell.align}"` : ''}>`
              + `${cell.content.replaceAll('\n','<br/>')}`
              + `</td>`
          ).join('')
        }</tr>`
      ).join('')
    + '</table>'
}
