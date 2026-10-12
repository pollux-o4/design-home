# 실행과 AI 작업 흐름

명령은 `design-compare/`에서 실행한다. 최신 옵션은 `./design --help`에서 확인한다.

## 시작

```bash
mise trust
mise run setup
npm run hub
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

AI가 사전에 디자인 ID나 폴더를 조사할 필요가 없다. 반환된 이미지를 읽고 설명과 제약을 참고해 구현한다. `--limit 1~6`으로 자료 수를 제한하며, `--base-url` 또는 `DESIGN_BASE_URL`로 예제 서버를 지정한다. 기본 서버는 `http://127.0.0.1:4174`다.

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

- `inventory --project /프로젝트/features --json`: TSX/JSX의 내보낸 컴포넌트 후보와 `*.ui-preview.tsx` 수집. 실제 컴포넌트·샘플 연결 판단은 AI가 수행한다.
- `search --query "의도" --json`: 이미지를 만들지 않고 문서와 등록 자료 검색.
- `context --id ID --json`: 문서·관련 원본 일부 조회.
- `list --json`: 저장된 기준 목록.
- `inspect --reference ID --json`: 사진 기준은 저장된 측정값, 원본 연결은 메타데이터·선택자·조건 조회.
- `inspect --report /비교결과/report.json --part title --json`: 필요한 부분의 수정 근거와 보관 이미지 조회. 조회 종료 코드는 0이고 비교 판정은 `comparisonStatus`에 있다.

`./design`은 도구 폴더에서 실행되며, 등록 JSON·보고서·프로젝트 경로는 절대 경로로 전달한다. CLI와 웹의 store를 맞추려면 `DESIGN_STORE`를 공통으로 지정한다.

## 저장된 사진 기준 데모

`npm run demo`로 비교 데모를 띄운 뒤 다른 터미널에서 실행한다.

```bash
./design register --id box-art --url http://127.0.0.1:4173/reference \
  --selector '[data-design-id="box-art"]' --json
./design compare --reference box-art --url http://127.0.0.1:4173/drift --json
```

## Design Home → Design Library

`npm run hub`로 실행하면 `/`의 기존 랜딩에서 Design Library로 이동할 수 있다. 직접 진입 주소는 `http://127.0.0.1:4174/design-library/`다.

GitHub Pages에서는 `/design-home/design-library/`로 진입한다. 문서·원본을 수정한 뒤 `design-compare/`에서 `npm run build:library`를 실행하고 생성된 `../design-library/data/`와 `../design-library/previews/`를 소스 변경과 함께 커밋한다. 기존 저장소 Pages 배포를 사용하며 별도 Node 서버는 필요 없다. 공개 배포에 로컬 작업물이나 호출 기록을 포함하지 않는다.

`npm test`는 프로젝트 접두사를 가진 API 없는 정적 서버에서 랜딩→검색·필터→상세·실제 미리보기→새로고침·직접 링크·모바일 흐름과 24개 자료의 미리보기를 검증한다. 로컬 서버의 등록 작업·호출 기록 검증도 함께 수행한다.
