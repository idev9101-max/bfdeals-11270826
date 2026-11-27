import { allDeals, categories, stores, saved, verdict, statsFor } from './deals.js';
import { checkedAt, coverage } from './data.js';
import { checkedFull, checkedShort, escapeHtml, money } from './format.js';
import { categoryIcon } from './icons.js';
import { listHref, dealHref } from './router.js';

const sortLabels = {
  signal: 'Strongest signal', discount: 'Biggest discount', savings: 'Most dollars saved',
  'price-asc': 'Lowest sale price', 'price-desc': 'Highest sale price', name: 'Name A–Z',
};
const option = (value, label, selected) => `<option value="${escapeHtml(value)}"${String(value) === String(selected) ? ' selected' : ''}>${escapeHtml(label)}</option>`;

export function statsMarkup(stats, state) {
  const scope = state.q || state.category || state.store || state.min ? `${stats.count} of ${allDeals.length} checked` : 'every checked deal';
  return `
    <div class="stat"><span>Deals in view</span><strong>${stats.count}</strong><small>${scope}</small></div>
    <div class="stat"><span>Average discount</span><strong>${stats.average}<i>%</i></strong><small>across the view</small></div>
    <div class="stat"><span>Biggest saving</span><strong>${money(stats.biggest)}</strong><small>below usual price</small></div>
    <div class="stat stat-signal"><span>Top signal</span><strong>${stats.top}<i>/100</i></strong><small>depth + dollars</small></div>`;
}

export function dealsPage(state, stats) {
  return `
  <section class="hero wrap">
    <div class="hero-copy">
      <p class="eyebrow"><span class="pulse"></span>Fixed board · ${checkedShort(checkedAt)} · no live feed</p>
      <h1>Black Friday,<br><span>without the fog.</span></h1>
      <p class="lede">${allDeals.length} checked deals ranked by discount depth and dollars saved. Every number is on the card.</p>
    </div>
    <div class="hero-stamp" aria-hidden="true">
      <div class="stamp-ring"><b>${allDeals.length}</b><span>CHECKED<br>DEALS</span></div>
      <i class="stamp-tick tick-a"></i><i class="stamp-tick tick-b"></i>
    </div>
  </section>
  <section class="stats wrap" data-stats aria-label="Board statistics">${statsMarkup(stats, state)}</section>
  <section class="toolbar wrap" aria-label="Find deals">
    <div class="search-line">
      <label class="search-box" for="q">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
        <span class="sr-only">Search product names</span>
        <input id="q" type="search" placeholder="Search product names…" autocomplete="off" spellcheck="false">
      </label>
      <label class="select-box sort-box" for="sort"><span>Sort by</span><select id="sort">${Object.entries(sortLabels).map(([value, label]) => option(value, label, state.sort)).join('')}</select></label>
    </div>
    <div class="filter-line">
      <label class="select-box" for="category"><span>Category</span><select id="category">${option('', 'All categories', state.category)}${categories.map((c) => option(c, c, state.category)).join('')}</select></label>
      <label class="select-box" for="store"><span>Store</span><select id="store">${option('', 'All stores', state.store)}${stores.map((s) => option(s, s, state.store)).join('')}</select></label>
      <label class="select-box" for="min"><span>Min discount</span><select id="min">${[0, 20, 30, 40, 50, 60].map((n) => option(n, n === 0 ? 'Any %' : `${n}% or more`, state.min)).join('')}</select></label>
      <button class="ghost-btn" id="reset" type="button">Reset</button>
      <div class="export-group"><span>Export</span><button id="csv" type="button">CSV</button><button id="json" type="button">JSON</button></div>
    </div>
    <div class="chip-row" id="chips" aria-label="Active filters"></div>
    <div class="result-line"><p id="result-count" role="status"></p><p class="sort-note">Sorted by ${escapeHtml(sortLabels[state.sort])}</p></div>
  </section>
  <section class="results wrap" id="results" tabindex="-1" aria-label="Deal results"></section>`;
}

export function chipsMarkup(state) {
  const chips = [];
  if (state.q) chips.push(['q', `Search: “${escapeHtml(state.q)}”`]);
  if (state.category) chips.push(['category', `Category: ${escapeHtml(state.category)}`]);
  if (state.store) chips.push(['store', `Store: ${escapeHtml(state.store)}`]);
  if (state.min) chips.push(['min', `At least ${state.min}% off`]);
  return chips.length
    ? `<span class="chip-label">Active</span>${chips.map(([key, label]) => `<button class="chip" type="button" data-chip="${key}" aria-label="Clear ${escapeHtml(label)}">${label}<span aria-hidden="true">×</span></button>`).join('')}`
    : '<span class="chips-idle">No filters active — full board shown</span>';
}

function card(d, state) {
  const v = verdict(d);
  const href = dealHref(d.id, state);
  return `<article class="card tone-${v.tone}" style="--score:${v.score}%">
    <div class="card-top">
      <span class="cat-icon">${categoryIcon(d.category)}</span>
      <span class="cat-label">${escapeHtml(d.category)}</span>
      <span class="store-badge">${escapeHtml(d.store)}</span>
    </div>
    <h3 class="card-title"><a href="${href}" title="${escapeHtml(d.product)}">${escapeHtml(d.product)}</a></h3>
    <div class="price-row"><strong>${money(d.salePrice)}</strong><s>${money(d.usualPrice)}</s><span class="off">${d.discountPct}% OFF</span></div>
    <div class="meta-row"><span class="save">Save ${money(saved(d))}</span><span>Checked ${checkedShort(d.checkedAt)}</span></div>
    <div class="signal">
      <div class="signal-head"><span>REAL DEAL SIGNAL</span><b>${v.label}</b></div>
      <div class="meter"><i></i></div>
      <p>${escapeHtml(v.reason)}</p>
    </div>
    <a class="card-cta" href="${href}">Full details <span aria-hidden="true">→</span></a>
  </article>`;
}

export function resultsMarkup(list, state) {
  if (list.length === 0) {
    return `<div class="empty">
      <span class="empty-mark" aria-hidden="true">∅</span>
      <h2>No deals match those filters.</h2>
      <p>Widen the discount floor or clear a filter to see the full board.</p>
      <button class="solid-btn" type="button" data-action="reset">Reset filters</button>
    </div>`;
  }
  return `<div class="deal-grid">${list.map((d) => card(d, state)).join('')}</div>`;
}

export function detailMarkup(d, state) {
  const v = verdict(d);
  const facts = [
    ['Product', escapeHtml(d.product)], ['Store', escapeHtml(d.store)], ['Category', escapeHtml(d.category)],
    ['Sale price', money(d.salePrice)], ['Usual price', money(d.usualPrice)], ['Saved', money(saved(d))],
    ['Discount', `${d.discountPct}% off`], ['Signal score', `${v.score} / 100 · ${v.label}`],
    ['Checked (UTC)', checkedFull(d.checkedAt)], ['Source', `${escapeHtml(coverage)} · ${checkedShort(d.checkedAt)}`],
  ];
  return `<div class="overlay" data-close>
    <section class="detail tone-${v.tone}" style="--score:${v.score}%" role="dialog" aria-modal="true" aria-labelledby="detail-title" tabindex="-1">
      <div class="detail-bar"><span>Deal file / ${escapeHtml(d.id.toUpperCase())}</span><button class="close-btn" type="button" data-close aria-label="Close deal details">×</button></div>
      <div class="detail-grid">
        <div class="detail-main">
          <div class="detail-cat"><span class="cat-icon big">${categoryIcon(d.category)}</span><span>${escapeHtml(d.category)}</span><span class="store-badge">${escapeHtml(d.store)}</span></div>
          <h2 id="detail-title">${escapeHtml(d.product)}</h2>
          <div class="detail-price"><strong>${money(d.salePrice)}</strong><s>${money(d.usualPrice)}</s><span class="off">${d.discountPct}% OFF</span></div>
          <div class="detail-callout">
            <span class="callout-k">REAL DEAL SIGNAL · ${v.score}/100</span>
            <strong>${v.label}</strong>
            <p>${escapeHtml(v.reason)}</p>
            <div class="meter big"><i></i></div>
          </div>
          <p class="detail-save">You keep <b>${money(saved(d))}</b> against the quoted usual price.</p>
          <a class="store-link" href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer">Open at ${escapeHtml(d.store)} <span aria-hidden="true">↗</span><small>${escapeHtml(d.url)}</small></a>
          <p class="link-note">Store links open in a new tab. Nothing on this page depends on them.</p>
        </div>
        <aside class="detail-aside">
          <h3>The receipt</h3>
          <dl>${facts.map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join('')}</dl>
          <div class="score-note"><b>How the score was built</b><p>55% discount depth + 45% dollar savings, capped at $600 saved. Exceptional ≥70 · Strong ≥50 · Fair ≥35 · Modest below 35.</p></div>
          <a class="back-link" href="${listHref(state)}">← Back to all deals</a>
        </aside>
      </div>
    </section>
  </div>`;
}

export function missingDetail(id, state) {
  return `<div class="overlay" data-close><section class="detail missing" role="dialog" aria-modal="true" aria-labelledby="missing-title" tabindex="-1">
    <div class="detail-bar"><span>Deal file / ${escapeHtml(id.toUpperCase())}</span><button class="close-btn" type="button" data-close aria-label="Close">×</button></div>
    <h2 id="missing-title">No deal file at this address.</h2>
    <p>The board holds ${allDeals.length} checked deals. Pick one from the grid.</p>
    <a class="solid-link" href="${listHref(state)}">See all deals</a>
  </section></div>`;
}

export function methodPage(state) {
  const example = verdict(allDeals.find((d) => d.id === 'd26'));
  return `<section class="method wrap" tabindex="-1">
    <p class="eyebrow">Method / 01</p>
    <h1>How a price earns <span>a signal.</span></h1>
    <p class="method-lede">A deal board is only useful if you can see what makes a cut real. This one shows the arithmetic, the check time and the limits.</p>
    <div class="method-grid">
      <article><span class="method-num">01</span><h2>Source of truth</h2><p>All ${allDeals.length} sale prices, usual prices, store links and categories come from ${escapeHtml(coverage)} verified on ${checkedFull(checkedAt)}. The board is a fixed snapshot, not a live feed.</p></article>
      <article><span class="method-num">02</span><h2>Two kinds of value</h2><p>Percent off shows depth. Dollars saved shows size. The signal blends them: 55% of the score from discount depth, 45% from dollars below the usual price, capped at $600.</p></article>
      <article><span class="method-num">03</span><h2>Honest labels</h2><p>Exceptional ≥70, Strong ≥50, Fair ≥35, Modest below 35. A deep cut on a cheap item can land lower than a smaller cut on an expensive one. That is deliberate.</p></article>
      <article><span class="method-num">04</span><h2>What it cannot know</h2><p>Prices change without notice, stock varies by ZIP code, variants differ, and “usual price” is the reference quoted in the coverage. Tax and shipping are excluded. Confirm at the store before buying.</p></article>
    </div>
    <div class="method-example">
      <div><span class="example-k">Worked example</span><h2>${escapeHtml(allDeals.find((d) => d.id === 'd26').product)}</h2><p>${escapeHtml(example.reason)}. Score ${example.score}/100 → ${example.label}.</p></div>
      <div class="example-price"><strong>${money(1299)}</strong><s>${money(3999)}</s><span>68% OFF</span></div>
    </div>
    <a class="solid-link" href="${listHref(state)}">← Back to the ${allDeals.length} deals</a>
  </section>`;
}

export function countText(stats, state) {
  const label = `${stats.count} of ${allDeals.length} deals shown`;
  return state.q || state.category || state.store || state.min ? `${label} · filters active` : `${label} · full board`;
}

export const totalStats = () => statsFor(allDeals);
