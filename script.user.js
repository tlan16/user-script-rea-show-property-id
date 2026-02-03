// ==UserScript==
// @name         REA - Show property and listing id
// @namespace    http://tampermonkey.net/
// @description  Display property id and listing id
// @author       Frank Lan
// @version      1.10
// @license      GPL-3.0 license
// @match        https://www.realestate.com.au/property/*
// @match        https://www.realestate.com.au/property*
// @match        https://www.realestate.com.au/sold/*
// @match        https://www.property.com.au/*
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
    const getPropertyId = () => {
        let propertyId = undefined;
        propertyId = document.querySelector(`a[href^="https://www.property.com.au/"]`)?.href?.replace(/.+(?=pid-\d+)/, '')?.replace(/\D/g, '');
        if (propertyId) return propertyId;
        propertyId = window?.utag?.data?.udo_backup?.property?.data?.property_id;
        return propertyId;
    }
    const getListingId = () => {
        let listingId = undefined;
        listingId = window?.utag?.data?.udo_backup?.listing?.data?.listing_id;
        return listingId;
    }

    const displayIds = (propertyId, listingId, selector) => {
        const displayElementId = 'we-property-id-' + window.location.toString().replace(/\W/g, '')

        const container = document.querySelector(selector);
        if (!container) return;
        document.getElementById(displayElementId)?.remove();

        const div = document.createElement('div');
        div.id = displayElementId;
        div.style.backgroundColor = 'rgba(0,0,0,0.5)';
        div.style.color = 'white';
        div.style.top = '0';
        div.style.left = '0';
        div.style.fontSize = '1rem';

        let innerHTML = '';
        if (propertyId) innerHTML += `Property ID: ${propertyId}`;
        if (listingId) innerHTML += `<br/>Listing ID: ${listingId}`;
        div.innerHTML = innerHTML;

        container.appendChild(div);
    };
    let attempts = 0;
    while (attempts <= 20) {
        attempts ++;
        const propertyId = getPropertyId();
        const listingId = getListingId();
        console.debug({propertyId, listingId})
        if (propertyId || listingId) {
            console.debug({propertyId, listingId});
            // Assumption: by the time property id is ready, the anchor element for display is ready too
            if (window.location.toString().startsWith('https://www.realestate.com.au/property/')) displayIds(propertyId, listingId, `body [class*="ddress-attributes__AddressAttributesContainer"]`);
            if (window.location.toString().startsWith('https://www.realestate.com.au/property-')) displayIds(propertyId, listingId, `body .property-info-address`);
            if (window.location.toString().startsWith('https://www.property.com.au/')) displayIds(propertyId, listingId, `body [class*='PageHeaderContainer'] h1`);
            if (window.location.toString().startsWith('https://www.realestate.com.au/sold/')) displayIds(propertyId, listingId, `body .details h1`);
        }
        if (propertyId && listingId) break;
        await sleep(1000);
    }
})();
