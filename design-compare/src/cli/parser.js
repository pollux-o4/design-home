import { parseArgs } from 'node:util';
import { commands } from './commands.js';
import { DEFAULT_PIXEL_BUDGET } from '../comparison/policy.js';
import { loadProject } from '../project.js';

const string = { type: 'string' };
const options = {
  help: { type: 'boolean', short: 'h' }, json: { type: 'boolean' }, details: { type: 'boolean' },
  intent: string, 'base-url': string, limit: string, task: string,
  'open-selector': string, project: string, manifest: string,
  tag: { type: 'string', multiple: true }, query: string, id: string, reference: string, candidate: string, report: string, url: string, selector: string, store: string,
  part: { type: 'string', multiple: true }, ignore: { type: 'string', multiple: true },
  viewport: string, theme: string, state: string, 'pixel-budget': string,
};

export const help = `Design Compare — 의도 입력 → 자료 이미지 → 작업 등록 → 비교 → 최근 호출 검수

${Object.values(commands).map(command => command.usage).join('\n')}

처음 사용: ./design brief --intent "프로젝트 입력 모달을 만들려고 해" --json
공통: --store 경로 (기본 .design-compare / DESIGN_STORE) · --task ID (같은 작업 연결) · --json
자료: --base-url URL (기본 DESIGN_BASE_URL 또는 http://127.0.0.1:4184) · --limit 1~6 (기본 3)
등록: --viewport 1280x900 · --theme light|dark · --state default|hover|focus
비교: --ignore CSS속성 (반복 가능) · --pixel-budget 0~1 (기본 ${DEFAULT_PIXEL_BUDGET})
AI 출력: --json 요약·부분별 개수·파일 경로 / --json --details 전체 차이
부분 선택자는 루트 내부 기준. 동일한 이름으로 1:1 매핑.
뷰포트·테마·상태는 등록 조건으로 고정. 별도 조건은 별도 ID로 등록.
종료 코드: 0 등록·조회·검사 통과 · 1 비교 차이 발견 · 2 입력·실행 오류.
inspect는 실패 보고서 조회에도 0 반환. 판정은 comparisonStatus 확인.
`;

export function parseInvocation(args) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options });
  if (values.help || args.length === 0) return { help: true, values };
  const [name, ...extra] = positionals;
  if (extra.length || !Object.hasOwn(commands, name ?? '')) throw new Error(`명령: ${Object.keys(commands).join(', ')} (--help 참고)`);
  const command = commands[name];
  for (const key of Object.keys(values)) if (!['store', 'task'].includes(key) && !command.options.includes(key)) throw new Error(`${name}에서 --${key} 사용 불가`);
  if (values.details && !values.json) throw new Error('--details는 --json과 함께 사용');
  values.store ??= loadProject().store;
  return { name, command, values, request: { ...command.prepare(values), store: values.store } };
}
