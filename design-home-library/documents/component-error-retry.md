```json
{
  "schemaVersion": 1,
  "id": "component-error-retry",
  "title": "오류와 재시도",
  "summary": "실패에서 재시도로 이어지는 연결 복구 시나리오",
  "kind": "component",
  "category": "states-and-feedback",
  "keywords": ["오류와 재시도", "error-retry", "접근성", "피드백"],
  "useCases": ["오류와 재시도"],
  "sourcePath": "ui-components/index.html",
  "sources": [
    "ui-components/js/components/states-and-feedback.js",
    "ui-components/js/samples/feedback.js",
    "ui-components/js/sample-definition.js",
    "ui-components/css/controls/feedback.css",
    "shared/css/interface.css"
  ],
  "previewPath": "/ui-components/index.html?view=specimen&component=error-retry",
  "tags": ["minimal", "feedback"],
  "viewport": {
    "width": 1024,
    "height": 900
  },
  "capture": {
    "selector": "[data-sample-id=\"error-retry\"]",
    "parts": {}
  },
  "structure": ["레이블·컨트롤·상태 피드백"],
  "interactions": ["재시도 중·실패·성공 상태"],
  "constraints": [
    "공통 CSS와 samples/runtime.js를 함께 사용",
    "서버 연결 없이 브라우저에서 동작하는 샘플"
  ]
}
```

## 적용

실패에서 재시도로 이어지는 연결 복구 시나리오합니다. 상태 안내를 유지하고 실제 서비스의 데이터 처리에 연결합니다.
