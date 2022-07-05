'use strict';

import { convert2table } from './convert2table'

const LANG = 'yamltable'

const docsifyYamlTablePlugin = (hook, vm) => {
  hook.beforeEach(function(content) {
    // get yamltable code blocks
    var regexp = new RegExp("^(```|~~~)(?:" + LANG + ")?\\n([\\s\\S]+?)\\1", "gm")

    // replace matched blocks
    return content.replace(regexp, function(matched, capture1, capture2){
      // matched is matched string. will return this when failing to convert.
      // capture1 is ``` or ~~~, not used.
      // capture2 is content of the matched code block.
      var convertedTable = convert2table(capture2)
      return !!convertedTable ? convertedTable : matched
    })
  });
}

window.$docsify = window.$docsify || {}
window.$docsify.plugins = (window.$docsify.plugins || []).concat([docsifyYamlTablePlugin])
