/** ******************************************************************************
 *  (c) 2019 ChainLayer
 *  Original (c) 2019 ZondaX GmbH
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
import CosmosApp, {getBech32FromPK} from "ledger-cosmos-js";
import txskava from "./kava";
import secp256k1 from "secp256k1";
import axios from "axios";
import Big from "big.js";

Big.PE = 30;
const defaultHrp = 'kava';

function wrapError(cdt, e) {
    try {
        // eslint-disable-next-line no-param-reassign
        let errMessage = '';
        if (typeof e.response === 'undefined') {
            errMessage = e.message;
        } else {
            errMessage = e.response.data.error;
        }

        // eslint-disable-next-line no-param-reassign
        cdt.lastError = errMessage;
        return {
            error: errMessage,
        };
    } catch (e2) {
        // eslint-disable-next-line no-param-reassign
        cdt.lastError = `${e.message}  ${e2.message}`;
        return {
            error: `${e.message}  ${e2.message}`,
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

const KavaDelegateTool = function (transport) {
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
};

// eslint-disable-next-line no-unused-vars
KavaDelegateTool.prototype.getHrp = function () {
    return defaultHrp;
};

// eslint-disable-next-line no-unused-vars
KavaDelegateTool.prototype.getDefaultDenom = function () {
    return txskava.DEFAULT_DENOM; // 'uatom'
};

// eslint-disable-next-line no-unused-vars
KavaDelegateTool.prototype.setNodeURL = function (resturl) {
    this.resturl = resturl;
};

// eslint-disable-next-line no-unused-vars
KavaDelegateTool.prototype.setHrp = function (hrp) {
    this.hrp = hrp;
};

// Detect when a ledger device is connected and verify the cosmos app is running.
KavaDelegateTool.prototype.connect = async function () {
    this.connected = false;
    this.lastError = null;

    this.app = new CosmosApp(this.transport);

    if (this.checkAppInfo) {
        const appInfo = await this.app.appInfo();
        if (appInfo.return_code !== 0x9000) {
            this.lastError = appInfo.error_message;
            throw new Error(appInfo.error_message);
        }

        appInfo.appName = appInfo.appName || '?';
        console.log(`Detected app ${appInfo.appName} ${appInfo.appVersion}`);

        if (appInfo.appName.toLowerCase() !== 'cosmos') {
            this.lastError = `Incorrect app detected ${appInfo.appName.toString()}`;
            return false;
        }
    }

    const version = await this.app.getVersion();
    if (version.return_code !== 0x9000) {
        this.lastError = version.error_message;
        throw new Error(version.error_message);
    }

    const major = version.major || 0;
    const minor = version.minor || 0;

    if (major < this.requiredVersionMajor || minor < this.requiredVersionMinor) {
        this.lastError = 'Version not supported';
        return false;
    }

    // Mark as connected
    this.connected = true;
    return this.connected;
};

// Returns a signed transaction ready to be relayed
KavaDelegateTool.prototype.sign = async function (unsignedTx, txContext) {
    connectedOrThrow(this);
    if (typeof txContext.path === 'undefined') {
        this.lastError = 'context should include the account path';
        throw new Error('context should include the account path');
    }

    const bytesToSign = txskava.getBytesToSign(unsignedTx, txContext);
    console.log(bytesToSign);

    const response = await this.app.sign(txContext.path, bytesToSign);

    if (response.return_code !== 0x9000) {
        this.lastError = response.error_message;
        throw new Error(response.error_message);
    }

    const sig = secp256k1.signatureImport(response.signature);

    return txskava.applySignature(unsignedTx, txContext, sig);
};

// Retrieve public key and bech32 address
KavaDelegateTool.prototype.retrieveAddress = async function (network, account, change, index) {
    connectedOrThrow(this);

    const path = [44, network, account, change, index];
    const pk = await this.app.publicKey(path);

    if (pk.return_code !== 0x9000) {
        this.lastError = pk.error_message;
        throw new Error(pk.error_message);
    }

    return {
        pk: pk.compressed_pk.toString('hex'),
        path,
        bech32: getBech32FromPK(this.hrp, pk.compressed_pk),
    };
};

// Scan multiple address in a derivation path range (44’/118’/X/0/Y)
// eslint-disable-next-line max-len
KavaDelegateTool.prototype.scanAddresses = async function (minAccount, maxAccount, minIndex, maxIndex) {
    const answer = [];

    for (let account = minAccount; account < maxAccount + 1; account += 1) {
        for (let index = minIndex; index < maxIndex + 1; index += 1) {
            // retrieve address cannot be called in parallel
            // eslint-disable-next-line no-await-in-loop
            const tmp = await this.retrieveAddress(account, index);
            answer.push(tmp);
        }
    }

    return answer;
};

KavaDelegateTool.prototype.getPrice = async function () {
    // const url = `https://min-api.cryptocompare.com/data/price?fsym=KAVA&tsyms=USD`;
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=kava&vs_currencies=USD`;
    return axios.get(url).then((r) => {
        return r.data.kava.usd;
    }, e => wrapError(this, e));
};

KavaDelegateTool.prototype.retrieveValidators = async function () {
    const url = `${nodeURL(this)}/staking/validators`;
    return axios.get(url).then((r) => {
        const validators = {};
        for (let i = 0; i < r.data.result.length; i += 1) {
            const validatorData = {};
            const t = r.data.result[i];
            validatorData.tokens = Big(t.tokens);
            validatorData.totalShares = Big(t.delegator_shares);
            validators[t.operator_address] = validatorData;
        }
        return validators;
    }, e => wrapError(this, e));
};

KavaDelegateTool.prototype.getAccountInfo = async function (addr) {
    const url = `${nodeURL(this)}/auth/accounts/${addr.bech32}`;

    const txContext = {
        sequence: '0',
        accountNumber: '0',
        balance: '0',
    };

    return axios.get(url).then((r) => {
        try {
            if (typeof r.data.result !== 'undefined' && typeof r.data.result.value !== 'undefined') {
                // if vesting account
                if (r.data.result.type == 'cosmos-sdk/ValidatorVestingAccount') {
                    txContext.sequence = Number(r.data.result.value.PeriodicVestingAccount.BaseVestingAccount.BaseAccount.sequence).toString();
                    txContext.accountNumber = Number(r.data.result.value.PeriodicVestingAccount.BaseVestingAccount.BaseAccount.account_number).toString();

                    if (r.data.result.value.PeriodicVestingAccount.BaseVestingAccount.BaseAccount.coins !== null) {
                        const tmp = r.data.result.value.PeriodicVestingAccount.BaseVestingAccount.BaseAccount.coins.filter(x => x.denom === txskava.DEFAULT_DENOM);
                        if (tmp.length > 0) {
                            txContext.balance = Big(tmp[0].amount).toString();
                        }
                    }
                } else {
                    txContext.sequence = Number(r.data.result.value.sequence).toString();
                    txContext.accountNumber = Number(r.data.result.value.account_number).toString();

                    if (r.data.result.value.coins !== null) {
                        const tmp = r.data.result.value.coins.filter(x => x.denom === txskava.DEFAULT_DENOM);
                        if (tmp.length > 0) {
                            txContext.balance = Big(tmp[0].amount).toString();
                        }
                    }
                }
            }
        } catch (e) {
            console.log('Error ', e, ' returning defaults');
        }
        return txContext;
    }, e => wrapError(this, e));
};

KavaDelegateTool.prototype.getAccountDelegations = async function (validators, addr) {
    const url = `${nodeURL(this)}/staking/delegators/${addr.bech32}/delegations`;
    return axios.get(url).then((r) => {
        const txContext = {
            delegations: {},
            delegationsTotal: '0',
        };

        const delegations = {};
        let totalDelegation = Big(0);

        try {
            if (typeof r.data.result !== 'undefined' && r.data.result !== null) {
                for (let i = 0; i < r.data.result.length; i += 1) {
                    const t = r.data.result[i];
                    const valAddr = t.validator_address;

                    if (valAddr in validators) {
                        const shares = Big(t.shares);
                        const valData = validators[valAddr];
                        const valTokens = valData.tokens;
                        const valTotalShares = valData.totalShares;
                        const tokens = shares.times(valTokens).div(valTotalShares);

                        delegations[valAddr] = {
                            uatoms: tokens.toString(),
                            shares: shares.toString(),
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
    }, e => wrapError(this, e));
};

// Retrieve atom balances from the network for a list of account
// Retrieve delegated/not-delegated balances for each account
// KavaDelegateTool.prototype.retrieveBalances = async function (addressList) {
//     const validators = await this.retrieveValidators();
//
//     // Get all balances
//     const requestsBalance = addressList.map(async (addr, index) => {
//         const txContext = await this.getAccountInfo(addr);
//         return Object.assign({}, addressList[index], txContext);
//     });
//
//     // eslint-disable-next-line max-len,no-unused-vars
//     const requestsDelegations = addressList.map((addr, index) => this.getAccountDelegations(validators, addr));
//
//     // eslint-disable-next-line no-unused-vars,max-len
//     const balances = await Promise.all(requestsBalance);
//     const delegations = await Promise.all(requestsDelegations);
//
//     const reply = [];
//     for (let i = 0; i < addressList.length; i += 1) {
//         reply.push(Object.assign({}, delegations[i], balances[i]));
//     }
//
//     return reply;
// };

// Retrieve atom rewards from the network for an account and validator
KavaDelegateTool.prototype.getRewards = async function (addr) {
    const url = `${nodeURL(this)}/distribution/delegators/${addr.bech32}/rewards`;
    return axios.get(url).then((r) => {
        let reward = Big(0);

        try {
            if (typeof r.data.result.total[0].amount !== 'undefined' && r.data.result !== null) {
                reward = r.data.result.total[0].amount;
            }
        } catch (e) {
            console.log('Error ', e, ' returning defaults');
        }

        return reward;
    }, e => wrapError(this, e));
};

// Creates a new delegation tx based on the input parameters
// this function expect that retrieve balances has been called before
KavaDelegateTool.prototype.txCreateDelegate = async function (
    txContext,
    validatorBech32,
    uatomAmount,
    memo,
) {
    if (typeof txContext === 'undefined') {
        throw new Error('undefined txContext');
    }
    if (typeof txContext.bech32 === 'undefined') {
        throw new Error('txContext does not contain the source address (bech32)');
    }

    const accountInfo = await this.getAccountInfo(txContext);
    // eslint-disable-next-line no-param-reassign
    txContext.accountNumber = accountInfo.accountNumber;
    // eslint-disable-next-line no-param-reassign
    txContext.sequence = accountInfo.sequence;

    return txskava.createDelegate(
        txContext,
        validatorBech32,
        Big(uatomAmount),
        memo,
    );
}

// Creates a new staking tx based on the input parameters
// this function expect that retrieve balances has been called before
KavaDelegateTool.prototype.txCreateRedelegate = async function (
    txContext,
    validatorSourceBech32,
    validatorDestBech32,
    uatomAmount,
    memo,
) {
    if (typeof txContext === 'undefined') {
        throw new Error('undefined txContext');
    }
    if (typeof txContext.bech32 === 'undefined') {
        throw new Error('txContext does not contain the source address (bech32)');
    }

    const accountInfo = await this.getAccountInfo(txContext);
    // eslint-disable-next-line no-param-reassign
    txContext.accountNumber = accountInfo.accountNumber;
    // eslint-disable-next-line no-param-reassign
    txContext.sequence = accountInfo.sequence;

    // Convert from uatoms to shares
    return txskava.createRedelegate(
        txContext,
        validatorSourceBech32,
        validatorDestBech32,
        uatomAmount,
        memo,
    );
};


// Creates a new undelegation tx based on the input parameters
// this function expect that retrieve balances has been called before
KavaDelegateTool.prototype.txCreateUndelegate = async function (
    txContext,
    validatorBech32,
    uatomAmount,
    memo,
) {
    if (typeof txContext === 'undefined') {
        throw new Error('undefined txContext');
    }
    if (typeof txContext.bech32 === 'undefined') {
        throw new Error('txContext does not contain the source address (bech32)');
    }

    const accountInfo = await this.getAccountInfo(txContext);
    // eslint-disable-next-line no-param-reassign
    txContext.accountNumber = accountInfo.accountNumber;
    // eslint-disable-next-line no-param-reassign
    txContext.sequence = accountInfo.sequence;

    return txskava.createUndelegate(
        txContext,
        validatorBech32,
        uatomAmount,
        memo,
    );
};

// Creates a new withdrawl tx based on the input parameters
KavaDelegateTool.prototype.txCreateWithdrawl = async function (
    txContext,
    validatorBech32,
    memo,
) {
    if (typeof txContext === 'undefined') {
        throw new Error('undefined txContext');
    }
    if (typeof txContext.bech32 === 'undefined') {
        throw new Error('txContext does not contain the source address (bech32)');
    }

    const accountInfo = await this.getAccountInfo(txContext);
    // eslint-disable-next-line no-param-reassign
    txContext.accountNumber = accountInfo.accountNumber;
    // eslint-disable-next-line no-param-reassign
    txContext.sequence = accountInfo.sequence;

    return txskava.createWithdrawl(
        txContext,
        validatorBech32,
        memo,
    );
}

// Relays a signed transaction and returns a transaction hash
KavaDelegateTool.prototype.txSubmit = async function (signedTx) {
    const txBody = {
        tx: signedTx.value,
        mode: 'async',
    };

    const url = `${nodeURL(this)}/txs`;
    return axios.post(url, JSON.stringify(txBody)).then(r => r, e => wrapError(this, e));
};

// Retrieve the status of a transaction hash
KavaDelegateTool.prototype.txStatus = async function (txHash) {
    const url = `${nodeURL(this)}/txs/${txHash}`;
    return axios.get(url).then(r => r.data, e => wrapError(this, e));
};

module.exports = KavaDelegateTool;
