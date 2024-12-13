const PRIMITIVE_POLINOMAL = 0b100011101; // 285
const CORNET_LOG_NUMBER = 0x100; // 256
const LOG_TABLE_CAPACITY = 256;

const EXP_TABLE = new Array(2 * LOG_TABLE_CAPACITY);
const LOG_TABLE = new Array(LOG_TABLE_CAPACITY);

function getLogTableValue(x) {
    if (x < 0) {
        x = LOG_TABLE_CAPACITY + x
    }
    if (x >= LOG_TABLE_CAPACITY) {
        x = x % LOG_TABLE_CAPACITY
    }
    return LOG_TABLE[x]
}

function getExpTableValue(x) {
    if (x < 0) {
      x = 2 *LOG_TABLE_CAPACITY + x;
    }
    if (x >= 2 *LOG_TABLE_CAPACITY) {
      x = x % (2 * LOG_TABLE_CAPACITY);
    }
    return EXP_TABLE[x];
}

let tablesInitted = false;
function initTables() {
  if (tablesInitted) {
    return;
  }
  tablesInitted = true;
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;

    x <<= 1; // multiply by 2

    // The QR code specification says to use byte-wise modulo 100011101 arithmetic.
    // This means that when a number is 256 or larger, it should be XORed with 0x11D.
    if (x & CORNET_LOG_NUMBER) {
      // similar to x >= 256, but a lot faster (because 0x100 == 256)
      x ^= PRIMITIVE_POLINOMAL;
    }
  }

  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
}

function multiplyByLog(x, y) {
    initTables()
  if (x === 0 || y === 0) return 0;
  return getExpTableValue(getLogTableValue(x) + getLogTableValue(y));
}

function divByLog(x, y) {
    if (y === 0) throw new Error('Zero division')
    initTables()
    return getExpTableValue((getLogTableValue(x) + 255 - getLogTableValue(y)) % 255)
}

function powerByLog(x, power) {
    initTables()
    return getExpTableValue((getLogTableValue(x) * power) % 255)
}

function inverseByLog(x) {
    initTables()
    return getExpTableValue(255 - getLogTableValue(x));
}

function add(x, y) {
    return x ^ y
}

module.exports = {
  multiplyByLog,
  divByLog,
  powerByLog,
  divByLog,
  inverseByLog,
  add,
};
