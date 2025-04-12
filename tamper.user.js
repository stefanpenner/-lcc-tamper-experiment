// ==UserScript==
// @name         Tamper with lcc.live for Learnings
// @namespace    stefanpenner
// @version      2025-04-13
// @description  Experiments with script blocking and DOM tampering on lcc.live. Adds a custom header, blocks /s/script.js, and provides debug tools.
// @author       Stefan Penner
// @match        https://lcc.live/*
// @icon         https://lcc.live/favicon.ico
// @updateURL    https://raw.githubusercontent.com/stefanpenner/-lcc-tamper-experiment/main/tamper.user.js
// @downloadURL  https://raw.githubusercontent.com/stefanpenner/-lcc-tamper-experiment/main/tamper.user.js
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @supportURL   https://github.com/stefanpenner/-lcc-tamper-experiment/issues
// @homepageURL  https://github.com/stefanpenner/-lcc-tamper-experiment
// ==/UserScript==

(function () {
    'use strict';

    // Configuration object
    const config = {
        blockScript: GM_getValue('blockScript', true), // Toggle script blocking
        headerText: "You've been tampered with",
        scriptToBlock: '/s/script.js',
        observerTimeout: 10000 // Stop observing after 10s
    };

    // Add custom header
    function addHeader() {
        const h1 = document.createElement('h1');
        h1.textContent = config.headerText;
        h1.style.cssText = 'color: #ff4444; text-align: center; font-size: 24px; margin: 10px 0;';
        h1.id = 'tamper-header';
        document.addEventListener('DOMContentLoaded', () => {
            if (!document.getElementById('tamper-header')) {
                document.body.prepend(h1);
            }
        });
    }

    // Neutralize a script
    function neutralizeScript(script) {
        if (config.blockScript && script.src && script.src.includes(config.scriptToBlock)) {
            console.log(`[Stefs Hack] Blocked script: ${script.src}`);
            script.type = 'text/plain'; // Standard non-executable MIME type
            script.remove();
            return true;
        }
        return false;
    }

    // Block existing scripts
    function blockInitialScripts() {
        for (let script of document.getElementsByTagName('script')) {
            neutralizeScript(script);
        }
    }

    // Override document.createElement to catch dynamic scripts
    function interceptScriptCreation() {
        const originalCreateElement = document.createElement;
        document.createElement = function (tagName, options) {
            const element = originalCreateElement.call(document, tagName, options);
            if (tagName.toLowerCase() === 'script') {
                Object.defineProperty(element, 'src', {
                    set: function (value) {
                        if (config.blockScript && value.includes(config.scriptToBlock)) {
                            console.log(`[Stefs Hack] Blocked dynamic script src: ${value}`);
                            element.type = 'text/plain';
                            return;
                        }
                        element.setAttribute('src', value);
                    }
                });
            }
            return element;
        };
    }

    // Monitor dynamic script injection
    function monitorScripts() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'SCRIPT') {
                        neutralizeScript(node);
                    }
                });
            });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        // Stop observing after timeout to save resources
        setTimeout(() => {
            observer.disconnect();
            console.log('[Stefs Hack] Stopped script monitoring');
        }, config.observerTimeout);
    }

    // Menu commands for debugging and configuration
    function registerMenuCommands() {
        GM_registerMenuCommand('Toggle Script Blocking', () => {
            config.blockScript = !config.blockScript;
            GM_setValue('blockScript', config.blockScript);
            alert(`Script blocking ${config.blockScript ? 'enabled' : 'disabled'}`);
        }, 't');

        GM_registerMenuCommand('Show Debug Info', () => {
            const scripts = Array.from(document.getElementsByTagName('script'))
                .map(s => s.src || 'inline script')
                .join('\n');
            alert(`Blocked: ${config.blockScript}\nScripts on page:\n${scripts}`);
        }, 'd');

        GM_registerMenuCommand('Test Alert', () => {
            alert('Hi from Stefs Hack!');
        }, 'a');
    }

    // Initialize
    interceptScriptCreation();
    blockInitialScripts();
    monitorScripts();
    addHeader();
    registerMenuCommands();
})();