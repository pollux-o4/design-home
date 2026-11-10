# design_home

디자인 스킬/레퍼런스 모음.

Design Home은 디자인 학습 제품이다. `design-compare/`의 Design System Library는 프로젝트별 디자인 검토 도구이며, 루트 `design-system.config.json`이 이 프로젝트의 자료와 검토 저장소를 연결한다. 학습 문서는 `design-home-library/documents/`가 소유한다.

학습 화면의 구조는 [Design Home 컴포넌트 지도](docs/design-home-components.md), 검토 도구는 [Design System Library C1~C4](design-compare/docs/README.md)에서 확인한다.

## 로컬 서버 실행

저장소 루트에서 `mise run hub`로 실행한다. 처음 실행할 때는 `mise trust`로 설정을 신뢰한다.
Design System Library 주소는 `http://127.0.0.1:4184/design-library/`다. 종료는 실행한 터미널에서 `Ctrl+C`를 누른다.

- `impeccable/` — impeccable 디자인 스킬 (github: pbakaus/impeccable)
- `mengto-skills/` — MengTo Skills 모음 (github: MengTo/Skills)
- [`design-compare/`](design-compare/README.md) — 기준 컴포넌트·개발 페이지 시각/CSS 비교 CLI

## 탐색

- 학습 제품: Patterns · Glossary · Trends · Libraries. `docs`에서 컴포넌트 관심사를 검색한다.
- 검토 도구: `design-compare`의 architecture · workflows · results-and-validation.
- 계약·선택: `specs`의 MOD-001 · UX-001, `decisions`의 ARCH-001.

개발·검증 명령은 각 package.json과 mise.toml이 원본이다. 모듈 경계를 바꾸면 MOD-001, 화면·효과를 바꾸면 UX-001 기준을 적용한다.
