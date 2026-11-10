import { createOverview } from "./pattern-overview.js";
import { createSampleGrid } from "./sample-card.js";
import { createTopicView } from "./pattern-topic-view.js";
import { createSearchView } from "./pattern-search-view.js";

// Rendering owns view selection and mounted sample lifetime.
export function createRenderer({
  canvasGrid,
  catalog,
  model,
  mount,
  navigate,
  focusSearch,
  onError = (error) => console.error(error),
}) {
  let disposers = [],
    topicView,
    currentTopic,
    renderKey;
  let mounted = new WeakSet();
  function clear() {
    const pendingDisposers = disposers;
    disposers = [];
    const errors = [];
    for (const dispose of pendingDisposers) {
      try {
        dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    mounted = new WeakSet();
    try {
      topicView?.dispose();
    } catch (error) {
      errors.push(error);
    }
    topicView = null;
    currentTopic = null;
    renderKey = null;
    canvasGrid.replaceChildren();
    if (errors.length) {
      try {
        onError(new AggregateError(errors, "Sample teardown failed"));
      } catch (error) {
        console.error(error);
      }
    }
  }
  function activate() {
    for (const sample of canvasGrid.querySelectorAll("[data-sample-id]")) {
      if (mounted.has(sample)) continue;
      disposers.push(
        mount(sample, catalog.find(sample.dataset.sampleId).behavior),
      );
      mounted.add(sample);
    }
  }

  function render(state) {
    const nextKey = state.componentId
      ? `specimen/${state.componentId}`
      : state.query
        ? JSON.stringify([
            state.view,
            state.category,
            state.group,
            state.query,
          ])
        : null;
    if (nextKey && nextKey === renderKey) return;
    if (
      topicView &&
      `${state.view}/${state.category}` === currentTopic &&
      !state.query &&
      !state.componentId
    ) {
      topicView.update(state);
      activate();
      return;
    }
    clear();
    renderKey = nextKey;
    if (state.componentId) {
      const definition = catalog.find(state.componentId);
      if (definition) canvasGrid.append(createSampleGrid([definition]));
    } else if (state.query) {
      canvasGrid.append(
        createSearchView({ state, catalog, model, navigate, focusSearch }),
      );
    } else {
      const topic = model.find(state.category, state.view);
      if (topic) {
        currentTopic = `${state.view}/${topic.id}`;
        topicView = createTopicView(topic, navigate);
        canvasGrid.append(topicView.element);
        topicView.update(state);
      } else
        canvasGrid.append(
          createOverview(model.topicsFor(state.view), state.view),
        );
    }
    activate();
  }
  return {
    reset: clear,
    render,
    groupTarget: (id) => topicView?.groupTarget(id),
    settled: () => topicView?.settled() ?? Promise.resolve(),
  };
}
