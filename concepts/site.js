// 개념 목록의 단일 원본. 홈(index.html)의 카드 목록과 각 문서의 메뉴가 이 배열로 그려진다.
// cat: 카테고리 이름 하나 또는 배열(여러 카테고리에 넣을 때). date: 최초 정리일. updated: 마지막 보충일(없으면 생략).
// 배열 순서가 문서 아래 "이전/다음"의 순서다.
const PAGES = [
  {file: 'attention.html', title: 'Attention', cat: 'Transformer 구조', date: '2026-11-23',
    desc: 'Query, Key, Value로 다른 토큰의 정보를 가져오는 연산'},
  {file: 'transformer.html', title: 'Transformer', cat: 'Transformer 구조', date: '2026-11-23', updated: '2026-11-24',
    desc: 'attention과 FFN을 쌓은 모델 구조, 생성과 학습 과정, KV 캐시'},
  {file: 'rnn.html', title: 'RNN', cat: 'Transformer 이전의 시퀀스 모델', date: '2026-11-24',
    desc: '은닉 상태를 옆으로 넘기며 읽는 모델, 병렬 계산이 안 되는 이유'},
];

(() => {
  const base = document.currentScript.src; // 이 파일 위치 기준으로 링크를 만들어 홈과 문서 양쪽에서 같이 쓴다
  const root = document.documentElement;
  const KEY = 'aes-theme'; // 같은 도메인의 다른 사이트(포트폴리오)와 겹치지 않는 이름
  // 화면이 그려지기 전에 적용해야 깜빡이지 않으므로, 이 스크립트는 head에서 defer 없이 불러온다
  try { const t = localStorage.getItem(KEY); if (t) root.dataset.theme = t; } catch {}

  addEventListener('DOMContentLoaded', () => {
    const url = f => new URL(f, base).href;
    const home = url('../index.html');
    const log = url(location.protocol === 'file:' ? '../LOG.md' : '../LOG.html'); // Pages에서만 LOG.md가 LOG.html로 변환된다
    const cats = new Map();
    PAGES.forEach(p => [].concat(p.cat).forEach(c => cats.set(c, [...(cats.get(c) || []), p])));

    const here = location.pathname.split('/').pop();
    const list = document.getElementById('home-list');
    const top = document.createElement('nav');
    top.className = 'topnav';
    top.innerHTML = (list ? '' : `<a href="${home}">← 홈</a>`) + `<a href="${log}">시간순 기록</a>` +
      (list ? '' : '<details class="push"><summary>개념 목록</summary><div>' +
        [...cats].map(([c, ps]) => `<b>${c}</b>` + ps.map(p =>
          p.file === here ? `<span>${p.title}</span>` : `<a href="${url(p.file)}">${p.title}</a>`).join('')).join('') +
        '</div></details>');

    // 저장된 선택이 없으면 기기 설정(prefers-color-scheme)을 따른다
    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const btn = document.createElement('button');
    if (list) btn.className = 'push';
    const label = () => { btn.textContent = isDark() ? '라이트 모드' : '다크 모드'; };
    btn.onclick = () => {
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem(KEY, root.dataset.theme); } catch {}
      label();
    };
    label();
    top.append(btn);
    document.body.prepend(top);

    if (list) {
      list.innerHTML = [...cats].map(([c, ps]) => `<h2>${c}</h2><div class="cards">` + ps.map(p =>
        `<a class="card" href="${url(p.file)}"><strong>${p.title}</strong><span>${p.desc}</span>` +
        `<small>${p.date}${p.updated ? ` · 보충 ${p.updated}` : ''}</small></a>`).join('') + '</div>').join('');
      return;
    }

    const i = PAGES.findIndex(p => p.file === here);
    if (i < 0) return; // 목록에 없는 문서(템플릿 등)는 이전/다음을 그리지 않는다
    const link = (p, text) => p ? `<a href="${url(p.file)}"><small>${text}</small>${p.title}</a>` : '<span></span>';
    const pager = document.createElement('nav');
    pager.className = 'pager';
    pager.innerHTML = link(PAGES[i - 1], '← 이전') + `<a href="${home}"><small>목록</small>홈</a>` + link(PAGES[i + 1], '다음 →');
    document.querySelector('main').append(pager);
  });
})();
