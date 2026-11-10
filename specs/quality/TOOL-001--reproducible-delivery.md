# TOOL-001 · 재현 가능한 개발과 전달

범위·환경: mise 고정 Node·pnpm·Gitleaks, 루트 workspace, CI Linux와 Playwright Chromium·Firefox·WebKit. 선택 이유: ADR-0002.

입력: 잠금 파일, 작업 트리와 다른 staged blob, 새 브랜치·태그·기존 ref의 push 정보, 기본·하위 배포 경로.

기대 동작: frozen 설치가 잠금 파일을 수정하지 않는다. 커밋 검사는 실제 staged 내용만 읽으며 작업 트리와 인덱스를 자동 수정하지 않는다. 비밀정보 검사는 redaction을 사용하고 검사 도구 실패·해석 불가 입력을 성공으로 취급하지 않는다. Vite 산출물은 공개 자산만 포함하며 기존 모션·일반 script 실행 순서·정적 검색을 보존한다.

실패 복구: 검사 실패 시 해당 커밋·푸시를 차단한다. UI 변경 후 취소와 최종 상태를 기존 UX-001로 검증한다. 자격증명 발견 시 폐기·재발급 후 기록 정리 범위를 결정한다.

완료 기준: tool_001의 staged/부분 스테이징·새 ref·tag 보안 사례 통과, Biome·Knip 종료 코드 0, 기존 전체 테스트와 기본·prefix 빌드 브라우저 검증 통과, 독립 패키지 계약 유지. GitHub 필수 검사는 게시된 CI 체크 이름과 일치시킨다.
