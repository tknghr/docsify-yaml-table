# Docsify YAML Table Plugin

Plugin to render table by yaml.

## Install

Insert script into your docsify `index.html`.

```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/gh/tknghr/docsify-yaml-table@v0.1.2/dist/docsify-yaml-table.min.js"></script>

<!-- or locally -->
<script src="path/to/docsify-yaml-table.min.js"></script>
```

## Usage

~~~
```yamltable
headers:
- label: ID
  source: id
- label: Description
  source: note

rows:
- id: a
  note: AAA
- id: b
  note: BBB
- id: c
  note: CCC
```
~~~

Rendered like below.

| ID | Description |
|----|-------------|
| a  | AAA         |
| b  | BBB         |
| c  | CCC         |


## Options

### Header options

| Key       | Description   |
|-----------|---------------|
| label     | Header label. |
| source    | Column key name for rows. |
| raw       | Render as HTML. Not recommend to enable.<br>default: `false` |
| type      | Set `autonumber` for auto numbering column.<br>`source` key will be ignored. |
| startFrom | Starting number for auto numbering.<br>default: `1` |
| align     | Text alignment. Available values are `left`, `center`, `right`. |

## Example

~~~
```yamltable
headers:
- label: "#"
  type: autonumber
  startFrom: 11
- label: Description
  source: note
- label: HTML
  source: html
  raw: true
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
```
~~~

| #  | Description | HTML   | Number |
|----|-------------|--------|-------:|
| 11 | AAA         | Hello! | 1      |
| 12 | You can write<br>multiple lines. | <b>Bold!</b> | 100 |
| 13 | Line break can be replaced to space. | <i>Itally</i> | 12,345 |

