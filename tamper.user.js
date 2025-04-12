// ==UserScript==
// @name         Stefs Hack
// @namespace    stefanpenner
// @version      2025-04-12
// @description  try to take over the world!
// @author       You
// @match        https://lcc.live/*
// @icon         https://lcc.live
// @updateURL    https://raw.githubusercontent.com/stefanpenner/tamper/refs/heads/main/tamper.user.js
// @downloadURL  https://raw.githubusercontent.com/stefanpenner/tamper/refs/heads/main/tamper.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const h1 = document.createElement('h1')
    h1.textContent = "You've been tampered with"
    document.body.prepend(h1)
    debugger
    // Prevent initial script execution
    for (let script of document.querySelectorAll('script')) {
        if (script.src && script.src.includes('/s/script.js')) {
            script.type = 'text/blocked';
            script.src = 'about:blank';
            script.remove();
        }
    }

    // Monitor for dynamic script injection
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT' && node.src && node.src.includes('/s/script.js')) {
                    node.type = 'text/blocked';
                    node.src = 'about:blank';
                    node.remove();
                }
            });
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
