# ADR-0002 · TOOL-001 개발 도구

맥락: 정적 학습 제품과 독립 실행하는 검토 도구가 공존한다. 기존 동작·모션·패키지 계약을 보존하면서 설치와 검증을 재현해야 한다.

선택: mise가 실행 도구 버전과 진입 명령, pnpm workspace가 JS 의존성과 잠금 파일을 소유한다. Vite는 다중 HTML과 module script를 빌드하고 기존 classic script 순서를 보존한다. Node 서버와 패키지 prepack은 독립 계약으로 유지한다.

대안·비용: 전면 ESM·TypeScript·테스트 러너 교체는 이번 설치·품질 자동화보다 변경 범위가 크다. 기존 Node 테스트와 Playwright를 유지하고 Biome·Knip·Gitleaks·Lefthook으로 역할을 나눈다. Vite 자산 보존 목록은 유지 비용이 있지만 원본과 빌드 산출물을 같은 브라우저 계약으로 검증한다.

결과: 정적 빌드는 별도 e2e로 검증한다. hook은 빠른 피드백, CI는 전체 검증을 소유한다. 비밀정보는 실제 staged blob과 push 범위를 검사하며 검사 실패 시 차단한다. 최초 포맷 변경은 동작 변경과 분리한다.
