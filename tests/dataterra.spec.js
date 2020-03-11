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
import { TerraDelegateTool } from 'index.js';
// eslint-disable-next-line import/extensions,import/no-unresolved
import txsterra from 'terra.js';
import { getWallet, signWithMnemonic } from 'utils.js';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

test('get account info - default values', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2').reply(
        200,
        {},
    );

    const cdt = new TerraDelegateTool();
    cdt.setNodeURL('mockNode');

    const addr = { bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2' };
    const answer = await cdt.getAccountInfo(addr);

    expect(answer).toHaveProperty('sequence', '0');
    expect(answer).toHaveProperty('accountNumber', '0');
    expect(answer).toHaveProperty('balance', '0');
});

test('get account info - parsing', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2').reply(
        200,
        {"height":"36034","result":{"type":"core/Account","value":{"address":"terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2","coins":[{"denom":"ukrw","amount":"138115381794"},{"denom":"uluna","amount":"144353828"},{"denom":"umnt","amount":"29685334"},{"denom":"usdr","amount":"112052"},{"denom":"uusd","amount":"18696"}],"public_key":null,"account_number":"542770","sequence":"116"}}},
    );

    const cdt = new TerraDelegateTool();
    cdt.setNodeURL('mockNode');

    const addr = { bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2' };
    const answer = await cdt.getAccountInfo(addr);
    // console.log(answer)
    expect(answer).toHaveProperty('sequence', '116');
    expect(answer).toHaveProperty('accountNumber', '542770');
    expect(answer).toHaveProperty('balance', '144353828');
});

// test('get multiple accounts', async () => {
//     const cdt = new TerraDelegateTool();
//     cdt.setNodeURL('mockNodeURL');
//
//     const mock = new MockAdapter(axios);
//     mock.onGet('mockNodeURL/staking/validators').reply(
//         200, {"height":"22960","result": [
//             {
//                 operator_address: 'terravaloper1kgddca7qj96z0qcxr2c45z73cfl0c75paknc5e',
//                 tokens: '123456789',
//                 delegator_shares: '123456789',
//             },
//             {
//                 operator_address: 'terravaloper1kgddca7qj96z0qcxr2c45z73cfl0c75paknc5d',
//                 tokens: '2222',
//                 delegator_shares: '4444',
//             },
//         ]},
//     );
//     mock.onGet('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2').reply(
//         200,
//         {"height":"36034","result":{"type":"core/Account","value":{"address":"terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2","coins":[{"denom":"ukrw","amount":"138115381794"},{"denom":"uluna","amount":"144353828"},{"denom":"umnt","amount":"29685334"},{"denom":"usdr","amount":"112052"},{"denom":"uusd","amount":"18696"}],"public_key":null,"account_number":"542770","sequence":"116"}}},
//     );
//     mock.onGet('mockNodeURL/staking/delegators/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2/delegations').reply(
//         200, {
//             height: "36109",
//             result: [
//                 {
//                     delegator_address: "terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2",
//                     validator_address: "terravaloper1kgddca7qj96z0qcxr2c45z73cfl0c75paknc5e",
//                     shares: "30.000000000000000000",
//                     balance: "30"
//                 },
//                 {
//                     delegator_address: "terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2",
//                     validator_address: "terravaloper1kgddca7qj96z0qcxr2c45z73cfl0c75paknc5d",
//                     shares: "40.000000000000000000",
//                     balance: "40"
//                 }
//             ]
//         },
//     );
//
//     const addrs = [
//         { bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2' },
//         { bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2' },
//     ];
//
//     const reply = await cdt.retrieveBalances(addrs);
//     // console.log(JSON.stringify(reply, null, 4));
//     expect(reply[0]).toHaveProperty('sequence', '12');
//     expect(reply[0]).toHaveProperty('accountNumber', '34');
//     expect(reply[0]).toHaveProperty('balance', '56');
//     expect(reply[0]).toHaveProperty('delegationsTotal', '1050');
//     expect(reply[0]).toHaveProperty('delegations');
//     expect(Object.keys(reply[0].delegations).length).toEqual(2);
//
//     expect(reply[1]).toHaveProperty('sequence', '116');
//     expect(reply[1]).toHaveProperty('accountNumber', '542770');
//     expect(reply[1]).toHaveProperty('balance', '1011');
//     expect(reply[1]).toHaveProperty('delegationsTotal', '0');
//     expect(reply[1]).toHaveProperty('delegations');
//     expect(Object.keys(reply[1].delegations).length).toEqual(0);
// });

test('create delegate tx', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2').reply(
        200,
        {"height":"36034","result":{"type":"core/Account","value":{"address":"terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2","coins":[{"denom":"ukrw","amount":"138115381794"},{"denom":"uluna","amount":"144353828"},{"denom":"umnt","amount":"29685334"},{"denom":"usdr","amount":"112052"},{"denom":"uusd","amount":"18696"}],"public_key":null,"account_number":"542770","sequence":"116"}}},
    );

    const cdt = new TerraDelegateTool();
    cdt.setNodeURL('mockNode');

    const txContext = {
        chainId: 'testing',
        bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2',
    };

    const validatorAddrBech32 = 'cosmosvaloper1zyp0axz2t55lxkmgrvg4vpey2rf4ratcsud07t';
    const uAtomAmount = 8765;
    const memo = 'some message';

    const unsignedTx = await cdt.txCreateDelegate(
        txContext,
        validatorAddrBech32,
        uAtomAmount,
        memo,
    );

    // console.log(JSON.stringify(unsignedTx, null, 4));

    // A call to retrieve account data is made
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2');

    // txContext is kept and two new fields appear
    expect(txContext).toHaveProperty('chainId', 'testing');
    expect(txContext).toHaveProperty('bech32', 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2');
    expect(txContext).toHaveProperty('accountNumber', '542770');
    expect(txContext).toHaveProperty('sequence', '116');

    expect(unsignedTx).toHaveProperty('type', 'auth/StdTx');
    expect(unsignedTx).toHaveProperty('value');
    expect(unsignedTx.value).toHaveProperty('memo', 'some message');
    expect(unsignedTx.value.msg).toHaveProperty('length', 1);
    expect(unsignedTx.value.msg[0]).toHaveProperty('type', 'staking/MsgDelegate');
    expect(unsignedTx.value.msg[0].value).toHaveProperty('amount', { amount: '8765', denom: 'uluna' });
    expect(unsignedTx.value.msg[0].value).toHaveProperty('delegator_address', 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2');
    expect(unsignedTx.value.msg[0].value).toHaveProperty('validator_address', 'cosmosvaloper1zyp0axz2t55lxkmgrvg4vpey2rf4ratcsud07t');
});

test('get bytes to sign', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2').reply(
        200,
        {},
    );

    const cdt = new TerraDelegateTool();
    cdt.setNodeURL('mockNode');

    const txContext = {
        chainId: 'some_chain',
        bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2',
    };

    const dummyTx = await cdt.txCreateDelegate(
        txContext,
        'validatorAddress',
        100,
        'some_memo',
    );

    const bytesToSign = txsterra.getBytesToSign(dummyTx, txContext);

    // console.log(bytesToSign);
    // console.log(mock.history);
});

test('relay delegation tx', async () => {
    const cdt = new TerraDelegateTool();
    cdt.setNodeURL('mockNode');
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2').reply(
        200,
        {"height":"36034","result":{"type":"core/Account","value":{"address":"terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2","coins":[{"denom":"ukrw","amount":"138115381794"},{"denom":"uluna","amount":"144353828"},{"denom":"umnt","amount":"29685334"},{"denom":"usdr","amount":"112052"},{"denom":"uusd","amount":"18696"}],"public_key":null,"account_number":"542770","sequence":"116"}}},
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
    const uAtomAmount = 100000;
    const memo = 'some memo message';

    const txContext = {
        chainId: 'testing',
        bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2',
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
    const bts = txsterra.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txsterra.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "5000","denom": "uluna",},], gas: '200000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '542770');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '116');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'P+W+juLVFFDHLqi3a02eIecS46wEl4fvaTV0MbAWTjpTtJWy3/8aRMfTjZvkcD321M6FmwkN4hPclQGBu9XgMw==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('relay redelegation tx', async () => {
    const cdt = new TerraDelegateTool();
    cdt.setNodeURL('mockNode');

    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2').reply(
        200,
        {"height":"36034","result":{"type":"core/Account","value":{"address":"terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2","coins":[{"denom":"ukrw","amount":"138115381794"},{"denom":"uluna","amount":"144353828"},{"denom":"umnt","amount":"29685334"},{"denom":"usdr","amount":"112052"},{"denom":"uusd","amount":"18696"}],"public_key":null,"account_number":"542770","sequence":"116"}}},
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
    const uAtomAmount = 1000;
    const memo = 'some memo message - redelegate';

    const txContext = {
        chainId: 'testing',
        bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2',
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

    // Check uluna to shares conversion
    expect(unsignedTx.value.msg[0].value.amount).toEqual({ amount: '1000', denom: 'uluna' });

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txsterra.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txsterra.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "5000","denom": "uluna",},], gas: '200000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message - redelegate');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '542770');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '116');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'UvIPNBLm3JaGctGzEH3YKu199Rf+Z7UnAMFUfOo/VWgNDtTXIc8zZ1eLa62YOMJffwiOikYIme1Nfpk6cO0dcQ==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('relay undelegation tx', async () => {
    const cdt = new TerraDelegateTool();
    cdt.setNodeURL('mockNode');
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2').reply(
        200,
        {"height":"36034","result":{"type":"core/Account","value":{"address":"terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2","coins":[{"denom":"ukrw","amount":"138115381794"},{"denom":"uluna","amount":"144353828"},{"denom":"umnt","amount":"29685334"},{"denom":"usdr","amount":"112052"},{"denom":"uusd","amount":"18696"}],"public_key":null,"account_number":"542770","sequence":"116"}}},
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
    const uAtomAmount = 300;
    const memo = 'some memo message - undelegate';

    const txContext = {
        chainId: 'testing',
        bech32: 'terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2',
        pk: '028284dfb203d9a702eb6d60ea7bcf37b7099f66d363ac024a9b249859bfb7dc3e',
    };

    // Create a delegation transaction
    const unsignedTx = await cdt.txCreateUndelegate(
        txContext,
        validatorAddrBech32,
        uAtomAmount,
        memo,
    );

    // Check uluna to shares conversion
    expect(unsignedTx.value.msg[0].value.amount).toEqual({ amount: '300', denom: 'uluna' });

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txsterra.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txsterra.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/terra1kgddca7qj96z0qcxr2c45z73cfl0c75pael9y2');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "5000","denom": "uluna",},], gas: '200000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message - undelegate');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '542770');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '116');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        '3c+EplNp31UlUb5UHVlGF0LDStCcEhXJJQy5jphWbjU5K0OxZ7/Gx5UaxAVQc9yIdqESFNlm9spiIZGFPlTBQw==');
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

    const cdt = new TerraDelegateTool();
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

    const cdt = new TerraDelegateTool();
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
    mock.onGet('https://api.coingecko.com/api/v3/coins/terra-luna/tickers').reply(
        200,
        {"name":"Terra","tickers":[{"base":"LUNA","target":"KRW","market":{"name":"Bithumb","identifier":"bithumb","has_trading_incentive":false},"last":246.3,"volume":3991137.99789477,"converted_last":{"btc":2.611e-05,"eth":0.0010302,"usd":0.206589},"converted_volume":{"btc":104.199,"eth":4112,"usd":824527},"trust_score":"green","bid_ask_spread_percentage":0.181169,"timestamp":"2020-03-11T08:14:01+00:00","last_traded_at":"2020-03-11T08:14:01+00:00","last_fetch_at":"2020-03-11T08:14:01+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://www.bithumb.com/trade/order/LUNA_KRW","coin_id":"terra-luna"},{"base":"LUNA","target":"KRW","market":{"name":"Coinone","identifier":"coinone","has_trading_incentive":false},"last":246.0,"volume":4137850.1321,"converted_last":{"btc":2.609e-05,"eth":0.00102934,"usd":0.206333},"converted_volume":{"btc":107.939,"eth":4259,"usd":853773},"trust_score":"green","bid_ask_spread_percentage":0.809717,"timestamp":"2020-03-11T08:17:24+00:00","last_traded_at":"2020-03-11T08:17:24+00:00","last_fetch_at":"2020-03-11T08:17:24+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://coinone.co.kr/exchange/trade/luna/krw","coin_id":"terra-luna"},{"base":"LUNA","target":"KRW","market":{"name":"GDAC","identifier":"gdac","has_trading_incentive":false},"last":247.0,"volume":3204507.68692743,"converted_last":{"btc":2.615e-05,"eth":0.00103319,"usd":0.207039},"converted_volume":{"btc":83.809,"eth":3311,"usd":663459},"trust_score":"green","bid_ask_spread_percentage":0.644122,"timestamp":"2020-03-11T08:10:41+00:00","last_traded_at":"2020-03-11T08:10:41+00:00","last_fetch_at":"2020-03-11T08:10:41+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://www.gdac.com/exchange/LUNA/KRW","coin_id":"terra-luna"},{"base":"LUNA","target":"BTC","market":{"name":"KuCoin","identifier":"kucoin","has_trading_incentive":false},"last":2.597e-05,"volume":829576.70546428,"converted_last":{"btc":2.597e-05,"eth":0.00102594,"usd":0.205503},"converted_volume":{"btc":21.544107,"eth":851.097,"usd":170480},"trust_score":"green","bid_ask_spread_percentage":0.192308,"timestamp":"2020-03-11T08:12:09+00:00","last_traded_at":"2020-03-11T08:12:09+00:00","last_fetch_at":"2020-03-11T08:12:09+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://www.kucoin.com/trade/LUNA-BTC","coin_id":"terra-luna","target_coin_id":"bitcoin"},{"base":"LUNA","target":"USDT","market":{"name":"KuCoin","identifier":"kucoin","has_trading_incentive":false},"last":0.2051,"volume":974109.3716,"converted_last":{"btc":2.597e-05,"eth":0.00102578,"usd":0.205471},"converted_volume":{"btc":25.293726,"eth":999.225,"usd":200151},"trust_score":"green","bid_ask_spread_percentage":0.243427,"timestamp":"2020-03-11T08:12:09+00:00","last_traded_at":"2020-03-11T08:12:09+00:00","last_fetch_at":"2020-03-11T08:12:09+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://www.kucoin.com/trade/LUNA-USDT","coin_id":"terra-luna","target_coin_id":"tether"},{"base":"LUNA","target":"BTC","market":{"name":"Upbit","identifier":"upbit","has_trading_incentive":false},"last":2.555e-05,"volume":139401.48243045,"converted_last":{"btc":2.555e-05,"eth":0.00100958,"usd":0.201293},"converted_volume":{"btc":3.561708,"eth":140.737,"usd":28060},"trust_score":"green","bid_ask_spread_percentage":1.511042,"timestamp":"2020-03-11T08:05:54+00:00","last_traded_at":"2020-03-11T08:05:54+00:00","last_fetch_at":"2020-03-11T08:18:00+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://upbit.com/exchange?code=CRIX.UPBIT.BTC-LUNA","coin_id":"terra-luna","target_coin_id":"bitcoin"},{"base":"LUNA","target":"USDT","market":{"name":"Bithumb Global","identifier":"bithumb_global","has_trading_incentive":false},"last":0.204,"volume":1838925.0001666667,"converted_last":{"btc":2.583e-05,"eth":0.00101912,"usd":0.204283},"converted_volume":{"btc":47.493439,"eth":1874,"usd":375662},"trust_score":"yellow","bid_ask_spread_percentage":0.829673,"timestamp":"2020-03-11T08:17:23+00:00","last_traded_at":"2020-03-11T08:17:23+00:00","last_fetch_at":"2020-03-11T08:17:23+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://global.bithumb.pro/spot/trade;symbol=LUNA_USDT","coin_id":"terra-luna","target_coin_id":"tether"},{"base":"LUNA","target":"BTC","market":{"name":"Bitrue","identifier":"bitrue","has_trading_incentive":false},"last":2.569e-05,"volume":280510.19,"converted_last":{"btc":2.569e-05,"eth":0.00101488,"usd":0.203371},"converted_volume":{"btc":7.206307,"eth":284.684,"usd":57048},"trust_score":"yellow","bid_ask_spread_percentage":1.374705,"timestamp":"2020-03-11T08:10:09+00:00","last_traded_at":"2020-03-11T08:10:09+00:00","last_fetch_at":"2020-03-11T08:17:52+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://www.bitrue.com/trading?market=btc\u0026symbol=lunabtc","coin_id":"terra-luna","target_coin_id":"bitcoin"},{"base":"LUNA","target":"XRP","market":{"name":"Bitrue","identifier":"bitrue","has_trading_incentive":false},"last":0.9421,"volume":292365.1,"converted_last":{"btc":2.508e-05,"eth":0.00099065,"usd":0.198515},"converted_volume":{"btc":7.331525,"eth":289.631,"usd":58039},"trust_score":"yellow","bid_ask_spread_percentage":2.7379,"timestamp":"2020-03-11T08:10:13+00:00","last_traded_at":"2020-03-11T08:10:13+00:00","last_fetch_at":"2020-03-11T08:17:52+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://www.bitrue.com/trading?market=xrp\u0026symbol=lunaxrp","coin_id":"terra-luna","target_coin_id":"ripple"},{"base":"LUNA","target":"BTC","market":{"name":"Bittrex","identifier":"bittrex","has_trading_incentive":false},"last":2.577e-05,"volume":20.0,"converted_last":{"btc":2.577e-05,"eth":0.00101389,"usd":0.202716},"converted_volume":{"btc":0.0005154,"eth":0.02027777,"usd":4.05},"trust_score":"yellow","bid_ask_spread_percentage":3.473562,"timestamp":"2020-03-11T06:25:01+00:00","last_traded_at":"2020-03-11T06:25:01+00:00","last_fetch_at":"2020-03-11T08:17:56+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://bittrex.com/Market/Index?MarketName=BTC-LUNA","coin_id":"terra-luna","target_coin_id":"bitcoin"},{"base":"LUNA","target":"KRW","market":{"name":"GoPax","identifier":"gopax","has_trading_incentive":false},"last":252.9,"volume":3282.02633687,"converted_last":{"btc":2.682e-05,"eth":0.0010603,"usd":0.211408},"converted_volume":{"btc":0.08804,"eth":3.479937,"usd":693.85},"trust_score":"red","bid_ask_spread_percentage":4.624506,"timestamp":"2020-03-11T05:41:10+00:00","last_traded_at":"2020-03-11T05:41:10+00:00","last_fetch_at":"2020-03-11T08:15:06+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://www.gopax.co.kr/exchange/LUNA-KRW","coin_id":"terra-luna"},{"base":"LUNA","target":"BTC","market":{"name":"Upbit Indonesia ","identifier":"upbit_indonesia","has_trading_incentive":false},"last":2.555e-05,"volume":139732.77420322,"converted_last":{"btc":2.555e-05,"eth":0.00100968,"usd":0.201134},"converted_volume":{"btc":3.570172,"eth":141.086,"usd":28105},"trust_score":null,"bid_ask_spread_percentage":null,"timestamp":"2020-03-11T07:38:31+00:00","last_traded_at":"2020-03-11T07:38:31+00:00","last_fetch_at":"2020-03-11T08:18:02+00:00","is_anomaly":false,"is_stale":false,"trade_url":"https://id.upbit.com/exchange?code=CRIX.UPBIT.BTC-LUNA","coin_id":"terra-luna","target_coin_id":"bitcoin"}]},
    );

    const cdt = new TerraDelegateTool();
    const status = await cdt.getPrice();
    expect(status).toBe(0.206589);
});

test('get reward', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/distribution/delegators/terra1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mg7upyh/rewards/terravaloper1kgddca7qj96z0qcxr2c45z73cfl0c75paknc5e').reply(
        200,
        {"height":"0","result":[
                {
                    "denom": "ukrw",
                    "amount": "3700237612.530939417885000000"
                },
                {
                    "denom": "uluna",
                    "amount": "680.500568571405000000"
                },
                {
                    "denom": "umnt",
                    "amount": "279982.127375940540000000"
                },
                {
                    "denom": "usdr",
                    "amount": "892.011070447695000000"
                },
                {
                    "denom": "uusd",
                    "amount": "0.224932290630000000"
                }
            ]},
    );

    const cdt = new TerraDelegateTool();
    cdt.setNodeURL('mockNode');
    const status = await cdt.getRewards('terravaloper1kgddca7qj96z0qcxr2c45z73cfl0c75paknc5e', { bech32: 'terra1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mg7upyh' });
    expect(status).toBe("680.500568571405000000");
});
