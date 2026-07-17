/**
 * Lightweight i18n module for tenshikiri.github.io
 * Loads translations from /languages/{lang}.json and applies them via data-i18n attributes.
 *
 * Usage in HTML:
 *   <span data-i18n="nav.about"></span>
 *   <meta name="description" data-i18n-attr="content:hero.description">
 *   <img alt="" data-i18n-attr="alt:hero.headline">
 */

const I18n = (() => {
    const SUPPORTED_LANGS = ['en', 'el'];
    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'preferredLang';

    let currentLang = DEFAULT_LANG;
    let translations = {};

    /** Resolve a dot-path key like "nav.about" from the translations object */
    function resolve(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], translations) ?? `[${key}]`;
    }

    /** Fetch and cache a locale JSON file
     *  Prefer preloaded JS bundles (window.__LOCALES__) when available so
     *  the page works when opened via file:// without an HTTP server.
     */
    async function load(lang) {
        if (window.__LOCALES__ && window.__LOCALES__[lang]) {
            return window.__LOCALES__[lang];
        }

        const res = await fetch(`languages/${lang}.json`);
        if (!res.ok) throw new Error(`Failed to load locale: ${lang}`);
        return res.json();
    }

    /** Apply translations to all data-i18n and data-i18n-attr elements */
    function apply() {
        // Text content: <span data-i18n="nav.about">
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = resolve(key);
        });

        // HTML content: <div data-i18n-html="about.body">
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.dataset.i18nHtml;
            el.innerHTML = resolve(key);
        });

        // Attribute values: <meta data-i18n-attr="content:hero.description">
        // Format: "attr1:key1 attr2:key2" (space-separated for multiple attrs)
        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            el.dataset.i18nAttr.split(' ').forEach(pair => {
                const [attr, key] = pair.split(':');
                if (attr && key) el.setAttribute(attr, resolve(key));
            });
        });

        // Placeholder: <input data-i18n-placeholder="key">
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = resolve(el.dataset.i18nPlaceholder);
        });

        // Update <html lang="...">
        document.documentElement.lang = currentLang;

        // Update active lang button states
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            const active = btn.dataset.langBtn === currentLang;
            btn.classList.toggle('lang-btn--active', active);
        });

        // Dispatch event so other scripts can react
        document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: currentLang } }));
    }

    /** Switch to a new language, loading if needed */
    async function switchTo(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
        currentLang = lang;

        try {
            translations = await load(lang);
        } catch (e) {
            console.warn(`[i18n] Could not load "${lang}", falling back to "${DEFAULT_LANG}"`);
            translations = await load(DEFAULT_LANG);
            currentLang = DEFAULT_LANG;
        }

        apply();
        localStorage.setItem(STORAGE_KEY, currentLang);
    }

    /** Detect the best initial language */
    function detectLang() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
        const browser = navigator.language?.slice(0, 2);
        return SUPPORTED_LANGS.includes(browser) ? browser : DEFAULT_LANG;
    }

    /** Public API */
    const api = {
        init: () => switchTo(detectLang()),
        switchTo,
        t: (key) => resolve(key),
        get lang() { return currentLang; },
    };

    window.I18n = api;
    return api;
})();

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}