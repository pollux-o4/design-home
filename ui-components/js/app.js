import { createViewSwitcher } from "./pattern-view-switcher.js";
import { mount, command, notify } from "./samples/runtime.js";
import { createPatternModel } from "./pattern-taxonomy.js";
import { createPatternTree } from "./pattern-tree.js";
import { createRenderer } from "./canvas-renderer.js";
import { createPatternNavigation } from "./pattern-navigation.js";
import { createPatternViewport } from "./pattern-viewport.js";
window.showToast = notify;
window.triggerInfiniteScroll = () => command("infinite-scroll", "next");
window.resetInfiniteScroll = () => command("infinite-scroll", "reset");

document.addEventListener("DOMContentLoaded", () => {
  const catalog = CanvasCatalog.create(ComponentModules),
    model = createPatternModel(catalog);
  const search = document.getElementById("search-input"),
    canvasGrid = document.getElementById("canvas-grid"),
    intro = document.querySelector(".canvas-intro");
  const params = new URLSearchParams(location.search),
    componentId = params.get("component");
  const specimen = params.get("view") === "specimen" && componentId;
  if (specimen) document.body.dataset.view = "specimen";
  let state;
  const navigation = createPatternNavigation({ model, onChange: apply });
  const navigate = navigation.navigate;
  const viewSwitcher = createViewSwitcher(
    document.getElementById("pattern-view-switcher"),
    (view) =>
      navigate({
        view,
        category: null,
        group: null,
        query: state.query,
        level: "basic",
      }),
  );
  const tree = createPatternTree(
    document.getElementById("layer-tree"),
    model,
    navigate,
  );
  const renderer = createRenderer({
    canvasGrid,
    catalog,
    model,
    mount,
    navigate,
    focusSearch: () => search.focus(),
  });
  const viewport = createPatternViewport({
    viewport: document.querySelector(".figma-canvas-viewport"),
    renderer,
  });
  function apply(route, previous, { syncSearch }) {
    state = { ...route, componentId };
    if (syncSearch) search.value = state.query;
    intro.hidden = !!state.category || !!state.query || !!componentId;
    viewSwitcher.update(state);
    tree.update(state);
    renderer.render(state);
    viewport.update(state, previous);
  }
  search.addEventListener("input", () =>
    navigate(
      { ...state, query: search.value.trim() },
      { replace: true, keepInput: true },
    ),
  );
  document.addEventListener("keydown", (event) => {
    const editing = event.target.closest(
      'input,textarea,select,[contenteditable="true"]',
    );
    if (
      (event.key === "/" && !editing) ||
      ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")
    ) {
      event.preventDefault();
      search.focus();
      search.select();
    } else if (
      event.key === "Escape" &&
      document.activeElement === search &&
      search.value
    ) {
      navigate({ ...state, query: "" }, { replace: true });
    }
  });
  navigation.start();
  if (specimen && componentId === "modal")
    document.querySelector("[data-open-dialog]").click();
});
