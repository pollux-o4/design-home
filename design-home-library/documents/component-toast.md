```json
{
  "schemaVersion": 1,
  "id": "component-toast",
  "title": "작업 결과 토스트",
  "summary": "작업 결과를 짧게 알리는 피드백",
  "kind": "component",
  "category": "popups-and-layers",
  "keywords": ["토스트", "알림", "완료", "성공", "toast"],
  "useCases": ["토스트", "알림"],
  "sourcePath": "ui-components/index.html",
  "sources": [
    "ui-components/js/components/popups-and-layers.js",
    "ui-components/js/sample-definition.js",
    "ui-components/js/samples/layers.js",
    "ui-components/css/controls/layers.css",
    "shared/css/interface.css"
  ],
  "previewPath": "/ui-components/index.html?view=specimen&component=toast",
  "tags": ["feedback"],
  "viewport": {
    "width": 1024,
    "height": 900
  },
  "capture": {
    "selector": ".component-card:has([data-comp-id=\"toast\"]) .component-body",
    "parts": {}
  },
  "structure": ["제품에서 사용할 작업 결과 토스트"],
  "interactions": ["샘플의 버튼과 입력 컨트롤로 직접 조작"],
  "constraints": [
    "전체 화면 템플릿이 아닌 해당 조작 요소의 참고 자료",
    "실제 제품의 콘텐츠·상태·키보드 동작에 맞춰 적용"
  ]
}
```

## 적용

작업의 주된 행동과 상태에 맞춰 원본의 간격·입력·버튼 관계를 참고합니다.
