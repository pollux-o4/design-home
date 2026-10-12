/* Registry adapter: category data owns order; all consumers share search semantics. */
(function () {
  window.CanvasCatalog = {
    create(registry = {}) {
      const modules = Object.values(registry);
      function groups(module) {
        return module.groups || [{ components: module.components || [] }];
      }
      function components(module) {
        return groups(module).flatMap((group) => group.components);
      }
      const byId = new Map(
        modules
          .flatMap(components)
          .map((definition) => [definition.id, definition]),
      );
      function filter(items, query) {
        const needle = query.trim().toLowerCase();
        return items.filter(
          (item) =>
            !needle ||
            [item.id, item.title, item.term, item.desc].some((value) =>
              String(value || "")
                .toLowerCase()
                .includes(needle),
            ),
        );
      }
      return {
        modules,
        groups,
        components,
        filter,
        find: (id) => byId.get(id),
      };
    },
  };
})();
