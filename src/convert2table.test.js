'use strict';
import {jest} from '@jest/globals'

const parseTableMock = jest.fn()
jest.mock('./parse-table', () => ({
  parseTable: parseTableMock
}))

import { convert2table } from './convert2table'

test('returns null when empty source', () => {
  expect(convert2table('')).toBeNull()
})

test('minimum example', () => {
  const yaml = `
  headers:
  - label: test
    source: col1
  rows:
  - col1: AAA
  - col1: BBB
  `
  expect(convert2table(yaml)).toBe(
  "<table>"
  + "<thead><tr><th>test</th></tr></thead>"
  + "<tr><td>AAA</td></tr>"
  + "<tr><td>BBB</td></tr>"
  + "</table>"
  )
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
  expect(convert2table(yaml)).toBe(
  "<table>"
  + "<thead><tr>"
  + "<th>left</th>"
  + "<th>center</th>"
  + "<th>right</th>"
  + "</tr></thead>"
  + "<tr>"
  + "<td style=\"text-align:left\">AAA</td>"
  + "<td style=\"text-align:center\">AAA</td>"
  + "<td style=\"text-align:right\">AAA</td>"
  + "</tr>"
  + "</table>"
  )
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
  expect(convert2table(yaml)).toBe(
  "<table>"
  + "<thead><tr><th>test</th></tr></thead>"
  + "<tr><td>multiple line<br/>should be kept.<br/></td></tr>"
  + "<tr><td>multiple line<br/>should be kept.</td></tr>"
  + "<tr><td>line break is replaced to space but keep final line break.<br/></td></tr>"
  + "<tr><td>line break is replaced to space but keep final line break.</td></tr>"
  + "</table>"
  )
})
