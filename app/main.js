import { allDeals, filterDeals, sortDeals, statsFor, verdict, saved } from './deals.js';
import { checkedAt, coverage } from './data.js';
import { csvCell } from './format.js';
import { parseRoute, listHref } from './router.js';
import * as ui from './ui.js';

const app = document.getElementById('app');
const skip = document.querySelector('.skip');
const navDeals = document.getElementById('nav-deals');
const navMethod = document.getElementById('nav-method');
let route = parseRoute(location.hash);
let returnHash = listHref(route.state);

function shownDeals() {
  return sortDeals(filterDeals(allDeals, route.state), route.state.sort);
}

function setNav(view) {
  navDeals.href = listHref(route.state);
  navMethod.href = '#/method';
  navDeals.classList.toggle('active', view !== 'method');
  navMethod.classList.toggle('active', view === 'method');
}

function syncControls() {
  const values = { q: route.state.q, category: route.state.category, store: route.state.store, min: String(route.state.min), sort: route.state.sort };
  for (const [id, value] of Object.entries(values)) {
    const control = document.getElementById(id);
    if (control) control.value = value;
  }
}

function commitState() {
  returnHash = listHref(route.state);
  history.replaceState(null, '', returnHash);
}

function updateResults() {
  if (!app.querySelector('.results')) return;
  const list = shownDeals();
  const stats = statsFor(list);
  app.querySelector('[data-stats]').innerHTML = ui.statsMarkup(stats, route.state);
  document.getElementById('chips').innerHTML = ui.chipsMarkup(route.state);
  document.getElementById('result-count').textContent = ui.countText(stats, route.state);
  document.querySelector('.sort-note').textContent = `Sorted by ${route.state.sort === 'signal' ? 'Strongest signal' : route.state.sort === 'discount' ? 'Biggest discount' : route.state.sort === 'savings' ? 'Most dollars saved' : route.state.sort === 'price-asc' ? 'Lowest sale price' : route.state.sort === 'price-desc' ? 'Highest sale price' : 'Name A–Z'}`;
  document.getElementById('results').innerHTML = ui.resultsMarkup(list, route.state);
}

function resetFilters() {
  route.state = { q: '', category: '', store: '', min: 0, sort: 'signal' };
  commitState();
  syncControls();
  updateResults();
}

function bindDealsControls() {
  const search = document.getElementById('q');
  search.value = route.state.q;
  search.addEventListener('input', (event) => {
    route.state.q = event.target.value;
    commitState();
    updateResults();
  });
  for (const id of ['category', 'store', 'min', 'sort']) {
    const control = document.getElementById(id);
    control.addEventListener('change', (event) => {
      const value = event.target.value;
      if (id === 'min') route.state.min = Number(value);
      else route.state[id] = value;
      commitState();
      updateResults();
    });
  }
  document.getElementById('reset').addEventListener('click', resetFilters);
  document.getElementById('csv').addEventListener('click', () => exportData('csv'));
  document.getElementById('json').addEventListener('click', () => exportData('json'));
  document.getElementById('chips').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-chip]');
    if (!chip) return;
    const key = chip.dataset.chip;
    if (key === 'min') route.state.min = 0;
    else route.state[key] = '';
    commitState();
    syncControls();
    updateResults();
  });
  document.getElementById('results').addEventListener('click', (event) => {
    if (event.target.closest('[data-action="reset"]')) resetFilters();
  });
}

function exportData(kind) {
  const list = shownDeals();
  const filename = `deal-ledger-${list.length}-deals.${kind}`;
  let text;
  let type;
  if (kind === 'json') {
    text = JSON.stringify({
      board: 'Deal Ledger · Black Friday 2026',
      checkedAt,
      coverage,
      count: list.length,
      deals: list.map((d) => ({ ...d, saved: saved(d), signal: verdict(d) })),
    }, null, 2);
    type = 'application/json';
  } else {
    const header = ['product', 'store', 'category', 'sale_price_usd', 'usual_price_usd', 'saved_usd', 'discount_pct', 'signal_label', 'signal_score', 'checked_at_utc', 'store_url'];
    const lines = list.map((d) => {
      const v = verdict(d);
      return [d.product, d.store, d.category, d.salePrice, d.usualPrice, saved(d), d.discountPct, v.label, v.score, d.checkedAt, d.url].map(csvCell).join(',');
    });
    text = [header.map(csvCell).join(','), ...lines].join('\r\n');
    type = 'text/csv';
  }
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function closePanel() {
  location.hash = returnHash;
}

function bindOverlay() {
  const overlay = app.querySelector('.overlay');
  if (!overlay) return;
  document.body.classList.add('modal-open');
  overlay.querySelectorAll('[data-close]').forEach((node) => {
    node.addEventListener('click', (event) => {
      if (event.target === node || node.classList.contains('close-btn')) closePanel();
    });
  });
  overlay.querySelector('.detail').focus();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && route.view !== 'deals') {
    event.preventDefault();
    closePanel();
    return;
  }
  if (event.key !== 'Tab' || route.view === 'deals') return;
  const overlay = app.querySelector('.overlay');
  if (!overlay) return;
  const focusables = [...overlay.querySelectorAll('a[href], button')];
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

skip.addEventListener('click', () => {
  const target = document.getElementById('results') || document.querySelector('.method');
  if (target) target.focus();
});

function render() {
  window.__shotReady = false;
  route = parseRoute(location.hash);
  returnHash = listHref(route.state);
  document.body.classList.remove('modal-open');
  document.title = route.view === 'method'
    ? 'Method · Deal Ledger'
    : route.view === 'deal'
      ? `${allDeals.find((d) => d.id === route.id)?.product ?? 'Deal not found'} · Deal Ledger`
      : 'Deal Ledger · Black Friday 2026';

  if (route.view === 'method') {
    app.innerHTML = ui.methodPage(route.state);
    app.querySelector('.method').focus();
  } else {
    app.innerHTML = ui.dealsPage(route.state, statsFor(allDeals)) + (
      route.view === 'deal'
        ? allDeals.some((d) => d.id === route.id) ? ui.detailMarkup(allDeals.find((d) => d.id === route.id), route.state) : ui.missingDetail(route.id, route.state)
        : ''
    );
    bindDealsControls();
    updateResults();
    if (route.view === 'deal') bindOverlay();
  }

  setNav(route.view);
  window.scrollTo(0, 0);
  window.__shotReady = true;
  document.documentElement.dataset.ready = 'true';
}

window.addEventListener('hashchange', render);
render();
