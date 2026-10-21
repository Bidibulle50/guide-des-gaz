(() => {
  let theme = 'system';
  try { const value = localStorage.getItem('guide-gaz-theme'); if (['light', 'dark', 'system'].includes(value)) theme = value; } catch {}
  document.documentElement.dataset.theme = theme;
})();
