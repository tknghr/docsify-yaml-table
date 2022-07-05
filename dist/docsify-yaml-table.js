(function () {
  'use strict';

  /*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
  function isNothing(subject) {
    return (typeof subject === 'undefined') || (subject === null);
  }


  function isObject$1(subject) {
    return (typeof subject === 'object') && (subject !== null);
  }


  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;
    else if (isNothing(sequence)) return [];

    return [ sequence ];
  }


  function extend(target, source) {
    var index, length, key, sourceKeys;

    if (source) {
      sourceKeys = Object.keys(source);

      for (index = 0, length = sourceKeys.length; index < length; index += 1) {
        key = sourceKeys[index];
        target[key] = source[key];
      }
    }

    return target;
  }


  function repeat(string, count) {
    var result = '', cycle;

    for (cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }

    return result;
  }


  function isNegativeZero(number) {
    return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
  }


  var isNothing_1      = isNothing;
  var isObject_1       = isObject$1;
  var toArray_1        = toArray;
  var repeat_1         = repeat;
  var isNegativeZero_1 = isNegativeZero;
  var extend_1         = extend;

  var common = {
  	isNothing: isNothing_1,
  	isObject: isObject_1,
  	toArray: toArray_1,
  	repeat: repeat_1,
  	isNegativeZero: isNegativeZero_1,
  	extend: extend_1
  };

  // YAML error class. http://stackoverflow.com/questions/8458984


  function formatError(exception, compact) {
    var where = '', message = exception.reason || '(unknown reason)';

    if (!exception.mark) return message;

    if (exception.mark.name) {
      where += 'in "' + exception.mark.name + '" ';
    }

    where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

    if (!compact && exception.mark.snippet) {
      where += '\n\n' + exception.mark.snippet;
    }

    return message + ' ' + where;
  }


  function YAMLException$1(reason, mark) {
    // Super constructor
    Error.call(this);

    this.name = 'YAMLException';
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false);

    // Include stack trace in error object
    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, this.constructor);
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = (new Error()).stack || '';
    }
  }


  // Inherit from Error
  YAMLException$1.prototype = Object.create(Error.prototype);
  YAMLException$1.prototype.constructor = YAMLException$1;


  YAMLException$1.prototype.toString = function toString(compact) {
    return this.name + ': ' + formatError(this, compact);
  };


  var exception = YAMLException$1;

  // get snippet for a single line, respecting maxLength
  function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
    var head = '';
    var tail = '';
    var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

    if (position - lineStart > maxHalfLength) {
      head = ' ... ';
      lineStart = position - maxHalfLength + head.length;
    }

    if (lineEnd - position > maxHalfLength) {
      tail = ' ...';
      lineEnd = position + maxHalfLength - tail.length;
    }

    return {
      str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
      pos: position - lineStart + head.length // relative position
    };
  }


  function padStart(string, max) {
    return common.repeat(' ', max - string.length) + string;
  }


  function makeSnippet(mark, options) {
    options = Object.create(options || null);

    if (!mark.buffer) return null;

    if (!options.maxLength) options.maxLength = 79;
    if (typeof options.indent      !== 'number') options.indent      = 1;
    if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
    if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

    var re = /\r?\n|\r|\0/g;
    var lineStarts = [ 0 ];
    var lineEnds = [];
    var match;
    var foundLineNo = -1;

    while ((match = re.exec(mark.buffer))) {
      lineEnds.push(match.index);
      lineStarts.push(match.index + match[0].length);

      if (mark.position <= match.index && foundLineNo < 0) {
        foundLineNo = lineStarts.length - 2;
      }
    }

    if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

    var result = '', i, line;
    var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
    var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

    for (i = 1; i <= options.linesBefore; i++) {
      if (foundLineNo - i < 0) break;
      line = getLine(
        mark.buffer,
        lineStarts[foundLineNo - i],
        lineEnds[foundLineNo - i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
        maxLineLength
      );
      result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
        ' | ' + line.str + '\n' + result;
    }

    line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
    result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
    result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

    for (i = 1; i <= options.linesAfter; i++) {
      if (foundLineNo + i >= lineEnds.length) break;
      line = getLine(
        mark.buffer,
        lineStarts[foundLineNo + i],
        lineEnds[foundLineNo + i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
        maxLineLength
      );
      result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
        ' | ' + line.str + '\n';
    }

    return result.replace(/\n$/, '');
  }


  var snippet = makeSnippet;

  var TYPE_CONSTRUCTOR_OPTIONS = [
    'kind',
    'multi',
    'resolve',
    'construct',
    'instanceOf',
    'predicate',
    'represent',
    'representName',
    'defaultStyle',
    'styleAliases'
  ];

  var YAML_NODE_KINDS = [
    'scalar',
    'sequence',
    'mapping'
  ];

  function compileStyleAliases(map) {
    var result = {};

    if (map !== null) {
      Object.keys(map).forEach(function (style) {
        map[style].forEach(function (alias) {
          result[String(alias)] = style;
        });
      });
    }

    return result;
  }

  function Type$1(tag, options) {
    options = options || {};

    Object.keys(options).forEach(function (name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });

    // TODO: Add tag format check.
    this.options       = options; // keep original options in case user wants to extend this type later
    this.tag           = tag;
    this.kind          = options['kind']          || null;
    this.resolve       = options['resolve']       || function () { return true; };
    this.construct     = options['construct']     || function (data) { return data; };
    this.instanceOf    = options['instanceOf']    || null;
    this.predicate     = options['predicate']     || null;
    this.represent     = options['represent']     || null;
    this.representName = options['representName'] || null;
    this.defaultStyle  = options['defaultStyle']  || null;
    this.multi         = options['multi']         || false;
    this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }

  var type = Type$1;

  /*eslint-disable max-len*/





  function compileList(schema, name) {
    var result = [];

    schema[name].forEach(function (currentType) {
      var newIndex = result.length;

      result.forEach(function (previousType, previousIndex) {
        if (previousType.tag === currentType.tag &&
            previousType.kind === currentType.kind &&
            previousType.multi === currentType.multi) {

          newIndex = previousIndex;
        }
      });

      result[newIndex] = currentType;
    });

    return result;
  }


  function compileMap(/* lists... */) {
    var result = {
          scalar: {},
          sequence: {},
          mapping: {},
          fallback: {},
          multi: {
            scalar: [],
            sequence: [],
            mapping: [],
            fallback: []
          }
        }, index, length;

    function collectType(type) {
      if (type.multi) {
        result.multi[type.kind].push(type);
        result.multi['fallback'].push(type);
      } else {
        result[type.kind][type.tag] = result['fallback'][type.tag] = type;
      }
    }

    for (index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }


  function Schema$1(definition) {
    return this.extend(definition);
  }


  Schema$1.prototype.extend = function extend(definition) {
    var implicit = [];
    var explicit = [];

    if (definition instanceof type) {
      // Schema.extend(type)
      explicit.push(definition);

    } else if (Array.isArray(definition)) {
      // Schema.extend([ type1, type2, ... ])
      explicit = explicit.concat(definition);

    } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
      if (definition.implicit) implicit = implicit.concat(definition.implicit);
      if (definition.explicit) explicit = explicit.concat(definition.explicit);

    } else {
      throw new exception('Schema.extend argument should be a Type, [ Type ], ' +
        'or a schema definition ({ implicit: [...], explicit: [...] })');
    }

    implicit.forEach(function (type$1) {
      if (!(type$1 instanceof type)) {
        throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
      }

      if (type$1.loadKind && type$1.loadKind !== 'scalar') {
        throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
      }

      if (type$1.multi) {
        throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
      }
    });

    explicit.forEach(function (type$1) {
      if (!(type$1 instanceof type)) {
        throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
      }
    });

    var result = Object.create(Schema$1.prototype);

    result.implicit = (this.implicit || []).concat(implicit);
    result.explicit = (this.explicit || []).concat(explicit);

    result.compiledImplicit = compileList(result, 'implicit');
    result.compiledExplicit = compileList(result, 'explicit');
    result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

    return result;
  };


  var schema = Schema$1;

  var str = new type('tag:yaml.org,2002:str', {
    kind: 'scalar',
    construct: function (data) { return data !== null ? data : ''; }
  });

  var seq = new type('tag:yaml.org,2002:seq', {
    kind: 'sequence',
    construct: function (data) { return data !== null ? data : []; }
  });

  var map$1 = new type('tag:yaml.org,2002:map', {
    kind: 'mapping',
    construct: function (data) { return data !== null ? data : {}; }
  });

  var failsafe = new schema({
    explicit: [
      str,
      seq,
      map$1
    ]
  });

  function resolveYamlNull(data) {
    if (data === null) return true;

    var max = data.length;

    return (max === 1 && data === '~') ||
           (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
  }

  function constructYamlNull() {
    return null;
  }

  function isNull(object) {
    return object === null;
  }

  var _null = new type('tag:yaml.org,2002:null', {
    kind: 'scalar',
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function () { return '~';    },
      lowercase: function () { return 'null'; },
      uppercase: function () { return 'NULL'; },
      camelcase: function () { return 'Null'; },
      empty:     function () { return '';     }
    },
    defaultStyle: 'lowercase'
  });

  function resolveYamlBoolean(data) {
    if (data === null) return false;

    var max = data.length;

    return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
           (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
  }

  function constructYamlBoolean(data) {
    return data === 'true' ||
           data === 'True' ||
           data === 'TRUE';
  }

  function isBoolean(object) {
    return Object.prototype.toString.call(object) === '[object Boolean]';
  }

  var bool = new type('tag:yaml.org,2002:bool', {
    kind: 'scalar',
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function (object) { return object ? 'true' : 'false'; },
      uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
      camelcase: function (object) { return object ? 'True' : 'False'; }
    },
    defaultStyle: 'lowercase'
  });

  function isHexCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
           ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
           ((0x61/* a */ <= c) && (c <= 0x66/* f */));
  }

  function isOctCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
  }

  function isDecCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
  }

  function resolveYamlInteger(data) {
    if (data === null) return false;

    var max = data.length,
        index = 0,
        hasDigits = false,
        ch;

    if (!max) return false;

    ch = data[index];

    // sign
    if (ch === '-' || ch === '+') {
      ch = data[++index];
    }

    if (ch === '0') {
      // 0
      if (index + 1 === max) return true;
      ch = data[++index];

      // base 2, base 8, base 16

      if (ch === 'b') {
        // base 2
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (ch !== '0' && ch !== '1') return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }


      if (ch === 'x') {
        // base 16
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }


      if (ch === 'o') {
        // base 8
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }
    }

    // base 10 (except 0)

    // value should not start with `_`;
    if (ch === '_') return false;

    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }

    // Should have digits and should not end with `_`
    if (!hasDigits || ch === '_') return false;

    return true;
  }

  function constructYamlInteger(data) {
    var value = data, sign = 1, ch;

    if (value.indexOf('_') !== -1) {
      value = value.replace(/_/g, '');
    }

    ch = value[0];

    if (ch === '-' || ch === '+') {
      if (ch === '-') sign = -1;
      value = value.slice(1);
      ch = value[0];
    }

    if (value === '0') return 0;

    if (ch === '0') {
      if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
      if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
      if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
    }

    return sign * parseInt(value, 10);
  }

  function isInteger(object) {
    return (Object.prototype.toString.call(object)) === '[object Number]' &&
           (object % 1 === 0 && !common.isNegativeZero(object));
  }

  var int$1 = new type('tag:yaml.org,2002:int', {
    kind: 'scalar',
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
      octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
      decimal:     function (obj) { return obj.toString(10); },
      /* eslint-disable max-len */
      hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
    },
    defaultStyle: 'decimal',
    styleAliases: {
      binary:      [ 2,  'bin' ],
      octal:       [ 8,  'oct' ],
      decimal:     [ 10, 'dec' ],
      hexadecimal: [ 16, 'hex' ]
    }
  });

  var YAML_FLOAT_PATTERN = new RegExp(
    // 2.5e4, 2.5 and integers
    '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
    // .2e4, .2
    // special case, seems not from spec
    '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
    // .inf
    '|[-+]?\\.(?:inf|Inf|INF)' +
    // .nan
    '|\\.(?:nan|NaN|NAN))$');

  function resolveYamlFloat(data) {
    if (data === null) return false;

    if (!YAML_FLOAT_PATTERN.test(data) ||
        // Quick hack to not allow integers end with `_`
        // Probably should update regexp & check speed
        data[data.length - 1] === '_') {
      return false;
    }

    return true;
  }

  function constructYamlFloat(data) {
    var value, sign;

    value  = data.replace(/_/g, '').toLowerCase();
    sign   = value[0] === '-' ? -1 : 1;

    if ('+-'.indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }

    if (value === '.inf') {
      return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

    } else if (value === '.nan') {
      return NaN;
    }
    return sign * parseFloat(value, 10);
  }


  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

  function representYamlFloat(object, style) {
    var res;

    if (isNaN(object)) {
      switch (style) {
        case 'lowercase': return '.nan';
        case 'uppercase': return '.NAN';
        case 'camelcase': return '.NaN';
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase': return '.inf';
        case 'uppercase': return '.INF';
        case 'camelcase': return '.Inf';
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase': return '-.inf';
        case 'uppercase': return '-.INF';
        case 'camelcase': return '-.Inf';
      }
    } else if (common.isNegativeZero(object)) {
      return '-0.0';
    }

    res = object.toString(10);

    // JS stringifier can build scientific format without dots: 5e-100,
    // while YAML requres dot: 5.e-100. Fix it with simple hack

    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
  }

  function isFloat(object) {
    return (Object.prototype.toString.call(object) === '[object Number]') &&
           (object % 1 !== 0 || common.isNegativeZero(object));
  }

  var float = new type('tag:yaml.org,2002:float', {
    kind: 'scalar',
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: 'lowercase'
  });

  var json = failsafe.extend({
    implicit: [
      _null,
      bool,
      int$1,
      float
    ]
  });

  var core = json;

  var YAML_DATE_REGEXP = new RegExp(
    '^([0-9][0-9][0-9][0-9])'          + // [1] year
    '-([0-9][0-9])'                    + // [2] month
    '-([0-9][0-9])$');                   // [3] day

  var YAML_TIMESTAMP_REGEXP = new RegExp(
    '^([0-9][0-9][0-9][0-9])'          + // [1] year
    '-([0-9][0-9]?)'                   + // [2] month
    '-([0-9][0-9]?)'                   + // [3] day
    '(?:[Tt]|[ \\t]+)'                 + // ...
    '([0-9][0-9]?)'                    + // [4] hour
    ':([0-9][0-9])'                    + // [5] minute
    ':([0-9][0-9])'                    + // [6] second
    '(?:\\.([0-9]*))?'                 + // [7] fraction
    '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
    '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }

  function constructYamlTimestamp(data) {
    var match, year, month, day, hour, minute, second, fraction = 0,
        delta = null, tz_hour, tz_minute, date;

    match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

    if (match === null) throw new Error('Date resolve error');

    // match: [1] year [2] month [3] day

    year = +(match[1]);
    month = +(match[2]) - 1; // JS month starts with 0
    day = +(match[3]);

    if (!match[4]) { // no hour
      return new Date(Date.UTC(year, month, day));
    }

    // match: [4] hour [5] minute [6] second [7] fraction

    hour = +(match[4]);
    minute = +(match[5]);
    second = +(match[6]);

    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3) { // milli-seconds
        fraction += '0';
      }
      fraction = +fraction;
    }

    // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

    if (match[9]) {
      tz_hour = +(match[10]);
      tz_minute = +(match[11] || 0);
      delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
      if (match[9] === '-') delta = -delta;
    }

    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

    if (delta) date.setTime(date.getTime() - delta);

    return date;
  }

  function representYamlTimestamp(object /*, style*/) {
    return object.toISOString();
  }

  var timestamp = new type('tag:yaml.org,2002:timestamp', {
    kind: 'scalar',
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });

  function resolveYamlMerge(data) {
    return data === '<<' || data === null;
  }

  var merge = new type('tag:yaml.org,2002:merge', {
    kind: 'scalar',
    resolve: resolveYamlMerge
  });

  /*eslint-disable no-bitwise*/





  // [ 64, 65, 66 ] -> [ padding, CR, LF ]
  var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


  function resolveYamlBinary(data) {
    if (data === null) return false;

    var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

    // Convert one by one.
    for (idx = 0; idx < max; idx++) {
      code = map.indexOf(data.charAt(idx));

      // Skip CR/LF
      if (code > 64) continue;

      // Fail on illegal characters
      if (code < 0) return false;

      bitlen += 6;
    }

    // If there are any bits left, source was corrupted
    return (bitlen % 8) === 0;
  }

  function constructYamlBinary(data) {
    var idx, tailbits,
        input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
        max = input.length,
        map = BASE64_MAP,
        bits = 0,
        result = [];

    // Collect by 6*4 bits (3 bytes)

    for (idx = 0; idx < max; idx++) {
      if ((idx % 4 === 0) && idx) {
        result.push((bits >> 16) & 0xFF);
        result.push((bits >> 8) & 0xFF);
        result.push(bits & 0xFF);
      }

      bits = (bits << 6) | map.indexOf(input.charAt(idx));
    }

    // Dump tail

    tailbits = (max % 4) * 6;

    if (tailbits === 0) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    } else if (tailbits === 18) {
      result.push((bits >> 10) & 0xFF);
      result.push((bits >> 2) & 0xFF);
    } else if (tailbits === 12) {
      result.push((bits >> 4) & 0xFF);
    }

    return new Uint8Array(result);
  }

  function representYamlBinary(object /*, style*/) {
    var result = '', bits = 0, idx, tail,
        max = object.length,
        map = BASE64_MAP;

    // Convert every three bytes to 4 ASCII characters.

    for (idx = 0; idx < max; idx++) {
      if ((idx % 3 === 0) && idx) {
        result += map[(bits >> 18) & 0x3F];
        result += map[(bits >> 12) & 0x3F];
        result += map[(bits >> 6) & 0x3F];
        result += map[bits & 0x3F];
      }

      bits = (bits << 8) + object[idx];
    }

    // Dump tail

    tail = max % 3;

    if (tail === 0) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    } else if (tail === 2) {
      result += map[(bits >> 10) & 0x3F];
      result += map[(bits >> 4) & 0x3F];
      result += map[(bits << 2) & 0x3F];
      result += map[64];
    } else if (tail === 1) {
      result += map[(bits >> 2) & 0x3F];
      result += map[(bits << 4) & 0x3F];
      result += map[64];
      result += map[64];
    }

    return result;
  }

  function isBinary(obj) {
    return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
  }

  var binary = new type('tag:yaml.org,2002:binary', {
    kind: 'scalar',
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });

  var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
  var _toString$2       = Object.prototype.toString;

  function resolveYamlOmap(data) {
    if (data === null) return true;

    var objectKeys = [], index, length, pair, pairKey, pairHasKey,
        object = data;

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      pairHasKey = false;

      if (_toString$2.call(pair) !== '[object Object]') return false;

      for (pairKey in pair) {
        if (_hasOwnProperty$3.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;
          else return false;
        }
      }

      if (!pairHasKey) return false;

      if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
      else return false;
    }

    return true;
  }

  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }

  var omap = new type('tag:yaml.org,2002:omap', {
    kind: 'sequence',
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });

  var _toString$1 = Object.prototype.toString;

  function resolveYamlPairs(data) {
    if (data === null) return true;

    var index, length, pair, keys, result,
        object = data;

    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];

      if (_toString$1.call(pair) !== '[object Object]') return false;

      keys = Object.keys(pair);

      if (keys.length !== 1) return false;

      result[index] = [ keys[0], pair[keys[0]] ];
    }

    return true;
  }

  function constructYamlPairs(data) {
    if (data === null) return [];

    var index, length, pair, keys, result,
        object = data;

    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];

      keys = Object.keys(pair);

      result[index] = [ keys[0], pair[keys[0]] ];
    }

    return result;
  }

  var pairs = new type('tag:yaml.org,2002:pairs', {
    kind: 'sequence',
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });

  var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

  function resolveYamlSet(data) {
    if (data === null) return true;

    var key, object = data;

    for (key in object) {
      if (_hasOwnProperty$2.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }

    return true;
  }

  function constructYamlSet(data) {
    return data !== null ? data : {};
  }

  var set = new type('tag:yaml.org,2002:set', {
    kind: 'mapping',
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });

  var _default = core.extend({
    implicit: [
      timestamp,
      merge
    ],
    explicit: [
      binary,
      omap,
      pairs,
      set
    ]
  });

  /*eslint-disable max-len,no-use-before-define*/







  var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;


  var CONTEXT_FLOW_IN   = 1;
  var CONTEXT_FLOW_OUT  = 2;
  var CONTEXT_BLOCK_IN  = 3;
  var CONTEXT_BLOCK_OUT = 4;


  var CHOMPING_CLIP  = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP  = 3;


  var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


  function _class(obj) { return Object.prototype.toString.call(obj); }

  function is_EOL(c) {
    return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
  }

  function is_WHITE_SPACE(c) {
    return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
  }

  function is_WS_OR_EOL(c) {
    return (c === 0x09/* Tab */) ||
           (c === 0x20/* Space */) ||
           (c === 0x0A/* LF */) ||
           (c === 0x0D/* CR */);
  }

  function is_FLOW_INDICATOR(c) {
    return c === 0x2C/* , */ ||
           c === 0x5B/* [ */ ||
           c === 0x5D/* ] */ ||
           c === 0x7B/* { */ ||
           c === 0x7D/* } */;
  }

  function fromHexCode(c) {
    var lc;

    if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
      return c - 0x30;
    }

    /*eslint-disable no-bitwise*/
    lc = c | 0x20;

    if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
      return lc - 0x61 + 10;
    }

    return -1;
  }

  function escapedHexLen(c) {
    if (c === 0x78/* x */) { return 2; }
    if (c === 0x75/* u */) { return 4; }
    if (c === 0x55/* U */) { return 8; }
    return 0;
  }

  function fromDecimalCode(c) {
    if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
      return c - 0x30;
    }

    return -1;
  }

  function simpleEscapeSequence(c) {
    /* eslint-disable indent */
    return (c === 0x30/* 0 */) ? '\x00' :
          (c === 0x61/* a */) ? '\x07' :
          (c === 0x62/* b */) ? '\x08' :
          (c === 0x74/* t */) ? '\x09' :
          (c === 0x09/* Tab */) ? '\x09' :
          (c === 0x6E/* n */) ? '\x0A' :
          (c === 0x76/* v */) ? '\x0B' :
          (c === 0x66/* f */) ? '\x0C' :
          (c === 0x72/* r */) ? '\x0D' :
          (c === 0x65/* e */) ? '\x1B' :
          (c === 0x20/* Space */) ? ' ' :
          (c === 0x22/* " */) ? '\x22' :
          (c === 0x2F/* / */) ? '/' :
          (c === 0x5C/* \ */) ? '\x5C' :
          (c === 0x4E/* N */) ? '\x85' :
          (c === 0x5F/* _ */) ? '\xA0' :
          (c === 0x4C/* L */) ? '\u2028' :
          (c === 0x50/* P */) ? '\u2029' : '';
  }

  function charFromCodepoint(c) {
    if (c <= 0xFFFF) {
      return String.fromCharCode(c);
    }
    // Encode UTF-16 surrogate pair
    // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
    return String.fromCharCode(
      ((c - 0x010000) >> 10) + 0xD800,
      ((c - 0x010000) & 0x03FF) + 0xDC00
    );
  }

  var simpleEscapeCheck = new Array(256); // integer, for fast access
  var simpleEscapeMap = new Array(256);
  for (var i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }


  function State$1(input, options) {
    this.input = input;

    this.filename  = options['filename']  || null;
    this.schema    = options['schema']    || _default;
    this.onWarning = options['onWarning'] || null;
    // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
    // if such documents have no explicit %YAML directive
    this.legacy    = options['legacy']    || false;

    this.json      = options['json']      || false;
    this.listener  = options['listener']  || null;

    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap       = this.schema.compiledTypeMap;

    this.length     = input.length;
    this.position   = 0;
    this.line       = 0;
    this.lineStart  = 0;
    this.lineIndent = 0;

    // position of first leading tab in the current line,
    // used to make sure there are no tabs in the indentation
    this.firstTabInLine = -1;

    this.documents = [];

    /*
    this.version;
    this.checkLineBreaks;
    this.tagMap;
    this.anchorMap;
    this.tag;
    this.anchor;
    this.kind;
    this.result;*/

  }


  function generateError(state, message) {
    var mark = {
      name:     state.filename,
      buffer:   state.input.slice(0, -1), // omit trailing \0
      position: state.position,
      line:     state.line,
      column:   state.position - state.lineStart
    };

    mark.snippet = snippet(mark);

    return new exception(message, mark);
  }

  function throwError(state, message) {
    throw generateError(state, message);
  }

  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }


  var directiveHandlers = {

    YAML: function handleYamlDirective(state, name, args) {

      var match, major, minor;

      if (state.version !== null) {
        throwError(state, 'duplication of %YAML directive');
      }

      if (args.length !== 1) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }

      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

      if (match === null) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }

      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);

      if (major !== 1) {
        throwError(state, 'unacceptable YAML version of the document');
      }

      state.version = args[0];
      state.checkLineBreaks = (minor < 2);

      if (minor !== 1 && minor !== 2) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },

    TAG: function handleTagDirective(state, name, args) {

      var handle, prefix;

      if (args.length !== 2) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }

      handle = args[0];
      prefix = args[1];

      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }

      if (_hasOwnProperty$1.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }

      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }

      try {
        prefix = decodeURIComponent(prefix);
      } catch (err) {
        throwError(state, 'tag prefix is malformed: ' + prefix);
      }

      state.tagMap[handle] = prefix;
    }
  };


  function captureSegment(state, start, end, checkJson) {
    var _position, _length, _character, _result;

    if (start < end) {
      _result = state.input.slice(start, end);

      if (checkJson) {
        for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
          _character = _result.charCodeAt(_position);
          if (!(_character === 0x09 ||
                (0x20 <= _character && _character <= 0x10FFFF))) {
            throwError(state, 'expected valid JSON character');
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, 'the stream contains non-printable characters');
      }

      state.result += _result;
    }
  }

  function mergeMappings(state, destination, source, overridableKeys) {
    var sourceKeys, key, index, quantity;

    if (!common.isObject(source)) {
      throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
    }

    sourceKeys = Object.keys(source);

    for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      key = sourceKeys[index];

      if (!_hasOwnProperty$1.call(destination, key)) {
        destination[key] = source[key];
        overridableKeys[key] = true;
      }
    }
  }

  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
    startLine, startLineStart, startPos) {

    var index, quantity;

    // The output is a plain object here, so keys can only be strings.
    // We need to convert keyNode to a string, but doing so can hang the process
    // (deeply nested arrays that explode exponentially using aliases).
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);

      for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, 'nested arrays are not supported inside keys');
        }

        if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
          keyNode[index] = '[object Object]';
        }
      }
    }

    // Avoid code execution in load() via toString property
    // (still use its own toString for arrays, timestamps,
    // and whatever user schema extensions happen to have @@toStringTag)
    if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
      keyNode = '[object Object]';
    }


    keyNode = String(keyNode);

    if (_result === null) {
      _result = {};
    }

    if (keyTag === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json &&
          !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
          _hasOwnProperty$1.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.lineStart = startLineStart || state.lineStart;
        state.position = startPos || state.position;
        throwError(state, 'duplicated mapping key');
      }

      // used for this specific key only because Object.defineProperty is slow
      if (keyNode === '__proto__') {
        Object.defineProperty(_result, keyNode, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: valueNode
        });
      } else {
        _result[keyNode] = valueNode;
      }
      delete overridableKeys[keyNode];
    }

    return _result;
  }

  function readLineBreak(state) {
    var ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x0A/* LF */) {
      state.position++;
    } else if (ch === 0x0D/* CR */) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
        state.position++;
      }
    } else {
      throwError(state, 'a line break is expected');
    }

    state.line += 1;
    state.lineStart = state.position;
    state.firstTabInLine = -1;
  }

  function skipSeparationSpace(state, allowComments, checkIndent) {
    var lineBreaks = 0,
        ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
          state.firstTabInLine = state.position;
        }
        ch = state.input.charCodeAt(++state.position);
      }

      if (allowComments && ch === 0x23/* # */) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
      }

      if (is_EOL(ch)) {
        readLineBreak(state);

        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;

        while (ch === 0x20/* Space */) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }

    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, 'deficient indentation');
    }

    return lineBreaks;
  }

  function testDocumentSeparator(state) {
    var _position = state.position,
        ch;

    ch = state.input.charCodeAt(_position);

    // Condition state.position === state.lineStart is tested
    // in parent on each call, for efficiency. No needs to test here again.
    if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
        ch === state.input.charCodeAt(_position + 1) &&
        ch === state.input.charCodeAt(_position + 2)) {

      _position += 3;

      ch = state.input.charCodeAt(_position);

      if (ch === 0 || is_WS_OR_EOL(ch)) {
        return true;
      }
    }

    return false;
  }

  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += ' ';
    } else if (count > 1) {
      state.result += common.repeat('\n', count - 1);
    }
  }


  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    var preceding,
        following,
        captureStart,
        captureEnd,
        hasPendingContent,
        _line,
        _lineStart,
        _lineIndent,
        _kind = state.kind,
        _result = state.result,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (is_WS_OR_EOL(ch)      ||
        is_FLOW_INDICATOR(ch) ||
        ch === 0x23/* # */    ||
        ch === 0x26/* & */    ||
        ch === 0x2A/* * */    ||
        ch === 0x21/* ! */    ||
        ch === 0x7C/* | */    ||
        ch === 0x3E/* > */    ||
        ch === 0x27/* ' */    ||
        ch === 0x22/* " */    ||
        ch === 0x25/* % */    ||
        ch === 0x40/* @ */    ||
        ch === 0x60/* ` */) {
      return false;
    }

    if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        return false;
      }
    }

    state.kind = 'scalar';
    state.result = '';
    captureStart = captureEnd = state.position;
    hasPendingContent = false;

    while (ch !== 0) {
      if (ch === 0x3A/* : */) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following) ||
            withinFlowCollection && is_FLOW_INDICATOR(following)) {
          break;
        }

      } else if (ch === 0x23/* # */) {
        preceding = state.input.charCodeAt(state.position - 1);

        if (is_WS_OR_EOL(preceding)) {
          break;
        }

      } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
                 withinFlowCollection && is_FLOW_INDICATOR(ch)) {
        break;

      } else if (is_EOL(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);

        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }

      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }

      if (!is_WHITE_SPACE(ch)) {
        captureEnd = state.position + 1;
      }

      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, captureEnd, false);

    if (state.result) {
      return true;
    }

    state.kind = _kind;
    state.result = _result;
    return false;
  }

  function readSingleQuotedScalar(state, nodeIndent) {
    var ch,
        captureStart, captureEnd;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x27/* ' */) {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x27/* ' */) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (ch === 0x27/* ' */) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }

      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;

      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a single quoted scalar');

      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a single quoted scalar');
  }

  function readDoubleQuotedScalar(state, nodeIndent) {
    var captureStart,
        captureEnd,
        hexLength,
        hexResult,
        tmp,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x22/* " */) {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x22/* " */) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;

      } else if (ch === 0x5C/* \ */) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (is_EOL(ch)) {
          skipSeparationSpace(state, false, nodeIndent);

          // TODO: rework to inline fn with no type cast?
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;

        } else if ((tmp = escapedHexLen(ch)) > 0) {
          hexLength = tmp;
          hexResult = 0;

          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);

            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;

            } else {
              throwError(state, 'expected hexadecimal character');
            }
          }

          state.result += charFromCodepoint(hexResult);

          state.position++;

        } else {
          throwError(state, 'unknown escape sequence');
        }

        captureStart = captureEnd = state.position;

      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;

      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a double quoted scalar');

      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a double quoted scalar');
  }

  function readFlowCollection(state, nodeIndent) {
    var readNext = true,
        _line,
        _lineStart,
        _pos,
        _tag     = state.tag,
        _result,
        _anchor  = state.anchor,
        following,
        terminator,
        isPair,
        isExplicitPair,
        isMapping,
        overridableKeys = Object.create(null),
        keyNode,
        keyTag,
        valueNode,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x5B/* [ */) {
      terminator = 0x5D;/* ] */
      isMapping = false;
      _result = [];
    } else if (ch === 0x7B/* { */) {
      terminator = 0x7D;/* } */
      isMapping = true;
      _result = {};
    } else {
      return false;
    }

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(++state.position);

    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? 'mapping' : 'sequence';
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, 'missed comma between flow collection entries');
      } else if (ch === 0x2C/* , */) {
        // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
        throwError(state, "expected the node content, but found ','");
      }

      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;

      if (ch === 0x3F/* ? */) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }

      _line = state.line; // Save the current line.
      _lineStart = state.lineStart;
      _pos = state.position;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }

      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
      } else {
        _result.push(keyNode);
      }

      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if (ch === 0x2C/* , */) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }

    throwError(state, 'unexpected end of the stream within a flow collection');
  }

  function readBlockScalar(state, nodeIndent) {
    var captureStart,
        folding,
        chomping       = CHOMPING_CLIP,
        didReadContent = false,
        detectedIndent = false,
        textIndent     = nodeIndent,
        emptyLines     = 0,
        atMoreIndented = false,
        tmp,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x7C/* | */) {
      folding = false;
    } else if (ch === 0x3E/* > */) {
      folding = true;
    } else {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';

    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
        if (CHOMPING_CLIP === chomping) {
          chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, 'repeat of a chomping mode identifier');
        }

      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, 'repeat of an indentation width identifier');
        }

      } else {
        break;
      }
    }

    if (is_WHITE_SPACE(ch)) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (is_WHITE_SPACE(ch));

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (!is_EOL(ch) && (ch !== 0));
      }
    }

    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;

      ch = state.input.charCodeAt(state.position);

      while ((!detectedIndent || state.lineIndent < textIndent) &&
             (ch === 0x20/* Space */)) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }

      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }

      if (is_EOL(ch)) {
        emptyLines++;
        continue;
      }

      // End of the scalar.
      if (state.lineIndent < textIndent) {

        // Perform the chomping.
        if (chomping === CHOMPING_KEEP) {
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) { // i.e. only if the scalar is not empty.
            state.result += '\n';
          }
        }

        // Break this `while` cycle and go to the funciton's epilogue.
        break;
      }

      // Folded style: use fancy rules to handle line breaks.
      if (folding) {

        // Lines starting with white space characters (more-indented lines) are not folded.
        if (is_WHITE_SPACE(ch)) {
          atMoreIndented = true;
          // except for the first content line (cf. Example 8.1)
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

        // End of more-indented block.
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common.repeat('\n', emptyLines + 1);

        // Just one line break - perceive as the same line.
        } else if (emptyLines === 0) {
          if (didReadContent) { // i.e. only if we have already read some scalar content.
            state.result += ' ';
          }

        // Several line breaks - perceive as different lines.
        } else {
          state.result += common.repeat('\n', emptyLines);
        }

      // Literal style: just add exact number of line breaks between content lines.
      } else {
        // Keep all line breaks except the header line break.
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      }

      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      captureStart = state.position;

      while (!is_EOL(ch) && (ch !== 0)) {
        ch = state.input.charCodeAt(++state.position);
      }

      captureSegment(state, captureStart, state.position, false);
    }

    return true;
  }

  function readBlockSequence(state, nodeIndent) {
    var _line,
        _tag      = state.tag,
        _anchor   = state.anchor,
        _result   = [],
        following,
        detected  = false,
        ch;

    // there is a leading tab before this token, so it can't be a block sequence/mapping;
    // it can still be flow sequence/mapping or a scalar
    if (state.firstTabInLine !== -1) return false;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      if (state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, 'tab characters must not be used in indentation');
      }

      if (ch !== 0x2D/* - */) {
        break;
      }

      following = state.input.charCodeAt(state.position + 1);

      if (!is_WS_OR_EOL(following)) {
        break;
      }

      detected = true;
      state.position++;

      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }

      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);

      ch = state.input.charCodeAt(state.position);

      if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
        throwError(state, 'bad indentation of a sequence entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }

    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'sequence';
      state.result = _result;
      return true;
    }
    return false;
  }

  function readBlockMapping(state, nodeIndent, flowIndent) {
    var following,
        allowCompact,
        _line,
        _keyLine,
        _keyLineStart,
        _keyPos,
        _tag          = state.tag,
        _anchor       = state.anchor,
        _result       = {},
        overridableKeys = Object.create(null),
        keyTag        = null,
        keyNode       = null,
        valueNode     = null,
        atExplicitKey = false,
        detected      = false,
        ch;

    // there is a leading tab before this token, so it can't be a block sequence/mapping;
    // it can still be flow sequence/mapping or a scalar
    if (state.firstTabInLine !== -1) return false;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      if (!atExplicitKey && state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, 'tab characters must not be used in indentation');
      }

      following = state.input.charCodeAt(state.position + 1);
      _line = state.line; // Save the current line.

      //
      // Explicit notation case. There are two separate blocks:
      // first for the key (denoted by "?") and second for the value (denoted by ":")
      //
      if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

        if (ch === 0x3F/* ? */) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = true;
          allowCompact = true;

        } else if (atExplicitKey) {
          // i.e. 0x3A/* : */ === character after the explicit key.
          atExplicitKey = false;
          allowCompact = true;

        } else {
          throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
        }

        state.position += 1;
        ch = following;

      //
      // Implicit notation case. Flow-style node as the key first, then ":", and the value.
      //
      } else {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;

        if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          // Neither implicit nor explicit notation.
          // Reading is done. Go to the epilogue.
          break;
        }

        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);

          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }

          if (ch === 0x3A/* : */) {
            ch = state.input.charCodeAt(++state.position);

            if (!is_WS_OR_EOL(ch)) {
              throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
            }

            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }

            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;

          } else if (detected) {
            throwError(state, 'can not read an implicit mapping pair; a colon is missed');

          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true; // Keep the result of `composeNode`.
          }

        } else if (detected) {
          throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }
      }

      //
      // Common reading code for both explicit and implicit notations.
      //
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (atExplicitKey) {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
        }

        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }

        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }

      if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
        throwError(state, 'bad indentation of a mapping entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }

    //
    // Epilogue.
    //

    // Special case: last mapping's node contains only the key in explicit notation.
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
    }

    // Expose the resulting mapping.
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'mapping';
      state.result = _result;
    }

    return detected;
  }

  function readTagProperty(state) {
    var _position,
        isVerbatim = false,
        isNamed    = false,
        tagHandle,
        tagName,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x21/* ! */) return false;

    if (state.tag !== null) {
      throwError(state, 'duplication of a tag property');
    }

    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x3C/* < */) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);

    } else if (ch === 0x21/* ! */) {
      isNamed = true;
      tagHandle = '!!';
      ch = state.input.charCodeAt(++state.position);

    } else {
      tagHandle = '!';
    }

    _position = state.position;

    if (isVerbatim) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (ch !== 0 && ch !== 0x3E/* > */);

      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, 'unexpected end of the stream within a verbatim tag');
      }
    } else {
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {

        if (ch === 0x21/* ! */) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);

            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, 'named tag handle cannot contain such characters');
            }

            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, 'tag suffix cannot contain exclamation marks');
          }
        }

        ch = state.input.charCodeAt(++state.position);
      }

      tagName = state.input.slice(_position, state.position);

      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, 'tag suffix cannot contain flow indicator characters');
      }
    }

    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, 'tag name cannot contain such characters: ' + tagName);
    }

    try {
      tagName = decodeURIComponent(tagName);
    } catch (err) {
      throwError(state, 'tag name is malformed: ' + tagName);
    }

    if (isVerbatim) {
      state.tag = tagName;

    } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;

    } else if (tagHandle === '!') {
      state.tag = '!' + tagName;

    } else if (tagHandle === '!!') {
      state.tag = 'tag:yaml.org,2002:' + tagName;

    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }

    return true;
  }

  function readAnchorProperty(state) {
    var _position,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x26/* & */) return false;

    if (state.anchor !== null) {
      throwError(state, 'duplication of an anchor property');
    }

    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an anchor node must contain at least one character');
    }

    state.anchor = state.input.slice(_position, state.position);
    return true;
  }

  function readAlias(state) {
    var _position, alias,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x2A/* * */) return false;

    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an alias node must contain at least one character');
    }

    alias = state.input.slice(_position, state.position);

    if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }

    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }

  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    var allowBlockStyles,
        allowBlockScalars,
        allowBlockCollections,
        indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
        atNewLine  = false,
        hasContent = false,
        typeIndex,
        typeQuantity,
        typeList,
        type,
        flowIndent,
        blockIndent;

    if (state.listener !== null) {
      state.listener('open', state);
    }

    state.tag    = null;
    state.anchor = null;
    state.kind   = null;
    state.result = null;

    allowBlockStyles = allowBlockScalars = allowBlockCollections =
      CONTEXT_BLOCK_OUT === nodeContext ||
      CONTEXT_BLOCK_IN  === nodeContext;

    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }

    if (indentStatus === 1) {
      while (readTagProperty(state) || readAnchorProperty(state)) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;

          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }

    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }

    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }

      blockIndent = state.position - state.lineStart;

      if (indentStatus === 1) {
        if (allowBlockCollections &&
            (readBlockSequence(state, blockIndent) ||
             readBlockMapping(state, blockIndent, flowIndent)) ||
            readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
              readSingleQuotedScalar(state, flowIndent) ||
              readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;

          } else if (readAlias(state)) {
            hasContent = true;

            if (state.tag !== null || state.anchor !== null) {
              throwError(state, 'alias node should not have any properties');
            }

          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;

            if (state.tag === null) {
              state.tag = '?';
            }
          }

          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else if (indentStatus === 0) {
        // Special case: block sequences are allowed to have same indentation level as the parent.
        // http://www.yaml.org/spec/1.2/spec.html#id2799784
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }

    if (state.tag === null) {
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }

    } else if (state.tag === '?') {
      // Implicit resolving is not allowed for non-scalar types, and '?'
      // non-specific tag is only automatically assigned to plain scalars.
      //
      // We only need to check kind conformity in case user explicitly assigns '?'
      // tag, for example like this: "!<?> [0]"
      //
      if (state.result !== null && state.kind !== 'scalar') {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }

      for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
          break;
        }
      }
    } else if (state.tag !== '!') {
      if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
        type = state.typeMap[state.kind || 'fallback'][state.tag];
      } else {
        // looking for multi type
        type = null;
        typeList = state.typeMap.multi[state.kind || 'fallback'];

        for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
          if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
            type = typeList[typeIndex];
            break;
          }
        }
      }

      if (!type) {
        throwError(state, 'unknown tag !<' + state.tag + '>');
      }

      if (state.result !== null && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result, state.tag);
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    }

    if (state.listener !== null) {
      state.listener('close', state);
    }
    return state.tag !== null ||  state.anchor !== null || hasContent;
  }

  function readDocument(state) {
    var documentStart = state.position,
        _position,
        directiveName,
        directiveArgs,
        hasDirectives = false,
        ch;

    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = Object.create(null);
    state.anchorMap = Object.create(null);

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);

      ch = state.input.charCodeAt(state.position);

      if (state.lineIndent > 0 || ch !== 0x25/* % */) {
        break;
      }

      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveName = state.input.slice(_position, state.position);
      directiveArgs = [];

      if (directiveName.length < 1) {
        throwError(state, 'directive name must not be less than one character in length');
      }

      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x23/* # */) {
          do { ch = state.input.charCodeAt(++state.position); }
          while (ch !== 0 && !is_EOL(ch));
          break;
        }

        if (is_EOL(ch)) break;

        _position = state.position;

        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        directiveArgs.push(state.input.slice(_position, state.position));
      }

      if (ch !== 0) readLineBreak(state);

      if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }

    skipSeparationSpace(state, true, -1);

    if (state.lineIndent === 0 &&
        state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
        state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
        state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);

    } else if (hasDirectives) {
      throwError(state, 'directives end mark is expected');
    }

    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);

    if (state.checkLineBreaks &&
        PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, 'non-ASCII line breaks are interpreted as content');
    }

    state.documents.push(state.result);

    if (state.position === state.lineStart && testDocumentSeparator(state)) {

      if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }

    if (state.position < (state.length - 1)) {
      throwError(state, 'end of the stream or a document separator is expected');
    } else {
      return;
    }
  }


  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};

    if (input.length !== 0) {

      // Add tailing `\n` if not exists
      if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
          input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
        input += '\n';
      }

      // Strip BOM
      if (input.charCodeAt(0) === 0xFEFF) {
        input = input.slice(1);
      }
    }

    var state = new State$1(input, options);

    var nullpos = input.indexOf('\0');

    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, 'null byte is not allowed in input');
    }

    // Use 0 as string terminator. That significantly simplifies bounds check.
    state.input += '\0';

    while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
      state.lineIndent += 1;
      state.position += 1;
    }

    while (state.position < (state.length - 1)) {
      readDocument(state);
    }

    return state.documents;
  }


  function loadAll$1(input, iterator, options) {
    if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
      options = iterator;
      iterator = null;
    }

    var documents = loadDocuments(input, options);

    if (typeof iterator !== 'function') {
      return documents;
    }

    for (var index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }


  function load$1(input, options) {
    var documents = loadDocuments(input, options);

    if (documents.length === 0) {
      /*eslint-disable no-undefined*/
      return undefined;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new exception('expected a single document in the stream, but found more');
  }


  var loadAll_1 = loadAll$1;
  var load_1    = load$1;

  var loader = {
  	loadAll: loadAll_1,
  	load: load_1
  };

  /*eslint-disable no-use-before-define*/





  var _toString       = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;

  var CHAR_BOM                  = 0xFEFF;
  var CHAR_TAB                  = 0x09; /* Tab */
  var CHAR_LINE_FEED            = 0x0A; /* LF */
  var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
  var CHAR_SPACE                = 0x20; /* Space */
  var CHAR_EXCLAMATION          = 0x21; /* ! */
  var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
  var CHAR_SHARP                = 0x23; /* # */
  var CHAR_PERCENT              = 0x25; /* % */
  var CHAR_AMPERSAND            = 0x26; /* & */
  var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
  var CHAR_ASTERISK             = 0x2A; /* * */
  var CHAR_COMMA                = 0x2C; /* , */
  var CHAR_MINUS                = 0x2D; /* - */
  var CHAR_COLON                = 0x3A; /* : */
  var CHAR_EQUALS               = 0x3D; /* = */
  var CHAR_GREATER_THAN         = 0x3E; /* > */
  var CHAR_QUESTION             = 0x3F; /* ? */
  var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
  var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
  var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
  var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
  var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
  var CHAR_VERTICAL_LINE        = 0x7C; /* | */
  var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

  var ESCAPE_SEQUENCES = {};

  ESCAPE_SEQUENCES[0x00]   = '\\0';
  ESCAPE_SEQUENCES[0x07]   = '\\a';
  ESCAPE_SEQUENCES[0x08]   = '\\b';
  ESCAPE_SEQUENCES[0x09]   = '\\t';
  ESCAPE_SEQUENCES[0x0A]   = '\\n';
  ESCAPE_SEQUENCES[0x0B]   = '\\v';
  ESCAPE_SEQUENCES[0x0C]   = '\\f';
  ESCAPE_SEQUENCES[0x0D]   = '\\r';
  ESCAPE_SEQUENCES[0x1B]   = '\\e';
  ESCAPE_SEQUENCES[0x22]   = '\\"';
  ESCAPE_SEQUENCES[0x5C]   = '\\\\';
  ESCAPE_SEQUENCES[0x85]   = '\\N';
  ESCAPE_SEQUENCES[0xA0]   = '\\_';
  ESCAPE_SEQUENCES[0x2028] = '\\L';
  ESCAPE_SEQUENCES[0x2029] = '\\P';

  var DEPRECATED_BOOLEANS_SYNTAX = [
    'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
    'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
  ];

  var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

  function compileStyleMap(schema, map) {
    var result, keys, index, length, tag, style, type;

    if (map === null) return {};

    result = {};
    keys = Object.keys(map);

    for (index = 0, length = keys.length; index < length; index += 1) {
      tag = keys[index];
      style = String(map[tag]);

      if (tag.slice(0, 2) === '!!') {
        tag = 'tag:yaml.org,2002:' + tag.slice(2);
      }
      type = schema.compiledTypeMap['fallback'][tag];

      if (type && _hasOwnProperty.call(type.styleAliases, style)) {
        style = type.styleAliases[style];
      }

      result[tag] = style;
    }

    return result;
  }

  function encodeHex(character) {
    var string, handle, length;

    string = character.toString(16).toUpperCase();

    if (character <= 0xFF) {
      handle = 'x';
      length = 2;
    } else if (character <= 0xFFFF) {
      handle = 'u';
      length = 4;
    } else if (character <= 0xFFFFFFFF) {
      handle = 'U';
      length = 8;
    } else {
      throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
    }

    return '\\' + handle + common.repeat('0', length - string.length) + string;
  }


  var QUOTING_TYPE_SINGLE = 1,
      QUOTING_TYPE_DOUBLE = 2;

  function State(options) {
    this.schema        = options['schema'] || _default;
    this.indent        = Math.max(1, (options['indent'] || 2));
    this.noArrayIndent = options['noArrayIndent'] || false;
    this.skipInvalid   = options['skipInvalid'] || false;
    this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
    this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
    this.sortKeys      = options['sortKeys'] || false;
    this.lineWidth     = options['lineWidth'] || 80;
    this.noRefs        = options['noRefs'] || false;
    this.noCompatMode  = options['noCompatMode'] || false;
    this.condenseFlow  = options['condenseFlow'] || false;
    this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
    this.forceQuotes   = options['forceQuotes'] || false;
    this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;

    this.tag = null;
    this.result = '';

    this.duplicates = [];
    this.usedDuplicates = null;
  }

  // Indents every line in a string. Empty lines (\n only) are not indented.
  function indentString(string, spaces) {
    var ind = common.repeat(' ', spaces),
        position = 0,
        next = -1,
        result = '',
        line,
        length = string.length;

    while (position < length) {
      next = string.indexOf('\n', position);
      if (next === -1) {
        line = string.slice(position);
        position = length;
      } else {
        line = string.slice(position, next + 1);
        position = next + 1;
      }

      if (line.length && line !== '\n') result += ind;

      result += line;
    }

    return result;
  }

  function generateNextLine(state, level) {
    return '\n' + common.repeat(' ', state.indent * level);
  }

  function testImplicitResolving(state, str) {
    var index, length, type;

    for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      type = state.implicitTypes[index];

      if (type.resolve(str)) {
        return true;
      }
    }

    return false;
  }

  // [33] s-white ::= s-space | s-tab
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  }

  // Returns true if the character can be printed without escaping.
  // From YAML 1.2: "any allowed characters known to be non-printable
  // should also be escaped. [However,] This isn’t mandatory"
  // Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
  function isPrintable(c) {
    return  (0x00020 <= c && c <= 0x00007E)
        || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
        || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
        ||  (0x10000 <= c && c <= 0x10FFFF);
  }

  // [34] ns-char ::= nb-char - s-white
  // [27] nb-char ::= c-printable - b-char - c-byte-order-mark
  // [26] b-char  ::= b-line-feed | b-carriage-return
  // Including s-white (for some reason, examples doesn't match specs in this aspect)
  // ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
  function isNsCharOrWhitespace(c) {
    return isPrintable(c)
      && c !== CHAR_BOM
      // - b-char
      && c !== CHAR_CARRIAGE_RETURN
      && c !== CHAR_LINE_FEED;
  }

  // [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
  //                             c = flow-in   ⇒ ns-plain-safe-in
  //                             c = block-key ⇒ ns-plain-safe-out
  //                             c = flow-key  ⇒ ns-plain-safe-in
  // [128] ns-plain-safe-out ::= ns-char
  // [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
  // [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
  //                            | ( /* An ns-char preceding */ “#” )
  //                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
  function isPlainSafe(c, prev, inblock) {
    var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
    var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
    return (
      // ns-plain-safe
      inblock ? // c = flow-in
        cIsNsCharOrWhitespace
        : cIsNsCharOrWhitespace
          // - c-flow-indicator
          && c !== CHAR_COMMA
          && c !== CHAR_LEFT_SQUARE_BRACKET
          && c !== CHAR_RIGHT_SQUARE_BRACKET
          && c !== CHAR_LEFT_CURLY_BRACKET
          && c !== CHAR_RIGHT_CURLY_BRACKET
    )
      // ns-plain-char
      && c !== CHAR_SHARP // false on '#'
      && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
      || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
      || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
  }

  // Simplified test for values allowed as the first character in plain style.
  function isPlainSafeFirst(c) {
    // Uses a subset of ns-char - c-indicator
    // where ns-char = nb-char - s-white.
    // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
    return isPrintable(c) && c !== CHAR_BOM
      && !isWhitespace(c) // - s-white
      // - (c-indicator ::=
      // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
      && c !== CHAR_MINUS
      && c !== CHAR_QUESTION
      && c !== CHAR_COLON
      && c !== CHAR_COMMA
      && c !== CHAR_LEFT_SQUARE_BRACKET
      && c !== CHAR_RIGHT_SQUARE_BRACKET
      && c !== CHAR_LEFT_CURLY_BRACKET
      && c !== CHAR_RIGHT_CURLY_BRACKET
      // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
      && c !== CHAR_SHARP
      && c !== CHAR_AMPERSAND
      && c !== CHAR_ASTERISK
      && c !== CHAR_EXCLAMATION
      && c !== CHAR_VERTICAL_LINE
      && c !== CHAR_EQUALS
      && c !== CHAR_GREATER_THAN
      && c !== CHAR_SINGLE_QUOTE
      && c !== CHAR_DOUBLE_QUOTE
      // | “%” | “@” | “`”)
      && c !== CHAR_PERCENT
      && c !== CHAR_COMMERCIAL_AT
      && c !== CHAR_GRAVE_ACCENT;
  }

  // Simplified test for values allowed as the last character in plain style.
  function isPlainSafeLast(c) {
    // just not whitespace or colon, it will be checked to be plain character later
    return !isWhitespace(c) && c !== CHAR_COLON;
  }

  // Same as 'string'.codePointAt(pos), but works in older browsers.
  function codePointAt(string, pos) {
    var first = string.charCodeAt(pos), second;
    if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
      second = string.charCodeAt(pos + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }

  // Determines whether block indentation indicator is required.
  function needIndentIndicator(string) {
    var leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
  }

  var STYLE_PLAIN   = 1,
      STYLE_SINGLE  = 2,
      STYLE_LITERAL = 3,
      STYLE_FOLDED  = 4,
      STYLE_DOUBLE  = 5;

  // Determines which scalar styles are possible and returns the preferred style.
  // lineWidth = -1 => no limit.
  // Pre-conditions: str.length > 0.
  // Post-conditions:
  //    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
  //    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
  //    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
    testAmbiguousType, quotingType, forceQuotes, inblock) {

    var i;
    var char = 0;
    var prevChar = null;
    var hasLineBreak = false;
    var hasFoldableLine = false; // only checked if shouldTrackWidth
    var shouldTrackWidth = lineWidth !== -1;
    var previousLineBreak = -1; // count the first line correctly
    var plain = isPlainSafeFirst(codePointAt(string, 0))
            && isPlainSafeLast(codePointAt(string, string.length - 1));

    if (singleLineOnly || forceQuotes) {
      // Case: no block styles.
      // Check for disallowed characters to rule out plain and single.
      for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
    } else {
      // Case: block styles permitted.
      for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true;
          // Check if any line can be folded.
          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine ||
              // Foldable line = too long, and not more-indented.
              (i - previousLineBreak - 1 > lineWidth &&
               string[previousLineBreak + 1] !== ' ');
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
      // in case the end is missing a \n
      hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
        (i - previousLineBreak - 1 > lineWidth &&
         string[previousLineBreak + 1] !== ' '));
    }
    // Although every style can represent \n without escaping, prefer block styles
    // for multiline, since they're more readable and they don't add empty lines.
    // Also prefer folding a super-long line.
    if (!hasLineBreak && !hasFoldableLine) {
      // Strings interpretable as another type have to be quoted;
      // e.g. the string 'true' vs. the boolean true.
      if (plain && !forceQuotes && !testAmbiguousType(string)) {
        return STYLE_PLAIN;
      }
      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    }
    // Edge case: block indentation indicator can only have one digit.
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
      return STYLE_DOUBLE;
    }
    // At this point we know block styles are valid.
    // Prefer literal style unless we want to fold.
    if (!forceQuotes) {
      return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }

  // Note: line breaking/folding is implemented for only the folded style.
  // NB. We drop the last trailing newline (if any) of a returned block scalar
  //  since the dumper adds its own newline. This always works:
  //    • No ending newline => unaffected; already using strip "-" chomping.
  //    • Ending newline    => removed then restored.
  //  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
  function writeScalar(state, string, level, iskey, inblock) {
    state.dump = (function () {
      if (string.length === 0) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
      }
      if (!state.noCompatMode) {
        if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
          return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
        }
      }

      var indent = state.indent * Math.max(1, level); // no 0-indent scalars
      // As indentation gets deeper, let the width decrease monotonically
      // to the lower bound min(state.lineWidth, 40).
      // Note that this implies
      //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
      //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
      // This behaves better than a constant minimum width which disallows narrower options,
      // or an indent threshold which causes the width to suddenly increase.
      var lineWidth = state.lineWidth === -1
        ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

      // Without knowing if keys are implicit/explicit, assume implicit for safety.
      var singleLineOnly = iskey
        // No block styles in flow mode.
        || (state.flowLevel > -1 && level >= state.flowLevel);
      function testAmbiguity(string) {
        return testImplicitResolving(state, string);
      }

      switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
        testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

        case STYLE_PLAIN:
          return string;
        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return '|' + blockHeader(string, state.indent)
            + dropEndingNewline(indentString(string, indent));
        case STYLE_FOLDED:
          return '>' + blockHeader(string, state.indent)
            + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string) + '"';
        default:
          throw new exception('impossible error: invalid scalar style');
      }
    }());
  }

  // Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
  function blockHeader(string, indentPerLevel) {
    var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

    // note the special case: the string '\n' counts as a "trailing" empty line.
    var clip =          string[string.length - 1] === '\n';
    var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
    var chomp = keep ? '+' : (clip ? '' : '-');

    return indentIndicator + chomp + '\n';
  }

  // (See the note for writeScalar.)
  function dropEndingNewline(string) {
    return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
  }

  // Note: a long line without a suitable break point will exceed the width limit.
  // Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
  function foldString(string, width) {
    // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
    // unless they're before or after a more-indented line, or at the very
    // beginning or end, in which case $k$ maps to $k$.
    // Therefore, parse each chunk as newline(s) followed by a content line.
    var lineRe = /(\n+)([^\n]*)/g;

    // first line (possibly an empty line)
    var result = (function () {
      var nextLF = string.indexOf('\n');
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    }());
    // If we haven't reached the first content line yet, don't add an extra \n.
    var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
    var moreIndented;

    // rest of the lines
    var match;
    while ((match = lineRe.exec(string))) {
      var prefix = match[1], line = match[2];
      moreIndented = (line[0] === ' ');
      result += prefix
        + (!prevMoreIndented && !moreIndented && line !== ''
          ? '\n' : '')
        + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }

    return result;
  }

  // Greedy line breaking.
  // Picks the longest line under the limit each time,
  // otherwise settles for the shortest line over the limit.
  // NB. More-indented lines *cannot* be folded, as that would add an extra \n.
  function foldLine(line, width) {
    if (line === '' || line[0] === ' ') return line;

    // Since a more-indented line adds a \n, breaks can't be followed by a space.
    var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
    var match;
    // start is an inclusive index. end, curr, and next are exclusive.
    var start = 0, end, curr = 0, next = 0;
    var result = '';

    // Invariants: 0 <= start <= length-1.
    //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
    // Inside the loop:
    //   A match implies length >= 2, so curr and next are <= length-2.
    while ((match = breakRe.exec(line))) {
      next = match.index;
      // maintain invariant: curr - start <= width
      if (next - start > width) {
        end = (curr > start) ? curr : next; // derive end <= length-2
        result += '\n' + line.slice(start, end);
        // skip the space that was output as \n
        start = end + 1;                    // derive start <= length-1
      }
      curr = next;
    }

    // By the invariants, start <= length-1, so there is something left over.
    // It is either the whole string or a part starting from non-whitespace.
    result += '\n';
    // Insert a break if the remainder is too long and there is a break available.
    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }

    return result.slice(1); // drop extra \n joiner
  }

  // Escapes a double-quoted string.
  function escapeString(string) {
    var result = '';
    var char = 0;
    var escapeSeq;

    for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      escapeSeq = ESCAPE_SEQUENCES[char];

      if (!escapeSeq && isPrintable(char)) {
        result += string[i];
        if (char >= 0x10000) result += string[i + 1];
      } else {
        result += escapeSeq || encodeHex(char);
      }
    }

    return result;
  }

  function writeFlowSequence(state, level, object) {
    var _result = '',
        _tag    = state.tag,
        index,
        length,
        value;

    for (index = 0, length = object.length; index < length; index += 1) {
      value = object[index];

      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      }

      // Write only valid elements, put null instead of invalid elements.
      if (writeNode(state, level, value, false, false) ||
          (typeof value === 'undefined' &&
           writeNode(state, level, null, false, false))) {

        if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
        _result += state.dump;
      }
    }

    state.tag = _tag;
    state.dump = '[' + _result + ']';
  }

  function writeBlockSequence(state, level, object, compact) {
    var _result = '',
        _tag    = state.tag,
        index,
        length,
        value;

    for (index = 0, length = object.length; index < length; index += 1) {
      value = object[index];

      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      }

      // Write only valid elements, put null instead of invalid elements.
      if (writeNode(state, level + 1, value, true, true, false, true) ||
          (typeof value === 'undefined' &&
           writeNode(state, level + 1, null, true, true, false, true))) {

        if (!compact || _result !== '') {
          _result += generateNextLine(state, level);
        }

        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += '-';
        } else {
          _result += '- ';
        }

        _result += state.dump;
      }
    }

    state.tag = _tag;
    state.dump = _result || '[]'; // Empty sequence if no valid values.
  }

  function writeFlowMapping(state, level, object) {
    var _result       = '',
        _tag          = state.tag,
        objectKeyList = Object.keys(object),
        index,
        length,
        objectKey,
        objectValue,
        pairBuffer;

    for (index = 0, length = objectKeyList.length; index < length; index += 1) {

      pairBuffer = '';
      if (_result !== '') pairBuffer += ', ';

      if (state.condenseFlow) pairBuffer += '"';

      objectKey = objectKeyList[index];
      objectValue = object[objectKey];

      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }

      if (!writeNode(state, level, objectKey, false, false)) {
        continue; // Skip this pair because of invalid key;
      }

      if (state.dump.length > 1024) pairBuffer += '? ';

      pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

      if (!writeNode(state, level, objectValue, false, false)) {
        continue; // Skip this pair because of invalid value.
      }

      pairBuffer += state.dump;

      // Both key and value are valid.
      _result += pairBuffer;
    }

    state.tag = _tag;
    state.dump = '{' + _result + '}';
  }

  function writeBlockMapping(state, level, object, compact) {
    var _result       = '',
        _tag          = state.tag,
        objectKeyList = Object.keys(object),
        index,
        length,
        objectKey,
        objectValue,
        explicitPair,
        pairBuffer;

    // Allow sorting keys so that the output file is deterministic
    if (state.sortKeys === true) {
      // Default sorting
      objectKeyList.sort();
    } else if (typeof state.sortKeys === 'function') {
      // Custom sort function
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      // Something is wrong
      throw new exception('sortKeys must be a boolean or a function');
    }

    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = '';

      if (!compact || _result !== '') {
        pairBuffer += generateNextLine(state, level);
      }

      objectKey = objectKeyList[index];
      objectValue = object[objectKey];

      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }

      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue; // Skip this pair because of invalid key.
      }

      explicitPair = (state.tag !== null && state.tag !== '?') ||
                     (state.dump && state.dump.length > 1024);

      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += '?';
        } else {
          pairBuffer += '? ';
        }
      }

      pairBuffer += state.dump;

      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }

      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue; // Skip this pair because of invalid value.
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ':';
      } else {
        pairBuffer += ': ';
      }

      pairBuffer += state.dump;

      // Both key and value are valid.
      _result += pairBuffer;
    }

    state.tag = _tag;
    state.dump = _result || '{}'; // Empty mapping if no valid pairs.
  }

  function detectType(state, object, explicit) {
    var _result, typeList, index, length, type, style;

    typeList = explicit ? state.explicitTypes : state.implicitTypes;

    for (index = 0, length = typeList.length; index < length; index += 1) {
      type = typeList[index];

      if ((type.instanceOf  || type.predicate) &&
          (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
          (!type.predicate  || type.predicate(object))) {

        if (explicit) {
          if (type.multi && type.representName) {
            state.tag = type.representName(object);
          } else {
            state.tag = type.tag;
          }
        } else {
          state.tag = '?';
        }

        if (type.represent) {
          style = state.styleMap[type.tag] || type.defaultStyle;

          if (_toString.call(type.represent) === '[object Function]') {
            _result = type.represent(object, style);
          } else if (_hasOwnProperty.call(type.represent, style)) {
            _result = type.represent[style](object, style);
          } else {
            throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
          }

          state.dump = _result;
        }

        return true;
      }
    }

    return false;
  }

  // Serializes `object` and writes it to global `result`.
  // Returns true on success, or false on invalid object.
  //
  function writeNode(state, level, object, block, compact, iskey, isblockseq) {
    state.tag = null;
    state.dump = object;

    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }

    var type = _toString.call(state.dump);
    var inblock = block;
    var tagStr;

    if (block) {
      block = (state.flowLevel < 0 || state.flowLevel > level);
    }

    var objectOrArray = type === '[object Object]' || type === '[object Array]',
        duplicateIndex,
        duplicate;

    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }

    if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
      compact = false;
    }

    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = '*ref_' + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }
      if (type === '[object Object]') {
        if (block && (Object.keys(state.dump).length !== 0)) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
          }
        }
      } else if (type === '[object Array]') {
        if (block && (state.dump.length !== 0)) {
          if (state.noArrayIndent && !isblockseq && level > 0) {
            writeBlockSequence(state, level - 1, state.dump, compact);
          } else {
            writeBlockSequence(state, level, state.dump, compact);
          }
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, level, state.dump);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
          }
        }
      } else if (type === '[object String]') {
        if (state.tag !== '?') {
          writeScalar(state, state.dump, level, iskey, inblock);
        }
      } else if (type === '[object Undefined]') {
        return false;
      } else {
        if (state.skipInvalid) return false;
        throw new exception('unacceptable kind of an object to dump ' + type);
      }

      if (state.tag !== null && state.tag !== '?') {
        // Need to encode all characters except those allowed by the spec:
        //
        // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
        // [36] ns-hex-digit    ::=  ns-dec-digit
        //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
        // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
        // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
        // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
        //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
        //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
        //
        // Also need to encode '!' because it has special meaning (end of tag prefix).
        //
        tagStr = encodeURI(
          state.tag[0] === '!' ? state.tag.slice(1) : state.tag
        ).replace(/!/g, '%21');

        if (state.tag[0] === '!') {
          tagStr = '!' + tagStr;
        } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
          tagStr = '!!' + tagStr.slice(18);
        } else {
          tagStr = '!<' + tagStr + '>';
        }

        state.dump = tagStr + ' ' + state.dump;
      }
    }

    return true;
  }

  function getDuplicateReferences(object, state) {
    var objects = [],
        duplicatesIndexes = [],
        index,
        length;

    inspectNode(object, objects, duplicatesIndexes);

    for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
  }

  function inspectNode(object, objects, duplicatesIndexes) {
    var objectKeyList,
        index,
        length;

    if (object !== null && typeof object === 'object') {
      index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);

        if (Array.isArray(object)) {
          for (index = 0, length = object.length; index < length; index += 1) {
            inspectNode(object[index], objects, duplicatesIndexes);
          }
        } else {
          objectKeyList = Object.keys(object);

          for (index = 0, length = objectKeyList.length; index < length; index += 1) {
            inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }

  function dump$1(input, options) {
    options = options || {};

    var state = new State(options);

    if (!state.noRefs) getDuplicateReferences(input, state);

    var value = input;

    if (state.replacer) {
      value = state.replacer.call({ '': value }, '', value);
    }

    if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

    return '';
  }

  var dump_1 = dump$1;

  var dumper = {
  	dump: dump_1
  };

  function renamed(from, to) {
    return function () {
      throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
        'Use yaml.' + to + ' instead, which is now safe by default.');
    };
  }


  var Type                = type;
  var Schema              = schema;
  var FAILSAFE_SCHEMA     = failsafe;
  var JSON_SCHEMA         = json;
  var CORE_SCHEMA         = core;
  var DEFAULT_SCHEMA      = _default;
  var load                = loader.load;
  var loadAll             = loader.loadAll;
  var dump                = dumper.dump;
  var YAMLException       = exception;

  // Re-export all types in case user wants to create custom schema
  var types = {
    binary:    binary,
    float:     float,
    map:       map$1,
    null:      _null,
    pairs:     pairs,
    set:       set,
    timestamp: timestamp,
    bool:      bool,
    int:       int$1,
    merge:     merge,
    omap:      omap,
    seq:       seq,
    str:       str
  };

  // Removed functions from JS-YAML 3.0.x
  var safeLoad            = renamed('safeLoad', 'load');
  var safeLoadAll         = renamed('safeLoadAll', 'loadAll');
  var safeDump            = renamed('safeDump', 'dump');

  var jsYaml = {
  	Type: Type,
  	Schema: Schema,
  	FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
  	JSON_SCHEMA: JSON_SCHEMA,
  	CORE_SCHEMA: CORE_SCHEMA,
  	DEFAULT_SCHEMA: DEFAULT_SCHEMA,
  	load: load,
  	loadAll: loadAll,
  	dump: dump,
  	YAMLException: YAMLException,
  	types: types,
  	safeLoad: safeLoad,
  	safeLoadAll: safeLoadAll,
  	safeDump: safeDump
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getAugmentedNamespace(n) {
    var f = n.default;
  	if (typeof f == "function") {
  		var a = function () {
  			return f.apply(this, arguments);
  		};
  		a.prototype = f.prototype;
    } else a = {};
    Object.defineProperty(a, '__esModule', {value: true});
  	Object.keys(n).forEach(function (k) {
  		var d = Object.getOwnPropertyDescriptor(n, k);
  		Object.defineProperty(a, k, d.get ? d : {
  			enumerable: true,
  			get: function () {
  				return n[k];
  			}
  		});
  	});
  	return a;
  }

  var lib$5 = {};

  var Parser$3 = {};

  var Tokenizer$1 = {};

  var decode_codepoint = {};

  var require$$0$1 = {
  	"0": 65533,
  	"128": 8364,
  	"130": 8218,
  	"131": 402,
  	"132": 8222,
  	"133": 8230,
  	"134": 8224,
  	"135": 8225,
  	"136": 710,
  	"137": 8240,
  	"138": 352,
  	"139": 8249,
  	"140": 338,
  	"142": 381,
  	"145": 8216,
  	"146": 8217,
  	"147": 8220,
  	"148": 8221,
  	"149": 8226,
  	"150": 8211,
  	"151": 8212,
  	"152": 732,
  	"153": 8482,
  	"154": 353,
  	"155": 8250,
  	"156": 339,
  	"158": 382,
  	"159": 376
  };

  var __importDefault$6 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(decode_codepoint, "__esModule", { value: true });
  var decode_json_1 = __importDefault$6(require$$0$1);
  // Adapted from https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
  var fromCodePoint = 
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  String.fromCodePoint ||
      function (codePoint) {
          var output = "";
          if (codePoint > 0xffff) {
              codePoint -= 0x10000;
              output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
              codePoint = 0xdc00 | (codePoint & 0x3ff);
          }
          output += String.fromCharCode(codePoint);
          return output;
      };
  function decodeCodePoint(codePoint) {
      if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
          return "\uFFFD";
      }
      if (codePoint in decode_json_1.default) {
          codePoint = decode_json_1.default[codePoint];
      }
      return fromCodePoint(codePoint);
  }
  decode_codepoint.default = decodeCodePoint;

  var Aacute$1 = "Á";
  var aacute$1 = "á";
  var Abreve = "Ă";
  var abreve = "ă";
  var ac = "∾";
  var acd = "∿";
  var acE = "∾̳";
  var Acirc$1 = "Â";
  var acirc$1 = "â";
  var acute$1 = "´";
  var Acy = "А";
  var acy = "а";
  var AElig$1 = "Æ";
  var aelig$1 = "æ";
  var af = "⁡";
  var Afr = "𝔄";
  var afr = "𝔞";
  var Agrave$1 = "À";
  var agrave$1 = "à";
  var alefsym = "ℵ";
  var aleph = "ℵ";
  var Alpha = "Α";
  var alpha = "α";
  var Amacr = "Ā";
  var amacr = "ā";
  var amalg = "⨿";
  var amp$2 = "&";
  var AMP$1 = "&";
  var andand = "⩕";
  var And = "⩓";
  var and = "∧";
  var andd = "⩜";
  var andslope = "⩘";
  var andv = "⩚";
  var ang = "∠";
  var ange = "⦤";
  var angle = "∠";
  var angmsdaa = "⦨";
  var angmsdab = "⦩";
  var angmsdac = "⦪";
  var angmsdad = "⦫";
  var angmsdae = "⦬";
  var angmsdaf = "⦭";
  var angmsdag = "⦮";
  var angmsdah = "⦯";
  var angmsd = "∡";
  var angrt = "∟";
  var angrtvb = "⊾";
  var angrtvbd = "⦝";
  var angsph = "∢";
  var angst = "Å";
  var angzarr = "⍼";
  var Aogon = "Ą";
  var aogon = "ą";
  var Aopf = "𝔸";
  var aopf = "𝕒";
  var apacir = "⩯";
  var ap = "≈";
  var apE = "⩰";
  var ape = "≊";
  var apid = "≋";
  var apos$1 = "'";
  var ApplyFunction = "⁡";
  var approx = "≈";
  var approxeq = "≊";
  var Aring$1 = "Å";
  var aring$1 = "å";
  var Ascr = "𝒜";
  var ascr = "𝒶";
  var Assign = "≔";
  var ast = "*";
  var asymp = "≈";
  var asympeq = "≍";
  var Atilde$1 = "Ã";
  var atilde$1 = "ã";
  var Auml$1 = "Ä";
  var auml$1 = "ä";
  var awconint = "∳";
  var awint = "⨑";
  var backcong = "≌";
  var backepsilon = "϶";
  var backprime = "‵";
  var backsim = "∽";
  var backsimeq = "⋍";
  var Backslash = "∖";
  var Barv = "⫧";
  var barvee = "⊽";
  var barwed = "⌅";
  var Barwed = "⌆";
  var barwedge = "⌅";
  var bbrk = "⎵";
  var bbrktbrk = "⎶";
  var bcong = "≌";
  var Bcy = "Б";
  var bcy = "б";
  var bdquo = "„";
  var becaus = "∵";
  var because = "∵";
  var Because = "∵";
  var bemptyv = "⦰";
  var bepsi = "϶";
  var bernou = "ℬ";
  var Bernoullis = "ℬ";
  var Beta = "Β";
  var beta = "β";
  var beth = "ℶ";
  var between = "≬";
  var Bfr = "𝔅";
  var bfr = "𝔟";
  var bigcap = "⋂";
  var bigcirc = "◯";
  var bigcup = "⋃";
  var bigodot = "⨀";
  var bigoplus = "⨁";
  var bigotimes = "⨂";
  var bigsqcup = "⨆";
  var bigstar = "★";
  var bigtriangledown = "▽";
  var bigtriangleup = "△";
  var biguplus = "⨄";
  var bigvee = "⋁";
  var bigwedge = "⋀";
  var bkarow = "⤍";
  var blacklozenge = "⧫";
  var blacksquare = "▪";
  var blacktriangle = "▴";
  var blacktriangledown = "▾";
  var blacktriangleleft = "◂";
  var blacktriangleright = "▸";
  var blank = "␣";
  var blk12 = "▒";
  var blk14 = "░";
  var blk34 = "▓";
  var block = "█";
  var bne = "=⃥";
  var bnequiv = "≡⃥";
  var bNot = "⫭";
  var bnot = "⌐";
  var Bopf = "𝔹";
  var bopf = "𝕓";
  var bot = "⊥";
  var bottom = "⊥";
  var bowtie = "⋈";
  var boxbox = "⧉";
  var boxdl = "┐";
  var boxdL = "╕";
  var boxDl = "╖";
  var boxDL = "╗";
  var boxdr = "┌";
  var boxdR = "╒";
  var boxDr = "╓";
  var boxDR = "╔";
  var boxh = "─";
  var boxH = "═";
  var boxhd = "┬";
  var boxHd = "╤";
  var boxhD = "╥";
  var boxHD = "╦";
  var boxhu = "┴";
  var boxHu = "╧";
  var boxhU = "╨";
  var boxHU = "╩";
  var boxminus = "⊟";
  var boxplus = "⊞";
  var boxtimes = "⊠";
  var boxul = "┘";
  var boxuL = "╛";
  var boxUl = "╜";
  var boxUL = "╝";
  var boxur = "└";
  var boxuR = "╘";
  var boxUr = "╙";
  var boxUR = "╚";
  var boxv = "│";
  var boxV = "║";
  var boxvh = "┼";
  var boxvH = "╪";
  var boxVh = "╫";
  var boxVH = "╬";
  var boxvl = "┤";
  var boxvL = "╡";
  var boxVl = "╢";
  var boxVL = "╣";
  var boxvr = "├";
  var boxvR = "╞";
  var boxVr = "╟";
  var boxVR = "╠";
  var bprime = "‵";
  var breve = "˘";
  var Breve = "˘";
  var brvbar$1 = "¦";
  var bscr = "𝒷";
  var Bscr = "ℬ";
  var bsemi = "⁏";
  var bsim = "∽";
  var bsime = "⋍";
  var bsolb = "⧅";
  var bsol = "\\";
  var bsolhsub = "⟈";
  var bull = "•";
  var bullet = "•";
  var bump = "≎";
  var bumpE = "⪮";
  var bumpe = "≏";
  var Bumpeq = "≎";
  var bumpeq = "≏";
  var Cacute = "Ć";
  var cacute = "ć";
  var capand = "⩄";
  var capbrcup = "⩉";
  var capcap = "⩋";
  var cap = "∩";
  var Cap = "⋒";
  var capcup = "⩇";
  var capdot = "⩀";
  var CapitalDifferentialD = "ⅅ";
  var caps = "∩︀";
  var caret = "⁁";
  var caron = "ˇ";
  var Cayleys = "ℭ";
  var ccaps = "⩍";
  var Ccaron = "Č";
  var ccaron = "č";
  var Ccedil$1 = "Ç";
  var ccedil$1 = "ç";
  var Ccirc = "Ĉ";
  var ccirc = "ĉ";
  var Cconint = "∰";
  var ccups = "⩌";
  var ccupssm = "⩐";
  var Cdot = "Ċ";
  var cdot = "ċ";
  var cedil$1 = "¸";
  var Cedilla = "¸";
  var cemptyv = "⦲";
  var cent$1 = "¢";
  var centerdot = "·";
  var CenterDot = "·";
  var cfr = "𝔠";
  var Cfr = "ℭ";
  var CHcy = "Ч";
  var chcy = "ч";
  var check = "✓";
  var checkmark = "✓";
  var Chi = "Χ";
  var chi = "χ";
  var circ = "ˆ";
  var circeq = "≗";
  var circlearrowleft = "↺";
  var circlearrowright = "↻";
  var circledast = "⊛";
  var circledcirc = "⊚";
  var circleddash = "⊝";
  var CircleDot = "⊙";
  var circledR = "®";
  var circledS = "Ⓢ";
  var CircleMinus = "⊖";
  var CirclePlus = "⊕";
  var CircleTimes = "⊗";
  var cir = "○";
  var cirE = "⧃";
  var cire = "≗";
  var cirfnint = "⨐";
  var cirmid = "⫯";
  var cirscir = "⧂";
  var ClockwiseContourIntegral = "∲";
  var CloseCurlyDoubleQuote = "”";
  var CloseCurlyQuote = "’";
  var clubs = "♣";
  var clubsuit = "♣";
  var colon = ":";
  var Colon = "∷";
  var Colone = "⩴";
  var colone = "≔";
  var coloneq = "≔";
  var comma = ",";
  var commat = "@";
  var comp = "∁";
  var compfn = "∘";
  var complement = "∁";
  var complexes = "ℂ";
  var cong = "≅";
  var congdot = "⩭";
  var Congruent = "≡";
  var conint = "∮";
  var Conint = "∯";
  var ContourIntegral = "∮";
  var copf = "𝕔";
  var Copf = "ℂ";
  var coprod = "∐";
  var Coproduct = "∐";
  var copy$1 = "©";
  var COPY$1 = "©";
  var copysr = "℗";
  var CounterClockwiseContourIntegral = "∳";
  var crarr = "↵";
  var cross = "✗";
  var Cross = "⨯";
  var Cscr = "𝒞";
  var cscr = "𝒸";
  var csub = "⫏";
  var csube = "⫑";
  var csup = "⫐";
  var csupe = "⫒";
  var ctdot = "⋯";
  var cudarrl = "⤸";
  var cudarrr = "⤵";
  var cuepr = "⋞";
  var cuesc = "⋟";
  var cularr = "↶";
  var cularrp = "⤽";
  var cupbrcap = "⩈";
  var cupcap = "⩆";
  var CupCap = "≍";
  var cup = "∪";
  var Cup = "⋓";
  var cupcup = "⩊";
  var cupdot = "⊍";
  var cupor = "⩅";
  var cups = "∪︀";
  var curarr = "↷";
  var curarrm = "⤼";
  var curlyeqprec = "⋞";
  var curlyeqsucc = "⋟";
  var curlyvee = "⋎";
  var curlywedge = "⋏";
  var curren$1 = "¤";
  var curvearrowleft = "↶";
  var curvearrowright = "↷";
  var cuvee = "⋎";
  var cuwed = "⋏";
  var cwconint = "∲";
  var cwint = "∱";
  var cylcty = "⌭";
  var dagger = "†";
  var Dagger = "‡";
  var daleth = "ℸ";
  var darr = "↓";
  var Darr = "↡";
  var dArr = "⇓";
  var dash = "‐";
  var Dashv = "⫤";
  var dashv = "⊣";
  var dbkarow = "⤏";
  var dblac = "˝";
  var Dcaron = "Ď";
  var dcaron = "ď";
  var Dcy = "Д";
  var dcy = "д";
  var ddagger = "‡";
  var ddarr = "⇊";
  var DD = "ⅅ";
  var dd = "ⅆ";
  var DDotrahd = "⤑";
  var ddotseq = "⩷";
  var deg$1 = "°";
  var Del = "∇";
  var Delta = "Δ";
  var delta = "δ";
  var demptyv = "⦱";
  var dfisht = "⥿";
  var Dfr = "𝔇";
  var dfr = "𝔡";
  var dHar = "⥥";
  var dharl = "⇃";
  var dharr = "⇂";
  var DiacriticalAcute = "´";
  var DiacriticalDot = "˙";
  var DiacriticalDoubleAcute = "˝";
  var DiacriticalGrave = "`";
  var DiacriticalTilde = "˜";
  var diam = "⋄";
  var diamond = "⋄";
  var Diamond = "⋄";
  var diamondsuit = "♦";
  var diams = "♦";
  var die = "¨";
  var DifferentialD = "ⅆ";
  var digamma = "ϝ";
  var disin = "⋲";
  var div = "÷";
  var divide$1 = "÷";
  var divideontimes = "⋇";
  var divonx = "⋇";
  var DJcy = "Ђ";
  var djcy = "ђ";
  var dlcorn = "⌞";
  var dlcrop = "⌍";
  var dollar = "$";
  var Dopf = "𝔻";
  var dopf = "𝕕";
  var Dot = "¨";
  var dot = "˙";
  var DotDot = "⃜";
  var doteq = "≐";
  var doteqdot = "≑";
  var DotEqual = "≐";
  var dotminus = "∸";
  var dotplus = "∔";
  var dotsquare = "⊡";
  var doublebarwedge = "⌆";
  var DoubleContourIntegral = "∯";
  var DoubleDot = "¨";
  var DoubleDownArrow = "⇓";
  var DoubleLeftArrow = "⇐";
  var DoubleLeftRightArrow = "⇔";
  var DoubleLeftTee = "⫤";
  var DoubleLongLeftArrow = "⟸";
  var DoubleLongLeftRightArrow = "⟺";
  var DoubleLongRightArrow = "⟹";
  var DoubleRightArrow = "⇒";
  var DoubleRightTee = "⊨";
  var DoubleUpArrow = "⇑";
  var DoubleUpDownArrow = "⇕";
  var DoubleVerticalBar = "∥";
  var DownArrowBar = "⤓";
  var downarrow = "↓";
  var DownArrow = "↓";
  var Downarrow = "⇓";
  var DownArrowUpArrow = "⇵";
  var DownBreve = "̑";
  var downdownarrows = "⇊";
  var downharpoonleft = "⇃";
  var downharpoonright = "⇂";
  var DownLeftRightVector = "⥐";
  var DownLeftTeeVector = "⥞";
  var DownLeftVectorBar = "⥖";
  var DownLeftVector = "↽";
  var DownRightTeeVector = "⥟";
  var DownRightVectorBar = "⥗";
  var DownRightVector = "⇁";
  var DownTeeArrow = "↧";
  var DownTee = "⊤";
  var drbkarow = "⤐";
  var drcorn = "⌟";
  var drcrop = "⌌";
  var Dscr = "𝒟";
  var dscr = "𝒹";
  var DScy = "Ѕ";
  var dscy = "ѕ";
  var dsol = "⧶";
  var Dstrok = "Đ";
  var dstrok = "đ";
  var dtdot = "⋱";
  var dtri = "▿";
  var dtrif = "▾";
  var duarr = "⇵";
  var duhar = "⥯";
  var dwangle = "⦦";
  var DZcy = "Џ";
  var dzcy = "џ";
  var dzigrarr = "⟿";
  var Eacute$1 = "É";
  var eacute$1 = "é";
  var easter = "⩮";
  var Ecaron = "Ě";
  var ecaron = "ě";
  var Ecirc$1 = "Ê";
  var ecirc$1 = "ê";
  var ecir = "≖";
  var ecolon = "≕";
  var Ecy = "Э";
  var ecy = "э";
  var eDDot = "⩷";
  var Edot = "Ė";
  var edot = "ė";
  var eDot = "≑";
  var ee = "ⅇ";
  var efDot = "≒";
  var Efr = "𝔈";
  var efr = "𝔢";
  var eg = "⪚";
  var Egrave$1 = "È";
  var egrave$1 = "è";
  var egs = "⪖";
  var egsdot = "⪘";
  var el = "⪙";
  var Element$1 = "∈";
  var elinters = "⏧";
  var ell = "ℓ";
  var els = "⪕";
  var elsdot = "⪗";
  var Emacr = "Ē";
  var emacr = "ē";
  var empty = "∅";
  var emptyset = "∅";
  var EmptySmallSquare = "◻";
  var emptyv = "∅";
  var EmptyVerySmallSquare = "▫";
  var emsp13 = " ";
  var emsp14 = " ";
  var emsp = " ";
  var ENG = "Ŋ";
  var eng = "ŋ";
  var ensp = " ";
  var Eogon = "Ę";
  var eogon = "ę";
  var Eopf = "𝔼";
  var eopf = "𝕖";
  var epar = "⋕";
  var eparsl = "⧣";
  var eplus = "⩱";
  var epsi = "ε";
  var Epsilon = "Ε";
  var epsilon = "ε";
  var epsiv = "ϵ";
  var eqcirc = "≖";
  var eqcolon = "≕";
  var eqsim = "≂";
  var eqslantgtr = "⪖";
  var eqslantless = "⪕";
  var Equal = "⩵";
  var equals = "=";
  var EqualTilde = "≂";
  var equest = "≟";
  var Equilibrium = "⇌";
  var equiv = "≡";
  var equivDD = "⩸";
  var eqvparsl = "⧥";
  var erarr = "⥱";
  var erDot = "≓";
  var escr = "ℯ";
  var Escr = "ℰ";
  var esdot = "≐";
  var Esim = "⩳";
  var esim = "≂";
  var Eta = "Η";
  var eta = "η";
  var ETH$1 = "Ð";
  var eth$1 = "ð";
  var Euml$1 = "Ë";
  var euml$1 = "ë";
  var euro = "€";
  var excl = "!";
  var exist = "∃";
  var Exists = "∃";
  var expectation = "ℰ";
  var exponentiale = "ⅇ";
  var ExponentialE = "ⅇ";
  var fallingdotseq = "≒";
  var Fcy = "Ф";
  var fcy = "ф";
  var female = "♀";
  var ffilig = "ﬃ";
  var fflig = "ﬀ";
  var ffllig = "ﬄ";
  var Ffr = "𝔉";
  var ffr = "𝔣";
  var filig = "ﬁ";
  var FilledSmallSquare = "◼";
  var FilledVerySmallSquare = "▪";
  var fjlig = "fj";
  var flat = "♭";
  var fllig = "ﬂ";
  var fltns = "▱";
  var fnof = "ƒ";
  var Fopf = "𝔽";
  var fopf = "𝕗";
  var forall = "∀";
  var ForAll = "∀";
  var fork = "⋔";
  var forkv = "⫙";
  var Fouriertrf = "ℱ";
  var fpartint = "⨍";
  var frac12$1 = "½";
  var frac13 = "⅓";
  var frac14$1 = "¼";
  var frac15 = "⅕";
  var frac16 = "⅙";
  var frac18 = "⅛";
  var frac23 = "⅔";
  var frac25 = "⅖";
  var frac34$1 = "¾";
  var frac35 = "⅗";
  var frac38 = "⅜";
  var frac45 = "⅘";
  var frac56 = "⅚";
  var frac58 = "⅝";
  var frac78 = "⅞";
  var frasl = "⁄";
  var frown = "⌢";
  var fscr = "𝒻";
  var Fscr = "ℱ";
  var gacute = "ǵ";
  var Gamma = "Γ";
  var gamma = "γ";
  var Gammad = "Ϝ";
  var gammad = "ϝ";
  var gap = "⪆";
  var Gbreve = "Ğ";
  var gbreve = "ğ";
  var Gcedil = "Ģ";
  var Gcirc = "Ĝ";
  var gcirc = "ĝ";
  var Gcy = "Г";
  var gcy = "г";
  var Gdot = "Ġ";
  var gdot = "ġ";
  var ge = "≥";
  var gE = "≧";
  var gEl = "⪌";
  var gel = "⋛";
  var geq = "≥";
  var geqq = "≧";
  var geqslant = "⩾";
  var gescc = "⪩";
  var ges = "⩾";
  var gesdot = "⪀";
  var gesdoto = "⪂";
  var gesdotol = "⪄";
  var gesl = "⋛︀";
  var gesles = "⪔";
  var Gfr = "𝔊";
  var gfr = "𝔤";
  var gg = "≫";
  var Gg = "⋙";
  var ggg = "⋙";
  var gimel = "ℷ";
  var GJcy = "Ѓ";
  var gjcy = "ѓ";
  var gla = "⪥";
  var gl = "≷";
  var glE = "⪒";
  var glj = "⪤";
  var gnap = "⪊";
  var gnapprox = "⪊";
  var gne = "⪈";
  var gnE = "≩";
  var gneq = "⪈";
  var gneqq = "≩";
  var gnsim = "⋧";
  var Gopf = "𝔾";
  var gopf = "𝕘";
  var grave = "`";
  var GreaterEqual = "≥";
  var GreaterEqualLess = "⋛";
  var GreaterFullEqual = "≧";
  var GreaterGreater = "⪢";
  var GreaterLess = "≷";
  var GreaterSlantEqual = "⩾";
  var GreaterTilde = "≳";
  var Gscr = "𝒢";
  var gscr = "ℊ";
  var gsim = "≳";
  var gsime = "⪎";
  var gsiml = "⪐";
  var gtcc = "⪧";
  var gtcir = "⩺";
  var gt$2 = ">";
  var GT$1 = ">";
  var Gt = "≫";
  var gtdot = "⋗";
  var gtlPar = "⦕";
  var gtquest = "⩼";
  var gtrapprox = "⪆";
  var gtrarr = "⥸";
  var gtrdot = "⋗";
  var gtreqless = "⋛";
  var gtreqqless = "⪌";
  var gtrless = "≷";
  var gtrsim = "≳";
  var gvertneqq = "≩︀";
  var gvnE = "≩︀";
  var Hacek = "ˇ";
  var hairsp = " ";
  var half = "½";
  var hamilt = "ℋ";
  var HARDcy = "Ъ";
  var hardcy = "ъ";
  var harrcir = "⥈";
  var harr = "↔";
  var hArr = "⇔";
  var harrw = "↭";
  var Hat = "^";
  var hbar = "ℏ";
  var Hcirc = "Ĥ";
  var hcirc = "ĥ";
  var hearts = "♥";
  var heartsuit = "♥";
  var hellip = "…";
  var hercon = "⊹";
  var hfr = "𝔥";
  var Hfr = "ℌ";
  var HilbertSpace = "ℋ";
  var hksearow = "⤥";
  var hkswarow = "⤦";
  var hoarr = "⇿";
  var homtht = "∻";
  var hookleftarrow = "↩";
  var hookrightarrow = "↪";
  var hopf = "𝕙";
  var Hopf = "ℍ";
  var horbar = "―";
  var HorizontalLine = "─";
  var hscr = "𝒽";
  var Hscr = "ℋ";
  var hslash = "ℏ";
  var Hstrok = "Ħ";
  var hstrok = "ħ";
  var HumpDownHump = "≎";
  var HumpEqual = "≏";
  var hybull = "⁃";
  var hyphen = "‐";
  var Iacute$1 = "Í";
  var iacute$1 = "í";
  var ic = "⁣";
  var Icirc$1 = "Î";
  var icirc$1 = "î";
  var Icy = "И";
  var icy = "и";
  var Idot = "İ";
  var IEcy = "Е";
  var iecy = "е";
  var iexcl$1 = "¡";
  var iff = "⇔";
  var ifr = "𝔦";
  var Ifr = "ℑ";
  var Igrave$1 = "Ì";
  var igrave$1 = "ì";
  var ii = "ⅈ";
  var iiiint = "⨌";
  var iiint = "∭";
  var iinfin = "⧜";
  var iiota = "℩";
  var IJlig = "Ĳ";
  var ijlig = "ĳ";
  var Imacr = "Ī";
  var imacr = "ī";
  var image = "ℑ";
  var ImaginaryI = "ⅈ";
  var imagline = "ℐ";
  var imagpart = "ℑ";
  var imath = "ı";
  var Im = "ℑ";
  var imof = "⊷";
  var imped = "Ƶ";
  var Implies = "⇒";
  var incare = "℅";
  var infin = "∞";
  var infintie = "⧝";
  var inodot = "ı";
  var intcal = "⊺";
  var int = "∫";
  var Int = "∬";
  var integers = "ℤ";
  var Integral = "∫";
  var intercal = "⊺";
  var Intersection = "⋂";
  var intlarhk = "⨗";
  var intprod = "⨼";
  var InvisibleComma = "⁣";
  var InvisibleTimes = "⁢";
  var IOcy = "Ё";
  var iocy = "ё";
  var Iogon = "Į";
  var iogon = "į";
  var Iopf = "𝕀";
  var iopf = "𝕚";
  var Iota = "Ι";
  var iota = "ι";
  var iprod = "⨼";
  var iquest$1 = "¿";
  var iscr = "𝒾";
  var Iscr = "ℐ";
  var isin = "∈";
  var isindot = "⋵";
  var isinE = "⋹";
  var isins = "⋴";
  var isinsv = "⋳";
  var isinv = "∈";
  var it = "⁢";
  var Itilde = "Ĩ";
  var itilde = "ĩ";
  var Iukcy = "І";
  var iukcy = "і";
  var Iuml$1 = "Ï";
  var iuml$1 = "ï";
  var Jcirc = "Ĵ";
  var jcirc = "ĵ";
  var Jcy = "Й";
  var jcy = "й";
  var Jfr = "𝔍";
  var jfr = "𝔧";
  var jmath = "ȷ";
  var Jopf = "𝕁";
  var jopf = "𝕛";
  var Jscr = "𝒥";
  var jscr = "𝒿";
  var Jsercy = "Ј";
  var jsercy = "ј";
  var Jukcy = "Є";
  var jukcy = "є";
  var Kappa = "Κ";
  var kappa = "κ";
  var kappav = "ϰ";
  var Kcedil = "Ķ";
  var kcedil = "ķ";
  var Kcy = "К";
  var kcy = "к";
  var Kfr = "𝔎";
  var kfr = "𝔨";
  var kgreen = "ĸ";
  var KHcy = "Х";
  var khcy = "х";
  var KJcy = "Ќ";
  var kjcy = "ќ";
  var Kopf = "𝕂";
  var kopf = "𝕜";
  var Kscr = "𝒦";
  var kscr = "𝓀";
  var lAarr = "⇚";
  var Lacute = "Ĺ";
  var lacute = "ĺ";
  var laemptyv = "⦴";
  var lagran = "ℒ";
  var Lambda = "Λ";
  var lambda = "λ";
  var lang = "⟨";
  var Lang = "⟪";
  var langd = "⦑";
  var langle = "⟨";
  var lap = "⪅";
  var Laplacetrf = "ℒ";
  var laquo$1 = "«";
  var larrb = "⇤";
  var larrbfs = "⤟";
  var larr = "←";
  var Larr = "↞";
  var lArr = "⇐";
  var larrfs = "⤝";
  var larrhk = "↩";
  var larrlp = "↫";
  var larrpl = "⤹";
  var larrsim = "⥳";
  var larrtl = "↢";
  var latail = "⤙";
  var lAtail = "⤛";
  var lat = "⪫";
  var late = "⪭";
  var lates = "⪭︀";
  var lbarr = "⤌";
  var lBarr = "⤎";
  var lbbrk = "❲";
  var lbrace = "{";
  var lbrack = "[";
  var lbrke = "⦋";
  var lbrksld = "⦏";
  var lbrkslu = "⦍";
  var Lcaron = "Ľ";
  var lcaron = "ľ";
  var Lcedil = "Ļ";
  var lcedil = "ļ";
  var lceil = "⌈";
  var lcub = "{";
  var Lcy = "Л";
  var lcy = "л";
  var ldca = "⤶";
  var ldquo = "“";
  var ldquor = "„";
  var ldrdhar = "⥧";
  var ldrushar = "⥋";
  var ldsh = "↲";
  var le = "≤";
  var lE = "≦";
  var LeftAngleBracket = "⟨";
  var LeftArrowBar = "⇤";
  var leftarrow = "←";
  var LeftArrow = "←";
  var Leftarrow = "⇐";
  var LeftArrowRightArrow = "⇆";
  var leftarrowtail = "↢";
  var LeftCeiling = "⌈";
  var LeftDoubleBracket = "⟦";
  var LeftDownTeeVector = "⥡";
  var LeftDownVectorBar = "⥙";
  var LeftDownVector = "⇃";
  var LeftFloor = "⌊";
  var leftharpoondown = "↽";
  var leftharpoonup = "↼";
  var leftleftarrows = "⇇";
  var leftrightarrow = "↔";
  var LeftRightArrow = "↔";
  var Leftrightarrow = "⇔";
  var leftrightarrows = "⇆";
  var leftrightharpoons = "⇋";
  var leftrightsquigarrow = "↭";
  var LeftRightVector = "⥎";
  var LeftTeeArrow = "↤";
  var LeftTee = "⊣";
  var LeftTeeVector = "⥚";
  var leftthreetimes = "⋋";
  var LeftTriangleBar = "⧏";
  var LeftTriangle = "⊲";
  var LeftTriangleEqual = "⊴";
  var LeftUpDownVector = "⥑";
  var LeftUpTeeVector = "⥠";
  var LeftUpVectorBar = "⥘";
  var LeftUpVector = "↿";
  var LeftVectorBar = "⥒";
  var LeftVector = "↼";
  var lEg = "⪋";
  var leg = "⋚";
  var leq = "≤";
  var leqq = "≦";
  var leqslant = "⩽";
  var lescc = "⪨";
  var les = "⩽";
  var lesdot = "⩿";
  var lesdoto = "⪁";
  var lesdotor = "⪃";
  var lesg = "⋚︀";
  var lesges = "⪓";
  var lessapprox = "⪅";
  var lessdot = "⋖";
  var lesseqgtr = "⋚";
  var lesseqqgtr = "⪋";
  var LessEqualGreater = "⋚";
  var LessFullEqual = "≦";
  var LessGreater = "≶";
  var lessgtr = "≶";
  var LessLess = "⪡";
  var lesssim = "≲";
  var LessSlantEqual = "⩽";
  var LessTilde = "≲";
  var lfisht = "⥼";
  var lfloor = "⌊";
  var Lfr = "𝔏";
  var lfr = "𝔩";
  var lg = "≶";
  var lgE = "⪑";
  var lHar = "⥢";
  var lhard = "↽";
  var lharu = "↼";
  var lharul = "⥪";
  var lhblk = "▄";
  var LJcy = "Љ";
  var ljcy = "љ";
  var llarr = "⇇";
  var ll = "≪";
  var Ll = "⋘";
  var llcorner = "⌞";
  var Lleftarrow = "⇚";
  var llhard = "⥫";
  var lltri = "◺";
  var Lmidot = "Ŀ";
  var lmidot = "ŀ";
  var lmoustache = "⎰";
  var lmoust = "⎰";
  var lnap = "⪉";
  var lnapprox = "⪉";
  var lne = "⪇";
  var lnE = "≨";
  var lneq = "⪇";
  var lneqq = "≨";
  var lnsim = "⋦";
  var loang = "⟬";
  var loarr = "⇽";
  var lobrk = "⟦";
  var longleftarrow = "⟵";
  var LongLeftArrow = "⟵";
  var Longleftarrow = "⟸";
  var longleftrightarrow = "⟷";
  var LongLeftRightArrow = "⟷";
  var Longleftrightarrow = "⟺";
  var longmapsto = "⟼";
  var longrightarrow = "⟶";
  var LongRightArrow = "⟶";
  var Longrightarrow = "⟹";
  var looparrowleft = "↫";
  var looparrowright = "↬";
  var lopar = "⦅";
  var Lopf = "𝕃";
  var lopf = "𝕝";
  var loplus = "⨭";
  var lotimes = "⨴";
  var lowast = "∗";
  var lowbar = "_";
  var LowerLeftArrow = "↙";
  var LowerRightArrow = "↘";
  var loz = "◊";
  var lozenge = "◊";
  var lozf = "⧫";
  var lpar = "(";
  var lparlt = "⦓";
  var lrarr = "⇆";
  var lrcorner = "⌟";
  var lrhar = "⇋";
  var lrhard = "⥭";
  var lrm = "‎";
  var lrtri = "⊿";
  var lsaquo = "‹";
  var lscr = "𝓁";
  var Lscr = "ℒ";
  var lsh = "↰";
  var Lsh = "↰";
  var lsim = "≲";
  var lsime = "⪍";
  var lsimg = "⪏";
  var lsqb = "[";
  var lsquo = "‘";
  var lsquor = "‚";
  var Lstrok = "Ł";
  var lstrok = "ł";
  var ltcc = "⪦";
  var ltcir = "⩹";
  var lt$2 = "<";
  var LT$1 = "<";
  var Lt = "≪";
  var ltdot = "⋖";
  var lthree = "⋋";
  var ltimes = "⋉";
  var ltlarr = "⥶";
  var ltquest = "⩻";
  var ltri = "◃";
  var ltrie = "⊴";
  var ltrif = "◂";
  var ltrPar = "⦖";
  var lurdshar = "⥊";
  var luruhar = "⥦";
  var lvertneqq = "≨︀";
  var lvnE = "≨︀";
  var macr$1 = "¯";
  var male = "♂";
  var malt = "✠";
  var maltese = "✠";
  var map = "↦";
  var mapsto = "↦";
  var mapstodown = "↧";
  var mapstoleft = "↤";
  var mapstoup = "↥";
  var marker = "▮";
  var mcomma = "⨩";
  var Mcy = "М";
  var mcy = "м";
  var mdash = "—";
  var mDDot = "∺";
  var measuredangle = "∡";
  var MediumSpace = " ";
  var Mellintrf = "ℳ";
  var Mfr = "𝔐";
  var mfr = "𝔪";
  var mho = "℧";
  var micro$1 = "µ";
  var midast = "*";
  var midcir = "⫰";
  var mid = "∣";
  var middot$1 = "·";
  var minusb = "⊟";
  var minus = "−";
  var minusd = "∸";
  var minusdu = "⨪";
  var MinusPlus = "∓";
  var mlcp = "⫛";
  var mldr = "…";
  var mnplus = "∓";
  var models = "⊧";
  var Mopf = "𝕄";
  var mopf = "𝕞";
  var mp = "∓";
  var mscr = "𝓂";
  var Mscr = "ℳ";
  var mstpos = "∾";
  var Mu = "Μ";
  var mu = "μ";
  var multimap = "⊸";
  var mumap = "⊸";
  var nabla = "∇";
  var Nacute = "Ń";
  var nacute = "ń";
  var nang = "∠⃒";
  var nap = "≉";
  var napE = "⩰̸";
  var napid = "≋̸";
  var napos = "ŉ";
  var napprox = "≉";
  var natural = "♮";
  var naturals = "ℕ";
  var natur = "♮";
  var nbsp$1 = " ";
  var nbump = "≎̸";
  var nbumpe = "≏̸";
  var ncap = "⩃";
  var Ncaron = "Ň";
  var ncaron = "ň";
  var Ncedil = "Ņ";
  var ncedil = "ņ";
  var ncong = "≇";
  var ncongdot = "⩭̸";
  var ncup = "⩂";
  var Ncy = "Н";
  var ncy = "н";
  var ndash = "–";
  var nearhk = "⤤";
  var nearr = "↗";
  var neArr = "⇗";
  var nearrow = "↗";
  var ne = "≠";
  var nedot = "≐̸";
  var NegativeMediumSpace = "​";
  var NegativeThickSpace = "​";
  var NegativeThinSpace = "​";
  var NegativeVeryThinSpace = "​";
  var nequiv = "≢";
  var nesear = "⤨";
  var nesim = "≂̸";
  var NestedGreaterGreater = "≫";
  var NestedLessLess = "≪";
  var NewLine = "\n";
  var nexist = "∄";
  var nexists = "∄";
  var Nfr = "𝔑";
  var nfr = "𝔫";
  var ngE = "≧̸";
  var nge = "≱";
  var ngeq = "≱";
  var ngeqq = "≧̸";
  var ngeqslant = "⩾̸";
  var nges = "⩾̸";
  var nGg = "⋙̸";
  var ngsim = "≵";
  var nGt = "≫⃒";
  var ngt = "≯";
  var ngtr = "≯";
  var nGtv = "≫̸";
  var nharr = "↮";
  var nhArr = "⇎";
  var nhpar = "⫲";
  var ni = "∋";
  var nis = "⋼";
  var nisd = "⋺";
  var niv = "∋";
  var NJcy = "Њ";
  var njcy = "њ";
  var nlarr = "↚";
  var nlArr = "⇍";
  var nldr = "‥";
  var nlE = "≦̸";
  var nle = "≰";
  var nleftarrow = "↚";
  var nLeftarrow = "⇍";
  var nleftrightarrow = "↮";
  var nLeftrightarrow = "⇎";
  var nleq = "≰";
  var nleqq = "≦̸";
  var nleqslant = "⩽̸";
  var nles = "⩽̸";
  var nless = "≮";
  var nLl = "⋘̸";
  var nlsim = "≴";
  var nLt = "≪⃒";
  var nlt = "≮";
  var nltri = "⋪";
  var nltrie = "⋬";
  var nLtv = "≪̸";
  var nmid = "∤";
  var NoBreak = "⁠";
  var NonBreakingSpace = " ";
  var nopf = "𝕟";
  var Nopf = "ℕ";
  var Not = "⫬";
  var not$1 = "¬";
  var NotCongruent = "≢";
  var NotCupCap = "≭";
  var NotDoubleVerticalBar = "∦";
  var NotElement = "∉";
  var NotEqual = "≠";
  var NotEqualTilde = "≂̸";
  var NotExists = "∄";
  var NotGreater = "≯";
  var NotGreaterEqual = "≱";
  var NotGreaterFullEqual = "≧̸";
  var NotGreaterGreater = "≫̸";
  var NotGreaterLess = "≹";
  var NotGreaterSlantEqual = "⩾̸";
  var NotGreaterTilde = "≵";
  var NotHumpDownHump = "≎̸";
  var NotHumpEqual = "≏̸";
  var notin = "∉";
  var notindot = "⋵̸";
  var notinE = "⋹̸";
  var notinva = "∉";
  var notinvb = "⋷";
  var notinvc = "⋶";
  var NotLeftTriangleBar = "⧏̸";
  var NotLeftTriangle = "⋪";
  var NotLeftTriangleEqual = "⋬";
  var NotLess = "≮";
  var NotLessEqual = "≰";
  var NotLessGreater = "≸";
  var NotLessLess = "≪̸";
  var NotLessSlantEqual = "⩽̸";
  var NotLessTilde = "≴";
  var NotNestedGreaterGreater = "⪢̸";
  var NotNestedLessLess = "⪡̸";
  var notni = "∌";
  var notniva = "∌";
  var notnivb = "⋾";
  var notnivc = "⋽";
  var NotPrecedes = "⊀";
  var NotPrecedesEqual = "⪯̸";
  var NotPrecedesSlantEqual = "⋠";
  var NotReverseElement = "∌";
  var NotRightTriangleBar = "⧐̸";
  var NotRightTriangle = "⋫";
  var NotRightTriangleEqual = "⋭";
  var NotSquareSubset = "⊏̸";
  var NotSquareSubsetEqual = "⋢";
  var NotSquareSuperset = "⊐̸";
  var NotSquareSupersetEqual = "⋣";
  var NotSubset = "⊂⃒";
  var NotSubsetEqual = "⊈";
  var NotSucceeds = "⊁";
  var NotSucceedsEqual = "⪰̸";
  var NotSucceedsSlantEqual = "⋡";
  var NotSucceedsTilde = "≿̸";
  var NotSuperset = "⊃⃒";
  var NotSupersetEqual = "⊉";
  var NotTilde = "≁";
  var NotTildeEqual = "≄";
  var NotTildeFullEqual = "≇";
  var NotTildeTilde = "≉";
  var NotVerticalBar = "∤";
  var nparallel = "∦";
  var npar = "∦";
  var nparsl = "⫽⃥";
  var npart = "∂̸";
  var npolint = "⨔";
  var npr = "⊀";
  var nprcue = "⋠";
  var nprec = "⊀";
  var npreceq = "⪯̸";
  var npre = "⪯̸";
  var nrarrc = "⤳̸";
  var nrarr = "↛";
  var nrArr = "⇏";
  var nrarrw = "↝̸";
  var nrightarrow = "↛";
  var nRightarrow = "⇏";
  var nrtri = "⋫";
  var nrtrie = "⋭";
  var nsc = "⊁";
  var nsccue = "⋡";
  var nsce = "⪰̸";
  var Nscr = "𝒩";
  var nscr = "𝓃";
  var nshortmid = "∤";
  var nshortparallel = "∦";
  var nsim = "≁";
  var nsime = "≄";
  var nsimeq = "≄";
  var nsmid = "∤";
  var nspar = "∦";
  var nsqsube = "⋢";
  var nsqsupe = "⋣";
  var nsub = "⊄";
  var nsubE = "⫅̸";
  var nsube = "⊈";
  var nsubset = "⊂⃒";
  var nsubseteq = "⊈";
  var nsubseteqq = "⫅̸";
  var nsucc = "⊁";
  var nsucceq = "⪰̸";
  var nsup = "⊅";
  var nsupE = "⫆̸";
  var nsupe = "⊉";
  var nsupset = "⊃⃒";
  var nsupseteq = "⊉";
  var nsupseteqq = "⫆̸";
  var ntgl = "≹";
  var Ntilde$1 = "Ñ";
  var ntilde$1 = "ñ";
  var ntlg = "≸";
  var ntriangleleft = "⋪";
  var ntrianglelefteq = "⋬";
  var ntriangleright = "⋫";
  var ntrianglerighteq = "⋭";
  var Nu = "Ν";
  var nu = "ν";
  var num = "#";
  var numero = "№";
  var numsp = " ";
  var nvap = "≍⃒";
  var nvdash = "⊬";
  var nvDash = "⊭";
  var nVdash = "⊮";
  var nVDash = "⊯";
  var nvge = "≥⃒";
  var nvgt = ">⃒";
  var nvHarr = "⤄";
  var nvinfin = "⧞";
  var nvlArr = "⤂";
  var nvle = "≤⃒";
  var nvlt = "<⃒";
  var nvltrie = "⊴⃒";
  var nvrArr = "⤃";
  var nvrtrie = "⊵⃒";
  var nvsim = "∼⃒";
  var nwarhk = "⤣";
  var nwarr = "↖";
  var nwArr = "⇖";
  var nwarrow = "↖";
  var nwnear = "⤧";
  var Oacute$1 = "Ó";
  var oacute$1 = "ó";
  var oast = "⊛";
  var Ocirc$1 = "Ô";
  var ocirc$1 = "ô";
  var ocir = "⊚";
  var Ocy = "О";
  var ocy = "о";
  var odash = "⊝";
  var Odblac = "Ő";
  var odblac = "ő";
  var odiv = "⨸";
  var odot = "⊙";
  var odsold = "⦼";
  var OElig = "Œ";
  var oelig = "œ";
  var ofcir = "⦿";
  var Ofr = "𝔒";
  var ofr = "𝔬";
  var ogon = "˛";
  var Ograve$1 = "Ò";
  var ograve$1 = "ò";
  var ogt = "⧁";
  var ohbar = "⦵";
  var ohm = "Ω";
  var oint = "∮";
  var olarr = "↺";
  var olcir = "⦾";
  var olcross = "⦻";
  var oline = "‾";
  var olt = "⧀";
  var Omacr = "Ō";
  var omacr = "ō";
  var Omega = "Ω";
  var omega = "ω";
  var Omicron = "Ο";
  var omicron = "ο";
  var omid = "⦶";
  var ominus = "⊖";
  var Oopf = "𝕆";
  var oopf = "𝕠";
  var opar = "⦷";
  var OpenCurlyDoubleQuote = "“";
  var OpenCurlyQuote = "‘";
  var operp = "⦹";
  var oplus = "⊕";
  var orarr = "↻";
  var Or = "⩔";
  var or = "∨";
  var ord = "⩝";
  var order = "ℴ";
  var orderof = "ℴ";
  var ordf$1 = "ª";
  var ordm$1 = "º";
  var origof = "⊶";
  var oror = "⩖";
  var orslope = "⩗";
  var orv = "⩛";
  var oS = "Ⓢ";
  var Oscr = "𝒪";
  var oscr = "ℴ";
  var Oslash$1 = "Ø";
  var oslash$1 = "ø";
  var osol = "⊘";
  var Otilde$1 = "Õ";
  var otilde$1 = "õ";
  var otimesas = "⨶";
  var Otimes = "⨷";
  var otimes = "⊗";
  var Ouml$1 = "Ö";
  var ouml$1 = "ö";
  var ovbar = "⌽";
  var OverBar = "‾";
  var OverBrace = "⏞";
  var OverBracket = "⎴";
  var OverParenthesis = "⏜";
  var para$1 = "¶";
  var parallel = "∥";
  var par = "∥";
  var parsim = "⫳";
  var parsl = "⫽";
  var part = "∂";
  var PartialD = "∂";
  var Pcy = "П";
  var pcy = "п";
  var percnt = "%";
  var period = ".";
  var permil = "‰";
  var perp = "⊥";
  var pertenk = "‱";
  var Pfr = "𝔓";
  var pfr = "𝔭";
  var Phi = "Φ";
  var phi = "φ";
  var phiv = "ϕ";
  var phmmat = "ℳ";
  var phone = "☎";
  var Pi = "Π";
  var pi = "π";
  var pitchfork = "⋔";
  var piv = "ϖ";
  var planck = "ℏ";
  var planckh = "ℎ";
  var plankv = "ℏ";
  var plusacir = "⨣";
  var plusb = "⊞";
  var pluscir = "⨢";
  var plus = "+";
  var plusdo = "∔";
  var plusdu = "⨥";
  var pluse = "⩲";
  var PlusMinus = "±";
  var plusmn$1 = "±";
  var plussim = "⨦";
  var plustwo = "⨧";
  var pm = "±";
  var Poincareplane = "ℌ";
  var pointint = "⨕";
  var popf = "𝕡";
  var Popf = "ℙ";
  var pound$1 = "£";
  var prap = "⪷";
  var Pr = "⪻";
  var pr = "≺";
  var prcue = "≼";
  var precapprox = "⪷";
  var prec = "≺";
  var preccurlyeq = "≼";
  var Precedes = "≺";
  var PrecedesEqual = "⪯";
  var PrecedesSlantEqual = "≼";
  var PrecedesTilde = "≾";
  var preceq = "⪯";
  var precnapprox = "⪹";
  var precneqq = "⪵";
  var precnsim = "⋨";
  var pre = "⪯";
  var prE = "⪳";
  var precsim = "≾";
  var prime = "′";
  var Prime = "″";
  var primes = "ℙ";
  var prnap = "⪹";
  var prnE = "⪵";
  var prnsim = "⋨";
  var prod = "∏";
  var Product = "∏";
  var profalar = "⌮";
  var profline = "⌒";
  var profsurf = "⌓";
  var prop = "∝";
  var Proportional = "∝";
  var Proportion = "∷";
  var propto = "∝";
  var prsim = "≾";
  var prurel = "⊰";
  var Pscr = "𝒫";
  var pscr = "𝓅";
  var Psi = "Ψ";
  var psi = "ψ";
  var puncsp = " ";
  var Qfr = "𝔔";
  var qfr = "𝔮";
  var qint = "⨌";
  var qopf = "𝕢";
  var Qopf = "ℚ";
  var qprime = "⁗";
  var Qscr = "𝒬";
  var qscr = "𝓆";
  var quaternions = "ℍ";
  var quatint = "⨖";
  var quest = "?";
  var questeq = "≟";
  var quot$2 = "\"";
  var QUOT$1 = "\"";
  var rAarr = "⇛";
  var race = "∽̱";
  var Racute = "Ŕ";
  var racute = "ŕ";
  var radic = "√";
  var raemptyv = "⦳";
  var rang = "⟩";
  var Rang = "⟫";
  var rangd = "⦒";
  var range = "⦥";
  var rangle = "⟩";
  var raquo$1 = "»";
  var rarrap = "⥵";
  var rarrb = "⇥";
  var rarrbfs = "⤠";
  var rarrc = "⤳";
  var rarr = "→";
  var Rarr = "↠";
  var rArr = "⇒";
  var rarrfs = "⤞";
  var rarrhk = "↪";
  var rarrlp = "↬";
  var rarrpl = "⥅";
  var rarrsim = "⥴";
  var Rarrtl = "⤖";
  var rarrtl = "↣";
  var rarrw = "↝";
  var ratail = "⤚";
  var rAtail = "⤜";
  var ratio = "∶";
  var rationals = "ℚ";
  var rbarr = "⤍";
  var rBarr = "⤏";
  var RBarr = "⤐";
  var rbbrk = "❳";
  var rbrace = "}";
  var rbrack = "]";
  var rbrke = "⦌";
  var rbrksld = "⦎";
  var rbrkslu = "⦐";
  var Rcaron = "Ř";
  var rcaron = "ř";
  var Rcedil = "Ŗ";
  var rcedil = "ŗ";
  var rceil = "⌉";
  var rcub = "}";
  var Rcy = "Р";
  var rcy = "р";
  var rdca = "⤷";
  var rdldhar = "⥩";
  var rdquo = "”";
  var rdquor = "”";
  var rdsh = "↳";
  var real = "ℜ";
  var realine = "ℛ";
  var realpart = "ℜ";
  var reals = "ℝ";
  var Re = "ℜ";
  var rect = "▭";
  var reg$1 = "®";
  var REG$1 = "®";
  var ReverseElement = "∋";
  var ReverseEquilibrium = "⇋";
  var ReverseUpEquilibrium = "⥯";
  var rfisht = "⥽";
  var rfloor = "⌋";
  var rfr = "𝔯";
  var Rfr = "ℜ";
  var rHar = "⥤";
  var rhard = "⇁";
  var rharu = "⇀";
  var rharul = "⥬";
  var Rho = "Ρ";
  var rho = "ρ";
  var rhov = "ϱ";
  var RightAngleBracket = "⟩";
  var RightArrowBar = "⇥";
  var rightarrow = "→";
  var RightArrow = "→";
  var Rightarrow = "⇒";
  var RightArrowLeftArrow = "⇄";
  var rightarrowtail = "↣";
  var RightCeiling = "⌉";
  var RightDoubleBracket = "⟧";
  var RightDownTeeVector = "⥝";
  var RightDownVectorBar = "⥕";
  var RightDownVector = "⇂";
  var RightFloor = "⌋";
  var rightharpoondown = "⇁";
  var rightharpoonup = "⇀";
  var rightleftarrows = "⇄";
  var rightleftharpoons = "⇌";
  var rightrightarrows = "⇉";
  var rightsquigarrow = "↝";
  var RightTeeArrow = "↦";
  var RightTee = "⊢";
  var RightTeeVector = "⥛";
  var rightthreetimes = "⋌";
  var RightTriangleBar = "⧐";
  var RightTriangle = "⊳";
  var RightTriangleEqual = "⊵";
  var RightUpDownVector = "⥏";
  var RightUpTeeVector = "⥜";
  var RightUpVectorBar = "⥔";
  var RightUpVector = "↾";
  var RightVectorBar = "⥓";
  var RightVector = "⇀";
  var ring = "˚";
  var risingdotseq = "≓";
  var rlarr = "⇄";
  var rlhar = "⇌";
  var rlm = "‏";
  var rmoustache = "⎱";
  var rmoust = "⎱";
  var rnmid = "⫮";
  var roang = "⟭";
  var roarr = "⇾";
  var robrk = "⟧";
  var ropar = "⦆";
  var ropf = "𝕣";
  var Ropf = "ℝ";
  var roplus = "⨮";
  var rotimes = "⨵";
  var RoundImplies = "⥰";
  var rpar = ")";
  var rpargt = "⦔";
  var rppolint = "⨒";
  var rrarr = "⇉";
  var Rrightarrow = "⇛";
  var rsaquo = "›";
  var rscr = "𝓇";
  var Rscr = "ℛ";
  var rsh = "↱";
  var Rsh = "↱";
  var rsqb = "]";
  var rsquo = "’";
  var rsquor = "’";
  var rthree = "⋌";
  var rtimes = "⋊";
  var rtri = "▹";
  var rtrie = "⊵";
  var rtrif = "▸";
  var rtriltri = "⧎";
  var RuleDelayed = "⧴";
  var ruluhar = "⥨";
  var rx = "℞";
  var Sacute = "Ś";
  var sacute = "ś";
  var sbquo = "‚";
  var scap = "⪸";
  var Scaron = "Š";
  var scaron = "š";
  var Sc = "⪼";
  var sc = "≻";
  var sccue = "≽";
  var sce = "⪰";
  var scE = "⪴";
  var Scedil = "Ş";
  var scedil = "ş";
  var Scirc = "Ŝ";
  var scirc = "ŝ";
  var scnap = "⪺";
  var scnE = "⪶";
  var scnsim = "⋩";
  var scpolint = "⨓";
  var scsim = "≿";
  var Scy = "С";
  var scy = "с";
  var sdotb = "⊡";
  var sdot = "⋅";
  var sdote = "⩦";
  var searhk = "⤥";
  var searr = "↘";
  var seArr = "⇘";
  var searrow = "↘";
  var sect$1 = "§";
  var semi = ";";
  var seswar = "⤩";
  var setminus = "∖";
  var setmn = "∖";
  var sext = "✶";
  var Sfr = "𝔖";
  var sfr = "𝔰";
  var sfrown = "⌢";
  var sharp = "♯";
  var SHCHcy = "Щ";
  var shchcy = "щ";
  var SHcy = "Ш";
  var shcy = "ш";
  var ShortDownArrow = "↓";
  var ShortLeftArrow = "←";
  var shortmid = "∣";
  var shortparallel = "∥";
  var ShortRightArrow = "→";
  var ShortUpArrow = "↑";
  var shy$1 = "­";
  var Sigma = "Σ";
  var sigma = "σ";
  var sigmaf = "ς";
  var sigmav = "ς";
  var sim = "∼";
  var simdot = "⩪";
  var sime = "≃";
  var simeq = "≃";
  var simg = "⪞";
  var simgE = "⪠";
  var siml = "⪝";
  var simlE = "⪟";
  var simne = "≆";
  var simplus = "⨤";
  var simrarr = "⥲";
  var slarr = "←";
  var SmallCircle = "∘";
  var smallsetminus = "∖";
  var smashp = "⨳";
  var smeparsl = "⧤";
  var smid = "∣";
  var smile = "⌣";
  var smt = "⪪";
  var smte = "⪬";
  var smtes = "⪬︀";
  var SOFTcy = "Ь";
  var softcy = "ь";
  var solbar = "⌿";
  var solb = "⧄";
  var sol = "/";
  var Sopf = "𝕊";
  var sopf = "𝕤";
  var spades = "♠";
  var spadesuit = "♠";
  var spar = "∥";
  var sqcap = "⊓";
  var sqcaps = "⊓︀";
  var sqcup = "⊔";
  var sqcups = "⊔︀";
  var Sqrt = "√";
  var sqsub = "⊏";
  var sqsube = "⊑";
  var sqsubset = "⊏";
  var sqsubseteq = "⊑";
  var sqsup = "⊐";
  var sqsupe = "⊒";
  var sqsupset = "⊐";
  var sqsupseteq = "⊒";
  var square = "□";
  var Square = "□";
  var SquareIntersection = "⊓";
  var SquareSubset = "⊏";
  var SquareSubsetEqual = "⊑";
  var SquareSuperset = "⊐";
  var SquareSupersetEqual = "⊒";
  var SquareUnion = "⊔";
  var squarf = "▪";
  var squ = "□";
  var squf = "▪";
  var srarr = "→";
  var Sscr = "𝒮";
  var sscr = "𝓈";
  var ssetmn = "∖";
  var ssmile = "⌣";
  var sstarf = "⋆";
  var Star = "⋆";
  var star = "☆";
  var starf = "★";
  var straightepsilon = "ϵ";
  var straightphi = "ϕ";
  var strns = "¯";
  var sub = "⊂";
  var Sub = "⋐";
  var subdot = "⪽";
  var subE = "⫅";
  var sube = "⊆";
  var subedot = "⫃";
  var submult = "⫁";
  var subnE = "⫋";
  var subne = "⊊";
  var subplus = "⪿";
  var subrarr = "⥹";
  var subset = "⊂";
  var Subset = "⋐";
  var subseteq = "⊆";
  var subseteqq = "⫅";
  var SubsetEqual = "⊆";
  var subsetneq = "⊊";
  var subsetneqq = "⫋";
  var subsim = "⫇";
  var subsub = "⫕";
  var subsup = "⫓";
  var succapprox = "⪸";
  var succ = "≻";
  var succcurlyeq = "≽";
  var Succeeds = "≻";
  var SucceedsEqual = "⪰";
  var SucceedsSlantEqual = "≽";
  var SucceedsTilde = "≿";
  var succeq = "⪰";
  var succnapprox = "⪺";
  var succneqq = "⪶";
  var succnsim = "⋩";
  var succsim = "≿";
  var SuchThat = "∋";
  var sum = "∑";
  var Sum = "∑";
  var sung = "♪";
  var sup1$1 = "¹";
  var sup2$1 = "²";
  var sup3$1 = "³";
  var sup = "⊃";
  var Sup = "⋑";
  var supdot = "⪾";
  var supdsub = "⫘";
  var supE = "⫆";
  var supe = "⊇";
  var supedot = "⫄";
  var Superset = "⊃";
  var SupersetEqual = "⊇";
  var suphsol = "⟉";
  var suphsub = "⫗";
  var suplarr = "⥻";
  var supmult = "⫂";
  var supnE = "⫌";
  var supne = "⊋";
  var supplus = "⫀";
  var supset = "⊃";
  var Supset = "⋑";
  var supseteq = "⊇";
  var supseteqq = "⫆";
  var supsetneq = "⊋";
  var supsetneqq = "⫌";
  var supsim = "⫈";
  var supsub = "⫔";
  var supsup = "⫖";
  var swarhk = "⤦";
  var swarr = "↙";
  var swArr = "⇙";
  var swarrow = "↙";
  var swnwar = "⤪";
  var szlig$1 = "ß";
  var Tab = "\t";
  var target = "⌖";
  var Tau = "Τ";
  var tau = "τ";
  var tbrk = "⎴";
  var Tcaron = "Ť";
  var tcaron = "ť";
  var Tcedil = "Ţ";
  var tcedil = "ţ";
  var Tcy = "Т";
  var tcy = "т";
  var tdot = "⃛";
  var telrec = "⌕";
  var Tfr = "𝔗";
  var tfr = "𝔱";
  var there4 = "∴";
  var therefore = "∴";
  var Therefore = "∴";
  var Theta = "Θ";
  var theta = "θ";
  var thetasym = "ϑ";
  var thetav = "ϑ";
  var thickapprox = "≈";
  var thicksim = "∼";
  var ThickSpace = "  ";
  var ThinSpace = " ";
  var thinsp = " ";
  var thkap = "≈";
  var thksim = "∼";
  var THORN$1 = "Þ";
  var thorn$1 = "þ";
  var tilde = "˜";
  var Tilde = "∼";
  var TildeEqual = "≃";
  var TildeFullEqual = "≅";
  var TildeTilde = "≈";
  var timesbar = "⨱";
  var timesb = "⊠";
  var times$1 = "×";
  var timesd = "⨰";
  var tint = "∭";
  var toea = "⤨";
  var topbot = "⌶";
  var topcir = "⫱";
  var top = "⊤";
  var Topf = "𝕋";
  var topf = "𝕥";
  var topfork = "⫚";
  var tosa = "⤩";
  var tprime = "‴";
  var trade = "™";
  var TRADE = "™";
  var triangle = "▵";
  var triangledown = "▿";
  var triangleleft = "◃";
  var trianglelefteq = "⊴";
  var triangleq = "≜";
  var triangleright = "▹";
  var trianglerighteq = "⊵";
  var tridot = "◬";
  var trie = "≜";
  var triminus = "⨺";
  var TripleDot = "⃛";
  var triplus = "⨹";
  var trisb = "⧍";
  var tritime = "⨻";
  var trpezium = "⏢";
  var Tscr = "𝒯";
  var tscr = "𝓉";
  var TScy = "Ц";
  var tscy = "ц";
  var TSHcy = "Ћ";
  var tshcy = "ћ";
  var Tstrok = "Ŧ";
  var tstrok = "ŧ";
  var twixt = "≬";
  var twoheadleftarrow = "↞";
  var twoheadrightarrow = "↠";
  var Uacute$1 = "Ú";
  var uacute$1 = "ú";
  var uarr = "↑";
  var Uarr = "↟";
  var uArr = "⇑";
  var Uarrocir = "⥉";
  var Ubrcy = "Ў";
  var ubrcy = "ў";
  var Ubreve = "Ŭ";
  var ubreve = "ŭ";
  var Ucirc$1 = "Û";
  var ucirc$1 = "û";
  var Ucy = "У";
  var ucy = "у";
  var udarr = "⇅";
  var Udblac = "Ű";
  var udblac = "ű";
  var udhar = "⥮";
  var ufisht = "⥾";
  var Ufr = "𝔘";
  var ufr = "𝔲";
  var Ugrave$1 = "Ù";
  var ugrave$1 = "ù";
  var uHar = "⥣";
  var uharl = "↿";
  var uharr = "↾";
  var uhblk = "▀";
  var ulcorn = "⌜";
  var ulcorner = "⌜";
  var ulcrop = "⌏";
  var ultri = "◸";
  var Umacr = "Ū";
  var umacr = "ū";
  var uml$1 = "¨";
  var UnderBar = "_";
  var UnderBrace = "⏟";
  var UnderBracket = "⎵";
  var UnderParenthesis = "⏝";
  var Union = "⋃";
  var UnionPlus = "⊎";
  var Uogon = "Ų";
  var uogon = "ų";
  var Uopf = "𝕌";
  var uopf = "𝕦";
  var UpArrowBar = "⤒";
  var uparrow = "↑";
  var UpArrow = "↑";
  var Uparrow = "⇑";
  var UpArrowDownArrow = "⇅";
  var updownarrow = "↕";
  var UpDownArrow = "↕";
  var Updownarrow = "⇕";
  var UpEquilibrium = "⥮";
  var upharpoonleft = "↿";
  var upharpoonright = "↾";
  var uplus = "⊎";
  var UpperLeftArrow = "↖";
  var UpperRightArrow = "↗";
  var upsi = "υ";
  var Upsi = "ϒ";
  var upsih = "ϒ";
  var Upsilon = "Υ";
  var upsilon = "υ";
  var UpTeeArrow = "↥";
  var UpTee = "⊥";
  var upuparrows = "⇈";
  var urcorn = "⌝";
  var urcorner = "⌝";
  var urcrop = "⌎";
  var Uring = "Ů";
  var uring = "ů";
  var urtri = "◹";
  var Uscr = "𝒰";
  var uscr = "𝓊";
  var utdot = "⋰";
  var Utilde = "Ũ";
  var utilde = "ũ";
  var utri = "▵";
  var utrif = "▴";
  var uuarr = "⇈";
  var Uuml$1 = "Ü";
  var uuml$1 = "ü";
  var uwangle = "⦧";
  var vangrt = "⦜";
  var varepsilon = "ϵ";
  var varkappa = "ϰ";
  var varnothing = "∅";
  var varphi = "ϕ";
  var varpi = "ϖ";
  var varpropto = "∝";
  var varr = "↕";
  var vArr = "⇕";
  var varrho = "ϱ";
  var varsigma = "ς";
  var varsubsetneq = "⊊︀";
  var varsubsetneqq = "⫋︀";
  var varsupsetneq = "⊋︀";
  var varsupsetneqq = "⫌︀";
  var vartheta = "ϑ";
  var vartriangleleft = "⊲";
  var vartriangleright = "⊳";
  var vBar = "⫨";
  var Vbar = "⫫";
  var vBarv = "⫩";
  var Vcy = "В";
  var vcy = "в";
  var vdash = "⊢";
  var vDash = "⊨";
  var Vdash = "⊩";
  var VDash = "⊫";
  var Vdashl = "⫦";
  var veebar = "⊻";
  var vee = "∨";
  var Vee = "⋁";
  var veeeq = "≚";
  var vellip = "⋮";
  var verbar = "|";
  var Verbar = "‖";
  var vert = "|";
  var Vert = "‖";
  var VerticalBar = "∣";
  var VerticalLine = "|";
  var VerticalSeparator = "❘";
  var VerticalTilde = "≀";
  var VeryThinSpace = " ";
  var Vfr = "𝔙";
  var vfr = "𝔳";
  var vltri = "⊲";
  var vnsub = "⊂⃒";
  var vnsup = "⊃⃒";
  var Vopf = "𝕍";
  var vopf = "𝕧";
  var vprop = "∝";
  var vrtri = "⊳";
  var Vscr = "𝒱";
  var vscr = "𝓋";
  var vsubnE = "⫋︀";
  var vsubne = "⊊︀";
  var vsupnE = "⫌︀";
  var vsupne = "⊋︀";
  var Vvdash = "⊪";
  var vzigzag = "⦚";
  var Wcirc = "Ŵ";
  var wcirc = "ŵ";
  var wedbar = "⩟";
  var wedge = "∧";
  var Wedge = "⋀";
  var wedgeq = "≙";
  var weierp = "℘";
  var Wfr = "𝔚";
  var wfr = "𝔴";
  var Wopf = "𝕎";
  var wopf = "𝕨";
  var wp = "℘";
  var wr = "≀";
  var wreath = "≀";
  var Wscr = "𝒲";
  var wscr = "𝓌";
  var xcap = "⋂";
  var xcirc = "◯";
  var xcup = "⋃";
  var xdtri = "▽";
  var Xfr = "𝔛";
  var xfr = "𝔵";
  var xharr = "⟷";
  var xhArr = "⟺";
  var Xi = "Ξ";
  var xi = "ξ";
  var xlarr = "⟵";
  var xlArr = "⟸";
  var xmap = "⟼";
  var xnis = "⋻";
  var xodot = "⨀";
  var Xopf = "𝕏";
  var xopf = "𝕩";
  var xoplus = "⨁";
  var xotime = "⨂";
  var xrarr = "⟶";
  var xrArr = "⟹";
  var Xscr = "𝒳";
  var xscr = "𝓍";
  var xsqcup = "⨆";
  var xuplus = "⨄";
  var xutri = "△";
  var xvee = "⋁";
  var xwedge = "⋀";
  var Yacute$1 = "Ý";
  var yacute$1 = "ý";
  var YAcy = "Я";
  var yacy = "я";
  var Ycirc = "Ŷ";
  var ycirc = "ŷ";
  var Ycy = "Ы";
  var ycy = "ы";
  var yen$1 = "¥";
  var Yfr = "𝔜";
  var yfr = "𝔶";
  var YIcy = "Ї";
  var yicy = "ї";
  var Yopf = "𝕐";
  var yopf = "𝕪";
  var Yscr = "𝒴";
  var yscr = "𝓎";
  var YUcy = "Ю";
  var yucy = "ю";
  var yuml$1 = "ÿ";
  var Yuml = "Ÿ";
  var Zacute = "Ź";
  var zacute = "ź";
  var Zcaron = "Ž";
  var zcaron = "ž";
  var Zcy = "З";
  var zcy = "з";
  var Zdot = "Ż";
  var zdot = "ż";
  var zeetrf = "ℨ";
  var ZeroWidthSpace = "​";
  var Zeta = "Ζ";
  var zeta = "ζ";
  var zfr = "𝔷";
  var Zfr = "ℨ";
  var ZHcy = "Ж";
  var zhcy = "ж";
  var zigrarr = "⇝";
  var zopf = "𝕫";
  var Zopf = "ℤ";
  var Zscr = "𝒵";
  var zscr = "𝓏";
  var zwj = "‍";
  var zwnj = "‌";
  var require$$1$1 = {
  	Aacute: Aacute$1,
  	aacute: aacute$1,
  	Abreve: Abreve,
  	abreve: abreve,
  	ac: ac,
  	acd: acd,
  	acE: acE,
  	Acirc: Acirc$1,
  	acirc: acirc$1,
  	acute: acute$1,
  	Acy: Acy,
  	acy: acy,
  	AElig: AElig$1,
  	aelig: aelig$1,
  	af: af,
  	Afr: Afr,
  	afr: afr,
  	Agrave: Agrave$1,
  	agrave: agrave$1,
  	alefsym: alefsym,
  	aleph: aleph,
  	Alpha: Alpha,
  	alpha: alpha,
  	Amacr: Amacr,
  	amacr: amacr,
  	amalg: amalg,
  	amp: amp$2,
  	AMP: AMP$1,
  	andand: andand,
  	And: And,
  	and: and,
  	andd: andd,
  	andslope: andslope,
  	andv: andv,
  	ang: ang,
  	ange: ange,
  	angle: angle,
  	angmsdaa: angmsdaa,
  	angmsdab: angmsdab,
  	angmsdac: angmsdac,
  	angmsdad: angmsdad,
  	angmsdae: angmsdae,
  	angmsdaf: angmsdaf,
  	angmsdag: angmsdag,
  	angmsdah: angmsdah,
  	angmsd: angmsd,
  	angrt: angrt,
  	angrtvb: angrtvb,
  	angrtvbd: angrtvbd,
  	angsph: angsph,
  	angst: angst,
  	angzarr: angzarr,
  	Aogon: Aogon,
  	aogon: aogon,
  	Aopf: Aopf,
  	aopf: aopf,
  	apacir: apacir,
  	ap: ap,
  	apE: apE,
  	ape: ape,
  	apid: apid,
  	apos: apos$1,
  	ApplyFunction: ApplyFunction,
  	approx: approx,
  	approxeq: approxeq,
  	Aring: Aring$1,
  	aring: aring$1,
  	Ascr: Ascr,
  	ascr: ascr,
  	Assign: Assign,
  	ast: ast,
  	asymp: asymp,
  	asympeq: asympeq,
  	Atilde: Atilde$1,
  	atilde: atilde$1,
  	Auml: Auml$1,
  	auml: auml$1,
  	awconint: awconint,
  	awint: awint,
  	backcong: backcong,
  	backepsilon: backepsilon,
  	backprime: backprime,
  	backsim: backsim,
  	backsimeq: backsimeq,
  	Backslash: Backslash,
  	Barv: Barv,
  	barvee: barvee,
  	barwed: barwed,
  	Barwed: Barwed,
  	barwedge: barwedge,
  	bbrk: bbrk,
  	bbrktbrk: bbrktbrk,
  	bcong: bcong,
  	Bcy: Bcy,
  	bcy: bcy,
  	bdquo: bdquo,
  	becaus: becaus,
  	because: because,
  	Because: Because,
  	bemptyv: bemptyv,
  	bepsi: bepsi,
  	bernou: bernou,
  	Bernoullis: Bernoullis,
  	Beta: Beta,
  	beta: beta,
  	beth: beth,
  	between: between,
  	Bfr: Bfr,
  	bfr: bfr,
  	bigcap: bigcap,
  	bigcirc: bigcirc,
  	bigcup: bigcup,
  	bigodot: bigodot,
  	bigoplus: bigoplus,
  	bigotimes: bigotimes,
  	bigsqcup: bigsqcup,
  	bigstar: bigstar,
  	bigtriangledown: bigtriangledown,
  	bigtriangleup: bigtriangleup,
  	biguplus: biguplus,
  	bigvee: bigvee,
  	bigwedge: bigwedge,
  	bkarow: bkarow,
  	blacklozenge: blacklozenge,
  	blacksquare: blacksquare,
  	blacktriangle: blacktriangle,
  	blacktriangledown: blacktriangledown,
  	blacktriangleleft: blacktriangleleft,
  	blacktriangleright: blacktriangleright,
  	blank: blank,
  	blk12: blk12,
  	blk14: blk14,
  	blk34: blk34,
  	block: block,
  	bne: bne,
  	bnequiv: bnequiv,
  	bNot: bNot,
  	bnot: bnot,
  	Bopf: Bopf,
  	bopf: bopf,
  	bot: bot,
  	bottom: bottom,
  	bowtie: bowtie,
  	boxbox: boxbox,
  	boxdl: boxdl,
  	boxdL: boxdL,
  	boxDl: boxDl,
  	boxDL: boxDL,
  	boxdr: boxdr,
  	boxdR: boxdR,
  	boxDr: boxDr,
  	boxDR: boxDR,
  	boxh: boxh,
  	boxH: boxH,
  	boxhd: boxhd,
  	boxHd: boxHd,
  	boxhD: boxhD,
  	boxHD: boxHD,
  	boxhu: boxhu,
  	boxHu: boxHu,
  	boxhU: boxhU,
  	boxHU: boxHU,
  	boxminus: boxminus,
  	boxplus: boxplus,
  	boxtimes: boxtimes,
  	boxul: boxul,
  	boxuL: boxuL,
  	boxUl: boxUl,
  	boxUL: boxUL,
  	boxur: boxur,
  	boxuR: boxuR,
  	boxUr: boxUr,
  	boxUR: boxUR,
  	boxv: boxv,
  	boxV: boxV,
  	boxvh: boxvh,
  	boxvH: boxvH,
  	boxVh: boxVh,
  	boxVH: boxVH,
  	boxvl: boxvl,
  	boxvL: boxvL,
  	boxVl: boxVl,
  	boxVL: boxVL,
  	boxvr: boxvr,
  	boxvR: boxvR,
  	boxVr: boxVr,
  	boxVR: boxVR,
  	bprime: bprime,
  	breve: breve,
  	Breve: Breve,
  	brvbar: brvbar$1,
  	bscr: bscr,
  	Bscr: Bscr,
  	bsemi: bsemi,
  	bsim: bsim,
  	bsime: bsime,
  	bsolb: bsolb,
  	bsol: bsol,
  	bsolhsub: bsolhsub,
  	bull: bull,
  	bullet: bullet,
  	bump: bump,
  	bumpE: bumpE,
  	bumpe: bumpe,
  	Bumpeq: Bumpeq,
  	bumpeq: bumpeq,
  	Cacute: Cacute,
  	cacute: cacute,
  	capand: capand,
  	capbrcup: capbrcup,
  	capcap: capcap,
  	cap: cap,
  	Cap: Cap,
  	capcup: capcup,
  	capdot: capdot,
  	CapitalDifferentialD: CapitalDifferentialD,
  	caps: caps,
  	caret: caret,
  	caron: caron,
  	Cayleys: Cayleys,
  	ccaps: ccaps,
  	Ccaron: Ccaron,
  	ccaron: ccaron,
  	Ccedil: Ccedil$1,
  	ccedil: ccedil$1,
  	Ccirc: Ccirc,
  	ccirc: ccirc,
  	Cconint: Cconint,
  	ccups: ccups,
  	ccupssm: ccupssm,
  	Cdot: Cdot,
  	cdot: cdot,
  	cedil: cedil$1,
  	Cedilla: Cedilla,
  	cemptyv: cemptyv,
  	cent: cent$1,
  	centerdot: centerdot,
  	CenterDot: CenterDot,
  	cfr: cfr,
  	Cfr: Cfr,
  	CHcy: CHcy,
  	chcy: chcy,
  	check: check,
  	checkmark: checkmark,
  	Chi: Chi,
  	chi: chi,
  	circ: circ,
  	circeq: circeq,
  	circlearrowleft: circlearrowleft,
  	circlearrowright: circlearrowright,
  	circledast: circledast,
  	circledcirc: circledcirc,
  	circleddash: circleddash,
  	CircleDot: CircleDot,
  	circledR: circledR,
  	circledS: circledS,
  	CircleMinus: CircleMinus,
  	CirclePlus: CirclePlus,
  	CircleTimes: CircleTimes,
  	cir: cir,
  	cirE: cirE,
  	cire: cire,
  	cirfnint: cirfnint,
  	cirmid: cirmid,
  	cirscir: cirscir,
  	ClockwiseContourIntegral: ClockwiseContourIntegral,
  	CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
  	CloseCurlyQuote: CloseCurlyQuote,
  	clubs: clubs,
  	clubsuit: clubsuit,
  	colon: colon,
  	Colon: Colon,
  	Colone: Colone,
  	colone: colone,
  	coloneq: coloneq,
  	comma: comma,
  	commat: commat,
  	comp: comp,
  	compfn: compfn,
  	complement: complement,
  	complexes: complexes,
  	cong: cong,
  	congdot: congdot,
  	Congruent: Congruent,
  	conint: conint,
  	Conint: Conint,
  	ContourIntegral: ContourIntegral,
  	copf: copf,
  	Copf: Copf,
  	coprod: coprod,
  	Coproduct: Coproduct,
  	copy: copy$1,
  	COPY: COPY$1,
  	copysr: copysr,
  	CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
  	crarr: crarr,
  	cross: cross,
  	Cross: Cross,
  	Cscr: Cscr,
  	cscr: cscr,
  	csub: csub,
  	csube: csube,
  	csup: csup,
  	csupe: csupe,
  	ctdot: ctdot,
  	cudarrl: cudarrl,
  	cudarrr: cudarrr,
  	cuepr: cuepr,
  	cuesc: cuesc,
  	cularr: cularr,
  	cularrp: cularrp,
  	cupbrcap: cupbrcap,
  	cupcap: cupcap,
  	CupCap: CupCap,
  	cup: cup,
  	Cup: Cup,
  	cupcup: cupcup,
  	cupdot: cupdot,
  	cupor: cupor,
  	cups: cups,
  	curarr: curarr,
  	curarrm: curarrm,
  	curlyeqprec: curlyeqprec,
  	curlyeqsucc: curlyeqsucc,
  	curlyvee: curlyvee,
  	curlywedge: curlywedge,
  	curren: curren$1,
  	curvearrowleft: curvearrowleft,
  	curvearrowright: curvearrowright,
  	cuvee: cuvee,
  	cuwed: cuwed,
  	cwconint: cwconint,
  	cwint: cwint,
  	cylcty: cylcty,
  	dagger: dagger,
  	Dagger: Dagger,
  	daleth: daleth,
  	darr: darr,
  	Darr: Darr,
  	dArr: dArr,
  	dash: dash,
  	Dashv: Dashv,
  	dashv: dashv,
  	dbkarow: dbkarow,
  	dblac: dblac,
  	Dcaron: Dcaron,
  	dcaron: dcaron,
  	Dcy: Dcy,
  	dcy: dcy,
  	ddagger: ddagger,
  	ddarr: ddarr,
  	DD: DD,
  	dd: dd,
  	DDotrahd: DDotrahd,
  	ddotseq: ddotseq,
  	deg: deg$1,
  	Del: Del,
  	Delta: Delta,
  	delta: delta,
  	demptyv: demptyv,
  	dfisht: dfisht,
  	Dfr: Dfr,
  	dfr: dfr,
  	dHar: dHar,
  	dharl: dharl,
  	dharr: dharr,
  	DiacriticalAcute: DiacriticalAcute,
  	DiacriticalDot: DiacriticalDot,
  	DiacriticalDoubleAcute: DiacriticalDoubleAcute,
  	DiacriticalGrave: DiacriticalGrave,
  	DiacriticalTilde: DiacriticalTilde,
  	diam: diam,
  	diamond: diamond,
  	Diamond: Diamond,
  	diamondsuit: diamondsuit,
  	diams: diams,
  	die: die,
  	DifferentialD: DifferentialD,
  	digamma: digamma,
  	disin: disin,
  	div: div,
  	divide: divide$1,
  	divideontimes: divideontimes,
  	divonx: divonx,
  	DJcy: DJcy,
  	djcy: djcy,
  	dlcorn: dlcorn,
  	dlcrop: dlcrop,
  	dollar: dollar,
  	Dopf: Dopf,
  	dopf: dopf,
  	Dot: Dot,
  	dot: dot,
  	DotDot: DotDot,
  	doteq: doteq,
  	doteqdot: doteqdot,
  	DotEqual: DotEqual,
  	dotminus: dotminus,
  	dotplus: dotplus,
  	dotsquare: dotsquare,
  	doublebarwedge: doublebarwedge,
  	DoubleContourIntegral: DoubleContourIntegral,
  	DoubleDot: DoubleDot,
  	DoubleDownArrow: DoubleDownArrow,
  	DoubleLeftArrow: DoubleLeftArrow,
  	DoubleLeftRightArrow: DoubleLeftRightArrow,
  	DoubleLeftTee: DoubleLeftTee,
  	DoubleLongLeftArrow: DoubleLongLeftArrow,
  	DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
  	DoubleLongRightArrow: DoubleLongRightArrow,
  	DoubleRightArrow: DoubleRightArrow,
  	DoubleRightTee: DoubleRightTee,
  	DoubleUpArrow: DoubleUpArrow,
  	DoubleUpDownArrow: DoubleUpDownArrow,
  	DoubleVerticalBar: DoubleVerticalBar,
  	DownArrowBar: DownArrowBar,
  	downarrow: downarrow,
  	DownArrow: DownArrow,
  	Downarrow: Downarrow,
  	DownArrowUpArrow: DownArrowUpArrow,
  	DownBreve: DownBreve,
  	downdownarrows: downdownarrows,
  	downharpoonleft: downharpoonleft,
  	downharpoonright: downharpoonright,
  	DownLeftRightVector: DownLeftRightVector,
  	DownLeftTeeVector: DownLeftTeeVector,
  	DownLeftVectorBar: DownLeftVectorBar,
  	DownLeftVector: DownLeftVector,
  	DownRightTeeVector: DownRightTeeVector,
  	DownRightVectorBar: DownRightVectorBar,
  	DownRightVector: DownRightVector,
  	DownTeeArrow: DownTeeArrow,
  	DownTee: DownTee,
  	drbkarow: drbkarow,
  	drcorn: drcorn,
  	drcrop: drcrop,
  	Dscr: Dscr,
  	dscr: dscr,
  	DScy: DScy,
  	dscy: dscy,
  	dsol: dsol,
  	Dstrok: Dstrok,
  	dstrok: dstrok,
  	dtdot: dtdot,
  	dtri: dtri,
  	dtrif: dtrif,
  	duarr: duarr,
  	duhar: duhar,
  	dwangle: dwangle,
  	DZcy: DZcy,
  	dzcy: dzcy,
  	dzigrarr: dzigrarr,
  	Eacute: Eacute$1,
  	eacute: eacute$1,
  	easter: easter,
  	Ecaron: Ecaron,
  	ecaron: ecaron,
  	Ecirc: Ecirc$1,
  	ecirc: ecirc$1,
  	ecir: ecir,
  	ecolon: ecolon,
  	Ecy: Ecy,
  	ecy: ecy,
  	eDDot: eDDot,
  	Edot: Edot,
  	edot: edot,
  	eDot: eDot,
  	ee: ee,
  	efDot: efDot,
  	Efr: Efr,
  	efr: efr,
  	eg: eg,
  	Egrave: Egrave$1,
  	egrave: egrave$1,
  	egs: egs,
  	egsdot: egsdot,
  	el: el,
  	Element: Element$1,
  	elinters: elinters,
  	ell: ell,
  	els: els,
  	elsdot: elsdot,
  	Emacr: Emacr,
  	emacr: emacr,
  	empty: empty,
  	emptyset: emptyset,
  	EmptySmallSquare: EmptySmallSquare,
  	emptyv: emptyv,
  	EmptyVerySmallSquare: EmptyVerySmallSquare,
  	emsp13: emsp13,
  	emsp14: emsp14,
  	emsp: emsp,
  	ENG: ENG,
  	eng: eng,
  	ensp: ensp,
  	Eogon: Eogon,
  	eogon: eogon,
  	Eopf: Eopf,
  	eopf: eopf,
  	epar: epar,
  	eparsl: eparsl,
  	eplus: eplus,
  	epsi: epsi,
  	Epsilon: Epsilon,
  	epsilon: epsilon,
  	epsiv: epsiv,
  	eqcirc: eqcirc,
  	eqcolon: eqcolon,
  	eqsim: eqsim,
  	eqslantgtr: eqslantgtr,
  	eqslantless: eqslantless,
  	Equal: Equal,
  	equals: equals,
  	EqualTilde: EqualTilde,
  	equest: equest,
  	Equilibrium: Equilibrium,
  	equiv: equiv,
  	equivDD: equivDD,
  	eqvparsl: eqvparsl,
  	erarr: erarr,
  	erDot: erDot,
  	escr: escr,
  	Escr: Escr,
  	esdot: esdot,
  	Esim: Esim,
  	esim: esim,
  	Eta: Eta,
  	eta: eta,
  	ETH: ETH$1,
  	eth: eth$1,
  	Euml: Euml$1,
  	euml: euml$1,
  	euro: euro,
  	excl: excl,
  	exist: exist,
  	Exists: Exists,
  	expectation: expectation,
  	exponentiale: exponentiale,
  	ExponentialE: ExponentialE,
  	fallingdotseq: fallingdotseq,
  	Fcy: Fcy,
  	fcy: fcy,
  	female: female,
  	ffilig: ffilig,
  	fflig: fflig,
  	ffllig: ffllig,
  	Ffr: Ffr,
  	ffr: ffr,
  	filig: filig,
  	FilledSmallSquare: FilledSmallSquare,
  	FilledVerySmallSquare: FilledVerySmallSquare,
  	fjlig: fjlig,
  	flat: flat,
  	fllig: fllig,
  	fltns: fltns,
  	fnof: fnof,
  	Fopf: Fopf,
  	fopf: fopf,
  	forall: forall,
  	ForAll: ForAll,
  	fork: fork,
  	forkv: forkv,
  	Fouriertrf: Fouriertrf,
  	fpartint: fpartint,
  	frac12: frac12$1,
  	frac13: frac13,
  	frac14: frac14$1,
  	frac15: frac15,
  	frac16: frac16,
  	frac18: frac18,
  	frac23: frac23,
  	frac25: frac25,
  	frac34: frac34$1,
  	frac35: frac35,
  	frac38: frac38,
  	frac45: frac45,
  	frac56: frac56,
  	frac58: frac58,
  	frac78: frac78,
  	frasl: frasl,
  	frown: frown,
  	fscr: fscr,
  	Fscr: Fscr,
  	gacute: gacute,
  	Gamma: Gamma,
  	gamma: gamma,
  	Gammad: Gammad,
  	gammad: gammad,
  	gap: gap,
  	Gbreve: Gbreve,
  	gbreve: gbreve,
  	Gcedil: Gcedil,
  	Gcirc: Gcirc,
  	gcirc: gcirc,
  	Gcy: Gcy,
  	gcy: gcy,
  	Gdot: Gdot,
  	gdot: gdot,
  	ge: ge,
  	gE: gE,
  	gEl: gEl,
  	gel: gel,
  	geq: geq,
  	geqq: geqq,
  	geqslant: geqslant,
  	gescc: gescc,
  	ges: ges,
  	gesdot: gesdot,
  	gesdoto: gesdoto,
  	gesdotol: gesdotol,
  	gesl: gesl,
  	gesles: gesles,
  	Gfr: Gfr,
  	gfr: gfr,
  	gg: gg,
  	Gg: Gg,
  	ggg: ggg,
  	gimel: gimel,
  	GJcy: GJcy,
  	gjcy: gjcy,
  	gla: gla,
  	gl: gl,
  	glE: glE,
  	glj: glj,
  	gnap: gnap,
  	gnapprox: gnapprox,
  	gne: gne,
  	gnE: gnE,
  	gneq: gneq,
  	gneqq: gneqq,
  	gnsim: gnsim,
  	Gopf: Gopf,
  	gopf: gopf,
  	grave: grave,
  	GreaterEqual: GreaterEqual,
  	GreaterEqualLess: GreaterEqualLess,
  	GreaterFullEqual: GreaterFullEqual,
  	GreaterGreater: GreaterGreater,
  	GreaterLess: GreaterLess,
  	GreaterSlantEqual: GreaterSlantEqual,
  	GreaterTilde: GreaterTilde,
  	Gscr: Gscr,
  	gscr: gscr,
  	gsim: gsim,
  	gsime: gsime,
  	gsiml: gsiml,
  	gtcc: gtcc,
  	gtcir: gtcir,
  	gt: gt$2,
  	GT: GT$1,
  	Gt: Gt,
  	gtdot: gtdot,
  	gtlPar: gtlPar,
  	gtquest: gtquest,
  	gtrapprox: gtrapprox,
  	gtrarr: gtrarr,
  	gtrdot: gtrdot,
  	gtreqless: gtreqless,
  	gtreqqless: gtreqqless,
  	gtrless: gtrless,
  	gtrsim: gtrsim,
  	gvertneqq: gvertneqq,
  	gvnE: gvnE,
  	Hacek: Hacek,
  	hairsp: hairsp,
  	half: half,
  	hamilt: hamilt,
  	HARDcy: HARDcy,
  	hardcy: hardcy,
  	harrcir: harrcir,
  	harr: harr,
  	hArr: hArr,
  	harrw: harrw,
  	Hat: Hat,
  	hbar: hbar,
  	Hcirc: Hcirc,
  	hcirc: hcirc,
  	hearts: hearts,
  	heartsuit: heartsuit,
  	hellip: hellip,
  	hercon: hercon,
  	hfr: hfr,
  	Hfr: Hfr,
  	HilbertSpace: HilbertSpace,
  	hksearow: hksearow,
  	hkswarow: hkswarow,
  	hoarr: hoarr,
  	homtht: homtht,
  	hookleftarrow: hookleftarrow,
  	hookrightarrow: hookrightarrow,
  	hopf: hopf,
  	Hopf: Hopf,
  	horbar: horbar,
  	HorizontalLine: HorizontalLine,
  	hscr: hscr,
  	Hscr: Hscr,
  	hslash: hslash,
  	Hstrok: Hstrok,
  	hstrok: hstrok,
  	HumpDownHump: HumpDownHump,
  	HumpEqual: HumpEqual,
  	hybull: hybull,
  	hyphen: hyphen,
  	Iacute: Iacute$1,
  	iacute: iacute$1,
  	ic: ic,
  	Icirc: Icirc$1,
  	icirc: icirc$1,
  	Icy: Icy,
  	icy: icy,
  	Idot: Idot,
  	IEcy: IEcy,
  	iecy: iecy,
  	iexcl: iexcl$1,
  	iff: iff,
  	ifr: ifr,
  	Ifr: Ifr,
  	Igrave: Igrave$1,
  	igrave: igrave$1,
  	ii: ii,
  	iiiint: iiiint,
  	iiint: iiint,
  	iinfin: iinfin,
  	iiota: iiota,
  	IJlig: IJlig,
  	ijlig: ijlig,
  	Imacr: Imacr,
  	imacr: imacr,
  	image: image,
  	ImaginaryI: ImaginaryI,
  	imagline: imagline,
  	imagpart: imagpart,
  	imath: imath,
  	Im: Im,
  	imof: imof,
  	imped: imped,
  	Implies: Implies,
  	incare: incare,
  	"in": "∈",
  	infin: infin,
  	infintie: infintie,
  	inodot: inodot,
  	intcal: intcal,
  	int: int,
  	Int: Int,
  	integers: integers,
  	Integral: Integral,
  	intercal: intercal,
  	Intersection: Intersection,
  	intlarhk: intlarhk,
  	intprod: intprod,
  	InvisibleComma: InvisibleComma,
  	InvisibleTimes: InvisibleTimes,
  	IOcy: IOcy,
  	iocy: iocy,
  	Iogon: Iogon,
  	iogon: iogon,
  	Iopf: Iopf,
  	iopf: iopf,
  	Iota: Iota,
  	iota: iota,
  	iprod: iprod,
  	iquest: iquest$1,
  	iscr: iscr,
  	Iscr: Iscr,
  	isin: isin,
  	isindot: isindot,
  	isinE: isinE,
  	isins: isins,
  	isinsv: isinsv,
  	isinv: isinv,
  	it: it,
  	Itilde: Itilde,
  	itilde: itilde,
  	Iukcy: Iukcy,
  	iukcy: iukcy,
  	Iuml: Iuml$1,
  	iuml: iuml$1,
  	Jcirc: Jcirc,
  	jcirc: jcirc,
  	Jcy: Jcy,
  	jcy: jcy,
  	Jfr: Jfr,
  	jfr: jfr,
  	jmath: jmath,
  	Jopf: Jopf,
  	jopf: jopf,
  	Jscr: Jscr,
  	jscr: jscr,
  	Jsercy: Jsercy,
  	jsercy: jsercy,
  	Jukcy: Jukcy,
  	jukcy: jukcy,
  	Kappa: Kappa,
  	kappa: kappa,
  	kappav: kappav,
  	Kcedil: Kcedil,
  	kcedil: kcedil,
  	Kcy: Kcy,
  	kcy: kcy,
  	Kfr: Kfr,
  	kfr: kfr,
  	kgreen: kgreen,
  	KHcy: KHcy,
  	khcy: khcy,
  	KJcy: KJcy,
  	kjcy: kjcy,
  	Kopf: Kopf,
  	kopf: kopf,
  	Kscr: Kscr,
  	kscr: kscr,
  	lAarr: lAarr,
  	Lacute: Lacute,
  	lacute: lacute,
  	laemptyv: laemptyv,
  	lagran: lagran,
  	Lambda: Lambda,
  	lambda: lambda,
  	lang: lang,
  	Lang: Lang,
  	langd: langd,
  	langle: langle,
  	lap: lap,
  	Laplacetrf: Laplacetrf,
  	laquo: laquo$1,
  	larrb: larrb,
  	larrbfs: larrbfs,
  	larr: larr,
  	Larr: Larr,
  	lArr: lArr,
  	larrfs: larrfs,
  	larrhk: larrhk,
  	larrlp: larrlp,
  	larrpl: larrpl,
  	larrsim: larrsim,
  	larrtl: larrtl,
  	latail: latail,
  	lAtail: lAtail,
  	lat: lat,
  	late: late,
  	lates: lates,
  	lbarr: lbarr,
  	lBarr: lBarr,
  	lbbrk: lbbrk,
  	lbrace: lbrace,
  	lbrack: lbrack,
  	lbrke: lbrke,
  	lbrksld: lbrksld,
  	lbrkslu: lbrkslu,
  	Lcaron: Lcaron,
  	lcaron: lcaron,
  	Lcedil: Lcedil,
  	lcedil: lcedil,
  	lceil: lceil,
  	lcub: lcub,
  	Lcy: Lcy,
  	lcy: lcy,
  	ldca: ldca,
  	ldquo: ldquo,
  	ldquor: ldquor,
  	ldrdhar: ldrdhar,
  	ldrushar: ldrushar,
  	ldsh: ldsh,
  	le: le,
  	lE: lE,
  	LeftAngleBracket: LeftAngleBracket,
  	LeftArrowBar: LeftArrowBar,
  	leftarrow: leftarrow,
  	LeftArrow: LeftArrow,
  	Leftarrow: Leftarrow,
  	LeftArrowRightArrow: LeftArrowRightArrow,
  	leftarrowtail: leftarrowtail,
  	LeftCeiling: LeftCeiling,
  	LeftDoubleBracket: LeftDoubleBracket,
  	LeftDownTeeVector: LeftDownTeeVector,
  	LeftDownVectorBar: LeftDownVectorBar,
  	LeftDownVector: LeftDownVector,
  	LeftFloor: LeftFloor,
  	leftharpoondown: leftharpoondown,
  	leftharpoonup: leftharpoonup,
  	leftleftarrows: leftleftarrows,
  	leftrightarrow: leftrightarrow,
  	LeftRightArrow: LeftRightArrow,
  	Leftrightarrow: Leftrightarrow,
  	leftrightarrows: leftrightarrows,
  	leftrightharpoons: leftrightharpoons,
  	leftrightsquigarrow: leftrightsquigarrow,
  	LeftRightVector: LeftRightVector,
  	LeftTeeArrow: LeftTeeArrow,
  	LeftTee: LeftTee,
  	LeftTeeVector: LeftTeeVector,
  	leftthreetimes: leftthreetimes,
  	LeftTriangleBar: LeftTriangleBar,
  	LeftTriangle: LeftTriangle,
  	LeftTriangleEqual: LeftTriangleEqual,
  	LeftUpDownVector: LeftUpDownVector,
  	LeftUpTeeVector: LeftUpTeeVector,
  	LeftUpVectorBar: LeftUpVectorBar,
  	LeftUpVector: LeftUpVector,
  	LeftVectorBar: LeftVectorBar,
  	LeftVector: LeftVector,
  	lEg: lEg,
  	leg: leg,
  	leq: leq,
  	leqq: leqq,
  	leqslant: leqslant,
  	lescc: lescc,
  	les: les,
  	lesdot: lesdot,
  	lesdoto: lesdoto,
  	lesdotor: lesdotor,
  	lesg: lesg,
  	lesges: lesges,
  	lessapprox: lessapprox,
  	lessdot: lessdot,
  	lesseqgtr: lesseqgtr,
  	lesseqqgtr: lesseqqgtr,
  	LessEqualGreater: LessEqualGreater,
  	LessFullEqual: LessFullEqual,
  	LessGreater: LessGreater,
  	lessgtr: lessgtr,
  	LessLess: LessLess,
  	lesssim: lesssim,
  	LessSlantEqual: LessSlantEqual,
  	LessTilde: LessTilde,
  	lfisht: lfisht,
  	lfloor: lfloor,
  	Lfr: Lfr,
  	lfr: lfr,
  	lg: lg,
  	lgE: lgE,
  	lHar: lHar,
  	lhard: lhard,
  	lharu: lharu,
  	lharul: lharul,
  	lhblk: lhblk,
  	LJcy: LJcy,
  	ljcy: ljcy,
  	llarr: llarr,
  	ll: ll,
  	Ll: Ll,
  	llcorner: llcorner,
  	Lleftarrow: Lleftarrow,
  	llhard: llhard,
  	lltri: lltri,
  	Lmidot: Lmidot,
  	lmidot: lmidot,
  	lmoustache: lmoustache,
  	lmoust: lmoust,
  	lnap: lnap,
  	lnapprox: lnapprox,
  	lne: lne,
  	lnE: lnE,
  	lneq: lneq,
  	lneqq: lneqq,
  	lnsim: lnsim,
  	loang: loang,
  	loarr: loarr,
  	lobrk: lobrk,
  	longleftarrow: longleftarrow,
  	LongLeftArrow: LongLeftArrow,
  	Longleftarrow: Longleftarrow,
  	longleftrightarrow: longleftrightarrow,
  	LongLeftRightArrow: LongLeftRightArrow,
  	Longleftrightarrow: Longleftrightarrow,
  	longmapsto: longmapsto,
  	longrightarrow: longrightarrow,
  	LongRightArrow: LongRightArrow,
  	Longrightarrow: Longrightarrow,
  	looparrowleft: looparrowleft,
  	looparrowright: looparrowright,
  	lopar: lopar,
  	Lopf: Lopf,
  	lopf: lopf,
  	loplus: loplus,
  	lotimes: lotimes,
  	lowast: lowast,
  	lowbar: lowbar,
  	LowerLeftArrow: LowerLeftArrow,
  	LowerRightArrow: LowerRightArrow,
  	loz: loz,
  	lozenge: lozenge,
  	lozf: lozf,
  	lpar: lpar,
  	lparlt: lparlt,
  	lrarr: lrarr,
  	lrcorner: lrcorner,
  	lrhar: lrhar,
  	lrhard: lrhard,
  	lrm: lrm,
  	lrtri: lrtri,
  	lsaquo: lsaquo,
  	lscr: lscr,
  	Lscr: Lscr,
  	lsh: lsh,
  	Lsh: Lsh,
  	lsim: lsim,
  	lsime: lsime,
  	lsimg: lsimg,
  	lsqb: lsqb,
  	lsquo: lsquo,
  	lsquor: lsquor,
  	Lstrok: Lstrok,
  	lstrok: lstrok,
  	ltcc: ltcc,
  	ltcir: ltcir,
  	lt: lt$2,
  	LT: LT$1,
  	Lt: Lt,
  	ltdot: ltdot,
  	lthree: lthree,
  	ltimes: ltimes,
  	ltlarr: ltlarr,
  	ltquest: ltquest,
  	ltri: ltri,
  	ltrie: ltrie,
  	ltrif: ltrif,
  	ltrPar: ltrPar,
  	lurdshar: lurdshar,
  	luruhar: luruhar,
  	lvertneqq: lvertneqq,
  	lvnE: lvnE,
  	macr: macr$1,
  	male: male,
  	malt: malt,
  	maltese: maltese,
  	"Map": "⤅",
  	map: map,
  	mapsto: mapsto,
  	mapstodown: mapstodown,
  	mapstoleft: mapstoleft,
  	mapstoup: mapstoup,
  	marker: marker,
  	mcomma: mcomma,
  	Mcy: Mcy,
  	mcy: mcy,
  	mdash: mdash,
  	mDDot: mDDot,
  	measuredangle: measuredangle,
  	MediumSpace: MediumSpace,
  	Mellintrf: Mellintrf,
  	Mfr: Mfr,
  	mfr: mfr,
  	mho: mho,
  	micro: micro$1,
  	midast: midast,
  	midcir: midcir,
  	mid: mid,
  	middot: middot$1,
  	minusb: minusb,
  	minus: minus,
  	minusd: minusd,
  	minusdu: minusdu,
  	MinusPlus: MinusPlus,
  	mlcp: mlcp,
  	mldr: mldr,
  	mnplus: mnplus,
  	models: models,
  	Mopf: Mopf,
  	mopf: mopf,
  	mp: mp,
  	mscr: mscr,
  	Mscr: Mscr,
  	mstpos: mstpos,
  	Mu: Mu,
  	mu: mu,
  	multimap: multimap,
  	mumap: mumap,
  	nabla: nabla,
  	Nacute: Nacute,
  	nacute: nacute,
  	nang: nang,
  	nap: nap,
  	napE: napE,
  	napid: napid,
  	napos: napos,
  	napprox: napprox,
  	natural: natural,
  	naturals: naturals,
  	natur: natur,
  	nbsp: nbsp$1,
  	nbump: nbump,
  	nbumpe: nbumpe,
  	ncap: ncap,
  	Ncaron: Ncaron,
  	ncaron: ncaron,
  	Ncedil: Ncedil,
  	ncedil: ncedil,
  	ncong: ncong,
  	ncongdot: ncongdot,
  	ncup: ncup,
  	Ncy: Ncy,
  	ncy: ncy,
  	ndash: ndash,
  	nearhk: nearhk,
  	nearr: nearr,
  	neArr: neArr,
  	nearrow: nearrow,
  	ne: ne,
  	nedot: nedot,
  	NegativeMediumSpace: NegativeMediumSpace,
  	NegativeThickSpace: NegativeThickSpace,
  	NegativeThinSpace: NegativeThinSpace,
  	NegativeVeryThinSpace: NegativeVeryThinSpace,
  	nequiv: nequiv,
  	nesear: nesear,
  	nesim: nesim,
  	NestedGreaterGreater: NestedGreaterGreater,
  	NestedLessLess: NestedLessLess,
  	NewLine: NewLine,
  	nexist: nexist,
  	nexists: nexists,
  	Nfr: Nfr,
  	nfr: nfr,
  	ngE: ngE,
  	nge: nge,
  	ngeq: ngeq,
  	ngeqq: ngeqq,
  	ngeqslant: ngeqslant,
  	nges: nges,
  	nGg: nGg,
  	ngsim: ngsim,
  	nGt: nGt,
  	ngt: ngt,
  	ngtr: ngtr,
  	nGtv: nGtv,
  	nharr: nharr,
  	nhArr: nhArr,
  	nhpar: nhpar,
  	ni: ni,
  	nis: nis,
  	nisd: nisd,
  	niv: niv,
  	NJcy: NJcy,
  	njcy: njcy,
  	nlarr: nlarr,
  	nlArr: nlArr,
  	nldr: nldr,
  	nlE: nlE,
  	nle: nle,
  	nleftarrow: nleftarrow,
  	nLeftarrow: nLeftarrow,
  	nleftrightarrow: nleftrightarrow,
  	nLeftrightarrow: nLeftrightarrow,
  	nleq: nleq,
  	nleqq: nleqq,
  	nleqslant: nleqslant,
  	nles: nles,
  	nless: nless,
  	nLl: nLl,
  	nlsim: nlsim,
  	nLt: nLt,
  	nlt: nlt,
  	nltri: nltri,
  	nltrie: nltrie,
  	nLtv: nLtv,
  	nmid: nmid,
  	NoBreak: NoBreak,
  	NonBreakingSpace: NonBreakingSpace,
  	nopf: nopf,
  	Nopf: Nopf,
  	Not: Not,
  	not: not$1,
  	NotCongruent: NotCongruent,
  	NotCupCap: NotCupCap,
  	NotDoubleVerticalBar: NotDoubleVerticalBar,
  	NotElement: NotElement,
  	NotEqual: NotEqual,
  	NotEqualTilde: NotEqualTilde,
  	NotExists: NotExists,
  	NotGreater: NotGreater,
  	NotGreaterEqual: NotGreaterEqual,
  	NotGreaterFullEqual: NotGreaterFullEqual,
  	NotGreaterGreater: NotGreaterGreater,
  	NotGreaterLess: NotGreaterLess,
  	NotGreaterSlantEqual: NotGreaterSlantEqual,
  	NotGreaterTilde: NotGreaterTilde,
  	NotHumpDownHump: NotHumpDownHump,
  	NotHumpEqual: NotHumpEqual,
  	notin: notin,
  	notindot: notindot,
  	notinE: notinE,
  	notinva: notinva,
  	notinvb: notinvb,
  	notinvc: notinvc,
  	NotLeftTriangleBar: NotLeftTriangleBar,
  	NotLeftTriangle: NotLeftTriangle,
  	NotLeftTriangleEqual: NotLeftTriangleEqual,
  	NotLess: NotLess,
  	NotLessEqual: NotLessEqual,
  	NotLessGreater: NotLessGreater,
  	NotLessLess: NotLessLess,
  	NotLessSlantEqual: NotLessSlantEqual,
  	NotLessTilde: NotLessTilde,
  	NotNestedGreaterGreater: NotNestedGreaterGreater,
  	NotNestedLessLess: NotNestedLessLess,
  	notni: notni,
  	notniva: notniva,
  	notnivb: notnivb,
  	notnivc: notnivc,
  	NotPrecedes: NotPrecedes,
  	NotPrecedesEqual: NotPrecedesEqual,
  	NotPrecedesSlantEqual: NotPrecedesSlantEqual,
  	NotReverseElement: NotReverseElement,
  	NotRightTriangleBar: NotRightTriangleBar,
  	NotRightTriangle: NotRightTriangle,
  	NotRightTriangleEqual: NotRightTriangleEqual,
  	NotSquareSubset: NotSquareSubset,
  	NotSquareSubsetEqual: NotSquareSubsetEqual,
  	NotSquareSuperset: NotSquareSuperset,
  	NotSquareSupersetEqual: NotSquareSupersetEqual,
  	NotSubset: NotSubset,
  	NotSubsetEqual: NotSubsetEqual,
  	NotSucceeds: NotSucceeds,
  	NotSucceedsEqual: NotSucceedsEqual,
  	NotSucceedsSlantEqual: NotSucceedsSlantEqual,
  	NotSucceedsTilde: NotSucceedsTilde,
  	NotSuperset: NotSuperset,
  	NotSupersetEqual: NotSupersetEqual,
  	NotTilde: NotTilde,
  	NotTildeEqual: NotTildeEqual,
  	NotTildeFullEqual: NotTildeFullEqual,
  	NotTildeTilde: NotTildeTilde,
  	NotVerticalBar: NotVerticalBar,
  	nparallel: nparallel,
  	npar: npar,
  	nparsl: nparsl,
  	npart: npart,
  	npolint: npolint,
  	npr: npr,
  	nprcue: nprcue,
  	nprec: nprec,
  	npreceq: npreceq,
  	npre: npre,
  	nrarrc: nrarrc,
  	nrarr: nrarr,
  	nrArr: nrArr,
  	nrarrw: nrarrw,
  	nrightarrow: nrightarrow,
  	nRightarrow: nRightarrow,
  	nrtri: nrtri,
  	nrtrie: nrtrie,
  	nsc: nsc,
  	nsccue: nsccue,
  	nsce: nsce,
  	Nscr: Nscr,
  	nscr: nscr,
  	nshortmid: nshortmid,
  	nshortparallel: nshortparallel,
  	nsim: nsim,
  	nsime: nsime,
  	nsimeq: nsimeq,
  	nsmid: nsmid,
  	nspar: nspar,
  	nsqsube: nsqsube,
  	nsqsupe: nsqsupe,
  	nsub: nsub,
  	nsubE: nsubE,
  	nsube: nsube,
  	nsubset: nsubset,
  	nsubseteq: nsubseteq,
  	nsubseteqq: nsubseteqq,
  	nsucc: nsucc,
  	nsucceq: nsucceq,
  	nsup: nsup,
  	nsupE: nsupE,
  	nsupe: nsupe,
  	nsupset: nsupset,
  	nsupseteq: nsupseteq,
  	nsupseteqq: nsupseteqq,
  	ntgl: ntgl,
  	Ntilde: Ntilde$1,
  	ntilde: ntilde$1,
  	ntlg: ntlg,
  	ntriangleleft: ntriangleleft,
  	ntrianglelefteq: ntrianglelefteq,
  	ntriangleright: ntriangleright,
  	ntrianglerighteq: ntrianglerighteq,
  	Nu: Nu,
  	nu: nu,
  	num: num,
  	numero: numero,
  	numsp: numsp,
  	nvap: nvap,
  	nvdash: nvdash,
  	nvDash: nvDash,
  	nVdash: nVdash,
  	nVDash: nVDash,
  	nvge: nvge,
  	nvgt: nvgt,
  	nvHarr: nvHarr,
  	nvinfin: nvinfin,
  	nvlArr: nvlArr,
  	nvle: nvle,
  	nvlt: nvlt,
  	nvltrie: nvltrie,
  	nvrArr: nvrArr,
  	nvrtrie: nvrtrie,
  	nvsim: nvsim,
  	nwarhk: nwarhk,
  	nwarr: nwarr,
  	nwArr: nwArr,
  	nwarrow: nwarrow,
  	nwnear: nwnear,
  	Oacute: Oacute$1,
  	oacute: oacute$1,
  	oast: oast,
  	Ocirc: Ocirc$1,
  	ocirc: ocirc$1,
  	ocir: ocir,
  	Ocy: Ocy,
  	ocy: ocy,
  	odash: odash,
  	Odblac: Odblac,
  	odblac: odblac,
  	odiv: odiv,
  	odot: odot,
  	odsold: odsold,
  	OElig: OElig,
  	oelig: oelig,
  	ofcir: ofcir,
  	Ofr: Ofr,
  	ofr: ofr,
  	ogon: ogon,
  	Ograve: Ograve$1,
  	ograve: ograve$1,
  	ogt: ogt,
  	ohbar: ohbar,
  	ohm: ohm,
  	oint: oint,
  	olarr: olarr,
  	olcir: olcir,
  	olcross: olcross,
  	oline: oline,
  	olt: olt,
  	Omacr: Omacr,
  	omacr: omacr,
  	Omega: Omega,
  	omega: omega,
  	Omicron: Omicron,
  	omicron: omicron,
  	omid: omid,
  	ominus: ominus,
  	Oopf: Oopf,
  	oopf: oopf,
  	opar: opar,
  	OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
  	OpenCurlyQuote: OpenCurlyQuote,
  	operp: operp,
  	oplus: oplus,
  	orarr: orarr,
  	Or: Or,
  	or: or,
  	ord: ord,
  	order: order,
  	orderof: orderof,
  	ordf: ordf$1,
  	ordm: ordm$1,
  	origof: origof,
  	oror: oror,
  	orslope: orslope,
  	orv: orv,
  	oS: oS,
  	Oscr: Oscr,
  	oscr: oscr,
  	Oslash: Oslash$1,
  	oslash: oslash$1,
  	osol: osol,
  	Otilde: Otilde$1,
  	otilde: otilde$1,
  	otimesas: otimesas,
  	Otimes: Otimes,
  	otimes: otimes,
  	Ouml: Ouml$1,
  	ouml: ouml$1,
  	ovbar: ovbar,
  	OverBar: OverBar,
  	OverBrace: OverBrace,
  	OverBracket: OverBracket,
  	OverParenthesis: OverParenthesis,
  	para: para$1,
  	parallel: parallel,
  	par: par,
  	parsim: parsim,
  	parsl: parsl,
  	part: part,
  	PartialD: PartialD,
  	Pcy: Pcy,
  	pcy: pcy,
  	percnt: percnt,
  	period: period,
  	permil: permil,
  	perp: perp,
  	pertenk: pertenk,
  	Pfr: Pfr,
  	pfr: pfr,
  	Phi: Phi,
  	phi: phi,
  	phiv: phiv,
  	phmmat: phmmat,
  	phone: phone,
  	Pi: Pi,
  	pi: pi,
  	pitchfork: pitchfork,
  	piv: piv,
  	planck: planck,
  	planckh: planckh,
  	plankv: plankv,
  	plusacir: plusacir,
  	plusb: plusb,
  	pluscir: pluscir,
  	plus: plus,
  	plusdo: plusdo,
  	plusdu: plusdu,
  	pluse: pluse,
  	PlusMinus: PlusMinus,
  	plusmn: plusmn$1,
  	plussim: plussim,
  	plustwo: plustwo,
  	pm: pm,
  	Poincareplane: Poincareplane,
  	pointint: pointint,
  	popf: popf,
  	Popf: Popf,
  	pound: pound$1,
  	prap: prap,
  	Pr: Pr,
  	pr: pr,
  	prcue: prcue,
  	precapprox: precapprox,
  	prec: prec,
  	preccurlyeq: preccurlyeq,
  	Precedes: Precedes,
  	PrecedesEqual: PrecedesEqual,
  	PrecedesSlantEqual: PrecedesSlantEqual,
  	PrecedesTilde: PrecedesTilde,
  	preceq: preceq,
  	precnapprox: precnapprox,
  	precneqq: precneqq,
  	precnsim: precnsim,
  	pre: pre,
  	prE: prE,
  	precsim: precsim,
  	prime: prime,
  	Prime: Prime,
  	primes: primes,
  	prnap: prnap,
  	prnE: prnE,
  	prnsim: prnsim,
  	prod: prod,
  	Product: Product,
  	profalar: profalar,
  	profline: profline,
  	profsurf: profsurf,
  	prop: prop,
  	Proportional: Proportional,
  	Proportion: Proportion,
  	propto: propto,
  	prsim: prsim,
  	prurel: prurel,
  	Pscr: Pscr,
  	pscr: pscr,
  	Psi: Psi,
  	psi: psi,
  	puncsp: puncsp,
  	Qfr: Qfr,
  	qfr: qfr,
  	qint: qint,
  	qopf: qopf,
  	Qopf: Qopf,
  	qprime: qprime,
  	Qscr: Qscr,
  	qscr: qscr,
  	quaternions: quaternions,
  	quatint: quatint,
  	quest: quest,
  	questeq: questeq,
  	quot: quot$2,
  	QUOT: QUOT$1,
  	rAarr: rAarr,
  	race: race,
  	Racute: Racute,
  	racute: racute,
  	radic: radic,
  	raemptyv: raemptyv,
  	rang: rang,
  	Rang: Rang,
  	rangd: rangd,
  	range: range,
  	rangle: rangle,
  	raquo: raquo$1,
  	rarrap: rarrap,
  	rarrb: rarrb,
  	rarrbfs: rarrbfs,
  	rarrc: rarrc,
  	rarr: rarr,
  	Rarr: Rarr,
  	rArr: rArr,
  	rarrfs: rarrfs,
  	rarrhk: rarrhk,
  	rarrlp: rarrlp,
  	rarrpl: rarrpl,
  	rarrsim: rarrsim,
  	Rarrtl: Rarrtl,
  	rarrtl: rarrtl,
  	rarrw: rarrw,
  	ratail: ratail,
  	rAtail: rAtail,
  	ratio: ratio,
  	rationals: rationals,
  	rbarr: rbarr,
  	rBarr: rBarr,
  	RBarr: RBarr,
  	rbbrk: rbbrk,
  	rbrace: rbrace,
  	rbrack: rbrack,
  	rbrke: rbrke,
  	rbrksld: rbrksld,
  	rbrkslu: rbrkslu,
  	Rcaron: Rcaron,
  	rcaron: rcaron,
  	Rcedil: Rcedil,
  	rcedil: rcedil,
  	rceil: rceil,
  	rcub: rcub,
  	Rcy: Rcy,
  	rcy: rcy,
  	rdca: rdca,
  	rdldhar: rdldhar,
  	rdquo: rdquo,
  	rdquor: rdquor,
  	rdsh: rdsh,
  	real: real,
  	realine: realine,
  	realpart: realpart,
  	reals: reals,
  	Re: Re,
  	rect: rect,
  	reg: reg$1,
  	REG: REG$1,
  	ReverseElement: ReverseElement,
  	ReverseEquilibrium: ReverseEquilibrium,
  	ReverseUpEquilibrium: ReverseUpEquilibrium,
  	rfisht: rfisht,
  	rfloor: rfloor,
  	rfr: rfr,
  	Rfr: Rfr,
  	rHar: rHar,
  	rhard: rhard,
  	rharu: rharu,
  	rharul: rharul,
  	Rho: Rho,
  	rho: rho,
  	rhov: rhov,
  	RightAngleBracket: RightAngleBracket,
  	RightArrowBar: RightArrowBar,
  	rightarrow: rightarrow,
  	RightArrow: RightArrow,
  	Rightarrow: Rightarrow,
  	RightArrowLeftArrow: RightArrowLeftArrow,
  	rightarrowtail: rightarrowtail,
  	RightCeiling: RightCeiling,
  	RightDoubleBracket: RightDoubleBracket,
  	RightDownTeeVector: RightDownTeeVector,
  	RightDownVectorBar: RightDownVectorBar,
  	RightDownVector: RightDownVector,
  	RightFloor: RightFloor,
  	rightharpoondown: rightharpoondown,
  	rightharpoonup: rightharpoonup,
  	rightleftarrows: rightleftarrows,
  	rightleftharpoons: rightleftharpoons,
  	rightrightarrows: rightrightarrows,
  	rightsquigarrow: rightsquigarrow,
  	RightTeeArrow: RightTeeArrow,
  	RightTee: RightTee,
  	RightTeeVector: RightTeeVector,
  	rightthreetimes: rightthreetimes,
  	RightTriangleBar: RightTriangleBar,
  	RightTriangle: RightTriangle,
  	RightTriangleEqual: RightTriangleEqual,
  	RightUpDownVector: RightUpDownVector,
  	RightUpTeeVector: RightUpTeeVector,
  	RightUpVectorBar: RightUpVectorBar,
  	RightUpVector: RightUpVector,
  	RightVectorBar: RightVectorBar,
  	RightVector: RightVector,
  	ring: ring,
  	risingdotseq: risingdotseq,
  	rlarr: rlarr,
  	rlhar: rlhar,
  	rlm: rlm,
  	rmoustache: rmoustache,
  	rmoust: rmoust,
  	rnmid: rnmid,
  	roang: roang,
  	roarr: roarr,
  	robrk: robrk,
  	ropar: ropar,
  	ropf: ropf,
  	Ropf: Ropf,
  	roplus: roplus,
  	rotimes: rotimes,
  	RoundImplies: RoundImplies,
  	rpar: rpar,
  	rpargt: rpargt,
  	rppolint: rppolint,
  	rrarr: rrarr,
  	Rrightarrow: Rrightarrow,
  	rsaquo: rsaquo,
  	rscr: rscr,
  	Rscr: Rscr,
  	rsh: rsh,
  	Rsh: Rsh,
  	rsqb: rsqb,
  	rsquo: rsquo,
  	rsquor: rsquor,
  	rthree: rthree,
  	rtimes: rtimes,
  	rtri: rtri,
  	rtrie: rtrie,
  	rtrif: rtrif,
  	rtriltri: rtriltri,
  	RuleDelayed: RuleDelayed,
  	ruluhar: ruluhar,
  	rx: rx,
  	Sacute: Sacute,
  	sacute: sacute,
  	sbquo: sbquo,
  	scap: scap,
  	Scaron: Scaron,
  	scaron: scaron,
  	Sc: Sc,
  	sc: sc,
  	sccue: sccue,
  	sce: sce,
  	scE: scE,
  	Scedil: Scedil,
  	scedil: scedil,
  	Scirc: Scirc,
  	scirc: scirc,
  	scnap: scnap,
  	scnE: scnE,
  	scnsim: scnsim,
  	scpolint: scpolint,
  	scsim: scsim,
  	Scy: Scy,
  	scy: scy,
  	sdotb: sdotb,
  	sdot: sdot,
  	sdote: sdote,
  	searhk: searhk,
  	searr: searr,
  	seArr: seArr,
  	searrow: searrow,
  	sect: sect$1,
  	semi: semi,
  	seswar: seswar,
  	setminus: setminus,
  	setmn: setmn,
  	sext: sext,
  	Sfr: Sfr,
  	sfr: sfr,
  	sfrown: sfrown,
  	sharp: sharp,
  	SHCHcy: SHCHcy,
  	shchcy: shchcy,
  	SHcy: SHcy,
  	shcy: shcy,
  	ShortDownArrow: ShortDownArrow,
  	ShortLeftArrow: ShortLeftArrow,
  	shortmid: shortmid,
  	shortparallel: shortparallel,
  	ShortRightArrow: ShortRightArrow,
  	ShortUpArrow: ShortUpArrow,
  	shy: shy$1,
  	Sigma: Sigma,
  	sigma: sigma,
  	sigmaf: sigmaf,
  	sigmav: sigmav,
  	sim: sim,
  	simdot: simdot,
  	sime: sime,
  	simeq: simeq,
  	simg: simg,
  	simgE: simgE,
  	siml: siml,
  	simlE: simlE,
  	simne: simne,
  	simplus: simplus,
  	simrarr: simrarr,
  	slarr: slarr,
  	SmallCircle: SmallCircle,
  	smallsetminus: smallsetminus,
  	smashp: smashp,
  	smeparsl: smeparsl,
  	smid: smid,
  	smile: smile,
  	smt: smt,
  	smte: smte,
  	smtes: smtes,
  	SOFTcy: SOFTcy,
  	softcy: softcy,
  	solbar: solbar,
  	solb: solb,
  	sol: sol,
  	Sopf: Sopf,
  	sopf: sopf,
  	spades: spades,
  	spadesuit: spadesuit,
  	spar: spar,
  	sqcap: sqcap,
  	sqcaps: sqcaps,
  	sqcup: sqcup,
  	sqcups: sqcups,
  	Sqrt: Sqrt,
  	sqsub: sqsub,
  	sqsube: sqsube,
  	sqsubset: sqsubset,
  	sqsubseteq: sqsubseteq,
  	sqsup: sqsup,
  	sqsupe: sqsupe,
  	sqsupset: sqsupset,
  	sqsupseteq: sqsupseteq,
  	square: square,
  	Square: Square,
  	SquareIntersection: SquareIntersection,
  	SquareSubset: SquareSubset,
  	SquareSubsetEqual: SquareSubsetEqual,
  	SquareSuperset: SquareSuperset,
  	SquareSupersetEqual: SquareSupersetEqual,
  	SquareUnion: SquareUnion,
  	squarf: squarf,
  	squ: squ,
  	squf: squf,
  	srarr: srarr,
  	Sscr: Sscr,
  	sscr: sscr,
  	ssetmn: ssetmn,
  	ssmile: ssmile,
  	sstarf: sstarf,
  	Star: Star,
  	star: star,
  	starf: starf,
  	straightepsilon: straightepsilon,
  	straightphi: straightphi,
  	strns: strns,
  	sub: sub,
  	Sub: Sub,
  	subdot: subdot,
  	subE: subE,
  	sube: sube,
  	subedot: subedot,
  	submult: submult,
  	subnE: subnE,
  	subne: subne,
  	subplus: subplus,
  	subrarr: subrarr,
  	subset: subset,
  	Subset: Subset,
  	subseteq: subseteq,
  	subseteqq: subseteqq,
  	SubsetEqual: SubsetEqual,
  	subsetneq: subsetneq,
  	subsetneqq: subsetneqq,
  	subsim: subsim,
  	subsub: subsub,
  	subsup: subsup,
  	succapprox: succapprox,
  	succ: succ,
  	succcurlyeq: succcurlyeq,
  	Succeeds: Succeeds,
  	SucceedsEqual: SucceedsEqual,
  	SucceedsSlantEqual: SucceedsSlantEqual,
  	SucceedsTilde: SucceedsTilde,
  	succeq: succeq,
  	succnapprox: succnapprox,
  	succneqq: succneqq,
  	succnsim: succnsim,
  	succsim: succsim,
  	SuchThat: SuchThat,
  	sum: sum,
  	Sum: Sum,
  	sung: sung,
  	sup1: sup1$1,
  	sup2: sup2$1,
  	sup3: sup3$1,
  	sup: sup,
  	Sup: Sup,
  	supdot: supdot,
  	supdsub: supdsub,
  	supE: supE,
  	supe: supe,
  	supedot: supedot,
  	Superset: Superset,
  	SupersetEqual: SupersetEqual,
  	suphsol: suphsol,
  	suphsub: suphsub,
  	suplarr: suplarr,
  	supmult: supmult,
  	supnE: supnE,
  	supne: supne,
  	supplus: supplus,
  	supset: supset,
  	Supset: Supset,
  	supseteq: supseteq,
  	supseteqq: supseteqq,
  	supsetneq: supsetneq,
  	supsetneqq: supsetneqq,
  	supsim: supsim,
  	supsub: supsub,
  	supsup: supsup,
  	swarhk: swarhk,
  	swarr: swarr,
  	swArr: swArr,
  	swarrow: swarrow,
  	swnwar: swnwar,
  	szlig: szlig$1,
  	Tab: Tab,
  	target: target,
  	Tau: Tau,
  	tau: tau,
  	tbrk: tbrk,
  	Tcaron: Tcaron,
  	tcaron: tcaron,
  	Tcedil: Tcedil,
  	tcedil: tcedil,
  	Tcy: Tcy,
  	tcy: tcy,
  	tdot: tdot,
  	telrec: telrec,
  	Tfr: Tfr,
  	tfr: tfr,
  	there4: there4,
  	therefore: therefore,
  	Therefore: Therefore,
  	Theta: Theta,
  	theta: theta,
  	thetasym: thetasym,
  	thetav: thetav,
  	thickapprox: thickapprox,
  	thicksim: thicksim,
  	ThickSpace: ThickSpace,
  	ThinSpace: ThinSpace,
  	thinsp: thinsp,
  	thkap: thkap,
  	thksim: thksim,
  	THORN: THORN$1,
  	thorn: thorn$1,
  	tilde: tilde,
  	Tilde: Tilde,
  	TildeEqual: TildeEqual,
  	TildeFullEqual: TildeFullEqual,
  	TildeTilde: TildeTilde,
  	timesbar: timesbar,
  	timesb: timesb,
  	times: times$1,
  	timesd: timesd,
  	tint: tint,
  	toea: toea,
  	topbot: topbot,
  	topcir: topcir,
  	top: top,
  	Topf: Topf,
  	topf: topf,
  	topfork: topfork,
  	tosa: tosa,
  	tprime: tprime,
  	trade: trade,
  	TRADE: TRADE,
  	triangle: triangle,
  	triangledown: triangledown,
  	triangleleft: triangleleft,
  	trianglelefteq: trianglelefteq,
  	triangleq: triangleq,
  	triangleright: triangleright,
  	trianglerighteq: trianglerighteq,
  	tridot: tridot,
  	trie: trie,
  	triminus: triminus,
  	TripleDot: TripleDot,
  	triplus: triplus,
  	trisb: trisb,
  	tritime: tritime,
  	trpezium: trpezium,
  	Tscr: Tscr,
  	tscr: tscr,
  	TScy: TScy,
  	tscy: tscy,
  	TSHcy: TSHcy,
  	tshcy: tshcy,
  	Tstrok: Tstrok,
  	tstrok: tstrok,
  	twixt: twixt,
  	twoheadleftarrow: twoheadleftarrow,
  	twoheadrightarrow: twoheadrightarrow,
  	Uacute: Uacute$1,
  	uacute: uacute$1,
  	uarr: uarr,
  	Uarr: Uarr,
  	uArr: uArr,
  	Uarrocir: Uarrocir,
  	Ubrcy: Ubrcy,
  	ubrcy: ubrcy,
  	Ubreve: Ubreve,
  	ubreve: ubreve,
  	Ucirc: Ucirc$1,
  	ucirc: ucirc$1,
  	Ucy: Ucy,
  	ucy: ucy,
  	udarr: udarr,
  	Udblac: Udblac,
  	udblac: udblac,
  	udhar: udhar,
  	ufisht: ufisht,
  	Ufr: Ufr,
  	ufr: ufr,
  	Ugrave: Ugrave$1,
  	ugrave: ugrave$1,
  	uHar: uHar,
  	uharl: uharl,
  	uharr: uharr,
  	uhblk: uhblk,
  	ulcorn: ulcorn,
  	ulcorner: ulcorner,
  	ulcrop: ulcrop,
  	ultri: ultri,
  	Umacr: Umacr,
  	umacr: umacr,
  	uml: uml$1,
  	UnderBar: UnderBar,
  	UnderBrace: UnderBrace,
  	UnderBracket: UnderBracket,
  	UnderParenthesis: UnderParenthesis,
  	Union: Union,
  	UnionPlus: UnionPlus,
  	Uogon: Uogon,
  	uogon: uogon,
  	Uopf: Uopf,
  	uopf: uopf,
  	UpArrowBar: UpArrowBar,
  	uparrow: uparrow,
  	UpArrow: UpArrow,
  	Uparrow: Uparrow,
  	UpArrowDownArrow: UpArrowDownArrow,
  	updownarrow: updownarrow,
  	UpDownArrow: UpDownArrow,
  	Updownarrow: Updownarrow,
  	UpEquilibrium: UpEquilibrium,
  	upharpoonleft: upharpoonleft,
  	upharpoonright: upharpoonright,
  	uplus: uplus,
  	UpperLeftArrow: UpperLeftArrow,
  	UpperRightArrow: UpperRightArrow,
  	upsi: upsi,
  	Upsi: Upsi,
  	upsih: upsih,
  	Upsilon: Upsilon,
  	upsilon: upsilon,
  	UpTeeArrow: UpTeeArrow,
  	UpTee: UpTee,
  	upuparrows: upuparrows,
  	urcorn: urcorn,
  	urcorner: urcorner,
  	urcrop: urcrop,
  	Uring: Uring,
  	uring: uring,
  	urtri: urtri,
  	Uscr: Uscr,
  	uscr: uscr,
  	utdot: utdot,
  	Utilde: Utilde,
  	utilde: utilde,
  	utri: utri,
  	utrif: utrif,
  	uuarr: uuarr,
  	Uuml: Uuml$1,
  	uuml: uuml$1,
  	uwangle: uwangle,
  	vangrt: vangrt,
  	varepsilon: varepsilon,
  	varkappa: varkappa,
  	varnothing: varnothing,
  	varphi: varphi,
  	varpi: varpi,
  	varpropto: varpropto,
  	varr: varr,
  	vArr: vArr,
  	varrho: varrho,
  	varsigma: varsigma,
  	varsubsetneq: varsubsetneq,
  	varsubsetneqq: varsubsetneqq,
  	varsupsetneq: varsupsetneq,
  	varsupsetneqq: varsupsetneqq,
  	vartheta: vartheta,
  	vartriangleleft: vartriangleleft,
  	vartriangleright: vartriangleright,
  	vBar: vBar,
  	Vbar: Vbar,
  	vBarv: vBarv,
  	Vcy: Vcy,
  	vcy: vcy,
  	vdash: vdash,
  	vDash: vDash,
  	Vdash: Vdash,
  	VDash: VDash,
  	Vdashl: Vdashl,
  	veebar: veebar,
  	vee: vee,
  	Vee: Vee,
  	veeeq: veeeq,
  	vellip: vellip,
  	verbar: verbar,
  	Verbar: Verbar,
  	vert: vert,
  	Vert: Vert,
  	VerticalBar: VerticalBar,
  	VerticalLine: VerticalLine,
  	VerticalSeparator: VerticalSeparator,
  	VerticalTilde: VerticalTilde,
  	VeryThinSpace: VeryThinSpace,
  	Vfr: Vfr,
  	vfr: vfr,
  	vltri: vltri,
  	vnsub: vnsub,
  	vnsup: vnsup,
  	Vopf: Vopf,
  	vopf: vopf,
  	vprop: vprop,
  	vrtri: vrtri,
  	Vscr: Vscr,
  	vscr: vscr,
  	vsubnE: vsubnE,
  	vsubne: vsubne,
  	vsupnE: vsupnE,
  	vsupne: vsupne,
  	Vvdash: Vvdash,
  	vzigzag: vzigzag,
  	Wcirc: Wcirc,
  	wcirc: wcirc,
  	wedbar: wedbar,
  	wedge: wedge,
  	Wedge: Wedge,
  	wedgeq: wedgeq,
  	weierp: weierp,
  	Wfr: Wfr,
  	wfr: wfr,
  	Wopf: Wopf,
  	wopf: wopf,
  	wp: wp,
  	wr: wr,
  	wreath: wreath,
  	Wscr: Wscr,
  	wscr: wscr,
  	xcap: xcap,
  	xcirc: xcirc,
  	xcup: xcup,
  	xdtri: xdtri,
  	Xfr: Xfr,
  	xfr: xfr,
  	xharr: xharr,
  	xhArr: xhArr,
  	Xi: Xi,
  	xi: xi,
  	xlarr: xlarr,
  	xlArr: xlArr,
  	xmap: xmap,
  	xnis: xnis,
  	xodot: xodot,
  	Xopf: Xopf,
  	xopf: xopf,
  	xoplus: xoplus,
  	xotime: xotime,
  	xrarr: xrarr,
  	xrArr: xrArr,
  	Xscr: Xscr,
  	xscr: xscr,
  	xsqcup: xsqcup,
  	xuplus: xuplus,
  	xutri: xutri,
  	xvee: xvee,
  	xwedge: xwedge,
  	Yacute: Yacute$1,
  	yacute: yacute$1,
  	YAcy: YAcy,
  	yacy: yacy,
  	Ycirc: Ycirc,
  	ycirc: ycirc,
  	Ycy: Ycy,
  	ycy: ycy,
  	yen: yen$1,
  	Yfr: Yfr,
  	yfr: yfr,
  	YIcy: YIcy,
  	yicy: yicy,
  	Yopf: Yopf,
  	yopf: yopf,
  	Yscr: Yscr,
  	yscr: yscr,
  	YUcy: YUcy,
  	yucy: yucy,
  	yuml: yuml$1,
  	Yuml: Yuml,
  	Zacute: Zacute,
  	zacute: zacute,
  	Zcaron: Zcaron,
  	zcaron: zcaron,
  	Zcy: Zcy,
  	zcy: zcy,
  	Zdot: Zdot,
  	zdot: zdot,
  	zeetrf: zeetrf,
  	ZeroWidthSpace: ZeroWidthSpace,
  	Zeta: Zeta,
  	zeta: zeta,
  	zfr: zfr,
  	Zfr: Zfr,
  	ZHcy: ZHcy,
  	zhcy: zhcy,
  	zigrarr: zigrarr,
  	zopf: zopf,
  	Zopf: Zopf,
  	Zscr: Zscr,
  	zscr: zscr,
  	zwj: zwj,
  	zwnj: zwnj
  };

  var Aacute = "Á";
  var aacute = "á";
  var Acirc = "Â";
  var acirc = "â";
  var acute = "´";
  var AElig = "Æ";
  var aelig = "æ";
  var Agrave = "À";
  var agrave = "à";
  var amp$1 = "&";
  var AMP = "&";
  var Aring = "Å";
  var aring = "å";
  var Atilde = "Ã";
  var atilde = "ã";
  var Auml = "Ä";
  var auml = "ä";
  var brvbar = "¦";
  var Ccedil = "Ç";
  var ccedil = "ç";
  var cedil = "¸";
  var cent = "¢";
  var copy = "©";
  var COPY = "©";
  var curren = "¤";
  var deg = "°";
  var divide = "÷";
  var Eacute = "É";
  var eacute = "é";
  var Ecirc = "Ê";
  var ecirc = "ê";
  var Egrave = "È";
  var egrave = "è";
  var ETH = "Ð";
  var eth = "ð";
  var Euml = "Ë";
  var euml = "ë";
  var frac12 = "½";
  var frac14 = "¼";
  var frac34 = "¾";
  var gt$1 = ">";
  var GT = ">";
  var Iacute = "Í";
  var iacute = "í";
  var Icirc = "Î";
  var icirc = "î";
  var iexcl = "¡";
  var Igrave = "Ì";
  var igrave = "ì";
  var iquest = "¿";
  var Iuml = "Ï";
  var iuml = "ï";
  var laquo = "«";
  var lt$1 = "<";
  var LT = "<";
  var macr = "¯";
  var micro = "µ";
  var middot = "·";
  var nbsp = " ";
  var not = "¬";
  var Ntilde = "Ñ";
  var ntilde = "ñ";
  var Oacute = "Ó";
  var oacute = "ó";
  var Ocirc = "Ô";
  var ocirc = "ô";
  var Ograve = "Ò";
  var ograve = "ò";
  var ordf = "ª";
  var ordm = "º";
  var Oslash = "Ø";
  var oslash = "ø";
  var Otilde = "Õ";
  var otilde = "õ";
  var Ouml = "Ö";
  var ouml = "ö";
  var para = "¶";
  var plusmn = "±";
  var pound = "£";
  var quot$1 = "\"";
  var QUOT = "\"";
  var raquo = "»";
  var reg = "®";
  var REG = "®";
  var sect = "§";
  var shy = "­";
  var sup1 = "¹";
  var sup2 = "²";
  var sup3 = "³";
  var szlig = "ß";
  var THORN = "Þ";
  var thorn = "þ";
  var times = "×";
  var Uacute = "Ú";
  var uacute = "ú";
  var Ucirc = "Û";
  var ucirc = "û";
  var Ugrave = "Ù";
  var ugrave = "ù";
  var uml = "¨";
  var Uuml = "Ü";
  var uuml = "ü";
  var Yacute = "Ý";
  var yacute = "ý";
  var yen = "¥";
  var yuml = "ÿ";
  var require$$1 = {
  	Aacute: Aacute,
  	aacute: aacute,
  	Acirc: Acirc,
  	acirc: acirc,
  	acute: acute,
  	AElig: AElig,
  	aelig: aelig,
  	Agrave: Agrave,
  	agrave: agrave,
  	amp: amp$1,
  	AMP: AMP,
  	Aring: Aring,
  	aring: aring,
  	Atilde: Atilde,
  	atilde: atilde,
  	Auml: Auml,
  	auml: auml,
  	brvbar: brvbar,
  	Ccedil: Ccedil,
  	ccedil: ccedil,
  	cedil: cedil,
  	cent: cent,
  	copy: copy,
  	COPY: COPY,
  	curren: curren,
  	deg: deg,
  	divide: divide,
  	Eacute: Eacute,
  	eacute: eacute,
  	Ecirc: Ecirc,
  	ecirc: ecirc,
  	Egrave: Egrave,
  	egrave: egrave,
  	ETH: ETH,
  	eth: eth,
  	Euml: Euml,
  	euml: euml,
  	frac12: frac12,
  	frac14: frac14,
  	frac34: frac34,
  	gt: gt$1,
  	GT: GT,
  	Iacute: Iacute,
  	iacute: iacute,
  	Icirc: Icirc,
  	icirc: icirc,
  	iexcl: iexcl,
  	Igrave: Igrave,
  	igrave: igrave,
  	iquest: iquest,
  	Iuml: Iuml,
  	iuml: iuml,
  	laquo: laquo,
  	lt: lt$1,
  	LT: LT,
  	macr: macr,
  	micro: micro,
  	middot: middot,
  	nbsp: nbsp,
  	not: not,
  	Ntilde: Ntilde,
  	ntilde: ntilde,
  	Oacute: Oacute,
  	oacute: oacute,
  	Ocirc: Ocirc,
  	ocirc: ocirc,
  	Ograve: Ograve,
  	ograve: ograve,
  	ordf: ordf,
  	ordm: ordm,
  	Oslash: Oslash,
  	oslash: oslash,
  	Otilde: Otilde,
  	otilde: otilde,
  	Ouml: Ouml,
  	ouml: ouml,
  	para: para,
  	plusmn: plusmn,
  	pound: pound,
  	quot: quot$1,
  	QUOT: QUOT,
  	raquo: raquo,
  	reg: reg,
  	REG: REG,
  	sect: sect,
  	shy: shy,
  	sup1: sup1,
  	sup2: sup2,
  	sup3: sup3,
  	szlig: szlig,
  	THORN: THORN,
  	thorn: thorn,
  	times: times,
  	Uacute: Uacute,
  	uacute: uacute,
  	Ucirc: Ucirc,
  	ucirc: ucirc,
  	Ugrave: Ugrave,
  	ugrave: ugrave,
  	uml: uml,
  	Uuml: Uuml,
  	uuml: uuml,
  	Yacute: Yacute,
  	yacute: yacute,
  	yen: yen,
  	yuml: yuml
  };

  var amp = "&";
  var apos = "'";
  var gt = ">";
  var lt = "<";
  var quot = "\"";
  var require$$0 = {
  	amp: amp,
  	apos: apos,
  	gt: gt,
  	lt: lt,
  	quot: quot
  };

  var __importDefault$5 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(Tokenizer$1, "__esModule", { value: true });
  var decode_codepoint_1$1 = __importDefault$5(decode_codepoint);
  var entities_json_1$2 = __importDefault$5(require$$1$1);
  var legacy_json_1$1 = __importDefault$5(require$$1);
  var xml_json_1$2 = __importDefault$5(require$$0);
  function whitespace(c) {
      return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
  }
  function isASCIIAlpha(c) {
      return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
  }
  function ifElseState(upper, SUCCESS, FAILURE) {
      var lower = upper.toLowerCase();
      if (upper === lower) {
          return function (t, c) {
              if (c === lower) {
                  t._state = SUCCESS;
              }
              else {
                  t._state = FAILURE;
                  t._index--;
              }
          };
      }
      return function (t, c) {
          if (c === lower || c === upper) {
              t._state = SUCCESS;
          }
          else {
              t._state = FAILURE;
              t._index--;
          }
      };
  }
  function consumeSpecialNameChar(upper, NEXT_STATE) {
      var lower = upper.toLowerCase();
      return function (t, c) {
          if (c === lower || c === upper) {
              t._state = NEXT_STATE;
          }
          else {
              t._state = 3 /* InTagName */;
              t._index--; // Consume the token again
          }
      };
  }
  var stateBeforeCdata1 = ifElseState("C", 24 /* BeforeCdata2 */, 16 /* InDeclaration */);
  var stateBeforeCdata2 = ifElseState("D", 25 /* BeforeCdata3 */, 16 /* InDeclaration */);
  var stateBeforeCdata3 = ifElseState("A", 26 /* BeforeCdata4 */, 16 /* InDeclaration */);
  var stateBeforeCdata4 = ifElseState("T", 27 /* BeforeCdata5 */, 16 /* InDeclaration */);
  var stateBeforeCdata5 = ifElseState("A", 28 /* BeforeCdata6 */, 16 /* InDeclaration */);
  var stateBeforeScript1 = consumeSpecialNameChar("R", 35 /* BeforeScript2 */);
  var stateBeforeScript2 = consumeSpecialNameChar("I", 36 /* BeforeScript3 */);
  var stateBeforeScript3 = consumeSpecialNameChar("P", 37 /* BeforeScript4 */);
  var stateBeforeScript4 = consumeSpecialNameChar("T", 38 /* BeforeScript5 */);
  var stateAfterScript1 = ifElseState("R", 40 /* AfterScript2 */, 1 /* Text */);
  var stateAfterScript2 = ifElseState("I", 41 /* AfterScript3 */, 1 /* Text */);
  var stateAfterScript3 = ifElseState("P", 42 /* AfterScript4 */, 1 /* Text */);
  var stateAfterScript4 = ifElseState("T", 43 /* AfterScript5 */, 1 /* Text */);
  var stateBeforeStyle1 = consumeSpecialNameChar("Y", 45 /* BeforeStyle2 */);
  var stateBeforeStyle2 = consumeSpecialNameChar("L", 46 /* BeforeStyle3 */);
  var stateBeforeStyle3 = consumeSpecialNameChar("E", 47 /* BeforeStyle4 */);
  var stateAfterStyle1 = ifElseState("Y", 49 /* AfterStyle2 */, 1 /* Text */);
  var stateAfterStyle2 = ifElseState("L", 50 /* AfterStyle3 */, 1 /* Text */);
  var stateAfterStyle3 = ifElseState("E", 51 /* AfterStyle4 */, 1 /* Text */);
  var stateBeforeSpecialT = consumeSpecialNameChar("I", 54 /* BeforeTitle1 */);
  var stateBeforeTitle1 = consumeSpecialNameChar("T", 55 /* BeforeTitle2 */);
  var stateBeforeTitle2 = consumeSpecialNameChar("L", 56 /* BeforeTitle3 */);
  var stateBeforeTitle3 = consumeSpecialNameChar("E", 57 /* BeforeTitle4 */);
  var stateAfterSpecialTEnd = ifElseState("I", 58 /* AfterTitle1 */, 1 /* Text */);
  var stateAfterTitle1 = ifElseState("T", 59 /* AfterTitle2 */, 1 /* Text */);
  var stateAfterTitle2 = ifElseState("L", 60 /* AfterTitle3 */, 1 /* Text */);
  var stateAfterTitle3 = ifElseState("E", 61 /* AfterTitle4 */, 1 /* Text */);
  var stateBeforeEntity = ifElseState("#", 63 /* BeforeNumericEntity */, 64 /* InNamedEntity */);
  var stateBeforeNumericEntity = ifElseState("X", 66 /* InHexEntity */, 65 /* InNumericEntity */);
  var Tokenizer = /** @class */ (function () {
      function Tokenizer(options, cbs) {
          var _a;
          /** The current state the tokenizer is in. */
          this._state = 1 /* Text */;
          /** The read buffer. */
          this.buffer = "";
          /** The beginning of the section that is currently being read. */
          this.sectionStart = 0;
          /** The index within the buffer that we are currently looking at. */
          this._index = 0;
          /**
           * Data that has already been processed will be removed from the buffer occasionally.
           * `_bufferOffset` keeps track of how many characters have been removed, to make sure position information is accurate.
           */
          this.bufferOffset = 0;
          /** Some behavior, eg. when decoding entities, is done while we are in another state. This keeps track of the other state type. */
          this.baseState = 1 /* Text */;
          /** For special parsing behavior inside of script and style tags. */
          this.special = 1 /* None */;
          /** Indicates whether the tokenizer has been paused. */
          this.running = true;
          /** Indicates whether the tokenizer has finished running / `.end` has been called. */
          this.ended = false;
          this.cbs = cbs;
          this.xmlMode = !!(options === null || options === void 0 ? void 0 : options.xmlMode);
          this.decodeEntities = (_a = options === null || options === void 0 ? void 0 : options.decodeEntities) !== null && _a !== void 0 ? _a : true;
      }
      Tokenizer.prototype.reset = function () {
          this._state = 1 /* Text */;
          this.buffer = "";
          this.sectionStart = 0;
          this._index = 0;
          this.bufferOffset = 0;
          this.baseState = 1 /* Text */;
          this.special = 1 /* None */;
          this.running = true;
          this.ended = false;
      };
      Tokenizer.prototype.write = function (chunk) {
          if (this.ended)
              this.cbs.onerror(Error(".write() after done!"));
          this.buffer += chunk;
          this.parse();
      };
      Tokenizer.prototype.end = function (chunk) {
          if (this.ended)
              this.cbs.onerror(Error(".end() after done!"));
          if (chunk)
              this.write(chunk);
          this.ended = true;
          if (this.running)
              this.finish();
      };
      Tokenizer.prototype.pause = function () {
          this.running = false;
      };
      Tokenizer.prototype.resume = function () {
          this.running = true;
          if (this._index < this.buffer.length) {
              this.parse();
          }
          if (this.ended) {
              this.finish();
          }
      };
      /**
       * The current index within all of the written data.
       */
      Tokenizer.prototype.getAbsoluteIndex = function () {
          return this.bufferOffset + this._index;
      };
      Tokenizer.prototype.stateText = function (c) {
          if (c === "<") {
              if (this._index > this.sectionStart) {
                  this.cbs.ontext(this.getSection());
              }
              this._state = 2 /* BeforeTagName */;
              this.sectionStart = this._index;
          }
          else if (this.decodeEntities &&
              c === "&" &&
              (this.special === 1 /* None */ || this.special === 4 /* Title */)) {
              if (this._index > this.sectionStart) {
                  this.cbs.ontext(this.getSection());
              }
              this.baseState = 1 /* Text */;
              this._state = 62 /* BeforeEntity */;
              this.sectionStart = this._index;
          }
      };
      /**
       * HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a tag name.
       *
       * XML allows a lot more characters here (@see https://www.w3.org/TR/REC-xml/#NT-NameStartChar).
       * We allow anything that wouldn't end the tag.
       */
      Tokenizer.prototype.isTagStartChar = function (c) {
          return (isASCIIAlpha(c) ||
              (this.xmlMode && !whitespace(c) && c !== "/" && c !== ">"));
      };
      Tokenizer.prototype.stateBeforeTagName = function (c) {
          if (c === "/") {
              this._state = 5 /* BeforeClosingTagName */;
          }
          else if (c === "<") {
              this.cbs.ontext(this.getSection());
              this.sectionStart = this._index;
          }
          else if (c === ">" ||
              this.special !== 1 /* None */ ||
              whitespace(c)) {
              this._state = 1 /* Text */;
          }
          else if (c === "!") {
              this._state = 15 /* BeforeDeclaration */;
              this.sectionStart = this._index + 1;
          }
          else if (c === "?") {
              this._state = 17 /* InProcessingInstruction */;
              this.sectionStart = this._index + 1;
          }
          else if (!this.isTagStartChar(c)) {
              this._state = 1 /* Text */;
          }
          else {
              this._state =
                  !this.xmlMode && (c === "s" || c === "S")
                      ? 32 /* BeforeSpecialS */
                      : !this.xmlMode && (c === "t" || c === "T")
                          ? 52 /* BeforeSpecialT */
                          : 3 /* InTagName */;
              this.sectionStart = this._index;
          }
      };
      Tokenizer.prototype.stateInTagName = function (c) {
          if (c === "/" || c === ">" || whitespace(c)) {
              this.emitToken("onopentagname");
              this._state = 8 /* BeforeAttributeName */;
              this._index--;
          }
      };
      Tokenizer.prototype.stateBeforeClosingTagName = function (c) {
          if (whitespace(c)) ;
          else if (c === ">") {
              this._state = 1 /* Text */;
          }
          else if (this.special !== 1 /* None */) {
              if (this.special !== 4 /* Title */ && (c === "s" || c === "S")) {
                  this._state = 33 /* BeforeSpecialSEnd */;
              }
              else if (this.special === 4 /* Title */ &&
                  (c === "t" || c === "T")) {
                  this._state = 53 /* BeforeSpecialTEnd */;
              }
              else {
                  this._state = 1 /* Text */;
                  this._index--;
              }
          }
          else if (!this.isTagStartChar(c)) {
              this._state = 20 /* InSpecialComment */;
              this.sectionStart = this._index;
          }
          else {
              this._state = 6 /* InClosingTagName */;
              this.sectionStart = this._index;
          }
      };
      Tokenizer.prototype.stateInClosingTagName = function (c) {
          if (c === ">" || whitespace(c)) {
              this.emitToken("onclosetag");
              this._state = 7 /* AfterClosingTagName */;
              this._index--;
          }
      };
      Tokenizer.prototype.stateAfterClosingTagName = function (c) {
          // Skip everything until ">"
          if (c === ">") {
              this._state = 1 /* Text */;
              this.sectionStart = this._index + 1;
          }
      };
      Tokenizer.prototype.stateBeforeAttributeName = function (c) {
          if (c === ">") {
              this.cbs.onopentagend();
              this._state = 1 /* Text */;
              this.sectionStart = this._index + 1;
          }
          else if (c === "/") {
              this._state = 4 /* InSelfClosingTag */;
          }
          else if (!whitespace(c)) {
              this._state = 9 /* InAttributeName */;
              this.sectionStart = this._index;
          }
      };
      Tokenizer.prototype.stateInSelfClosingTag = function (c) {
          if (c === ">") {
              this.cbs.onselfclosingtag();
              this._state = 1 /* Text */;
              this.sectionStart = this._index + 1;
              this.special = 1 /* None */; // Reset special state, in case of self-closing special tags
          }
          else if (!whitespace(c)) {
              this._state = 8 /* BeforeAttributeName */;
              this._index--;
          }
      };
      Tokenizer.prototype.stateInAttributeName = function (c) {
          if (c === "=" || c === "/" || c === ">" || whitespace(c)) {
              this.cbs.onattribname(this.getSection());
              this.sectionStart = -1;
              this._state = 10 /* AfterAttributeName */;
              this._index--;
          }
      };
      Tokenizer.prototype.stateAfterAttributeName = function (c) {
          if (c === "=") {
              this._state = 11 /* BeforeAttributeValue */;
          }
          else if (c === "/" || c === ">") {
              this.cbs.onattribend(undefined);
              this._state = 8 /* BeforeAttributeName */;
              this._index--;
          }
          else if (!whitespace(c)) {
              this.cbs.onattribend(undefined);
              this._state = 9 /* InAttributeName */;
              this.sectionStart = this._index;
          }
      };
      Tokenizer.prototype.stateBeforeAttributeValue = function (c) {
          if (c === '"') {
              this._state = 12 /* InAttributeValueDq */;
              this.sectionStart = this._index + 1;
          }
          else if (c === "'") {
              this._state = 13 /* InAttributeValueSq */;
              this.sectionStart = this._index + 1;
          }
          else if (!whitespace(c)) {
              this._state = 14 /* InAttributeValueNq */;
              this.sectionStart = this._index;
              this._index--; // Reconsume token
          }
      };
      Tokenizer.prototype.handleInAttributeValue = function (c, quote) {
          if (c === quote) {
              this.emitToken("onattribdata");
              this.cbs.onattribend(quote);
              this._state = 8 /* BeforeAttributeName */;
          }
          else if (this.decodeEntities && c === "&") {
              this.emitToken("onattribdata");
              this.baseState = this._state;
              this._state = 62 /* BeforeEntity */;
              this.sectionStart = this._index;
          }
      };
      Tokenizer.prototype.stateInAttributeValueDoubleQuotes = function (c) {
          this.handleInAttributeValue(c, '"');
      };
      Tokenizer.prototype.stateInAttributeValueSingleQuotes = function (c) {
          this.handleInAttributeValue(c, "'");
      };
      Tokenizer.prototype.stateInAttributeValueNoQuotes = function (c) {
          if (whitespace(c) || c === ">") {
              this.emitToken("onattribdata");
              this.cbs.onattribend(null);
              this._state = 8 /* BeforeAttributeName */;
              this._index--;
          }
          else if (this.decodeEntities && c === "&") {
              this.emitToken("onattribdata");
              this.baseState = this._state;
              this._state = 62 /* BeforeEntity */;
              this.sectionStart = this._index;
          }
      };
      Tokenizer.prototype.stateBeforeDeclaration = function (c) {
          this._state =
              c === "["
                  ? 23 /* BeforeCdata1 */
                  : c === "-"
                      ? 18 /* BeforeComment */
                      : 16 /* InDeclaration */;
      };
      Tokenizer.prototype.stateInDeclaration = function (c) {
          if (c === ">") {
              this.cbs.ondeclaration(this.getSection());
              this._state = 1 /* Text */;
              this.sectionStart = this._index + 1;
          }
      };
      Tokenizer.prototype.stateInProcessingInstruction = function (c) {
          if (c === ">") {
              this.cbs.onprocessinginstruction(this.getSection());
              this._state = 1 /* Text */;
              this.sectionStart = this._index + 1;
          }
      };
      Tokenizer.prototype.stateBeforeComment = function (c) {
          if (c === "-") {
              this._state = 19 /* InComment */;
              this.sectionStart = this._index + 1;
          }
          else {
              this._state = 16 /* InDeclaration */;
          }
      };
      Tokenizer.prototype.stateInComment = function (c) {
          if (c === "-")
              this._state = 21 /* AfterComment1 */;
      };
      Tokenizer.prototype.stateInSpecialComment = function (c) {
          if (c === ">") {
              this.cbs.oncomment(this.buffer.substring(this.sectionStart, this._index));
              this._state = 1 /* Text */;
              this.sectionStart = this._index + 1;
          }
      };
      Tokenizer.prototype.stateAfterComment1 = function (c) {
          if (c === "-") {
              this._state = 22 /* AfterComment2 */;
          }
          else {
              this._state = 19 /* InComment */;
          }
      };
      Tokenizer.prototype.stateAfterComment2 = function (c) {
          if (c === ">") {
              // Remove 2 trailing chars
              this.cbs.oncomment(this.buffer.substring(this.sectionStart, this._index - 2));
              this._state = 1 /* Text */;
              this.sectionStart = this._index + 1;
          }
          else if (c !== "-") {
              this._state = 19 /* InComment */;
          }
          // Else: stay in AFTER_COMMENT_2 (`--->`)
      };
      Tokenizer.prototype.stateBeforeCdata6 = function (c) {
          if (c === "[") {
              this._state = 29 /* InCdata */;
              this.sectionStart = this._index + 1;
          }
          else {
              this._state = 16 /* InDeclaration */;
              this._index--;
          }
      };
      Tokenizer.prototype.stateInCdata = function (c) {
          if (c === "]")
              this._state = 30 /* AfterCdata1 */;
      };
      Tokenizer.prototype.stateAfterCdata1 = function (c) {
          if (c === "]")
              this._state = 31 /* AfterCdata2 */;
          else
              this._state = 29 /* InCdata */;
      };
      Tokenizer.prototype.stateAfterCdata2 = function (c) {
          if (c === ">") {
              // Remove 2 trailing chars
              this.cbs.oncdata(this.buffer.substring(this.sectionStart, this._index - 2));
              this._state = 1 /* Text */;
              this.sectionStart = this._index + 1;
          }
          else if (c !== "]") {
              this._state = 29 /* InCdata */;
          }
          // Else: stay in AFTER_CDATA_2 (`]]]>`)
      };
      Tokenizer.prototype.stateBeforeSpecialS = function (c) {
          if (c === "c" || c === "C") {
              this._state = 34 /* BeforeScript1 */;
          }
          else if (c === "t" || c === "T") {
              this._state = 44 /* BeforeStyle1 */;
          }
          else {
              this._state = 3 /* InTagName */;
              this._index--; // Consume the token again
          }
      };
      Tokenizer.prototype.stateBeforeSpecialSEnd = function (c) {
          if (this.special === 2 /* Script */ && (c === "c" || c === "C")) {
              this._state = 39 /* AfterScript1 */;
          }
          else if (this.special === 3 /* Style */ && (c === "t" || c === "T")) {
              this._state = 48 /* AfterStyle1 */;
          }
          else
              this._state = 1 /* Text */;
      };
      Tokenizer.prototype.stateBeforeSpecialLast = function (c, special) {
          if (c === "/" || c === ">" || whitespace(c)) {
              this.special = special;
          }
          this._state = 3 /* InTagName */;
          this._index--; // Consume the token again
      };
      Tokenizer.prototype.stateAfterSpecialLast = function (c, sectionStartOffset) {
          if (c === ">" || whitespace(c)) {
              this.special = 1 /* None */;
              this._state = 6 /* InClosingTagName */;
              this.sectionStart = this._index - sectionStartOffset;
              this._index--; // Reconsume the token
          }
          else
              this._state = 1 /* Text */;
      };
      // For entities terminated with a semicolon
      Tokenizer.prototype.parseFixedEntity = function (map) {
          if (map === void 0) { map = this.xmlMode ? xml_json_1$2.default : entities_json_1$2.default; }
          // Offset = 1
          if (this.sectionStart + 1 < this._index) {
              var entity = this.buffer.substring(this.sectionStart + 1, this._index);
              if (Object.prototype.hasOwnProperty.call(map, entity)) {
                  this.emitPartial(map[entity]);
                  this.sectionStart = this._index + 1;
              }
          }
      };
      // Parses legacy entities (without trailing semicolon)
      Tokenizer.prototype.parseLegacyEntity = function () {
          var start = this.sectionStart + 1;
          // The max length of legacy entities is 6
          var limit = Math.min(this._index - start, 6);
          while (limit >= 2) {
              // The min length of legacy entities is 2
              var entity = this.buffer.substr(start, limit);
              if (Object.prototype.hasOwnProperty.call(legacy_json_1$1.default, entity)) {
                  this.emitPartial(legacy_json_1$1.default[entity]);
                  this.sectionStart += limit + 1;
                  return;
              }
              limit--;
          }
      };
      Tokenizer.prototype.stateInNamedEntity = function (c) {
          if (c === ";") {
              this.parseFixedEntity();
              // Retry as legacy entity if entity wasn't parsed
              if (this.baseState === 1 /* Text */ &&
                  this.sectionStart + 1 < this._index &&
                  !this.xmlMode) {
                  this.parseLegacyEntity();
              }
              this._state = this.baseState;
          }
          else if ((c < "0" || c > "9") && !isASCIIAlpha(c)) {
              if (this.xmlMode || this.sectionStart + 1 === this._index) ;
              else if (this.baseState !== 1 /* Text */) {
                  if (c !== "=") {
                      // Parse as legacy entity, without allowing additional characters.
                      this.parseFixedEntity(legacy_json_1$1.default);
                  }
              }
              else {
                  this.parseLegacyEntity();
              }
              this._state = this.baseState;
              this._index--;
          }
      };
      Tokenizer.prototype.decodeNumericEntity = function (offset, base, strict) {
          var sectionStart = this.sectionStart + offset;
          if (sectionStart !== this._index) {
              // Parse entity
              var entity = this.buffer.substring(sectionStart, this._index);
              var parsed = parseInt(entity, base);
              this.emitPartial(decode_codepoint_1$1.default(parsed));
              this.sectionStart = strict ? this._index + 1 : this._index;
          }
          this._state = this.baseState;
      };
      Tokenizer.prototype.stateInNumericEntity = function (c) {
          if (c === ";") {
              this.decodeNumericEntity(2, 10, true);
          }
          else if (c < "0" || c > "9") {
              if (!this.xmlMode) {
                  this.decodeNumericEntity(2, 10, false);
              }
              else {
                  this._state = this.baseState;
              }
              this._index--;
          }
      };
      Tokenizer.prototype.stateInHexEntity = function (c) {
          if (c === ";") {
              this.decodeNumericEntity(3, 16, true);
          }
          else if ((c < "a" || c > "f") &&
              (c < "A" || c > "F") &&
              (c < "0" || c > "9")) {
              if (!this.xmlMode) {
                  this.decodeNumericEntity(3, 16, false);
              }
              else {
                  this._state = this.baseState;
              }
              this._index--;
          }
      };
      Tokenizer.prototype.cleanup = function () {
          if (this.sectionStart < 0) {
              this.buffer = "";
              this.bufferOffset += this._index;
              this._index = 0;
          }
          else if (this.running) {
              if (this._state === 1 /* Text */) {
                  if (this.sectionStart !== this._index) {
                      this.cbs.ontext(this.buffer.substr(this.sectionStart));
                  }
                  this.buffer = "";
                  this.bufferOffset += this._index;
                  this._index = 0;
              }
              else if (this.sectionStart === this._index) {
                  // The section just started
                  this.buffer = "";
                  this.bufferOffset += this._index;
                  this._index = 0;
              }
              else {
                  // Remove everything unnecessary
                  this.buffer = this.buffer.substr(this.sectionStart);
                  this._index -= this.sectionStart;
                  this.bufferOffset += this.sectionStart;
              }
              this.sectionStart = 0;
          }
      };
      /**
       * Iterates through the buffer, calling the function corresponding to the current state.
       *
       * States that are more likely to be hit are higher up, as a performance improvement.
       */
      Tokenizer.prototype.parse = function () {
          while (this._index < this.buffer.length && this.running) {
              var c = this.buffer.charAt(this._index);
              if (this._state === 1 /* Text */) {
                  this.stateText(c);
              }
              else if (this._state === 12 /* InAttributeValueDq */) {
                  this.stateInAttributeValueDoubleQuotes(c);
              }
              else if (this._state === 9 /* InAttributeName */) {
                  this.stateInAttributeName(c);
              }
              else if (this._state === 19 /* InComment */) {
                  this.stateInComment(c);
              }
              else if (this._state === 20 /* InSpecialComment */) {
                  this.stateInSpecialComment(c);
              }
              else if (this._state === 8 /* BeforeAttributeName */) {
                  this.stateBeforeAttributeName(c);
              }
              else if (this._state === 3 /* InTagName */) {
                  this.stateInTagName(c);
              }
              else if (this._state === 6 /* InClosingTagName */) {
                  this.stateInClosingTagName(c);
              }
              else if (this._state === 2 /* BeforeTagName */) {
                  this.stateBeforeTagName(c);
              }
              else if (this._state === 10 /* AfterAttributeName */) {
                  this.stateAfterAttributeName(c);
              }
              else if (this._state === 13 /* InAttributeValueSq */) {
                  this.stateInAttributeValueSingleQuotes(c);
              }
              else if (this._state === 11 /* BeforeAttributeValue */) {
                  this.stateBeforeAttributeValue(c);
              }
              else if (this._state === 5 /* BeforeClosingTagName */) {
                  this.stateBeforeClosingTagName(c);
              }
              else if (this._state === 7 /* AfterClosingTagName */) {
                  this.stateAfterClosingTagName(c);
              }
              else if (this._state === 32 /* BeforeSpecialS */) {
                  this.stateBeforeSpecialS(c);
              }
              else if (this._state === 21 /* AfterComment1 */) {
                  this.stateAfterComment1(c);
              }
              else if (this._state === 14 /* InAttributeValueNq */) {
                  this.stateInAttributeValueNoQuotes(c);
              }
              else if (this._state === 4 /* InSelfClosingTag */) {
                  this.stateInSelfClosingTag(c);
              }
              else if (this._state === 16 /* InDeclaration */) {
                  this.stateInDeclaration(c);
              }
              else if (this._state === 15 /* BeforeDeclaration */) {
                  this.stateBeforeDeclaration(c);
              }
              else if (this._state === 22 /* AfterComment2 */) {
                  this.stateAfterComment2(c);
              }
              else if (this._state === 18 /* BeforeComment */) {
                  this.stateBeforeComment(c);
              }
              else if (this._state === 33 /* BeforeSpecialSEnd */) {
                  this.stateBeforeSpecialSEnd(c);
              }
              else if (this._state === 53 /* BeforeSpecialTEnd */) {
                  stateAfterSpecialTEnd(this, c);
              }
              else if (this._state === 39 /* AfterScript1 */) {
                  stateAfterScript1(this, c);
              }
              else if (this._state === 40 /* AfterScript2 */) {
                  stateAfterScript2(this, c);
              }
              else if (this._state === 41 /* AfterScript3 */) {
                  stateAfterScript3(this, c);
              }
              else if (this._state === 34 /* BeforeScript1 */) {
                  stateBeforeScript1(this, c);
              }
              else if (this._state === 35 /* BeforeScript2 */) {
                  stateBeforeScript2(this, c);
              }
              else if (this._state === 36 /* BeforeScript3 */) {
                  stateBeforeScript3(this, c);
              }
              else if (this._state === 37 /* BeforeScript4 */) {
                  stateBeforeScript4(this, c);
              }
              else if (this._state === 38 /* BeforeScript5 */) {
                  this.stateBeforeSpecialLast(c, 2 /* Script */);
              }
              else if (this._state === 42 /* AfterScript4 */) {
                  stateAfterScript4(this, c);
              }
              else if (this._state === 43 /* AfterScript5 */) {
                  this.stateAfterSpecialLast(c, 6);
              }
              else if (this._state === 44 /* BeforeStyle1 */) {
                  stateBeforeStyle1(this, c);
              }
              else if (this._state === 29 /* InCdata */) {
                  this.stateInCdata(c);
              }
              else if (this._state === 45 /* BeforeStyle2 */) {
                  stateBeforeStyle2(this, c);
              }
              else if (this._state === 46 /* BeforeStyle3 */) {
                  stateBeforeStyle3(this, c);
              }
              else if (this._state === 47 /* BeforeStyle4 */) {
                  this.stateBeforeSpecialLast(c, 3 /* Style */);
              }
              else if (this._state === 48 /* AfterStyle1 */) {
                  stateAfterStyle1(this, c);
              }
              else if (this._state === 49 /* AfterStyle2 */) {
                  stateAfterStyle2(this, c);
              }
              else if (this._state === 50 /* AfterStyle3 */) {
                  stateAfterStyle3(this, c);
              }
              else if (this._state === 51 /* AfterStyle4 */) {
                  this.stateAfterSpecialLast(c, 5);
              }
              else if (this._state === 52 /* BeforeSpecialT */) {
                  stateBeforeSpecialT(this, c);
              }
              else if (this._state === 54 /* BeforeTitle1 */) {
                  stateBeforeTitle1(this, c);
              }
              else if (this._state === 55 /* BeforeTitle2 */) {
                  stateBeforeTitle2(this, c);
              }
              else if (this._state === 56 /* BeforeTitle3 */) {
                  stateBeforeTitle3(this, c);
              }
              else if (this._state === 57 /* BeforeTitle4 */) {
                  this.stateBeforeSpecialLast(c, 4 /* Title */);
              }
              else if (this._state === 58 /* AfterTitle1 */) {
                  stateAfterTitle1(this, c);
              }
              else if (this._state === 59 /* AfterTitle2 */) {
                  stateAfterTitle2(this, c);
              }
              else if (this._state === 60 /* AfterTitle3 */) {
                  stateAfterTitle3(this, c);
              }
              else if (this._state === 61 /* AfterTitle4 */) {
                  this.stateAfterSpecialLast(c, 5);
              }
              else if (this._state === 17 /* InProcessingInstruction */) {
                  this.stateInProcessingInstruction(c);
              }
              else if (this._state === 64 /* InNamedEntity */) {
                  this.stateInNamedEntity(c);
              }
              else if (this._state === 23 /* BeforeCdata1 */) {
                  stateBeforeCdata1(this, c);
              }
              else if (this._state === 62 /* BeforeEntity */) {
                  stateBeforeEntity(this, c);
              }
              else if (this._state === 24 /* BeforeCdata2 */) {
                  stateBeforeCdata2(this, c);
              }
              else if (this._state === 25 /* BeforeCdata3 */) {
                  stateBeforeCdata3(this, c);
              }
              else if (this._state === 30 /* AfterCdata1 */) {
                  this.stateAfterCdata1(c);
              }
              else if (this._state === 31 /* AfterCdata2 */) {
                  this.stateAfterCdata2(c);
              }
              else if (this._state === 26 /* BeforeCdata4 */) {
                  stateBeforeCdata4(this, c);
              }
              else if (this._state === 27 /* BeforeCdata5 */) {
                  stateBeforeCdata5(this, c);
              }
              else if (this._state === 28 /* BeforeCdata6 */) {
                  this.stateBeforeCdata6(c);
              }
              else if (this._state === 66 /* InHexEntity */) {
                  this.stateInHexEntity(c);
              }
              else if (this._state === 65 /* InNumericEntity */) {
                  this.stateInNumericEntity(c);
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              }
              else if (this._state === 63 /* BeforeNumericEntity */) {
                  stateBeforeNumericEntity(this, c);
              }
              else {
                  this.cbs.onerror(Error("unknown _state"), this._state);
              }
              this._index++;
          }
          this.cleanup();
      };
      Tokenizer.prototype.finish = function () {
          // If there is remaining data, emit it in a reasonable way
          if (this.sectionStart < this._index) {
              this.handleTrailingData();
          }
          this.cbs.onend();
      };
      Tokenizer.prototype.handleTrailingData = function () {
          var data = this.buffer.substr(this.sectionStart);
          if (this._state === 29 /* InCdata */ ||
              this._state === 30 /* AfterCdata1 */ ||
              this._state === 31 /* AfterCdata2 */) {
              this.cbs.oncdata(data);
          }
          else if (this._state === 19 /* InComment */ ||
              this._state === 21 /* AfterComment1 */ ||
              this._state === 22 /* AfterComment2 */) {
              this.cbs.oncomment(data);
          }
          else if (this._state === 64 /* InNamedEntity */ && !this.xmlMode) {
              this.parseLegacyEntity();
              if (this.sectionStart < this._index) {
                  this._state = this.baseState;
                  this.handleTrailingData();
              }
          }
          else if (this._state === 65 /* InNumericEntity */ && !this.xmlMode) {
              this.decodeNumericEntity(2, 10, false);
              if (this.sectionStart < this._index) {
                  this._state = this.baseState;
                  this.handleTrailingData();
              }
          }
          else if (this._state === 66 /* InHexEntity */ && !this.xmlMode) {
              this.decodeNumericEntity(3, 16, false);
              if (this.sectionStart < this._index) {
                  this._state = this.baseState;
                  this.handleTrailingData();
              }
          }
          else if (this._state !== 3 /* InTagName */ &&
              this._state !== 8 /* BeforeAttributeName */ &&
              this._state !== 11 /* BeforeAttributeValue */ &&
              this._state !== 10 /* AfterAttributeName */ &&
              this._state !== 9 /* InAttributeName */ &&
              this._state !== 13 /* InAttributeValueSq */ &&
              this._state !== 12 /* InAttributeValueDq */ &&
              this._state !== 14 /* InAttributeValueNq */ &&
              this._state !== 6 /* InClosingTagName */) {
              this.cbs.ontext(data);
          }
          /*
           * Else, ignore remaining data
           * TODO add a way to remove current tag
           */
      };
      Tokenizer.prototype.getSection = function () {
          return this.buffer.substring(this.sectionStart, this._index);
      };
      Tokenizer.prototype.emitToken = function (name) {
          this.cbs[name](this.getSection());
          this.sectionStart = -1;
      };
      Tokenizer.prototype.emitPartial = function (value) {
          if (this.baseState !== 1 /* Text */) {
              this.cbs.onattribdata(value); // TODO implement the new event
          }
          else {
              this.cbs.ontext(value);
          }
      };
      return Tokenizer;
  }());
  Tokenizer$1.default = Tokenizer;

  var __importDefault$4 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(Parser$3, "__esModule", { value: true });
  Parser$3.Parser = void 0;
  var Tokenizer_1 = __importDefault$4(Tokenizer$1);
  var formTags = new Set([
      "input",
      "option",
      "optgroup",
      "select",
      "button",
      "datalist",
      "textarea",
  ]);
  var pTag = new Set(["p"]);
  var openImpliesClose = {
      tr: new Set(["tr", "th", "td"]),
      th: new Set(["th"]),
      td: new Set(["thead", "th", "td"]),
      body: new Set(["head", "link", "script"]),
      li: new Set(["li"]),
      p: pTag,
      h1: pTag,
      h2: pTag,
      h3: pTag,
      h4: pTag,
      h5: pTag,
      h6: pTag,
      select: formTags,
      input: formTags,
      output: formTags,
      button: formTags,
      datalist: formTags,
      textarea: formTags,
      option: new Set(["option"]),
      optgroup: new Set(["optgroup", "option"]),
      dd: new Set(["dt", "dd"]),
      dt: new Set(["dt", "dd"]),
      address: pTag,
      article: pTag,
      aside: pTag,
      blockquote: pTag,
      details: pTag,
      div: pTag,
      dl: pTag,
      fieldset: pTag,
      figcaption: pTag,
      figure: pTag,
      footer: pTag,
      form: pTag,
      header: pTag,
      hr: pTag,
      main: pTag,
      nav: pTag,
      ol: pTag,
      pre: pTag,
      section: pTag,
      table: pTag,
      ul: pTag,
      rt: new Set(["rt", "rp"]),
      rp: new Set(["rt", "rp"]),
      tbody: new Set(["thead", "tbody"]),
      tfoot: new Set(["thead", "tbody"]),
  };
  var voidElements = new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
  ]);
  var foreignContextElements = new Set(["math", "svg"]);
  var htmlIntegrationElements = new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignObject",
      "desc",
      "title",
  ]);
  var reNameEnd = /\s|\//;
  var Parser$2 = /** @class */ (function () {
      function Parser(cbs, options) {
          if (options === void 0) { options = {}; }
          var _a, _b, _c, _d, _e;
          /** The start index of the last event. */
          this.startIndex = 0;
          /** The end index of the last event. */
          this.endIndex = null;
          this.tagname = "";
          this.attribname = "";
          this.attribvalue = "";
          this.attribs = null;
          this.stack = [];
          this.foreignContext = [];
          this.options = options;
          this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
          this.lowerCaseTagNames = (_a = options.lowerCaseTags) !== null && _a !== void 0 ? _a : !options.xmlMode;
          this.lowerCaseAttributeNames =
              (_b = options.lowerCaseAttributeNames) !== null && _b !== void 0 ? _b : !options.xmlMode;
          this.tokenizer = new ((_c = options.Tokenizer) !== null && _c !== void 0 ? _c : Tokenizer_1.default)(this.options, this);
          (_e = (_d = this.cbs).onparserinit) === null || _e === void 0 ? void 0 : _e.call(_d, this);
      }
      Parser.prototype.updatePosition = function (initialOffset) {
          if (this.endIndex === null) {
              if (this.tokenizer.sectionStart <= initialOffset) {
                  this.startIndex = 0;
              }
              else {
                  this.startIndex = this.tokenizer.sectionStart - initialOffset;
              }
          }
          else {
              this.startIndex = this.endIndex + 1;
          }
          this.endIndex = this.tokenizer.getAbsoluteIndex();
      };
      // Tokenizer event handlers
      Parser.prototype.ontext = function (data) {
          var _a, _b;
          this.updatePosition(1);
          this.endIndex--;
          (_b = (_a = this.cbs).ontext) === null || _b === void 0 ? void 0 : _b.call(_a, data);
      };
      Parser.prototype.onopentagname = function (name) {
          var _a, _b;
          if (this.lowerCaseTagNames) {
              name = name.toLowerCase();
          }
          this.tagname = name;
          if (!this.options.xmlMode &&
              Object.prototype.hasOwnProperty.call(openImpliesClose, name)) {
              var el = void 0;
              while (this.stack.length > 0 &&
                  openImpliesClose[name].has((el = this.stack[this.stack.length - 1]))) {
                  this.onclosetag(el);
              }
          }
          if (this.options.xmlMode || !voidElements.has(name)) {
              this.stack.push(name);
              if (foreignContextElements.has(name)) {
                  this.foreignContext.push(true);
              }
              else if (htmlIntegrationElements.has(name)) {
                  this.foreignContext.push(false);
              }
          }
          (_b = (_a = this.cbs).onopentagname) === null || _b === void 0 ? void 0 : _b.call(_a, name);
          if (this.cbs.onopentag)
              this.attribs = {};
      };
      Parser.prototype.onopentagend = function () {
          var _a, _b;
          this.updatePosition(1);
          if (this.attribs) {
              (_b = (_a = this.cbs).onopentag) === null || _b === void 0 ? void 0 : _b.call(_a, this.tagname, this.attribs);
              this.attribs = null;
          }
          if (!this.options.xmlMode &&
              this.cbs.onclosetag &&
              voidElements.has(this.tagname)) {
              this.cbs.onclosetag(this.tagname);
          }
          this.tagname = "";
      };
      Parser.prototype.onclosetag = function (name) {
          this.updatePosition(1);
          if (this.lowerCaseTagNames) {
              name = name.toLowerCase();
          }
          if (foreignContextElements.has(name) ||
              htmlIntegrationElements.has(name)) {
              this.foreignContext.pop();
          }
          if (this.stack.length &&
              (this.options.xmlMode || !voidElements.has(name))) {
              var pos = this.stack.lastIndexOf(name);
              if (pos !== -1) {
                  if (this.cbs.onclosetag) {
                      pos = this.stack.length - pos;
                      while (pos--) {
                          // We know the stack has sufficient elements.
                          this.cbs.onclosetag(this.stack.pop());
                      }
                  }
                  else
                      this.stack.length = pos;
              }
              else if (name === "p" && !this.options.xmlMode) {
                  this.onopentagname(name);
                  this.closeCurrentTag();
              }
          }
          else if (!this.options.xmlMode && (name === "br" || name === "p")) {
              this.onopentagname(name);
              this.closeCurrentTag();
          }
      };
      Parser.prototype.onselfclosingtag = function () {
          if (this.options.xmlMode ||
              this.options.recognizeSelfClosing ||
              this.foreignContext[this.foreignContext.length - 1]) {
              this.closeCurrentTag();
          }
          else {
              this.onopentagend();
          }
      };
      Parser.prototype.closeCurrentTag = function () {
          var _a, _b;
          var name = this.tagname;
          this.onopentagend();
          /*
           * Self-closing tags will be on the top of the stack
           * (cheaper check than in onclosetag)
           */
          if (this.stack[this.stack.length - 1] === name) {
              (_b = (_a = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a, name);
              this.stack.pop();
          }
      };
      Parser.prototype.onattribname = function (name) {
          if (this.lowerCaseAttributeNames) {
              name = name.toLowerCase();
          }
          this.attribname = name;
      };
      Parser.prototype.onattribdata = function (value) {
          this.attribvalue += value;
      };
      Parser.prototype.onattribend = function (quote) {
          var _a, _b;
          (_b = (_a = this.cbs).onattribute) === null || _b === void 0 ? void 0 : _b.call(_a, this.attribname, this.attribvalue, quote);
          if (this.attribs &&
              !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) {
              this.attribs[this.attribname] = this.attribvalue;
          }
          this.attribname = "";
          this.attribvalue = "";
      };
      Parser.prototype.getInstructionName = function (value) {
          var idx = value.search(reNameEnd);
          var name = idx < 0 ? value : value.substr(0, idx);
          if (this.lowerCaseTagNames) {
              name = name.toLowerCase();
          }
          return name;
      };
      Parser.prototype.ondeclaration = function (value) {
          if (this.cbs.onprocessinginstruction) {
              var name_1 = this.getInstructionName(value);
              this.cbs.onprocessinginstruction("!" + name_1, "!" + value);
          }
      };
      Parser.prototype.onprocessinginstruction = function (value) {
          if (this.cbs.onprocessinginstruction) {
              var name_2 = this.getInstructionName(value);
              this.cbs.onprocessinginstruction("?" + name_2, "?" + value);
          }
      };
      Parser.prototype.oncomment = function (value) {
          var _a, _b, _c, _d;
          this.updatePosition(4);
          (_b = (_a = this.cbs).oncomment) === null || _b === void 0 ? void 0 : _b.call(_a, value);
          (_d = (_c = this.cbs).oncommentend) === null || _d === void 0 ? void 0 : _d.call(_c);
      };
      Parser.prototype.oncdata = function (value) {
          var _a, _b, _c, _d, _e, _f;
          this.updatePosition(1);
          if (this.options.xmlMode || this.options.recognizeCDATA) {
              (_b = (_a = this.cbs).oncdatastart) === null || _b === void 0 ? void 0 : _b.call(_a);
              (_d = (_c = this.cbs).ontext) === null || _d === void 0 ? void 0 : _d.call(_c, value);
              (_f = (_e = this.cbs).oncdataend) === null || _f === void 0 ? void 0 : _f.call(_e);
          }
          else {
              this.oncomment("[CDATA[" + value + "]]");
          }
      };
      Parser.prototype.onerror = function (err) {
          var _a, _b;
          (_b = (_a = this.cbs).onerror) === null || _b === void 0 ? void 0 : _b.call(_a, err);
      };
      Parser.prototype.onend = function () {
          var _a, _b;
          if (this.cbs.onclosetag) {
              for (var i = this.stack.length; i > 0; this.cbs.onclosetag(this.stack[--i]))
                  ;
          }
          (_b = (_a = this.cbs).onend) === null || _b === void 0 ? void 0 : _b.call(_a);
      };
      /**
       * Resets the parser to a blank state, ready to parse a new HTML document
       */
      Parser.prototype.reset = function () {
          var _a, _b, _c, _d;
          (_b = (_a = this.cbs).onreset) === null || _b === void 0 ? void 0 : _b.call(_a);
          this.tokenizer.reset();
          this.tagname = "";
          this.attribname = "";
          this.attribs = null;
          this.stack = [];
          (_d = (_c = this.cbs).onparserinit) === null || _d === void 0 ? void 0 : _d.call(_c, this);
      };
      /**
       * Resets the parser, then parses a complete document and
       * pushes it to the handler.
       *
       * @param data Document to parse.
       */
      Parser.prototype.parseComplete = function (data) {
          this.reset();
          this.end(data);
      };
      /**
       * Parses a chunk of data and calls the corresponding callbacks.
       *
       * @param chunk Chunk to parse.
       */
      Parser.prototype.write = function (chunk) {
          this.tokenizer.write(chunk);
      };
      /**
       * Parses the end of the buffer and clears the stack, calls onend.
       *
       * @param chunk Optional final chunk to parse.
       */
      Parser.prototype.end = function (chunk) {
          this.tokenizer.end(chunk);
      };
      /**
       * Pauses parsing. The parser won't emit events until `resume` is called.
       */
      Parser.prototype.pause = function () {
          this.tokenizer.pause();
      };
      /**
       * Resumes parsing after `pause` was called.
       */
      Parser.prototype.resume = function () {
          this.tokenizer.resume();
      };
      /**
       * Alias of `write`, for backwards compatibility.
       *
       * @param chunk Chunk to parse.
       * @deprecated
       */
      Parser.prototype.parseChunk = function (chunk) {
          this.write(chunk);
      };
      /**
       * Alias of `end`, for backwards compatibility.
       *
       * @param chunk Optional final chunk to parse.
       * @deprecated
       */
      Parser.prototype.done = function (chunk) {
          this.end(chunk);
      };
      return Parser;
  }());
  Parser$3.Parser = Parser$2;

  var lib$4 = {};

  var lib$3 = {};

  (function (exports) {
  	Object.defineProperty(exports, "__esModule", { value: true });
  	exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = exports.ElementType = void 0;
  	/** Types of elements found in htmlparser2's DOM */
  	var ElementType;
  	(function (ElementType) {
  	    /** Type for the root element of a document */
  	    ElementType["Root"] = "root";
  	    /** Type for Text */
  	    ElementType["Text"] = "text";
  	    /** Type for <? ... ?> */
  	    ElementType["Directive"] = "directive";
  	    /** Type for <!-- ... --> */
  	    ElementType["Comment"] = "comment";
  	    /** Type for <script> tags */
  	    ElementType["Script"] = "script";
  	    /** Type for <style> tags */
  	    ElementType["Style"] = "style";
  	    /** Type for Any tag */
  	    ElementType["Tag"] = "tag";
  	    /** Type for <![CDATA[ ... ]]> */
  	    ElementType["CDATA"] = "cdata";
  	    /** Type for <!doctype ...> */
  	    ElementType["Doctype"] = "doctype";
  	})(ElementType = exports.ElementType || (exports.ElementType = {}));
  	/**
  	 * Tests whether an element is a tag or not.
  	 *
  	 * @param elem Element to test
  	 */
  	function isTag(elem) {
  	    return (elem.type === ElementType.Tag ||
  	        elem.type === ElementType.Script ||
  	        elem.type === ElementType.Style);
  	}
  	exports.isTag = isTag;
  	// Exports for backwards compatibility
  	/** Type for the root element of a document */
  	exports.Root = ElementType.Root;
  	/** Type for Text */
  	exports.Text = ElementType.Text;
  	/** Type for <? ... ?> */
  	exports.Directive = ElementType.Directive;
  	/** Type for <!-- ... --> */
  	exports.Comment = ElementType.Comment;
  	/** Type for <script> tags */
  	exports.Script = ElementType.Script;
  	/** Type for <style> tags */
  	exports.Style = ElementType.Style;
  	/** Type for Any tag */
  	exports.Tag = ElementType.Tag;
  	/** Type for <![CDATA[ ... ]]> */
  	exports.CDATA = ElementType.CDATA;
  	/** Type for <!doctype ...> */
  	exports.Doctype = ElementType.Doctype;
  } (lib$3));

  var node = {};

  var __extends$1 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          if (typeof b !== "function" && b !== null)
              throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var __assign$1 = (commonjsGlobal && commonjsGlobal.__assign) || function () {
      __assign$1 = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                  t[p] = s[p];
          }
          return t;
      };
      return __assign$1.apply(this, arguments);
  };
  Object.defineProperty(node, "__esModule", { value: true });
  node.cloneNode = node.hasChildren = node.isDocument = node.isDirective = node.isComment = node.isText = node.isCDATA = node.isTag = node.Element = node.Document = node.NodeWithChildren = node.ProcessingInstruction = node.Comment = node.Text = node.DataNode = node.Node = void 0;
  var domelementtype_1$1 = lib$3;
  var nodeTypes = new Map([
      [domelementtype_1$1.ElementType.Tag, 1],
      [domelementtype_1$1.ElementType.Script, 1],
      [domelementtype_1$1.ElementType.Style, 1],
      [domelementtype_1$1.ElementType.Directive, 1],
      [domelementtype_1$1.ElementType.Text, 3],
      [domelementtype_1$1.ElementType.CDATA, 4],
      [domelementtype_1$1.ElementType.Comment, 8],
      [domelementtype_1$1.ElementType.Root, 9],
  ]);
  /**
   * This object will be used as the prototype for Nodes when creating a
   * DOM-Level-1-compliant structure.
   */
  var Node$5 = /** @class */ (function () {
      /**
       *
       * @param type The type of the node.
       */
      function Node(type) {
          this.type = type;
          /** Parent of the node */
          this.parent = null;
          /** Previous sibling */
          this.prev = null;
          /** Next sibling */
          this.next = null;
          /** The start index of the node. Requires `withStartIndices` on the handler to be `true. */
          this.startIndex = null;
          /** The end index of the node. Requires `withEndIndices` on the handler to be `true. */
          this.endIndex = null;
      }
      Object.defineProperty(Node.prototype, "nodeType", {
          // Read-only aliases
          /**
           * [DOM spec](https://dom.spec.whatwg.org/#dom-node-nodetype)-compatible
           * node {@link type}.
           */
          get: function () {
              var _a;
              return (_a = nodeTypes.get(this.type)) !== null && _a !== void 0 ? _a : 1;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(Node.prototype, "parentNode", {
          // Read-write aliases for properties
          /**
           * Same as {@link parent}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function () {
              return this.parent;
          },
          set: function (parent) {
              this.parent = parent;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(Node.prototype, "previousSibling", {
          /**
           * Same as {@link prev}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function () {
              return this.prev;
          },
          set: function (prev) {
              this.prev = prev;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(Node.prototype, "nextSibling", {
          /**
           * Same as {@link next}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function () {
              return this.next;
          },
          set: function (next) {
              this.next = next;
          },
          enumerable: false,
          configurable: true
      });
      /**
       * Clone this node, and optionally its children.
       *
       * @param recursive Clone child nodes as well.
       * @returns A clone of the node.
       */
      Node.prototype.cloneNode = function (recursive) {
          if (recursive === void 0) { recursive = false; }
          return cloneNode$1(this, recursive);
      };
      return Node;
  }());
  node.Node = Node$5;
  /**
   * A node that contains some data.
   */
  var DataNode = /** @class */ (function (_super) {
      __extends$1(DataNode, _super);
      /**
       * @param type The type of the node
       * @param data The content of the data node
       */
      function DataNode(type, data) {
          var _this = _super.call(this, type) || this;
          _this.data = data;
          return _this;
      }
      Object.defineProperty(DataNode.prototype, "nodeValue", {
          /**
           * Same as {@link data}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function () {
              return this.data;
          },
          set: function (data) {
              this.data = data;
          },
          enumerable: false,
          configurable: true
      });
      return DataNode;
  }(Node$5));
  node.DataNode = DataNode;
  /**
   * Text within the document.
   */
  var Text = /** @class */ (function (_super) {
      __extends$1(Text, _super);
      function Text(data) {
          return _super.call(this, domelementtype_1$1.ElementType.Text, data) || this;
      }
      return Text;
  }(DataNode));
  node.Text = Text;
  /**
   * Comments within the document.
   */
  var Comment$5 = /** @class */ (function (_super) {
      __extends$1(Comment, _super);
      function Comment(data) {
          return _super.call(this, domelementtype_1$1.ElementType.Comment, data) || this;
      }
      return Comment;
  }(DataNode));
  node.Comment = Comment$5;
  /**
   * Processing instructions, including doc types.
   */
  var ProcessingInstruction = /** @class */ (function (_super) {
      __extends$1(ProcessingInstruction, _super);
      function ProcessingInstruction(name, data) {
          var _this = _super.call(this, domelementtype_1$1.ElementType.Directive, data) || this;
          _this.name = name;
          return _this;
      }
      return ProcessingInstruction;
  }(DataNode));
  node.ProcessingInstruction = ProcessingInstruction;
  /**
   * A `Node` that can have children.
   */
  var NodeWithChildren = /** @class */ (function (_super) {
      __extends$1(NodeWithChildren, _super);
      /**
       * @param type Type of the node.
       * @param children Children of the node. Only certain node types can have children.
       */
      function NodeWithChildren(type, children) {
          var _this = _super.call(this, type) || this;
          _this.children = children;
          return _this;
      }
      Object.defineProperty(NodeWithChildren.prototype, "firstChild", {
          // Aliases
          /** First child of the node. */
          get: function () {
              var _a;
              return (_a = this.children[0]) !== null && _a !== void 0 ? _a : null;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(NodeWithChildren.prototype, "lastChild", {
          /** Last child of the node. */
          get: function () {
              return this.children.length > 0
                  ? this.children[this.children.length - 1]
                  : null;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(NodeWithChildren.prototype, "childNodes", {
          /**
           * Same as {@link children}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function () {
              return this.children;
          },
          set: function (children) {
              this.children = children;
          },
          enumerable: false,
          configurable: true
      });
      return NodeWithChildren;
  }(Node$5));
  node.NodeWithChildren = NodeWithChildren;
  /**
   * The root node of the document.
   */
  var Document$4 = /** @class */ (function (_super) {
      __extends$1(Document, _super);
      function Document(children) {
          return _super.call(this, domelementtype_1$1.ElementType.Root, children) || this;
      }
      return Document;
  }(NodeWithChildren));
  node.Document = Document$4;
  /**
   * An element within the DOM.
   */
  var Element = /** @class */ (function (_super) {
      __extends$1(Element, _super);
      /**
       * @param name Name of the tag, eg. `div`, `span`.
       * @param attribs Object mapping attribute names to attribute values.
       * @param children Children of the node.
       */
      function Element(name, attribs, children, type) {
          if (children === void 0) { children = []; }
          if (type === void 0) { type = name === "script"
              ? domelementtype_1$1.ElementType.Script
              : name === "style"
                  ? domelementtype_1$1.ElementType.Style
                  : domelementtype_1$1.ElementType.Tag; }
          var _this = _super.call(this, type, children) || this;
          _this.name = name;
          _this.attribs = attribs;
          return _this;
      }
      Object.defineProperty(Element.prototype, "tagName", {
          // DOM Level 1 aliases
          /**
           * Same as {@link name}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function () {
              return this.name;
          },
          set: function (name) {
              this.name = name;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(Element.prototype, "attributes", {
          get: function () {
              var _this = this;
              return Object.keys(this.attribs).map(function (name) {
                  var _a, _b;
                  return ({
                      name: name,
                      value: _this.attribs[name],
                      namespace: (_a = _this["x-attribsNamespace"]) === null || _a === void 0 ? void 0 : _a[name],
                      prefix: (_b = _this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name],
                  });
              });
          },
          enumerable: false,
          configurable: true
      });
      return Element;
  }(NodeWithChildren));
  node.Element = Element;
  /**
   * @param node Node to check.
   * @returns `true` if the node is a `Element`, `false` otherwise.
   */
  function isTag(node) {
      return (0, domelementtype_1$1.isTag)(node);
  }
  node.isTag = isTag;
  /**
   * @param node Node to check.
   * @returns `true` if the node has the type `CDATA`, `false` otherwise.
   */
  function isCDATA(node) {
      return node.type === domelementtype_1$1.ElementType.CDATA;
  }
  node.isCDATA = isCDATA;
  /**
   * @param node Node to check.
   * @returns `true` if the node has the type `Text`, `false` otherwise.
   */
  function isText(node) {
      return node.type === domelementtype_1$1.ElementType.Text;
  }
  node.isText = isText;
  /**
   * @param node Node to check.
   * @returns `true` if the node has the type `Comment`, `false` otherwise.
   */
  function isComment(node) {
      return node.type === domelementtype_1$1.ElementType.Comment;
  }
  node.isComment = isComment;
  /**
   * @param node Node to check.
   * @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
   */
  function isDirective(node) {
      return node.type === domelementtype_1$1.ElementType.Directive;
  }
  node.isDirective = isDirective;
  /**
   * @param node Node to check.
   * @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
   */
  function isDocument(node) {
      return node.type === domelementtype_1$1.ElementType.Root;
  }
  node.isDocument = isDocument;
  /**
   * @param node Node to check.
   * @returns `true` if the node is a `NodeWithChildren` (has children), `false` otherwise.
   */
  function hasChildren(node) {
      return Object.prototype.hasOwnProperty.call(node, "children");
  }
  node.hasChildren = hasChildren;
  /**
   * Clone a node, and optionally its children.
   *
   * @param recursive Clone child nodes as well.
   * @returns A clone of the node.
   */
  function cloneNode$1(node, recursive) {
      if (recursive === void 0) { recursive = false; }
      var result;
      if (isText(node)) {
          result = new Text(node.data);
      }
      else if (isComment(node)) {
          result = new Comment$5(node.data);
      }
      else if (isTag(node)) {
          var children = recursive ? cloneChildren(node.children) : [];
          var clone_1 = new Element(node.name, __assign$1({}, node.attribs), children);
          children.forEach(function (child) { return (child.parent = clone_1); });
          if (node.namespace != null) {
              clone_1.namespace = node.namespace;
          }
          if (node["x-attribsNamespace"]) {
              clone_1["x-attribsNamespace"] = __assign$1({}, node["x-attribsNamespace"]);
          }
          if (node["x-attribsPrefix"]) {
              clone_1["x-attribsPrefix"] = __assign$1({}, node["x-attribsPrefix"]);
          }
          result = clone_1;
      }
      else if (isCDATA(node)) {
          var children = recursive ? cloneChildren(node.children) : [];
          var clone_2 = new NodeWithChildren(domelementtype_1$1.ElementType.CDATA, children);
          children.forEach(function (child) { return (child.parent = clone_2); });
          result = clone_2;
      }
      else if (isDocument(node)) {
          var children = recursive ? cloneChildren(node.children) : [];
          var clone_3 = new Document$4(children);
          children.forEach(function (child) { return (child.parent = clone_3); });
          if (node["x-mode"]) {
              clone_3["x-mode"] = node["x-mode"];
          }
          result = clone_3;
      }
      else if (isDirective(node)) {
          var instruction = new ProcessingInstruction(node.name, node.data);
          if (node["x-name"] != null) {
              instruction["x-name"] = node["x-name"];
              instruction["x-publicId"] = node["x-publicId"];
              instruction["x-systemId"] = node["x-systemId"];
          }
          result = instruction;
      }
      else {
          throw new Error("Not implemented yet: ".concat(node.type));
      }
      result.startIndex = node.startIndex;
      result.endIndex = node.endIndex;
      if (node.sourceCodeLocation != null) {
          result.sourceCodeLocation = node.sourceCodeLocation;
      }
      return result;
  }
  node.cloneNode = cloneNode$1;
  function cloneChildren(childs) {
      var children = childs.map(function (child) { return cloneNode$1(child, true); });
      for (var i = 1; i < children.length; i++) {
          children[i].prev = children[i - 1];
          children[i - 1].next = children[i];
      }
      return children;
  }

  (function (exports) {
  	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
  	    if (k2 === undefined) k2 = k;
  	    var desc = Object.getOwnPropertyDescriptor(m, k);
  	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
  	      desc = { enumerable: true, get: function() { return m[k]; } };
  	    }
  	    Object.defineProperty(o, k2, desc);
  	}) : (function(o, m, k, k2) {
  	    if (k2 === undefined) k2 = k;
  	    o[k2] = m[k];
  	}));
  	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
  	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
  	};
  	Object.defineProperty(exports, "__esModule", { value: true });
  	exports.DomHandler = void 0;
  	var domelementtype_1 = lib$3;
  	var node_1 = node;
  	__exportStar(node, exports);
  	var reWhitespace = /\s+/g;
  	// Default options
  	var defaultOpts = {
  	    normalizeWhitespace: false,
  	    withStartIndices: false,
  	    withEndIndices: false,
  	    xmlMode: false,
  	};
  	var DomHandler = /** @class */ (function () {
  	    /**
  	     * @param callback Called once parsing has completed.
  	     * @param options Settings for the handler.
  	     * @param elementCB Callback whenever a tag is closed.
  	     */
  	    function DomHandler(callback, options, elementCB) {
  	        /** The elements of the DOM */
  	        this.dom = [];
  	        /** The root element for the DOM */
  	        this.root = new node_1.Document(this.dom);
  	        /** Indicated whether parsing has been completed. */
  	        this.done = false;
  	        /** Stack of open tags. */
  	        this.tagStack = [this.root];
  	        /** A data node that is still being written to. */
  	        this.lastNode = null;
  	        /** Reference to the parser instance. Used for location information. */
  	        this.parser = null;
  	        // Make it possible to skip arguments, for backwards-compatibility
  	        if (typeof options === "function") {
  	            elementCB = options;
  	            options = defaultOpts;
  	        }
  	        if (typeof callback === "object") {
  	            options = callback;
  	            callback = undefined;
  	        }
  	        this.callback = callback !== null && callback !== void 0 ? callback : null;
  	        this.options = options !== null && options !== void 0 ? options : defaultOpts;
  	        this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
  	    }
  	    DomHandler.prototype.onparserinit = function (parser) {
  	        this.parser = parser;
  	    };
  	    // Resets the handler back to starting state
  	    DomHandler.prototype.onreset = function () {
  	        this.dom = [];
  	        this.root = new node_1.Document(this.dom);
  	        this.done = false;
  	        this.tagStack = [this.root];
  	        this.lastNode = null;
  	        this.parser = null;
  	    };
  	    // Signals the handler that parsing is done
  	    DomHandler.prototype.onend = function () {
  	        if (this.done)
  	            return;
  	        this.done = true;
  	        this.parser = null;
  	        this.handleCallback(null);
  	    };
  	    DomHandler.prototype.onerror = function (error) {
  	        this.handleCallback(error);
  	    };
  	    DomHandler.prototype.onclosetag = function () {
  	        this.lastNode = null;
  	        var elem = this.tagStack.pop();
  	        if (this.options.withEndIndices) {
  	            elem.endIndex = this.parser.endIndex;
  	        }
  	        if (this.elementCB)
  	            this.elementCB(elem);
  	    };
  	    DomHandler.prototype.onopentag = function (name, attribs) {
  	        var type = this.options.xmlMode ? domelementtype_1.ElementType.Tag : undefined;
  	        var element = new node_1.Element(name, attribs, undefined, type);
  	        this.addNode(element);
  	        this.tagStack.push(element);
  	    };
  	    DomHandler.prototype.ontext = function (data) {
  	        var normalizeWhitespace = this.options.normalizeWhitespace;
  	        var lastNode = this.lastNode;
  	        if (lastNode && lastNode.type === domelementtype_1.ElementType.Text) {
  	            if (normalizeWhitespace) {
  	                lastNode.data = (lastNode.data + data).replace(reWhitespace, " ");
  	            }
  	            else {
  	                lastNode.data += data;
  	            }
  	            if (this.options.withEndIndices) {
  	                lastNode.endIndex = this.parser.endIndex;
  	            }
  	        }
  	        else {
  	            if (normalizeWhitespace) {
  	                data = data.replace(reWhitespace, " ");
  	            }
  	            var node = new node_1.Text(data);
  	            this.addNode(node);
  	            this.lastNode = node;
  	        }
  	    };
  	    DomHandler.prototype.oncomment = function (data) {
  	        if (this.lastNode && this.lastNode.type === domelementtype_1.ElementType.Comment) {
  	            this.lastNode.data += data;
  	            return;
  	        }
  	        var node = new node_1.Comment(data);
  	        this.addNode(node);
  	        this.lastNode = node;
  	    };
  	    DomHandler.prototype.oncommentend = function () {
  	        this.lastNode = null;
  	    };
  	    DomHandler.prototype.oncdatastart = function () {
  	        var text = new node_1.Text("");
  	        var node = new node_1.NodeWithChildren(domelementtype_1.ElementType.CDATA, [text]);
  	        this.addNode(node);
  	        text.parent = node;
  	        this.lastNode = text;
  	    };
  	    DomHandler.prototype.oncdataend = function () {
  	        this.lastNode = null;
  	    };
  	    DomHandler.prototype.onprocessinginstruction = function (name, data) {
  	        var node = new node_1.ProcessingInstruction(name, data);
  	        this.addNode(node);
  	    };
  	    DomHandler.prototype.handleCallback = function (error) {
  	        if (typeof this.callback === "function") {
  	            this.callback(error, this.dom);
  	        }
  	        else if (error) {
  	            throw error;
  	        }
  	    };
  	    DomHandler.prototype.addNode = function (node) {
  	        var parent = this.tagStack[this.tagStack.length - 1];
  	        var previousSibling = parent.children[parent.children.length - 1];
  	        if (this.options.withStartIndices) {
  	            node.startIndex = this.parser.startIndex;
  	        }
  	        if (this.options.withEndIndices) {
  	            node.endIndex = this.parser.endIndex;
  	        }
  	        parent.children.push(node);
  	        if (previousSibling) {
  	            node.prev = previousSibling;
  	            previousSibling.next = node;
  	        }
  	        node.parent = parent;
  	        this.lastNode = null;
  	    };
  	    return DomHandler;
  	}());
  	exports.DomHandler = DomHandler;
  	exports.default = DomHandler;
  } (lib$4));

  var FeedHandler$1 = {};

  var lib$2 = {};

  var stringify$5 = {};

  var lib$1 = {};

  var lib = {};

  var decode = {};

  var __importDefault$3 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(decode, "__esModule", { value: true });
  decode.decodeHTML = decode.decodeHTMLStrict = decode.decodeXML = void 0;
  var entities_json_1$1 = __importDefault$3(require$$1$1);
  var legacy_json_1 = __importDefault$3(require$$1);
  var xml_json_1$1 = __importDefault$3(require$$0);
  var decode_codepoint_1 = __importDefault$3(decode_codepoint);
  var strictEntityRe = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
  decode.decodeXML = getStrictDecoder(xml_json_1$1.default);
  decode.decodeHTMLStrict = getStrictDecoder(entities_json_1$1.default);
  function getStrictDecoder(map) {
      var replace = getReplacer(map);
      return function (str) { return String(str).replace(strictEntityRe, replace); };
  }
  var sorter = function (a, b) { return (a < b ? 1 : -1); };
  decode.decodeHTML = (function () {
      var legacy = Object.keys(legacy_json_1.default).sort(sorter);
      var keys = Object.keys(entities_json_1$1.default).sort(sorter);
      for (var i = 0, j = 0; i < keys.length; i++) {
          if (legacy[j] === keys[i]) {
              keys[i] += ";?";
              j++;
          }
          else {
              keys[i] += ";";
          }
      }
      var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
      var replace = getReplacer(entities_json_1$1.default);
      function replacer(str) {
          if (str.substr(-1) !== ";")
              str += ";";
          return replace(str);
      }
      // TODO consider creating a merged map
      return function (str) { return String(str).replace(re, replacer); };
  })();
  function getReplacer(map) {
      return function replace(str) {
          if (str.charAt(1) === "#") {
              var secondChar = str.charAt(2);
              if (secondChar === "X" || secondChar === "x") {
                  return decode_codepoint_1.default(parseInt(str.substr(3), 16));
              }
              return decode_codepoint_1.default(parseInt(str.substr(2), 10));
          }
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          return map[str.slice(1, -1)] || str;
      };
  }

  var encode = {};

  var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(encode, "__esModule", { value: true });
  encode.escapeUTF8 = encode.escape = encode.encodeNonAsciiHTML = encode.encodeHTML = encode.encodeXML = void 0;
  var xml_json_1 = __importDefault$2(require$$0);
  var inverseXML = getInverseObj(xml_json_1.default);
  var xmlReplacer = getInverseReplacer(inverseXML);
  /**
   * Encodes all non-ASCII characters, as well as characters not valid in XML
   * documents using XML entities.
   *
   * If a character has no equivalent entity, a
   * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
   */
  encode.encodeXML = getASCIIEncoder(inverseXML);
  var entities_json_1 = __importDefault$2(require$$1$1);
  var inverseHTML = getInverseObj(entities_json_1.default);
  var htmlReplacer = getInverseReplacer(inverseHTML);
  /**
   * Encodes all entities and non-ASCII characters in the input.
   *
   * This includes characters that are valid ASCII characters in HTML documents.
   * For example `#` will be encoded as `&num;`. To get a more compact output,
   * consider using the `encodeNonAsciiHTML` function.
   *
   * If a character has no equivalent entity, a
   * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
   */
  encode.encodeHTML = getInverse(inverseHTML, htmlReplacer);
  /**
   * Encodes all non-ASCII characters, as well as characters not valid in HTML
   * documents using HTML entities.
   *
   * If a character has no equivalent entity, a
   * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
   */
  encode.encodeNonAsciiHTML = getASCIIEncoder(inverseHTML);
  function getInverseObj(obj) {
      return Object.keys(obj)
          .sort()
          .reduce(function (inverse, name) {
          inverse[obj[name]] = "&" + name + ";";
          return inverse;
      }, {});
  }
  function getInverseReplacer(inverse) {
      var single = [];
      var multiple = [];
      for (var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++) {
          var k = _a[_i];
          if (k.length === 1) {
              // Add value to single array
              single.push("\\" + k);
          }
          else {
              // Add value to multiple array
              multiple.push(k);
          }
      }
      // Add ranges to single characters.
      single.sort();
      for (var start = 0; start < single.length - 1; start++) {
          // Find the end of a run of characters
          var end = start;
          while (end < single.length - 1 &&
              single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
              end += 1;
          }
          var count = 1 + end - start;
          // We want to replace at least three characters
          if (count < 3)
              continue;
          single.splice(start, count, single[start] + "-" + single[end]);
      }
      multiple.unshift("[" + single.join("") + "]");
      return new RegExp(multiple.join("|"), "g");
  }
  // /[^\0-\x7F]/gu
  var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
  var getCodePoint = 
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  String.prototype.codePointAt != null
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          function (str) { return str.codePointAt(0); }
      : // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          function (c) {
              return (c.charCodeAt(0) - 0xd800) * 0x400 +
                  c.charCodeAt(1) -
                  0xdc00 +
                  0x10000;
          };
  function singleCharReplacer(c) {
      return "&#x" + (c.length > 1 ? getCodePoint(c) : c.charCodeAt(0))
          .toString(16)
          .toUpperCase() + ";";
  }
  function getInverse(inverse, re) {
      return function (data) {
          return data
              .replace(re, function (name) { return inverse[name]; })
              .replace(reNonASCII, singleCharReplacer);
      };
  }
  var reEscapeChars = new RegExp(xmlReplacer.source + "|" + reNonASCII.source, "g");
  /**
   * Encodes all non-ASCII characters, as well as characters not valid in XML
   * documents using numeric hexadecimal reference (eg. `&#xfc;`).
   *
   * Have a look at `escapeUTF8` if you want a more concise output at the expense
   * of reduced transportability.
   *
   * @param data String to escape.
   */
  function escape(data) {
      return data.replace(reEscapeChars, singleCharReplacer);
  }
  encode.escape = escape;
  /**
   * Encodes all characters not valid in XML documents using numeric hexadecimal
   * reference (eg. `&#xfc;`).
   *
   * Note that the output will be character-set dependent.
   *
   * @param data String to escape.
   */
  function escapeUTF8(data) {
      return data.replace(xmlReplacer, singleCharReplacer);
  }
  encode.escapeUTF8 = escapeUTF8;
  function getASCIIEncoder(obj) {
      return function (data) {
          return data.replace(reEscapeChars, function (c) { return obj[c] || singleCharReplacer(c); });
      };
  }

  (function (exports) {
  	Object.defineProperty(exports, "__esModule", { value: true });
  	exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = void 0;
  	var decode_1 = decode;
  	var encode_1 = encode;
  	/**
  	 * Decodes a string with entities.
  	 *
  	 * @param data String to decode.
  	 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
  	 * @deprecated Use `decodeXML` or `decodeHTML` directly.
  	 */
  	function decode$1(data, level) {
  	    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTML)(data);
  	}
  	exports.decode = decode$1;
  	/**
  	 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
  	 *
  	 * @param data String to decode.
  	 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
  	 * @deprecated Use `decodeHTMLStrict` or `decodeXML` directly.
  	 */
  	function decodeStrict(data, level) {
  	    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTMLStrict)(data);
  	}
  	exports.decodeStrict = decodeStrict;
  	/**
  	 * Encodes a string with entities.
  	 *
  	 * @param data String to encode.
  	 * @param level Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
  	 * @deprecated Use `encodeHTML`, `encodeXML` or `encodeNonAsciiHTML` directly.
  	 */
  	function encode$1(data, level) {
  	    return (!level || level <= 0 ? encode_1.encodeXML : encode_1.encodeHTML)(data);
  	}
  	exports.encode = encode$1;
  	var encode_2 = encode;
  	Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function () { return encode_2.encodeXML; } });
  	Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
  	Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function () { return encode_2.encodeNonAsciiHTML; } });
  	Object.defineProperty(exports, "escape", { enumerable: true, get: function () { return encode_2.escape; } });
  	Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function () { return encode_2.escapeUTF8; } });
  	// Legacy aliases (deprecated)
  	Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
  	Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
  	var decode_2 = decode;
  	Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function () { return decode_2.decodeXML; } });
  	Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
  	Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
  	// Legacy aliases (deprecated)
  	Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
  	Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
  	Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
  	Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
  	Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function () { return decode_2.decodeXML; } });
  } (lib));

  var foreignNames = {};

  Object.defineProperty(foreignNames, "__esModule", { value: true });
  foreignNames.attributeNames = foreignNames.elementNames = void 0;
  foreignNames.elementNames = new Map([
      ["altglyph", "altGlyph"],
      ["altglyphdef", "altGlyphDef"],
      ["altglyphitem", "altGlyphItem"],
      ["animatecolor", "animateColor"],
      ["animatemotion", "animateMotion"],
      ["animatetransform", "animateTransform"],
      ["clippath", "clipPath"],
      ["feblend", "feBlend"],
      ["fecolormatrix", "feColorMatrix"],
      ["fecomponenttransfer", "feComponentTransfer"],
      ["fecomposite", "feComposite"],
      ["feconvolvematrix", "feConvolveMatrix"],
      ["fediffuselighting", "feDiffuseLighting"],
      ["fedisplacementmap", "feDisplacementMap"],
      ["fedistantlight", "feDistantLight"],
      ["fedropshadow", "feDropShadow"],
      ["feflood", "feFlood"],
      ["fefunca", "feFuncA"],
      ["fefuncb", "feFuncB"],
      ["fefuncg", "feFuncG"],
      ["fefuncr", "feFuncR"],
      ["fegaussianblur", "feGaussianBlur"],
      ["feimage", "feImage"],
      ["femerge", "feMerge"],
      ["femergenode", "feMergeNode"],
      ["femorphology", "feMorphology"],
      ["feoffset", "feOffset"],
      ["fepointlight", "fePointLight"],
      ["fespecularlighting", "feSpecularLighting"],
      ["fespotlight", "feSpotLight"],
      ["fetile", "feTile"],
      ["feturbulence", "feTurbulence"],
      ["foreignobject", "foreignObject"],
      ["glyphref", "glyphRef"],
      ["lineargradient", "linearGradient"],
      ["radialgradient", "radialGradient"],
      ["textpath", "textPath"],
  ]);
  foreignNames.attributeNames = new Map([
      ["definitionurl", "definitionURL"],
      ["attributename", "attributeName"],
      ["attributetype", "attributeType"],
      ["basefrequency", "baseFrequency"],
      ["baseprofile", "baseProfile"],
      ["calcmode", "calcMode"],
      ["clippathunits", "clipPathUnits"],
      ["diffuseconstant", "diffuseConstant"],
      ["edgemode", "edgeMode"],
      ["filterunits", "filterUnits"],
      ["glyphref", "glyphRef"],
      ["gradienttransform", "gradientTransform"],
      ["gradientunits", "gradientUnits"],
      ["kernelmatrix", "kernelMatrix"],
      ["kernelunitlength", "kernelUnitLength"],
      ["keypoints", "keyPoints"],
      ["keysplines", "keySplines"],
      ["keytimes", "keyTimes"],
      ["lengthadjust", "lengthAdjust"],
      ["limitingconeangle", "limitingConeAngle"],
      ["markerheight", "markerHeight"],
      ["markerunits", "markerUnits"],
      ["markerwidth", "markerWidth"],
      ["maskcontentunits", "maskContentUnits"],
      ["maskunits", "maskUnits"],
      ["numoctaves", "numOctaves"],
      ["pathlength", "pathLength"],
      ["patterncontentunits", "patternContentUnits"],
      ["patterntransform", "patternTransform"],
      ["patternunits", "patternUnits"],
      ["pointsatx", "pointsAtX"],
      ["pointsaty", "pointsAtY"],
      ["pointsatz", "pointsAtZ"],
      ["preservealpha", "preserveAlpha"],
      ["preserveaspectratio", "preserveAspectRatio"],
      ["primitiveunits", "primitiveUnits"],
      ["refx", "refX"],
      ["refy", "refY"],
      ["repeatcount", "repeatCount"],
      ["repeatdur", "repeatDur"],
      ["requiredextensions", "requiredExtensions"],
      ["requiredfeatures", "requiredFeatures"],
      ["specularconstant", "specularConstant"],
      ["specularexponent", "specularExponent"],
      ["spreadmethod", "spreadMethod"],
      ["startoffset", "startOffset"],
      ["stddeviation", "stdDeviation"],
      ["stitchtiles", "stitchTiles"],
      ["surfacescale", "surfaceScale"],
      ["systemlanguage", "systemLanguage"],
      ["tablevalues", "tableValues"],
      ["targetx", "targetX"],
      ["targety", "targetY"],
      ["textlength", "textLength"],
      ["viewbox", "viewBox"],
      ["viewtarget", "viewTarget"],
      ["xchannelselector", "xChannelSelector"],
      ["ychannelselector", "yChannelSelector"],
      ["zoomandpan", "zoomAndPan"],
  ]);

  var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
      __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                  t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };
  var __createBinding$1 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault$1 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar$1 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$1(result, mod, k);
      __setModuleDefault$1(result, mod);
      return result;
  };
  Object.defineProperty(lib$1, "__esModule", { value: true });
  /*
   * Module dependencies
   */
  var ElementType = __importStar$1(lib$3);
  var entities_1 = lib;
  /**
   * Mixed-case SVG and MathML tags & attributes
   * recognized by the HTML parser.
   *
   * @see https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign
   */
  var foreignNames_1 = foreignNames;
  var unencodedElements = new Set([
      "style",
      "script",
      "xmp",
      "iframe",
      "noembed",
      "noframes",
      "plaintext",
      "noscript",
  ]);
  /**
   * Format attributes
   */
  function formatAttributes(attributes, opts) {
      if (!attributes)
          return;
      return Object.keys(attributes)
          .map(function (key) {
          var _a, _b;
          var value = (_a = attributes[key]) !== null && _a !== void 0 ? _a : "";
          if (opts.xmlMode === "foreign") {
              /* Fix up mixed-case attribute names */
              key = (_b = foreignNames_1.attributeNames.get(key)) !== null && _b !== void 0 ? _b : key;
          }
          if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
              return key;
          }
          return key + "=\"" + (opts.decodeEntities !== false
              ? entities_1.encodeXML(value)
              : value.replace(/"/g, "&quot;")) + "\"";
      })
          .join(" ");
  }
  /**
   * Self-enclosing tags
   */
  var singleTag = new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
  ]);
  /**
   * Renders a DOM node or an array of DOM nodes to a string.
   *
   * Can be thought of as the equivalent of the `outerHTML` of the passed node(s).
   *
   * @param node Node to be rendered.
   * @param options Changes serialization behavior
   */
  function render(node, options) {
      if (options === void 0) { options = {}; }
      var nodes = "length" in node ? node : [node];
      var output = "";
      for (var i = 0; i < nodes.length; i++) {
          output += renderNode(nodes[i], options);
      }
      return output;
  }
  lib$1.default = render;
  function renderNode(node, options) {
      switch (node.type) {
          case ElementType.Root:
              return render(node.children, options);
          case ElementType.Directive:
          case ElementType.Doctype:
              return renderDirective(node);
          case ElementType.Comment:
              return renderComment(node);
          case ElementType.CDATA:
              return renderCdata(node);
          case ElementType.Script:
          case ElementType.Style:
          case ElementType.Tag:
              return renderTag(node, options);
          case ElementType.Text:
              return renderText(node, options);
      }
  }
  var foreignModeIntegrationPoints = new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignObject",
      "desc",
      "title",
  ]);
  var foreignElements = new Set(["svg", "math"]);
  function renderTag(elem, opts) {
      var _a;
      // Handle SVG / MathML in HTML
      if (opts.xmlMode === "foreign") {
          /* Fix up mixed-case element names */
          elem.name = (_a = foreignNames_1.elementNames.get(elem.name)) !== null && _a !== void 0 ? _a : elem.name;
          /* Exit foreign mode at integration points */
          if (elem.parent &&
              foreignModeIntegrationPoints.has(elem.parent.name)) {
              opts = __assign(__assign({}, opts), { xmlMode: false });
          }
      }
      if (!opts.xmlMode && foreignElements.has(elem.name)) {
          opts = __assign(__assign({}, opts), { xmlMode: "foreign" });
      }
      var tag = "<" + elem.name;
      var attribs = formatAttributes(elem.attribs, opts);
      if (attribs) {
          tag += " " + attribs;
      }
      if (elem.children.length === 0 &&
          (opts.xmlMode
              ? // In XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
                  opts.selfClosingTags !== false
              : // User explicitly asked for self-closing tags, even in HTML mode
                  opts.selfClosingTags && singleTag.has(elem.name))) {
          if (!opts.xmlMode)
              tag += " ";
          tag += "/>";
      }
      else {
          tag += ">";
          if (elem.children.length > 0) {
              tag += render(elem.children, opts);
          }
          if (opts.xmlMode || !singleTag.has(elem.name)) {
              tag += "</" + elem.name + ">";
          }
      }
      return tag;
  }
  function renderDirective(elem) {
      return "<" + elem.data + ">";
  }
  function renderText(elem, opts) {
      var data = elem.data || "";
      // If entities weren't decoded, no need to encode them back
      if (opts.decodeEntities !== false &&
          !(!opts.xmlMode &&
              elem.parent &&
              unencodedElements.has(elem.parent.name))) {
          data = entities_1.encodeXML(data);
      }
      return data;
  }
  function renderCdata(elem) {
      return "<![CDATA[" + elem.children[0].data + "]]>";
  }
  function renderComment(elem) {
      return "<!--" + elem.data + "-->";
  }

  var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(stringify$5, "__esModule", { value: true });
  stringify$5.innerText = stringify$5.textContent = stringify$5.getText = stringify$5.getInnerHTML = stringify$5.getOuterHTML = void 0;
  var domhandler_1$5 = lib$4;
  var dom_serializer_1 = __importDefault$1(lib$1);
  var domelementtype_1 = lib$3;
  /**
   * @param node Node to get the outer HTML of.
   * @param options Options for serialization.
   * @deprecated Use the `dom-serializer` module directly.
   * @returns `node`'s outer HTML.
   */
  function getOuterHTML(node, options) {
      return (0, dom_serializer_1.default)(node, options);
  }
  stringify$5.getOuterHTML = getOuterHTML;
  /**
   * @param node Node to get the inner HTML of.
   * @param options Options for serialization.
   * @deprecated Use the `dom-serializer` module directly.
   * @returns `node`'s inner HTML.
   */
  function getInnerHTML(node, options) {
      return (0, domhandler_1$5.hasChildren)(node)
          ? node.children.map(function (node) { return getOuterHTML(node, options); }).join("")
          : "";
  }
  stringify$5.getInnerHTML = getInnerHTML;
  /**
   * Get a node's inner text. Same as `textContent`, but inserts newlines for `<br>` tags.
   *
   * @deprecated Use `textContent` instead.
   * @param node Node to get the inner text of.
   * @returns `node`'s inner text.
   */
  function getText(node) {
      if (Array.isArray(node))
          return node.map(getText).join("");
      if ((0, domhandler_1$5.isTag)(node))
          return node.name === "br" ? "\n" : getText(node.children);
      if ((0, domhandler_1$5.isCDATA)(node))
          return getText(node.children);
      if ((0, domhandler_1$5.isText)(node))
          return node.data;
      return "";
  }
  stringify$5.getText = getText;
  /**
   * Get a node's text content.
   *
   * @param node Node to get the text content of.
   * @returns `node`'s text content.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent}
   */
  function textContent(node) {
      if (Array.isArray(node))
          return node.map(textContent).join("");
      if ((0, domhandler_1$5.hasChildren)(node) && !(0, domhandler_1$5.isComment)(node)) {
          return textContent(node.children);
      }
      if ((0, domhandler_1$5.isText)(node))
          return node.data;
      return "";
  }
  stringify$5.textContent = textContent;
  /**
   * Get a node's inner text.
   *
   * @param node Node to get the inner text of.
   * @returns `node`'s inner text.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/innerText}
   */
  function innerText(node) {
      if (Array.isArray(node))
          return node.map(innerText).join("");
      if ((0, domhandler_1$5.hasChildren)(node) && (node.type === domelementtype_1.ElementType.Tag || (0, domhandler_1$5.isCDATA)(node))) {
          return innerText(node.children);
      }
      if ((0, domhandler_1$5.isText)(node))
          return node.data;
      return "";
  }
  stringify$5.innerText = innerText;

  var traversal = {};

  Object.defineProperty(traversal, "__esModule", { value: true });
  traversal.prevElementSibling = traversal.nextElementSibling = traversal.getName = traversal.hasAttrib = traversal.getAttributeValue = traversal.getSiblings = traversal.getParent = traversal.getChildren = void 0;
  var domhandler_1$4 = lib$4;
  var emptyArray = [];
  /**
   * Get a node's children.
   *
   * @param elem Node to get the children of.
   * @returns `elem`'s children, or an empty array.
   */
  function getChildren(elem) {
      var _a;
      return (_a = elem.children) !== null && _a !== void 0 ? _a : emptyArray;
  }
  traversal.getChildren = getChildren;
  /**
   * Get a node's parent.
   *
   * @param elem Node to get the parent of.
   * @returns `elem`'s parent node.
   */
  function getParent(elem) {
      return elem.parent || null;
  }
  traversal.getParent = getParent;
  /**
   * Gets an elements siblings, including the element itself.
   *
   * Attempts to get the children through the element's parent first.
   * If we don't have a parent (the element is a root node),
   * we walk the element's `prev` & `next` to get all remaining nodes.
   *
   * @param elem Element to get the siblings of.
   * @returns `elem`'s siblings.
   */
  function getSiblings(elem) {
      var _a, _b;
      var parent = getParent(elem);
      if (parent != null)
          return getChildren(parent);
      var siblings = [elem];
      var prev = elem.prev, next = elem.next;
      while (prev != null) {
          siblings.unshift(prev);
          (_a = prev, prev = _a.prev);
      }
      while (next != null) {
          siblings.push(next);
          (_b = next, next = _b.next);
      }
      return siblings;
  }
  traversal.getSiblings = getSiblings;
  /**
   * Gets an attribute from an element.
   *
   * @param elem Element to check.
   * @param name Attribute name to retrieve.
   * @returns The element's attribute value, or `undefined`.
   */
  function getAttributeValue(elem, name) {
      var _a;
      return (_a = elem.attribs) === null || _a === void 0 ? void 0 : _a[name];
  }
  traversal.getAttributeValue = getAttributeValue;
  /**
   * Checks whether an element has an attribute.
   *
   * @param elem Element to check.
   * @param name Attribute name to look for.
   * @returns Returns whether `elem` has the attribute `name`.
   */
  function hasAttrib(elem, name) {
      return (elem.attribs != null &&
          Object.prototype.hasOwnProperty.call(elem.attribs, name) &&
          elem.attribs[name] != null);
  }
  traversal.hasAttrib = hasAttrib;
  /**
   * Get the tag name of an element.
   *
   * @param elem The element to get the name for.
   * @returns The tag name of `elem`.
   */
  function getName(elem) {
      return elem.name;
  }
  traversal.getName = getName;
  /**
   * Returns the next element sibling of a node.
   *
   * @param elem The element to get the next sibling of.
   * @returns `elem`'s next sibling that is a tag.
   */
  function nextElementSibling(elem) {
      var _a;
      var next = elem.next;
      while (next !== null && !(0, domhandler_1$4.isTag)(next))
          (_a = next, next = _a.next);
      return next;
  }
  traversal.nextElementSibling = nextElementSibling;
  /**
   * Returns the previous element sibling of a node.
   *
   * @param elem The element to get the previous sibling of.
   * @returns `elem`'s previous sibling that is a tag.
   */
  function prevElementSibling(elem) {
      var _a;
      var prev = elem.prev;
      while (prev !== null && !(0, domhandler_1$4.isTag)(prev))
          (_a = prev, prev = _a.prev);
      return prev;
  }
  traversal.prevElementSibling = prevElementSibling;

  var manipulation = {};

  Object.defineProperty(manipulation, "__esModule", { value: true });
  manipulation.prepend = manipulation.prependChild = manipulation.append = manipulation.appendChild = manipulation.replaceElement = manipulation.removeElement = void 0;
  /**
   * Remove an element from the dom
   *
   * @param elem The element to be removed
   */
  function removeElement(elem) {
      if (elem.prev)
          elem.prev.next = elem.next;
      if (elem.next)
          elem.next.prev = elem.prev;
      if (elem.parent) {
          var childs = elem.parent.children;
          childs.splice(childs.lastIndexOf(elem), 1);
      }
  }
  manipulation.removeElement = removeElement;
  /**
   * Replace an element in the dom
   *
   * @param elem The element to be replaced
   * @param replacement The element to be added
   */
  function replaceElement(elem, replacement) {
      var prev = (replacement.prev = elem.prev);
      if (prev) {
          prev.next = replacement;
      }
      var next = (replacement.next = elem.next);
      if (next) {
          next.prev = replacement;
      }
      var parent = (replacement.parent = elem.parent);
      if (parent) {
          var childs = parent.children;
          childs[childs.lastIndexOf(elem)] = replacement;
      }
  }
  manipulation.replaceElement = replaceElement;
  /**
   * Append a child to an element.
   *
   * @param elem The element to append to.
   * @param child The element to be added as a child.
   */
  function appendChild(elem, child) {
      removeElement(child);
      child.next = null;
      child.parent = elem;
      if (elem.children.push(child) > 1) {
          var sibling = elem.children[elem.children.length - 2];
          sibling.next = child;
          child.prev = sibling;
      }
      else {
          child.prev = null;
      }
  }
  manipulation.appendChild = appendChild;
  /**
   * Append an element after another.
   *
   * @param elem The element to append after.
   * @param next The element be added.
   */
  function append(elem, next) {
      removeElement(next);
      var parent = elem.parent;
      var currNext = elem.next;
      next.next = currNext;
      next.prev = elem;
      elem.next = next;
      next.parent = parent;
      if (currNext) {
          currNext.prev = next;
          if (parent) {
              var childs = parent.children;
              childs.splice(childs.lastIndexOf(currNext), 0, next);
          }
      }
      else if (parent) {
          parent.children.push(next);
      }
  }
  manipulation.append = append;
  /**
   * Prepend a child to an element.
   *
   * @param elem The element to prepend before.
   * @param child The element to be added as a child.
   */
  function prependChild(elem, child) {
      removeElement(child);
      child.parent = elem;
      child.prev = null;
      if (elem.children.unshift(child) !== 1) {
          var sibling = elem.children[1];
          sibling.prev = child;
          child.next = sibling;
      }
      else {
          child.next = null;
      }
  }
  manipulation.prependChild = prependChild;
  /**
   * Prepend an element before another.
   *
   * @param elem The element to prepend before.
   * @param prev The element be added.
   */
  function prepend(elem, prev) {
      removeElement(prev);
      var parent = elem.parent;
      if (parent) {
          var childs = parent.children;
          childs.splice(childs.indexOf(elem), 0, prev);
      }
      if (elem.prev) {
          elem.prev.next = prev;
      }
      prev.parent = parent;
      prev.prev = elem.prev;
      prev.next = elem;
      elem.prev = prev;
  }
  manipulation.prepend = prepend;

  var querying = {};

  Object.defineProperty(querying, "__esModule", { value: true });
  querying.findAll = querying.existsOne = querying.findOne = querying.findOneChild = querying.find = querying.filter = void 0;
  var domhandler_1$3 = lib$4;
  /**
   * Search a node and its children for nodes passing a test function.
   *
   * @param test Function to test nodes on.
   * @param node Node to search. Will be included in the result set if it matches.
   * @param recurse Also consider child nodes.
   * @param limit Maximum number of nodes to return.
   * @returns All nodes passing `test`.
   */
  function filter$1(test, node, recurse, limit) {
      if (recurse === void 0) { recurse = true; }
      if (limit === void 0) { limit = Infinity; }
      if (!Array.isArray(node))
          node = [node];
      return find(test, node, recurse, limit);
  }
  querying.filter = filter$1;
  /**
   * Search an array of node and its children for nodes passing a test function.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   * @param recurse Also consider child nodes.
   * @param limit Maximum number of nodes to return.
   * @returns All nodes passing `test`.
   */
  function find(test, nodes, recurse, limit) {
      var result = [];
      for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
          var elem = nodes_1[_i];
          if (test(elem)) {
              result.push(elem);
              if (--limit <= 0)
                  break;
          }
          if (recurse && (0, domhandler_1$3.hasChildren)(elem) && elem.children.length > 0) {
              var children = find(test, elem.children, recurse, limit);
              result.push.apply(result, children);
              limit -= children.length;
              if (limit <= 0)
                  break;
          }
      }
      return result;
  }
  querying.find = find;
  /**
   * Finds the first element inside of an array that matches a test function.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   * @returns The first node in the array that passes `test`.
   */
  function findOneChild(test, nodes) {
      return nodes.find(test);
  }
  querying.findOneChild = findOneChild;
  /**
   * Finds one element in a tree that passes a test.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   * @param recurse Also consider child nodes.
   * @returns The first child node that passes `test`.
   */
  function findOne(test, nodes, recurse) {
      if (recurse === void 0) { recurse = true; }
      var elem = null;
      for (var i = 0; i < nodes.length && !elem; i++) {
          var checked = nodes[i];
          if (!(0, domhandler_1$3.isTag)(checked)) {
              continue;
          }
          else if (test(checked)) {
              elem = checked;
          }
          else if (recurse && checked.children.length > 0) {
              elem = findOne(test, checked.children);
          }
      }
      return elem;
  }
  querying.findOne = findOne;
  /**
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   * @returns Whether a tree of nodes contains at least one node passing a test.
   */
  function existsOne(test, nodes) {
      return nodes.some(function (checked) {
          return (0, domhandler_1$3.isTag)(checked) &&
              (test(checked) ||
                  (checked.children.length > 0 &&
                      existsOne(test, checked.children)));
      });
  }
  querying.existsOne = existsOne;
  /**
   * Search and array of nodes and its children for nodes passing a test function.
   *
   * Same as `find`, only with less options, leading to reduced complexity.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   * @returns All nodes passing `test`.
   */
  function findAll(test, nodes) {
      var _a;
      var result = [];
      var stack = nodes.filter(domhandler_1$3.isTag);
      var elem;
      while ((elem = stack.shift())) {
          var children = (_a = elem.children) === null || _a === void 0 ? void 0 : _a.filter(domhandler_1$3.isTag);
          if (children && children.length > 0) {
              stack.unshift.apply(stack, children);
          }
          if (test(elem))
              result.push(elem);
      }
      return result;
  }
  querying.findAll = findAll;

  var legacy = {};

  Object.defineProperty(legacy, "__esModule", { value: true });
  legacy.getElementsByTagType = legacy.getElementsByTagName = legacy.getElementById = legacy.getElements = legacy.testElement = void 0;
  var domhandler_1$2 = lib$4;
  var querying_1 = querying;
  var Checks = {
      tag_name: function (name) {
          if (typeof name === "function") {
              return function (elem) { return (0, domhandler_1$2.isTag)(elem) && name(elem.name); };
          }
          else if (name === "*") {
              return domhandler_1$2.isTag;
          }
          return function (elem) { return (0, domhandler_1$2.isTag)(elem) && elem.name === name; };
      },
      tag_type: function (type) {
          if (typeof type === "function") {
              return function (elem) { return type(elem.type); };
          }
          return function (elem) { return elem.type === type; };
      },
      tag_contains: function (data) {
          if (typeof data === "function") {
              return function (elem) { return (0, domhandler_1$2.isText)(elem) && data(elem.data); };
          }
          return function (elem) { return (0, domhandler_1$2.isText)(elem) && elem.data === data; };
      },
  };
  /**
   * @param attrib Attribute to check.
   * @param value Attribute value to look for.
   * @returns A function to check whether the a node has an attribute with a particular value.
   */
  function getAttribCheck(attrib, value) {
      if (typeof value === "function") {
          return function (elem) { return (0, domhandler_1$2.isTag)(elem) && value(elem.attribs[attrib]); };
      }
      return function (elem) { return (0, domhandler_1$2.isTag)(elem) && elem.attribs[attrib] === value; };
  }
  /**
   * @param a First function to combine.
   * @param b Second function to combine.
   * @returns A function taking a node and returning `true` if either
   * of the input functions returns `true` for the node.
   */
  function combineFuncs(a, b) {
      return function (elem) { return a(elem) || b(elem); };
  }
  /**
   * @param options An object describing nodes to look for.
   * @returns A function executing all checks in `options` and returning `true`
   * if any of them match a node.
   */
  function compileTest(options) {
      var funcs = Object.keys(options).map(function (key) {
          var value = options[key];
          return Object.prototype.hasOwnProperty.call(Checks, key)
              ? Checks[key](value)
              : getAttribCheck(key, value);
      });
      return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
  }
  /**
   * @param options An object describing nodes to look for.
   * @param node The element to test.
   * @returns Whether the element matches the description in `options`.
   */
  function testElement(options, node) {
      var test = compileTest(options);
      return test ? test(node) : true;
  }
  legacy.testElement = testElement;
  /**
   * @param options An object describing nodes to look for.
   * @param nodes Nodes to search through.
   * @param recurse Also consider child nodes.
   * @param limit Maximum number of nodes to return.
   * @returns All nodes that match `options`.
   */
  function getElements$1(options, nodes, recurse, limit) {
      if (limit === void 0) { limit = Infinity; }
      var test = compileTest(options);
      return test ? (0, querying_1.filter)(test, nodes, recurse, limit) : [];
  }
  legacy.getElements = getElements$1;
  /**
   * @param id The unique ID attribute value to look for.
   * @param nodes Nodes to search through.
   * @param recurse Also consider child nodes.
   * @returns The node with the supplied ID.
   */
  function getElementById(id, nodes, recurse) {
      if (recurse === void 0) { recurse = true; }
      if (!Array.isArray(nodes))
          nodes = [nodes];
      return (0, querying_1.findOne)(getAttribCheck("id", id), nodes, recurse);
  }
  legacy.getElementById = getElementById;
  /**
   * @param tagName Tag name to search for.
   * @param nodes Nodes to search through.
   * @param recurse Also consider child nodes.
   * @param limit Maximum number of nodes to return.
   * @returns All nodes with the supplied `tagName`.
   */
  function getElementsByTagName(tagName, nodes, recurse, limit) {
      if (recurse === void 0) { recurse = true; }
      if (limit === void 0) { limit = Infinity; }
      return (0, querying_1.filter)(Checks.tag_name(tagName), nodes, recurse, limit);
  }
  legacy.getElementsByTagName = getElementsByTagName;
  /**
   * @param type Element type to look for.
   * @param nodes Nodes to search through.
   * @param recurse Also consider child nodes.
   * @param limit Maximum number of nodes to return.
   * @returns All nodes with the supplied `type`.
   */
  function getElementsByTagType(type, nodes, recurse, limit) {
      if (recurse === void 0) { recurse = true; }
      if (limit === void 0) { limit = Infinity; }
      return (0, querying_1.filter)(Checks.tag_type(type), nodes, recurse, limit);
  }
  legacy.getElementsByTagType = getElementsByTagType;

  var helpers = {};

  Object.defineProperty(helpers, "__esModule", { value: true });
  helpers.uniqueSort = helpers.compareDocumentPosition = helpers.removeSubsets = void 0;
  var domhandler_1$1 = lib$4;
  /**
   * Given an array of nodes, remove any member that is contained by another.
   *
   * @param nodes Nodes to filter.
   * @returns Remaining nodes that aren't subtrees of each other.
   */
  function removeSubsets(nodes) {
      var idx = nodes.length;
      /*
       * Check if each node (or one of its ancestors) is already contained in the
       * array.
       */
      while (--idx >= 0) {
          var node = nodes[idx];
          /*
           * Remove the node if it is not unique.
           * We are going through the array from the end, so we only
           * have to check nodes that preceed the node under consideration in the array.
           */
          if (idx > 0 && nodes.lastIndexOf(node, idx - 1) >= 0) {
              nodes.splice(idx, 1);
              continue;
          }
          for (var ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
              if (nodes.includes(ancestor)) {
                  nodes.splice(idx, 1);
                  break;
              }
          }
      }
      return nodes;
  }
  helpers.removeSubsets = removeSubsets;
  /**
   * Compare the position of one node against another node in any other document.
   * The return value is a bitmask with the following values:
   *
   * Document order:
   * > There is an ordering, document order, defined on all the nodes in the
   * > document corresponding to the order in which the first character of the
   * > XML representation of each node occurs in the XML representation of the
   * > document after expansion of general entities. Thus, the document element
   * > node will be the first node. Element nodes occur before their children.
   * > Thus, document order orders element nodes in order of the occurrence of
   * > their start-tag in the XML (after expansion of entities). The attribute
   * > nodes of an element occur after the element and before its children. The
   * > relative order of attribute nodes is implementation-dependent./
   *
   * Source:
   * http://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-document-order
   *
   * @param nodeA The first node to use in the comparison
   * @param nodeB The second node to use in the comparison
   * @returns A bitmask describing the input nodes' relative position.
   *
   * See http://dom.spec.whatwg.org/#dom-node-comparedocumentposition for
   * a description of these values.
   */
  function compareDocumentPosition(nodeA, nodeB) {
      var aParents = [];
      var bParents = [];
      if (nodeA === nodeB) {
          return 0;
      }
      var current = (0, domhandler_1$1.hasChildren)(nodeA) ? nodeA : nodeA.parent;
      while (current) {
          aParents.unshift(current);
          current = current.parent;
      }
      current = (0, domhandler_1$1.hasChildren)(nodeB) ? nodeB : nodeB.parent;
      while (current) {
          bParents.unshift(current);
          current = current.parent;
      }
      var maxIdx = Math.min(aParents.length, bParents.length);
      var idx = 0;
      while (idx < maxIdx && aParents[idx] === bParents[idx]) {
          idx++;
      }
      if (idx === 0) {
          return 1 /* DISCONNECTED */;
      }
      var sharedParent = aParents[idx - 1];
      var siblings = sharedParent.children;
      var aSibling = aParents[idx];
      var bSibling = bParents[idx];
      if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
          if (sharedParent === nodeB) {
              return 4 /* FOLLOWING */ | 16 /* CONTAINED_BY */;
          }
          return 4 /* FOLLOWING */;
      }
      if (sharedParent === nodeA) {
          return 2 /* PRECEDING */ | 8 /* CONTAINS */;
      }
      return 2 /* PRECEDING */;
  }
  helpers.compareDocumentPosition = compareDocumentPosition;
  /**
   * Sort an array of nodes based on their relative position in the document and
   * remove any duplicate nodes. If the array contains nodes that do not belong
   * to the same document, sort order is unspecified.
   *
   * @param nodes Array of DOM nodes.
   * @returns Collection of unique nodes, sorted in document order.
   */
  function uniqueSort(nodes) {
      nodes = nodes.filter(function (node, i, arr) { return !arr.includes(node, i + 1); });
      nodes.sort(function (a, b) {
          var relative = compareDocumentPosition(a, b);
          if (relative & 2 /* PRECEDING */) {
              return -1;
          }
          else if (relative & 4 /* FOLLOWING */) {
              return 1;
          }
          return 0;
      });
      return nodes;
  }
  helpers.uniqueSort = uniqueSort;

  var feeds = {};

  Object.defineProperty(feeds, "__esModule", { value: true });
  feeds.getFeed = void 0;
  var stringify_1$1 = stringify$5;
  var legacy_1 = legacy;
  /**
   * Get the feed object from the root of a DOM tree.
   *
   * @param doc - The DOM to to extract the feed from.
   * @returns The feed.
   */
  function getFeed(doc) {
      var feedRoot = getOneElement$1(isValidFeed$1, doc);
      return !feedRoot
          ? null
          : feedRoot.name === "feed"
              ? getAtomFeed(feedRoot)
              : getRssFeed(feedRoot);
  }
  feeds.getFeed = getFeed;
  /**
   * Parse an Atom feed.
   *
   * @param feedRoot The root of the feed.
   * @returns The parsed feed.
   */
  function getAtomFeed(feedRoot) {
      var _a;
      var childs = feedRoot.children;
      var feed = {
          type: "atom",
          items: (0, legacy_1.getElementsByTagName)("entry", childs).map(function (item) {
              var _a;
              var children = item.children;
              var entry = { media: getMediaElements$1(children) };
              addConditionally$1(entry, "id", "id", children);
              addConditionally$1(entry, "title", "title", children);
              var href = (_a = getOneElement$1("link", children)) === null || _a === void 0 ? void 0 : _a.attribs.href;
              if (href) {
                  entry.link = href;
              }
              var description = fetch$1("summary", children) || fetch$1("content", children);
              if (description) {
                  entry.description = description;
              }
              var pubDate = fetch$1("updated", children);
              if (pubDate) {
                  entry.pubDate = new Date(pubDate);
              }
              return entry;
          }),
      };
      addConditionally$1(feed, "id", "id", childs);
      addConditionally$1(feed, "title", "title", childs);
      var href = (_a = getOneElement$1("link", childs)) === null || _a === void 0 ? void 0 : _a.attribs.href;
      if (href) {
          feed.link = href;
      }
      addConditionally$1(feed, "description", "subtitle", childs);
      var updated = fetch$1("updated", childs);
      if (updated) {
          feed.updated = new Date(updated);
      }
      addConditionally$1(feed, "author", "email", childs, true);
      return feed;
  }
  /**
   * Parse a RSS feed.
   *
   * @param feedRoot The root of the feed.
   * @returns The parsed feed.
   */
  function getRssFeed(feedRoot) {
      var _a, _b;
      var childs = (_b = (_a = getOneElement$1("channel", feedRoot.children)) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [];
      var feed = {
          type: feedRoot.name.substr(0, 3),
          id: "",
          items: (0, legacy_1.getElementsByTagName)("item", feedRoot.children).map(function (item) {
              var children = item.children;
              var entry = { media: getMediaElements$1(children) };
              addConditionally$1(entry, "id", "guid", children);
              addConditionally$1(entry, "title", "title", children);
              addConditionally$1(entry, "link", "link", children);
              addConditionally$1(entry, "description", "description", children);
              var pubDate = fetch$1("pubDate", children);
              if (pubDate)
                  entry.pubDate = new Date(pubDate);
              return entry;
          }),
      };
      addConditionally$1(feed, "title", "title", childs);
      addConditionally$1(feed, "link", "link", childs);
      addConditionally$1(feed, "description", "description", childs);
      var updated = fetch$1("lastBuildDate", childs);
      if (updated) {
          feed.updated = new Date(updated);
      }
      addConditionally$1(feed, "author", "managingEditor", childs, true);
      return feed;
  }
  var MEDIA_KEYS_STRING = ["url", "type", "lang"];
  var MEDIA_KEYS_INT = [
      "fileSize",
      "bitrate",
      "framerate",
      "samplingrate",
      "channels",
      "duration",
      "height",
      "width",
  ];
  /**
   * Get all media elements of a feed item.
   *
   * @param where Nodes to search in.
   * @returns Media elements.
   */
  function getMediaElements$1(where) {
      return (0, legacy_1.getElementsByTagName)("media:content", where).map(function (elem) {
          var attribs = elem.attribs;
          var media = {
              medium: attribs.medium,
              isDefault: !!attribs.isDefault,
          };
          for (var _i = 0, MEDIA_KEYS_STRING_1 = MEDIA_KEYS_STRING; _i < MEDIA_KEYS_STRING_1.length; _i++) {
              var attrib = MEDIA_KEYS_STRING_1[_i];
              if (attribs[attrib]) {
                  media[attrib] = attribs[attrib];
              }
          }
          for (var _a = 0, MEDIA_KEYS_INT_1 = MEDIA_KEYS_INT; _a < MEDIA_KEYS_INT_1.length; _a++) {
              var attrib = MEDIA_KEYS_INT_1[_a];
              if (attribs[attrib]) {
                  media[attrib] = parseInt(attribs[attrib], 10);
              }
          }
          if (attribs.expression) {
              media.expression =
                  attribs.expression;
          }
          return media;
      });
  }
  /**
   * Get one element by tag name.
   *
   * @param tagName Tag name to look for
   * @param node Node to search in
   * @returns The element or null
   */
  function getOneElement$1(tagName, node) {
      return (0, legacy_1.getElementsByTagName)(tagName, node, true, 1)[0];
  }
  /**
   * Get the text content of an element with a certain tag name.
   *
   * @param tagName Tag name to look for.
   * @param where  Node to search in.
   * @param recurse Whether to recurse into child nodes.
   * @returns The text content of the element.
   */
  function fetch$1(tagName, where, recurse) {
      if (recurse === void 0) { recurse = false; }
      return (0, stringify_1$1.textContent)((0, legacy_1.getElementsByTagName)(tagName, where, recurse, 1)).trim();
  }
  /**
   * Adds a property to an object if it has a value.
   *
   * @param obj Object to be extended
   * @param prop Property name
   * @param tagName Tag name that contains the conditionally added property
   * @param where Element to search for the property
   * @param recurse Whether to recurse into child nodes.
   */
  function addConditionally$1(obj, prop, tagName, where, recurse) {
      if (recurse === void 0) { recurse = false; }
      var val = fetch$1(tagName, where, recurse);
      if (val)
          obj[prop] = val;
  }
  /**
   * Checks if an element is a feed root node.
   *
   * @param value The name of the element to check.
   * @returns Whether an element is a feed root node.
   */
  function isValidFeed$1(value) {
      return value === "rss" || value === "feed" || value === "rdf:RDF";
  }

  (function (exports) {
  	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
  	    if (k2 === undefined) k2 = k;
  	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  	}) : (function(o, m, k, k2) {
  	    if (k2 === undefined) k2 = k;
  	    o[k2] = m[k];
  	}));
  	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
  	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
  	};
  	Object.defineProperty(exports, "__esModule", { value: true });
  	exports.hasChildren = exports.isDocument = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = void 0;
  	__exportStar(stringify$5, exports);
  	__exportStar(traversal, exports);
  	__exportStar(manipulation, exports);
  	__exportStar(querying, exports);
  	__exportStar(legacy, exports);
  	__exportStar(helpers, exports);
  	__exportStar(feeds, exports);
  	/** @deprecated Use these methods from `domhandler` directly. */
  	var domhandler_1 = lib$4;
  	Object.defineProperty(exports, "isTag", { enumerable: true, get: function () { return domhandler_1.isTag; } });
  	Object.defineProperty(exports, "isCDATA", { enumerable: true, get: function () { return domhandler_1.isCDATA; } });
  	Object.defineProperty(exports, "isText", { enumerable: true, get: function () { return domhandler_1.isText; } });
  	Object.defineProperty(exports, "isComment", { enumerable: true, get: function () { return domhandler_1.isComment; } });
  	Object.defineProperty(exports, "isDocument", { enumerable: true, get: function () { return domhandler_1.isDocument; } });
  	Object.defineProperty(exports, "hasChildren", { enumerable: true, get: function () { return domhandler_1.hasChildren; } });
  } (lib$2));

  var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          if (typeof b !== "function" && b !== null)
              throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(FeedHandler$1, "__esModule", { value: true });
  FeedHandler$1.parseFeed = FeedHandler$1.FeedHandler = void 0;
  var domhandler_1 = __importDefault(lib$4);
  var DomUtils = __importStar(lib$2);
  var Parser_1 = Parser$3;
  var FeedItemMediaMedium;
  (function (FeedItemMediaMedium) {
      FeedItemMediaMedium[FeedItemMediaMedium["image"] = 0] = "image";
      FeedItemMediaMedium[FeedItemMediaMedium["audio"] = 1] = "audio";
      FeedItemMediaMedium[FeedItemMediaMedium["video"] = 2] = "video";
      FeedItemMediaMedium[FeedItemMediaMedium["document"] = 3] = "document";
      FeedItemMediaMedium[FeedItemMediaMedium["executable"] = 4] = "executable";
  })(FeedItemMediaMedium || (FeedItemMediaMedium = {}));
  var FeedItemMediaExpression;
  (function (FeedItemMediaExpression) {
      FeedItemMediaExpression[FeedItemMediaExpression["sample"] = 0] = "sample";
      FeedItemMediaExpression[FeedItemMediaExpression["full"] = 1] = "full";
      FeedItemMediaExpression[FeedItemMediaExpression["nonstop"] = 2] = "nonstop";
  })(FeedItemMediaExpression || (FeedItemMediaExpression = {}));
  // TODO: Consume data as it is coming in
  var FeedHandler = /** @class */ (function (_super) {
      __extends(FeedHandler, _super);
      /**
       *
       * @param callback
       * @param options
       */
      function FeedHandler(callback, options) {
          var _this = this;
          if (typeof callback === "object") {
              callback = undefined;
              options = callback;
          }
          _this = _super.call(this, callback, options) || this;
          return _this;
      }
      FeedHandler.prototype.onend = function () {
          var _a, _b;
          var feedRoot = getOneElement(isValidFeed, this.dom);
          if (!feedRoot) {
              this.handleCallback(new Error("couldn't find root of feed"));
              return;
          }
          var feed = {};
          if (feedRoot.name === "feed") {
              var childs = feedRoot.children;
              feed.type = "atom";
              addConditionally(feed, "id", "id", childs);
              addConditionally(feed, "title", "title", childs);
              var href = getAttribute("href", getOneElement("link", childs));
              if (href) {
                  feed.link = href;
              }
              addConditionally(feed, "description", "subtitle", childs);
              var updated = fetch("updated", childs);
              if (updated) {
                  feed.updated = new Date(updated);
              }
              addConditionally(feed, "author", "email", childs, true);
              feed.items = getElements("entry", childs).map(function (item) {
                  var entry = {};
                  var children = item.children;
                  addConditionally(entry, "id", "id", children);
                  addConditionally(entry, "title", "title", children);
                  var href = getAttribute("href", getOneElement("link", children));
                  if (href) {
                      entry.link = href;
                  }
                  var description = fetch("summary", children) || fetch("content", children);
                  if (description) {
                      entry.description = description;
                  }
                  var pubDate = fetch("updated", children);
                  if (pubDate) {
                      entry.pubDate = new Date(pubDate);
                  }
                  entry.media = getMediaElements(children);
                  return entry;
              });
          }
          else {
              var childs = (_b = (_a = getOneElement("channel", feedRoot.children)) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [];
              feed.type = feedRoot.name.substr(0, 3);
              feed.id = "";
              addConditionally(feed, "title", "title", childs);
              addConditionally(feed, "link", "link", childs);
              addConditionally(feed, "description", "description", childs);
              var updated = fetch("lastBuildDate", childs);
              if (updated) {
                  feed.updated = new Date(updated);
              }
              addConditionally(feed, "author", "managingEditor", childs, true);
              feed.items = getElements("item", feedRoot.children).map(function (item) {
                  var entry = {};
                  var children = item.children;
                  addConditionally(entry, "id", "guid", children);
                  addConditionally(entry, "title", "title", children);
                  addConditionally(entry, "link", "link", children);
                  addConditionally(entry, "description", "description", children);
                  var pubDate = fetch("pubDate", children);
                  if (pubDate)
                      entry.pubDate = new Date(pubDate);
                  entry.media = getMediaElements(children);
                  return entry;
              });
          }
          this.feed = feed;
          this.handleCallback(null);
      };
      return FeedHandler;
  }(domhandler_1.default));
  FeedHandler$1.FeedHandler = FeedHandler;
  function getMediaElements(where) {
      return getElements("media:content", where).map(function (elem) {
          var media = {
              medium: elem.attribs.medium,
              isDefault: !!elem.attribs.isDefault,
          };
          if (elem.attribs.url) {
              media.url = elem.attribs.url;
          }
          if (elem.attribs.fileSize) {
              media.fileSize = parseInt(elem.attribs.fileSize, 10);
          }
          if (elem.attribs.type) {
              media.type = elem.attribs.type;
          }
          if (elem.attribs.expression) {
              media.expression = elem.attribs
                  .expression;
          }
          if (elem.attribs.bitrate) {
              media.bitrate = parseInt(elem.attribs.bitrate, 10);
          }
          if (elem.attribs.framerate) {
              media.framerate = parseInt(elem.attribs.framerate, 10);
          }
          if (elem.attribs.samplingrate) {
              media.samplingrate = parseInt(elem.attribs.samplingrate, 10);
          }
          if (elem.attribs.channels) {
              media.channels = parseInt(elem.attribs.channels, 10);
          }
          if (elem.attribs.duration) {
              media.duration = parseInt(elem.attribs.duration, 10);
          }
          if (elem.attribs.height) {
              media.height = parseInt(elem.attribs.height, 10);
          }
          if (elem.attribs.width) {
              media.width = parseInt(elem.attribs.width, 10);
          }
          if (elem.attribs.lang) {
              media.lang = elem.attribs.lang;
          }
          return media;
      });
  }
  function getElements(tagName, where) {
      return DomUtils.getElementsByTagName(tagName, where, true);
  }
  function getOneElement(tagName, node) {
      return DomUtils.getElementsByTagName(tagName, node, true, 1)[0];
  }
  function fetch(tagName, where, recurse) {
      if (recurse === void 0) { recurse = false; }
      return DomUtils.getText(DomUtils.getElementsByTagName(tagName, where, recurse, 1)).trim();
  }
  function getAttribute(name, elem) {
      if (!elem) {
          return null;
      }
      var attribs = elem.attribs;
      return attribs[name];
  }
  function addConditionally(obj, prop, what, where, recurse) {
      if (recurse === void 0) { recurse = false; }
      var tmp = fetch(what, where, recurse);
      if (tmp)
          obj[prop] = tmp;
  }
  function isValidFeed(value) {
      return value === "rss" || value === "feed" || value === "rdf:RDF";
  }
  /**
   * Parse a feed.
   *
   * @param feed The feed that should be parsed, as a string.
   * @param options Optionally, options for parsing. When using this option, you should set `xmlMode` to `true`.
   */
  function parseFeed(feed, options) {
      if (options === void 0) { options = { xmlMode: true }; }
      var handler = new FeedHandler(options);
      new Parser_1.Parser(handler, options).end(feed);
      return handler.feed;
  }
  FeedHandler$1.parseFeed = parseFeed;

  (function (exports) {
  	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
  	    if (k2 === undefined) k2 = k;
  	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  	}) : (function(o, m, k, k2) {
  	    if (k2 === undefined) k2 = k;
  	    o[k2] = m[k];
  	}));
  	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
  	    Object.defineProperty(o, "default", { enumerable: true, value: v });
  	}) : function(o, v) {
  	    o["default"] = v;
  	});
  	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
  	    if (mod && mod.__esModule) return mod;
  	    var result = {};
  	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  	    __setModuleDefault(result, mod);
  	    return result;
  	};
  	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
  	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
  	};
  	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
  	    return (mod && mod.__esModule) ? mod : { "default": mod };
  	};
  	Object.defineProperty(exports, "__esModule", { value: true });
  	exports.RssHandler = exports.DefaultHandler = exports.DomUtils = exports.ElementType = exports.Tokenizer = exports.createDomStream = exports.parseDOM = exports.parseDocument = exports.DomHandler = exports.Parser = void 0;
  	var Parser_1 = Parser$3;
  	Object.defineProperty(exports, "Parser", { enumerable: true, get: function () { return Parser_1.Parser; } });
  	var domhandler_1 = lib$4;
  	Object.defineProperty(exports, "DomHandler", { enumerable: true, get: function () { return domhandler_1.DomHandler; } });
  	Object.defineProperty(exports, "DefaultHandler", { enumerable: true, get: function () { return domhandler_1.DomHandler; } });
  	// Helper methods
  	/**
  	 * Parses the data, returns the resulting document.
  	 *
  	 * @param data The data that should be parsed.
  	 * @param options Optional options for the parser and DOM builder.
  	 */
  	function parseDocument(data, options) {
  	    var handler = new domhandler_1.DomHandler(undefined, options);
  	    new Parser_1.Parser(handler, options).end(data);
  	    return handler.root;
  	}
  	exports.parseDocument = parseDocument;
  	/**
  	 * Parses data, returns an array of the root nodes.
  	 *
  	 * Note that the root nodes still have a `Document` node as their parent.
  	 * Use `parseDocument` to get the `Document` node instead.
  	 *
  	 * @param data The data that should be parsed.
  	 * @param options Optional options for the parser and DOM builder.
  	 * @deprecated Use `parseDocument` instead.
  	 */
  	function parseDOM(data, options) {
  	    return parseDocument(data, options).children;
  	}
  	exports.parseDOM = parseDOM;
  	/**
  	 * Creates a parser instance, with an attached DOM handler.
  	 *
  	 * @param cb A callback that will be called once parsing has been completed.
  	 * @param options Optional options for the parser and DOM builder.
  	 * @param elementCb An optional callback that will be called every time a tag has been completed inside of the DOM.
  	 */
  	function createDomStream(cb, options, elementCb) {
  	    var handler = new domhandler_1.DomHandler(cb, options, elementCb);
  	    return new Parser_1.Parser(handler, options);
  	}
  	exports.createDomStream = createDomStream;
  	var Tokenizer_1 = Tokenizer$1;
  	Object.defineProperty(exports, "Tokenizer", { enumerable: true, get: function () { return __importDefault(Tokenizer_1).default; } });
  	var ElementType = __importStar(lib$3);
  	exports.ElementType = ElementType;
  	/*
  	 * All of the following exports exist for backwards-compatibility.
  	 * They should probably be removed eventually.
  	 */
  	__exportStar(FeedHandler$1, exports);
  	exports.DomUtils = __importStar(lib$2);
  	var FeedHandler_1 = FeedHandler$1;
  	Object.defineProperty(exports, "RssHandler", { enumerable: true, get: function () { return FeedHandler_1.FeedHandler; } });
  } (lib$5));

  var escapeStringRegexp$1 = string => {
  	if (typeof string !== 'string') {
  		throw new TypeError('Expected a string');
  	}

  	// Escape characters with special meaning either inside or outside character sets.
  	// Use a simple backslash escape when it’s always valid, and a \unnnn escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  	return string
  		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
  		.replace(/-/g, '\\x2d');
  };

  var isPlainObject$2 = {};

  Object.defineProperty(isPlainObject$2, '__esModule', { value: true });

  /*!
   * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  }

  function isPlainObject$1(o) {
    var ctor,prot;

    if (isObject(o) === false) return false;

    // If has modified constructor
    ctor = o.constructor;
    if (ctor === undefined) return true;

    // If has modified prototype
    prot = ctor.prototype;
    if (isObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }

    // Most likely a plain Object
    return true;
  }

  isPlainObject$2.isPlainObject = isPlainObject$1;

  var isMergeableObject = function isMergeableObject(value) {
  	return isNonNullObject(value)
  		&& !isSpecial(value)
  };

  function isNonNullObject(value) {
  	return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
  	var stringValue = Object.prototype.toString.call(value);

  	return stringValue === '[object RegExp]'
  		|| stringValue === '[object Date]'
  		|| isReactElement(value)
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
  	return value.$$typeof === REACT_ELEMENT_TYPE
  }

  function emptyTarget(val) {
  	return Array.isArray(val) ? [] : {}
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
  	return (options.clone !== false && options.isMergeableObject(value))
  		? deepmerge$1(emptyTarget(value), value, options)
  		: value
  }

  function defaultArrayMerge(target, source, options) {
  	return target.concat(source).map(function(element) {
  		return cloneUnlessOtherwiseSpecified(element, options)
  	})
  }

  function getMergeFunction(key, options) {
  	if (!options.customMerge) {
  		return deepmerge$1
  	}
  	var customMerge = options.customMerge(key);
  	return typeof customMerge === 'function' ? customMerge : deepmerge$1
  }

  function getEnumerableOwnPropertySymbols(target) {
  	return Object.getOwnPropertySymbols
  		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
  			return target.propertyIsEnumerable(symbol)
  		})
  		: []
  }

  function getKeys(target) {
  	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
  }

  function propertyIsOnObject(object, property) {
  	try {
  		return property in object
  	} catch(_) {
  		return false
  	}
  }

  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
  	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
  		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
  			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
  	var destination = {};
  	if (options.isMergeableObject(target)) {
  		getKeys(target).forEach(function(key) {
  			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
  		});
  	}
  	getKeys(source).forEach(function(key) {
  		if (propertyIsUnsafe(target, key)) {
  			return
  		}

  		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
  			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
  		} else {
  			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
  		}
  	});
  	return destination
  }

  function deepmerge$1(target, source, options) {
  	options = options || {};
  	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  	// implementations can use it. The caller may not replace it.
  	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  	var sourceIsArray = Array.isArray(source);
  	var targetIsArray = Array.isArray(target);
  	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  	if (!sourceAndTargetTypesMatch) {
  		return cloneUnlessOtherwiseSpecified(source, options)
  	} else if (sourceIsArray) {
  		return options.arrayMerge(target, source, options)
  	} else {
  		return mergeObject(target, source, options)
  	}
  }

  deepmerge$1.all = function deepmergeAll(array, options) {
  	if (!Array.isArray(array)) {
  		throw new Error('first argument should be an array')
  	}

  	return array.reduce(function(prev, next) {
  		return deepmerge$1(prev, next, options)
  	}, {})
  };

  var deepmerge_1 = deepmerge$1;

  var cjs = deepmerge_1;

  var parseSrcset$1 = {exports: {}};

  /**
   * Srcset Parser
   *
   * By Alex Bell |  MIT License
   *
   * JS Parser for the string value that appears in markup <img srcset="here">
   *
   * @returns Array [{url: _, d: _, w: _, h:_}, ...]
   *
   * Based super duper closely on the reference algorithm at:
   * https://html.spec.whatwg.org/multipage/embedded-content.html#parse-a-srcset-attribute
   *
   * Most comments are copied in directly from the spec
   * (except for comments in parens).
   */

  (function (module) {
  	(function (root, factory) {
  		if (module.exports) {
  			// Node. Does not work with strict CommonJS, but
  			// only CommonJS-like environments that support module.exports,
  			// like Node.
  			module.exports = factory();
  		} else {
  			// Browser globals (root is window)
  			root.parseSrcset = factory();
  		}
  	}(commonjsGlobal, function () {

  		// 1. Let input be the value passed to this algorithm.
  		return function (input) {

  			// UTILITY FUNCTIONS

  			// Manual is faster than RegEx
  			// http://bjorn.tipling.com/state-and-regular-expressions-in-javascript
  			// http://jsperf.com/whitespace-character/5
  			function isSpace(c) {
  				return (c === "\u0020" || // space
  				c === "\u0009" || // horizontal tab
  				c === "\u000A" || // new line
  				c === "\u000C" || // form feed
  				c === "\u000D");  // carriage return
  			}

  			function collectCharacters(regEx) {
  				var chars,
  					match = regEx.exec(input.substring(pos));
  				if (match) {
  					chars = match[ 0 ];
  					pos += chars.length;
  					return chars;
  				}
  			}

  			var inputLength = input.length,

  				// (Don't use \s, to avoid matching non-breaking space)
  				regexLeadingSpaces = /^[ \t\n\r\u000c]+/,
  				regexLeadingCommasOrSpaces = /^[, \t\n\r\u000c]+/,
  				regexLeadingNotSpaces = /^[^ \t\n\r\u000c]+/,
  				regexTrailingCommas = /[,]+$/,
  				regexNonNegativeInteger = /^\d+$/,

  				// ( Positive or negative or unsigned integers or decimals, without or without exponents.
  				// Must include at least one digit.
  				// According to spec tests any decimal point must be followed by a digit.
  				// No leading plus sign is allowed.)
  				// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-floating-point-number
  				regexFloatingPoint = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/,

  				url,
  				descriptors,
  				currentDescriptor,
  				state,
  				c,

  				// 2. Let position be a pointer into input, initially pointing at the start
  				//    of the string.
  				pos = 0,

  				// 3. Let candidates be an initially empty source set.
  				candidates = [];

  			// 4. Splitting loop: Collect a sequence of characters that are space
  			//    characters or U+002C COMMA characters. If any U+002C COMMA characters
  			//    were collected, that is a parse error.
  			while (true) {
  				collectCharacters(regexLeadingCommasOrSpaces);

  				// 5. If position is past the end of input, return candidates and abort these steps.
  				if (pos >= inputLength) {
  					return candidates; // (we're done, this is the sole return path)
  				}

  				// 6. Collect a sequence of characters that are not space characters,
  				//    and let that be url.
  				url = collectCharacters(regexLeadingNotSpaces);

  				// 7. Let descriptors be a new empty list.
  				descriptors = [];

  				// 8. If url ends with a U+002C COMMA character (,), follow these substeps:
  				//		(1). Remove all trailing U+002C COMMA characters from url. If this removed
  				//         more than one character, that is a parse error.
  				if (url.slice(-1) === ",") {
  					url = url.replace(regexTrailingCommas, "");
  					// (Jump ahead to step 9 to skip tokenization and just push the candidate).
  					parseDescriptors();

  					//	Otherwise, follow these substeps:
  				} else {
  					tokenize();
  				} // (close else of step 8)

  				// 16. Return to the step labeled splitting loop.
  			} // (Close of big while loop.)

  			/**
  			 * Tokenizes descriptor properties prior to parsing
  			 * Returns undefined.
  			 */
  			function tokenize() {

  				// 8.1. Descriptor tokeniser: Skip whitespace
  				collectCharacters(regexLeadingSpaces);

  				// 8.2. Let current descriptor be the empty string.
  				currentDescriptor = "";

  				// 8.3. Let state be in descriptor.
  				state = "in descriptor";

  				while (true) {

  					// 8.4. Let c be the character at position.
  					c = input.charAt(pos);

  					//  Do the following depending on the value of state.
  					//  For the purpose of this step, "EOF" is a special character representing
  					//  that position is past the end of input.

  					// In descriptor
  					if (state === "in descriptor") {
  						// Do the following, depending on the value of c:

  						// Space character
  						// If current descriptor is not empty, append current descriptor to
  						// descriptors and let current descriptor be the empty string.
  						// Set state to after descriptor.
  						if (isSpace(c)) {
  							if (currentDescriptor) {
  								descriptors.push(currentDescriptor);
  								currentDescriptor = "";
  								state = "after descriptor";
  							}

  							// U+002C COMMA (,)
  							// Advance position to the next character in input. If current descriptor
  							// is not empty, append current descriptor to descriptors. Jump to the step
  							// labeled descriptor parser.
  						} else if (c === ",") {
  							pos += 1;
  							if (currentDescriptor) {
  								descriptors.push(currentDescriptor);
  							}
  							parseDescriptors();
  							return;

  							// U+0028 LEFT PARENTHESIS (()
  							// Append c to current descriptor. Set state to in parens.
  						} else if (c === "\u0028") {
  							currentDescriptor = currentDescriptor + c;
  							state = "in parens";

  							// EOF
  							// If current descriptor is not empty, append current descriptor to
  							// descriptors. Jump to the step labeled descriptor parser.
  						} else if (c === "") {
  							if (currentDescriptor) {
  								descriptors.push(currentDescriptor);
  							}
  							parseDescriptors();
  							return;

  							// Anything else
  							// Append c to current descriptor.
  						} else {
  							currentDescriptor = currentDescriptor + c;
  						}
  						// (end "in descriptor"

  						// In parens
  					} else if (state === "in parens") {

  						// U+0029 RIGHT PARENTHESIS ())
  						// Append c to current descriptor. Set state to in descriptor.
  						if (c === ")") {
  							currentDescriptor = currentDescriptor + c;
  							state = "in descriptor";

  							// EOF
  							// Append current descriptor to descriptors. Jump to the step labeled
  							// descriptor parser.
  						} else if (c === "") {
  							descriptors.push(currentDescriptor);
  							parseDescriptors();
  							return;

  							// Anything else
  							// Append c to current descriptor.
  						} else {
  							currentDescriptor = currentDescriptor + c;
  						}

  						// After descriptor
  					} else if (state === "after descriptor") {

  						// Do the following, depending on the value of c:
  						// Space character: Stay in this state.
  						if (isSpace(c)) ; else if (c === "") {
  							parseDescriptors();
  							return;

  							// Anything else
  							// Set state to in descriptor. Set position to the previous character in input.
  						} else {
  							state = "in descriptor";
  							pos -= 1;

  						}
  					}

  					// Advance position to the next character in input.
  					pos += 1;

  					// Repeat this step.
  				} // (close while true loop)
  			}

  			/**
  			 * Adds descriptor properties to a candidate, pushes to the candidates array
  			 * @return undefined
  			 */
  			// Declared outside of the while loop so that it's only created once.
  			function parseDescriptors() {

  				// 9. Descriptor parser: Let error be no.
  				var pError = false,

  					// 10. Let width be absent.
  					// 11. Let density be absent.
  					// 12. Let future-compat-h be absent. (We're implementing it now as h)
  					w, d, h, i,
  					candidate = {},
  					desc, lastChar, value, intVal, floatVal;

  				// 13. For each descriptor in descriptors, run the appropriate set of steps
  				// from the following list:
  				for (i = 0 ; i < descriptors.length; i++) {
  					desc = descriptors[ i ];

  					lastChar = desc[ desc.length - 1 ];
  					value = desc.substring(0, desc.length - 1);
  					intVal = parseInt(value, 10);
  					floatVal = parseFloat(value);

  					// If the descriptor consists of a valid non-negative integer followed by
  					// a U+0077 LATIN SMALL LETTER W character
  					if (regexNonNegativeInteger.test(value) && (lastChar === "w")) {

  						// If width and density are not both absent, then let error be yes.
  						if (w || d) {pError = true;}

  						// Apply the rules for parsing non-negative integers to the descriptor.
  						// If the result is zero, let error be yes.
  						// Otherwise, let width be the result.
  						if (intVal === 0) {pError = true;} else {w = intVal;}

  						// If the descriptor consists of a valid floating-point number followed by
  						// a U+0078 LATIN SMALL LETTER X character
  					} else if (regexFloatingPoint.test(value) && (lastChar === "x")) {

  						// If width, density and future-compat-h are not all absent, then let error
  						// be yes.
  						if (w || d || h) {pError = true;}

  						// Apply the rules for parsing floating-point number values to the descriptor.
  						// If the result is less than zero, let error be yes. Otherwise, let density
  						// be the result.
  						if (floatVal < 0) {pError = true;} else {d = floatVal;}

  						// If the descriptor consists of a valid non-negative integer followed by
  						// a U+0068 LATIN SMALL LETTER H character
  					} else if (regexNonNegativeInteger.test(value) && (lastChar === "h")) {

  						// If height and density are not both absent, then let error be yes.
  						if (h || d) {pError = true;}

  						// Apply the rules for parsing non-negative integers to the descriptor.
  						// If the result is zero, let error be yes. Otherwise, let future-compat-h
  						// be the result.
  						if (intVal === 0) {pError = true;} else {h = intVal;}

  						// Anything else, Let error be yes.
  					} else {pError = true;}
  				} // (close step 13 for loop)

  				// 15. If error is still no, then append a new image source to candidates whose
  				// URL is url, associated with a width width if not absent and a pixel
  				// density density if not absent. Otherwise, there is a parse error.
  				if (!pError) {
  					candidate.url = url;
  					if (w) { candidate.w = w;}
  					if (d) { candidate.d = d;}
  					if (h) { candidate.h = h;}
  					candidates.push(candidate);
  				} else if (console && console.log) {
  					console.log("Invalid srcset descriptor found in '" +
  						input + "' at '" + desc + "'.");
  				}
  			} // (close parseDescriptors fn)

  		}
  	}));
  } (parseSrcset$1));

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }



  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }

  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop() {}

  var on = noop;
  var addListener = noop;
  var once = noop;
  var off = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var browser$1 = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  var picocolors_browser = {exports: {}};

  var x=String;
  var create=function() {return {isColorSupported:false,reset:x,bold:x,dim:x,italic:x,underline:x,inverse:x,hidden:x,strikethrough:x,black:x,red:x,green:x,yellow:x,blue:x,magenta:x,cyan:x,white:x,gray:x,bgBlack:x,bgRed:x,bgGreen:x,bgYellow:x,bgBlue:x,bgMagenta:x,bgCyan:x,bgWhite:x}};
  picocolors_browser.exports=create();
  picocolors_browser.exports.createColors = create;

  var _nodeResolve_empty = {};

  var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _nodeResolve_empty
  });

  var require$$2 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

  let pico = picocolors_browser.exports;

  let terminalHighlight$1 = require$$2;

  class CssSyntaxError$3 extends Error {
    constructor(message, line, column, source, file, plugin) {
      super(message);
      this.name = 'CssSyntaxError';
      this.reason = message;

      if (file) {
        this.file = file;
      }
      if (source) {
        this.source = source;
      }
      if (plugin) {
        this.plugin = plugin;
      }
      if (typeof line !== 'undefined' && typeof column !== 'undefined') {
        if (typeof line === 'number') {
          this.line = line;
          this.column = column;
        } else {
          this.line = line.line;
          this.column = line.column;
          this.endLine = column.line;
          this.endColumn = column.column;
        }
      }

      this.setMessage();

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CssSyntaxError$3);
      }
    }

    setMessage() {
      this.message = this.plugin ? this.plugin + ': ' : '';
      this.message += this.file ? this.file : '<css input>';
      if (typeof this.line !== 'undefined') {
        this.message += ':' + this.line + ':' + this.column;
      }
      this.message += ': ' + this.reason;
    }

    showSourceCode(color) {
      if (!this.source) return ''

      let css = this.source;
      if (color == null) color = pico.isColorSupported;
      if (terminalHighlight$1) {
        if (color) css = terminalHighlight$1(css);
      }

      let lines = css.split(/\r?\n/);
      let start = Math.max(this.line - 3, 0);
      let end = Math.min(this.line + 2, lines.length);

      let maxWidth = String(end).length;

      let mark, aside;
      if (color) {
        let { bold, red, gray } = pico.createColors(true);
        mark = text => bold(red(text));
        aside = text => gray(text);
      } else {
        mark = aside = str => str;
      }

      return lines
        .slice(start, end)
        .map((line, index) => {
          let number = start + 1 + index;
          let gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | ';
          if (number === this.line) {
            let spacing =
              aside(gutter.replace(/\d/g, ' ')) +
              line.slice(0, this.column - 1).replace(/[^\t]/g, ' ');
            return mark('>') + aside(gutter) + line + '\n ' + spacing + mark('^')
          }
          return ' ' + aside(gutter) + line
        })
        .join('\n')
    }

    toString() {
      let code = this.showSourceCode();
      if (code) {
        code = '\n\n' + code + '\n';
      }
      return this.name + ': ' + this.message + code
    }
  }

  var cssSyntaxError = CssSyntaxError$3;
  CssSyntaxError$3.default = CssSyntaxError$3;

  var symbols = {};

  symbols.isClean = Symbol('isClean');

  symbols.my = Symbol('my');

  const DEFAULT_RAW = {
    colon: ': ',
    indent: '    ',
    beforeDecl: '\n',
    beforeRule: '\n',
    beforeOpen: ' ',
    beforeClose: '\n',
    beforeComment: '\n',
    after: '\n',
    emptyBody: '',
    commentLeft: ' ',
    commentRight: ' ',
    semicolon: false
  };

  function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1)
  }

  class Stringifier$2 {
    constructor(builder) {
      this.builder = builder;
    }

    stringify(node, semicolon) {
      /* c8 ignore start */
      if (!this[node.type]) {
        throw new Error(
          'Unknown AST node type ' +
            node.type +
            '. ' +
            'Maybe you need to change PostCSS stringifier.'
        )
      }
      /* c8 ignore stop */
      this[node.type](node, semicolon);
    }

    document(node) {
      this.body(node);
    }

    root(node) {
      this.body(node);
      if (node.raws.after) this.builder(node.raws.after);
    }

    comment(node) {
      let left = this.raw(node, 'left', 'commentLeft');
      let right = this.raw(node, 'right', 'commentRight');
      this.builder('/*' + left + node.text + right + '*/', node);
    }

    decl(node, semicolon) {
      let between = this.raw(node, 'between', 'colon');
      let string = node.prop + between + this.rawValue(node, 'value');

      if (node.important) {
        string += node.raws.important || ' !important';
      }

      if (semicolon) string += ';';
      this.builder(string, node);
    }

    rule(node) {
      this.block(node, this.rawValue(node, 'selector'));
      if (node.raws.ownSemicolon) {
        this.builder(node.raws.ownSemicolon, node, 'end');
      }
    }

    atrule(node, semicolon) {
      let name = '@' + node.name;
      let params = node.params ? this.rawValue(node, 'params') : '';

      if (typeof node.raws.afterName !== 'undefined') {
        name += node.raws.afterName;
      } else if (params) {
        name += ' ';
      }

      if (node.nodes) {
        this.block(node, name + params);
      } else {
        let end = (node.raws.between || '') + (semicolon ? ';' : '');
        this.builder(name + params + end, node);
      }
    }

    body(node) {
      let last = node.nodes.length - 1;
      while (last > 0) {
        if (node.nodes[last].type !== 'comment') break
        last -= 1;
      }

      let semicolon = this.raw(node, 'semicolon');
      for (let i = 0; i < node.nodes.length; i++) {
        let child = node.nodes[i];
        let before = this.raw(child, 'before');
        if (before) this.builder(before);
        this.stringify(child, last !== i || semicolon);
      }
    }

    block(node, start) {
      let between = this.raw(node, 'between', 'beforeOpen');
      this.builder(start + between + '{', node, 'start');

      let after;
      if (node.nodes && node.nodes.length) {
        this.body(node);
        after = this.raw(node, 'after');
      } else {
        after = this.raw(node, 'after', 'emptyBody');
      }

      if (after) this.builder(after);
      this.builder('}', node, 'end');
    }

    raw(node, own, detect) {
      let value;
      if (!detect) detect = own;

      // Already had
      if (own) {
        value = node.raws[own];
        if (typeof value !== 'undefined') return value
      }

      let parent = node.parent;

      if (detect === 'before') {
        // Hack for first rule in CSS
        if (!parent || (parent.type === 'root' && parent.first === node)) {
          return ''
        }

        // `root` nodes in `document` should use only their own raws
        if (parent && parent.type === 'document') {
          return ''
        }
      }

      // Floating child without parent
      if (!parent) return DEFAULT_RAW[detect]

      // Detect style by other nodes
      let root = node.root();
      if (!root.rawCache) root.rawCache = {};
      if (typeof root.rawCache[detect] !== 'undefined') {
        return root.rawCache[detect]
      }

      if (detect === 'before' || detect === 'after') {
        return this.beforeAfter(node, detect)
      } else {
        let method = 'raw' + capitalize(detect);
        if (this[method]) {
          value = this[method](root, node);
        } else {
          root.walk(i => {
            value = i.raws[own];
            if (typeof value !== 'undefined') return false
          });
        }
      }

      if (typeof value === 'undefined') value = DEFAULT_RAW[detect];

      root.rawCache[detect] = value;
      return value
    }

    rawSemicolon(root) {
      let value;
      root.walk(i => {
        if (i.nodes && i.nodes.length && i.last.type === 'decl') {
          value = i.raws.semicolon;
          if (typeof value !== 'undefined') return false
        }
      });
      return value
    }

    rawEmptyBody(root) {
      let value;
      root.walk(i => {
        if (i.nodes && i.nodes.length === 0) {
          value = i.raws.after;
          if (typeof value !== 'undefined') return false
        }
      });
      return value
    }

    rawIndent(root) {
      if (root.raws.indent) return root.raws.indent
      let value;
      root.walk(i => {
        let p = i.parent;
        if (p && p !== root && p.parent && p.parent === root) {
          if (typeof i.raws.before !== 'undefined') {
            let parts = i.raws.before.split('\n');
            value = parts[parts.length - 1];
            value = value.replace(/\S/g, '');
            return false
          }
        }
      });
      return value
    }

    rawBeforeComment(root, node) {
      let value;
      root.walkComments(i => {
        if (typeof i.raws.before !== 'undefined') {
          value = i.raws.before;
          if (value.includes('\n')) {
            value = value.replace(/[^\n]+$/, '');
          }
          return false
        }
      });
      if (typeof value === 'undefined') {
        value = this.raw(node, null, 'beforeDecl');
      } else if (value) {
        value = value.replace(/\S/g, '');
      }
      return value
    }

    rawBeforeDecl(root, node) {
      let value;
      root.walkDecls(i => {
        if (typeof i.raws.before !== 'undefined') {
          value = i.raws.before;
          if (value.includes('\n')) {
            value = value.replace(/[^\n]+$/, '');
          }
          return false
        }
      });
      if (typeof value === 'undefined') {
        value = this.raw(node, null, 'beforeRule');
      } else if (value) {
        value = value.replace(/\S/g, '');
      }
      return value
    }

    rawBeforeRule(root) {
      let value;
      root.walk(i => {
        if (i.nodes && (i.parent !== root || root.first !== i)) {
          if (typeof i.raws.before !== 'undefined') {
            value = i.raws.before;
            if (value.includes('\n')) {
              value = value.replace(/[^\n]+$/, '');
            }
            return false
          }
        }
      });
      if (value) value = value.replace(/\S/g, '');
      return value
    }

    rawBeforeClose(root) {
      let value;
      root.walk(i => {
        if (i.nodes && i.nodes.length > 0) {
          if (typeof i.raws.after !== 'undefined') {
            value = i.raws.after;
            if (value.includes('\n')) {
              value = value.replace(/[^\n]+$/, '');
            }
            return false
          }
        }
      });
      if (value) value = value.replace(/\S/g, '');
      return value
    }

    rawBeforeOpen(root) {
      let value;
      root.walk(i => {
        if (i.type !== 'decl') {
          value = i.raws.between;
          if (typeof value !== 'undefined') return false
        }
      });
      return value
    }

    rawColon(root) {
      let value;
      root.walkDecls(i => {
        if (typeof i.raws.between !== 'undefined') {
          value = i.raws.between.replace(/[^\s:]/g, '');
          return false
        }
      });
      return value
    }

    beforeAfter(node, detect) {
      let value;
      if (node.type === 'decl') {
        value = this.raw(node, null, 'beforeDecl');
      } else if (node.type === 'comment') {
        value = this.raw(node, null, 'beforeComment');
      } else if (detect === 'before') {
        value = this.raw(node, null, 'beforeRule');
      } else {
        value = this.raw(node, null, 'beforeClose');
      }

      let buf = node.parent;
      let depth = 0;
      while (buf && buf.type !== 'root') {
        depth += 1;
        buf = buf.parent;
      }

      if (value.includes('\n')) {
        let indent = this.raw(node, null, 'indent');
        if (indent.length) {
          for (let step = 0; step < depth; step++) value += indent;
        }
      }

      return value
    }

    rawValue(node, prop) {
      let value = node[prop];
      let raw = node.raws[prop];
      if (raw && raw.value === value) {
        return raw.raw
      }

      return value
    }
  }

  var stringifier = Stringifier$2;
  Stringifier$2.default = Stringifier$2;

  let Stringifier$1 = stringifier;

  function stringify$4(node, builder) {
    let str = new Stringifier$1(builder);
    str.stringify(node);
  }

  var stringify_1 = stringify$4;
  stringify$4.default = stringify$4;

  let { isClean: isClean$2, my: my$2 } = symbols;
  let CssSyntaxError$2 = cssSyntaxError;
  let Stringifier = stringifier;
  let stringify$3 = stringify_1;

  function cloneNode(obj, parent) {
    let cloned = new obj.constructor();

    for (let i in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, i)) {
        /* c8 ignore next 2 */
        continue
      }
      if (i === 'proxyCache') continue
      let value = obj[i];
      let type = typeof value;

      if (i === 'parent' && type === 'object') {
        if (parent) cloned[i] = parent;
      } else if (i === 'source') {
        cloned[i] = value;
      } else if (Array.isArray(value)) {
        cloned[i] = value.map(j => cloneNode(j, cloned));
      } else {
        if (type === 'object' && value !== null) value = cloneNode(value);
        cloned[i] = value;
      }
    }

    return cloned
  }

  class Node$4 {
    constructor(defaults = {}) {
      this.raws = {};
      this[isClean$2] = false;
      this[my$2] = true;

      for (let name in defaults) {
        if (name === 'nodes') {
          this.nodes = [];
          for (let node of defaults[name]) {
            if (typeof node.clone === 'function') {
              this.append(node.clone());
            } else {
              this.append(node);
            }
          }
        } else {
          this[name] = defaults[name];
        }
      }
    }

    error(message, opts = {}) {
      if (this.source) {
        let { start, end } = this.rangeBy(opts);
        return this.source.input.error(
          message,
          { line: start.line, column: start.column },
          { line: end.line, column: end.column },
          opts
        )
      }
      return new CssSyntaxError$2(message)
    }

    warn(result, text, opts) {
      let data = { node: this };
      for (let i in opts) data[i] = opts[i];
      return result.warn(text, data)
    }

    remove() {
      if (this.parent) {
        this.parent.removeChild(this);
      }
      this.parent = undefined;
      return this
    }

    toString(stringifier = stringify$3) {
      if (stringifier.stringify) stringifier = stringifier.stringify;
      let result = '';
      stringifier(this, i => {
        result += i;
      });
      return result
    }

    assign(overrides = {}) {
      for (let name in overrides) {
        this[name] = overrides[name];
      }
      return this
    }

    clone(overrides = {}) {
      let cloned = cloneNode(this);
      for (let name in overrides) {
        cloned[name] = overrides[name];
      }
      return cloned
    }

    cloneBefore(overrides = {}) {
      let cloned = this.clone(overrides);
      this.parent.insertBefore(this, cloned);
      return cloned
    }

    cloneAfter(overrides = {}) {
      let cloned = this.clone(overrides);
      this.parent.insertAfter(this, cloned);
      return cloned
    }

    replaceWith(...nodes) {
      if (this.parent) {
        let bookmark = this;
        let foundSelf = false;
        for (let node of nodes) {
          if (node === this) {
            foundSelf = true;
          } else if (foundSelf) {
            this.parent.insertAfter(bookmark, node);
            bookmark = node;
          } else {
            this.parent.insertBefore(bookmark, node);
          }
        }

        if (!foundSelf) {
          this.remove();
        }
      }

      return this
    }

    next() {
      if (!this.parent) return undefined
      let index = this.parent.index(this);
      return this.parent.nodes[index + 1]
    }

    prev() {
      if (!this.parent) return undefined
      let index = this.parent.index(this);
      return this.parent.nodes[index - 1]
    }

    before(add) {
      this.parent.insertBefore(this, add);
      return this
    }

    after(add) {
      this.parent.insertAfter(this, add);
      return this
    }

    root() {
      let result = this;
      while (result.parent && result.parent.type !== 'document') {
        result = result.parent;
      }
      return result
    }

    raw(prop, defaultType) {
      let str = new Stringifier();
      return str.raw(this, prop, defaultType)
    }

    cleanRaws(keepBetween) {
      delete this.raws.before;
      delete this.raws.after;
      if (!keepBetween) delete this.raws.between;
    }

    toJSON(_, inputs) {
      let fixed = {};
      let emitInputs = inputs == null;
      inputs = inputs || new Map();
      let inputsNextIndex = 0;

      for (let name in this) {
        if (!Object.prototype.hasOwnProperty.call(this, name)) {
          /* c8 ignore next 2 */
          continue
        }
        if (name === 'parent' || name === 'proxyCache') continue
        let value = this[name];

        if (Array.isArray(value)) {
          fixed[name] = value.map(i => {
            if (typeof i === 'object' && i.toJSON) {
              return i.toJSON(null, inputs)
            } else {
              return i
            }
          });
        } else if (typeof value === 'object' && value.toJSON) {
          fixed[name] = value.toJSON(null, inputs);
        } else if (name === 'source') {
          let inputId = inputs.get(value.input);
          if (inputId == null) {
            inputId = inputsNextIndex;
            inputs.set(value.input, inputsNextIndex);
            inputsNextIndex++;
          }
          fixed[name] = {
            inputId,
            start: value.start,
            end: value.end
          };
        } else {
          fixed[name] = value;
        }
      }

      if (emitInputs) {
        fixed.inputs = [...inputs.keys()].map(input => input.toJSON());
      }

      return fixed
    }

    positionInside(index) {
      let string = this.toString();
      let column = this.source.start.column;
      let line = this.source.start.line;

      for (let i = 0; i < index; i++) {
        if (string[i] === '\n') {
          column = 1;
          line += 1;
        } else {
          column += 1;
        }
      }

      return { line, column }
    }

    positionBy(opts) {
      let pos = this.source.start;
      if (opts.index) {
        pos = this.positionInside(opts.index);
      } else if (opts.word) {
        let index = this.toString().indexOf(opts.word);
        if (index !== -1) pos = this.positionInside(index);
      }
      return pos
    }

    rangeBy(opts) {
      let start = {
        line: this.source.start.line,
        column: this.source.start.column
      };
      let end = this.source.end
        ? {
            line: this.source.end.line,
            column: this.source.end.column + 1
          }
        : {
            line: start.line,
            column: start.column + 1
          };

      if (opts.word) {
        let index = this.toString().indexOf(opts.word);
        if (index !== -1) {
          start = this.positionInside(index);
          end = this.positionInside(index + opts.word.length);
        }
      } else {
        if (opts.start) {
          start = {
            line: opts.start.line,
            column: opts.start.column
          };
        } else if (opts.index) {
          start = this.positionInside(opts.index);
        }

        if (opts.end) {
          end = {
            line: opts.end.line,
            column: opts.end.column
          };
        } else if (opts.endIndex) {
          end = this.positionInside(opts.endIndex);
        } else if (opts.index) {
          end = this.positionInside(opts.index + 1);
        }
      }

      if (
        end.line < start.line ||
        (end.line === start.line && end.column <= start.column)
      ) {
        end = { line: start.line, column: start.column + 1 };
      }

      return { start, end }
    }

    getProxyProcessor() {
      return {
        set(node, prop, value) {
          if (node[prop] === value) return true
          node[prop] = value;
          if (
            prop === 'prop' ||
            prop === 'value' ||
            prop === 'name' ||
            prop === 'params' ||
            prop === 'important' ||
            /* c8 ignore next */
            prop === 'text'
          ) {
            node.markDirty();
          }
          return true
        },

        get(node, prop) {
          if (prop === 'proxyOf') {
            return node
          } else if (prop === 'root') {
            return () => node.root().toProxy()
          } else {
            return node[prop]
          }
        }
      }
    }

    toProxy() {
      if (!this.proxyCache) {
        this.proxyCache = new Proxy(this, this.getProxyProcessor());
      }
      return this.proxyCache
    }

    addToError(error) {
      error.postcssNode = this;
      if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
        let s = this.source;
        error.stack = error.stack.replace(
          /\n\s{4}at /,
          `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
        );
      }
      return error
    }

    markDirty() {
      if (this[isClean$2]) {
        this[isClean$2] = false;
        let next = this;
        while ((next = next.parent)) {
          next[isClean$2] = false;
        }
      }
    }

    get proxyOf() {
      return this
    }
  }

  var node_1 = Node$4;
  Node$4.default = Node$4;

  let Node$3 = node_1;

  class Declaration$4 extends Node$3 {
    constructor(defaults) {
      if (
        defaults &&
        typeof defaults.value !== 'undefined' &&
        typeof defaults.value !== 'string'
      ) {
        defaults = { ...defaults, value: String(defaults.value) };
      }
      super(defaults);
      this.type = 'decl';
    }

    get variable() {
      return this.prop.startsWith('--') || this.prop[0] === '$'
    }
  }

  var declaration = Declaration$4;
  Declaration$4.default = Declaration$4;

  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
  var inited = false;
  function init () {
    inited = true;
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }

    revLookup['-'.charCodeAt(0)] = 62;
    revLookup['_'.charCodeAt(0)] = 63;
  }

  function toByteArray (b64) {
    if (!inited) {
      init();
    }
    var i, j, l, tmp, placeHolders, arr;
    var len = b64.length;

    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

    // base64 is 4/3 + up to two characters of the original data
    arr = new Arr(len * 3 / 4 - placeHolders);

    // if there are placeholders, only get up to the last complete 4 chars
    l = placeHolders > 0 ? len - 4 : len;

    var L = 0;

    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
      arr[L++] = (tmp >> 16) & 0xFF;
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    if (placeHolders === 2) {
      tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
      arr[L++] = tmp & 0xFF;
    } else if (placeHolders === 1) {
      tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    return arr
  }

  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
  }

  function encodeChunk (uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
      output.push(tripletToBase64(tmp));
    }
    return output.join('')
  }

  function fromByteArray (uint8) {
    if (!inited) {
      init();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    var output = '';
    var parts = [];
    var maxChunkLength = 16383; // must be multiple of 3

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup[tmp >> 2];
      output += lookup[(tmp << 4) & 0x3F];
      output += '==';
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
      output += lookup[tmp >> 10];
      output += lookup[(tmp >> 4) & 0x3F];
      output += lookup[(tmp << 2) & 0x3F];
      output += '=';
    }

    parts.push(output);

    return parts.join('')
  }

  function read (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  }

  function write (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128;
  }

  var toString = {}.toString;

  var isArray = Array.isArray || function (arr) {
    return toString.call(arr) == '[object Array]';
  };

  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   */

  var INSPECT_MAX_BYTES = 50;

  /**
   * If `Buffer.TYPED_ARRAY_SUPPORT`:
   *   === true    Use Uint8Array implementation (fastest)
   *   === false   Use Object implementation (most compatible, even IE6)
   *
   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
   * Opera 11.6+, iOS 4.2+.
   *
   * Due to various browser bugs, sometimes the Object implementation will be used even
   * when the browser supports typed arrays.
   *
   * Note:
   *
   *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
   *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
   *
   *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
   *
   *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
   *     incorrect length in some situations.

   * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
   * get the Object implementation, which is slower but behaves correctly.
   */
  Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
    ? global$1.TYPED_ARRAY_SUPPORT
    : true;

  /*
   * Export kMaxLength after typed array support is determined.
   */
  kMaxLength();

  function kMaxLength () {
    return Buffer.TYPED_ARRAY_SUPPORT
      ? 0x7fffffff
      : 0x3fffffff
  }

  function createBuffer (that, length) {
    if (kMaxLength() < length) {
      throw new RangeError('Invalid typed array length')
    }
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      // Return an augmented `Uint8Array` instance, for best performance
      that = new Uint8Array(length);
      that.__proto__ = Buffer.prototype;
    } else {
      // Fallback: Return an object instance of the Buffer class
      if (that === null) {
        that = new Buffer(length);
      }
      that.length = length;
    }

    return that
  }

  /**
   * The Buffer constructor returns instances of `Uint8Array` that have their
   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
   * returns a single octet.
   *
   * The `Uint8Array` prototype remains unmodified.
   */

  function Buffer (arg, encodingOrOffset, length) {
    if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
      return new Buffer(arg, encodingOrOffset, length)
    }

    // Common case.
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new Error(
          'If encoding is specified then the first argument must be a string'
        )
      }
      return allocUnsafe(this, arg)
    }
    return from(this, arg, encodingOrOffset, length)
  }

  Buffer.poolSize = 8192; // not used by this implementation

  // TODO: Legacy, not needed anymore. Remove in next major version.
  Buffer._augment = function (arr) {
    arr.__proto__ = Buffer.prototype;
    return arr
  };

  function from (that, value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError('"value" argument must not be a number')
    }

    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return fromArrayBuffer(that, value, encodingOrOffset, length)
    }

    if (typeof value === 'string') {
      return fromString(that, value, encodingOrOffset)
    }

    return fromObject(that, value)
  }

  /**
   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
   * if value is a number.
   * Buffer.from(str[, encoding])
   * Buffer.from(array)
   * Buffer.from(buffer)
   * Buffer.from(arrayBuffer[, byteOffset[, length]])
   **/
  Buffer.from = function (value, encodingOrOffset, length) {
    return from(null, value, encodingOrOffset, length)
  };

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;
  }

  function assertSize (size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be a number')
    } else if (size < 0) {
      throw new RangeError('"size" argument must not be negative')
    }
  }

  function alloc (that, size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(that, size)
    }
    if (fill !== undefined) {
      // Only pay attention to encoding if it's a string. This
      // prevents accidentally sending in a number that would
      // be interpretted as a start offset.
      return typeof encoding === 'string'
        ? createBuffer(that, size).fill(fill, encoding)
        : createBuffer(that, size).fill(fill)
    }
    return createBuffer(that, size)
  }

  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer.alloc = function (size, fill, encoding) {
    return alloc(null, size, fill, encoding)
  };

  function allocUnsafe (that, size) {
    assertSize(size);
    that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < size; ++i) {
        that[i] = 0;
      }
    }
    return that
  }

  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(null, size)
  };
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(null, size)
  };

  function fromString (that, string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8';
    }

    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding')
    }

    var length = byteLength(string, encoding) | 0;
    that = createBuffer(that, length);

    var actual = that.write(string, encoding);

    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      that = that.slice(0, actual);
    }

    return that
  }

  function fromArrayLike (that, array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    that = createBuffer(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that
  }

  function fromArrayBuffer (that, array, byteOffset, length) {
    array.byteLength; // this throws if `array` is not a valid ArrayBuffer

    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('\'offset\' is out of bounds')
    }

    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('\'length\' is out of bounds')
    }

    if (byteOffset === undefined && length === undefined) {
      array = new Uint8Array(array);
    } else if (length === undefined) {
      array = new Uint8Array(array, byteOffset);
    } else {
      array = new Uint8Array(array, byteOffset, length);
    }

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      // Return an augmented `Uint8Array` instance, for best performance
      that = array;
      that.__proto__ = Buffer.prototype;
    } else {
      // Fallback: Return an object instance of the Buffer class
      that = fromArrayLike(that, array);
    }
    return that
  }

  function fromObject (that, obj) {
    if (internalIsBuffer(obj)) {
      var len = checked(obj.length) | 0;
      that = createBuffer(that, len);

      if (that.length === 0) {
        return that
      }

      obj.copy(that, 0, 0, len);
      return that
    }

    if (obj) {
      if ((typeof ArrayBuffer !== 'undefined' &&
          obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
        if (typeof obj.length !== 'number' || isnan(obj.length)) {
          return createBuffer(that, 0)
        }
        return fromArrayLike(that, obj)
      }

      if (obj.type === 'Buffer' && isArray(obj.data)) {
        return fromArrayLike(that, obj.data)
      }
    }

    throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
  }

  function checked (length) {
    // Note: cannot use `length < kMaxLength()` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= kMaxLength()) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                           'size: 0x' + kMaxLength().toString(16) + ' bytes')
    }
    return length | 0
  }
  Buffer.isBuffer = isBuffer;
  function internalIsBuffer (b) {
    return !!(b != null && b._isBuffer)
  }

  Buffer.compare = function compare (a, b) {
    if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
      throw new TypeError('Arguments must be Buffers')
    }

    if (a === b) return 0

    var x = a.length;
    var y = b.length;

    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  Buffer.isEncoding = function isEncoding (encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true
      default:
        return false
    }
  };

  Buffer.concat = function concat (list, length) {
    if (!isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }

    if (list.length === 0) {
      return Buffer.alloc(0)
    }

    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }

    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
      var buf = list[i];
      if (!internalIsBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer
  };

  function byteLength (string, encoding) {
    if (internalIsBuffer(string)) {
      return string.length
    }
    if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
        (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
      return string.byteLength
    }
    if (typeof string !== 'string') {
      string = '' + string;
    }

    var len = string.length;
    if (len === 0) return 0

    // Use a for loop to avoid recursion
    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len
        case 'utf8':
        case 'utf-8':
        case undefined:
          return utf8ToBytes(string).length
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2
        case 'hex':
          return len >>> 1
        case 'base64':
          return base64ToBytes(string).length
        default:
          if (loweredCase) return utf8ToBytes(string).length // assume utf8
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength;

  function slowToString (encoding, start, end) {
    var loweredCase = false;

    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.

    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0;
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return ''
    }

    if (end === undefined || end > this.length) {
      end = this.length;
    }

    if (end <= 0) {
      return ''
    }

    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;

    if (end <= start) {
      return ''
    }

    if (!encoding) encoding = 'utf8';

    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end)

        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end)

        case 'ascii':
          return asciiSlice(this, start, end)

        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end)

        case 'base64':
          return base64Slice(this, start, end)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }

  // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
  // Buffer instances.
  Buffer.prototype._isBuffer = true;

  function swap (b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }

  Buffer.prototype.swap16 = function swap16 () {
    var len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits')
    }
    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this
  };

  Buffer.prototype.swap32 = function swap32 () {
    var len = this.length;
    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }
    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this
  };

  Buffer.prototype.swap64 = function swap64 () {
    var len = this.length;
    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }
    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this
  };

  Buffer.prototype.toString = function toString () {
    var length = this.length | 0;
    if (length === 0) return ''
    if (arguments.length === 0) return utf8Slice(this, 0, length)
    return slowToString.apply(this, arguments)
  };

  Buffer.prototype.equals = function equals (b) {
    if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
    if (this === b) return true
    return Buffer.compare(this, b) === 0
  };

  Buffer.prototype.inspect = function inspect () {
    var str = '';
    var max = INSPECT_MAX_BYTES;
    if (this.length > 0) {
      str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
      if (this.length > max) str += ' ... ';
    }
    return '<Buffer ' + str + '>'
  };

  Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
    if (!internalIsBuffer(target)) {
      throw new TypeError('Argument must be a Buffer')
    }

    if (start === undefined) {
      start = 0;
    }
    if (end === undefined) {
      end = target ? target.length : 0;
    }
    if (thisStart === undefined) {
      thisStart = 0;
    }
    if (thisEnd === undefined) {
      thisEnd = this.length;
    }

    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index')
    }

    if (thisStart >= thisEnd && start >= end) {
      return 0
    }
    if (thisStart >= thisEnd) {
      return -1
    }
    if (start >= end) {
      return 1
    }

    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;

    if (this === target) return 0

    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);

    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);

    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
  //
  // Arguments:
  // - buffer - a Buffer to search
  // - val - a string, Buffer, or number
  // - byteOffset - an index into `buffer`; will be clamped to an int32
  // - encoding - an optional encoding, relevant is val is a string
  // - dir - true for indexOf, false for lastIndexOf
  function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1

    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff;
    } else if (byteOffset < -0x80000000) {
      byteOffset = -0x80000000;
    }
    byteOffset = +byteOffset;  // Coerce to Number.
    if (isNaN(byteOffset)) {
      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
      byteOffset = dir ? 0 : (buffer.length - 1);
    }

    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir) return -1
      else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;
      else return -1
    }

    // Normalize val
    if (typeof val === 'string') {
      val = Buffer.from(val, encoding);
    }

    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (internalIsBuffer(val)) {
      // Special case: looking for empty string/buffer always fails
      if (val.length === 0) {
        return -1
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
    } else if (typeof val === 'number') {
      val = val & 0xFF; // Search for a byte value [0-255]
      if (Buffer.TYPED_ARRAY_SUPPORT &&
          typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
        }
      }
      return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
    }

    throw new TypeError('val must be string, number or Buffer')
  }

  function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;

    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase();
      if (encoding === 'ucs2' || encoding === 'ucs-2' ||
          encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }

    function read (buf, i) {
      if (indexSize === 1) {
        return buf[i]
      } else {
        return buf.readUInt16BE(i * indexSize)
      }
    }

    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break
          }
        }
        if (found) return i
      }
    }

    return -1
  }

  Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1
  };

  Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
  };

  Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
  };

  function hexWrite (buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }

    // must be an even number of digits
    var strLen = string.length;
    if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed)) return i
      buf[offset + i] = parsed;
    }
    return i
  }

  function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }

  function asciiWrite (buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length)
  }

  function latin1Write (buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length)
  }

  function base64Write (buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length)
  }

  function ucs2Write (buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  }

  Buffer.prototype.write = function write (string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset | 0;
      if (isFinite(length)) {
        length = length | 0;
        if (encoding === undefined) encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    // legacy write(string, encoding, offset, length) - remove in v0.13
    } else {
      throw new Error(
        'Buffer.write(string, encoding, offset[, length]) is no longer supported'
      )
    }

    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;

    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }

    if (!encoding) encoding = 'utf8';

    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length)

        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length)

        case 'ascii':
          return asciiWrite(this, string, offset, length)

        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length)

        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };

  Buffer.prototype.toJSON = function toJSON () {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    }
  };

  function base64Slice (buf, start, end) {
    if (start === 0 && end === buf.length) {
      return fromByteArray(buf)
    } else {
      return fromByteArray(buf.slice(start, end))
    }
  }

  function utf8Slice (buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];

    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
        : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }

      res.push(codePoint);
      i += bytesPerSequence;
    }

    return decodeCodePointsArray(res)
  }

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000;

  function decodeCodePointsArray (codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res
  }

  function asciiSlice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret
  }

  function latin1Slice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret
  }

  function hexSlice (buf, start, end) {
    var len = buf.length;

    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;

    var out = '';
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }
    return out
  }

  function utf16leSlice (buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res
  }

  Buffer.prototype.slice = function slice (start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;

    var newBuf;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      newBuf = this.subarray(start, end);
      newBuf.__proto__ = Buffer.prototype;
    } else {
      var sliceLen = end - start;
      newBuf = new Buffer(sliceLen, undefined);
      for (var i = 0; i < sliceLen; ++i) {
        newBuf[i] = this[i + start];
      }
    }

    return newBuf
  };

  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset (offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
  }

  Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }

    return val
  };

  Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }

    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }

    return val
  };

  Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset]
  };

  Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8)
  };

  Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1]
  };

  Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return ((this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000)
  };

  Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
  };

  Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return (this[offset])
    return ((0xff - this[offset] + 1) * -1)
  };

  Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
  };

  Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
  };

  Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);
    return read(this, offset, true, 23, 4)
  };

  Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);
    return read(this, offset, false, 23, 4)
  };

  Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 8, this.length);
    return read(this, offset, true, 52, 8)
  };

  Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 8, this.length);
    return read(this, offset, false, 52, 8)
  };

  function checkInt (buf, value, offset, ext, max, min) {
    if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
  }

  Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    this[offset] = (value & 0xff);
    return offset + 1
  };

  function objectWriteUInt16 (buf, value, offset, littleEndian) {
    if (value < 0) value = 0xffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
      buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
        (littleEndian ? i : 1 - i) * 8;
    }
  }

  Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2
  };

  Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2
  };

  function objectWriteUInt32 (buf, value, offset, littleEndian) {
    if (value < 0) value = 0xffffffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
      buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
    }
  }

  Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset + 3] = (value >>> 24);
      this[offset + 2] = (value >>> 16);
      this[offset + 1] = (value >>> 8);
      this[offset] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4
  };

  Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4
  };

  Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1
  };

  Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2
  };

  Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2
  };

  Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      this[offset + 2] = (value >>> 16);
      this[offset + 3] = (value >>> 24);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4
  };

  Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0) value = 0xffffffff + value + 1;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4
  };

  function checkIEEE754 (buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
    if (offset < 0) throw new RangeError('Index out of range')
  }

  function writeFloat (buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4
  }

  Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert)
  };

  Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert)
  };

  function writeDouble (buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8
  }

  Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert)
  };

  Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert)
  };

  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer.prototype.copy = function copy (target, targetStart, start, end) {
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;

    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0

    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')

    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    var len = end - start;
    var i;

    if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
      // ascending copy from start
      for (i = 0; i < len; ++i) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, start + len),
        targetStart
      );
    }

    return len
  };

  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer.prototype.fill = function fill (val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        encoding = end;
        end = this.length;
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0);
        if (code < 256) {
          val = code;
        }
      }
      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string')
      }
      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
    } else if (typeof val === 'number') {
      val = val & 255;
    }

    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index')
    }

    if (end <= start) {
      return this
    }

    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;

    if (!val) val = 0;

    var i;
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      var bytes = internalIsBuffer(val)
        ? val
        : utf8ToBytes(new Buffer(val, encoding).toString());
      var len = bytes.length;
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }

    return this
  };

  // HELPER FUNCTIONS
  // ================

  var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

  function base64clean (str) {
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = stringtrim(str).replace(INVALID_BASE64_RE, '');
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return ''
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str
  }

  function stringtrim (str) {
    if (str.trim) return str.trim()
    return str.replace(/^\s+|\s+$/g, '')
  }

  function toHex (n) {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16)
  }

  function utf8ToBytes (string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);

      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          }

          // valid lead
          leadSurrogate = codePoint;

          continue
        }

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue
        }

        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
      }

      leadSurrogate = null;

      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else {
        throw new Error('Invalid code point')
      }
    }

    return bytes
  }

  function asciiToBytes (str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      // Node's code seems to be doing this and not & 0x7F..
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray
  }

  function utf16leToBytes (str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break

      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }

    return byteArray
  }


  function base64ToBytes (str) {
    return toByteArray(base64clean(str))
  }

  function blitBuffer (src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i];
    }
    return i
  }

  function isnan (val) {
    return val !== val // eslint-disable-line no-self-compare
  }


  // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  function isBuffer(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
  }

  function isFastBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
  }

  let urlAlphabet =
    'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  let customAlphabet = (alphabet, defaultSize = 21) => {
    return (size = defaultSize) => {
      let id = '';
      let i = size;
      while (i--) {
        id += alphabet[(Math.random() * alphabet.length) | 0];
      }
      return id
    }
  };
  let nanoid$1 = (size = 21) => {
    let id = '';
    let i = size;
    while (i--) {
      id += urlAlphabet[(Math.random() * 64) | 0];
    }
    return id
  };
  var nonSecure = { nanoid: nanoid$1, customAlphabet };

  let { SourceMapConsumer: SourceMapConsumer$2, SourceMapGenerator: SourceMapGenerator$2 } = require$$2;
  let { existsSync, readFileSync } = require$$2;
  let { dirname: dirname$1, join } = require$$2;

  function fromBase64(str) {
    if (Buffer) {
      return Buffer.from(str, 'base64').toString()
    } else {
      /* c8 ignore next 2 */
      return window.atob(str)
    }
  }

  class PreviousMap$2 {
    constructor(css, opts) {
      if (opts.map === false) return
      this.loadAnnotation(css);
      this.inline = this.startWith(this.annotation, 'data:');

      let prev = opts.map ? opts.map.prev : undefined;
      let text = this.loadMap(opts.from, prev);
      if (!this.mapFile && opts.from) {
        this.mapFile = opts.from;
      }
      if (this.mapFile) this.root = dirname$1(this.mapFile);
      if (text) this.text = text;
    }

    consumer() {
      if (!this.consumerCache) {
        this.consumerCache = new SourceMapConsumer$2(this.text);
      }
      return this.consumerCache
    }

    withContent() {
      return !!(
        this.consumer().sourcesContent &&
        this.consumer().sourcesContent.length > 0
      )
    }

    startWith(string, start) {
      if (!string) return false
      return string.substr(0, start.length) === start
    }

    getAnnotationURL(sourceMapString) {
      return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, '').trim()
    }

    loadAnnotation(css) {
      let comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!comments) return

      // sourceMappingURLs from comments, strings, etc.
      let start = css.lastIndexOf(comments.pop());
      let end = css.indexOf('*/', start);

      if (start > -1 && end > -1) {
        // Locate the last sourceMappingURL to avoid pickin
        this.annotation = this.getAnnotationURL(css.substring(start, end));
      }
    }

    decodeInline(text) {
      let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
      let baseUri = /^data:application\/json;base64,/;
      let charsetUri = /^data:application\/json;charset=utf-?8,/;
      let uri = /^data:application\/json,/;

      if (charsetUri.test(text) || uri.test(text)) {
        return decodeURIComponent(text.substr(RegExp.lastMatch.length))
      }

      if (baseCharsetUri.test(text) || baseUri.test(text)) {
        return fromBase64(text.substr(RegExp.lastMatch.length))
      }

      let encoding = text.match(/data:application\/json;([^,]+),/)[1];
      throw new Error('Unsupported source map encoding ' + encoding)
    }

    loadFile(path) {
      this.root = dirname$1(path);
      if (existsSync(path)) {
        this.mapFile = path;
        return readFileSync(path, 'utf-8').toString().trim()
      }
    }

    loadMap(file, prev) {
      if (prev === false) return false

      if (prev) {
        if (typeof prev === 'string') {
          return prev
        } else if (typeof prev === 'function') {
          let prevPath = prev(file);
          if (prevPath) {
            let map = this.loadFile(prevPath);
            if (!map) {
              throw new Error(
                'Unable to load previous source map: ' + prevPath.toString()
              )
            }
            return map
          }
        } else if (prev instanceof SourceMapConsumer$2) {
          return SourceMapGenerator$2.fromSourceMap(prev).toString()
        } else if (prev instanceof SourceMapGenerator$2) {
          return prev.toString()
        } else if (this.isMap(prev)) {
          return JSON.stringify(prev)
        } else {
          throw new Error(
            'Unsupported previous source map format: ' + prev.toString()
          )
        }
      } else if (this.inline) {
        return this.decodeInline(this.annotation)
      } else if (this.annotation) {
        let map = this.annotation;
        if (file) map = join(dirname$1(file), map);
        return this.loadFile(map)
      }
    }

    isMap(map) {
      if (typeof map !== 'object') return false
      return (
        typeof map.mappings === 'string' ||
        typeof map._mappings === 'string' ||
        Array.isArray(map.sections)
      )
    }
  }

  var previousMap = PreviousMap$2;
  PreviousMap$2.default = PreviousMap$2;

  let { SourceMapConsumer: SourceMapConsumer$1, SourceMapGenerator: SourceMapGenerator$1 } = require$$2;
  let { fileURLToPath, pathToFileURL: pathToFileURL$1 } = require$$2;
  let { resolve: resolve$1, isAbsolute } = require$$2;
  let { nanoid } = nonSecure;

  let terminalHighlight = require$$2;
  let CssSyntaxError$1 = cssSyntaxError;
  let PreviousMap$1 = previousMap;

  let fromOffsetCache = Symbol('fromOffsetCache');

  let sourceMapAvailable$1 = Boolean(SourceMapConsumer$1 && SourceMapGenerator$1);
  let pathAvailable$1 = Boolean(resolve$1 && isAbsolute);

  class Input$4 {
    constructor(css, opts = {}) {
      if (
        css === null ||
        typeof css === 'undefined' ||
        (typeof css === 'object' && !css.toString)
      ) {
        throw new Error(`PostCSS received ${css} instead of CSS string`)
      }

      this.css = css.toString();

      if (this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE') {
        this.hasBOM = true;
        this.css = this.css.slice(1);
      } else {
        this.hasBOM = false;
      }

      if (opts.from) {
        if (
          !pathAvailable$1 ||
          /^\w+:\/\//.test(opts.from) ||
          isAbsolute(opts.from)
        ) {
          this.file = opts.from;
        } else {
          this.file = resolve$1(opts.from);
        }
      }

      if (pathAvailable$1 && sourceMapAvailable$1) {
        let map = new PreviousMap$1(this.css, opts);
        if (map.text) {
          this.map = map;
          let file = map.consumer().file;
          if (!this.file && file) this.file = this.mapResolve(file);
        }
      }

      if (!this.file) {
        this.id = '<input css ' + nanoid(6) + '>';
      }
      if (this.map) this.map.file = this.from;
    }

    fromOffset(offset) {
      let lastLine, lineToIndex;
      if (!this[fromOffsetCache]) {
        let lines = this.css.split('\n');
        lineToIndex = new Array(lines.length);
        let prevIndex = 0;

        for (let i = 0, l = lines.length; i < l; i++) {
          lineToIndex[i] = prevIndex;
          prevIndex += lines[i].length + 1;
        }

        this[fromOffsetCache] = lineToIndex;
      } else {
        lineToIndex = this[fromOffsetCache];
      }
      lastLine = lineToIndex[lineToIndex.length - 1];

      let min = 0;
      if (offset >= lastLine) {
        min = lineToIndex.length - 1;
      } else {
        let max = lineToIndex.length - 2;
        let mid;
        while (min < max) {
          mid = min + ((max - min) >> 1);
          if (offset < lineToIndex[mid]) {
            max = mid - 1;
          } else if (offset >= lineToIndex[mid + 1]) {
            min = mid + 1;
          } else {
            min = mid;
            break
          }
        }
      }
      return {
        line: min + 1,
        col: offset - lineToIndex[min] + 1
      }
    }

    error(message, line, column, opts = {}) {
      let result, endLine, endColumn;

      if (line && typeof line === 'object') {
        let start = line;
        let end = column;
        if (typeof line.offset === 'number') {
          let pos = this.fromOffset(start.offset);
          line = pos.line;
          column = pos.col;
        } else {
          line = start.line;
          column = start.column;
        }
        if (typeof end.offset === 'number') {
          let pos = this.fromOffset(end.offset);
          endLine = pos.line;
          endColumn = pos.col;
        } else {
          endLine = end.line;
          endColumn = end.column;
        }
      } else if (!column) {
        let pos = this.fromOffset(line);
        line = pos.line;
        column = pos.col;
      }

      let origin = this.origin(line, column, endLine, endColumn);
      if (origin) {
        result = new CssSyntaxError$1(
          message,
          origin.endLine === undefined
            ? origin.line
            : { line: origin.line, column: origin.column },
          origin.endLine === undefined
            ? origin.column
            : { line: origin.endLine, column: origin.endColumn },
          origin.source,
          origin.file,
          opts.plugin
        );
      } else {
        result = new CssSyntaxError$1(
          message,
          endLine === undefined ? line : { line, column },
          endLine === undefined ? column : { line: endLine, column: endColumn },
          this.css,
          this.file,
          opts.plugin
        );
      }

      result.input = { line, column, endLine, endColumn, source: this.css };
      if (this.file) {
        if (pathToFileURL$1) {
          result.input.url = pathToFileURL$1(this.file).toString();
        }
        result.input.file = this.file;
      }

      return result
    }

    origin(line, column, endLine, endColumn) {
      if (!this.map) return false
      let consumer = this.map.consumer();

      let from = consumer.originalPositionFor({ line, column });
      if (!from.source) return false

      let to;
      if (typeof endLine === 'number') {
        to = consumer.originalPositionFor({ line: endLine, column: endColumn });
      }

      let fromUrl;

      if (isAbsolute(from.source)) {
        fromUrl = pathToFileURL$1(from.source);
      } else {
        fromUrl = new URL(
          from.source,
          this.map.consumer().sourceRoot || pathToFileURL$1(this.map.mapFile)
        );
      }

      let result = {
        url: fromUrl.toString(),
        line: from.line,
        column: from.column,
        endLine: to && to.line,
        endColumn: to && to.column
      };

      if (fromUrl.protocol === 'file:') {
        if (fileURLToPath) {
          result.file = fileURLToPath(fromUrl);
        } else {
          /* c8 ignore next 2 */
          throw new Error(`file: protocol is not available in this PostCSS build`)
        }
      }

      let source = consumer.sourceContentFor(from.source);
      if (source) result.source = source;

      return result
    }

    mapResolve(file) {
      if (/^\w+:\/\//.test(file)) {
        return file
      }
      return resolve$1(this.map.consumer().sourceRoot || this.map.root || '.', file)
    }

    get from() {
      return this.file || this.id
    }

    toJSON() {
      let json = {};
      for (let name of ['hasBOM', 'css', 'file', 'id']) {
        if (this[name] != null) {
          json[name] = this[name];
        }
      }
      if (this.map) {
        json.map = { ...this.map };
        if (json.map.consumerCache) {
          json.map.consumerCache = undefined;
        }
      }
      return json
    }
  }

  var input = Input$4;
  Input$4.default = Input$4;

  if (terminalHighlight && terminalHighlight.registerInput) {
    terminalHighlight.registerInput(Input$4);
  }

  let { SourceMapConsumer, SourceMapGenerator } = require$$2;
  let { dirname, resolve, relative, sep } = require$$2;
  let { pathToFileURL } = require$$2;

  let Input$3 = input;

  let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
  let pathAvailable = Boolean(dirname && resolve && relative && sep);

  class MapGenerator$2 {
    constructor(stringify, root, opts, cssString) {
      this.stringify = stringify;
      this.mapOpts = opts.map || {};
      this.root = root;
      this.opts = opts;
      this.css = cssString;
    }

    isMap() {
      if (typeof this.opts.map !== 'undefined') {
        return !!this.opts.map
      }
      return this.previous().length > 0
    }

    previous() {
      if (!this.previousMaps) {
        this.previousMaps = [];
        if (this.root) {
          this.root.walk(node => {
            if (node.source && node.source.input.map) {
              let map = node.source.input.map;
              if (!this.previousMaps.includes(map)) {
                this.previousMaps.push(map);
              }
            }
          });
        } else {
          let input = new Input$3(this.css, this.opts);
          if (input.map) this.previousMaps.push(input.map);
        }
      }

      return this.previousMaps
    }

    isInline() {
      if (typeof this.mapOpts.inline !== 'undefined') {
        return this.mapOpts.inline
      }

      let annotation = this.mapOpts.annotation;
      if (typeof annotation !== 'undefined' && annotation !== true) {
        return false
      }

      if (this.previous().length) {
        return this.previous().some(i => i.inline)
      }
      return true
    }

    isSourcesContent() {
      if (typeof this.mapOpts.sourcesContent !== 'undefined') {
        return this.mapOpts.sourcesContent
      }
      if (this.previous().length) {
        return this.previous().some(i => i.withContent())
      }
      return true
    }

    clearAnnotation() {
      if (this.mapOpts.annotation === false) return

      if (this.root) {
        let node;
        for (let i = this.root.nodes.length - 1; i >= 0; i--) {
          node = this.root.nodes[i];
          if (node.type !== 'comment') continue
          if (node.text.indexOf('# sourceMappingURL=') === 0) {
            this.root.removeChild(i);
          }
        }
      } else if (this.css) {
        this.css = this.css.replace(/(\n)?\/\*#[\S\s]*?\*\/$/gm, '');
      }
    }

    setSourcesContent() {
      let already = {};
      if (this.root) {
        this.root.walk(node => {
          if (node.source) {
            let from = node.source.input.from;
            if (from && !already[from]) {
              already[from] = true;
              this.map.setSourceContent(
                this.toUrl(this.path(from)),
                node.source.input.css
              );
            }
          }
        });
      } else if (this.css) {
        let from = this.opts.from
          ? this.toUrl(this.path(this.opts.from))
          : '<no source>';
        this.map.setSourceContent(from, this.css);
      }
    }

    applyPrevMaps() {
      for (let prev of this.previous()) {
        let from = this.toUrl(this.path(prev.file));
        let root = prev.root || dirname(prev.file);
        let map;

        if (this.mapOpts.sourcesContent === false) {
          map = new SourceMapConsumer(prev.text);
          if (map.sourcesContent) {
            map.sourcesContent = map.sourcesContent.map(() => null);
          }
        } else {
          map = prev.consumer();
        }

        this.map.applySourceMap(map, from, this.toUrl(this.path(root)));
      }
    }

    isAnnotation() {
      if (this.isInline()) {
        return true
      }
      if (typeof this.mapOpts.annotation !== 'undefined') {
        return this.mapOpts.annotation
      }
      if (this.previous().length) {
        return this.previous().some(i => i.annotation)
      }
      return true
    }

    toBase64(str) {
      if (Buffer) {
        return Buffer.from(str).toString('base64')
      } else {
        return window.btoa(unescape(encodeURIComponent(str)))
      }
    }

    addAnnotation() {
      let content;

      if (this.isInline()) {
        content =
          'data:application/json;base64,' + this.toBase64(this.map.toString());
      } else if (typeof this.mapOpts.annotation === 'string') {
        content = this.mapOpts.annotation;
      } else if (typeof this.mapOpts.annotation === 'function') {
        content = this.mapOpts.annotation(this.opts.to, this.root);
      } else {
        content = this.outputFile() + '.map';
      }
      let eol = '\n';
      if (this.css.includes('\r\n')) eol = '\r\n';

      this.css += eol + '/*# sourceMappingURL=' + content + ' */';
    }

    outputFile() {
      if (this.opts.to) {
        return this.path(this.opts.to)
      } else if (this.opts.from) {
        return this.path(this.opts.from)
      } else {
        return 'to.css'
      }
    }

    generateMap() {
      if (this.root) {
        this.generateString();
      } else if (this.previous().length === 1) {
        let prev = this.previous()[0].consumer();
        prev.file = this.outputFile();
        this.map = SourceMapGenerator.fromSourceMap(prev);
      } else {
        this.map = new SourceMapGenerator({ file: this.outputFile() });
        this.map.addMapping({
          source: this.opts.from
            ? this.toUrl(this.path(this.opts.from))
            : '<no source>',
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 }
        });
      }

      if (this.isSourcesContent()) this.setSourcesContent();
      if (this.root && this.previous().length > 0) this.applyPrevMaps();
      if (this.isAnnotation()) this.addAnnotation();

      if (this.isInline()) {
        return [this.css]
      } else {
        return [this.css, this.map]
      }
    }

    path(file) {
      if (file.indexOf('<') === 0) return file
      if (/^\w+:\/\//.test(file)) return file
      if (this.mapOpts.absolute) return file

      let from = this.opts.to ? dirname(this.opts.to) : '.';

      if (typeof this.mapOpts.annotation === 'string') {
        from = dirname(resolve(from, this.mapOpts.annotation));
      }

      file = relative(from, file);
      return file
    }

    toUrl(path) {
      if (sep === '\\') {
        path = path.replace(/\\/g, '/');
      }
      return encodeURI(path).replace(/[#?]/g, encodeURIComponent)
    }

    sourcePath(node) {
      if (this.mapOpts.from) {
        return this.toUrl(this.mapOpts.from)
      } else if (this.mapOpts.absolute) {
        if (pathToFileURL) {
          return pathToFileURL(node.source.input.from).toString()
        } else {
          throw new Error(
            '`map.absolute` option is not available in this PostCSS build'
          )
        }
      } else {
        return this.toUrl(this.path(node.source.input.from))
      }
    }

    generateString() {
      this.css = '';
      this.map = new SourceMapGenerator({ file: this.outputFile() });

      let line = 1;
      let column = 1;

      let noSource = '<no source>';
      let mapping = {
        source: '',
        generated: { line: 0, column: 0 },
        original: { line: 0, column: 0 }
      };

      let lines, last;
      this.stringify(this.root, (str, node, type) => {
        this.css += str;

        if (node && type !== 'end') {
          mapping.generated.line = line;
          mapping.generated.column = column - 1;
          if (node.source && node.source.start) {
            mapping.source = this.sourcePath(node);
            mapping.original.line = node.source.start.line;
            mapping.original.column = node.source.start.column - 1;
            this.map.addMapping(mapping);
          } else {
            mapping.source = noSource;
            mapping.original.line = 1;
            mapping.original.column = 0;
            this.map.addMapping(mapping);
          }
        }

        lines = str.match(/\n/g);
        if (lines) {
          line += lines.length;
          last = str.lastIndexOf('\n');
          column = str.length - last;
        } else {
          column += str.length;
        }

        if (node && type !== 'start') {
          let p = node.parent || { raws: {} };
          if (node.type !== 'decl' || node !== p.last || p.raws.semicolon) {
            if (node.source && node.source.end) {
              mapping.source = this.sourcePath(node);
              mapping.original.line = node.source.end.line;
              mapping.original.column = node.source.end.column - 1;
              mapping.generated.line = line;
              mapping.generated.column = column - 2;
              this.map.addMapping(mapping);
            } else {
              mapping.source = noSource;
              mapping.original.line = 1;
              mapping.original.column = 0;
              mapping.generated.line = line;
              mapping.generated.column = column - 1;
              this.map.addMapping(mapping);
            }
          }
        }
      });
    }

    generate() {
      this.clearAnnotation();
      if (pathAvailable && sourceMapAvailable && this.isMap()) {
        return this.generateMap()
      } else {
        let result = '';
        this.stringify(this.root, i => {
          result += i;
        });
        return [result]
      }
    }
  }

  var mapGenerator = MapGenerator$2;

  let Node$2 = node_1;

  class Comment$4 extends Node$2 {
    constructor(defaults) {
      super(defaults);
      this.type = 'comment';
    }
  }

  var comment = Comment$4;
  Comment$4.default = Comment$4;

  let { isClean: isClean$1, my: my$1 } = symbols;
  let Declaration$3 = declaration;
  let Comment$3 = comment;
  let Node$1 = node_1;

  let parse$4, Rule$4, AtRule$4;

  function cleanSource(nodes) {
    return nodes.map(i => {
      if (i.nodes) i.nodes = cleanSource(i.nodes);
      delete i.source;
      return i
    })
  }

  function markDirtyUp(node) {
    node[isClean$1] = false;
    if (node.proxyOf.nodes) {
      for (let i of node.proxyOf.nodes) {
        markDirtyUp(i);
      }
    }
  }

  class Container$7 extends Node$1 {
    push(child) {
      child.parent = this;
      this.proxyOf.nodes.push(child);
      return this
    }

    each(callback) {
      if (!this.proxyOf.nodes) return undefined
      let iterator = this.getIterator();

      let index, result;
      while (this.indexes[iterator] < this.proxyOf.nodes.length) {
        index = this.indexes[iterator];
        result = callback(this.proxyOf.nodes[index], index);
        if (result === false) break

        this.indexes[iterator] += 1;
      }

      delete this.indexes[iterator];
      return result
    }

    walk(callback) {
      return this.each((child, i) => {
        let result;
        try {
          result = callback(child, i);
        } catch (e) {
          throw child.addToError(e)
        }
        if (result !== false && child.walk) {
          result = child.walk(callback);
        }

        return result
      })
    }

    walkDecls(prop, callback) {
      if (!callback) {
        callback = prop;
        return this.walk((child, i) => {
          if (child.type === 'decl') {
            return callback(child, i)
          }
        })
      }
      if (prop instanceof RegExp) {
        return this.walk((child, i) => {
          if (child.type === 'decl' && prop.test(child.prop)) {
            return callback(child, i)
          }
        })
      }
      return this.walk((child, i) => {
        if (child.type === 'decl' && child.prop === prop) {
          return callback(child, i)
        }
      })
    }

    walkRules(selector, callback) {
      if (!callback) {
        callback = selector;

        return this.walk((child, i) => {
          if (child.type === 'rule') {
            return callback(child, i)
          }
        })
      }
      if (selector instanceof RegExp) {
        return this.walk((child, i) => {
          if (child.type === 'rule' && selector.test(child.selector)) {
            return callback(child, i)
          }
        })
      }
      return this.walk((child, i) => {
        if (child.type === 'rule' && child.selector === selector) {
          return callback(child, i)
        }
      })
    }

    walkAtRules(name, callback) {
      if (!callback) {
        callback = name;
        return this.walk((child, i) => {
          if (child.type === 'atrule') {
            return callback(child, i)
          }
        })
      }
      if (name instanceof RegExp) {
        return this.walk((child, i) => {
          if (child.type === 'atrule' && name.test(child.name)) {
            return callback(child, i)
          }
        })
      }
      return this.walk((child, i) => {
        if (child.type === 'atrule' && child.name === name) {
          return callback(child, i)
        }
      })
    }

    walkComments(callback) {
      return this.walk((child, i) => {
        if (child.type === 'comment') {
          return callback(child, i)
        }
      })
    }

    append(...children) {
      for (let child of children) {
        let nodes = this.normalize(child, this.last);
        for (let node of nodes) this.proxyOf.nodes.push(node);
      }

      this.markDirty();

      return this
    }

    prepend(...children) {
      children = children.reverse();
      for (let child of children) {
        let nodes = this.normalize(child, this.first, 'prepend').reverse();
        for (let node of nodes) this.proxyOf.nodes.unshift(node);
        for (let id in this.indexes) {
          this.indexes[id] = this.indexes[id] + nodes.length;
        }
      }

      this.markDirty();

      return this
    }

    cleanRaws(keepBetween) {
      super.cleanRaws(keepBetween);
      if (this.nodes) {
        for (let node of this.nodes) node.cleanRaws(keepBetween);
      }
    }

    insertBefore(exist, add) {
      exist = this.index(exist);

      let type = exist === 0 ? 'prepend' : false;
      let nodes = this.normalize(add, this.proxyOf.nodes[exist], type).reverse();
      for (let node of nodes) this.proxyOf.nodes.splice(exist, 0, node);

      let index;
      for (let id in this.indexes) {
        index = this.indexes[id];
        if (exist <= index) {
          this.indexes[id] = index + nodes.length;
        }
      }

      this.markDirty();

      return this
    }

    insertAfter(exist, add) {
      exist = this.index(exist);

      let nodes = this.normalize(add, this.proxyOf.nodes[exist]).reverse();
      for (let node of nodes) this.proxyOf.nodes.splice(exist + 1, 0, node);

      let index;
      for (let id in this.indexes) {
        index = this.indexes[id];
        if (exist < index) {
          this.indexes[id] = index + nodes.length;
        }
      }

      this.markDirty();

      return this
    }

    removeChild(child) {
      child = this.index(child);
      this.proxyOf.nodes[child].parent = undefined;
      this.proxyOf.nodes.splice(child, 1);

      let index;
      for (let id in this.indexes) {
        index = this.indexes[id];
        if (index >= child) {
          this.indexes[id] = index - 1;
        }
      }

      this.markDirty();

      return this
    }

    removeAll() {
      for (let node of this.proxyOf.nodes) node.parent = undefined;
      this.proxyOf.nodes = [];

      this.markDirty();

      return this
    }

    replaceValues(pattern, opts, callback) {
      if (!callback) {
        callback = opts;
        opts = {};
      }

      this.walkDecls(decl => {
        if (opts.props && !opts.props.includes(decl.prop)) return
        if (opts.fast && !decl.value.includes(opts.fast)) return

        decl.value = decl.value.replace(pattern, callback);
      });

      this.markDirty();

      return this
    }

    every(condition) {
      return this.nodes.every(condition)
    }

    some(condition) {
      return this.nodes.some(condition)
    }

    index(child) {
      if (typeof child === 'number') return child
      if (child.proxyOf) child = child.proxyOf;
      return this.proxyOf.nodes.indexOf(child)
    }

    get first() {
      if (!this.proxyOf.nodes) return undefined
      return this.proxyOf.nodes[0]
    }

    get last() {
      if (!this.proxyOf.nodes) return undefined
      return this.proxyOf.nodes[this.proxyOf.nodes.length - 1]
    }

    normalize(nodes, sample) {
      if (typeof nodes === 'string') {
        nodes = cleanSource(parse$4(nodes).nodes);
      } else if (Array.isArray(nodes)) {
        nodes = nodes.slice(0);
        for (let i of nodes) {
          if (i.parent) i.parent.removeChild(i, 'ignore');
        }
      } else if (nodes.type === 'root' && this.type !== 'document') {
        nodes = nodes.nodes.slice(0);
        for (let i of nodes) {
          if (i.parent) i.parent.removeChild(i, 'ignore');
        }
      } else if (nodes.type) {
        nodes = [nodes];
      } else if (nodes.prop) {
        if (typeof nodes.value === 'undefined') {
          throw new Error('Value field is missed in node creation')
        } else if (typeof nodes.value !== 'string') {
          nodes.value = String(nodes.value);
        }
        nodes = [new Declaration$3(nodes)];
      } else if (nodes.selector) {
        nodes = [new Rule$4(nodes)];
      } else if (nodes.name) {
        nodes = [new AtRule$4(nodes)];
      } else if (nodes.text) {
        nodes = [new Comment$3(nodes)];
      } else {
        throw new Error('Unknown node type in node creation')
      }

      let processed = nodes.map(i => {
        /* c8 ignore next */
        if (!i[my$1]) Container$7.rebuild(i);
        i = i.proxyOf;
        if (i.parent) i.parent.removeChild(i);
        if (i[isClean$1]) markDirtyUp(i);
        if (typeof i.raws.before === 'undefined') {
          if (sample && typeof sample.raws.before !== 'undefined') {
            i.raws.before = sample.raws.before.replace(/\S/g, '');
          }
        }
        i.parent = this.proxyOf;
        return i
      });

      return processed
    }

    getProxyProcessor() {
      return {
        set(node, prop, value) {
          if (node[prop] === value) return true
          node[prop] = value;
          if (prop === 'name' || prop === 'params' || prop === 'selector') {
            node.markDirty();
          }
          return true
        },

        get(node, prop) {
          if (prop === 'proxyOf') {
            return node
          } else if (!node[prop]) {
            return node[prop]
          } else if (
            prop === 'each' ||
            (typeof prop === 'string' && prop.startsWith('walk'))
          ) {
            return (...args) => {
              return node[prop](
                ...args.map(i => {
                  if (typeof i === 'function') {
                    return (child, index) => i(child.toProxy(), index)
                  } else {
                    return i
                  }
                })
              )
            }
          } else if (prop === 'every' || prop === 'some') {
            return cb => {
              return node[prop]((child, ...other) =>
                cb(child.toProxy(), ...other)
              )
            }
          } else if (prop === 'root') {
            return () => node.root().toProxy()
          } else if (prop === 'nodes') {
            return node.nodes.map(i => i.toProxy())
          } else if (prop === 'first' || prop === 'last') {
            return node[prop].toProxy()
          } else {
            return node[prop]
          }
        }
      }
    }

    getIterator() {
      if (!this.lastEach) this.lastEach = 0;
      if (!this.indexes) this.indexes = {};

      this.lastEach += 1;
      let iterator = this.lastEach;
      this.indexes[iterator] = 0;

      return iterator
    }
  }

  Container$7.registerParse = dependant => {
    parse$4 = dependant;
  };

  Container$7.registerRule = dependant => {
    Rule$4 = dependant;
  };

  Container$7.registerAtRule = dependant => {
    AtRule$4 = dependant;
  };

  var container = Container$7;
  Container$7.default = Container$7;

  /* c8 ignore start */
  Container$7.rebuild = node => {
    if (node.type === 'atrule') {
      Object.setPrototypeOf(node, AtRule$4.prototype);
    } else if (node.type === 'rule') {
      Object.setPrototypeOf(node, Rule$4.prototype);
    } else if (node.type === 'decl') {
      Object.setPrototypeOf(node, Declaration$3.prototype);
    } else if (node.type === 'comment') {
      Object.setPrototypeOf(node, Comment$3.prototype);
    }

    node[my$1] = true;

    if (node.nodes) {
      node.nodes.forEach(child => {
        Container$7.rebuild(child);
      });
    }
  };

  let Container$6 = container;

  let LazyResult$4, Processor$3;

  class Document$3 extends Container$6 {
    constructor(defaults) {
      // type needs to be passed to super, otherwise child roots won't be normalized correctly
      super({ type: 'document', ...defaults });

      if (!this.nodes) {
        this.nodes = [];
      }
    }

    toResult(opts = {}) {
      let lazy = new LazyResult$4(new Processor$3(), this, opts);

      return lazy.stringify()
    }
  }

  Document$3.registerLazyResult = dependant => {
    LazyResult$4 = dependant;
  };

  Document$3.registerProcessor = dependant => {
    Processor$3 = dependant;
  };

  var document = Document$3;
  Document$3.default = Document$3;

  /* eslint-disable no-console */

  let printed = {};

  var warnOnce$2 = function warnOnce(message) {
    if (printed[message]) return
    printed[message] = true;

    if (typeof console !== 'undefined' && console.warn) {
      console.warn(message);
    }
  };

  class Warning$2 {
    constructor(text, opts = {}) {
      this.type = 'warning';
      this.text = text;

      if (opts.node && opts.node.source) {
        let range = opts.node.rangeBy(opts);
        this.line = range.start.line;
        this.column = range.start.column;
        this.endLine = range.end.line;
        this.endColumn = range.end.column;
      }

      for (let opt in opts) this[opt] = opts[opt];
    }

    toString() {
      if (this.node) {
        return this.node.error(this.text, {
          plugin: this.plugin,
          index: this.index,
          word: this.word
        }).message
      }

      if (this.plugin) {
        return this.plugin + ': ' + this.text
      }

      return this.text
    }
  }

  var warning = Warning$2;
  Warning$2.default = Warning$2;

  let Warning$1 = warning;

  class Result$3 {
    constructor(processor, root, opts) {
      this.processor = processor;
      this.messages = [];
      this.root = root;
      this.opts = opts;
      this.css = undefined;
      this.map = undefined;
    }

    toString() {
      return this.css
    }

    warn(text, opts = {}) {
      if (!opts.plugin) {
        if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
          opts.plugin = this.lastPlugin.postcssPlugin;
        }
      }

      let warning = new Warning$1(text, opts);
      this.messages.push(warning);

      return warning
    }

    warnings() {
      return this.messages.filter(i => i.type === 'warning')
    }

    get content() {
      return this.css
    }
  }

  var result = Result$3;
  Result$3.default = Result$3;

  const SINGLE_QUOTE = "'".charCodeAt(0);
  const DOUBLE_QUOTE = '"'.charCodeAt(0);
  const BACKSLASH = '\\'.charCodeAt(0);
  const SLASH = '/'.charCodeAt(0);
  const NEWLINE = '\n'.charCodeAt(0);
  const SPACE = ' '.charCodeAt(0);
  const FEED = '\f'.charCodeAt(0);
  const TAB = '\t'.charCodeAt(0);
  const CR = '\r'.charCodeAt(0);
  const OPEN_SQUARE = '['.charCodeAt(0);
  const CLOSE_SQUARE = ']'.charCodeAt(0);
  const OPEN_PARENTHESES = '('.charCodeAt(0);
  const CLOSE_PARENTHESES = ')'.charCodeAt(0);
  const OPEN_CURLY = '{'.charCodeAt(0);
  const CLOSE_CURLY = '}'.charCodeAt(0);
  const SEMICOLON = ';'.charCodeAt(0);
  const ASTERISK = '*'.charCodeAt(0);
  const COLON = ':'.charCodeAt(0);
  const AT = '@'.charCodeAt(0);

  const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
  const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
  const RE_BAD_BRACKET = /.[\n"'(/\\]/;
  const RE_HEX_ESCAPE = /[\da-f]/i;

  var tokenize = function tokenizer(input, options = {}) {
    let css = input.css.valueOf();
    let ignore = options.ignoreErrors;

    let code, next, quote, content, escape;
    let escaped, escapePos, prev, n, currentToken;

    let length = css.length;
    let pos = 0;
    let buffer = [];
    let returned = [];

    function position() {
      return pos
    }

    function unclosed(what) {
      throw input.error('Unclosed ' + what, pos)
    }

    function endOfFile() {
      return returned.length === 0 && pos >= length
    }

    function nextToken(opts) {
      if (returned.length) return returned.pop()
      if (pos >= length) return

      let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;

      code = css.charCodeAt(pos);

      switch (code) {
        case NEWLINE:
        case SPACE:
        case TAB:
        case CR:
        case FEED: {
          next = pos;
          do {
            next += 1;
            code = css.charCodeAt(next);
          } while (
            code === SPACE ||
            code === NEWLINE ||
            code === TAB ||
            code === CR ||
            code === FEED
          )

          currentToken = ['space', css.slice(pos, next)];
          pos = next - 1;
          break
        }

        case OPEN_SQUARE:
        case CLOSE_SQUARE:
        case OPEN_CURLY:
        case CLOSE_CURLY:
        case COLON:
        case SEMICOLON:
        case CLOSE_PARENTHESES: {
          let controlChar = String.fromCharCode(code);
          currentToken = [controlChar, controlChar, pos];
          break
        }

        case OPEN_PARENTHESES: {
          prev = buffer.length ? buffer.pop()[1] : '';
          n = css.charCodeAt(pos + 1);
          if (
            prev === 'url' &&
            n !== SINGLE_QUOTE &&
            n !== DOUBLE_QUOTE &&
            n !== SPACE &&
            n !== NEWLINE &&
            n !== TAB &&
            n !== FEED &&
            n !== CR
          ) {
            next = pos;
            do {
              escaped = false;
              next = css.indexOf(')', next + 1);
              if (next === -1) {
                if (ignore || ignoreUnclosed) {
                  next = pos;
                  break
                } else {
                  unclosed('bracket');
                }
              }
              escapePos = next;
              while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                escapePos -= 1;
                escaped = !escaped;
              }
            } while (escaped)

            currentToken = ['brackets', css.slice(pos, next + 1), pos, next];

            pos = next;
          } else {
            next = css.indexOf(')', pos + 1);
            content = css.slice(pos, next + 1);

            if (next === -1 || RE_BAD_BRACKET.test(content)) {
              currentToken = ['(', '(', pos];
            } else {
              currentToken = ['brackets', content, pos, next];
              pos = next;
            }
          }

          break
        }

        case SINGLE_QUOTE:
        case DOUBLE_QUOTE: {
          quote = code === SINGLE_QUOTE ? "'" : '"';
          next = pos;
          do {
            escaped = false;
            next = css.indexOf(quote, next + 1);
            if (next === -1) {
              if (ignore || ignoreUnclosed) {
                next = pos + 1;
                break
              } else {
                unclosed('string');
              }
            }
            escapePos = next;
            while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
              escapePos -= 1;
              escaped = !escaped;
            }
          } while (escaped)

          currentToken = ['string', css.slice(pos, next + 1), pos, next];
          pos = next;
          break
        }

        case AT: {
          RE_AT_END.lastIndex = pos + 1;
          RE_AT_END.test(css);
          if (RE_AT_END.lastIndex === 0) {
            next = css.length - 1;
          } else {
            next = RE_AT_END.lastIndex - 2;
          }

          currentToken = ['at-word', css.slice(pos, next + 1), pos, next];

          pos = next;
          break
        }

        case BACKSLASH: {
          next = pos;
          escape = true;
          while (css.charCodeAt(next + 1) === BACKSLASH) {
            next += 1;
            escape = !escape;
          }
          code = css.charCodeAt(next + 1);
          if (
            escape &&
            code !== SLASH &&
            code !== SPACE &&
            code !== NEWLINE &&
            code !== TAB &&
            code !== CR &&
            code !== FEED
          ) {
            next += 1;
            if (RE_HEX_ESCAPE.test(css.charAt(next))) {
              while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
                next += 1;
              }
              if (css.charCodeAt(next + 1) === SPACE) {
                next += 1;
              }
            }
          }

          currentToken = ['word', css.slice(pos, next + 1), pos, next];

          pos = next;
          break
        }

        default: {
          if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
            next = css.indexOf('*/', pos + 2) + 1;
            if (next === 0) {
              if (ignore || ignoreUnclosed) {
                next = css.length;
              } else {
                unclosed('comment');
              }
            }

            currentToken = ['comment', css.slice(pos, next + 1), pos, next];
            pos = next;
          } else {
            RE_WORD_END.lastIndex = pos + 1;
            RE_WORD_END.test(css);
            if (RE_WORD_END.lastIndex === 0) {
              next = css.length - 1;
            } else {
              next = RE_WORD_END.lastIndex - 2;
            }

            currentToken = ['word', css.slice(pos, next + 1), pos, next];
            buffer.push(currentToken);
            pos = next;
          }

          break
        }
      }

      pos++;
      return currentToken
    }

    function back(token) {
      returned.push(token);
    }

    return {
      back,
      nextToken,
      endOfFile,
      position
    }
  };

  let Container$5 = container;

  class AtRule$3 extends Container$5 {
    constructor(defaults) {
      super(defaults);
      this.type = 'atrule';
    }

    append(...children) {
      if (!this.proxyOf.nodes) this.nodes = [];
      return super.append(...children)
    }

    prepend(...children) {
      if (!this.proxyOf.nodes) this.nodes = [];
      return super.prepend(...children)
    }
  }

  var atRule = AtRule$3;
  AtRule$3.default = AtRule$3;

  Container$5.registerAtRule(AtRule$3);

  let Container$4 = container;

  let LazyResult$3, Processor$2;

  class Root$5 extends Container$4 {
    constructor(defaults) {
      super(defaults);
      this.type = 'root';
      if (!this.nodes) this.nodes = [];
    }

    removeChild(child, ignore) {
      let index = this.index(child);

      if (!ignore && index === 0 && this.nodes.length > 1) {
        this.nodes[1].raws.before = this.nodes[index].raws.before;
      }

      return super.removeChild(child)
    }

    normalize(child, sample, type) {
      let nodes = super.normalize(child);

      if (sample) {
        if (type === 'prepend') {
          if (this.nodes.length > 1) {
            sample.raws.before = this.nodes[1].raws.before;
          } else {
            delete sample.raws.before;
          }
        } else if (this.first !== sample) {
          for (let node of nodes) {
            node.raws.before = sample.raws.before;
          }
        }
      }

      return nodes
    }

    toResult(opts = {}) {
      let lazy = new LazyResult$3(new Processor$2(), this, opts);
      return lazy.stringify()
    }
  }

  Root$5.registerLazyResult = dependant => {
    LazyResult$3 = dependant;
  };

  Root$5.registerProcessor = dependant => {
    Processor$2 = dependant;
  };

  var root = Root$5;
  Root$5.default = Root$5;

  let list$2 = {
    split(string, separators, last) {
      let array = [];
      let current = '';
      let split = false;

      let func = 0;
      let quote = false;
      let escape = false;

      for (let letter of string) {
        if (escape) {
          escape = false;
        } else if (letter === '\\') {
          escape = true;
        } else if (quote) {
          if (letter === quote) {
            quote = false;
          }
        } else if (letter === '"' || letter === "'") {
          quote = letter;
        } else if (letter === '(') {
          func += 1;
        } else if (letter === ')') {
          if (func > 0) func -= 1;
        } else if (func === 0) {
          if (separators.includes(letter)) split = true;
        }

        if (split) {
          if (current !== '') array.push(current.trim());
          current = '';
          split = false;
        } else {
          current += letter;
        }
      }

      if (last || current !== '') array.push(current.trim());
      return array
    },

    space(string) {
      let spaces = [' ', '\n', '\t'];
      return list$2.split(string, spaces)
    },

    comma(string) {
      return list$2.split(string, [','], true)
    }
  };

  var list_1 = list$2;
  list$2.default = list$2;

  let Container$3 = container;
  let list$1 = list_1;

  class Rule$3 extends Container$3 {
    constructor(defaults) {
      super(defaults);
      this.type = 'rule';
      if (!this.nodes) this.nodes = [];
    }

    get selectors() {
      return list$1.comma(this.selector)
    }

    set selectors(values) {
      let match = this.selector ? this.selector.match(/,\s*/) : null;
      let sep = match ? match[0] : ',' + this.raw('between', 'beforeOpen');
      this.selector = values.join(sep);
    }
  }

  var rule = Rule$3;
  Rule$3.default = Rule$3;

  Container$3.registerRule(Rule$3);

  let Declaration$2 = declaration;
  let tokenizer = tokenize;
  let Comment$2 = comment;
  let AtRule$2 = atRule;
  let Root$4 = root;
  let Rule$2 = rule;

  const SAFE_COMMENT_NEIGHBOR = {
    empty: true,
    space: true
  };

  function findLastWithPosition(tokens) {
    for (let i = tokens.length - 1; i >= 0; i--) {
      let token = tokens[i];
      let pos = token[3] || token[2];
      if (pos) return pos
    }
  }

  class Parser$1 {
    constructor(input) {
      this.input = input;

      this.root = new Root$4();
      this.current = this.root;
      this.spaces = '';
      this.semicolon = false;
      this.customProperty = false;

      this.createTokenizer();
      this.root.source = { input, start: { offset: 0, line: 1, column: 1 } };
    }

    createTokenizer() {
      this.tokenizer = tokenizer(this.input);
    }

    parse() {
      let token;
      while (!this.tokenizer.endOfFile()) {
        token = this.tokenizer.nextToken();

        switch (token[0]) {
          case 'space':
            this.spaces += token[1];
            break

          case ';':
            this.freeSemicolon(token);
            break

          case '}':
            this.end(token);
            break

          case 'comment':
            this.comment(token);
            break

          case 'at-word':
            this.atrule(token);
            break

          case '{':
            this.emptyRule(token);
            break

          default:
            this.other(token);
            break
        }
      }
      this.endFile();
    }

    comment(token) {
      let node = new Comment$2();
      this.init(node, token[2]);
      node.source.end = this.getPosition(token[3] || token[2]);

      let text = token[1].slice(2, -2);
      if (/^\s*$/.test(text)) {
        node.text = '';
        node.raws.left = text;
        node.raws.right = '';
      } else {
        let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
        node.text = match[2];
        node.raws.left = match[1];
        node.raws.right = match[3];
      }
    }

    emptyRule(token) {
      let node = new Rule$2();
      this.init(node, token[2]);
      node.selector = '';
      node.raws.between = '';
      this.current = node;
    }

    other(start) {
      let end = false;
      let type = null;
      let colon = false;
      let bracket = null;
      let brackets = [];
      let customProperty = start[1].startsWith('--');

      let tokens = [];
      let token = start;
      while (token) {
        type = token[0];
        tokens.push(token);

        if (type === '(' || type === '[') {
          if (!bracket) bracket = token;
          brackets.push(type === '(' ? ')' : ']');
        } else if (customProperty && colon && type === '{') {
          if (!bracket) bracket = token;
          brackets.push('}');
        } else if (brackets.length === 0) {
          if (type === ';') {
            if (colon) {
              this.decl(tokens, customProperty);
              return
            } else {
              break
            }
          } else if (type === '{') {
            this.rule(tokens);
            return
          } else if (type === '}') {
            this.tokenizer.back(tokens.pop());
            end = true;
            break
          } else if (type === ':') {
            colon = true;
          }
        } else if (type === brackets[brackets.length - 1]) {
          brackets.pop();
          if (brackets.length === 0) bracket = null;
        }

        token = this.tokenizer.nextToken();
      }

      if (this.tokenizer.endOfFile()) end = true;
      if (brackets.length > 0) this.unclosedBracket(bracket);

      if (end && colon) {
        if (!customProperty) {
          while (tokens.length) {
            token = tokens[tokens.length - 1][0];
            if (token !== 'space' && token !== 'comment') break
            this.tokenizer.back(tokens.pop());
          }
        }
        this.decl(tokens, customProperty);
      } else {
        this.unknownWord(tokens);
      }
    }

    rule(tokens) {
      tokens.pop();

      let node = new Rule$2();
      this.init(node, tokens[0][2]);

      node.raws.between = this.spacesAndCommentsFromEnd(tokens);
      this.raw(node, 'selector', tokens);
      this.current = node;
    }

    decl(tokens, customProperty) {
      let node = new Declaration$2();
      this.init(node, tokens[0][2]);

      let last = tokens[tokens.length - 1];
      if (last[0] === ';') {
        this.semicolon = true;
        tokens.pop();
      }

      node.source.end = this.getPosition(
        last[3] || last[2] || findLastWithPosition(tokens)
      );

      while (tokens[0][0] !== 'word') {
        if (tokens.length === 1) this.unknownWord(tokens);
        node.raws.before += tokens.shift()[1];
      }
      node.source.start = this.getPosition(tokens[0][2]);

      node.prop = '';
      while (tokens.length) {
        let type = tokens[0][0];
        if (type === ':' || type === 'space' || type === 'comment') {
          break
        }
        node.prop += tokens.shift()[1];
      }

      node.raws.between = '';

      let token;
      while (tokens.length) {
        token = tokens.shift();

        if (token[0] === ':') {
          node.raws.between += token[1];
          break
        } else {
          if (token[0] === 'word' && /\w/.test(token[1])) {
            this.unknownWord([token]);
          }
          node.raws.between += token[1];
        }
      }

      if (node.prop[0] === '_' || node.prop[0] === '*') {
        node.raws.before += node.prop[0];
        node.prop = node.prop.slice(1);
      }

      let firstSpaces = [];
      let next;
      while (tokens.length) {
        next = tokens[0][0];
        if (next !== 'space' && next !== 'comment') break
        firstSpaces.push(tokens.shift());
      }

      this.precheckMissedSemicolon(tokens);

      for (let i = tokens.length - 1; i >= 0; i--) {
        token = tokens[i];
        if (token[1].toLowerCase() === '!important') {
          node.important = true;
          let string = this.stringFrom(tokens, i);
          string = this.spacesFromEnd(tokens) + string;
          if (string !== ' !important') node.raws.important = string;
          break
        } else if (token[1].toLowerCase() === 'important') {
          let cache = tokens.slice(0);
          let str = '';
          for (let j = i; j > 0; j--) {
            let type = cache[j][0];
            if (str.trim().indexOf('!') === 0 && type !== 'space') {
              break
            }
            str = cache.pop()[1] + str;
          }
          if (str.trim().indexOf('!') === 0) {
            node.important = true;
            node.raws.important = str;
            tokens = cache;
          }
        }

        if (token[0] !== 'space' && token[0] !== 'comment') {
          break
        }
      }

      let hasWord = tokens.some(i => i[0] !== 'space' && i[0] !== 'comment');

      if (hasWord) {
        node.raws.between += firstSpaces.map(i => i[1]).join('');
        firstSpaces = [];
      }
      this.raw(node, 'value', firstSpaces.concat(tokens), customProperty);

      if (node.value.includes(':') && !customProperty) {
        this.checkMissedSemicolon(tokens);
      }
    }

    atrule(token) {
      let node = new AtRule$2();
      node.name = token[1].slice(1);
      if (node.name === '') {
        this.unnamedAtrule(node, token);
      }
      this.init(node, token[2]);

      let type;
      let prev;
      let shift;
      let last = false;
      let open = false;
      let params = [];
      let brackets = [];

      while (!this.tokenizer.endOfFile()) {
        token = this.tokenizer.nextToken();
        type = token[0];

        if (type === '(' || type === '[') {
          brackets.push(type === '(' ? ')' : ']');
        } else if (type === '{' && brackets.length > 0) {
          brackets.push('}');
        } else if (type === brackets[brackets.length - 1]) {
          brackets.pop();
        }

        if (brackets.length === 0) {
          if (type === ';') {
            node.source.end = this.getPosition(token[2]);
            this.semicolon = true;
            break
          } else if (type === '{') {
            open = true;
            break
          } else if (type === '}') {
            if (params.length > 0) {
              shift = params.length - 1;
              prev = params[shift];
              while (prev && prev[0] === 'space') {
                prev = params[--shift];
              }
              if (prev) {
                node.source.end = this.getPosition(prev[3] || prev[2]);
              }
            }
            this.end(token);
            break
          } else {
            params.push(token);
          }
        } else {
          params.push(token);
        }

        if (this.tokenizer.endOfFile()) {
          last = true;
          break
        }
      }

      node.raws.between = this.spacesAndCommentsFromEnd(params);
      if (params.length) {
        node.raws.afterName = this.spacesAndCommentsFromStart(params);
        this.raw(node, 'params', params);
        if (last) {
          token = params[params.length - 1];
          node.source.end = this.getPosition(token[3] || token[2]);
          this.spaces = node.raws.between;
          node.raws.between = '';
        }
      } else {
        node.raws.afterName = '';
        node.params = '';
      }

      if (open) {
        node.nodes = [];
        this.current = node;
      }
    }

    end(token) {
      if (this.current.nodes && this.current.nodes.length) {
        this.current.raws.semicolon = this.semicolon;
      }
      this.semicolon = false;

      this.current.raws.after = (this.current.raws.after || '') + this.spaces;
      this.spaces = '';

      if (this.current.parent) {
        this.current.source.end = this.getPosition(token[2]);
        this.current = this.current.parent;
      } else {
        this.unexpectedClose(token);
      }
    }

    endFile() {
      if (this.current.parent) this.unclosedBlock();
      if (this.current.nodes && this.current.nodes.length) {
        this.current.raws.semicolon = this.semicolon;
      }
      this.current.raws.after = (this.current.raws.after || '') + this.spaces;
    }

    freeSemicolon(token) {
      this.spaces += token[1];
      if (this.current.nodes) {
        let prev = this.current.nodes[this.current.nodes.length - 1];
        if (prev && prev.type === 'rule' && !prev.raws.ownSemicolon) {
          prev.raws.ownSemicolon = this.spaces;
          this.spaces = '';
        }
      }
    }

    // Helpers

    getPosition(offset) {
      let pos = this.input.fromOffset(offset);
      return {
        offset,
        line: pos.line,
        column: pos.col
      }
    }

    init(node, offset) {
      this.current.push(node);
      node.source = {
        start: this.getPosition(offset),
        input: this.input
      };
      node.raws.before = this.spaces;
      this.spaces = '';
      if (node.type !== 'comment') this.semicolon = false;
    }

    raw(node, prop, tokens, customProperty) {
      let token, type;
      let length = tokens.length;
      let value = '';
      let clean = true;
      let next, prev;

      for (let i = 0; i < length; i += 1) {
        token = tokens[i];
        type = token[0];
        if (type === 'space' && i === length - 1 && !customProperty) {
          clean = false;
        } else if (type === 'comment') {
          prev = tokens[i - 1] ? tokens[i - 1][0] : 'empty';
          next = tokens[i + 1] ? tokens[i + 1][0] : 'empty';
          if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
            if (value.slice(-1) === ',') {
              clean = false;
            } else {
              value += token[1];
            }
          } else {
            clean = false;
          }
        } else {
          value += token[1];
        }
      }
      if (!clean) {
        let raw = tokens.reduce((all, i) => all + i[1], '');
        node.raws[prop] = { value, raw };
      }
      node[prop] = value;
    }

    spacesAndCommentsFromEnd(tokens) {
      let lastTokenType;
      let spaces = '';
      while (tokens.length) {
        lastTokenType = tokens[tokens.length - 1][0];
        if (lastTokenType !== 'space' && lastTokenType !== 'comment') break
        spaces = tokens.pop()[1] + spaces;
      }
      return spaces
    }

    spacesAndCommentsFromStart(tokens) {
      let next;
      let spaces = '';
      while (tokens.length) {
        next = tokens[0][0];
        if (next !== 'space' && next !== 'comment') break
        spaces += tokens.shift()[1];
      }
      return spaces
    }

    spacesFromEnd(tokens) {
      let lastTokenType;
      let spaces = '';
      while (tokens.length) {
        lastTokenType = tokens[tokens.length - 1][0];
        if (lastTokenType !== 'space') break
        spaces = tokens.pop()[1] + spaces;
      }
      return spaces
    }

    stringFrom(tokens, from) {
      let result = '';
      for (let i = from; i < tokens.length; i++) {
        result += tokens[i][1];
      }
      tokens.splice(from, tokens.length - from);
      return result
    }

    colon(tokens) {
      let brackets = 0;
      let token, type, prev;
      for (let [i, element] of tokens.entries()) {
        token = element;
        type = token[0];

        if (type === '(') {
          brackets += 1;
        }
        if (type === ')') {
          brackets -= 1;
        }
        if (brackets === 0 && type === ':') {
          if (!prev) {
            this.doubleColon(token);
          } else if (prev[0] === 'word' && prev[1] === 'progid') {
            continue
          } else {
            return i
          }
        }

        prev = token;
      }
      return false
    }

    // Errors

    unclosedBracket(bracket) {
      throw this.input.error(
        'Unclosed bracket',
        { offset: bracket[2] },
        { offset: bracket[2] + 1 }
      )
    }

    unknownWord(tokens) {
      throw this.input.error(
        'Unknown word',
        { offset: tokens[0][2] },
        { offset: tokens[0][2] + tokens[0][1].length }
      )
    }

    unexpectedClose(token) {
      throw this.input.error(
        'Unexpected }',
        { offset: token[2] },
        { offset: token[2] + 1 }
      )
    }

    unclosedBlock() {
      let pos = this.current.source.start;
      throw this.input.error('Unclosed block', pos.line, pos.column)
    }

    doubleColon(token) {
      throw this.input.error(
        'Double colon',
        { offset: token[2] },
        { offset: token[2] + token[1].length }
      )
    }

    unnamedAtrule(node, token) {
      throw this.input.error(
        'At-rule without name',
        { offset: token[2] },
        { offset: token[2] + token[1].length }
      )
    }

    precheckMissedSemicolon(/* tokens */) {
      // Hook for Safe Parser
    }

    checkMissedSemicolon(tokens) {
      let colon = this.colon(tokens);
      if (colon === false) return

      let founded = 0;
      let token;
      for (let j = colon - 1; j >= 0; j--) {
        token = tokens[j];
        if (token[0] !== 'space') {
          founded += 1;
          if (founded === 2) break
        }
      }
      // If the token is a word, e.g. `!important`, `red` or any other valid property's value.
      // Then we need to return the colon after that word token. [3] is the "end" colon of that word.
      // And because we need it after that one we do +1 to get the next one.
      throw this.input.error(
        'Missed semicolon',
        token[0] === 'word' ? token[3] + 1 : token[2]
      )
    }
  }

  var parser = Parser$1;

  let Container$2 = container;
  let Parser = parser;
  let Input$2 = input;

  function parse$3(css, opts) {
    let input = new Input$2(css, opts);
    let parser = new Parser(input);
    try {
      parser.parse();
    } catch (e) {
      if (browser$1.env.NODE_ENV !== 'production') {
        if (e.name === 'CssSyntaxError' && opts && opts.from) {
          if (/\.scss$/i.test(opts.from)) {
            e.message +=
              '\nYou tried to parse SCSS with ' +
              'the standard CSS parser; ' +
              'try again with the postcss-scss parser';
          } else if (/\.sass/i.test(opts.from)) {
            e.message +=
              '\nYou tried to parse Sass with ' +
              'the standard CSS parser; ' +
              'try again with the postcss-sass parser';
          } else if (/\.less$/i.test(opts.from)) {
            e.message +=
              '\nYou tried to parse Less with ' +
              'the standard CSS parser; ' +
              'try again with the postcss-less parser';
          }
        }
      }
      throw e
    }

    return parser.root
  }

  var parse_1 = parse$3;
  parse$3.default = parse$3;

  Container$2.registerParse(parse$3);

  let { isClean, my } = symbols;
  let MapGenerator$1 = mapGenerator;
  let stringify$2 = stringify_1;
  let Container$1 = container;
  let Document$2 = document;
  let warnOnce$1 = warnOnce$2;
  let Result$2 = result;
  let parse$2 = parse_1;
  let Root$3 = root;

  const TYPE_TO_CLASS_NAME = {
    document: 'Document',
    root: 'Root',
    atrule: 'AtRule',
    rule: 'Rule',
    decl: 'Declaration',
    comment: 'Comment'
  };

  const PLUGIN_PROPS = {
    postcssPlugin: true,
    prepare: true,
    Once: true,
    Document: true,
    Root: true,
    Declaration: true,
    Rule: true,
    AtRule: true,
    Comment: true,
    DeclarationExit: true,
    RuleExit: true,
    AtRuleExit: true,
    CommentExit: true,
    RootExit: true,
    DocumentExit: true,
    OnceExit: true
  };

  const NOT_VISITORS = {
    postcssPlugin: true,
    prepare: true,
    Once: true
  };

  const CHILDREN = 0;

  function isPromise(obj) {
    return typeof obj === 'object' && typeof obj.then === 'function'
  }

  function getEvents(node) {
    let key = false;
    let type = TYPE_TO_CLASS_NAME[node.type];
    if (node.type === 'decl') {
      key = node.prop.toLowerCase();
    } else if (node.type === 'atrule') {
      key = node.name.toLowerCase();
    }

    if (key && node.append) {
      return [
        type,
        type + '-' + key,
        CHILDREN,
        type + 'Exit',
        type + 'Exit-' + key
      ]
    } else if (key) {
      return [type, type + '-' + key, type + 'Exit', type + 'Exit-' + key]
    } else if (node.append) {
      return [type, CHILDREN, type + 'Exit']
    } else {
      return [type, type + 'Exit']
    }
  }

  function toStack(node) {
    let events;
    if (node.type === 'document') {
      events = ['Document', CHILDREN, 'DocumentExit'];
    } else if (node.type === 'root') {
      events = ['Root', CHILDREN, 'RootExit'];
    } else {
      events = getEvents(node);
    }

    return {
      node,
      events,
      eventIndex: 0,
      visitors: [],
      visitorIndex: 0,
      iterator: 0
    }
  }

  function cleanMarks(node) {
    node[isClean] = false;
    if (node.nodes) node.nodes.forEach(i => cleanMarks(i));
    return node
  }

  let postcss$1 = {};

  class LazyResult$2 {
    constructor(processor, css, opts) {
      this.stringified = false;
      this.processed = false;

      let root;
      if (
        typeof css === 'object' &&
        css !== null &&
        (css.type === 'root' || css.type === 'document')
      ) {
        root = cleanMarks(css);
      } else if (css instanceof LazyResult$2 || css instanceof Result$2) {
        root = cleanMarks(css.root);
        if (css.map) {
          if (typeof opts.map === 'undefined') opts.map = {};
          if (!opts.map.inline) opts.map.inline = false;
          opts.map.prev = css.map;
        }
      } else {
        let parser = parse$2;
        if (opts.syntax) parser = opts.syntax.parse;
        if (opts.parser) parser = opts.parser;
        if (parser.parse) parser = parser.parse;

        try {
          root = parser(css, opts);
        } catch (error) {
          this.processed = true;
          this.error = error;
        }

        if (root && !root[my]) {
          /* c8 ignore next 2 */
          Container$1.rebuild(root);
        }
      }

      this.result = new Result$2(processor, root, opts);
      this.helpers = { ...postcss$1, result: this.result, postcss: postcss$1 };
      this.plugins = this.processor.plugins.map(plugin => {
        if (typeof plugin === 'object' && plugin.prepare) {
          return { ...plugin, ...plugin.prepare(this.result) }
        } else {
          return plugin
        }
      });
    }

    get [Symbol.toStringTag]() {
      return 'LazyResult'
    }

    get processor() {
      return this.result.processor
    }

    get opts() {
      return this.result.opts
    }

    get css() {
      return this.stringify().css
    }

    get content() {
      return this.stringify().content
    }

    get map() {
      return this.stringify().map
    }

    get root() {
      return this.sync().root
    }

    get messages() {
      return this.sync().messages
    }

    warnings() {
      return this.sync().warnings()
    }

    toString() {
      return this.css
    }

    then(onFulfilled, onRejected) {
      if (browser$1.env.NODE_ENV !== 'production') {
        if (!('from' in this.opts)) {
          warnOnce$1(
            'Without `from` option PostCSS could generate wrong source map ' +
              'and will not find Browserslist config. Set it to CSS file path ' +
              'or to `undefined` to prevent this warning.'
          );
        }
      }
      return this.async().then(onFulfilled, onRejected)
    }

    catch(onRejected) {
      return this.async().catch(onRejected)
    }

    finally(onFinally) {
      return this.async().then(onFinally, onFinally)
    }

    async() {
      if (this.error) return Promise.reject(this.error)
      if (this.processed) return Promise.resolve(this.result)
      if (!this.processing) {
        this.processing = this.runAsync();
      }
      return this.processing
    }

    sync() {
      if (this.error) throw this.error
      if (this.processed) return this.result
      this.processed = true;

      if (this.processing) {
        throw this.getAsyncError()
      }

      for (let plugin of this.plugins) {
        let promise = this.runOnRoot(plugin);
        if (isPromise(promise)) {
          throw this.getAsyncError()
        }
      }

      this.prepareVisitors();
      if (this.hasListener) {
        let root = this.result.root;
        while (!root[isClean]) {
          root[isClean] = true;
          this.walkSync(root);
        }
        if (this.listeners.OnceExit) {
          if (root.type === 'document') {
            for (let subRoot of root.nodes) {
              this.visitSync(this.listeners.OnceExit, subRoot);
            }
          } else {
            this.visitSync(this.listeners.OnceExit, root);
          }
        }
      }

      return this.result
    }

    stringify() {
      if (this.error) throw this.error
      if (this.stringified) return this.result
      this.stringified = true;

      this.sync();

      let opts = this.result.opts;
      let str = stringify$2;
      if (opts.syntax) str = opts.syntax.stringify;
      if (opts.stringifier) str = opts.stringifier;
      if (str.stringify) str = str.stringify;

      let map = new MapGenerator$1(str, this.result.root, this.result.opts);
      let data = map.generate();
      this.result.css = data[0];
      this.result.map = data[1];

      return this.result
    }

    walkSync(node) {
      node[isClean] = true;
      let events = getEvents(node);
      for (let event of events) {
        if (event === CHILDREN) {
          if (node.nodes) {
            node.each(child => {
              if (!child[isClean]) this.walkSync(child);
            });
          }
        } else {
          let visitors = this.listeners[event];
          if (visitors) {
            if (this.visitSync(visitors, node.toProxy())) return
          }
        }
      }
    }

    visitSync(visitors, node) {
      for (let [plugin, visitor] of visitors) {
        this.result.lastPlugin = plugin;
        let promise;
        try {
          promise = visitor(node, this.helpers);
        } catch (e) {
          throw this.handleError(e, node.proxyOf)
        }
        if (node.type !== 'root' && node.type !== 'document' && !node.parent) {
          return true
        }
        if (isPromise(promise)) {
          throw this.getAsyncError()
        }
      }
    }

    runOnRoot(plugin) {
      this.result.lastPlugin = plugin;
      try {
        if (typeof plugin === 'object' && plugin.Once) {
          if (this.result.root.type === 'document') {
            let roots = this.result.root.nodes.map(root =>
              plugin.Once(root, this.helpers)
            );

            if (isPromise(roots[0])) {
              return Promise.all(roots)
            }

            return roots
          }

          return plugin.Once(this.result.root, this.helpers)
        } else if (typeof plugin === 'function') {
          return plugin(this.result.root, this.result)
        }
      } catch (error) {
        throw this.handleError(error)
      }
    }

    getAsyncError() {
      throw new Error('Use process(css).then(cb) to work with async plugins')
    }

    handleError(error, node) {
      let plugin = this.result.lastPlugin;
      try {
        if (node) node.addToError(error);
        this.error = error;
        if (error.name === 'CssSyntaxError' && !error.plugin) {
          error.plugin = plugin.postcssPlugin;
          error.setMessage();
        } else if (plugin.postcssVersion) {
          if (browser$1.env.NODE_ENV !== 'production') {
            let pluginName = plugin.postcssPlugin;
            let pluginVer = plugin.postcssVersion;
            let runtimeVer = this.result.processor.version;
            let a = pluginVer.split('.');
            let b = runtimeVer.split('.');

            if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
              // eslint-disable-next-line no-console
              console.error(
                'Unknown error from PostCSS plugin. Your current PostCSS ' +
                  'version is ' +
                  runtimeVer +
                  ', but ' +
                  pluginName +
                  ' uses ' +
                  pluginVer +
                  '. Perhaps this is the source of the error below.'
              );
            }
          }
        }
      } catch (err) {
        /* c8 ignore next 3 */
        // eslint-disable-next-line no-console
        if (console && console.error) console.error(err);
      }
      return error
    }

    async runAsync() {
      this.plugin = 0;
      for (let i = 0; i < this.plugins.length; i++) {
        let plugin = this.plugins[i];
        let promise = this.runOnRoot(plugin);
        if (isPromise(promise)) {
          try {
            await promise;
          } catch (error) {
            throw this.handleError(error)
          }
        }
      }

      this.prepareVisitors();
      if (this.hasListener) {
        let root = this.result.root;
        while (!root[isClean]) {
          root[isClean] = true;
          let stack = [toStack(root)];
          while (stack.length > 0) {
            let promise = this.visitTick(stack);
            if (isPromise(promise)) {
              try {
                await promise;
              } catch (e) {
                let node = stack[stack.length - 1].node;
                throw this.handleError(e, node)
              }
            }
          }
        }

        if (this.listeners.OnceExit) {
          for (let [plugin, visitor] of this.listeners.OnceExit) {
            this.result.lastPlugin = plugin;
            try {
              if (root.type === 'document') {
                let roots = root.nodes.map(subRoot =>
                  visitor(subRoot, this.helpers)
                );

                await Promise.all(roots);
              } else {
                await visitor(root, this.helpers);
              }
            } catch (e) {
              throw this.handleError(e)
            }
          }
        }
      }

      this.processed = true;
      return this.stringify()
    }

    prepareVisitors() {
      this.listeners = {};
      let add = (plugin, type, cb) => {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push([plugin, cb]);
      };
      for (let plugin of this.plugins) {
        if (typeof plugin === 'object') {
          for (let event in plugin) {
            if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
              throw new Error(
                `Unknown event ${event} in ${plugin.postcssPlugin}. ` +
                  `Try to update PostCSS (${this.processor.version} now).`
              )
            }
            if (!NOT_VISITORS[event]) {
              if (typeof plugin[event] === 'object') {
                for (let filter in plugin[event]) {
                  if (filter === '*') {
                    add(plugin, event, plugin[event][filter]);
                  } else {
                    add(
                      plugin,
                      event + '-' + filter.toLowerCase(),
                      plugin[event][filter]
                    );
                  }
                }
              } else if (typeof plugin[event] === 'function') {
                add(plugin, event, plugin[event]);
              }
            }
          }
        }
      }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }

    visitTick(stack) {
      let visit = stack[stack.length - 1];
      let { node, visitors } = visit;

      if (node.type !== 'root' && node.type !== 'document' && !node.parent) {
        stack.pop();
        return
      }

      if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
        let [plugin, visitor] = visitors[visit.visitorIndex];
        visit.visitorIndex += 1;
        if (visit.visitorIndex === visitors.length) {
          visit.visitors = [];
          visit.visitorIndex = 0;
        }
        this.result.lastPlugin = plugin;
        try {
          return visitor(node.toProxy(), this.helpers)
        } catch (e) {
          throw this.handleError(e, node)
        }
      }

      if (visit.iterator !== 0) {
        let iterator = visit.iterator;
        let child;
        while ((child = node.nodes[node.indexes[iterator]])) {
          node.indexes[iterator] += 1;
          if (!child[isClean]) {
            child[isClean] = true;
            stack.push(toStack(child));
            return
          }
        }
        visit.iterator = 0;
        delete node.indexes[iterator];
      }

      let events = visit.events;
      while (visit.eventIndex < events.length) {
        let event = events[visit.eventIndex];
        visit.eventIndex += 1;
        if (event === CHILDREN) {
          if (node.nodes && node.nodes.length) {
            node[isClean] = true;
            visit.iterator = node.getIterator();
          }
          return
        } else if (this.listeners[event]) {
          visit.visitors = this.listeners[event];
          return
        }
      }
      stack.pop();
    }
  }

  LazyResult$2.registerPostcss = dependant => {
    postcss$1 = dependant;
  };

  var lazyResult = LazyResult$2;
  LazyResult$2.default = LazyResult$2;

  Root$3.registerLazyResult(LazyResult$2);
  Document$2.registerLazyResult(LazyResult$2);

  let MapGenerator = mapGenerator;
  let stringify$1 = stringify_1;
  let warnOnce = warnOnce$2;
  let parse$1 = parse_1;
  const Result$1 = result;

  class NoWorkResult$1 {
    constructor(processor, css, opts) {
      css = css.toString();
      this.stringified = false;

      this._processor = processor;
      this._css = css;
      this._opts = opts;
      this._map = undefined;
      let root;

      let str = stringify$1;
      this.result = new Result$1(this._processor, root, this._opts);
      this.result.css = css;

      let self = this;
      Object.defineProperty(this.result, 'root', {
        get() {
          return self.root
        }
      });

      let map = new MapGenerator(str, root, this._opts, css);
      if (map.isMap()) {
        let [generatedCSS, generatedMap] = map.generate();
        if (generatedCSS) {
          this.result.css = generatedCSS;
        }
        if (generatedMap) {
          this.result.map = generatedMap;
        }
      }
    }

    get [Symbol.toStringTag]() {
      return 'NoWorkResult'
    }

    get processor() {
      return this.result.processor
    }

    get opts() {
      return this.result.opts
    }

    get css() {
      return this.result.css
    }

    get content() {
      return this.result.css
    }

    get map() {
      return this.result.map
    }

    get root() {
      if (this._root) {
        return this._root
      }

      let root;
      let parser = parse$1;

      try {
        root = parser(this._css, this._opts);
      } catch (error) {
        this.error = error;
      }

      if (this.error) {
        throw this.error
      } else {
        this._root = root;
        return root
      }
    }

    get messages() {
      return []
    }

    warnings() {
      return []
    }

    toString() {
      return this._css
    }

    then(onFulfilled, onRejected) {
      if (browser$1.env.NODE_ENV !== 'production') {
        if (!('from' in this._opts)) {
          warnOnce(
            'Without `from` option PostCSS could generate wrong source map ' +
              'and will not find Browserslist config. Set it to CSS file path ' +
              'or to `undefined` to prevent this warning.'
          );
        }
      }

      return this.async().then(onFulfilled, onRejected)
    }

    catch(onRejected) {
      return this.async().catch(onRejected)
    }

    finally(onFinally) {
      return this.async().then(onFinally, onFinally)
    }

    async() {
      if (this.error) return Promise.reject(this.error)
      return Promise.resolve(this.result)
    }

    sync() {
      if (this.error) throw this.error
      return this.result
    }
  }

  var noWorkResult = NoWorkResult$1;
  NoWorkResult$1.default = NoWorkResult$1;

  let NoWorkResult = noWorkResult;
  let LazyResult$1 = lazyResult;
  let Document$1 = document;
  let Root$2 = root;

  class Processor$1 {
    constructor(plugins = []) {
      this.version = '8.4.14';
      this.plugins = this.normalize(plugins);
    }

    use(plugin) {
      this.plugins = this.plugins.concat(this.normalize([plugin]));
      return this
    }

    process(css, opts = {}) {
      if (
        this.plugins.length === 0 &&
        typeof opts.parser === 'undefined' &&
        typeof opts.stringifier === 'undefined' &&
        typeof opts.syntax === 'undefined'
      ) {
        return new NoWorkResult(this, css, opts)
      } else {
        return new LazyResult$1(this, css, opts)
      }
    }

    normalize(plugins) {
      let normalized = [];
      for (let i of plugins) {
        if (i.postcss === true) {
          i = i();
        } else if (i.postcss) {
          i = i.postcss;
        }

        if (typeof i === 'object' && Array.isArray(i.plugins)) {
          normalized = normalized.concat(i.plugins);
        } else if (typeof i === 'object' && i.postcssPlugin) {
          normalized.push(i);
        } else if (typeof i === 'function') {
          normalized.push(i);
        } else if (typeof i === 'object' && (i.parse || i.stringify)) {
          if (browser$1.env.NODE_ENV !== 'production') {
            throw new Error(
              'PostCSS syntaxes cannot be used as plugins. Instead, please use ' +
                'one of the syntax/parser/stringifier options as outlined ' +
                'in your PostCSS runner documentation.'
            )
          }
        } else {
          throw new Error(i + ' is not a PostCSS plugin')
        }
      }
      return normalized
    }
  }

  var processor = Processor$1;
  Processor$1.default = Processor$1;

  Root$2.registerProcessor(Processor$1);
  Document$1.registerProcessor(Processor$1);

  let Declaration$1 = declaration;
  let PreviousMap = previousMap;
  let Comment$1 = comment;
  let AtRule$1 = atRule;
  let Input$1 = input;
  let Root$1 = root;
  let Rule$1 = rule;

  function fromJSON$1(json, inputs) {
    if (Array.isArray(json)) return json.map(n => fromJSON$1(n))

    let { inputs: ownInputs, ...defaults } = json;
    if (ownInputs) {
      inputs = [];
      for (let input of ownInputs) {
        let inputHydrated = { ...input, __proto__: Input$1.prototype };
        if (inputHydrated.map) {
          inputHydrated.map = {
            ...inputHydrated.map,
            __proto__: PreviousMap.prototype
          };
        }
        inputs.push(inputHydrated);
      }
    }
    if (defaults.nodes) {
      defaults.nodes = json.nodes.map(n => fromJSON$1(n, inputs));
    }
    if (defaults.source) {
      let { inputId, ...source } = defaults.source;
      defaults.source = source;
      if (inputId != null) {
        defaults.source.input = inputs[inputId];
      }
    }
    if (defaults.type === 'root') {
      return new Root$1(defaults)
    } else if (defaults.type === 'decl') {
      return new Declaration$1(defaults)
    } else if (defaults.type === 'rule') {
      return new Rule$1(defaults)
    } else if (defaults.type === 'comment') {
      return new Comment$1(defaults)
    } else if (defaults.type === 'atrule') {
      return new AtRule$1(defaults)
    } else {
      throw new Error('Unknown node type: ' + json.type)
    }
  }

  var fromJSON_1 = fromJSON$1;
  fromJSON$1.default = fromJSON$1;

  let CssSyntaxError = cssSyntaxError;
  let Declaration = declaration;
  let LazyResult = lazyResult;
  let Container = container;
  let Processor = processor;
  let stringify = stringify_1;
  let fromJSON = fromJSON_1;
  let Document = document;
  let Warning = warning;
  let Comment = comment;
  let AtRule = atRule;
  let Result = result;
  let Input = input;
  let parse = parse_1;
  let list = list_1;
  let Rule = rule;
  let Root = root;
  let Node = node_1;

  function postcss(...plugins) {
    if (plugins.length === 1 && Array.isArray(plugins[0])) {
      plugins = plugins[0];
    }
    return new Processor(plugins)
  }

  postcss.plugin = function plugin(name, initializer) {
    let warningPrinted = false;
    function creator(...args) {
      // eslint-disable-next-line no-console
      if (console && console.warn && !warningPrinted) {
        warningPrinted = true;
        // eslint-disable-next-line no-console
        console.warn(
          name +
            ': postcss.plugin was deprecated. Migration guide:\n' +
            'https://evilmartians.com/chronicles/postcss-8-plugin-migration'
        );
        if (browser$1.env.LANG && browser$1.env.LANG.startsWith('cn')) {
          /* c8 ignore next 7 */
          // eslint-disable-next-line no-console
          console.warn(
            name +
              ': 里面 postcss.plugin 被弃用. 迁移指南:\n' +
              'https://www.w3ctech.com/topic/2226'
          );
        }
      }
      let transformer = initializer(...args);
      transformer.postcssPlugin = name;
      transformer.postcssVersion = new Processor().version;
      return transformer
    }

    let cache;
    Object.defineProperty(creator, 'postcss', {
      get() {
        if (!cache) cache = creator();
        return cache
      }
    });

    creator.process = function (css, processOpts, pluginOpts) {
      return postcss([creator(pluginOpts)]).process(css, processOpts)
    };

    return creator
  };

  postcss.stringify = stringify;
  postcss.parse = parse;
  postcss.fromJSON = fromJSON;
  postcss.list = list;

  postcss.comment = defaults => new Comment(defaults);
  postcss.atRule = defaults => new AtRule(defaults);
  postcss.decl = defaults => new Declaration(defaults);
  postcss.rule = defaults => new Rule(defaults);
  postcss.root = defaults => new Root(defaults);
  postcss.document = defaults => new Document(defaults);

  postcss.CssSyntaxError = CssSyntaxError;
  postcss.Declaration = Declaration;
  postcss.Container = Container;
  postcss.Processor = Processor;
  postcss.Document = Document;
  postcss.Comment = Comment;
  postcss.Warning = Warning;
  postcss.AtRule = AtRule;
  postcss.Result = Result;
  postcss.Input = Input;
  postcss.Rule = Rule;
  postcss.Root = Root;
  postcss.Node = Node;

  LazyResult.registerPostcss(postcss);

  var postcss_1 = postcss;
  postcss.default = postcss;

  const htmlparser = lib$5;
  const escapeStringRegexp = escapeStringRegexp$1;
  const { isPlainObject } = isPlainObject$2;
  const deepmerge = cjs;
  const parseSrcset = parseSrcset$1.exports;
  const { parse: postcssParse } = postcss_1;
  // Tags that can conceivably represent stand-alone media.
  const mediaTags = [
    'img', 'audio', 'video', 'picture', 'svg',
    'object', 'map', 'iframe', 'embed'
  ];
  // Tags that are inherently vulnerable to being used in XSS attacks.
  const vulnerableTags = [ 'script', 'style' ];

  function each(obj, cb) {
    if (obj) {
      Object.keys(obj).forEach(function (key) {
        cb(obj[key], key);
      });
    }
  }

  // Avoid false positives with .__proto__, .hasOwnProperty, etc.
  function has(obj, key) {
    return ({}).hasOwnProperty.call(obj, key);
  }

  // Returns those elements of `a` for which `cb(a)` returns truthy
  function filter(a, cb) {
    const n = [];
    each(a, function(v) {
      if (cb(v)) {
        n.push(v);
      }
    });
    return n;
  }

  function isEmptyObject(obj) {
    for (const key in obj) {
      if (has(obj, key)) {
        return false;
      }
    }
    return true;
  }

  function stringifySrcset(parsedSrcset) {
    return parsedSrcset.map(function(part) {
      if (!part.url) {
        throw new Error('URL missing');
      }

      return (
        part.url +
        (part.w ? ` ${part.w}w` : '') +
        (part.h ? ` ${part.h}h` : '') +
        (part.d ? ` ${part.d}x` : '')
      );
    }).join(', ');
  }

  var sanitizeHtml_1 = sanitizeHtml;

  // A valid attribute name.
  // We use a tolerant definition based on the set of strings defined by
  // html.spec.whatwg.org/multipage/parsing.html#before-attribute-name-state
  // and html.spec.whatwg.org/multipage/parsing.html#attribute-name-state .
  // The characters accepted are ones which can be appended to the attribute
  // name buffer without triggering a parse error:
  //   * unexpected-equals-sign-before-attribute-name
  //   * unexpected-null-character
  //   * unexpected-character-in-attribute-name
  // We exclude the empty string because it's impossible to get to the after
  // attribute name state with an empty attribute name buffer.
  const VALID_HTML_ATTRIBUTE_NAME = /^[^\0\t\n\f\r /<=>]+$/;

  // Ignore the _recursing flag; it's there for recursive
  // invocation as a guard against this exploit:
  // https://github.com/fb55/htmlparser2/issues/105

  function sanitizeHtml(html, options, _recursing) {
    if (html == null) {
      return '';
    }

    let result = '';
    // Used for hot swapping the result variable with an empty string in order to "capture" the text written to it.
    let tempResult = '';

    function Frame(tag, attribs) {
      const that = this;
      this.tag = tag;
      this.attribs = attribs || {};
      this.tagPosition = result.length;
      this.text = ''; // Node inner text
      this.mediaChildren = [];

      this.updateParentNodeText = function() {
        if (stack.length) {
          const parentFrame = stack[stack.length - 1];
          parentFrame.text += that.text;
        }
      };

      this.updateParentNodeMediaChildren = function() {
        if (stack.length && mediaTags.includes(this.tag)) {
          const parentFrame = stack[stack.length - 1];
          parentFrame.mediaChildren.push(this.tag);
        }
      };
    }

    options = Object.assign({}, sanitizeHtml.defaults, options);
    options.parser = Object.assign({}, htmlParserDefaults, options.parser);

    // vulnerableTags
    vulnerableTags.forEach(function (tag) {
      if (
        options.allowedTags && options.allowedTags.indexOf(tag) > -1 &&
        !options.allowVulnerableTags
      ) {
        console.warn(`\n\n⚠️ Your \`allowedTags\` option includes, \`${tag}\`, which is inherently\nvulnerable to XSS attacks. Please remove it from \`allowedTags\`.\nOr, to disable this warning, add the \`allowVulnerableTags\` option\nand ensure you are accounting for this risk.\n\n`);
      }
    });

    // Tags that contain something other than HTML, or where discarding
    // the text when the tag is disallowed makes sense for other reasons.
    // If we are not allowing these tags, we should drop their content too.
    // For other tags you would drop the tag but keep its content.
    const nonTextTagsArray = options.nonTextTags || [
      'script',
      'style',
      'textarea',
      'option'
    ];
    let allowedAttributesMap;
    let allowedAttributesGlobMap;
    if (options.allowedAttributes) {
      allowedAttributesMap = {};
      allowedAttributesGlobMap = {};
      each(options.allowedAttributes, function(attributes, tag) {
        allowedAttributesMap[tag] = [];
        const globRegex = [];
        attributes.forEach(function(obj) {
          if (typeof obj === 'string' && obj.indexOf('*') >= 0) {
            globRegex.push(escapeStringRegexp(obj).replace(/\\\*/g, '.*'));
          } else {
            allowedAttributesMap[tag].push(obj);
          }
        });
        if (globRegex.length) {
          allowedAttributesGlobMap[tag] = new RegExp('^(' + globRegex.join('|') + ')$');
        }
      });
    }
    const allowedClassesMap = {};
    const allowedClassesGlobMap = {};
    const allowedClassesRegexMap = {};
    each(options.allowedClasses, function(classes, tag) {
      // Implicitly allows the class attribute
      if (allowedAttributesMap) {
        if (!has(allowedAttributesMap, tag)) {
          allowedAttributesMap[tag] = [];
        }
        allowedAttributesMap[tag].push('class');
      }

      allowedClassesMap[tag] = [];
      allowedClassesRegexMap[tag] = [];
      const globRegex = [];
      classes.forEach(function(obj) {
        if (typeof obj === 'string' && obj.indexOf('*') >= 0) {
          globRegex.push(escapeStringRegexp(obj).replace(/\\\*/g, '.*'));
        } else if (obj instanceof RegExp) {
          allowedClassesRegexMap[tag].push(obj);
        } else {
          allowedClassesMap[tag].push(obj);
        }
      });
      if (globRegex.length) {
        allowedClassesGlobMap[tag] = new RegExp('^(' + globRegex.join('|') + ')$');
      }
    });

    const transformTagsMap = {};
    let transformTagsAll;
    each(options.transformTags, function(transform, tag) {
      let transFun;
      if (typeof transform === 'function') {
        transFun = transform;
      } else if (typeof transform === 'string') {
        transFun = sanitizeHtml.simpleTransform(transform);
      }
      if (tag === '*') {
        transformTagsAll = transFun;
      } else {
        transformTagsMap[tag] = transFun;
      }
    });

    let depth;
    let stack;
    let skipMap;
    let transformMap;
    let skipText;
    let skipTextDepth;
    let addedText = false;

    initializeState();

    const parser = new htmlparser.Parser({
      onopentag: function(name, attribs) {
        // If `enforceHtmlBoundary` is `true` and this has found the opening
        // `html` tag, reset the state.
        if (options.enforceHtmlBoundary && name === 'html') {
          initializeState();
        }

        if (skipText) {
          skipTextDepth++;
          return;
        }
        const frame = new Frame(name, attribs);
        stack.push(frame);

        let skip = false;
        const hasText = !!frame.text;
        let transformedTag;
        if (has(transformTagsMap, name)) {
          transformedTag = transformTagsMap[name](name, attribs);

          frame.attribs = attribs = transformedTag.attribs;

          if (transformedTag.text !== undefined) {
            frame.innerText = transformedTag.text;
          }

          if (name !== transformedTag.tagName) {
            frame.name = name = transformedTag.tagName;
            transformMap[depth] = transformedTag.tagName;
          }
        }
        if (transformTagsAll) {
          transformedTag = transformTagsAll(name, attribs);

          frame.attribs = attribs = transformedTag.attribs;
          if (name !== transformedTag.tagName) {
            frame.name = name = transformedTag.tagName;
            transformMap[depth] = transformedTag.tagName;
          }
        }

        if ((options.allowedTags && options.allowedTags.indexOf(name) === -1) || (options.disallowedTagsMode === 'recursiveEscape' && !isEmptyObject(skipMap)) || (options.nestingLimit != null && depth >= options.nestingLimit)) {
          skip = true;
          skipMap[depth] = true;
          if (options.disallowedTagsMode === 'discard') {
            if (nonTextTagsArray.indexOf(name) !== -1) {
              skipText = true;
              skipTextDepth = 1;
            }
          }
          skipMap[depth] = true;
        }
        depth++;
        if (skip) {
          if (options.disallowedTagsMode === 'discard') {
            // We want the contents but not this tag
            return;
          }
          tempResult = result;
          result = '';
        }
        result += '<' + name;

        if (name === 'script') {
          if (options.allowedScriptHostnames || options.allowedScriptDomains) {
            frame.innerText = '';
          }
        }

        if (!allowedAttributesMap || has(allowedAttributesMap, name) || allowedAttributesMap['*']) {
          each(attribs, function(value, a) {
            if (!VALID_HTML_ATTRIBUTE_NAME.test(a)) {
              // This prevents part of an attribute name in the output from being
              // interpreted as the end of an attribute, or end of a tag.
              delete frame.attribs[a];
              return;
            }
            let parsed;
            // check allowedAttributesMap for the element and attribute and modify the value
            // as necessary if there are specific values defined.
            let passedAllowedAttributesMapCheck = false;
            if (!allowedAttributesMap ||
              (has(allowedAttributesMap, name) && allowedAttributesMap[name].indexOf(a) !== -1) ||
              (allowedAttributesMap['*'] && allowedAttributesMap['*'].indexOf(a) !== -1) ||
              (has(allowedAttributesGlobMap, name) && allowedAttributesGlobMap[name].test(a)) ||
              (allowedAttributesGlobMap['*'] && allowedAttributesGlobMap['*'].test(a))) {
              passedAllowedAttributesMapCheck = true;
            } else if (allowedAttributesMap && allowedAttributesMap[name]) {
              for (const o of allowedAttributesMap[name]) {
                if (isPlainObject(o) && o.name && (o.name === a)) {
                  passedAllowedAttributesMapCheck = true;
                  let newValue = '';
                  if (o.multiple === true) {
                    // verify the values that are allowed
                    const splitStrArray = value.split(' ');
                    for (const s of splitStrArray) {
                      if (o.values.indexOf(s) !== -1) {
                        if (newValue === '') {
                          newValue = s;
                        } else {
                          newValue += ' ' + s;
                        }
                      }
                    }
                  } else if (o.values.indexOf(value) >= 0) {
                    // verified an allowed value matches the entire attribute value
                    newValue = value;
                  }
                  value = newValue;
                }
              }
            }
            if (passedAllowedAttributesMapCheck) {
              if (options.allowedSchemesAppliedToAttributes.indexOf(a) !== -1) {
                if (naughtyHref(name, value)) {
                  delete frame.attribs[a];
                  return;
                }
              }

              if (name === 'script' && a === 'src') {

                let allowed = true;

                try {
                  const parsed = new URL(value);

                  if (options.allowedScriptHostnames || options.allowedScriptDomains) {
                    const allowedHostname = (options.allowedScriptHostnames || []).find(function (hostname) {
                      return hostname === parsed.hostname;
                    });
                    const allowedDomain = (options.allowedScriptDomains || []).find(function(domain) {
                      return parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`);
                    });
                    allowed = allowedHostname || allowedDomain;
                  }
                } catch (e) {
                  allowed = false;
                }

                if (!allowed) {
                  delete frame.attribs[a];
                  return;
                }
              }

              if (name === 'iframe' && a === 'src') {
                let allowed = true;
                try {
                  // Chrome accepts \ as a substitute for / in the // at the
                  // start of a URL, so rewrite accordingly to prevent exploit.
                  // Also drop any whitespace at that point in the URL
                  value = value.replace(/^(\w+:)?\s*[\\/]\s*[\\/]/, '$1//');
                  if (value.startsWith('relative:')) {
                    // An attempt to exploit our workaround for base URLs being
                    // mandatory for relative URL validation in the WHATWG
                    // URL parser, reject it
                    throw new Error('relative: exploit attempt');
                  }
                  // naughtyHref is in charge of whether protocol relative URLs
                  // are cool. Here we are concerned just with allowed hostnames and
                  // whether to allow relative URLs.
                  //
                  // Build a placeholder "base URL" against which any reasonable
                  // relative URL may be parsed successfully
                  let base = 'relative://relative-site';
                  for (let i = 0; (i < 100); i++) {
                    base += `/${i}`;
                  }
                  const parsed = new URL(value, base);
                  const isRelativeUrl = parsed && parsed.hostname === 'relative-site' && parsed.protocol === 'relative:';
                  if (isRelativeUrl) {
                    // default value of allowIframeRelativeUrls is true
                    // unless allowedIframeHostnames or allowedIframeDomains specified
                    allowed = has(options, 'allowIframeRelativeUrls')
                      ? options.allowIframeRelativeUrls
                      : (!options.allowedIframeHostnames && !options.allowedIframeDomains);
                  } else if (options.allowedIframeHostnames || options.allowedIframeDomains) {
                    const allowedHostname = (options.allowedIframeHostnames || []).find(function (hostname) {
                      return hostname === parsed.hostname;
                    });
                    const allowedDomain = (options.allowedIframeDomains || []).find(function(domain) {
                      return parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`);
                    });
                    allowed = allowedHostname || allowedDomain;
                  }
                } catch (e) {
                  // Unparseable iframe src
                  allowed = false;
                }
                if (!allowed) {
                  delete frame.attribs[a];
                  return;
                }
              }
              if (a === 'srcset') {
                try {
                  parsed = parseSrcset(value);
                  parsed.forEach(function(value) {
                    if (naughtyHref('srcset', value.url)) {
                      value.evil = true;
                    }
                  });
                  parsed = filter(parsed, function(v) {
                    return !v.evil;
                  });
                  if (!parsed.length) {
                    delete frame.attribs[a];
                    return;
                  } else {
                    value = stringifySrcset(filter(parsed, function(v) {
                      return !v.evil;
                    }));
                    frame.attribs[a] = value;
                  }
                } catch (e) {
                  // Unparseable srcset
                  delete frame.attribs[a];
                  return;
                }
              }
              if (a === 'class') {
                const allowedSpecificClasses = allowedClassesMap[name];
                const allowedWildcardClasses = allowedClassesMap['*'];
                const allowedSpecificClassesGlob = allowedClassesGlobMap[name];
                const allowedSpecificClassesRegex = allowedClassesRegexMap[name];
                const allowedWildcardClassesGlob = allowedClassesGlobMap['*'];
                const allowedClassesGlobs = [
                  allowedSpecificClassesGlob,
                  allowedWildcardClassesGlob
                ]
                  .concat(allowedSpecificClassesRegex)
                  .filter(function (t) {
                    return t;
                  });
                if (allowedSpecificClasses && allowedWildcardClasses) {
                  value = filterClasses(value, deepmerge(allowedSpecificClasses, allowedWildcardClasses), allowedClassesGlobs);
                } else {
                  value = filterClasses(value, allowedSpecificClasses || allowedWildcardClasses, allowedClassesGlobs);
                }
                if (!value.length) {
                  delete frame.attribs[a];
                  return;
                }
              }
              if (a === 'style') {
                try {
                  const abstractSyntaxTree = postcssParse(name + ' {' + value + '}');
                  const filteredAST = filterCss(abstractSyntaxTree, options.allowedStyles);

                  value = stringifyStyleAttributes(filteredAST);

                  if (value.length === 0) {
                    delete frame.attribs[a];
                    return;
                  }
                } catch (e) {
                  delete frame.attribs[a];
                  return;
                }
              }
              result += ' ' + a;
              if (value && value.length) {
                result += '="' + escapeHtml(value, true) + '"';
              }
            } else {
              delete frame.attribs[a];
            }
          });
        }
        if (options.selfClosing.indexOf(name) !== -1) {
          result += ' />';
        } else {
          result += '>';
          if (frame.innerText && !hasText && !options.textFilter) {
            result += escapeHtml(frame.innerText);
            addedText = true;
          }
        }
        if (skip) {
          result = tempResult + escapeHtml(result);
          tempResult = '';
        }
      },
      ontext: function(text) {
        if (skipText) {
          return;
        }
        const lastFrame = stack[stack.length - 1];
        let tag;

        if (lastFrame) {
          tag = lastFrame.tag;
          // If inner text was set by transform function then let's use it
          text = lastFrame.innerText !== undefined ? lastFrame.innerText : text;
        }

        if (options.disallowedTagsMode === 'discard' && ((tag === 'script') || (tag === 'style'))) {
          // htmlparser2 gives us these as-is. Escaping them ruins the content. Allowing
          // script tags is, by definition, game over for XSS protection, so if that's
          // your concern, don't allow them. The same is essentially true for style tags
          // which have their own collection of XSS vectors.
          result += text;
        } else {
          const escaped = escapeHtml(text, false);
          if (options.textFilter && !addedText) {
            result += options.textFilter(escaped, tag);
          } else if (!addedText) {
            result += escaped;
          }
        }
        if (stack.length) {
          const frame = stack[stack.length - 1];
          frame.text += text;
        }
      },
      onclosetag: function(name) {

        if (skipText) {
          skipTextDepth--;
          if (!skipTextDepth) {
            skipText = false;
          } else {
            return;
          }
        }

        const frame = stack.pop();
        if (!frame) {
          // Do not crash on bad markup
          return;
        }
        skipText = options.enforceHtmlBoundary ? name === 'html' : false;
        depth--;
        const skip = skipMap[depth];
        if (skip) {
          delete skipMap[depth];
          if (options.disallowedTagsMode === 'discard') {
            frame.updateParentNodeText();
            return;
          }
          tempResult = result;
          result = '';
        }

        if (transformMap[depth]) {
          name = transformMap[depth];
          delete transformMap[depth];
        }

        if (options.exclusiveFilter && options.exclusiveFilter(frame)) {
          result = result.substr(0, frame.tagPosition);
          return;
        }

        frame.updateParentNodeMediaChildren();
        frame.updateParentNodeText();

        if (options.selfClosing.indexOf(name) !== -1) {
          // Already output />
          if (skip) {
            result = tempResult;
            tempResult = '';
          }
          return;
        }

        result += '</' + name + '>';
        if (skip) {
          result = tempResult + escapeHtml(result);
          tempResult = '';
        }
        addedText = false;
      }
    }, options.parser);
    parser.write(html);
    parser.end();

    return result;

    function initializeState() {
      result = '';
      depth = 0;
      stack = [];
      skipMap = {};
      transformMap = {};
      skipText = false;
      skipTextDepth = 0;
    }

    function escapeHtml(s, quote) {
      if (typeof (s) !== 'string') {
        s = s + '';
      }
      if (options.parser.decodeEntities) {
        s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (quote) {
          s = s.replace(/"/g, '&quot;');
        }
      }
      // TODO: this is inadequate because it will pass `&0;`. This approach
      // will not work, each & must be considered with regard to whether it
      // is followed by a 100% syntactically valid entity or not, and escaped
      // if it is not. If this bothers you, don't set parser.decodeEntities
      // to false. (The default is true.)
      s = s.replace(/&(?![a-zA-Z0-9#]{1,20};)/g, '&amp;') // Match ampersands not part of existing HTML entity
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      if (quote) {
        s = s.replace(/"/g, '&quot;');
      }
      return s;
    }

    function naughtyHref(name, href) {
      // Browsers ignore character codes of 32 (space) and below in a surprising
      // number of situations. Start reading here:
      // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab
      // eslint-disable-next-line no-control-regex
      href = href.replace(/[\x00-\x20]+/g, '');
      // Clobber any comments in URLs, which the browser might
      // interpret inside an XML data island, allowing
      // a javascript: URL to be snuck through
      href = href.replace(/<!--.*?-->/g, '');
      // Case insensitive so we don't get faked out by JAVASCRIPT #1
      // Allow more characters after the first so we don't get faked
      // out by certain schemes browsers accept
      const matches = href.match(/^([a-zA-Z][a-zA-Z0-9.\-+]*):/);
      if (!matches) {
        // Protocol-relative URL starting with any combination of '/' and '\'
        if (href.match(/^[/\\]{2}/)) {
          return !options.allowProtocolRelative;
        }

        // No scheme
        return false;
      }
      const scheme = matches[1].toLowerCase();

      if (has(options.allowedSchemesByTag, name)) {
        return options.allowedSchemesByTag[name].indexOf(scheme) === -1;
      }

      return !options.allowedSchemes || options.allowedSchemes.indexOf(scheme) === -1;
    }

    /**
     * Filters user input css properties by allowlisted regex attributes.
     * Modifies the abstractSyntaxTree object.
     *
     * @param {object} abstractSyntaxTree  - Object representation of CSS attributes.
     * @property {array[Declaration]} abstractSyntaxTree.nodes[0] - Each object cointains prop and value key, i.e { prop: 'color', value: 'red' }.
     * @param {object} allowedStyles       - Keys are properties (i.e color), value is list of permitted regex rules (i.e /green/i).
     * @return {object}                    - The modified tree.
     */
    function filterCss(abstractSyntaxTree, allowedStyles) {
      if (!allowedStyles) {
        return abstractSyntaxTree;
      }

      const astRules = abstractSyntaxTree.nodes[0];
      let selectedRule;

      // Merge global and tag-specific styles into new AST.
      if (allowedStyles[astRules.selector] && allowedStyles['*']) {
        selectedRule = deepmerge(
          allowedStyles[astRules.selector],
          allowedStyles['*']
        );
      } else {
        selectedRule = allowedStyles[astRules.selector] || allowedStyles['*'];
      }

      if (selectedRule) {
        abstractSyntaxTree.nodes[0].nodes = astRules.nodes.reduce(filterDeclarations(selectedRule), []);
      }

      return abstractSyntaxTree;
    }

    /**
     * Extracts the style attributes from an AbstractSyntaxTree and formats those
     * values in the inline style attribute format.
     *
     * @param  {AbstractSyntaxTree} filteredAST
     * @return {string}             - Example: "color:yellow;text-align:center !important;font-family:helvetica;"
     */
    function stringifyStyleAttributes(filteredAST) {
      return filteredAST.nodes[0].nodes
        .reduce(function(extractedAttributes, attrObject) {
          extractedAttributes.push(
            `${attrObject.prop}:${attrObject.value}${attrObject.important ? ' !important' : ''}`
          );
          return extractedAttributes;
        }, [])
        .join(';');
    }

    /**
      * Filters the existing attributes for the given property. Discards any attributes
      * which don't match the allowlist.
      *
      * @param  {object} selectedRule             - Example: { color: red, font-family: helvetica }
      * @param  {array} allowedDeclarationsList   - List of declarations which pass the allowlist.
      * @param  {object} attributeObject          - Object representing the current css property.
      * @property {string} attributeObject.type   - Typically 'declaration'.
      * @property {string} attributeObject.prop   - The CSS property, i.e 'color'.
      * @property {string} attributeObject.value  - The corresponding value to the css property, i.e 'red'.
      * @return {function}                        - When used in Array.reduce, will return an array of Declaration objects
      */
    function filterDeclarations(selectedRule) {
      return function (allowedDeclarationsList, attributeObject) {
        // If this property is allowlisted...
        if (has(selectedRule, attributeObject.prop)) {
          const matchesRegex = selectedRule[attributeObject.prop].some(function(regularExpression) {
            return regularExpression.test(attributeObject.value);
          });

          if (matchesRegex) {
            allowedDeclarationsList.push(attributeObject);
          }
        }
        return allowedDeclarationsList;
      };
    }

    function filterClasses(classes, allowed, allowedGlobs) {
      if (!allowed) {
        // The class attribute is allowed without filtering on this tag
        return classes;
      }
      classes = classes.split(/\s+/);
      return classes.filter(function(clss) {
        return allowed.indexOf(clss) !== -1 || allowedGlobs.some(function(glob) {
          return glob.test(clss);
        });
      }).join(' ');
    }
  }

  // Defaults are accessible to you so that you can use them as a starting point
  // programmatically if you wish

  const htmlParserDefaults = {
    decodeEntities: true
  };
  sanitizeHtml.defaults = {
    allowedTags: [
      // Sections derived from MDN element categories and limited to the more
      // benign categories.
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element
      // Content sectioning
      'address', 'article', 'aside', 'footer', 'header',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup',
      'main', 'nav', 'section',
      // Text content
      'blockquote', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure',
      'hr', 'li', 'main', 'ol', 'p', 'pre', 'ul',
      // Inline text semantics
      'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn',
      'em', 'i', 'kbd', 'mark', 'q',
      'rb', 'rp', 'rt', 'rtc', 'ruby',
      's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr',
      // Table content
      'caption', 'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th',
      'thead', 'tr'
    ],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
      a: [ 'href', 'name', 'target' ],
      // We don't currently allow img itself by default, but
      // these attributes would make sense if we did.
      img: [ 'src', 'srcset', 'alt', 'title', 'width', 'height', 'loading' ]
    },
    // Lots of these won't come up by default because we don't allow them
    selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
    // URL schemes we permit
    allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'tel' ],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
    allowProtocolRelative: true,
    enforceHtmlBoundary: false
  };

  sanitizeHtml.simpleTransform = function(newTagName, newAttribs, merge) {
    merge = (merge === undefined) ? true : merge;
    newAttribs = newAttribs || {};

    return function(tagName, attribs) {
      let attrib;
      if (merge) {
        for (attrib in newAttribs) {
          attribs[attrib] = newAttribs[attrib];
        }
      } else {
        attribs = newAttribs;
      }

      return {
        tagName: newTagName,
        attribs: attribs
      };
    };
  };

  var sanitizeHtml$1 = sanitizeHtml_1;

  // Update config not to allow table related tags
  const disallowedTags = ["table", "tbody", "td", "tfoot", "th", "thead", "tr"];
  const allowedTags = sanitizeHtml$1.defaults.allowedTags.filter(tag => !disallowedTags.includes(tag));

  const TYPE_AUTONUMBER = 'autonumber';
  const HEADER_AUTONUMBER = '#';

  /**
   * Create table object from source.
   * @param {Object} source Table source.
   * @returns {{ headers: Header[], rows: Row[]}} Table object.
   */
  const parseTable = (source) => {
    const table = {
      headers: generateHeader(source.headers),
      rows: [],
    };

    table.rows.push(...generateRows(table.headers, source.rows));

    return table
  };

  /**
   * Generate header object.
   * @param {Object} headers Source data to convert to table
   * @returns {Header[]} Header object
   */
  function generateHeader(headers) {
    return headers.map(key => {
      const header = {
        label: (!!key.allowHtmlHeader ? sanitize(key.label) : escapeAll(key.label)) || '',
        source: key.source || '',
        allowHtmlHeader: !!key.allowHtmlHeader,
        allowHtmlContent: !!key.allowHtmlContent,
        type: key.type,
        align: key.align,
      };

      // Special column: auto numbering
      if (key.type === TYPE_AUTONUMBER) {
        header.label = header.label || HEADER_AUTONUMBER;
        header.startFrom = key.startFrom || 1;
        header.__autonumber__ = header.startFrom;
      }

      // Remove undefined keys
      Object.keys(header).forEach((k) => header[k] == null && delete header[k]);
      return header
    })
  }

  /**
   * 
   * @param {Header[]} headers Header list
   * @param {Object[]} rows Row sources
   * @returns {Cell[]} Row objects
   */
  function generateRows(headers, rows) {
    return (rows || []).map(source =>
      headers.map(head => {
        function getContent() {
          // Raw column: rendering as HTML (not secure)
          if (head.allowHtmlContent) {
            return sanitize(source[head.source]) || ''
      
          // Auto numbering column
          } else if (head.type === TYPE_AUTONUMBER) {
            return (head.__autonumber__++).toString()
          }
    
          // Standard column: rendering as text
          return escapeAll(source[head.source]) || ''
        }
        const cell = {
          content: getContent(),
          align: head.align,
        };
        // Remove undefined keys
        Object.keys(cell).forEach((k) => cell[k] == null && delete cell[k]);
        return cell
      })
    )
  }

  /** Sanitize with custom configuration. */
  function sanitize(dirty) {
    return sanitizeHtml$1(dirty, { allowedTags })
  }
  /** Escape all tags. */
  function escapeAll(dirty) {
    return sanitizeHtml$1(dirty, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'escape',
    })
  }

  const convert2table = (yaml) => {
    let data;
    try {
      data = jsYaml.load(yaml);
    } catch (err) {
      console.error(err);
      return null
    }
    // Most markdown parser requires header.
    if (!data || !data.headers || !data.rows) {
      return null
    }

    const tableData = parseTable(data);
    if (tableData.headers.length === 0) return null

    // header
    return `| ${tableData.headers.map(h => h.label).join(' | ')} |\n`
      // separator
      + `|${tableData.headers.map(h =>
      h.align === 'left' ? ':---'
      : h.align === 'center' ? ':--:'
      : h.align === 'right' ? '---:'
      : '----'
    ).join('|')}|\n`
      // rows
      + tableData.rows.map(r => 
          `| ${r.map(cell =>
          cell.content.replaceAll('\n','<br/>').replaceAll('|', '\\|')
        ).join(' | ')} |`
        ).join('\n')
  };

  const LANG = 'yamltable';

  const docsifyYamlTablePlugin = (hook, vm) => {
    hook.beforeEach(function(content) {
      // get yamltable code blocks
      var regexp = new RegExp("^(```|~~~)(?:" + LANG + ")?\\n([\\s\\S]+?)\\1", "gm");

      // replace matched blocks
      return content.replace(regexp, function(matched, capture1, capture2){
        // matched is matched string. will return this when failing to convert.
        // capture1 is ``` or ~~~, not used.
        // capture2 is content of the matched code block.
        var convertedTable = convert2table(capture2);
        return !!convertedTable ? convertedTable : matched
      })
    });
  };

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat([docsifyYamlTablePlugin]);

})();
