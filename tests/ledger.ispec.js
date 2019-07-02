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
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
let cdt;

// TODO: Add tests for iris and terra

test('connect', async () => {
    const transport = await TransportNodeHid.create(1000);
    cdt = new CosmosDelegateTool(transport);

    await cdt.connect();

    expect(cdt.connected).toBe(true);
    expect(cdt.lastError).toBe(null);
});

test('get address', async () => {

    const addr = await cdt.retrieveAddress(0, 0);
    expect(addr.pk).toBe('02010354882d60024c797bf17359adf3e3284eabaaed7ec448324e4809f2644a2a');
    expect(addr.bech32).toBe('cosmos1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mw6xpxh');
    expect(addr.path).toEqual([44, 118, 0, 0, 0]);
});

test('get balance', async () => {

    const addr = await cdt.retrieveAddress(0, 0);
    expect(addr.pk).toBe('02010354882d60024c797bf17359adf3e3284eabaaed7ec448324e4809f2644a2a');
    expect(addr.bech32).toBe('cosmos1zwp97t7kx6sgk5yz6ad9ajqyndd8lv0mw6xpxh');
    expect(addr.path).toEqual([44, 118, 0, 0, 0]);

    cdt.setNodeURL('https://stargate.cosmos.network');
    const accountInfo = await cdt.getAccountInfo(addr);
    // console.log(accountInfo);
});

test('scan addresses', async () => {
    jest.setTimeout(45000);

    const addrs = await cdt.scanAddresses(0, 1, 2, 3);
    expect(addrs.length).toEqual(4);

    expect(addrs[0].pk).toBe('02586131117976d0c5e33a814ace17ba2a104d04e3c22ef54ee233503ba75dbc83');
    expect(addrs[0].bech32).toBe('cosmos1swnnldn2ecx0xp9ewjtvptlpa8ddq07t2t87v5');
    expect(addrs[0].path).toEqual([44, 118, 0, 0, 2]);

    // TODO: Fix in ledger lib.. consistency in PK

    expect(addrs[3].pk).toBe('03173104447d06a2af635e8db85a92671bc7444afe674f421588b559cc558d9c5f');
    expect(addrs[3].bech32).toBe('cosmos1llpm00nn6mgg2r5j7ns78thdllqssdd3n0zhy6');
    expect(addrs[3].path).toEqual([44, 118, 1, 0, 3]);

    // expect(addrs[3].pk).toBe('033222fc61795077791665544a90740e8ead638a391a3b8f9261f4a226b396c042');
    // expect(addrs[3].bech32).toBe('cosmos1qvw52lmn9gpvem8welghrkc52m3zczyhlqjsl7');
    // expect(addrs[3].path).toEqual([44, 118, 1, 0, 3]);

    // console.log(addrs);
});

test('scan and get balances', async () => {
    jest.setTimeout(45000);


    const addrs = await cdt.scanAddresses(0, 0, 2, 3);
    expect(addrs.length).toEqual(2);

    cdt.setNodeURL('https://stargate.cosmos.network');
    const reply = await cdt.retrieveBalances(addrs);

    // console.log(reply);
});

test('sign tx', async () => {
    // retrieving many public keys can be slow
    jest.setTimeout(45000);


    const txContext = {
        chainId: 'some_chain',
        path: [44, 118, 0, 0, 0],
        bech32: 'cosmos1k7ezdfu3j69npzhccs6m4hu99pydagsva0h0gp',
        pk: '034fef9cd7c4c63588d3b03feb5281b9d232cba34d6f3d71aee59211ffbfe1fe87',
    };

    const dummyTx = await cdt.txCreateDelegate(
        txContext,
        'validatorAddress',
        100,
        'some_memo',
    );

    const signedTx = await cdt.sign(dummyTx, txContext);
    // console.log(signedTx);
});
