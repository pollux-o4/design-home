# Design Compare 작업

공통 규칙: RULE-CORE · RULE-ADR · RULE-SPEC · RULE-TEST · RULE-OPS. 처음 작업 준비는 `brief --intent`에서 시작한다.

- 구조·프로젝트 경계: `docs/architecture`에서 C1~C4, `tests`에서 project-boundary와 mod_001 검색.
- 자료·호출 기록: `docs`에서 library · activity 검색. 프로젝트의 documentsRoot가 자료를 소유한다.
- 명령·검증·복구: `docs`에서 workflows · results-and-validation 검색. 실행 명령은 package.json과 mise.toml 사용.

CLI와 서버는 같은 프로젝트 설정·Application을 사용하고 인스턴스별 자료와 저장소를 격리한다. Domain은 순수 계약을 소유한다. 공개 계약 변경은 MOD-001, 모션·미리보기 변경은 UX-001 기준으로 검증한다.

관련 모듈 테스트부터 실행하고 캡처·보고서·웹 변경은 실제 Chromium으로 조작한다. 책임·의존성 변경은 해당 C4 수준의 지도를 갱신하며 현재 심볼 목록은 코드에서 검색한다.
