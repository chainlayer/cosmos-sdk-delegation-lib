"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ledgerCosmosJs = _interopRequireWildcard(require("ledger-cosmos-js"));

var _iris = _interopRequireDefault(require("./iris"));

var _secp256k = _interopRequireDefault(require("secp256k1"));

var _axios = _interopRequireDefault(require("axios"));

var _big = _interopRequireDefault(require("big.js"));

var _CosmosDelegateTool = require("./CosmosDelegateTool");

/** ******************************************************************************
 *  (c) 2019 ChainLayer
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */
_big["default"].PE = 30;
var defaultHrp = 'iaa';

function wrapError(cdt, e) {
  try {
    // eslint-disable-next-line no-param-reassign
    var errMessage = '';

    if (typeof e.response === 'undefined') {
      errMessage = e.message;
    } else {
      errMessage = e.response.data.error;
    } // eslint-disable-next-line no-param-reassign


    cdt.lastError = errMessage;
    return {
      error: errMessage
    };
  } catch (e2) {
    // eslint-disable-next-line no-param-reassign
    cdt.lastError = "".concat(e.message, "  ").concat(e2.message);
    return {
      error: "".concat(e.message, "  ").concat(e2.message)
    };
  }
}

function nodeURL(cdt) {
  if (typeof cdt.resturl === 'undefined' || cdt.resturl === null) {
    throw new Error('Node URL has not been defined');
  }

  return cdt.resturl;
}

function connectedOrThrow(cdt) {
  if (!cdt.connected) {
    this.lastError = 'Device is not connected';
    throw new Error('Device is not connected');
  }
}

var IrisDelegateTool = function IrisDelegateTool(transport) {
  // eslint-disable-next-line camelcase
  this.connected = false;
  this.lastError = 'No error';
  this.checkAppInfo = false;
  this.transportDebug = false;
  this.transport = transport;
  this.resturl = null;
  this.requiredVersionMajor = 1;
  this.requiredVersionMinor = 1;
  this.hrp = defaultHrp;
}; // eslint-disable-next-line no-unused-vars


IrisDelegateTool.prototype.getHrp = function () {
  return defaultHrp;
}; // eslint-disable-next-line no-unused-vars


IrisDelegateTool.prototype.getDefaultDenom = function () {
  return _iris["default"].DEFAULT_DENOM; // 'iris-atto'
}; // eslint-disable-next-line no-unused-vars


IrisDelegateTool.prototype.setNodeURL = function (resturl) {
  this.resturl = resturl;
}; // eslint-disable-next-line no-unused-vars


IrisDelegateTool.prototype.setHrp = function (hrp) {
  this.hrp = hrp;
}; // Detect when a ledger device is connected and verify the cosmos app is running.


IrisDelegateTool.prototype.connect =
/*#__PURE__*/
(0, _asyncToGenerator2["default"])(
/*#__PURE__*/
_regenerator["default"].mark(function _callee() {
  var appInfo, version, major, minor;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          this.connected = false;
          this.lastError = null;
          this.app = new _ledgerCosmosJs["default"](this.transport);

          if (!this.checkAppInfo) {
            _context.next = 15;
            break;
          }

          _context.next = 6;
          return this.app.appInfo();

        case 6:
          appInfo = _context.sent;

          if (!(appInfo.return_code !== 0x9000)) {
            _context.next = 10;
            break;
          }

          this.lastError = appInfo.error_message;
          throw new Error(appInfo.error_message);

        case 10:
          appInfo.appName = appInfo.appName || '?';
          console.log("Detected app ".concat(appInfo.appName, " ").concat(appInfo.appVersion));

          if (!(appInfo.appName.toLowerCase() !== 'cosmos')) {
            _context.next = 15;
            break;
          }

          this.lastError = "Incorrect app detected ".concat(appInfo.appName.toString());
          return _context.abrupt("return", false);

        case 15:
          _context.next = 17;
          return this.app.getVersion();

        case 17:
          version = _context.sent;

          if (!(version.return_code !== 0x9000)) {
            _context.next = 21;
            break;
          }

          this.lastError = version.error_message;
          throw new Error(version.error_message);

        case 21:
          major = version.major || 0;
          minor = version.minor || 0;

          if (!(major < this.requiredVersionMajor || minor < this.requiredVersionMinor)) {
            _context.next = 26;
            break;
          }

          this.lastError = 'Version not supported';
          return _context.abrupt("return", false);

        case 26:
          // Mark as connected
          this.connected = true;
          return _context.abrupt("return", this.connected);

        case 28:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
})); // Returns a signed transaction ready to be relayed

IrisDelegateTool.prototype.sign =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(unsignedTx, txContext) {
    var bytesToSign, response, sig;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            connectedOrThrow(this);

            if (!(typeof txContext.path === 'undefined')) {
              _context2.next = 4;
              break;
            }

            this.lastError = 'context should include the account path';
            throw new Error('context should include the account path');

          case 4:
            bytesToSign = _iris["default"].getBytesToSign(unsignedTx, txContext);
            console.log(bytesToSign);
            _context2.next = 8;
            return this.app.sign(txContext.path, bytesToSign);

          case 8:
            response = _context2.sent;

            if (!(response.return_code !== 0x9000)) {
              _context2.next = 12;
              break;
            }

            this.lastError = response.error_message;
            throw new Error(response.error_message);

          case 12:
            sig = _secp256k["default"].signatureImport(response.signature);
            return _context2.abrupt("return", _iris["default"].applySignature(unsignedTx, txContext, sig));

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}(); // Retrieve public key and bech32 address


IrisDelegateTool.prototype.retrieveAddress =
/*#__PURE__*/
function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3(account, index) {
    var path, pk;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            connectedOrThrow(this);
            path = [44, 118, account, 0, index];
            _context3.next = 4;
            return this.app.publicKey(path);

          case 4:
            pk = _context3.sent;

            if (!(pk.return_code !== 0x9000)) {
              _context3.next = 8;
              break;
            }

            this.lastError = pk.error_message;
            throw new Error(pk.error_message);

          case 8:
            return _context3.abrupt("return", {
              pk: pk.compressed_pk.toString('hex'),
              path: path,
              bech32: (0, _ledgerCosmosJs.getBech32FromPK)(this.hrp, pk.compressed_pk)
            });

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}(); // Scan multiple address in a derivation path range (44’/118’/X/0/Y)
// eslint-disable-next-line max-len


IrisDelegateTool.prototype.scanAddresses =
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee4(minAccount, maxAccount, minIndex, maxIndex) {
    var answer, account, index, tmp;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            answer = [];
            account = minAccount;

          case 2:
            if (!(account < maxAccount + 1)) {
              _context4.next = 15;
              break;
            }

            index = minIndex;

          case 4:
            if (!(index < maxIndex + 1)) {
              _context4.next = 12;
              break;
            }

            _context4.next = 7;
            return this.retrieveAddress(account, index);

          case 7:
            tmp = _context4.sent;
            answer.push(tmp);

          case 9:
            index += 1;
            _context4.next = 4;
            break;

          case 12:
            account += 1;
            _context4.next = 2;
            break;

          case 15:
            return _context4.abrupt("return", answer);

          case 16:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function (_x5, _x6, _x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

IrisDelegateTool.prototype.retrieveValidators =
/*#__PURE__*/
(0, _asyncToGenerator2["default"])(
/*#__PURE__*/
_regenerator["default"].mark(function _callee5() {
  var _this = this;

  var url;
  return _regenerator["default"].wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          url = "".concat(nodeURL(this), "/stake/validators");
          return _context5.abrupt("return", _axios["default"].get(url).then(function (r) {
            var validators = {};

            for (var i = 0; i < r.data.length; i += 1) {
              var validatorData = {};
              var t = r.data[i];
              validatorData.tokens = (0, _big["default"])(t.tokens);
              validatorData.totalShares = (0, _big["default"])(t.delegator_shares);
              validators[t.operator_address] = validatorData;
            }

            return validators;
          }, function (e) {
            return wrapError(_this, e);
          }));

        case 2:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5, this);
}));

IrisDelegateTool.prototype.getAccountInfo =
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee6(addr) {
    var _this2 = this;

    var url, txContext;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            url = "".concat(nodeURL(this), "/bank/accounts/").concat(addr.bech32);
            txContext = {
              sequence: '0',
              accountNumber: '0',
              balance: '0'
            };
            return _context6.abrupt("return", _axios["default"].get(url).then(function (r) {
              try {
                if (typeof r.data !== 'undefined' && typeof r.data.value !== 'undefined') {
                  txContext.sequence = Number(r.data.value.sequence).toString();
                  txContext.accountNumber = Number(r.data.value.account_number).toString();

                  if (r.data.value.coins !== null) {
                    var tmp = r.data.value.coins.filter(function (x) {
                      return x.denom === _iris["default"].DEFAULT_DENOM;
                    });

                    if (tmp.length > 0) {
                      txContext.balance = (0, _big["default"])(tmp[0].amount).toString();
                    }
                  }
                }
              } catch (e) {
                console.log('Error ', e, ' returning defaults');
              }

              return txContext;
            }, function (e) {
              return wrapError(_this2, e);
            }));

          case 3:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function (_x9) {
    return _ref6.apply(this, arguments);
  };
}();

IrisDelegateTool.prototype.getAccountDelegations =
/*#__PURE__*/
function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee7(validators, addr) {
    var _this3 = this;

    var url;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            url = "".concat(nodeURL(this), "/stake/delegators/").concat(addr.bech32, "/delegations");
            return _context7.abrupt("return", _axios["default"].get(url).then(function (r) {
              var txContext = {
                delegations: {},
                delegationsTotal: '0'
              };
              var delegations = {};
              var totalDelegation = (0, _big["default"])(0);

              try {
                if (typeof r.data !== 'undefined' && r.data !== null) {
                  for (var i = 0; i < r.data.length; i += 1) {
                    var t = r.data[i];
                    var valAddr = t.validator_addr;

                    if (valAddr in validators) {
                      var shares = (0, _big["default"])(t.shares);
                      var valData = validators[valAddr];
                      var valTokens = valData.tokens;
                      var valTotalShares = valData.totalShares;
                      var tokens = shares.times(valTokens).div(valTotalShares);
                      delegations[valAddr] = {
                        irisatto: tokens.toString(),
                        shares: shares.toString()
                      };
                      totalDelegation = totalDelegation.add(tokens);
                    }
                  }
                }
              } catch (e) {
                console.log('Error ', e, ' returning defaults');
              }

              txContext.delegations = delegations;
              txContext.delegationsTotal = totalDelegation.toString();
              return txContext;
            }, function (e) {
              return wrapError(_this3, e);
            }));

          case 2:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function (_x10, _x11) {
    return _ref7.apply(this, arguments);
  };
}(); // Retrieve atom balances from the network for a list of account
// Retrieve delegated/not-delegated balances for each account


IrisDelegateTool.prototype.retrieveBalances =
/*#__PURE__*/
function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee9(addressList) {
    var _this4 = this;

    var validators, requestsBalance, requestsDelegations, balances, delegations, reply, i;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return this.retrieveValidators();

          case 2:
            validators = _context9.sent;
            // Get all balances
            requestsBalance = addressList.map(
            /*#__PURE__*/
            function () {
              var _ref9 = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee8(addr, index) {
                var txContext;
                return _regenerator["default"].wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return _this4.getAccountInfo(addr);

                      case 2:
                        txContext = _context8.sent;
                        return _context8.abrupt("return", Object.assign({}, addressList[index], txContext));

                      case 4:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8);
              }));

              return function (_x13, _x14) {
                return _ref9.apply(this, arguments);
              };
            }()); // eslint-disable-next-line max-len,no-unused-vars

            requestsDelegations = addressList.map(function (addr, index) {
              return _this4.getAccountDelegations(validators, addr);
            }); // eslint-disable-next-line no-unused-vars,max-len

            _context9.next = 7;
            return Promise.all(requestsBalance);

          case 7:
            balances = _context9.sent;
            _context9.next = 10;
            return Promise.all(requestsDelegations);

          case 10:
            delegations = _context9.sent;
            reply = [];

            for (i = 0; i < addressList.length; i += 1) {
              reply.push(Object.assign({}, delegations[i], balances[i]));
            }

            return _context9.abrupt("return", reply);

          case 14:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function (_x12) {
    return _ref8.apply(this, arguments);
  };
}(); // Creates a new delegation tx based on the input parameters
// this function expect that retrieve balances has been called before


IrisDelegateTool.prototype.txCreateDelegate =
/*#__PURE__*/
function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee10(txContext, validatorBech32, uatomAmount, memo) {
    var accountInfo;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!(typeof txContext === 'undefined')) {
              _context10.next = 2;
              break;
            }

            throw new Error('undefined txContext');

          case 2:
            if (!(typeof txContext.bech32 === 'undefined')) {
              _context10.next = 4;
              break;
            }

            throw new Error('txContext does not contain the source address (bech32)');

          case 4:
            _context10.next = 6;
            return this.getAccountInfo(txContext);

          case 6:
            accountInfo = _context10.sent;
            // eslint-disable-next-line no-param-reassign
            txContext.accountNumber = accountInfo.accountNumber; // eslint-disable-next-line no-param-reassign

            txContext.sequence = accountInfo.sequence;
            return _context10.abrupt("return", _iris["default"].createDelegate(txContext, validatorBech32, (0, _big["default"])(uatomAmount * 1000000000), memo));

          case 10:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function (_x15, _x16, _x17, _x18) {
    return _ref10.apply(this, arguments);
  };
}(); // Creates a new staking tx based on the input parameters
// this function expect that retrieve balances has been called before


IrisDelegateTool.prototype.txCreateRedelegate =
/*#__PURE__*/
function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee11(txContext, validatorSourceBech32, validatorDestBech32, uatomAmount, memo) {
    var accountInfo;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!(typeof txContext === 'undefined')) {
              _context11.next = 2;
              break;
            }

            throw new Error('undefined txContext');

          case 2:
            if (!(typeof txContext.bech32 === 'undefined')) {
              _context11.next = 4;
              break;
            }

            throw new Error('txContext does not contain the source address (bech32)');

          case 4:
            _context11.next = 6;
            return this.getAccountInfo(txContext);

          case 6:
            accountInfo = _context11.sent;
            // eslint-disable-next-line no-param-reassign
            txContext.accountNumber = accountInfo.accountNumber; // eslint-disable-next-line no-param-reassign

            txContext.sequence = accountInfo.sequence; // Convert from uatoms to shares

            return _context11.abrupt("return", _iris["default"].createRedelegate(txContext, validatorSourceBech32, validatorDestBech32, (0, _big["default"])(uatomAmount * 1000000000000000000), memo));

          case 10:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function (_x19, _x20, _x21, _x22, _x23) {
    return _ref11.apply(this, arguments);
  };
}(); // Creates a new undelegation tx based on the input parameters
// this function expect that retrieve balances has been called before


IrisDelegateTool.prototype.txCreateUndelegate =
/*#__PURE__*/
function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee12(txContext, validatorBech32, uatomAmount, memo) {
    var accountInfo;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            if (!(typeof txContext === 'undefined')) {
              _context12.next = 2;
              break;
            }

            throw new Error('undefined txContext');

          case 2:
            if (!(typeof txContext.bech32 === 'undefined')) {
              _context12.next = 4;
              break;
            }

            throw new Error('txContext does not contain the source address (bech32)');

          case 4:
            _context12.next = 6;
            return this.getAccountInfo(txContext);

          case 6:
            accountInfo = _context12.sent;
            // eslint-disable-next-line no-param-reassign
            txContext.accountNumber = accountInfo.accountNumber; // eslint-disable-next-line no-param-reassign

            txContext.sequence = accountInfo.sequence;
            return _context12.abrupt("return", _iris["default"].createUndelegate(txContext, validatorBech32, (0, _big["default"])(uatomAmount * 1000000000000000000), memo));

          case 10:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function (_x24, _x25, _x26, _x27) {
    return _ref12.apply(this, arguments);
  };
}(); // Relays a signed transaction and returns a transaction hash


IrisDelegateTool.prototype.txSubmit =
/*#__PURE__*/
function () {
  var _ref13 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee13(signedTx) {
    var _this5 = this;

    var txBody, url;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            txBody = {
              tx: signedTx.value,
              mode: 'async'
            };
            url = "".concat(nodeURL(this), "/tx/broadcast");
            return _context13.abrupt("return", _axios["default"].post(url, JSON.stringify(txBody)).then(function (r) {
              return r;
            }, function (e) {
              return wrapError(_this5, e);
            }));

          case 3:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function (_x28) {
    return _ref13.apply(this, arguments);
  };
}(); // Retrieve the status of a transaction hash


IrisDelegateTool.prototype.txStatus =
/*#__PURE__*/
function () {
  var _ref14 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee14(txHash) {
    var _this6 = this;

    var url;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            url = "".concat(nodeURL(this), "/txs/").concat(txHash);
            return _context14.abrupt("return", _axios["default"].get(url).then(function (r) {
              return r.data;
            }, function (e) {
              return wrapError(_this6, e);
            }));

          case 2:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));

  return function (_x29) {
    return _ref14.apply(this, arguments);
  };
}();

module.exports = IrisDelegateTool;