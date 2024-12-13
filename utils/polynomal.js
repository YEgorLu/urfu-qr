const galiosField = require("./galios-field");
const cloneDeep = require('lodash/cloneDeep')

function multiplyByScalar(p, x) {
  const result = new Array(p.length).fill(0);
  for (let i = 0; i < p.length; i++) {
    result[i] = galiosField.multiplyByLog(p[i], x);
  }
  return result
}

function add(p, q) {
    const maxLen = Math.max(p.length, q.length)
    const result = new Array(maxLen).fill(0)

    for (let i = 0; i < p.length; i++) {
        result[i + maxLen - p.length] = p[i]
    }

    for (let i = 0; i < q.length; i++) {
      result[i + maxLen - q.length] ^= q[i];
    }

    return result
}

function multiply (p, q) {
    const result = new Array(p.length + q.length - 1).fill(0)
    for (let j = 0; j < q.length; j++) {
        for (let i = 0; i < p.length; i++) {
            result[i+j] ^= galiosField.multiplyByLog(p[i], q[j])
        }
    }
    return result
}

function div (devidend, divisor) {
    const out = cloneDeep(devidend)
    for (let i = 0; i < devidend.length - divisor.length + 1; i++) {
        if (out[i] === 0) continue

        for (let j = 1; j < divisor.length; j++) {
            if (divisor[j] === 0) continue

            out[i + j] ^= galiosField.multiplyByLog(divisor[j], out[i]);
        }
    }
    let separator = 1 - divisor.length
    debugger
    if (separator < 0) {
        separator = out.length + separator
    }
    debugger
    return out.reduce((res, cur, i) => {
        if (i < separator) {
            res[0].push(cur)
        } else {
            res[1].push(cur)
        }
        return res
    }, [[], []])
}

function eval (polynomal, x) {
    let y = polynomal[0]
    for (let i = 1; i < polynomal.length; i++) {
        y = galiosField.multiplyByLog(y, x) ^ polynomal[i] 
    }
    return y
}

module.exports = {
    add,
    multiply,
    multiplyByScalar,
    eval,
    div
}
