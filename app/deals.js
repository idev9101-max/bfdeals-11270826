import { deals } from './data.js';
import { money } from './format.js';

export const allDeals = deals;
export const categories = [...new Set(deals.map((d) => d.category))].sort();
export const stores = [...new Set(deals.map((d) => d.store))].sort();
export const saved = (d) => d.usualPrice - d.salePrice;

export function verdict(d) {
  const dollars = saved(d);
  const score = Math.round(0.55 * d.discountPct + 0.45 * Math.min(dollars / 600, 1) * 100);
  const label = score >= 70 ? 'Exceptional' : score >= 50 ? 'Strong' : score >= 35 ? 'Fair' : 'Modest';
  const tone = score >= 70 ? 'hot' : score >= 50 ? 'strong' : score >= 35 ? 'fair' : 'cool';
  return { score, label, tone, reason: `${d.discountPct}% off, ${money(dollars)} below usual` };
}

export function statsFor(list) {
  if (list.length === 0) return { count: 0, average: 0, biggest: 0, top: 0 };
  return {
    count: list.length,
    average: Math.round(list.reduce((sum, d) => sum + d.discountPct, 0) / list.length),
    biggest: Math.max(...list.map(saved)),
    top: Math.max(...list.map((d) => verdict(d).score)),
  };
}

export function filterDeals(list, state) {
  const q = state.q.trim().toLowerCase();
  return list.filter((d) => (
    (q === '' || d.product.toLowerCase().includes(q)) &&
    (state.category === '' || d.category === state.category) &&
    (state.store === '' || d.store === state.store) &&
    d.discountPct >= state.min
  ));
}

const comparators = {
  signal: (a, b) => verdict(b).score - verdict(a).score || saved(b) - saved(a),
  discount: (a, b) => b.discountPct - a.discountPct || saved(b) - saved(a),
  savings: (a, b) => saved(b) - saved(a) || b.discountPct - a.discountPct,
  'price-asc': (a, b) => a.salePrice - b.salePrice || saved(b) - saved(a),
  'price-desc': (a, b) => b.salePrice - a.salePrice || saved(b) - saved(a),
  name: (a, b) => a.product.localeCompare(b.product, 'en'),
};

export function sortDeals(list, sort) {
  return [...list].sort(comparators[sort] ?? comparators.signal);
}
