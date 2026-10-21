export function normalize(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
// Editorial selection for quick access, not a measured popularity ranking.
export const ESSENTIAL_IDS = Object.freeze(['oxygene','azote','argon','dioxyde-carbone','hydrogene','helium','acetylene','air','methane','propane','ammoniac','monoxyde-carbone']);
const essentialRank = new Map(ESSENTIAL_IDS.map((id, index) => [id, index]));
export function orderGases(gases) {
  return [...gases].sort((a,b) => (essentialRank.get(a.id) ?? Infinity) - (essentialRank.get(b.id) ?? Infinity) || a.name.localeCompare(b.name,'fr',{numeric:true,sensitivity:'base'}));
}
export function catalogueSelection(gases, query, mode, favorites) {
  // A typed search always covers the whole catalogue, even from Essentials/Favorites.
  if(query.trim()) return searchGases(gases, query);
  const ordered=orderGases(gases);
  if(mode==='essentials') return ordered.filter(g=>essentialRank.has(g.id));
  if(mode==='favorites') return ordered.filter(g=>favorites.has(g.id));
  return ordered;
}
export function searchGases(gases, query, favorites = null) {
  const q = normalize(query);
  // Chemical case matters: cobalt must not be presented as carbon monoxide.
  if (query.trim() === 'Co') return [];
  return orderGases(gases.filter(g => (!favorites || favorites.has(g.id)) && (!q || [g.name, g.subtitle, g.formula, g.cas, ...g.aliases].some(x => normalize(x).includes(q)))))
    .sort((a, b) => (normalize(b.formula) === q ? 1 : 0) - (normalize(a.formula) === q ? 1 : 0));
}
export function readFavorites(raw, validIds) {
  try { const parsed = JSON.parse(raw); return new Set(Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string' && validIds.has(x)) : []); } catch { return new Set(); }
}
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
