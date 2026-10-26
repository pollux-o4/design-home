const moodLabels = {
  minimal: "정제된 미니멀 minimal refined",
  soft: "부드러운 soft",
  vivid: "대담한 bold vivid",
  immersive: "몰입감 있는 immersive",
};

export function mountCollectionFilter(root = document) {
  const filters = [...root.querySelectorAll("[data-mood]")];
  const cards = [...root.querySelectorAll(".grid .card")];
  const search = root.querySelector("#style-search");
  const empty = root.querySelector(".collection-empty");
  const count = root.querySelector(".collection-count");
  function filterCollection() {
    const mood = filters.find(
      (filter) => filter.getAttribute("aria-pressed") === "true",
    ).dataset.mood;
    const terms = search.value
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    cards.forEach((card) => {
      const moods = card.dataset.moods.split(" ");
      const text =
        `${card.textContent} ${moods.map((item) => moodLabels[item]).join(" ")}`.toLocaleLowerCase();
      card.hidden =
        (mood !== "all" && !moods.includes(mood)) ||
        !terms.every((term) => text.includes(term));
    });
    const visible = cards.filter((card) => !card.hidden).length;
    count.textContent = `${visible} / ${cards.length}`;
    empty.hidden = visible !== 0;
  }
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      filters.forEach((filter) =>
        filter.setAttribute("aria-pressed", String(filter === button)),
      );
      filterCollection();
    }),
  );
  search.addEventListener("input", filterCollection);
  document.addEventListener("dh:language-change", filterCollection);
}
