import { readRoute, navigate } from './navigation.js';
import { renderResults } from './cards.js';
import { renderFacets } from './facets.js';
const $ = selector => document.querySelector(selector);
const placeholders = {
  trends: '미니멀, 다크, 입체…',
  components: '모달, 입력, 알림…',
  work: '작업물 이름 또는 용도…',
};

export function createListView(source) {
  const origins = new Map();
  let debounce;
  const cancelPendingSearch = () => clearTimeout(debounce);
  function resetSearch() {
    cancelPendingSearch();
    navigate(readRoute().category, null, new URLSearchParams(), true);
    $('#query').focus({ preventScroll: true });
  }
  $('#clear-search').addEventListener('click', resetSearch);
  $('#search').addEventListener('submit', event => {
    event.preventDefault();
    cancelPendingSearch();
    const route = readRoute(), params = new URLSearchParams(route.params);
    const query = $('#query').value.trim();
    query ? params.set('q', query) : params.delete('q');
    navigate(route.category, null, params, true);
  });
  $('#query').addEventListener('input', () => {
    cancelPendingSearch();
    debounce = setTimeout(() => $('#search').requestSubmit(), 250);
  });

  return {
    cancelPendingSearch,
    async show({ category, params }, current) {
      cancelPendingSearch();
      const query = params.get('q') ?? '', tags = params.getAll('tag');
      $('#query').value = query;
      $('#query').placeholder = placeholders[category];
      $('#clear-search').hidden = !query && !tags.length;
      $('#count').textContent = '불러오는 중…';
      $('#results').replaceChildren();
      $('#filters').hidden = category === 'work';
      $('#filters').open = tags.length > 0;
      const result = await source.list(category, params);
      if (!current()) return;
      if (category !== 'work') {
        renderFacets(result, tag => {
          const next = new URLSearchParams(params), chosen = new Set(tags);
          chosen.has(tag) ? chosen.delete(tag) : chosen.add(tag);
          next.delete('tag');
          for (const value of chosen) next.append('tag', value);
          navigate(category, null, next, true);
        });
      }
      $('#filter-count').textContent = tags.length ? `${tags.length}개 선택` : '';
      renderResults(result, {
        reset: resetSearch,
        select(itemId) {
          origins.set(category, { id: itemId, scroll: window.scrollY });
          navigate(category, itemId, params);
        },
      });
      const origin = origins.get(category);
      if (origin) {
        origins.delete(category);
        [...document.querySelectorAll('.design-card')]
          .find(card => card.dataset.id === origin.id)?.focus({ preventScroll: true });
        window.scrollTo({ top: origin.scroll, behavior: 'instant' });
      }
    },
  };
}
