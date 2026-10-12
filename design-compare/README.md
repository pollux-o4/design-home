# Design Compare

디자인 예제를 찾고, 연결된 원본 또는 저장된 기준과 개발 화면을 비교하는 로컬 도구. CLI와 웹 허브가 같은 모듈을 사용한다.

```bash
cd design-compare
mise trust
mise run setup
./design --help
npm run hub
```

- [문서 안내](docs/README.md): 작업별 설명과 C1~C3 구조
- [실행과 AI 작업 흐름](docs/workflows.md): 수집·등록·비교·수정
- [디자인 문서와 메타데이터](docs/library.md): 웹·CLI의 단일 원본
- [에이전트 작업 안내](AGENTS.md): 수정할 책임과 읽을 문서

처음 쓰는 AI는 `./design brief --intent "만들려는 화면이나 컴포넌트" --json`으로 시작한다. 사람이 보는 최근 10건은 웹에서 확인한다.

C4는 실제 코드로 확인한다.

## Design Library 사용자 화면

Design Home 랜딩에서 **Design Library**로 진입합니다. 로컬은 `http://127.0.0.1:4174/design-library/`, GitHub Pages는 `/design-home/design-library/`를 사용합니다. SPA는 로컬 API와 정적 JSON 모드를 공유합니다. 공개 데이터 갱신은 `npm run build:library`, 전체 E2E 포함 검증은 `npm test`로 실행합니다. 내부 비교 모듈·CLI 이름은 Design Compare입니다.
