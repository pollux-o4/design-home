```json
{
  "schemaVersion": 1,
  "id": "component-toggle-switch",
  "title": "설정 토글",
  "summary": "기능이나 설정의 켜짐·꺼짐을 바꾸는 컨트롤",
  "kind": "component",
  "category": "inputs-and-controls",
  "keywords": ["토글", "스위치", "설정", "켜기", "끄기"],
  "useCases": ["토글", "스위치"],
  "sourcePath": "ui-components/index.html",
  "sources": [
    "ui-components/js/components/inputs-and-controls.js",
    "ui-components/js/sample-definition.js",
    "ui-components/js/samples/forms.js",
    "ui-components/css/controls/inputs.css",
    "shared/css/interface.css"
  ],
  "previewPath": "/ui-components/index.html?view=specimen&component=toggle-switch",
  "tags": ["feedback"],
  "viewport": {
    "width": 1024,
    "height": 900
  },
  "capture": {
    "selector": ".component-card:has([data-comp-id=\"toggle-switch\"]) .component-body",
    "parts": {}
  },
  "structure": ["제품에서 사용할 설정 토글"],
  "interactions": ["샘플의 버튼과 입력 컨트롤로 직접 조작"],
  "constraints": [
    "전체 화면 템플릿이 아닌 해당 조작 요소의 참고 자료",
    "실제 제품의 콘텐츠·상태·키보드 동작에 맞춰 적용"
  ]
}
```

## 적용

작업의 주된 행동과 상태에 맞춰 원본의 간격·입력·버튼 관계를 참고합니다.
