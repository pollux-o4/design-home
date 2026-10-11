/* Registry adapter: category data owns order; all consumers share search semantics. */
(function () {
  window.CanvasCatalog = {
    create(registry = {}) {
      const modules = Object.values(registry);
      function components(module) {
        return module.groups ? module.groups.flatMap(group => group.components) : (module.components || []);
      }
      function filter(items, query) {
        const needle = query.trim().toLowerCase();
        return items.filter(item => !needle || [item.id, item.title, item.desc]
          .some(value => String(value || '').toLowerCase().includes(needle)));
      }
      function prepareRender() { modules.forEach(module => module.beforeRender?.()); }
      return { modules, components, filter, prepareRender };
    }
  };
})();
