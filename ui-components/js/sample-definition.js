/* Definition Factory: canonical markup and sample metadata have one source. */
(function () {
  const sprite = new URL("../../shared/assets/interface-icons.svg", document.currentScript.src)
    .href;
  function icon(name) {
    return `<svg class="ui-icon" aria-hidden="true"><use href="${sprite}#${name}"></use></svg>`;
  }
  function define({ id, title, term, reference, desc, html, behavior, level = "basic" }) {
    const markup = `<div class="sample" data-sample-id="${id}">${html.trim()}</div>`;
    return {
      id,
      title,
      term,
      reference,
      desc,
      behavior,
      level,
      render: () => markup,
    };
  }
  function register(id, title, desc, groups) {
    window.ComponentModules ||= {};
    window.ComponentModules[id] = {
      id,
      title,
      desc,
      tag: "COMPONENT COLLECTION",
      groups,
    };
  }
  window.CanvasSamples = { define, icon, register };
})();
