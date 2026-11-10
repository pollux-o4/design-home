// Native radio buttons provide keyboard selection without a second state store.
export function createViewSwitcher(root, onSelect) {
  root.addEventListener("change", (event) => {
    if (event.target.matches("input[name=pattern-view]")) onSelect(event.target.value);
  });
  return {
    update(state) {
      for (const input of root.querySelectorAll("input"))
        input.checked = input.value === state.view;
    },
  };
}
