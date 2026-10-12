export function filterEntries(entries, categories = [], search = '', claimMap = {}) {
  const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter(entry => {
    if (categories.length && !(entry.claimIds || []).some(id => categories.includes(String(id)))) return false;
    const text = [entry.text, entry.exampleId, entry.sourceLink, ...(entry.keywordIds || []),
      ...(entry.claimIds || []).map(id => {
        const c = claimMap[id];
        return c ? `${c.claimShortText || c.keyword || ''} ${c.claimText || ''} ${c.aimText || ''}` : '';
      })].join(' ').toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  });
}
export function summarize(entries) {
  return entries.reduce((result, entry) => {
    result[entry.date] = (result[entry.date] || 0) + 1;
    return result;
  }, {});
}
export function closestEntry(entries, date) {
  return entries.find(entry => entry.date >= date) || entries[entries.length - 1] || null;
}
export function formatDate(date, options = { month: 'long', day: 'numeric', year: 'numeric' }) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', options);
}
