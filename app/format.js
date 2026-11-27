const number = new Intl.NumberFormat('en-US');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const entities = { '&': '&#38;', '<': '&#60;', '>': '&#62;', '"': '&#34;', "'": '&#39;' };

export const money = (value) => `$${number.format(value)}`;
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => entities[c]);
export const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;

export function checkedShort(iso) {
  const d = new Date(iso);
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
}

export function checkedFull(iso) {
  const d = new Date(iso);
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} at ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`;
}
