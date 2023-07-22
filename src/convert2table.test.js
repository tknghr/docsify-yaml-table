'use strict';

import { convert2table } from './convert2table'

test('minimum example', () => {
  const yaml = `
  rows:
  - id: a
    note: AAA
  - id: b
    note: BBB
  - id: c
    note: CCC
  `
  expect(convert2table(yaml)).toBe([
    "| id | note |",
    "|----|----|",
    "| a | AAA |",
    "| b | BBB |",
    "| c | CCC |",
  ].join('\n'))
})

test('standard example', () => {
  const yaml = `
  columns:
  - label: test
    source: col1
  rows:
  - col1: AAA
  - col1: BBB
  `
  expect(convert2table(yaml)).toBe([
    "| test |",
    "|----|",
    "| AAA |",
    "| BBB |",
  ].join('\n'))
})

test('escape pipe', () => {
  const yaml = `
  columns:
  - label: test
    source: col1
  rows:
  - col1: include|pipe
  `
  expect(convert2table(yaml)).toBe([
    "| test |",
    "|----|",
    "| include\\|pipe |",
  ].join('\n'))
})

test('cell text align', () => {
  const yaml = `
  columns:
  - label: left
    source: col1
    align: left
  - label: center
    source: col1
    align: center
  - label: right
    source: col1
    align: right
  rows:
  - col1: AAA
  `
  expect(convert2table(yaml)).toBe([
    "| left | center | right |",
    "|:---|:--:|---:|",
    "| AAA | AAA | AAA |",
  ].join('\n'))
})

test('line breaks', () => {
  const yaml = `
  columns:
  - label: test
    source: col1
  rows:
  - col1: |
      multiple line
      should be kept.
  - col1: |-
      multiple line
      should be kept.
  - col1: >
      line break is replaced to space
      but keep final line break.
  - col1: >-
      line break is replaced to space
      but keep final line break.
  `
  expect(convert2table(yaml)).toBe([
    "| test |",
    "|----|",
    "| multiple line<br/>should be kept.<br/> |",
    "| multiple line<br/>should be kept. |",
    "| line break is replaced to space but keep final line break.<br/> |",
    "| line break is replaced to space but keep final line break. |",
  ].join('\n'))
})

test('readme example', () => {
  const yaml = `
  columns:
  - label: "#"
    type: autonumber
    startFrom: 9
  - label: Description
    source: note
  - label: HTML
    source: html
    allowHtmlContent: true
  - label: Number
    source: num
    align: right
  
  rows:
  - id: a
    note: AAA
    html: Hello!
    num: 1
  - id: b
    note: |
      You can write
      multiple lines.
    html: <b>Bold!</b>
    num: 100
  - id: c
    note: >
      Line break can be
      replaced to space.
    html: <i>Itally</i>
    num: 12,345
  `
  expect(convert2table(yaml)).toBe([
    "| # | Description | HTML | Number |",
    "|---:|----|----|---:|",
    "| 9 | AAA | Hello! | 1 |",
    "| 10 | You can write<br/>multiple lines.<br/> | <b>Bold!</b> | 100 |",
    "| 11 | Line break can be replaced to space.<br/> | <i>Itally</i> | 12,345 |",
  ].join('\n'))
})
