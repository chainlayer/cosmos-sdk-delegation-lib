"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

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
var DEFAULT_DENOM = 'iris-atto';
var DEFAULT_GAS = 50000;
var DEFAULT_GAS_PRICE = 6000000000000;
var DEFAULT_MEMO = 'Delegation to ChainLayer.io';

function canonicalizeJson(jsonTx) {
  if (Array.isArray(jsonTx)) {
    return jsonTx.map(canonicalizeJson);
  }

  if ((0, _typeof2["default"])(jsonTx) !== 'object') {
    return jsonTx;
  }

  var tmp = {};
  Object.keys(jsonTx).sort().forEach(function (key) {
    // eslint-disable-next-line no-unused-expressions
    jsonTx[key] != null && (tmp[key] = jsonTx[key]);
  });
  return tmp;
}

function getBytesToSign(tx, txContext) {
  if (typeof txContext === 'undefined') {
    throw new Error('txContext is not defined');
  }

  if (typeof txContext.chainId === 'undefined') {
    throw new Error('txContext does not contain the chainId');
  }

  if (typeof txContext.accountNumber === 'undefined') {
    throw new Error('txContext does not contain the accountNumber');
  }

  if (typeof txContext.sequence === 'undefined') {
    throw new Error('txContext does not contain the sequence value');
  }

  var txFieldsToSign = {
    account_number: txContext.accountNumber.toString(),
    chain_id: txContext.chainId,
    fee: tx.value.fee,
    memo: tx.value.memo,
    msgs: tx.value.msg,
    sequence: txContext.sequence.toString()
  };
  return JSON.stringify(canonicalizeJson(txFieldsToSign));
}

function applyGas(unsignedTx, gas) {
  if (typeof unsignedTx === 'undefined') {
    throw new Error('undefined unsignedTx');
  }

  if (typeof gas === 'undefined') {
    throw new Error('undefined gas');
  } // eslint-disable-next-line no-param-reassign


  unsignedTx.value.fee = {
    amount: [{
      amount: (gas * DEFAULT_GAS_PRICE).toString(),
      denom: DEFAULT_DENOM
    }],
    gas: gas.toString()
  };
  return unsignedTx;
} // Creates a new tx skeleton


function createSkeleton(txContext) {
  if (typeof txContext === 'undefined') {
    throw new Error('undefined txContext');
  }

  if (typeof txContext.accountNumber === 'undefined') {
    throw new Error('txContext does not contain the accountNumber');
  }

  if (typeof txContext.sequence === 'undefined') {
    throw new Error('txContext does not contain the sequence value');
  }

  var txSkeleton = {
    type: 'auth/StdTx',
    value: {
      msg: [],
      // messages
      fee: '',
      memo: DEFAULT_MEMO,
      signatures: [{
        signature: 'N/A',
        account_number: txContext.accountNumber.toString(),
        sequence: txContext.sequence.toString(),
        pub_key: {
          type: 'tendermint/PubKeySecp256k1',
          value: 'PK'
        }
      }]
    }
  };
  return applyGas(txSkeleton, DEFAULT_GAS);
}

function applySignature(unsignedTx, txContext, secp256k1Sig) {
  if (typeof unsignedTx === 'undefined') {
    throw new Error('undefined unsignedTx');
  }

  if (typeof txContext === 'undefined') {
    throw new Error('undefined txContext');
  }

  if (typeof txContext.pk === 'undefined') {
    throw new Error('txContext does not contain the public key (pk)');
  }

  if (typeof txContext.accountNumber === 'undefined') {
    throw new Error('txContext does not contain the accountNumber');
  }

  if (typeof txContext.sequence === 'undefined') {
    throw new Error('txContext does not contain the sequence value');
  }

  var tmpCopy = Object.assign({}, unsignedTx, {});
  tmpCopy.value.signatures = [{
    signature: secp256k1Sig.toString('base64'),
    account_number: txContext.accountNumber.toString(),
    sequence: txContext.sequence.toString(),
    pub_key: {
      type: 'tendermint/PubKeySecp256k1',
      value: Buffer.from(txContext.pk, 'hex').toString('base64')
    }
  }];
  return tmpCopy;
} // Creates a new delegation tx based on the input parameters
// the function expects a complete txContext


function createDelegate(txContext, validatorBech32, uatomAmount, memo) {
  var txSkeleton = createSkeleton(txContext);
  var txMsg = {
    type: 'irishub/stake/MsgDelegate',
    value: {
      delegation: {
        amount: uatomAmount.toString(),
        denom: DEFAULT_DENOM
      },
      delegator_addr: txContext.bech32,
      validator_addr: validatorBech32
    }
  };
  txSkeleton.value.msg = [txMsg];
  txSkeleton.value.memo = memo || '';
  return txSkeleton;
} // Creates a new undelegation tx based on the input parameters
// the function expects a complete txContext


function createUndelegate(txContext, validatorBech32, uatomAmount, memo) {
  var txSkeleton = createSkeleton(txContext);
  var txMsg = {
    type: 'irishub/stake/MsgUndelegate',
    value: {
      delegation: {
        amount: uatomAmount.toString(),
        denom: DEFAULT_DENOM
      },
      delegator_addr: txContext.bech32,
      validator_addr: validatorBech32
    }
  };
  txSkeleton.value.msg = [txMsg];
  txSkeleton.value.memo = memo || '';
  return txSkeleton;
} // Creates a new redelegation tx based on the input parameters
// the function expects a complete txContext


function createRedelegate(txContext, validatorSourceBech32, validatorDestBech32, uatomAmount, memo) {
  var txSkeleton = createSkeleton(txContext);
  var txMsg = {
    type: 'irishub/stake/MsgBeginRedelegate',
    value: {
      delegation: {
        amount: uatomAmount.toString(),
        denom: DEFAULT_DENOM
      },
      delegator_addr: txContext.bech32,
      validator_dst_addr: validatorDestBech32,
      validator_src_addr: validatorSourceBech32
    }
  };
  txSkeleton.value.msg = [txMsg];
  txSkeleton.value.memo = memo || '';
  return txSkeleton;
} // Creates a new withdrawl tx based on the input parameters
// the function expects a complete txContext


function createWithdrawl(txContext, memo) {
  var txSkeleton = createSkeleton(txContext);
  var txMsg = {
    type: 'irishub/distr/MsgWithdrawDelegationRewardsAll',
    value: {
      delegator_addr: txContext.bech32
    }
  };
  txSkeleton.value.msg = [txMsg];
  txSkeleton.value.memo = memo || '';
  return txSkeleton;
}

var _default = {
  DEFAULT_DENOM: DEFAULT_DENOM,
  createSkeleton: createSkeleton,
  createDelegate: createDelegate,
  createRedelegate: createRedelegate,
  createUndelegate: createUndelegate,
  createWithdrawl: createWithdrawl,
  getBytesToSign: getBytesToSign,
  applySignature: applySignature
};
exports["default"] = _default;