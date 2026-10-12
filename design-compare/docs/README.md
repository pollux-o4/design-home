# 문서 안내

## 작업별 문서

| 필요한 정보 | 문서 |
|---|---|
| 설치·후보 수집·AI 등록·비교·수정 | [실행과 AI 작업 흐름](workflows.md) |
| 디자인 설명의 원본·문서 형식·외부 프로젝트 연결 | [디자인 문서와 메타데이터](library.md) |
| AI에 제공한 이미지·최근 10건·같은 작업 연결 | [호출 기록](activity.md) |
| 저장 자료·보고서·검증·지원 범위 | [결과와 검증](results-and-validation.md) |

## 현재 코드의 C4 모델

| 단계 | 범위 | 문서 |
|---|---|---|
| C1 Context | 시스템을 쓰는 사람·AI와 외부 시스템 | [시스템 맥락](architecture/c1-context.md) |
| C2 Container | 실행되는 애플리케이션과 데이터 저장소 | [컨테이너](architecture/c2-containers.md) |
| C3 Component | 컨테이너 내부의 주요 모듈과 의존성 | [컴포넌트](architecture/c3-components.md) |
| C4 Code | 실제 구현 | [`src/`](../src/) · [`hub/`](../hub/) |

C1~C3는 현재 구현을 설명한다. 계획한 구조나 C4 함수 목록을 별도 문서로 유지하지 않는다. 여기서 Container는 C4의 실행·저장 단위이며 Docker 컨테이너를 뜻하지 않는다.
