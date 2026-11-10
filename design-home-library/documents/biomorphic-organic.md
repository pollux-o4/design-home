```json
{
  "id": "biomorphic-organic",
  "title": "유기적 UI",
  "summary": "곡선과 유기적 형태",
  "metadataBasis": "curated-interpretation-of-local-source",
  "previewPath": "/trend-style/14_biomorphic_organic.html",
  "sourcePath": "trend-style/14_biomorphic_organic.html",
  "tags": ["natural", "organic"],
  "structure": ["분석 대시보드 예제", "탐색 영역 · 지표 카드 · 차트 · 프로젝트 정보"],
  "interactions": ["원본 화면에서 상태와 조작 확인; 실제 소스 목록으로 구현 확인"],
  "constraints": [
    "형태 변형 중 정렬과 정보 계층 유지",
    "글 상세·블로그 템플릿으로 검증되지 않은 예제",
    "접근성·사용성 검증 필요"
  ],
  "schemaVersion": 1,
  "viewport": {
    "width": 1280,
    "height": 900
  },
  "kind": "trend",
  "useCases": ["대시보드", "통계", "분석 화면", "지표"],
  "keywords": ["dashboard", "analytics", "분석", "통계"],
  "capture": {
    "selector": "body",
    "parts": {}
  }
}
```

## 화면 크기별 배치

- 좁은 화면에서는 탐색 메뉴를 접고 카드와 차트를 한 열로 배치합니다.
- 테마 선택 영역은 내용 위에서 줄바꿈하며 본문을 덮지 않습니다.
- 표는 카드 안에서 가로로 스크롤합니다.

## 실제 사용 확인

원본 미리보기에서 메뉴 펼치기와 프로젝트 생성 창을 조작해 확인합니다. 화면 크기를 바꾸며 글자와 버튼이 겹치지 않는지 확인합니다.
