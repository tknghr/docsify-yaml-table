import { parseTable } from './parse-table'

const defaultHeader = {
  allowHtmlHeader: false,
  allowHtmlContent: false,
}

test('should create empty when no headers.', () => {
  const source = {
    headers: [],
  }
  expect(parseTable(source)).toMatchObject({
    headers: [],
    rows: [],
  })
})

test('with minimum header options.', () => {
  const source = {
    headers: [
      { ...defaultHeader, label: 'ID', source: 'id' },
      { ...defaultHeader, label: 'Description', source: 'note' },
    ],
    rows: [
      { id: 'a', note: 'AAA' },
      { id: 'b', note: 'BBB' },
      { id: 'c', note: 'CCC' },
    ]
  }
  expect(parseTable(source)).toMatchObject({
    headers: [
      { ...defaultHeader, label: 'ID', source: 'id' },
      { ...defaultHeader, label: 'Description', source: 'note' },
    ],
    rows: [
      [{content:'a'}, {content: 'AAA'}],
      [{content:'b'}, {content: 'BBB'}],
      [{content:'c'}, {content: 'CCC'}],
    ],
  })
})

test('should sanitize labels.', () => {
  const source = {
    headers: [
      { ...defaultHeader, label: '<script>alert("a");</script><b>label bold</b>', source: 'col1' },
      { ...defaultHeader, label: '<script>alert("a");</script><b>label bold</b>', source: 'col1', allowHtmlHeader: true },
      { ...defaultHeader, label: '<b>label bold</b><td>td</td>', source: 'col2', allowHtmlHeader: true, allowHtmlContent: true },
    ],
    rows: [
      { col1: '<script>script</script>text', col2: '<b>label bold</b><td>td</td>' }
    ]
  }
  expect(parseTable(source)).toMatchObject({
    headers: [
      // Escaped all html tags.
      { ...defaultHeader, label: '&lt;script&gt;alert("a");&lt;/script&gt;&lt;b&gt;label bold&lt;/b&gt;', source: 'col1'},
      // Remove script tag.
      { ...defaultHeader, label: '<b>label bold</b>', source: 'col1', allowHtmlHeader: true },
      // Remove table related tags but keep contents
      { ...defaultHeader, label: '<b>label bold</b>td', source: 'col2', allowHtmlHeader: true, allowHtmlContent: true },
    ],
    rows: [
      [
        // col1 should be escaped
        {content:'&lt;script&gt;script&lt;/script&gt;text'},
        {content:'&lt;script&gt;script&lt;/script&gt;text'},
        // col2 should be sanitized due to raw:true
        {content:'<b>label bold</b>td'},
      ]
    ],
  })
})

test('should keep line breaks.', () => {
  const source = {
    headers: [
      { ...defaultHeader, label: 'Multiple\nlines', source: 'col1' },
    ],
    rows: [
      { col1: 'multiple\nlines' }
    ]
  }
  expect(parseTable(source)).toMatchObject({
    headers: [
      { ...defaultHeader, label: 'Multiple\nlines', source: 'col1' },
    ],
    rows: [
      [{content:"multiple\nlines"}]
    ],
  })
})

test('should increment autonumber.', () => {
  const source = {
    headers: [
      { ...defaultHeader, type: 'autonumber' },
      { ...defaultHeader, type: 'autonumber', label: 'No', startFrom: 10, align: 'left' },
    ],
    rows: [
      { },
      { },
      { },
    ]
  }
  expect(parseTable(source)).toMatchObject({
    headers: [
      // Should be set default label and startFrom, __autonumber__ should be next count
      { ...defaultHeader, type: 'autonumber', label: '#', startFrom: 1, __autonumber__: 4, align: 'right' },
      // Should be used provided label and startFrom, __autonumber__ should be next count
      { ...defaultHeader, type: 'autonumber', label: 'No', startFrom: 10, __autonumber__: 13, align: 'left' },
    ],
    rows: [
      [{content:"1"}, {content:"10"}],
      [{content:"2"}, {content:"11"}],
      [{content:"3"}, {content:"12"}],
    ],
  })
})
