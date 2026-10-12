```json
{
  "schemaVersion": 1,
  "id": "component-scrollbar",
  "title": "자동 숨김 스크롤바",
  "summary": "스크롤할 때 나타나고 가까이 가면 넓어지는 오버레이 스크롤바",
  "kind": "component",
  "category": "navigation",
  "keywords": [
    "스크롤",
    "스크롤바",
    "scrollbar",
    "자동 숨김",
    "오버레이"
  ],
  "useCases": [
    "스크롤",
    "스크롤바",
    "긴 목록",
    "패널 탐색"
  ],
  "sourcePath": "ui-components/scrollbar/index.html",
  "sources": [
    "shared/js/scrollbar.js",
    "shared/css/scrollbar.css"
  ],
  "previewPath": "/ui-components/scrollbar/index.html",
  "tags": [
    "minimal",
    "feedback"
  ],
  "viewport": {
    "width": 800,
    "height": 600
  },
  "capture": {
    "selector": ".sample",
    "parts": {
      "region": ".scroll-sample"
    }
  },
  "structure": [
    "고정 높이의 스크롤 영역",
    "콘텐츠 폭을 차지하지 않는 오버레이 트랙과 핸들"
  ],
  "interactions": [
    "스크롤 중 표시, 멈춘 뒤 900ms 후 숨김",
    "트랙에 접근하면 4px에서 8px로 확장",
    "핸들 드래그와 트랙 클릭",
    "방향키·Page Up/Down·Home/End 탐색"
  ],
  "constraints": [
    "공유 CSS와 ES 모듈을 함께 로드",
    "일반 스크롤 영역에 data-scroll-region 지정",
    "forced-colors에서는 운영체제 기본 스크롤바 사용",
    "동작 줄이기 설정에서는 전환 효과 제거"
  ]
}
```

## 적용

스크롤바는 콘텐츠 위에 표시하며 기본 휠·터치 스크롤을 유지합니다. 공통 CSS와 모듈을 로드하면 페이지에 적용되고, 내부 패널은 `data-scroll-region`으로 등록합니다. 테마에 맞는 색상은 영역의 `--dh-scroll-ink`로 지정합니다.

## 상태

- 평상시에는 숨김. 스크롤 중에는 4px 핸들 표시.
- 가장자리 접근·키보드 포커스·드래그 중에는 8px 핸들 표시.
- 콘텐츠가 넘치지 않으면 트랙 자체를 숨김.
- 가로와 세로 방향을 같은 규칙으로 처리.
