```json
{
  "schemaVersion": 1,
  "id": "component-searchable-list",
  "title": "검색 가능한 목록",
  "summary": "검색 결과 개수와 빈 상태를 실시간으로 안내",
  "kind": "component",
  "category": "inputs-and-controls",
  "keywords": [
    "검색 가능한 목록",
    "searchable-list",
    "접근성",
    "피드백"
  ],
  "useCases": [
    "검색 가능한 목록"
  ],
  "sourcePath": "ui-components/index.html",
  "sources": [
    "ui-components/js/components/inputs-and-controls.js",
    "ui-components/js/samples/forms.js",
    "ui-components/js/sample-definition.js",
    "ui-components/css/controls/inputs.css",
    "shared/css/interface.css"
  ],
  "previewPath": "/ui-components/index.html?view=specimen&component=searchable-list",
  "tags": [
    "minimal",
    "feedback"
  ],
  "viewport": {
    "width": 1024,
    "height": 900
  },
  "capture": {
    "selector": "[data-sample-id=\"searchable-list\"]",
    "parts": {}
  },
  "structure": [
    "레이블·컨트롤·상태 피드백"
  ],
  "interactions": [
    "검색·결과 없음·초기화"
  ],
  "constraints": [
    "공통 CSS와 samples/runtime.js를 함께 사용",
    "서버 연결 없이 브라우저에서 동작하는 샘플"
  ]
}
```

## 적용

검색 결과 개수와 빈 상태를 실시간으로 안내합니다. 상태 안내를 유지하고 실제 서비스의 데이터 처리에 연결합니다.
