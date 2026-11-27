export const defaults = { q: '', category: '', store: '', min: 0, sort: 'signal' };
const sorts = ['signal', 'discount', 'savings', 'price-asc', 'price-desc', 'name'];
const mins = [0, 20, 30, 40, 50, 60];

export function parseState(query = '') {
  const p = new URLSearchParams(query);
  const min = Number(p.get('min'));
  const sort = p.get('sort') ?? '';
  return {
    q: (p.get('q') ?? '').slice(0, 80),
    category: p.get('category') ?? '',
    store: p.get('store') ?? '',
    min: mins.includes(min) ? min : 0,
    sort: sorts.includes(sort) ? sort : defaults.sort,
  };
}

export function stateQuery(state) {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.category) p.set('category', state.category);
  if (state.store) p.set('store', state.store);
  if (state.min) p.set('min', String(state.min));
  if (state.sort !== defaults.sort) p.set('sort', state.sort);
  const text = p.toString();
  return text ? `?${text}` : '';
}

export function listHref(state) {
  return `#/${stateQuery(state)}`;
}

export function dealHref(id, state) {
  return `#/deal/${encodeURIComponent(id)}${stateQuery(state)}`;
}

export function parseRoute(hash) {
  const raw = (hash || '').slice(1) || '/';
  const cut = raw.indexOf('?');
  const path = cut < 0 ? raw : raw.slice(0, cut);
  const query = cut < 0 ? '' : raw.slice(cut + 1);
  const state = parseState(query);
  if (path.startsWith('/deal/')) return { view: 'deal', id: decodeURIComponent(path.slice(6)) || '', state };
  if (path === '/method') return { view: 'method', id: '', state };
  return { view: 'deals', id: '', state };
}
