# Design Compare

프로젝트마다 설치해 디자인 자료·기준·개발 화면을 검토하는 도구. Design Home은 이 도구에 자기 학습 자료를 연결하는 한 프로젝트다. CLI와 웹은 같은 프로젝트 설정과 저장소를 사용한다.

```bash
cd design-compare
mise trust
mise run setup
./design --help
mise run hub
```

- [문서 안내](docs/README.md): 작업별 설명과 C1~C3 구조
- [실행과 AI 작업 흐름](docs/workflows.md): 수집·등록·비교·수정
- [디자인 문서와 메타데이터](docs/library.md): 웹·CLI의 단일 원본
- [에이전트 작업 안내](AGENTS.md): 수정할 책임과 읽을 문서

처음 쓰는 AI는 `./design brief --intent "만들려는 화면이나 컴포넌트" --json`으로 시작한다. 사람이 보는 최근 10건은 웹에서 확인한다.

[C4 코드 계약](docs/architecture/c4-code.md)은 프로젝트 설정과 배포·격리의 구현 진입점 및 회귀 검증을 연결한다.

## 다른 프로젝트에 설치

이 도구 폴더에서 `npm pack`으로 배포 묶음을 만든다. 다른 프로젝트에서 `npm install /경로/design-home-compare-0.1.0.tgz`로 설치하고 프로젝트 루트에서 `npx design-system-library`를 실행한다. AI는 `npx design-compare --help`를 사용한다. 레지스트리 게시는 수행하지 않는다.

프로젝트 루트의 `design-system.config.json` 예시:

```json
{
  "schemaVersion": 1,
  "name": "내 제품",
  "sourceRoot": ".",
  "documentsRoot": "design-documents",
  "store": ".design-compare",
  "baseUrl": "http://127.0.0.1:3000"
}
```

경로는 설정 파일 기준이다. 현재 폴더에서 상위로 가장 가까운 설정을 찾으며 `DESIGN_CONFIG`로 파일을 명시할 수 있다. 문서가 없으면 `documentsRoot`를 생략하고 품질 도구부터 사용할 수 있다. 연결한 문서는 기존 [메타데이터 계약](docs/library.md)을 따른다. `baseUrl`은 프로젝트가 별도로 실행하는 개발 서버다. 캡처 명령을 사용할 때 설치 패키지의 Playwright Chromium도 준비한다 (`npx playwright install chromium`).

설정 없는 프로젝트는 빈 상태로 시작한다. Design Home 문서·학습 화면·검토 기록은 배포 묶음에 포함되지 않는다. Git 훅이나 중앙 서버 없이 실행 가능하며 CI는 기존 CLI 종료 코드를 사용할 수 있다.

## Design System Library 사용자 화면

Design Home 랜딩에서 **Design System Library**로 진입합니다. 로컬은 `http://127.0.0.1:4184/design-library/`, GitHub Pages는 `/design-home/design-library/`를 사용합니다. SPA는 로컬 API와 정적 JSON 모드를 공유합니다. 공개 데이터 갱신은 `npm run build:library`, 전체 E2E 포함 검증은 `npm test`로 실행합니다. 내부 비교 모듈·CLI 이름은 Design Compare입니다.

### 접근성 점검

라이브러리의 **접근성 점검**은 WCAG 대비 비율을 계산합니다. **디자인 일관성 검사**는 프로젝트 DOM에서 사각형 컨트롤·작은 조작 영역과 기본 select·날짜·파일·색·범위·숫자·검색 입력·스크롤바를 검토 신호로 찾습니다. `data-ds-native="allow"` 또는 `--allow`로 의도적인 시스템 UI를 제외할 수 있고, CLI의 `--strict`만 시스템 기본 UI를 실패로 처리합니다.
