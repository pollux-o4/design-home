# Design Compare

기준 컴포넌트와 개발 페이지의 시각·스타일 비교 CLI. 독립 Node 프로세스, 모듈러 모놀리스.

## 실행

```bash
mise trust
mise run setup
npm run demo
```

다른 터미널에서:

```bash
./design register --id box-art \
  --url http://127.0.0.1:4173/reference \
  --selector '[data-design-id="box-art"]' \
  --part title='[data-part="title"]' \
  --part description='[data-part="description"]' \
  --part action='[data-part="action"]'

./design compare --reference box-art --url http://127.0.0.1:4173/drift
./design compare --reference box-art --url http://127.0.0.1:4173/same --json
```

- 실제 개발 페이지: `--url`, `--selector`, `--part` 교체
- `./design`: mise로 Node 실행, 도구 폴더의 기준 자료 사용. 별도 카탈로그는 `--store`로 지정
- `--part` 선택자는 루트 내부 기준. 양쪽의 동일한 이름으로 1:1 매핑
- 신규 DOM 구조가 다르면 비교 명령에서 `--selector`, `--part` 재지정
- 비교 조건은 등록 시 고정: 뷰포트·테마·상태·DPR·로케일·타임존
- 모바일·다크·hover·focus: 별도 기준 ID로 등록. focus는 루트가 포커스 가능한 요소일 때 사용
- `--ignore font-size`: 명시적 허용 속성. 허용한 차이도 보고서에 유지
- `--pixel-budget 0.01`: 전체 캡처 영역 중 픽셀 차이 허용 비율. 스타일 예외와 별개
- 종료 코드: 0 검사 통과, 1 차이 발견, 2 입력·실행 오류
- `--json`: 판정·부분별 개수·파일 경로·다음 명령만 출력. 전체 차이는 `--json --details`
- 기존 ID 재등록 거부. 새 ID로 기준 이력 유지

## 결과

- `.design-compare/references/ID/`: 기준 이미지·측정값·캡처 조건
- `.design-compare/reports/실행ID/index.html`: 나란히 보기·겹쳐 보기·차이 이미지·속성 비교
- `report.json`: AI용 구조화 자료, 1:1 매핑·선택자·클래스·실제 CSS·상대 좌표·판정
- `repair.json`: 부분별 현재 값·기준 값·소스·수정 방향. 허용 차이는 별도 표시
- 수정 대상 카드 선택 시 해당 부분만 필터링하고 이미지 영역 강조
- 속성 검색·허용 차이 표시·빈 결과 안내. 전체 박스부터 수정 후 하위 요소 재검토
- 이미지 원본 링크로 확대 확인. 겹쳐 보기에서 신규 이미지 불투명도 조정
- `data-design-source`로 소스 위치 명시 가능. 자동 소스 역추적 기능 없음
- 외부 서비스나 AI API로 결과 전송 없음

## AI 작업 흐름

```bash
./design list --json
./design inspect --reference box-art --part title --json
./design compare --reference box-art --url http://127.0.0.1:4173/drift --json
./design inspect --report '/비교결과/report.json' --part title --json
```

- `list`: 기준 ID·매핑·조건 발견. 등록된 기준이 없으면 빈 목록
- `inspect --reference`: 브라우저 실행 없이 기준 조회. `--part`로 해당 부분의 CSS만 확인
- `compare`: 요약 확인 후 `nextActions`의 인자 배열로 부분 조회·재검사
- `inspect --report`: 전체는 부분별 개요, `--part` 지정 시 해당 수정 근거만 출력
- 부분 조회에는 이미지 절대 경로 포함. 전체 DOM 측정값은 필요한 경우에만 `report.json` 열기
- 조회 종료 코드는 0. 원래 비교 판정은 `comparisonStatus` 확인
- 오류에는 `code`·복구 안내·명령 인자 포함. 부분 이름 오류에는 `availableParts` 포함
- `nextActions.argv`는 셸 문자열이 아닌 인자 배열. 재검사 시 예외·매핑·카탈로그 조건 보존

## 모듈

- `catalog`: 기준 보관·실행별 결과 저장
- `capture`: 브라우저 조건 고정·DOM 측정·캡처 안정성 확인
- `comparison`: 스타일·상대 좌표·의사 요소·픽셀 차이 판정
- `reporting`: 사람용 정적 HTML
- `application`: Adapter 조립·등록·조회·비교 흐름
- `cli`: Command 정의·입력 검증·출력·오류 복구
- `domain`: ID·측정 자료·파일명·메타데이터 공통 계약

## 검증과 한계

```bash
npm test
```

- 실제 Chromium과 CLI·보고서·기존 디자인 홈을 함께 검증
- 검사 통과는 디자인 승인과 별개. 사람·AI가 이미지와 제품 맥락을 추가 검토
- 텍스트 내용·클래스명 차이는 규칙 위반으로 직접 계산하지 않지만 픽셀 차이에 반영
- 선택한 부분의 CSS를 측정. 매핑하지 않은 자손의 변화는 픽셀 검사에만 반영
- 전환·애니메이션 비활성화. 움직임 품질 평가 범위 제외
- 인증 상태 주입·자동 유사 컴포넌트 검색·토큰 원본 역추적은 MVP 범위 제외
- 같은 머신·브라우저·폰트 환경에서 기준 생성과 비교 권장
- Chromium 버전 불일치 시 비교 중단. 새 기준 ID 등록 필요
- 캡처 제한 시간 30초. 로딩 실패·불안정한 캡처는 검사 통과 대신 오류 반환

참고: [Playwright](https://playwright.dev/docs/screenshots), [pixelmatch](https://github.com/mapbox/pixelmatch).
