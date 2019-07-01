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
import CosmosDelegateTool from 'index.js';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

test('connect', async () => {
    const transport = await TransportNodeHid.create(1000);
    const cdt = new CosmosDelegateTool(transport);

    await cdt.connect();

    expect(cdt.connected).toBe(true);
    expect(cdt.lastError).toBe(null);
});

test('get address', async () => {
    const transport = await TransportNodeHid.create(1000);
    const cdt = new CosmosDelegateTool(transport);

    await cdt.connect();
    expect(cdt.connected).toBe(true);
    expect(cdt.lastError).toBe(null);

    const addr = await cdt.retrieveAddress(0, 0);
    expect(addr.pk).toBe('034fef9cd7c4c63588d3b03feb5281b9d232cba34d6f3d71aee59211ffbfe1fe87');
    expect(addr.bech32).toBe('cosmos1w34k53py5v5xyluazqpq65agyajavep2rflq6h');
    expect(addr.path).toEqual([44, 118, 0, 0, 0]);
});

test('get balance', async () => {
    const transport = await TransportNodeHid.create(1000);
    const cdt = new CosmosDelegateTool(transport);

    // retrieving many public keys can be slow
    jest.setTimeout(10000);

    await cdt.connect();
    expect(cdt.connected).toBe(true);
    expect(cdt.lastError).toBe(null);

    const addr = await cdt.retrieveAddress(0, 0);
    expect(addr.pk).toBe('034fef9cd7c4c63588d3b03feb5281b9d232cba34d6f3d71aee59211ffbfe1fe87');
    expect(addr.bech32).toBe('cosmos1w34k53py5v5xyluazqpq65agyajavep2rflq6h');
    expect(addr.path).toEqual([44, 118, 0, 0, 0]);

    cdt.setNodeURL('https://stargate.cosmos.network');
    const accountInfo = await cdt.getAccountInfo(addr);
    console.log(accountInfo);
});

test('scan addresses', async () => {
    jest.setTimeout(45000);

    const transport = await TransportNodeHid.create(5000);
    const cdt = new CosmosDelegateTool(transport);

    await cdt.connect();
    expect(cdt.connected).toBe(true);
    expect(cdt.lastError).toBe(null);

    const addrs = await cdt.scanAddresses(0, 1, 2, 3);
    expect(addrs.length).toEqual(4);

    expect(addrs[0].pk).toBe('03a2670393d02b162d0ed06a08041e80d86be36c0564335254df7462447eb69ab3');
    expect(addrs[0].bech32).toBe('cosmos1a07dzdjgjsntxpp75zg7cgatgq0udh3pcdcxm3');
    expect(addrs[0].path).toEqual([44, 118, 0, 0, 2]);

    // TODO: Fix in ledger lib.. consistency in PK

    expect(addrs[3].pk).toBe('025b81522e146fc5ee19d101783a8db41ac510af55ab4b1bff713fdcb006eb6c69');
    expect(addrs[3].bech32).toBe('cosmos1cd0a075ed869ml39d8xh574s8xc6v82e0jenlu');
    expect(addrs[3].path).toEqual([44, 118, 1, 0, 3]);

    // expect(addrs[3].pk).toBe('033222fc61795077791665544a90740e8ead638a391a3b8f9261f4a226b396c042');
    // expect(addrs[3].bech32).toBe('cosmos1qvw52lmn9gpvem8welghrkc52m3zczyhlqjsl7');
    // expect(addrs[3].path).toEqual([44, 118, 1, 0, 3]);

    console.log(addrs);
});

test('scan and get balances', async () => {
    jest.setTimeout(45000);

    const transport = await TransportNodeHid.create(1000);
    const cdt = new CosmosDelegateTool(transport);

    await cdt.connect();
    expect(cdt.connected).toBe(true);
    expect(cdt.lastError).toBe(null);

    const addrs = await cdt.scanAddresses(0, 0, 2, 3);
    expect(addrs.length).toEqual(2);

    cdt.setNodeURL('https://stargate.cosmos.network');
    const reply = await cdt.retrieveBalances(addrs);

    console.log(reply);
});

test('sign tx', async () => {
    // retrieving many public keys can be slow
    jest.setTimeout(45000);

    const transport = await TransportNodeHid.create(1000);
    const cdt = new CosmosDelegateTool(transport);
    cdt.setNodeURL('https://stargate.cosmos.network');

    await cdt.connect();
    expect(cdt.connected).toBe(true);
    expect(cdt.lastError).toBe(null);

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
    console.log(signedTx);
});
