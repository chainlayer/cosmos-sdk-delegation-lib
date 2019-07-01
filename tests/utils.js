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
const bip39 = require('bip39');
const bip32 = require('bip32');
const secp256k1 = require('secp256k1');
import sha256 from 'crypto-js/sha256';
import { getBech32FromPK } from 'ledger-cosmos-js';


export function getWallet(mnemonic) {
    bip39.validateMnemonic(mnemonic);
    const seed = bip39.mnemonicToSeed(mnemonic);
    const masterKey = bip32.fromSeed(seed);
    const cosmosHD = masterKey.derivePath('m/44\'/118\'/0\'/0/0');
    const { privateKey } = cosmosHD;
    const publicKey = secp256k1.publicKeyCreate(cosmosHD.privateKey, true);

    return {
        privateKey: privateKey.toString('hex'),
        publicKey: publicKey.toString('hex'),
        cosmosAddress: getBech32FromPK('cosmos', publicKey),
    };
}

export function signWithMnemonic(messageToSign, mnemonic) {
    const wallet = getWallet(mnemonic);
    const signHash = Buffer.from(sha256(messageToSign).toString(), 'hex');
    const { signature } = secp256k1.sign(signHash, Buffer.from(wallet.privateKey, 'hex'));
    return signature;
}
