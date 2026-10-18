// ==UserScript==
// @name         SRRDB → DigitalCore
// @namespace    https://srrdb.com/
// @version      1.1
// @description  Перенаправляет со страницы релиза на srrdb.com на поиск этого релиза на digitalcore.club
// @match        https://www.srrdb.com/release/details/*
// @match        https://srrdb.com/release/details/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Tewnvc/srrdb-tools/main/srrdb-to-digitalcore.user.js
// @downloadURL  https://raw.githubusercontent.com/Tewnvc/srrdb-tools/main/srrdb-to-digitalcore.user.js
// ==/UserScript==

(function () {
    'use strict';
    
    const AUTO_REDIRECT = false;

    // Название релиза берём из адреса страницы (оно совпадает с полем RELEASE)
    const parts = location.pathname.split('/').filter(Boolean);
    const release = decodeURIComponent(parts[parts.length - 1] || '').trim();
    if (!release) return;

    const target =
        'https://digitalcore.club/search?search=' + encodeURIComponent(release) +
        '&dead=false&page=1&viewMode=table&sort=d&order=desc';

    // Чтобы можно было вернуться на srrdb: добавьте #stay к адресу, и редирект не сработает
    if (AUTO_REDIRECT && location.hash !== '#stay') {
        location.replace(target);
        return;
    }

    // Кнопка на странице
    document.addEventListener('DOMContentLoaded', () => {
        const a = document.createElement('a');
        a.href = target;
        a.textContent = 'Искать на DigitalCore';
        a.style.cssText =
            'position:fixed;right:16px;bottom:16px;z-index:99999;' +
            'padding:10px 16px;background:#2b7de9;color:#fff;font:14px sans-serif;' +
            'border-radius:6px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.4);';
        document.body.appendChild(a);
    });
})();
