import { createPatternMotionEntries, motionDemos } from "./motion-demos.js";
import principles from "../../ui-components/js/pattern-principles.js";

// UI definitions and UX principles stay owned by Patterns; only glossary curation lives here.
const ui = [
  ["tooltip", "tooltip", "가리킨 요소에 짧은 도움말을 띄웁니다."],
  ["modal", "modal", "배경을 잠시 막고 하나의 작업에 집중합니다."],
  ["drawer", "drawer", "화면 가장자리에서 보조 패널을 엽니다."],
  ["popover", "popover", "현재 화면 위에 부가 정보나 조작을 펼칩니다."],
  ["toast", "toast", "작업 결과를 짧게 알립니다."],
  ["toggle-switch", "switch", "하나의 설정을 켜거나 끕니다."],
  ["checkbox", "check", "여러 선택지를 함께 선택합니다."],
  ["radio", "radio", "여러 선택지 중 하나만 고릅니다."],
  ["accordion", "accordion", "제목을 눌러 내용을 접고 펼칩니다."],
  ["tab-bar", "tabs", "같은 영역에서 콘텐츠를 바꿔 봅니다."],
  ["breadcrumb-interactive", "path", "현재 위치와 상위 경로를 보여줍니다."],
  ["pagination", "steps", "콘텐츠를 페이지로 나눠 이동합니다."],
  ["skeleton-ui", "skeleton", "불러올 콘텐츠의 윤곽을 먼저 보여줍니다."],
  ["progress-bar", "progress", "작업이 얼마나 진행됐는지 보여줍니다."],
  ["empty-state", "empty", "내용이 없을 때 다음 행동을 안내합니다."],
  ["data-sort-table", "table", "행과 열로 비교하고 기준에 따라 정렬합니다."],
  ["layout-grid", "grid", "화면을 열과 간격으로 나눠 배치합니다."],
  ["form-stepper", "steps", "긴 입력을 단계별로 나눠 진행합니다."],
];
const uxPreviews = {
  visibility: "progress",
  "real-world": "slider",
  control: "undo",
  consistency: "tabs",
  prevention: "check",
  recognition: "path",
  efficiency: "command",
  minimalism: "accordion",
  recovery: "undo",
  help: "tooltip",
  fitts: "target",
  hick: "choice",
  jakob: "tabs",
  proximity: "groups",
};
export function createGlossary(catalog) {
  const entries = ui.map(([id, visual, desc]) => {
    const definition = catalog.find(id);
    if (!definition) throw new Error(`Missing glossary sample: ${id}`);
    return { ...definition, category: "ui", visual, desc, samples: [id] };
  });
  for (const group of principles.flatMap((section) => section.groups)) {
    entries.push({
      ...group,
      category: "ux",
      visual: uxPreviews[group.id],
      desc: group.desc.split(". ")[0].replace(/\.$/, "") + ".",
      samples: [
        ...(catalog.find(`ux-${group.id}`) ? [`ux-${group.id}`] : []),
        ...group.ids.slice(0, 2),
      ],
    });
  }
  entries.push({
    id: "progressive-disclosure",
    category: "ux",
    title: "점진적 공개",
    term: "Progressive Disclosure",
    desc: "지금 필요한 것부터 보여주고 나머지는 펼쳐 봅니다.",
    visual: "accordion",
    samples: ["accordion", "layout-master-detail"],
    reference: "https://www.nngroup.com/articles/progressive-disclosure/",
  });
  for (const entry of entries)
    for (const id of entry.samples) {
      if (!catalog.find(id)) throw new Error(`Missing glossary example: ${id}`);
    }
  return [...entries, ...motionDemos, ...createPatternMotionEntries(catalog)];
}
export const categories = [
  { id: "ui", title: "UI 용어집", subtitle: "화면을 이루는 요소", mark: "UI" },
  {
    id: "ux",
    title: "UX 용어집",
    subtitle: "경험을 설계하는 원리",
    mark: "UX",
  },
  {
    id: "motion",
    title: "모션·효과 용어집",
    subtitle: "움직임과 시각 효과",
    mark: "M",
  },
];
