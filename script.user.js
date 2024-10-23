// ==UserScript==
// @name         REA - Show property id
// @namespace    http://tampermonkey.net/
// @version      2024-10-23
// @description  Display property id
// @author       Frank Lan
// @version      1.1
// @license      GPL-3.0 license
// @match        https://www.realestate.com.au/property/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=realestate.com.au
// @updateURL    https://github.com/tlan16/user-script-rea-show-property-id/raw/main/script.user.js
// @downloadURL  https://github.com/tlan16/user-script-rea-show-property-id/raw/main/script.user.js
// @homepage     https://github.com/tlan16/user-script-rea-show-property-id
// @supportURL   https://github.com/tlan16/user-script-rea-show-property-id
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(async function() {
    'use strict';

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const getPropertyId = () => window?.utag?.data?.udo_backup?.property?.data?.property_id;

    const displayPropertyId = (propertyId, selector) => {
        const container = document.querySelector(selector);
        if (!container) return;
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.backgroundColor = 'rgba(0,0,0,0.5)';
        div.style.color = 'white';
        div.style.top = '0';
        div.style.left = '0';
        div.textContent = `Property ID: ${propertyId}`;
        container.appendChild(div);
    };
    let attempts = 0;
    while (attempts <= 5) {
        attempts ++;
        const propertyId = getPropertyId();
        if (propertyId) {
            console.log({propertyId});
            // Assumption: by the time property id is ready, the anchor element for display is ready too
            if (window.location.toString().startsWith('https://www.realestate.com.au/property/')) displayPropertyId(propertyId, `body [class*="ddress-attributes__AddressAttributesContainer"]`);
            
            break;
        }
        await sleep(1000);
    }
})();
