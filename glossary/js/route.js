export function readRoute(hash, entries) {
  const [path, search = ''] = hash.replace(/^#\/?/, '').split('?');
  const [category = '', id = ''] = path.split('/');
  const validCategory = ['ui', 'ux', 'motion'].includes(category) ? category : '';
  const entry = entries.find((entry) => entry.id === id && entry.category === validCategory);
  const params = new URLSearchParams(search);
  const example = params.get('example') || '';
  return { category: validCategory,
    id: entries.some((entry) => entry.id === id && entry.category === validCategory) ? id : '',
    query: params.get('q') || '',
    example: entry?.samples?.includes(example) ? example : '',
    invalid: Boolean((category && !validCategory) || id && !entries.some((entry) => entry.id === id && entry.category === validCategory)) };
}
export function routeHref({ category = '', id = '', query = '', example = '' }) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (id && example) params.set('example', example);
  return `#/${[category, id].filter(Boolean).map(encodeURIComponent).join('/')}${params.size ? '?' + params : ''}`;
}
