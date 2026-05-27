/**
 * Шаңырақ Widget — embed payment popup on any website
 * Usage:
 *   <script src="https://shanyrak.world/widget.js"></script>
 *   <button data-shanyrak-fund="FUND_ID">Помочь фонду</button>
 *   OR: ShanyrakWidget.open('FUND_ID')
 */
(function () {
  'use strict';

  var BASE_URL = 'https://shanyrak.world';
  var MODAL_ID = '__shanyrak_modal__';

  var css = [
    '#' + MODAL_ID + '{',
    '  display:none;position:fixed;inset:0;z-index:2147483647;',
    '  align-items:center;justify-content:center;',
    '  background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);',
    '  font-family:system-ui,-apple-system,sans-serif;',
    '}',
    '#' + MODAL_ID + '.visible{display:flex;}',
    '#' + MODAL_ID + ' .__sw_box{',
    '  position:relative;width:420px;max-width:calc(100vw - 32px);',
    '  max-height:90vh;border-radius:24px;overflow:hidden;',
    '  box-shadow:0 24px 64px rgba(0,0,0,0.25);',
    '  animation:__sw_in .25s cubic-bezier(.34,1.4,.64,1);',
    '}',
    '#' + MODAL_ID + ' .__sw_box iframe{',
    '  width:100%;height:680px;max-height:88vh;border:none;display:block;',
    '}',
    '@keyframes __sw_in{',
    '  from{opacity:0;transform:scale(.92) translateY(12px)}',
    '  to{opacity:1;transform:scale(1) translateY(0)}',
    '}',
  ].join('');

  function injectStyles() {
    if (document.getElementById('__shanyrak_css__')) return;
    var style = document.createElement('style');
    style.id = '__shanyrak_css__';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getOrCreateModal() {
    var el = document.getElementById(MODAL_ID);
    if (el) return el;

    el = document.createElement('div');
    el.id = MODAL_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');

    var box = document.createElement('div');
    box.className = '__sw_box';

    el.appendChild(box);
    document.body.appendChild(el);

    // close on backdrop click
    el.addEventListener('click', function (e) {
      if (e.target === el) ShanyrakWidget.close();
    });

    // listen for messages from iframe
    window.addEventListener('message', function (e) {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'shanyrak:close') ShanyrakWidget.close();
      if (e.data.type === 'shanyrak:open-url' && e.data.url) {
        window.open(e.data.url, '_blank');
      }
    });

    return el;
  }

  var ShanyrakWidget = {
    open: function (fundId, options) {
      if (!fundId) { console.warn('[Shanyrak] fundId is required'); return; }

      injectStyles();
      var modal = getOrCreateModal();
      var box   = modal.querySelector('.__sw_box');

      // destroy old iframe, build fresh one
      box.innerHTML = '';
      var iframe = document.createElement('iframe');
      iframe.src   = BASE_URL + '/widget/' + encodeURIComponent(fundId);
      iframe.title = 'Шаңырақ — оплата';
      iframe.allow = 'payment';
      box.appendChild(iframe);

      modal.classList.add('visible');
      document.body.style.overflow = 'hidden';

      // close on Escape
      ShanyrakWidget._escHandler = function (e) {
        if (e.key === 'Escape') ShanyrakWidget.close();
      };
      document.addEventListener('keydown', ShanyrakWidget._escHandler);
    },

    close: function () {
      var modal = document.getElementById(MODAL_ID);
      if (modal) modal.classList.remove('visible');
      document.body.style.overflow = '';
      if (ShanyrakWidget._escHandler) {
        document.removeEventListener('keydown', ShanyrakWidget._escHandler);
      }
    },
  };

  // auto-bind buttons with data-shanyrak-fund attribute
  function bindButtons() {
    document.querySelectorAll('[data-shanyrak-fund]').forEach(function (btn) {
      if (btn.__shanyrak_bound__) return;
      btn.__shanyrak_bound__ = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        ShanyrakWidget.open(btn.getAttribute('data-shanyrak-fund'));
      });
    });
  }

  // bind on load + watch for dynamic buttons
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindButtons);
  } else {
    bindButtons();
  }

  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(bindButtons).observe(document.body, { childList: true, subtree: true });
  }

  window.ShanyrakWidget = ShanyrakWidget;
})();
