```json
{
  "schemaVersion": 1,
  "id": "component-password-field",
  "title": "비밀번호 표시",
  "summary": "입력값을 유지하면서 비밀번호 표시 여부를 전환",
  "kind": "component",
  "category": "inputs-and-controls",
  "keywords": [
    "비밀번호 표시",
    "password-field",
    "접근성",
    "피드백"
  ],
  "useCases": [
    "비밀번호 표시"
  ],
  "sourcePath": "ui-components/index.html",
  "sources": [
    "ui-components/js/components/inputs-and-controls.js",
    "ui-components/js/samples/forms.js",
    "ui-components/js/sample-definition.js",
    "ui-components/css/controls/inputs.css",
    "shared/css/interface.css"
  ],
  "previewPath": "/ui-components/index.html?view=specimen&component=password-field",
  "tags": [
    "minimal",
    "feedback"
  ],
  "viewport": {
    "width": 1024,
    "height": 900
  },
  "capture": {
    "selector": "[data-sample-id=\"password-field\"]",
    "parts": {}
  },
  "structure": [
    "레이블·컨트롤·상태 피드백"
  ],
  "interactions": [
    "표시·숨기기와 접근성 상태"
  ],
  "constraints": [
    "공통 CSS와 samples/runtime.js를 함께 사용",
    "서버 연결 없이 브라우저에서 동작하는 샘플"
  ]
}
```

## 적용

입력값을 유지하면서 비밀번호 표시 여부를 전환합니다. 상태 안내를 유지하고 실제 서비스의 데이터 처리에 연결합니다.
