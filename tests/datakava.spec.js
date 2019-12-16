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
import { KavaDelegateTool } from 'index.js';
// eslint-disable-next-line import/extensions,import/no-unresolved
import txskava from 'kava.js';
import { getWallet, signWithMnemonic } from 'utils.js';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

test('get account info - default values', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {},
    );

    const cdt = new KavaDelegateTool();
    cdt.setNodeURL('mockNode');

    const addr = { bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp' };
    const answer = await cdt.getAccountInfo(addr);

    expect(answer).toHaveProperty('sequence', '0');
    expect(answer).toHaveProperty('accountNumber', '0');
    expect(answer).toHaveProperty('balance', '0');
});

test('get account info - parsing', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss').reply(
        200,
        {"height":"388749","result":{"type":"cosmos-sdk/ValidatorVestingAccount","value":{"PeriodicVestingAccount":{"BaseVestingAccount":{"BaseAccount":{"address":"kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss","coins":[{"denom":"ukava","amount":"535343"}],"public_key":{"type":"tendermint/PubKeySecp256k1","value":"AgEDVIgtYAJMeXvxc1mt8+MoTquq7X7ESDJOSAnyZEoq"},"account_number":"102","sequence":"9"},"original_vesting":[{"denom":"ukava","amount":"40000000000"}],"delegated_free":[{"denom":"ukava","amount":"220000000"}],"delegated_vesting":[{"denom":"ukava","amount":"40000000000"}],"end_time":"1636120800"},"start_time":"1572962400","vesting_periods":[{"length":"15724800","amount":[{"denom":"ukava","amount":"20000000000"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7689600","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333335"}]}]},"validator_address":"kavavalcons1t96etjrz0ye5ctf4p7g0ks3apdhuleuenxe06y","return_address":"kava1qvsus5qg8yhre7k2c78xkkw4nvqqgev7ezrja8","signing_threshold":"90","current_period_progress":{"missed_blocks":"0","total_blocks":"388750"},"vesting_period_progress":[{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false}],"debt_after_failed_vesting":[]}}},
    );

    const cdt = new KavaDelegateTool();
    cdt.setNodeURL('mockNode');

    const addr = { bech32: 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss' };
    const answer = await cdt.getAccountInfo(addr);

    expect(answer).toHaveProperty('sequence', '9');
    expect(answer).toHaveProperty('accountNumber', '102');
    expect(answer).toHaveProperty('balance', '535343');
});

// test('get multiple accounts', async () => {
//     const cdt = new KavaDelegateTool();
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
//     mock.onGet('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss').reply(
//         200,
//         {"height":"388749","result":{"type":"cosmos-sdk/ValidatorVestingAccount","value":{"PeriodicVestingAccount":{"BaseVestingAccount":{"BaseAccount":{"address":"kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss","coins":[{"denom":"ukava","amount":"535343"}],"public_key":{"type":"tendermint/PubKeySecp256k1","value":"AgEDVIgtYAJMeXvxc1mt8+MoTquq7X7ESDJOSAnyZEoq"},"account_number":"102","sequence":"9"},"original_vesting":[{"denom":"ukava","amount":"40000000000"}],"delegated_free":[{"denom":"ukava","amount":"220000000"}],"delegated_vesting":[{"denom":"ukava","amount":"40000000000"}],"end_time":"1636120800"},"start_time":"1572962400","vesting_periods":[{"length":"15724800","amount":[{"denom":"ukava","amount":"20000000000"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7689600","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333335"}]}]},"validator_address":"kavavalcons1t96etjrz0ye5ctf4p7g0ks3apdhuleuenxe06y","return_address":"kava1qvsus5qg8yhre7k2c78xkkw4nvqqgev7ezrja8","signing_threshold":"90","current_period_progress":{"missed_blocks":"0","total_blocks":"388750"},"vesting_period_progress":[{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false}],"debt_after_failed_vesting":[]}}},
//     );
//     mock.onGet('mockNodeURL/staking/delegators/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp/delegations').reply(
//         200, {"height":"22960","result": [
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
//         ]},
//     );
//     mock.onGet('mockNodeURL/auth/accounts/cosmos19krh5y8y5wce3mmj3dxffyc7hgu9tsxndsmmml').reply(
//         200, {
//             value: {
//                 sequence: 67,
//                 account_number: 89,
//                 coins: [{ amount: 1011, denom: 'ukava' }, { amount: 20, denom: 'other' }],
//             },
//         },
//     );
//     mock.onGet('mockNodeURL/staking/delegators/cosmos19krh5y8y5wce3mmj3dxffyc7hgu9tsxndsmmml/delegations').reply(
//         200, {},
//     );
//
//     const addrs = [
//         { bech32: 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss' },
//         { bech32: 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss' },
//     ];
//
//     const reply = await cdt.retrieveBalances(addrs);
//     console.log(reply)
//     expect(reply[0].result.value.PeriodicVestingAccount.BaseVestingAccount.BaseAccount).toHaveProperty('sequence', '12');
//     expect(reply[0].result.value.PeriodicVestingAccount.BaseVestingAccount.BaseAccount).toHaveProperty('accountNumber', '34');
//     expect(reply[0]).toHaveProperty('balance', '56');
//     expect(reply[0]).toHaveProperty('delegationsTotal', '1050');
//     expect(reply[0]).toHaveProperty('delegations');
//     expect(Object.keys(reply[0].delegations).length).toEqual(2);
//
//     expect(reply.result.value.PeriodicVestingAccount.BaseVestingAccount.BaseAccount).toHaveProperty('sequence', '12');
//     expect(reply.result.value.PeriodicVestingAccount.BaseVestingAccount.BaseAccount).toHaveProperty('accountNumber', '34');
//     expect(reply[1]).toHaveProperty('balance', '1011');
//     expect(reply[1]).toHaveProperty('delegationsTotal', '0');
//     expect(reply[1]).toHaveProperty('delegations');
//     expect(Object.keys(reply[1].delegations).length).toEqual(0);
// });

test('create delegate tx', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss').reply(
        200,
        {"height":"388749","result":{"type":"cosmos-sdk/ValidatorVestingAccount","value":{"PeriodicVestingAccount":{"BaseVestingAccount":{"BaseAccount":{"address":"kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss","coins":[{"denom":"ukava","amount":"535343"}],"public_key":{"type":"tendermint/PubKeySecp256k1","value":"AgEDVIgtYAJMeXvxc1mt8+MoTquq7X7ESDJOSAnyZEoq"},"account_number":"102","sequence":"9"},"original_vesting":[{"denom":"ukava","amount":"40000000000"}],"delegated_free":[{"denom":"ukava","amount":"220000000"}],"delegated_vesting":[{"denom":"ukava","amount":"40000000000"}],"end_time":"1636120800"},"start_time":"1572962400","vesting_periods":[{"length":"15724800","amount":[{"denom":"ukava","amount":"20000000000"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7689600","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333335"}]}]},"validator_address":"kavavalcons1t96etjrz0ye5ctf4p7g0ks3apdhuleuenxe06y","return_address":"kava1qvsus5qg8yhre7k2c78xkkw4nvqqgev7ezrja8","signing_threshold":"90","current_period_progress":{"missed_blocks":"0","total_blocks":"388750"},"vesting_period_progress":[{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false}],"debt_after_failed_vesting":[]}}},
    );

    const cdt = new KavaDelegateTool();
    cdt.setNodeURL('mockNode');

    const txContext = {
        chainId: 'testing',
        bech32: 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss',
    };

    const validatorAddrBech32 = 'kavavaloper1kgddca7qj96z0qcxr2c45z73cfl0c75p27tsg6';
    const ukavaAmount = 8765000000;
    const memo = 'some message';

    const unsignedTx = await cdt.txCreateDelegate(
        txContext,
        validatorAddrBech32,
        ukavaAmount,
        memo,
    );

    // console.log(JSON.stringify(unsignedTx, null, 4));

    // A call to retrieve account data is made
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss');

    // txContext is kept and two new fields appear
    expect(txContext).toHaveProperty('chainId', 'testing');
    expect(txContext).toHaveProperty('bech32', 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss');
    expect(txContext).toHaveProperty('accountNumber', '102');
    expect(txContext).toHaveProperty('sequence', '9');

    expect(unsignedTx).toHaveProperty('type', 'auth/StdTx');
    expect(unsignedTx).toHaveProperty('value');
    expect(unsignedTx.value).toHaveProperty('memo', 'some message');
    expect(unsignedTx.value.msg).toHaveProperty('length', 1);
    expect(unsignedTx.value.msg[0]).toHaveProperty('type', 'cosmos-sdk/MsgDelegate');
    expect(unsignedTx.value.msg[0].value).toHaveProperty('amount', { amount: '8765000000', denom: 'ukava' });
    expect(unsignedTx.value.msg[0].value).toHaveProperty('delegator_address', 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss');
    expect(unsignedTx.value.msg[0].value).toHaveProperty('validator_address', 'kavavaloper1kgddca7qj96z0qcxr2c45z73cfl0c75p27tsg6');
});

test('get bytes to sign', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp').reply(
        200,
        {},
    );

    const cdt = new KavaDelegateTool();
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

    const bytesToSign = txskava.getBytesToSign(dummyTx, txContext);

    // console.log(bytesToSign);
    // console.log(mock.history);
});

test('relay delegation tx', async () => {
    const cdt = new KavaDelegateTool();
    cdt.setNodeURL('mockNode');
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss').reply(
        200,
        {"height":"388749","result":{"type":"cosmos-sdk/ValidatorVestingAccount","value":{"PeriodicVestingAccount":{"BaseVestingAccount":{"BaseAccount":{"address":"kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss","coins":[{"denom":"ukava","amount":"535343"}],"public_key":{"type":"tendermint/PubKeySecp256k1","value":"AgEDVIgtYAJMeXvxc1mt8+MoTquq7X7ESDJOSAnyZEoq"},"account_number":"102","sequence":"9"},"original_vesting":[{"denom":"ukava","amount":"40000000000"}],"delegated_free":[{"denom":"ukava","amount":"220000000"}],"delegated_vesting":[{"denom":"ukava","amount":"40000000000"}],"end_time":"1636120800"},"start_time":"1572962400","vesting_periods":[{"length":"15724800","amount":[{"denom":"ukava","amount":"20000000000"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7689600","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333335"}]}]},"validator_address":"kavavalcons1t96etjrz0ye5ctf4p7g0ks3apdhuleuenxe06y","return_address":"kava1qvsus5qg8yhre7k2c78xkkw4nvqqgev7ezrja8","signing_threshold":"90","current_period_progress":{"missed_blocks":"0","total_blocks":"388750"},"vesting_period_progress":[{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false}],"debt_after_failed_vesting":[]}}},
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
    const ukavaAmount = 100000000000;
    const memo = 'some memo message';

    const txContext = {
        chainId: 'testing',
        bech32: 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss',
        pk: '028284dfb203d9a702eb6d60ea7bcf37b7099f66d363ac024a9b249859bfb7dc3e',
    };

    // Create a delegation transaction
    const unsignedTx = await cdt.txCreateDelegate(
        txContext,
        validatorAddrBech32,
        ukavaAmount,
        memo,
    );

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txskava.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txskava.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "7000","denom": "ukava",},], gas: '280000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '102');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '9');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'Y1+ADjSTTfp9Z5PaH+bFvmsHHnpD2fdJpl3QHBtHBJNtTMxWWRgw6Z/9osIiSb0s7R5c8frrDRBXs4JvoDIbGQ==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('relay redelegation tx', async () => {
    const cdt = new KavaDelegateTool();
    cdt.setNodeURL('mockNode');

    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss').reply(
        200,
        {"height":"388749","result":{"type":"cosmos-sdk/ValidatorVestingAccount","value":{"PeriodicVestingAccount":{"BaseVestingAccount":{"BaseAccount":{"address":"kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss","coins":[{"denom":"ukava","amount":"535343"}],"public_key":{"type":"tendermint/PubKeySecp256k1","value":"AgEDVIgtYAJMeXvxc1mt8+MoTquq7X7ESDJOSAnyZEoq"},"account_number":"102","sequence":"9"},"original_vesting":[{"denom":"ukava","amount":"40000000000"}],"delegated_free":[{"denom":"ukava","amount":"220000000"}],"delegated_vesting":[{"denom":"ukava","amount":"40000000000"}],"end_time":"1636120800"},"start_time":"1572962400","vesting_periods":[{"length":"15724800","amount":[{"denom":"ukava","amount":"20000000000"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7689600","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333335"}]}]},"validator_address":"kavavalcons1t96etjrz0ye5ctf4p7g0ks3apdhuleuenxe06y","return_address":"kava1qvsus5qg8yhre7k2c78xkkw4nvqqgev7ezrja8","signing_threshold":"90","current_period_progress":{"missed_blocks":"0","total_blocks":"388750"},"vesting_period_progress":[{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false}],"debt_after_failed_vesting":[]}}},
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
    const ukavaAmount = 1000000000;
    const memo = 'some memo message - redelegate';

    const txContext = {
        chainId: 'testing',
        bech32: 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss',
        pk: '028284dfb203d9a702eb6d60ea7bcf37b7099f66d363ac024a9b249859bfb7dc3e',
    };

    // Create a delegation transaction
    const unsignedTx = await cdt.txCreateRedelegate(
        txContext,
        validatorAddrBech32Source,
        validatorAddrBech32Dest,
        ukavaAmount,
        memo,
    );

    // Check ukava to shares conversion
    expect(unsignedTx.value.msg[0].value.amount).toEqual({ amount: '1000000000', denom: 'ukava' });

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txskava.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txskava.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "7000","denom": "ukava",},], gas: '280000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message - redelegate');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '102');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '9');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'R+LdPlZ2YUH3r5wRcpak1qFzGRu0rSsKwlNZxv9WWStPBLnI58JeiZlEvmtzwex6e+PArvHHAr98vld+CDFecg==');
    expect(postData.tx.signatures[0]).toHaveProperty('pub_key', {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AoKE37ID2acC621g6nvPN7cJn2bTY6wCSpskmFm/t9w+',
    });
});

test('relay undelegation tx', async () => {
    const cdt = new KavaDelegateTool();
    cdt.setNodeURL('mockNode');
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss').reply(
        200,
        {"height":"388749","result":{"type":"cosmos-sdk/ValidatorVestingAccount","value":{"PeriodicVestingAccount":{"BaseVestingAccount":{"BaseAccount":{"address":"kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss","coins":[{"denom":"ukava","amount":"535343"}],"public_key":{"type":"tendermint/PubKeySecp256k1","value":"AgEDVIgtYAJMeXvxc1mt8+MoTquq7X7ESDJOSAnyZEoq"},"account_number":"102","sequence":"9"},"original_vesting":[{"denom":"ukava","amount":"40000000000"}],"delegated_free":[{"denom":"ukava","amount":"220000000"}],"delegated_vesting":[{"denom":"ukava","amount":"40000000000"}],"end_time":"1636120800"},"start_time":"1572962400","vesting_periods":[{"length":"15724800","amount":[{"denom":"ukava","amount":"20000000000"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7689600","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333333"}]},{"length":"7948800","amount":[{"denom":"ukava","amount":"3333333335"}]}]},"validator_address":"kavavalcons1t96etjrz0ye5ctf4p7g0ks3apdhuleuenxe06y","return_address":"kava1qvsus5qg8yhre7k2c78xkkw4nvqqgev7ezrja8","signing_threshold":"90","current_period_progress":{"missed_blocks":"0","total_blocks":"388750"},"vesting_period_progress":[{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false},{"period_complete":false,"vesting_successful":false}],"debt_after_failed_vesting":[]}}},
    );
    mock.onPost('mockNode/txs').reply(
        200,
        {
            txhash: 'EE5F3404034C524501629B56E0DDC38FAD651F04',
            height: '1928',
        },
    );

    // ////////////////////

    const validatorAddrBech32 = 'kavavaloper1kgddca7qj96z0qcxr2c45z73cfl0c75p27tsg6';
    const ukavaAmount = 300000000;
    const memo = 'some memo message - undelegate';

    const txContext = {
        chainId: 'testing',
        bech32: 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss',
        pk: '028284dfb203d9a702eb6d60ea7bcf37b7099f66d363ac024a9b249859bfb7dc3e',
    };

    // Create a delegation transaction
    const unsignedTx = await cdt.txCreateUndelegate(
        txContext,
        validatorAddrBech32,
        ukavaAmount,
        memo,
    );

    // Check ukava to shares conversion
    expect(unsignedTx.value.msg[0].value.amount).toEqual({ amount: '300000000', denom: 'ukava' });

    // Sign locally using mnemonic
    const mnemonic = 'table artist summer collect crack cruel '
        + 'lunar love gorilla road peanut wrestle '
        + 'system skirt shoulder female claim cannon '
        + 'price frost pole fury ranch fabric';
    const wallet = getWallet(mnemonic);
    expect(wallet.publicKey).toEqual(txContext.pk);
    const bts = txskava.getBytesToSign(unsignedTx, txContext);
    const signature = signWithMnemonic(bts, wallet);

    // Now apply signature
    const signedTx = txskava.applySignature(unsignedTx, txContext, signature);

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
    expect(mock.history.get[0].url).toEqual('mockNode/auth/accounts/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss');

    // Check what was posted
    expect(mock.history.post[0].url).toEqual('mockNode/txs');
    expect(mock.history.post[0]).toHaveProperty('data');
    const postData = JSON.parse(mock.history.post[0].data);

    // console.log(postData.tx.signatures);
    expect(postData).toHaveProperty('mode', 'async');
    expect(postData).toHaveProperty('tx');
    expect(postData.tx).toHaveProperty('msg');
    expect(postData.tx).toHaveProperty('fee', { amount: [{"amount": "7000","denom": "ukava",},], gas: '280000' });
    expect(postData.tx).toHaveProperty('memo', 'some memo message - undelegate');
    expect(postData.tx).toHaveProperty('signatures');
    expect(postData.tx.signatures[0]).toHaveProperty('account_number', '102');
    expect(postData.tx.signatures[0]).toHaveProperty('sequence', '9');
    expect(postData.tx.signatures[0]).toHaveProperty('signature',
        'B4Uqms6Sr5VZklatiCPn8ILJXD3Pmd89mj5Ic3RS6XJTWamTeAwGMqTkBzdB/vmG0B3zW0pCT+NaDRtE2DdxpA==');
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

    const cdt = new KavaDelegateTool();
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

    const cdt = new KavaDelegateTool();
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
    //mock.onGet('https://min-api.cryptocompare.com/data/price?fsym=KAVA&tsyms=USD').reply(
    mock.onGet('https://api.coingecko.com/api/v3/simple/price?ids=kava&vs_currencies=USD').reply(
        200,
        {
            "kava": {
                "usd": 1.11
            }
        },
    );

    const cdt = new KavaDelegateTool();
    const status = await cdt.getPrice();
    expect(status).toBe(1.11);
});

test('get reward', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('mockNode/distribution/delegators/kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss/rewards').reply(
        200,
        {"height":"0","result":{"rewards":[{"validator_address":"kavavaloper1kgddca7qj96z0qcxr2c45z73cfl0c75p27tsg6","reward":[{"denom":"ukava","amount":"95554240.447329029260000000"}]}],"total":[{"denom":"ukava","amount":"95554240.447329029260000000"}]}},
    );

    const cdt = new KavaDelegateTool();
    cdt.setNodeURL('mockNode');
    const status = await cdt.getRewards({ bech32: 'kava1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mj0juss' });
    expect(status).toBe("95554240.447329029260000000");
});
