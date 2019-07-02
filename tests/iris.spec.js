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
// eslint-disable-next-line import/no-unresolved
import txsiris from 'iris';

test('create Skeleton', async () => {
    const txContext = {
        accountNumber: 0,
        sequence: 0,
        chainId: 'test_chain',
    };

    const txSkeleton = txsiris.createSkeleton(txContext);
    // console.log(txSkeleton);

    expect('type' in txSkeleton).toBe(true);
    expect('value' in txSkeleton).toBe(true);
    // TODO: This test could be removed when we move to Typescript
});

test('canonical JSON', async () => {
    const txContext = {
        accountNumber: 0,
        sequence: 0,
        chainId: 'test_chain',
    };

    const tx = txsiris.createSkeleton(txContext);
    const jsonStr = txsiris.getBytesToSign(tx, txContext);

    const expectedJsonStr = '{"account_number":"0","chain_id":"test_chain","fee":{"amount":[{"amount":"300000000000000000","denom":"iris-atto"}],"gas":"50000"},"memo":"Delegation to ChainLayer.io","msgs":[],"sequence":"0"}'
    expect(jsonStr).toBe(expectedJsonStr);
    // console.log(jsonStr);
});

test('delegate', async () => {
    const txContext = {
        bech32: 'my_addr',
        chainId: 'test_chain',
        accountNumber: '9',
        sequence: '7',
    };
    const txDelegation = txsiris.createDelegate(
        txContext,
        'val_addr',
        100,
        'some_memo',
    );

    const jsonStr = JSON.stringify(txDelegation);
    const expectedJsonStr = '{"type":"auth/StdTx","value":{"msg":[{"type":"irishub/stake/MsgDelegate","value":{"delegation":{"amount":"100","denom":"iris-atto"},"delegator_addr":"my_addr","validator_addr":"val_addr"}}],"fee":{"amount":[{"amount":"300000000000000000","denom":"iris-atto"}],"gas":"50000"},"memo":"some_memo","signatures":[{"signature":"N/A","account_number":"9","sequence":"7","pub_key":{"type":"tendermint/PubKeySecp256k1","value":"PK"}}]}}';

    // console.log(JSON.stringify(txDelegation, null, 2));
    expect(jsonStr).toBe(expectedJsonStr);
});

test('redelegate', async () => {
    const txContext = {
        bech32: 'my_addr',
        chainId: 'test_chain',
        accountNumber: '3',
        sequence: '2',
    };
    const txDelegation = txsiris.createRedelegate(
        txContext,
        'val_addr_source',
        'val_addr_dest',
        100,
        'some_memo',
    );

    const jsonStr = JSON.stringify(txDelegation);
    const expectedJsonStr = '{"type":"auth/StdTx","value":{"msg":[{"type":"irishub/stake/MsgBeginRedelegate","value":{"delegation":{"amount":"100","denom":"iris-atto"},"delegator_addr":"my_addr","validator_dst_addr":"val_addr_dest","validator_src_addr":"val_addr_source"}}],"fee":{"amount":[{"amount":"300000000000000000","denom":"iris-atto"}],"gas":"50000"},"memo":"some_memo","signatures":[{"signature":"N/A","account_number":"3","sequence":"2","pub_key":{"type":"tendermint/PubKeySecp256k1","value":"PK"}}]}}';

    // console.log(JSON.stringify(txDelegation, null, 2));
    expect(jsonStr).toBe(expectedJsonStr);
});

test('undelegate', async () => {
    const txContext = {
        bech32: 'my_addr',
        chainId: 'test_chain',
        accountNumber: '5',
        sequence: '6',
    };
    const txDelegation = txsiris.createUndelegate(
        txContext,
        'val_addr',
        100,
        'some_memo',
    );

    const jsonStr = JSON.stringify(txDelegation);
    const expectedJsonStr = '{"type":"auth/StdTx","value":{"msg":[{"type":"irishub/stake/MsgUndelegate","value":{"delegation":{"amount":"100","denom":"iris-atto"},"delegator_addr":"my_addr","validator_addr":"val_addr"}}],"fee":{"amount":[{"amount":"300000000000000000","denom":"iris-atto"}],"gas":"50000"},"memo":"some_memo","signatures":[{"signature":"N/A","account_number":"5","sequence":"6","pub_key":{"type":"tendermint/PubKeySecp256k1","value":"PK"}}]}}';

    // console.log(JSON.stringify(txDelegation, null, 2));
    expect(jsonStr).toBe(expectedJsonStr);
});

test('get bytes to sign', async () => {
    const txContext = {
        accountNumber: '0',
        sequence: '0',
        chainId: 'test_chain',
    };
    const txDelegation = txsiris.createDelegate(
        txContext,
        'val_addr',
        100,
        'some_memo',
    );

    const jsonStr = txsiris.getBytesToSign(txDelegation, txContext);
    const expectedJsonStr = '{"account_number":"0","chain_id":"test_chain","fee":{"amount":[{"amount":"300000000000000000","denom":"iris-atto"}],"gas":"50000"},"memo":"some_memo","msgs":[{"type":"irishub/stake/MsgDelegate","value":{"delegation":{"amount":"100","denom":"iris-atto"},"validator_addr":"val_addr"}}],"sequence":"0"}';
    // console.log(jsonStr);
    expect(jsonStr).toBe(expectedJsonStr);
});
