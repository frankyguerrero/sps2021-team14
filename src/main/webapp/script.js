//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Uses documenu API to retrive resturants with imputted item on menu.
 * Dounmenu API key: eecbee0d473c6eaf6b93a377be2eb6cb
 * Geo API key: AIzaSyDvkybevSYu7sdVcv07rWaieNTLR3w8FEs
 */

async function resSearch(input) {
    const lat = '';
    const lon = '';
    const dist = '';
    const input = '';
    var resturants = {};

    const url = 
        'https://api.documenu.com/v2/menuitems/search/geo?lat=' + lat +
        '&lon=' + lon + '&distance=' + dist +
        '&search=' + input + '&key=eecbee0d473c6eaf6b93a377be2eb6cb';

    $.getJSON(url, function(data){
        resturants = data.data;
    });        

}

