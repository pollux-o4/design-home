# MOD-001 · 모듈 계약

범위: Design Compare의 순수 Domain과 학습 화면의 조립 경계. 결정: ADR-0001.

사전 조건·입력: 기존 프로젝트 설정, 샘플 ID, URL 및 저장된 schemaVersion 1 자료.

기대 동작: Domain은 Node I/O·브라우저·상위 기능에 의존하지 않는다. Capture는 Domain 계약을 사용하며 기존 capture/contract 진입점은 같은 심볼을 제공한다. 학습 샘플 정의·실행·수명주기의 원본은 각각 하나다. 조립은 모듈 내부 상태를 복제하지 않는다.

실패 복구: 잘못된 캡처·저장 자료는 기존 검증 오류를 유지한다. 화면 전환 시 이전 이벤트·타이머·애니메이션을 해제한다.

완료 기준: mod_001 의존성 테스트, 기존 contracts·project-boundary·샘플 수명주기·탐색 테스트 통과. 기존 공개 export 및 데이터 호환 유지.
