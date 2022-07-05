'use strict';

import { convert2table } from './convert2table'

test('minimum example', () => {
  const yaml = `
  headers:
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
  headers:
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
  headers:
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
  headers:
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
