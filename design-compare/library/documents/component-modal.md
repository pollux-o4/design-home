```json
{
  "schemaVersion": 1,
  "id": "component-modal",
  "title": "프로젝트 입력 모달",
  "summary": "프로젝트 이름을 입력하고 생성하거나 취소하는 대화상자",
  "kind": "component",
  "category": "popups-and-layers",
  "keywords": [
    "모달",
    "팝업",
    "새 프로젝트",
    "항목 추가",
    "입력 폼"
  ],
  "useCases": [
    "모달",
    "팝업"
  ],
  "sourcePath": "ui-components/index.html",
  "sources": [
    "ui-components/js/components/popups-and-layers.js",
    "ui-components/js/sample-definition.js",
    "ui-components/js/samples/layers.js",
    "ui-components/css/controls/layers.css",
    "shared/css/interface.css"
  ],
  "previewPath": "/ui-components/index.html?view=specimen&component=modal",
  "tags": [
    "feedback"
  ],
  "viewport": {
    "width": 1024,
    "height": 900
  },
  "capture": {
    "selector": "#demo-modal",
    "parts": {}
  },
  "structure": [
    "제품에서 사용할 프로젝트 입력 모달"
  ],
  "interactions": [
    "샘플의 버튼과 입력 컨트롤로 직접 조작"
  ],
  "constraints": [
    "전체 화면 템플릿이 아닌 해당 조작 요소의 참고 자료",
    "실제 제품의 콘텐츠·상태·키보드 동작에 맞춰 적용"
  ]
}
```

## 적용

작업의 주된 행동과 상태에 맞춰 원본의 간격·입력·버튼 관계를 참고합니다.
