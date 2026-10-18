// ==UserScript==
// @name         SRRDB — выпадающий список «Готово / Пропуск»
// @namespace    https://srrdb.com/
// @version      1.1
// @description  Добавляет справа от каждого релиза в списке выпадающий список (Готово / Пропуск). Выбор запоминается.
// @match        https://www.srrdb.com/*
// @match        https://srrdb.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'releaseStatus';
    const OPTIONS = [
        { value: '',     label: '—' },        // ничего не выбрано
        { value: 'done', label: '✓' },
        { value: 'skip', label: '✗' },
    ];

    let statuses = {};
    try { statuses = JSON.parse(GM_getValue(STORAGE_KEY, '{}')) || {}; } catch (e) { statuses = {}; }

    const save = () => GM_setValue(STORAGE_KEY, JSON.stringify(statuses));

    // Стили
    const style = document.createElement('style');
    style.textContent = `
        .sd-select {
            background: #111; color: #ddd; border: 1px solid #444;
            border-radius: 4px; padding: 0 2px; font-size: 11px; cursor: pointer;
            width: 100% !important; min-width: 0 !important; max-width: none !important;
            box-sizing: border-box !important;
            height: 22px !important; font-size: 14px !important; margin: 0 !important; display: inline-block !important;
        }
        .sd-select:focus { outline: 1px solid #2b7de9; }
        tr.sd-update > td { box-shadow: inset 0 0 0 9999px rgba(255,215,0,.22); }
        tr.sd-done > td { box-shadow: inset 0 0 0 9999px rgba(46,160,67,.18); }
        tr.sd-skip { opacity: .4; }
        td.sd-cell, th.sd-cell {
            white-space: nowrap; text-align: center; padding: 0 !important;
            box-sizing: border-box !important; overflow: visible !important;
            width: var(--sd-w, 56px) !important;
            min-width: var(--sd-w, 56px) !important;
            max-width: var(--sd-w, 56px) !important;
        }
        th.sd-cell span { display: inline-block; }
    `;
    document.head.appendChild(style);

    function releaseName(tr) {
        const a = tr.querySelector('a[href*="/release/details/"]');
        if (!a) return null;
        const part = a.getAttribute('href').split('/release/details/')[1];
        if (!part) return null;
        return decodeURIComponent(part.split(/[?#/]/)[0]);
    }

    function applyRowState(tr, value) {
        tr.classList.toggle('sd-done', value === 'done');
        tr.classList.toggle('sd-skip', value === 'skip');
    }

    function addHeader(table) {
        if (table.dataset.sdHead) return;
        const headRow = table.querySelector('thead tr') ||
            Array.from(table.querySelectorAll('tr')).find(tr => tr.querySelector('th'));
        if (!headRow) return;
        const th = document.createElement('th');
        th.className = 'sd-cell';
        const label = document.createElement('span');
        label.textContent = 'Статус';
        th.appendChild(label);
        headRow.appendChild(th);
        // Ширина колонки = ширина слова «Статус»
        const w = Math.ceil(label.getBoundingClientRect().width);
        if (w > 0) document.documentElement.style.setProperty('--sd-w', w + 'px');
        table.dataset.sdHead = '1';
    }

    function processRows() {
        document.querySelectorAll('tr:not([data-sd])').forEach(tr => {
            const name = releaseName(tr);
            if (!name) return;
            tr.dataset.sd = '1';

            // Жёлтая подсветка, если в названии есть "Update"
            if (/update/i.test(name)) tr.classList.add('sd-update');

            const select = document.createElement('select');
            select.className = 'sd-select';
            OPTIONS.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.value;
                opt.textContent = o.label;
                select.appendChild(opt);
            });

            const current = statuses[name] || '';
            select.value = current;
            applyRowState(tr, current);

            select.addEventListener('change', () => {
                if (select.value) statuses[name] = select.value;
                else delete statuses[name];
                save();
                applyRowState(tr, select.value);
            });

            const td = document.createElement('td');
            td.className = 'sd-cell';
            td.appendChild(select);
            tr.appendChild(td);

            const table = tr.closest('table');
            if (table) addHeader(table);
        });
    }

    processRows();

    // На случай, если список подгружается динамически
    new MutationObserver(processRows).observe(document.body, { childList: true, subtree: true });
})();
