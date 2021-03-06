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
// eslint-disable-next-line import/extensions,import/no-unresolved
import { CosmosDelegateTool } from 'index.js';
// eslint-disable-next-line import/extensions,import/no-unresolved
import txscosmos from 'cosmos.js';
import { getWallet, signWithMnemonic } from 'utils.js';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

test('get account info - default values', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {},
    );

    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');

    const addr = { bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp' };
    const answer = await cdt.getAccountInfo(addr);

    expect(answer).toHaveProperty('sequence', '0');
    expect(answer).toHaveProperty('accountNumber', '0');
    expect(answer).toHaveProperty('balance', '0');
});

test('get account info - parsing', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {"height":"59459","result":{"type":"cosmos-sdk/Account","value":{"address":"cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp","coins":[{"denom":"uatom","amount":"15"}],"public_key":null,"account_number":"20","sequence":"10"}}},
    );

    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');

    const addr = { bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp' };
    const answer = await cdt.getAccountInfo(addr);

    expect(answer).toHaveProperty('sequence', '10');
    expect(answer).toHaveProperty('accountNumber', '20');
    expect(answer).toHaveProperty('balance', '15');
});

// test('get multiple accounts', async () => {
//     const cdt = new CosmosDelegateTool();
//     cdt.setNodeURL('mockNodeURL');
//
//     const mock = new MockAdapter(axios);
//     mock.onGet('mockNodeURL/staking/validators').reply(
//         200, {"height":"22960","result": [
//             {
//                 operator_address: 'some_validator_bech32',
//                 tokens: '123456789',
//                 delegator_shares: '123456789',
//             },
//             {
//                 operator_address: 'some_other_validator_bech32',
//                 tokens: '2222',
//                 delegator_shares: '4444',
//             },
//         ]},
//     );
//     mock.onGet('mockNodeURL/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
//         200, {
//             value: {
//                 sequence: 12,
//                 account_number: 34,
//                 coins: [{ amount: 56, denom: 'uatom' }, { amount: 20, denom: 'other' }],
//             },
//         },
//     );
//     mock.onGet('mockNodeURL/staking/delegators/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp/delegations').reply(
//         200, [
//             {
//                 delegator_address: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
//                 validator_address: 'some_validator_bech32',
//                 shares: '1000',
//                 height: 0,
//             },
//             {
//                 delegator_address: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
//                 validator_address: 'some_other_validator_bech32',
//                 shares: '100',
//                 height: 0,
//             },
//         ],
//     );
//     mock.onGet('mockNodeURL/auth/accounts/cosmos19krh5y8y5wce3mmj3dxffyc7hgu9tsxndsmmml').reply(
//         200, {
//             value: {
//                 sequence: 67,
//                 account_number: 89,
//                 coins: [{ amount: 1011, denom: 'uatom' }, { amount: 20, denom: 'other' }],
//             },
//         },
//     );
//     mock.onGet('mockNodeURL/staking/delegators/cosmos19krh5y8y5wce3mmj3dxffyc7hgu9tsxndsmmml/delegations').reply(
//         200, {},
//     );
//
//     const addrs = [
//         { bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp' },
//         { bech32: 'cosmos19krh5y8y5wce3mmj3dxffyc7hgu9tsxndsmmml' },
//     ];
//
//     const reply = await cdt.retrieveBalances(addrs);
//     // console.log(JSON.stringify(reply, null, 4));
//
//     expect(reply[0]).toHaveProperty('sequence', '12');
//     expect(reply[0]).toHaveProperty('accountNumber', '34');
//     expect(reply[0]).toHaveProperty('balance', '56');
//     expect(reply[0]).toHaveProperty('delegationsTotal', '1050');
//     expect(reply[0]).toHaveProperty('delegations');
//     expect(Object.keys(reply[0].delegations).length).toEqual(2);
//
//     expect(reply[1]).toHaveProperty('sequence', '67');
//     expect(reply[1]).toHaveProperty('accountNumber', '89');
//     expect(reply[1]).toHaveProperty('balance', '1011');
//     expect(reply[1]).toHaveProperty('delegationsTotal', '0');
//     expect(reply[1]).toHaveProperty('delegations');
//     expect(Object.keys(reply[1].delegations).length).toEqual(0);
// });

test('create delegate tx', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {"height":"59459","result":{"type":"cosmos-sdk/Account","value":{"address":"cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp","coins":[{"denom":"uatom","amount":"15"}],"public_key":null,"account_number":"20","sequence":"10"}}},
    );

    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');

    const txContext = {
        chainId: 'testing',
        bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
    };

    const validatorAddrBech32 = 'cosmosvaloper1zyp0axz2t55lxkmgrvg4vpey2rf4ratcsud07t';
    const uAtomAmount = 8765000000;
    const memo = 'some message';

    const unsignedTx = await cdt.txCreateDelegate(
        txContext,
        validatorAddrBech32,
        uAtomAmount,
        memo,
    );

    // console.log(JSON.stringify(unsignedTx, null, 4));

    // A call to retrieve account data is made
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');

    // txContext is kept and two new fields appear
    expect(txContext).toHaveProperty('chainId', 'testing');
    expect(txContext).toHaveProperty('bech32', 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');
    expect(txContext).toHaveProperty('accountNumber', '20');
    expect(txContext).toHaveProperty('sequence', '10');

    expect(unsignedTx).toHaveProperty('type', 'auth/StdTx');
    expect(unsignedTx).toHaveProperty('value');
    expect(unsignedTx.value).toHaveProperty('memo', 'some message');
    expect(unsignedTx.value.msg).toHaveProperty('length', 1);
    expect(unsignedTx.value.msg[0]).toHaveProperty('type', 'cosmos-sdk/MsgDelegate');
    expect(unsignedTx.value.msg[0].value).toHaveProperty('amount', { amount: '8765000000', denom: 'uatom' });
    expect(unsignedTx.value.msg[0].value).toHaveProperty('delegator_address', 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');
    expect(unsignedTx.value.msg[0].value).toHaveProperty('validator_address', 'cosmosvaloper1zyp0axz2t55lxkmgrvg4vpey2rf4ratcsud07t');
});

test('get bytes to sign', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {},
    );

    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');

    const txContext = {
        chainId: 'some_chain',
        bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
    };

    const dummyTx = await cdt.txCreateDelegate(
        txContext,
        'validatorAddress',
        100,
        'some_memo',
    );

    const bytesToSign = txscosmos.getBytesToSign(dummyTx, txContext);

    // console.log(bytesToSign);
    // console.log(mock.history);
});

test('relay delegation tx', async () => {
    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {"height":"59459","result":{"type":"cosmos-sdk/Account","value":{"address":"cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp","coins":[{"denom":"uatom","amount":"15"}],"public_key":null,"account_number":"20","sequence":"10"}}},
    );
    mock.onPost('mockNode/txs').reply(
        200,
        {
            txhash: 'EE5F3404034C524501629B56E0DDC38FAD651F04',
            height: '1928',
        },
    );

    // ////////////////////

    const validatorAddrBech32 = 'cosmosvaloper19krh5y8y5wce3mmj3dxffyc7hgu9tsxngy0whv';
    const uAtomAmount = 100000000000;
    const memo = 'some memo message';

    const txContext = {
        chainId: 'testing',
        bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
        pk: '028284dfb203d9a702eb6d60ea7bcf37b7099f66d363ac024a9b249859bfb7dc3e',
    };

    // Create a delegation transaction
    const unsignedTx = await cdt.txCreateDelegate(
        txContext,
        validatorAddrBech32,
        uAtomAmount,
        memo,
    );

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txscosmos.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txscosmos.applySignature(unsignedTx, txContext, signature);

    // And submit the transaction
    const response = await cdt.txSubmit(signedTx);

    // Print response
    // console.log(JSON.stringify(response, null, 4));
    expect(response).toHaveProperty('status', 200);
    expect(response.data).toHaveProperty('txhash', 'EE5F3404034C524501629B56E0DDC38FAD651F04');
    expect(response.data).toHaveProperty('height', '1928');
    expect('error' in unsignedTx).toEqual(false);

    // check REST interactions
    expect(mock.history.get.length).toEqual(1);
    expect(mock.history.post.length).toEqual(1);
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "5000","denom": "uatom",},], gas: '200000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '20');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '10');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'E6iE3lFPPZk0ajh2Mb0p2mMVwFxW2s5g29OqcL99VakV0UYuVBIkOjXcmsPTpWDTf8Tua3ItQYX99Iu7uo/HoQ==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('relay redelegation tx', async () => {
    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');

    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {"height":"59459","result":{"type":"cosmos-sdk/Account","value":{"address":"cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp","coins":[{"denom":"uatom","amount":"15"}],"public_key":null,"account_number":"20","sequence":"10"}}},
    );
    mock.onPost('mockNode/txs').reply(
        200,
        {
            txhash: 'EE5F3404034C524501629B56E0DDC38FAD651F04',
            height: '1928',
        },
    );

    // ////////////////////

    const validatorAddrBech32Source = 'cosmosvaloper19krh5y8y5wce3mmj3dxffyc7hgu9tsxngy0whv';
    const validatorAddrBech32Dest = 'cosmosvaloper1sxx9mszve0gaedz5ld7qdkjkfv8z992ax69k08';
    const uAtomAmount = 1000000000;
    const memo = 'some memo message - redelegate';

    const txContext = {
        chainId: 'testing',
        bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
        pk: '028284dfb203d9a702eb6d60ea7bcf37b7099f66d363ac024a9b249859bfb7dc3e',
    };

    // Create a delegation transaction
    const unsignedTx = await cdt.txCreateRedelegate(
        txContext,
        validatorAddrBech32Source,
        validatorAddrBech32Dest,
        uAtomAmount,
        memo,
    );

    // Check uatom to shares conversion
    expect(unsignedTx.value.msg[0].value.amount).toEqual({ amount: '1000000000', denom: 'uatom' });

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txscosmos.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txscosmos.applySignature(unsignedTx, txContext, signature);

    // console.log(JSON.stringify(signedTx), null, 4);

    // And submit the transaction
    const response = await cdt.txSubmit(signedTx);

    // Print response
    // console.log(JSON.stringify(response, null, 4));
    expect(response).toHaveProperty('status', 200);
    expect(response.data).toHaveProperty('txhash', 'EE5F3404034C524501629B56E0DDC38FAD651F04');
    expect(response.data).toHaveProperty('height', '1928');
    expect('error' in unsignedTx).toEqual(false);

    // check REST interactions
    expect(mock.history.get.length).toEqual(1);
    expect(mock.history.post.length).toEqual(1);
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "5000","denom": "uatom",},], gas: '200000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message - redelegate');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '20');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '10');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'zajdWSJKEG4EN4TdMAhImIrA39osdR1KnVCXSkUk18sFmoHhq6YbuYWYSp6Kq0uvK9InFcBMOQsFzCzGLUVLwA==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('relay undelegation tx', async () => {
    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {"height":"59459","result":{"type":"cosmos-sdk/Account","value":{"address":"cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp","coins":[{"denom":"uatom","amount":"15"}],"public_key":null,"account_number":"20","sequence":"10"}}},
    );
    mock.onPost('mockNode/txs').reply(
        200,
        {
            txhash: 'EE5F3404034C524501629B56E0DDC38FAD651F04',
            height: '1928',
        },
    );

    // ////////////////////

    const validatorAddrBech32 = 'cosmosvaloper19krh5y8y5wce3mmj3dxffyc7hgu9tsxngy0whv';
    const uAtomAmount = 300000000;
    const memo = 'some memo message - undelegate';

    const txContext = {
        chainId: 'testing',
        bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
        pk: '028284dfb203d9a702eb6d60ea7bcf37b7099f66d363ac024a9b249859bfb7dc3e',
    };

    // Create a delegation transaction
    const unsignedTx = await cdt.txCreateUndelegate(
        txContext,
        validatorAddrBech32,
        uAtomAmount,
        memo,
    );

    // Check uatom to shares conversion
    expect(unsignedTx.value.msg[0].value.amount).toEqual({ amount: '300000000', denom: 'uatom' });

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txscosmos.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txscosmos.applySignature(unsignedTx, txContext, signature);

    // And submit the transaction
    const response = await cdt.txSubmit(signedTx);

    // Print response
    // console.log(JSON.stringify(response, null, 4));
    expect(response).toHaveProperty('status', 200);
    expect(response.data).toHaveProperty('txhash', 'EE5F3404034C524501629B56E0DDC38FAD651F04');
    expect(response.data).toHaveProperty('height', '1928');
    expect('error' in unsignedTx).toEqual(false);

    // check REST interactions
    expect(mock.history.get.length).toEqual(1);
    expect(mock.history.post.length).toEqual(1);
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "5000","denom": "uatom",},], gas: '200000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message - undelegate');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '20');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '10');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'oBpXq5Z/oqEPsqWJKBeQgRjfQck4p7h2spW321rqj29cPnXFholyMcpVFgWDZ0QFxJwOwi2uF6odLdVwb3Gcvg==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('get tx status - unknown', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/txs/0000000000000000000000000000000000000000000000000000000000000000').reply(
        200,
        {
            error: 'Tx: Response error: RPC error -32603 - Internal error: Tx (0000000000000000000000000000000000000000000000000000000000000000) not found',
        },
    );

    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');

    const txHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const status = await cdt.txStatus(txHash);

    expect(status.error).toEqual('Tx: Response error: RPC error -32603 - Internal error: Tx (0000000000000000000000000000000000000000000000000000000000000000) not found');
});

test('get tx status - known', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/txs/0F3C6CD851701FAF3EE104ECD35D0B38D9AB91A32AC7D51B424F90954341C8EB').reply(
        200,
        {
            height: '228759',
            txhash: '0F3C6CD851701FAF3EE104ECD35D0B38D9AB91A32AC7D51B424F90954341C8EB',
            raw_log: '[{"msg_index":"0","success":true,"log":""}]',
            logs: [],
            gas_wanted: '200000',
            gas_used: '89709',
            tx: {},
            timestamp: '2019-05-10T20:28:07Z',
        },
    );

    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');

    const txHash = '0F3C6CD851701FAF3EE104ECD35D0B38D9AB91A32AC7D51B424F90954341C8EB';
    const status = await cdt.txStatus(txHash);

    expect(status).toHaveProperty('height', '228759');
    expect(status).toHaveProperty('txhash', '0F3C6CD851701FAF3EE104ECD35D0B38D9AB91A32AC7D51B424F90954341C8EB');
    expect(status).toHaveProperty('gas_wanted', '200000');
    expect(status).toHaveProperty('gas_used', '89709');
    expect(status).toHaveProperty('timestamp', '2019-05-10T20:28:07Z');
});

test('get price', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('https://min-api.cryptocompare.com/data/price?fsym=ATOM&tsyms=USD').reply(
        200,
        {
            USD: 5.407
        },
    );

    const cdt = new CosmosDelegateTool();
    const status = await cdt.getPrice();
    expect(status).toBe(5.407);
});

test('get reward', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/distribution/delegators/cosmos1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mw6xpxh/rewards').reply(
        200,
        {"height":"0","result":{"rewards":[{"validator_address":"cosmosvaloper1kgddca7qj96z0qcxr2c45z73cfl0c75p7f3s2e","reward":[{"denom":"uatom","amount":"520951.658454596734722882"}]}],"total":[{"denom":"uatom","amount":"520951.658454596734722882"}]}},
    );

    const cdt = new CosmosDelegateTool();
    cdt.setNodeURL('mockNode');
    const status = await cdt.getRewards({ bech32: 'cosmos1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mw6xpxh' });
    expect(status).toBe("520951.658454596734722882");
});
