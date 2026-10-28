const quote = value => `'${value.replaceAll("'", "'\\''")}'`;

export function nextActions(result, args) {
  const target = result.repair.find(group => group.violations)?.part;
  return [
    { purpose: target ? '수정할 부분 조회' : '시각 검토 근거 조회', argv: ['./design', 'inspect', '--report', result.jsonPath, ...(target ? ['--part', target] : []), '--json'] },
    { purpose: '같은 조건으로 재검사', argv: ['./design', 'compare', ...args.slice(1).filter(value => value !== '--details')] },
  ];
}

export function jsonOutput(name, result, values) {
  if (name !== 'compare') return result;
  const { reference, candidate, repair, findings, ...output } = result;
  output.parts = repair.map(({ part, violations, allowedDifferences }) => ({ part, violations, allowedDifferences }));
  if (values.details) output.findings = findings;
  return output;
}

const textPresenters = {
  history: result => JSON.stringify(result, null, 2),
  brief: result => JSON.stringify(result, null, 2),
  inventory: result => JSON.stringify(result, null, 2),
  link: result => `원본 연결: ${result.referenceId}\n${result.directory}`,
  search: result => result.registered?.length ? JSON.stringify(result, null, 2) : result.results.length ? result.results.map(item => `${item.id} · ${item.title} · ${item.summary}\n  ${item.reasons.map(reason => `${reason.term} → ${reason.matched}`).join(' · ')}\n  ./design context --id ${item.id} --json`).join('\n') : '일치하는 디자인 없음. 다른 의도나 스타일 이름으로 검색.',
  context: result => JSON.stringify(result, null, 2),
  list(result) {
    return result.references.length ? result.references.map(reference => `${reference.id} · ${reference.status === 'ready'
      ? `${reference.viewport.width}×${reference.viewport.height} · ${reference.theme} · ${reference.state}` : reference.message}`).join('\n')
      : '등록된 기준 없음. ./design register --help로 등록 방법 확인.';
  },
  inspect: result => JSON.stringify(result, null, 2),
  register: result => `기준 등록: ${result.referenceId}\n${result.directory}\n다음: ./design inspect --reference ${result.referenceId}`,
  audit(result) {
    const state = result.status === 'pass' ? '일관성 검사 통과' : result.status === 'fail' ? '시스템 기본 UI 발견' : result.status === 'error' ? '일부 화면 검사 실패' : '검토할 UI 신호 발견';
    return `${state} · 시스템 기본 UI ${result.summary.platform}개 · 형태·조작 영역 ${result.summary.review}개\n${result.findings.map(({ kind, name, target, framePath = [], shadowPath = [] }) => `${kind}: ${name} (${[...framePath, ...shadowPath, target].join(' → ')})`).join('\n')}${result.coverage?.length ? `\n검사하지 못한 프레임: ${result.coverage.map(item => item.framePath.join(' → ')).join(', ')}` : ''}`;
  },
  motion(result) {
    const label = { review: '화면 전환 검토 필요', 'motion-observed': '움직임 신호 관찰됨 · 품질 확인 필요', inconclusive: '화면 변화 확인 불가', accepted: '프로젝트에서 즉시 전환 허용' }[result.status];
    return `${label} · 화면 차이 ${(result.changeRatio * 100).toFixed(2)}% · 전환 이벤트 ${result.events.length}개`;
  },
  compare(result) {
    const parts = result.repair.filter(group => group.violations).map(group => `${group.part} ${group.violations}개`).join(' · ');
    const target = result.repair.find(group => group.violations)?.part ?? '$root';
    return `${result.status === 'pass' ? '검사 통과' : '차이 발견'} · 규칙 차이 ${result.summary.violations}개 · 픽셀 차이 ${(result.visual.ratio * 100).toFixed(2)}%\n${parts ? `수정 대상: ${parts}\n` : ''}사람 리뷰: ${result.reportPath}\nAI 수정 자료: ${result.repairPath}\n부분 조회: ./design inspect --report ${quote(result.jsonPath)} --part ${quote(target)} --json`;
  },
};

export const textOutput = (name, result) => textPresenters[name](result);
export const errorOutput = error => `오류 [${error.code}]: ${error.message}\n다음: ${error.recovery.hint} (${error.recovery.argv.join(' ')})`;
