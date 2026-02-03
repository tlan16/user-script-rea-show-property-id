// ==UserScript==
// @name         REA - Show property and listing id
// @namespace    http://tampermonkey.net/
// @description  Display property id and listing id
// @author       Frank Lan
// @version      2.1
// @license      GPL-3.0 license
// @match        https://www.realestate.com.au/*
// @match        https://www.realcommercial.com.au/*
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

    const getPropertyId = async () => {
        let propertyId = undefined;
        propertyId = document.querySelector(`a[href^="https://www.property.com.au/"]`)?.href?.replace(/.+(?=pid-\d+)/, '')?.replace(/\D/g, '')?.trim();
        if (propertyId) return propertyId;
        propertyId = window?.utag?.data?.udo_backup?.property?.data?.property_id?.toString()?.trim();
        if (propertyId) return propertyId;

        const propertyPageLink = document.querySelector(`a[href^="https://www.realestate.com.au/property/"]`)?.href?.trim();
        if (propertyPageLink) {
            const response = await fetch(propertyPageLink);
            const htmlString = await response.text();

            // Parse the HTML string into a DOM tree
            const parser = new DOMParser();
            const parsedDoc = parser.parseFromString(htmlString, 'text/html');

            // Now use querySelector on the parsed document
            propertyId = parsedDoc.querySelector(`a[href^="https://www.property.com.au/"]`)?.href?.replace(/.+(?=pid-\d+)/, '')?.replace(/\D/g, '')?.trim();
            if (propertyId) return propertyId;
        }

        return propertyId?.trim() ?? undefined;
    }
    const getListingId = async () => {
        let listingId = undefined;
        listingId = window?.utag?.data?.udo_backup?.listing?.data?.listing_id?.toString()?.trim();
        return listingId?.trim() || undefined;
    }
    const getAgencyId = async () => {
        let agencyId = undefined;
        agencyId = document.querySelector(`a[href^="https://www.realestate.com.au/agency/"]`)?.href?.replace(/https:\/\/www\.realestate\.com\.au\/agency\/\S+-(?=[A-Z]+)/, '');
        agencyId = /^[A-Z]+/.exec(agencyId ?? '')?.[0]?.trim()
        if (agencyId) return agencyId.trim();

        agencyId = document.querySelector(`a[href^="https://www.realcommercial.com.au/agency/"]`)?.href?.replace(/https:\/\/www\.realcommercial\.com\.au\/agency\/(?=[A-Z]+)/, '');
        agencyId = /^[A-Z]+/.exec(agencyId ?? '')?.[0]?.trim()
        if (agencyId) return agencyId.trim();

        agencyId = window?.utag?.data?.udo_backup?.agents?.data?.agents?.[0]?.agency_id?.trim();
        if (agencyId) return agencyId.trim();

        return agencyId?.trim() || undefined;
    }

    const displayIds = (propertyId, listingId, agencyId, selector) => {
        const displayElementId = 'user-script-rea-show-property-id-' + window.location.toString().replace(/\W/g, '')
        const existing = document.getElementById(displayElementId);

        let innerHTML = '';
        let innterHTMLParts = [
          propertyId ? `Property ID: ${propertyId}` : null,
          agencyId ? `Agency ID: ${agencyId}` : null,
          listingId ? `Listing ID: ${listingId}` : null,
        ].filter(Boolean);
        innerHTML = innterHTMLParts.join('<br/>')
        if (existing?.innerHTML !== innerHTML) {
          if (existing) existing.innerHTML = innerHTML
          else {
              const container = document.querySelector(selector);
              if (!container) return;

              const div = document.createElement('div');
              div.id = displayElementId;
              div.style.backgroundColor = 'rgba(0,0,0,0.5)';
              div.style.color = 'white';
              div.style.top = '0';
              div.style.left = '0';
              div.style.fontSize = '1rem';
              div.innerHTML = innerHTML;

              container.appendChild(div);
          }
        }
    };
    let attempts = 0;
    while (attempts <= 20) {
        const propertyId = await getPropertyId();
        const listingId = await getListingId();
        const agencyId = await getAgencyId();
        console.debug({propertyId, listingId, agencyId})
        if (propertyId || listingId || agencyId) {
            // Assumption: by the time property id is ready, the anchor element for display is ready too
            if (window.location.toString().startsWith('https://www.realestate.com.au/property/')) displayIds(propertyId, listingId, agencyId, `body [class*="ddress-attributes__AddressAttributesContainer"]`);
            else if (window.location.toString().startsWith('https://www.realestate.com.au/property-')) displayIds(propertyId, listingId, agencyId, `body .property-info-address`);
            else if (window.location.toString().startsWith('https://www.property.com.au/')) displayIds(propertyId, listingId, agencyId, `body [class*='PageHeaderContainer'] h1`);
            else if (window.location.toString().startsWith('https://www.realestate.com.au/sold/')) displayIds(propertyId, listingId, agencyId, `body .details h1`);
            else if (window.location.toString().startsWith('https://www.realcommercial.com.au/for-sale')) displayIds(propertyId, listingId, agencyId, `body main h1`);
        }
        if (propertyId && agencyId && listingId) break;
        attempts ++;
        await sleep(1000);
    }
})();
