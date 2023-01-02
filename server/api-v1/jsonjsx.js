const isString = (val) => typeof val === 'string';
const isNumber = (val) => typeof val === 'number';
const isBoolean = (val) => typeof val === 'boolean';
const isObject = (val) => typeof val === 'object';
const isArray = (val) => typeof val === 'object' && Number(val.length) + 1 > 0;
const isFunction = (val) => typeof val === 'function';
const isUndefined = (val) => typeof val === 'undefined';

function arrToStr(arr) {
  if (!isArray(arr)) return '';
  let arrStr = '[';
  arr.forEach((item, index) => {
    if (isString(item)) {
      // adding escape sequences for security
      if (item.includes('"')) item = item.replace('"', '\\"');
      arrStr += `"${item}"`;
    } else if (isBoolean(item) || isNumber(item)) arrStr += item;
    else if (isObject(item)) arrStr += objToStr(item);
    else if (isArray(item)) arrStr += arrToStr(item);
    const isLastItem = index === arr.length - 1;
    arrStr += isLastItem ? '' : ',';
  });
  arrStr += ']';
  return arrStr;
}

function objToStr(obj) {
  if (!isObject(obj)) return '';
  let str = '{';
  Object.keys(obj).forEach((key, index) => {
    const val = obj[key];
    if (isString(val)) {
      // adding escape sequences for security
      if (val.includes('"')) val = val.replace('"', '\\"');
      str += `${key}:"${val}"`;
    } else if (isNumber(val) || isBoolean(val)) str += `${key}:${val}`;
    else if (isArray(val)) str += arrToStr(val);
    else if (val?.As && isString(val.As)) str += `${key}:${val.As}`;
    else if (isObject(val)) str += objToStr(val);
    str += index === Object.keys(obj).length - 1 ? '' : ',';
  });
  str += '}';
  return str;
}

function JSONJSX(obj) {
  if (!isObject(obj)) return obj;
  let str = `<${obj.type || ''}`;
  if (isObject(obj.props)) {
    Object.keys(obj.props).forEach((key) => {
      let propStr = key + '=';
      if (isUndefined(obj.props[key])) return;
      if (isString(obj.props[key])) propStr += '{`' + obj.props[key] + '`}'; // abc={`hi`}
      else if (isNumber(obj.props[key])) propStr += '{' + obj.props[key] + '}'; // abc={3}
      else if (isBoolean(obj.props[key])) propStr += '{' + obj.props[key] + '}'; // abc={true}
      else if (isObject(obj.props[key])) {
        if (obj.props[key].As && isString(obj.props[key].As))
          propStr += '{' + obj.props[key].As + '}'; // todo={Todos[i]}
        else propStr += '{' + objToStr(obj.props[key]) + '}'; // style={{hi: there}}
      } else if (isFunction(obj.props[key])) propStr += '{' + obj.props[key].toString() + '}'; // abc={true}
      str += ` ${propStr}`;
    });
  }
  if (isUndefined(obj.children)) {
    str += ' />';
    return str;
  }

  str += '>';
  if (isArray(obj.children)) {
    // children is an array
    obj.children.forEach((child) => {
      str += JSONJSX(child);
    });
  } else if (isObject(obj.children)) {
    // children is an object
    str += JSONJSX(obj.children);
  } else str += obj.children;
  str += `</${obj.type || ''}>`;
  return str;
}

function generateRFC(data) {
  const { imports, beforeBody, name, body, jsonjsx, exports } = data;
  if (!name || typeof name !== 'string') throw new Error('Name is invalid');
  if (body && typeof body !== 'string') throw new Error('Body is invalid');
  let str = '';
  if (isObject(imports)) {
    Object.keys(imports).forEach((imp) => {
      let importStr = 'import ' + imp + ' ';
      if (imports[imp].as && isString(imports[imp].as)) importStr += 'as ' + imports[imp].as + ' ';
      if (isString(imports[imp].from)) {
        importStr += `from "${imports[imp].from}"`;
        str += importStr + ';';
      }
    });
  }
  if (isString(beforeBody)) str += beforeBody;
  str += `function ${name}(){${body || ''} return ${JSONJSX(jsonjsx)}; }`;
  if (isArray(exports)) {
    exports.forEach((exp) => {
      if (isString(exp)) str += `export ${exp};`;
    });
  }
  str += `export default ${name};`;
  return str;
}

function generatePlainRFC(data) {
  const { name, body, jsonjsx } = data;
  if (!name || typeof name !== 'string') throw new Error('Name is invalid');
  if (body && typeof body !== 'string') throw new Error('Body is invalid');
  let str = '';
  str += `function ${name}(){${body || ''} return ${JSONJSX(jsonjsx)}; }`;
  return str;
}

module.exports = {
  generatePlainRFC,
  generateRFC,
  JSONJSX,
  objToStr,
  arrToStr,
};
