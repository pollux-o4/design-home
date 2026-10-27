import { contrastResult, inspectControlBaseline } from "../../../shared/js/design-system-audit.js";

const $ = (selector) => document.querySelector(selector);
const targetLabels = { text: "일반 텍스트", large: "큰 텍스트", component: "UI 컴포넌트" };
const findingLabels = { "square-control": "사각형 컨트롤", "native-select": "기본 select", "small-target": "작은 조작 영역" };

function renderContrast() {
  const foreground = $("#contrast-foreground").value.trim();
  const background = $("#contrast-background").value.trim();
  const target = document.querySelector("input[name=contrast-target]:checked").value;
  const result = contrastResult(foreground, background, target);
  const sample = $("#contrast-sample");
  const output = $("#contrast-result");
  if (!result.ratio) {
    output.textContent = "#RGB 또는 #RRGGBB 형식으로 입력하세요.";
    output.dataset.status = "invalid";
    return;
  }
  sample.style.color = foreground;
  sample.style.background = background;
  const grade = result.aa ? "AA 통과" : "AA 미달";
  const aaa = result.aaa === null ? "AAA 대상 아님" : result.aaa ? "AAA 통과" : "AAA 미달";
  output.textContent = `${result.ratio.toFixed(2)}:1 · ${grade} · ${aaa} (${targetLabels[target]} 기준 ${result.threshold}:1)`;
  output.dataset.status = result.aa ? "pass" : "fail";
}

function renderAudit() {
  const findings = inspectControlBaseline($("#control-audit-sample"));
  const results = $("#control-audit-results");
  results.replaceChildren();
  if (!findings.length) {
    results.textContent = "검토할 기본 UI 신호가 없습니다.";
    return;
  }
  const list = document.createElement("ul");
  for (const finding of findings) {
    const item = document.createElement("li");
    item.textContent = `${findingLabels[finding.kind]}: ${finding.name}`;
    list.append(item);
  }
  results.append(list);
}

export function createAccessibilityView() {
  let mounted = false;
  return {
    show({ id }) {
      if (!mounted) {
        $("#contrast-checker").addEventListener("submit", (event) => {
          event.preventDefault();
          renderContrast();
        });
        $("#run-control-audit").addEventListener("click", renderAudit);
        mounted = true;
      }
      if (id === "contrast") renderContrast();
      if (id === "controls") renderAudit();
    },
  };
}
