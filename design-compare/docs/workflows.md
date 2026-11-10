# 실행과 AI 작업 흐름

명령은 `design-compare/`에서 실행한다. 최신 옵션은 `./design --help`에서 확인한다.

## 시작

```bash
mise trust
mise run setup
mise run hub
```

웹 허브는 디자인 예제의 개발 서버도 겸한다. 외부 프로젝트는 자체 개발 서버를 띄우고, 다음 명령은 다른 터미널에서 실행한다.

## 처음 쓰는 AI: 의도만 입력

```bash
./design brief --intent "새 프로젝트를 추가할 입력 폼 모달" --json
```

CLI가 문서의 용도·검색어·이름·태그와 등록된 작업물을 같은 방식으로 검색한다. 관련 자료를 최대 3개 선택해 현재 원본을 캡처하고 다음을 반환한다.

- `items`: 이미지 절대 경로, 선택 근거, 설명·제약·원본 연결과 비교 기준 ID.
- `taskId`: 같은 작업의 등록·비교·조회에 사용할 ID.
- `registrationTemplate`: 완성한 작업물의 등록 자료를 작성하는 출발점.
- `nextActions`: 등록·비교 명령의 인자 배열. store와 task ID를 포함한다.

AI가 사전에 디자인 ID나 폴더를 조사할 필요가 없다. 반환된 이미지를 읽고 설명과 제약을 참고해 구현한다. `--limit 1~6`으로 자료 수를 제한하며, `--base-url` 또는 `DESIGN_BASE_URL`로 예제 서버를 지정한다. 기본 서버는 `http://127.0.0.1:4184`다.

`no-match`는 없는 용도를 임의 자료로 채우지 않고 가능한 용도를 안내한다. 일부 캡처만 성공하면 `partial`과 실패 원인을 함께 반환한다. 모두 실패하면 오류로 종료한다.

## 완성한 작업물 등록

AI가 `registrationTemplate`의 이름·설명·분류·태그·검색어·실제 소스 경로·샘플 URL·선택자를 채워 JSON으로 저장한다. 검색어는 다른 AI가 자연스럽게 요청할 용도로 작성한다.

```bash
./design link --manifest /절대경로/completed.json --task 준비할때받은ID --json
```

등록은 원본 연결 정보를 저장한다. 사진을 수동으로 갱신할 필요가 없다. 등록 자료의 `capture.openSelector`는 갤러리에서 샘플을 여는 버튼이다. 연결 ID·URL·선택자·실행 조건은 [실마리 예시](../examples/silmari-basic-list.json)를 참고한다.

등록한 작업은 다음 `brief`와 `search`에서 다시 발견할 수 있다. 중복 ID는 거부하며, 연결 조건을 바꾸려면 새 ID로 등록한다.

## 등록 정보로 검수

```bash
./design compare --reference 준비자료의기준ID \
  --candidate 등록한작업물ID --task 준비할때받은ID --json
```

기준과 등록 작업물의 원본을 같은 조건으로 새로 렌더링한다. 후보의 URL·선택자·샘플 열기 동작·부분 매핑은 등록 정보에서 가져온다. 반환한 `evidence.images`의 기준·개발·차이 이미지를 읽고 보고서로 검수한다. 차이가 있으면 수정 후 `nextActions`의 재검사 명령을 사용한다.

직접 개발 주소를 지정하려면 `--candidate` 대신 `--url`을 사용한다. DOM 구조가 다르면 `--selector`, `--part 이름=CSS`로 매핑을 지정한다. 부분 선택자는 루트 내부 기준이며 양쪽 이름이 대응해야 한다.

- 화면 크기·테마·상태·DPR·로케일·타임존은 기준 조건을 사용한다. 모바일·다크·hover·focus는 별도 기준으로 만든다.
- `--ignore font-size`는 허용할 속성 차이, `--pixel-budget`은 전체 이미지 영역의 픽셀 차이 허용 비율이다. 허용 차이도 근거에 남긴다.
- `--json`은 요약·이미지 경로·다음 명령을, `--json --details`는 전체 속성 차이도 제공한다.
- 종료 코드: 0 정상 조회·등록·검사 통과, 1 비교 차이 발견, 2 입력·실행 오류.

## 사람의 검수

웹의 최근 AI 호출에서 작업 전 자료·등록·검수 순서를 확인한다. AI에 제공한 이미지와 출력을 보관해 보여준다. CLI에서는 `./design history --json`으로 같은 최근 10건을 읽는다. 같은 작업을 잇는 `--task`는 조회 명령에도 사용할 수 있다. [호출 기록](activity.md)에서 저장 방식과 웹 제공 범위를 설명한다.

## 보조 명령

- `localization --scenario ./language-scenario.json --json`: 프로젝트가 지정한 언어 버튼을 누르고 본문·접근성 이름과 새로고침 후 언어 유지를 검사한다. `scope`, 선택적인 `openEach`, `languages`의 `code`·`control`·`rejectPattern`은 프로젝트가 소유한다. 예를 들어 영어 화면에서 남은 한국어는 `rejectPattern: "[가-힣]"`로 검토한다. 의도적인 다국어 콘텐츠는 검사 영역을 분리한다. 기본은 검토 결과를 기록하며 `--strict`를 켜면 누락 시 종료 코드 1을 반환한다. 번역의 의미적 정확성을 자동으로 보증하지 않는다.
- `contrast --scenario ./contrast-scenario.json --json`: axe-core로 지정 영역의 글자 대비를 검사한다. `themes`별로 별도 브라우저를 열고 `openEach`로 지정한 버튼을 차례로 눌러 `scope`를 검사한다. 선택적으로 `afterEach`에 영역 내 버튼 선택자를 지정하면 버튼을 한 번 더 누른 상태도 검사한다. 확인 불가 항목은 `incomplete`에 기록한다. 기본은 차단하지 않으며 `--strict`는 위반 시 1, 검사 오류 또는 수동 확인 필요 시 2를 반환한다. CSS 선택자는 프로젝트가 소유하며 실제 클릭이 실행되므로 안전한 검사 환경을 사용한다.

대비 시나리오는 기본적으로 브라우저의 색상 선호도를 설정한다. 프로젝트가 별도의 테마 선택 버튼을 쓰면 `themeControls`에 테마별 선택자를, 메뉴를 먼저 열어야 하면 `themeOpen`에 버튼 선택자를 지정한다. 실제 적용 여부를 확인하려면 `themeVerification`에 요소 선택자·속성·테마별 기대값을 지정한다. 미지정 시 `themeEvidence`는 `browser-preference`이며 앱의 실제 테마 적용을 보증하지 않는다. 예: `"themeVerification": { "selector": "html", "attribute": "data-theme", "values": { "light": "light", "dark": "dark" } }`.
- `inventory --project /프로젝트/features --json`: TSX/JSX의 내보낸 컴포넌트 후보와 `*.ui-preview.tsx` 수집. 실제 컴포넌트·샘플 연결 판단은 AI가 수행한다.
- `search --query "의도" --json`: 이미지를 만들지 않고 문서와 등록 자료 검색.
- `context --id ID --json`: 문서·관련 원본 일부 조회.
- `list --json`: 저장된 기준 목록.
- `inspect --reference ID --json`: 사진 기준은 저장된 측정값, 원본 연결은 메타데이터·선택자·조건 조회.
- `inspect --report /비교결과/report.json --part title --json`: 필요한 부분의 수정 근거와 보관 이미지 조회. 조회 종료 코드는 0이고 비교 판정은 `comparisonStatus`에 있다.
- `audit --url http://localhost:3000 --selector '#app' --viewport 390x844 --theme dark --open-selector '#open-menu' --json`: 지정한 화면 크기·테마와 열기 동작 후 기본 UI를 검사한다. 보이는 iframe과 열린 Shadow DOM도 검사하며 `framePath`·`shadowPath`로 위치를 식별한다. `data-ds-native="allow"` 또는 `--allow '[data-ds-native=allow]'`는 의도적인 시스템 UI를 제외한다. 기본은 검토 결과와 종료 코드 0이며, `--strict`일 때만 시스템 기본 UI가 종료 코드 1이 된다. 프레임 검사가 실패하면 `coverage`에 사유가 남고 종료 코드 2로 불완전함을 알린다. `--open-selector`는 실제 클릭이므로 검사 환경에서 안전한 UI 열기 동작에만 사용한다.
- `motion --scenario ./motion-scenario.json --json`: 프로젝트가 지정한 동작과 화면을 관찰한다. 기본 900ms 동안 전·중간·후 6장, CSS 이벤트, 실제 관찰 시간과 사전 배경 변화를 기록한다. 클릭·호버·키 입력·뒤로 가기를 지원하며, `region`으로 관심 영역을, `expected`로 동작 후 상태를 지정할 수 있다. `locale`과 `timezoneId`로 실행 환경을 지정할 수 있으며 생략하면 기존 한국어·서울 기준을 유지한다. `expectation`은 `review`(기본), `motion`, `instant` 중 선택한다. 예시는 [시나리오](../examples/motion-scenario.json)를 참고한다.
- `motion --url http://localhost:3000 --action '#open-page' --json`: 기존 클릭 명령도 지원한다. 결과는 `review`(검토), `motion-observed`(움직임 관찰), `accepted`(즉시 전환 기대에 부합), `inconclusive`(근거 부족)다. CSS 이벤트는 인과관계를 보장하지 않으며, 샘플 사이의 짧은 움직임은 놓칠 수 있다. 선택한 정책에 `--strict`를 함께 쓰면 검토 1, 판정 보류 2로 종료한다. 기본 실행은 차단하지 않는다. 실제 동작을 실행하므로 안전한 검사 환경을 사용한다.

검사는 Chromium에서 현재 렌더링된 상태의 DOM과 계산된 스타일을 기준으로 한다. 열기 후 비동기로 표시되는 영역은 `--selector`에 해당 영역을 지정해 표시될 때까지 기다린다. 선택기·날짜·파일·색 입력은 외형을 꾸며도 시스템 선택기가 열릴 수 있어 검토 대상으로 포함한다. 선택기와 `::picker(select)`가 모두 `appearance: base-select`이면 커스텀 목록으로 구분한다. 네이티브 팝업 내부, 닫힌 Shadow DOM, 별도로 열지 않은 메뉴와 다른 브라우저·기기는 이 검사만으로 보증할 수 없다. CSS 스크롤바 판정도 근거가 제한적이므로 프로젝트에서 의도적으로 사용한 영역은 허용 규칙으로 명시한다.

`./design`은 호출한 현재 폴더를 유지한다. 프로젝트 설정 파일의 상위 탐색과 상대 경로 해석은 CLI·웹이 공유한다. 등록 JSON·보고서 인자는 호출 폴더 기준이며 절대 경로를 권장한다. 명시적인 `--store`가 없으면 설정의 store를 사용한다. 다른 프로젝트에서는 설치한 `design-compare`와 `design-system-library` 명령을 사용한다.

## 저장된 사진 기준 데모

`npm run demo`로 비교 데모를 띄운 뒤 다른 터미널에서 실행한다.

```bash
./design register --id box-art --url http://127.0.0.1:4173/reference \
  --selector '[data-design-id="box-art"]' --json
./design compare --reference box-art --url http://127.0.0.1:4173/drift --json
```

## Design Home → Design System Library

`mise run hub`로 실행하면 `/`의 기존 랜딩에서 Design System Library로 이동할 수 있다. 직접 진입 주소는 `http://127.0.0.1:4184/design-library/`다.

GitHub Pages에서는 `/design-home/design-library/`로 진입한다. 문서·원본을 수정한 뒤 `design-compare/`에서 `npm run build:library`를 실행하고 생성된 `../design-library/data/`와 `../design-library/previews/`를 소스 변경과 함께 커밋한다. 기존 저장소 Pages 배포를 사용하며 별도 Node 서버는 필요 없다. 공개 배포에 로컬 작업물이나 호출 기록을 포함하지 않는다.

`npm test`는 프로젝트 접두사를 가진 API 없는 정적 서버에서 랜딩→검색·필터→상세·실제 미리보기→새로고침·직접 링크·모바일 흐름과 24개 자료의 미리보기를 검증한다. 로컬 서버의 등록 작업·호출 기록 검증도 함께 수행한다.
