# Docsify YAML Table Plugin

Plugin to render table by yaml for [Docsify](https://github.com/docsifyjs/docsify).

This is NOT standard markdown syntax, and this works only on docsify.
You will need to convert to standard table syntax when you want to migrate to another documentation tool.

## Install

Insert script into your docsify `index.html`.

```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/gh/tknghr/docsify-yaml-table@v0.4.2/dist/docsify-yaml-table.min.js"></script>

<!-- or locally -->
<script src="path/to/docsify-yaml-table.min.js"></script>
```

## Usage

~~~
```yamltable
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

| id | note        |
|----|-------------|
| a  | AAA         |
| b  | BBB         |
| c  | CCC         |


## Options

### Header options

| Key              | Description   |
|------------------|---------------|
| label            | Header label. |
| source           | Column key name for rows. |
| allowHtmlHeader  | Render header as HTML. Be careful to enable.<br>default: `false` |
| allowHtmlContent | Render row as HTML. Be careful to enable.<br>default: `false` |
| type             | Set `autonumber` for auto numbering column.<br>`source` key will be ignored. |
| startFrom        | Starting number for auto numbering.<br>default: `1` |
| align            | Text alignment. Available values are `left`, `center`, `right`. When `autonumber`, default is `right`. |

## Example

~~~
```yamltable
headers:
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
```
~~~

| #  | Description | HTML   | Number |
|---:|-------------|--------|-------:|
| 9  | AAA         | Hello! | 1      |
| 10 | You can write<br>multiple lines. | <b>Bold!</b> | 100 |
| 11 | Line break can be replaced to space. | <i>Itally</i> | 12,345 |

