# Design Compare 작업

이 폴더는 CLI·웹 허브·디자인 자료·비교 기능을 가진 모듈러 모놀리스다. 작업에 해당하는 문서만 읽는다.

| 작업 | 먼저 읽을 문서 |
|---|---|
| 사용자·외부 시스템 또는 실행 단위 변경 | [C1](docs/architecture/c1-context.md) → [C2](docs/architecture/c2-containers.md) |
| 모듈 책임·의존성·진입점 변경 | [C3](docs/architecture/c3-components.md) |
| 디자인 추가·분류·설명·원본 연결 또는 모듈 추출 | [문서와 메타데이터](docs/library.md) |
| CLI 호출 기록·최근 10건·이미지 보관 변경 | [호출 기록](docs/activity.md) |
| CLI 명령·AI 등록·비교 작업 흐름 변경 | [실행과 작업 흐름](docs/workflows.md) |
| 캡처·판정·보고서·오류 처리 변경 | [결과와 검증](docs/results-and-validation.md) |

처음 사용하는 AI의 작업 준비는 `brief --intent`에서 시작한다.

프로젝트 설정·배포·격리를 바꾸면 [C4 코드 계약](docs/architecture/c4-code.md)과 `tests/project-boundary.test.js`를 확인한다. 자료는 프로젝트 설정의 `documentsRoot`에서 관리한다. Design Home 자료는 도구 밖의 `../design-home-library/documents/`에 있다. 완성 작업물은 `link`로 등록하며 웹과 CLI는 같은 프로젝트 설정을 읽는다.

변경 검증은 해당 모듈의 `tests/`에서 시작한다. 캡처·보고서·웹 미리보기를 바꾸면 실제 Chromium 또는 브라우저에서 해당 화면과 주요 조작을 확인한다. 실행 명령은 `package.json`과 `mise.toml`에서 확인한다.

책임·실행 단위·의존성이 바뀌면 해당 C1~C3 문서를 갱신한다. 프로젝트 경계의 공개 계약을 바꾸면 C4 지도와 연결된 테스트도 갱신한다.
