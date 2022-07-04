'use strict';

import { convert2table } from './convert2table'

const LANG = 'yamltable'

const docsifyYamlTablePlugin = (hook, vm) => {
  const SELECTOR = `pre[data-lang="${LANG}"]`

  hook.afterEach(function (content) {
    var dom = window.Docsify.dom
    var $ = dom.create('span', content)

    if (!$.querySelectorAll) {
      return content
    }

    (dom.findAll($, SELECTOR) || []).forEach(function (element) {
      var convertedTable = convert2table(element.innerText)
      if (convertedTable) {
        var container = dom.create('div')
        container.setAttribute('data-lang', LANG)
        container.innerHTML = convertedTable
        element.parentNode.replaceChild(container, element)
      }
    })

    return $.innerHTML
  })
}

window.$docsify = window.$docsify || {}
window.$docsify.plugins = (window.$docsify.plugins || []).concat([docsifyYamlTablePlugin])
