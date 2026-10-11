import { FILES } from '../domain/artifacts.js';
import { escape } from './html.js';
import { renderComponents, renderScreens } from './components.js';
import { reportStyles } from './styles.js';
import { reportScript } from './controller.js';

export function renderDocument(report, projection) {
  const { referenceId, status, conditions, visual, findings, summary } = report;
  const { keys, actionable } = projection;
  const { rows, tasks, overlays, parts } = renderComponents(report, projection);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(referenceId)} · 디자인 비교</title>
<style>${reportStyles}</style></head><body style="--comparison-width:${projection.comparisonWidth}px"><main>
<header>
<div>
<div class="eyebrow">DESIGN HOME / COMPARE</div><h1>${escape(referenceId)}</h1>
<p class="muted">${conditions.viewport.width} × ${conditions.viewport.height} · ${escape(conditions.theme)} · ${escape(conditions.state)} · DPR 1</p></div><span class="status ${status}">${status === 'pass' ? '검사 통과' : '차이 발견'}</span></header>
<nav class="jump" aria-label="보고서 이동"><a href="#fixes">수정 대상</a><a href="#visual">시각 비교</a><a href="#differences">상세 차이</a><a href="${FILES.repair}" download>AI 수정 자료</a></nav>
<div class="metrics">
<div><strong>${summary.violations}</strong><span>규칙 차이</span></div>
<div><strong>${(visual.ratio * 100).toFixed(2)}%</strong><span>픽셀 차이 / 허용 ${(visual.budget * 100).toFixed(2)}%</span></div>
<div><strong>${summary.allowedDifferences}</strong><span>명시적 허용 차이</span></div></div>
<p class="notice">자동 검사는 디자인 승인과 별개. 텍스트·맥락·상호작용·접근성은 이미지와 실제 페이지에서 별도 검토.</p>
<section id="fixes">
<h2>수정 시작 · ${actionable.length}개 대상</h2>
<p class="muted">전체 박스의 스타일부터 확인한 뒤 하위 요소 검토. 위치 차이는 상위 간격 수정으로 함께 해결될 수 있음.</p>${tasks ? `<div class="tasks">${tasks}</div>` : `<p class="empty">수정할 규칙 차이 없음.${visual.withinBudget ? ' 이미지와 사용 맥락 확인 후 최종 판단.' : ' 픽셀 허용 범위 초과 — 시각 비교에서 내용·매핑하지 않은 요소 확인.'}</p>`}</section>
<h2 id="visual" tabindex="-1">시각 비교</h2>
<p class="muted" id="selection" aria-live="polite">전체 영역 · 동일 배율 비교</p>
<div class="toolbar"><button id="side" aria-pressed="true">나란히 보기</button><button id="blend" aria-pressed="false">겹쳐 보기</button><button id="clear-selection" hidden>전체 영역 보기</button>
<label id="opacity-label" hidden>신규 불투명도 <input id="opacity" type="range" min="0" max="100" value="50"> <output id="opacity-value">50%</output></label></div>
<div class="screens" id="screens">${renderScreens(report, overlays)}</div>
<div class="overlay" id="overlay">
<div class="overlay-stage"><img src="${FILES.referenceAligned}" alt="기준 이미지"><img class="candidate" id="candidate-overlay" src="${FILES.candidateAligned}" alt="신규 이미지">${overlays('candidate')}</div></div>
<h2 id="differences">상세 차이</h2>
<p class="muted">실제 적용 CSS와 루트 기준 상대 좌표 비교. 클래스명 차이 자체는 위반으로 계산하지 않음. 좁은 화면에서는 표를 좌우로 스크롤.</p>
${findings.length ? `<div class="toolbar filters">
<label>부분 <select id="part-filter"><option value="">전체</option>${keys.map(key => `<option value="${escape(key)}">${escape(key === '$root' ? '전체 박스' : key)}</option>`).join('')}</select></label>
<label>속성 검색 <input id="search" type="search" placeholder="예: padding, font"></label>
<label><input type="checkbox" id="allowed"> 허용한 차이 포함</label><span id="row-count" aria-live="polite">${summary.violations}개</span></div>
<p id="no-results" class="table-empty" hidden>조건에 맞는 차이 없음. 부분·검색·허용 차이 필터 확인.</p>
<div class="table-wrap" tabindex="0" role="region" aria-label="상세 차이 표, 좌우 스크롤">
<table>
<thead><tr><th>부분</th><th>검사·속성</th><th>신규 값</th><th>기준 값</th><th>판정</th></tr></thead>
<tbody>${rows}</tbody></table></div>` : '<p class="empty">측정한 스타일·위치·크기 차이 없음.</p>'}
<h2>컴포넌트 매핑</h2>${parts}
<h2>비교 대상</h2>
<p class="source">기준: ${escape(report.reference.url)}</p>
<p class="source">신규: ${escape(report.candidate.url)}</p>
<footer><a href="${FILES.report}" download>AI 비교 자료 JSON</a> · 모든 이미지와 비교 자료는 이 폴더에 포함</footer>
</main><script>${reportScript}</script></body></html>`;
}
