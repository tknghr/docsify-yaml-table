'use strict';

import {} from './index'

test('plugin registered', () => {
    expect(window.$docsify.plugins.length).toBe(1)
})

test('not matched', () => {
    const yaml = [
        "# Test",
        "",
        "```js",
        "console.log('test')",
        "```",
        "",
    ].join('\n')
    var pluginFunc;
    const spyHook = {
        beforeEach: (func) => pluginFunc = func
    }
    window.$docsify.plugins[0](spyHook)

    const test = pluginFunc(yaml)
    // Should not changed
    expect(test).toBe(yaml)
})

test('minimum example', () => {
    const yaml = [
        "# Test",
        "",
        "```yamltable",
        "headers:",
        "- label: col1",
        "  source: col1",
        "",
        "rows:",
        "- col1: ABC",
        "- col1: DEF",
        "```",
        "",
    ].join('\n')
    var pluginFunc;
    const spyHook = {
        beforeEach: (func) => pluginFunc = func
    }
    window.$docsify.plugins[0](spyHook)

    const test = pluginFunc(yaml)
    expect(test).toBe([
        "# Test",
        "",
        "| col1 |",
        "|----|",
        "| ABC |",
        "| DEF |",
        "",
    ].join('\n'))
})

test('multiple code blocks', () => {
    const yaml = [
        "# Test",
        "",
        "```yamltable",
        "headers:",
        "- label: col1",
        "  source: col1",
        "",
        "rows:",
        "- col1: ABC",
        "```",
        "",
        "```yamltable",
        "headers:",
        "- label: col1",
        "  source: col1",
        "",
        "rows:",
        "- col1: DEF",
        "```",
        "",
    ].join('\n')
    var pluginFunc;
    const spyHook = {
        beforeEach: (func) => pluginFunc = func
    }
    window.$docsify.plugins[0](spyHook)

    const test = pluginFunc(yaml)
    expect(test).toBe([
        "# Test",
        "",
        "| col1 |",
        "|----|",
        "| ABC |",
        "",
        "| col1 |",
        "|----|",
        "| DEF |",
        "",
    ].join('\n'))
})

test('nested code block does not captured', () => {
    const yaml = [
        "~~~",
        "```yamltable",
        "headers:",
        "- label: col1",
        "  source: col1",
        "",
        "rows:",
        "- col1: ABC",
        "- col1: DEF",
        "```",
        "~~~",
        "",
    ].join('\n')
    var pluginFunc;
    const spyHook = {
        beforeEach: (func) => pluginFunc = func
    }
    window.$docsify.plugins[0](spyHook)

    const test = pluginFunc(yaml)
    // Should not changed
    expect(test).toBe(yaml)
})
