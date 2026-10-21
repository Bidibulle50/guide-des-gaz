export function normalize(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
export function searchGases(gases, query, favorites = null) {
  const q = normalize(query);
  // Chemical case matters: cobalt must not be presented as carbon monoxide.
  if (query.trim() === 'Co') return [];
  return gases.filter(g => (!favorites || favorites.has(g.id)) && (!q || [g.name, g.subtitle, g.formula, g.cas, ...g.aliases].some(x => normalize(x).includes(q))))
    .sort((a, b) => (normalize(b.formula) === q ? 1 : 0) - (normalize(a.formula) === q ? 1 : 0));
}
export function readFavorites(raw, validIds) {
  try { const parsed = JSON.parse(raw); return new Set(Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string' && validIds.has(x)) : []); } catch { return new Set(); }
}
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
