# 디자인 문서와 메타데이터

프로젝트 설정의 `documentsRoot`가 디자인 이름·설명·태그·원본 연결·권장 화면 크기·사용 설명의 단일 원본이다. Design Home은 도구 밖의 [`design-home-library/documents/`](../../design-home-library/documents/)를 연결한다. 첫 JSON 코드 블록은 구조화된 메타데이터이고, 그 아래 Markdown은 설명이다. 문서 본문은 웹에서 제목·문단·목록으로 표시하며 CLI `context --json`에도 제공한다. HTML과 스크립트는 실행하지 않는다.

웹과 CLI는 `src/library/index.js`의 `createLibrary({ documentsRoot, sourceRoot })`를 사용한다. 설명·분류를 변경하려면 Markdown만 수정한다. 요청할 때 다시 읽으므로 서버 재시작 없이 다음 조회에 반영된다. 문서 ID·필수 필드·태그·원본 경로·화면 크기·중복 ID를 검증한다.

- `src/library/`: 문서 해석·검색·원본 조회. 웹 UI나 프로젝트 폴더 구조에 의존하지 않는다.
- 프로젝트의 `documentsRoot`: AI가 관리하는 디자인 문서와 메타데이터.
- `src/hub/`, `hub/`: 현재 프로젝트 연결 설정과 웹 화면.
- `src/cli/`: 같은 기능을 명령으로 호출한다.

다른 프로젝트에서는 도구 배포 묶음을 설치하고 프로젝트 루트의 `design-system.config.json`에 필요한 `sourceRoot`, `documentsRoot`, `store`, `baseUrl`을 설정한다. 미리보기 서버를 쓰려면 프로젝트의 `baseUrl`을 명시한다. 설정이 없으면 다른 프로젝트의 서버로 연결하지 않는다. 경로는 설정 파일 기준이며 CLI·웹이 공유한다. 기존 `DESIGN_HOME_ROOT`, `DESIGN_DOCUMENTS_ROOT`, `DESIGN_STORE`, `DESIGN_BASE_URL`은 실행 시 재정의용으로 유지한다. 원본과 문서는 프로젝트가 소유하고 배포 도구에는 포함하지 않는다.

새 디자인 문서는 [유기적 UI 문서](../../design-home-library/documents/biomorphic-organic.md)처럼 작성한다. 기존 문서의 JSON을 복사해 ID·분류·상대 원본 경로·미리보기 경로를 바꾸고, 필요한 설명을 아래에 추가한다. 웹 목록용으로 같은 내용을 JavaScript에 재등록하지 않는다.

독립 설치본에서는 프로젝트 문서 폴더에 다음과 같은 Markdown 파일로 시작할 수 있다. `sourcePath`는 sourceRoot 내부 파일이고, `previewPath`는 baseUrl 서버의 경로다.

````markdown
```json
{
  "schemaVersion": 1,
  "id": "checkout",
  "title": "결제 화면",
  "summary": "주문 확인과 결제",
  "sourcePath": "src/checkout.html",
  "previewPath": "/checkout",
  "tags": ["minimal"],
  "structure": [],
  "interactions": [],
  "constraints": [],
  "viewport": { "width": 1280, "height": 900 }
}
```

## 사용 안내

이 프로젝트의 결제 화면 검토 기준.
````

외부 설치본은 공통 UI만 제공한다. 프로젝트 화면은 별도 개발 서버가 제공하며 `baseUrl`로 미리보기를 연결한다. 소스 조회 설정으로 프로젝트 파일 전체를 HTTP에 노출하지 않는다.

## 의도 선택과 등록 자료

문서의 `kind`는 페이지 또는 컴포넌트를 구분하고 `keywords`·`useCases`는 의도 선택의 근거다. `capture`에는 캡처할 선택자·부분 매핑·필요한 샘플 열기 선택자를 둔다. 명칭·분류·캡처 동작을 CLI 코드에 재등록하지 않는다.

Library의 선택 로직을 검색과 `brief`가 함께 사용한다. `brief`는 선택한 문서의 레시피로 이미지를 만들고, 사용자에게 ID 조합을 요구하지 않는다. 등록된 작업물의 메타데이터는 store의 `references/<ID>/reference.json`이 원본이며 같은 선택 로직으로 검색한다.

작업 전 자료에서 만든 비교 연결은 내부 준비 자료로 표시한다. 이후 추천이나 웹 제품 목록에 다시 포함하지 않으므로 준비할 때마다 동일 자료가 추천 목록에 늘어나지 않는다.

## 목록 미리보기와 공통 스크롤바

목록은 `design-library/previews/<ID>.png`의 실제 샘플 이미지를 표시한다. `npm run build:library`가 문서 기반 JSON과 Chromium 미리보기를 함께 갱신한다. 외부 폰트 요청을 끊은 동일한 로컬 환경에서 문서의 viewport·선택자를 사용하며, 컴포넌트는 조작 요소를 잘라 보여준다. 미리보기 이미지는 탐색용이고 비교 기준은 기존 CLI의 실시간 캡처다.

`component-scrollbar`는 공통 `shared/js/scrollbar.js`와 `shared/css/scrollbar.css`에 연결된다. 랜딩·라이브러리·캔버스에서 같은 모듈을 사용하며 내부 영역은 `data-scroll-region`으로 등록한다. 가로·세로 트랙은 내용 크기를 따라 갱신되고, 제거한 영역의 이벤트·트랙도 해제된다. 샘플은 `ui-components/scrollbar/index.html`에서 직접 조작할 수 있다.
