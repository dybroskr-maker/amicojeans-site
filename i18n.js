/* AMICO JEANS — 3개국어 전환
   한국어 원문을 키로 쓰는 사전 치환 방식. index.html 은 한국어 원본을 그대로 두고,
   이 스크립트가 헤더에 토글을 심고 텍스트 노드를 갈아 끼운다.
   사전에 없는 문구는 한국어 그대로 남는다(오역보다 낫다).
   - 기본: 한국어. 첫 방문 시 브라우저 언어가 zh 계열이면 중문, en 계열이면 영문
   - 선택은 localStorage 에 남는다
   - 나중에 생기는 DOM(리뷰 패널 등)도 MutationObserver 가 같은 사전으로 처리한다 */
(function () {
  'use strict';
  var KEY = 'amico_lang';
  var LANGS = [
    { code: 'ko', label: 'KO' },
    { code: 'en', label: 'EN' },
    { code: 'zh', label: '中' }
  ];
  var dicts = {};          // code -> { 원문: 번역 }
  var cur = 'ko';
  var ORIG = '__amicoKo';  // 원문 보관용 프로퍼티

  function pick() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved && ['ko', 'en', 'zh'].indexOf(saved) >= 0) return saved;
    var n = (navigator.language || 'ko').toLowerCase();
    if (n.indexOf('zh') === 0) return 'zh';
    if (n.indexOf('en') === 0) return 'en';
    return 'ko';
  }

  function textNodes(root) {
    var out = [];
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var t = p.nodeName;
        if (t === 'SCRIPT' || t === 'STYLE') return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = w.nextNode())) out.push(n);
    return out;
  }

  function applyNode(n, dict) {
    if (n[ORIG] === undefined) n[ORIG] = n.nodeValue;
    var src = n[ORIG];
    var key = src.trim();
    if (!dict) { n.nodeValue = src; return; }
    var hit = dict[key];
    if (hit) n.nodeValue = src.replace(key, hit);
    else n.nodeValue = src;
  }

  function applyAttrs(root, dict) {
    var attrs = ['placeholder', 'title', 'aria-label'];
    var els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[title],[aria-label]') : [];
    Array.prototype.forEach.call(els, function (el) {
      attrs.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var store = ORIG + '_' + a;
        if (el[store] === undefined) el[store] = el.getAttribute(a);
        var src = el[store];
        var hit = dict && dict[src.trim()];
        el.setAttribute(a, hit || src);
      });
    });
  }

  function apply(root) {
    var dict = cur === 'ko' ? null : dicts[cur];
    textNodes(root || document.body).forEach(function (n) { applyNode(n, dict); });
    applyAttrs(root || document.body, dict);
  }

  function paint() {
    document.documentElement.setAttribute('lang', cur === 'zh' ? 'zh-CN' : cur);
    var bar = document.getElementById('langbar');
    if (bar) {
      Array.prototype.forEach.call(bar.children, function (b) {
        b.classList.toggle('on', b.dataset.lang === cur);
      });
    }
  }

  function setLang(code) {
    cur = code;
    try { localStorage.setItem(KEY, code); } catch (e) {}
    if (code === 'ko' || dicts[code]) { apply(); paint(); return; }
    fetch('./i18n/' + code + '.json')
      .then(function (r) { return r.json(); })
      .then(function (j) { dicts[code] = j; apply(); paint(); })
      .catch(function () { cur = 'ko'; apply(); paint(); });
  }

  function mountToggle() {
    var bar = document.querySelector('header .bar');
    if (!bar || document.getElementById('langbar')) return;

    var css = document.createElement('style');
    css.textContent =
      '#langbar{display:flex;gap:2px;align-items:center;margin-left:16px;order:9}' +
      '#langbar button{font-family:var(--disp);font-size:10.5px;letter-spacing:.1em;padding:5px 7px;color:var(--mute);border:1px solid transparent;line-height:1}' +
      '#langbar button.on{color:var(--ink);border-color:var(--line);background:#fff}' +
      '#langbar button:hover{color:var(--ink)}' +
      '@media(max-width:820px){#langbar{margin-left:auto;order:2}}';
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.id = 'langbar';
    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.lang = l.code;
      b.textContent = l.label;
      b.setAttribute('aria-label', l.code === 'ko' ? '한국어' : l.code === 'en' ? 'English' : '简体中文');
      b.onclick = function () { setLang(l.code); };
      box.appendChild(b);
    });

    var burger = bar.querySelector('.burger');
    if (burger) bar.insertBefore(box, burger);
    else bar.appendChild(box);
  }

  function start() {
    mountToggle();
    setLang(pick());

    // 나중에 만들어지는 DOM(리뷰 패널·다이얼로그)도 같은 사전으로 처리한다
    var mo = new MutationObserver(function (muts) {
      if (cur === 'ko' || !dicts[cur]) return;
      muts.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType === 1) apply(n);
          else if (n.nodeType === 3) applyNode(n, dicts[cur]);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
