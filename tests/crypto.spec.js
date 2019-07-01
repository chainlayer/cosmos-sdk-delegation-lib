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
import { getWallet } from 'utils.js'

const testMnemonic = 'table artist summer collect crack cruel lunar love gorilla road peanut wrestle system skirt shoulder female claim cannon price frost pole fury ranch fabric';

test('get wallet from mnemonic', async () => {
    const wallet = getWallet(testMnemonic);
    console.log(wallet);
});
