// Adapter: registered work and catalog documents expose the same view model.
function workDesign(reference) {
  return {
    ...reference,
    id: reference.referenceId ?? reference.id,
    kind: 'work',
    summary: reference.description,
    previewPath: reference.conditions?.url,
    capture: reference.conditions,
    sourceFiles: (reference.sources ?? []).map(path => ({ path })),
    constraints: [],
    structure: [],
    interactions: [],
  };
}

export function createLibrarySource(read) {
  const providers = {
    work: {
      async list(params) {
        const query = params.get('q') ?? '';
        const { references } = await read('/api/components');
        return {
          results: references
            .filter(item => item.mode === 'live' && item.status === 'ready' &&
              !item.transient && (!query || `${item.title} ${item.description}`.includes(query)))
            .map(workDesign),
        };
      },
      async detail(id) {
        return workDesign(await read(`/api/components?id=${encodeURIComponent(id)}`));
      },
    },
    catalog: {
      list(params, category) {
        const query = new URLSearchParams({
          kind: category === 'components' ? 'component' : 'trend',
          q: params.get('q') ?? '',
        });
        for (const tag of params.getAll('tag')) query.append('tag', tag);
        return read(`/api/search?${query}`);
      },
      detail(id) {
        return read(`/api/context?id=${encodeURIComponent(id)}`);
      },
    },
  };
  const provider = category => providers[category === 'work' ? 'work' : 'catalog'];
  return {
    list: (category, params) => provider(category).list(params, category),
    detail: (category, id) => provider(category).detail(id),
  };
}
