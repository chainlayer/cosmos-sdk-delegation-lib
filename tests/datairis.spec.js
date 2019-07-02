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
import { IrisDelegateTool } from 'index.js';
// eslint-disable-next-line import/extensions,import/no-unresolved
import txsiris from 'iris.js';
import { getWallet, signWithMnemonic } from 'utils.js';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

test('get account info - default values', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {},
    );

    const cdt = new IrisDelegateTool();
    cdt.setNodeURL('mockNode');

    const addr = { bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp' };
    const answer = await cdt.getAccountInfo(addr);

    expect(answer).toHaveProperty('sequence', '0');
    expect(answer).toHaveProperty('accountNumber', '0');
    expect(answer).toHaveProperty('balanceirisatta', '0');
});

test('get account info - parsing', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/bank/accounts/someaddress').reply(
        200, {
            value: {
                sequence: 10,
                account_number: 20,
                coins: [{ amount: 15, denom: 'iris-atto' }, { amount: 20, denom: 'other' }],
            },
        },
    );

    const cdt = new IrisDelegateTool();
    cdt.setNodeURL('mockNode');

    const addr = { bech32: 'someaddress' };
    const answer = await cdt.getAccountInfo(addr);
    expect(answer).toHaveProperty('sequence', '10');
    expect(answer).toHaveProperty('accountNumber', '20');
    expect(answer).toHaveProperty('balanceirisatta', '15');
});

test('get multiple accounts', async () => {
    const cdt = new IrisDelegateTool();
    cdt.setNodeURL('mockNodeURL');

    const mock = new MockAdapter(axios);
    mock.onGet('mockNodeURL/stake/validators').reply(
        200, [
            {
                operator_address: 'some_validator_bech32',
                tokens: '123456789',
                delegator_shares: '123456789',
            },
            {
                operator_address: 'some_other_validator_bech32',
                tokens: '2222',
                delegator_shares: '4444',
            },
        ],
    );
    mock.onGet('mockNodeURL/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200, {
            value: {
                sequence: 12,
                account_number: 34,
                coins: [{ amount: 56, denom: 'iris-atto' }, { amount: 20, denom: 'other' }],
            },
        },
    );
    mock.onGet('mockNodeURL/stake/delegators/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp/delegations').reply(
        200, [
            {
                delegator_addr: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
                validator_addr: 'some_validator_bech32',
                shares: '1000',
                height: 0,
            },
            {
                delegator_addr: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
                validator_addr: 'some_other_validator_bech32',
                shares: '100',
                height: 0,
            },
        ],
    );
    mock.onGet('mockNodeURL/bank/accounts/cosmos19krh5y8y5wce3mmj3dxffyc7hgu9tsxndsmmml').reply(
        200, {
            value: {
                sequence: 67,
                account_number: 89,
                coins: [{ amount: 1011, denom: 'iris-atto' }, { amount: 20, denom: 'other' }],
            },
        },
    );
    mock.onGet('mockNodeURL/stake/delegators/cosmos19krh5y8y5wce3mmj3dxffyc7hgu9tsxndsmmml/delegations').reply(
        200, {},
    );

    const addrs = [
        { bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp' },
        { bech32: 'cosmos19krh5y8y5wce3mmj3dxffyc7hgu9tsxndsmmml' },
    ];

    const reply = await cdt.retrieveBalances(addrs);
    // console.log(JSON.stringify(reply, null, 4));

    expect(reply[0]).toHaveProperty('sequence', '12');
    expect(reply[0]).toHaveProperty('accountNumber', '34');
    expect(reply[0]).toHaveProperty('balanceirisatta', '56');
    expect(reply[0]).toHaveProperty('delegationsTotaluAtoms', '1050');
    expect(reply[0]).toHaveProperty('delegations');
    expect(Object.keys(reply[0].delegations).length).toEqual(2);

    expect(reply[1]).toHaveProperty('sequence', '67');
    expect(reply[1]).toHaveProperty('accountNumber', '89');
    expect(reply[1]).toHaveProperty('balanceirisatta', '1011');
    expect(reply[1]).toHaveProperty('delegationsTotaluAtoms', '0');
    expect(reply[1]).toHaveProperty('delegations');
    expect(Object.keys(reply[1].delegations).length).toEqual(0);
});

test('create delegate tx', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {
            value: {
                sequence: 10,
                account_number: 20,
                coins: [{ amount: 15, denom: 'uatom' }, { amount: 20, denom: 'other' }],
            },
        },
    );

    const cdt = new IrisDelegateTool();
    cdt.setNodeURL('mockNode');

    const txContext = {
        chainId: 'testing',
        bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
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
    expect(mock.history.get[0].url).toEqual('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');

    // txContext is kept and two new fields appear
    expect(txContext).toHaveProperty('chainId', 'testing');
    expect(txContext).toHaveProperty('bech32', 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');
    expect(txContext).toHaveProperty('accountNumber', '20');
    expect(txContext).toHaveProperty('sequence', '10');

    expect(unsignedTx).toHaveProperty('type', 'auth/StdTx');
    expect(unsignedTx).toHaveProperty('value');
    expect(unsignedTx.value).toHaveProperty('memo', 'some message');
    expect(unsignedTx.value.msg).toHaveProperty('length', 1);
    expect(unsignedTx.value.msg[0]).toHaveProperty('type', 'irishub/stake/MsgDelegate');
    expect(unsignedTx.value.msg[0].value).toHaveProperty('delegation', { amount: '8765000000000000000000', denom: 'iris-atto' });
    expect(unsignedTx.value.msg[0].value).toHaveProperty('delegator_addr', 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');
    expect(unsignedTx.value.msg[0].value).toHaveProperty('validator_addr', 'cosmosvaloper1zyp0axz2t55lxkmgrvg4vpey2rf4ratcsud07t');
});

test('get bytes to sign', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {},
    );

    const cdt = new IrisDelegateTool();
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

    const bytesToSign = txsiris.getBytesToSign(dummyTx, txContext);

    // console.log(bytesToSign);
    // console.log(mock.history);
});

test('relay delegation tx', async () => {
    const cdt = new IrisDelegateTool();
    cdt.setNodeURL('mockNode');
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {
            value: {
                sequence: 10,
                account_number: 20,
                coins: [{ amount: 15, denom: 'uatom' }, { amount: 20, denom: 'other' }],
            },
        },
    );
    mock.onPost('mockNode/tx/broadcast').reply(
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
    const bts = txsiris.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txsiris.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/tx/broadcast');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "300000000000000000","denom": "iris-atto",},], gas: '50000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '20');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '10');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'KRHnvK9i9FejLITbOKcF1PrBjYkukymK4ZVtL/+pl49/BQiWQONurqEljX4+q6JCjujevQj/hqNE0NG1jsR2bg==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('relay redelegation tx', async () => {
    const cdt = new IrisDelegateTool();
    cdt.setNodeURL('mockNode');

    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {
            value: {
                sequence: 10,
                account_number: 20,
                coins: [{ amount: 15, denom: 'uatom' }, { amount: 20, denom: 'other' }],
            },
        },
    );
    mock.onPost('mockNode/tx/broadcast').reply(
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
    expect(unsignedTx.value.msg[0].value.delegation).toEqual({ amount: '1000000000000000000000', denom: 'iris-atto' });

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txsiris.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txsiris.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/tx/broadcast');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "300000000000000000","denom": "iris-atto",},], gas: '50000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message - redelegate');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '20');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '10');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'e1Lg8sLqlHvBPOYxtf2L2PbJGc+s3zVb2f7C2927jc9G9slR/5G6mJn9Tc7RiapiXXmt+eOUgMf9bnz4Lk/wxQ==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('relay undelegation tx', async () => {
    const cdt = new IrisDelegateTool();
    cdt.setNodeURL('mockNode');
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {
            value: {
                sequence: 10,
                account_number: 20,
                coins: [{ amount: 15, denom: 'uatom' }, { amount: 20, denom: 'other' }],
            },
        },
    );
    mock.onPost('mockNode/tx/broadcast').reply(
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
    expect(unsignedTx.value.msg[0].value.delegation).toEqual({ amount: '300000000000000000000', denom: 'iris-atto' });

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txsiris.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txsiris.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/bank/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/tx/broadcast');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "300000000000000000","denom": "iris-atto",},], gas: '50000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message - undelegate');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '20');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '10');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'CEO7pFx2vxdXNgnFJ3siuAKEBFhufcTAHlRLUjvatz5ZWXUKHC9PXmhZiXjUiWhAMgWKed7ZXfMd0YcQOAWkHQ==');
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

    const cdt = new IrisDelegateTool();
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

    const cdt = new IrisDelegateTool();
    cdt.setNodeURL('mockNode');

    const txHash = '0F3C6CD851701FAF3EE104ECD35D0B38D9AB91A32AC7D51B424F90954341C8EB';
    const status = await cdt.txStatus(txHash);

    expect(status).toHaveProperty('height', '228759');
    expect(status).toHaveProperty('txhash', '0F3C6CD851701FAF3EE104ECD35D0B38D9AB91A32AC7D51B424F90954341C8EB');
    expect(status).toHaveProperty('gas_wanted', '200000');
    expect(status).toHaveProperty('gas_used', '89709');
    expect(status).toHaveProperty('timestamp', '2019-05-10T20:28:07Z');
});
