'use strict';

import jsyaml from 'js-yaml'

const plugin = (hook, vm) => {
  const LANG = 'yamltable'
  const SELECTOR = `pre[data-lang="${LANG}"]`

  const TYPE_AUTONUMBER = 'autonumber'
  const HEADER_AUTONUMBER = '#'
  
  hook.afterEach(function (content) {
    var dom = window.Docsify.dom
    var $ = dom.create('span', content)
  
    if (!$.querySelectorAll) {
      return content
    }
  
    (dom.findAll($, SELECTOR) || []).forEach(function (element) {
      var convertedTable = convert2table(dom, element.innerText)
      if (convertedTable) {
        element.parentNode.replaceChild(convertedTable, element)
      }
    })
  
    return $.innerHTML
  })
  
  function convert2table(dom, yaml) {
    let data = jsyaml.load(yaml)
    // Most markdown parser requires header.
    if (!data || !data.headers || !data.rows) {
      return null
    }
  
    let table = dom.create('table')
  
    // Header
    appendHeader({data, dom, table})
  
    // Body
    let body = dom.create('tbody')
    data.rows.map(row => appendRow({data, dom, body, row}))
    dom.appendTo(table, body)

    return table
  }

  function appendHeader({data, dom, table}) {
    let header = dom.create('thead')
    let headerRow = dom.create('tr')
    data.headers.map(key => {
      let hcols = dom.create('th')

      // Special column: auto numbering
      if (key.type === TYPE_AUTONUMBER) {
        hcols.innerText = key.label || HEADER_AUTONUMBER
        key.__autonumber__ = key.startFrom || 1

      } else {
        hcols.innerText = key.label || ''
      }

      dom.appendTo(headerRow, hcols)
    })

    dom.appendTo(header, headerRow)
    dom.appendTo(table, header)
  }

  function appendRow({data, dom, body, row}) {
    let rowContents = dom.create('tr')
    data.headers.map(head => {
      let cell = dom.create('td')
      if (head.align)
        cell.style.textAlign = head.align

      // Raw column: rendering as HTML (not secure)
      if (head.raw) {
        cell.innerHTML = row[head.source] || ''

      // Auto numbering column
      } else if (head.type === TYPE_AUTONUMBER) {
        cell.innerText = head.__autonumber__++

      // Standard column: rendering as text
      } else {
        cell.innerText = row[head.source] || ''
      }

      dom.appendTo(rowContents, cell)
    })
    dom.appendTo(body, rowContents)
  }
}

window.$docsify = window.$docsify || {}
window.$docsify.plugins = (window.$docsify.plugins || []).concat([plugin])
