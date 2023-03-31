"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.crypto = exports.TextEncoder = void 0;
exports.setCrypto = setCrypto;
exports.setTextEncoder = setTextEncoder;
exports.subtleCrypto = void 0;
var _logger = require("../logger");
var _global$window, _global$window$crypto, _global$window2, _global$window2$crypt, _global$window3, _global$window3$crypt, _global$window4;
let crypto = (_global$window = global.window) === null || _global$window === void 0 ? void 0 : _global$window.crypto;
exports.crypto = crypto;
let subtleCrypto = (_global$window$crypto = (_global$window2 = global.window) === null || _global$window2 === void 0 ? void 0 : (_global$window2$crypt = _global$window2.crypto) === null || _global$window2$crypt === void 0 ? void 0 : _global$window2$crypt.subtle) !== null && _global$window$crypto !== void 0 ? _global$window$crypto : (_global$window3 = global.window) === null || _global$window3 === void 0 ? void 0 : (_global$window3$crypt = _global$window3.crypto) === null || _global$window3$crypt === void 0 ? void 0 : _global$window3$crypt.webkitSubtle;
exports.subtleCrypto = subtleCrypto;
let TextEncoder = (_global$window4 = global.window) === null || _global$window4 === void 0 ? void 0 : _global$window4.TextEncoder;

/* eslint-disable @typescript-eslint/no-var-requires */
exports.TextEncoder = TextEncoder;
if (!crypto) {
  try {
    exports.crypto = crypto = require("crypto").webcrypto;
  } catch (e) {
    _logger.logger.error("Failed to load webcrypto", e);
  }
}
if (!subtleCrypto) {
  var _crypto2;
  exports.subtleCrypto = subtleCrypto = (_crypto2 = crypto) === null || _crypto2 === void 0 ? void 0 : _crypto2.subtle;
}
if (!TextEncoder) {
  try {
    exports.TextEncoder = TextEncoder = require("util").TextEncoder;
  } catch (e) {
    _logger.logger.error("Failed to load TextEncoder util", e);
  }
}
/* eslint-enable @typescript-eslint/no-var-requires */

function setCrypto(_crypto) {
  var _crypto$subtle;
  exports.crypto = crypto = _crypto;
  exports.subtleCrypto = subtleCrypto = (_crypto$subtle = _crypto.subtle) !== null && _crypto$subtle !== void 0 ? _crypto$subtle : _crypto.webkitSubtle;
}
function setTextEncoder(_TextEncoder) {
  exports.TextEncoder = TextEncoder = _TextEncoder;
}
//# sourceMappingURL=crypto.js.map