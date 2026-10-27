```json
{
  "schemaVersion": 1,
  "id": "component-form-validation",
  "title": "폼 검증",
  "summary": "이메일 오류와 저장 성공을 같은 자리에서 안내",
  "kind": "component",
  "category": "inputs-and-controls",
  "keywords": [
    "폼 검증",
    "form-validation",
    "접근성",
    "피드백"
  ],
  "useCases": [
    "폼 검증"
  ],
  "sourcePath": "ui-components/index.html",
  "sources": [
    "ui-components/js/components/inputs-and-controls.js",
    "ui-components/js/samples/forms.js",
    "ui-components/js/sample-definition.js",
    "ui-components/css/controls/inputs.css",
    "shared/css/interface.css"
  ],
  "previewPath": "/ui-components/index.html?view=specimen&component=form-validation",
  "tags": [
    "minimal",
    "feedback"
  ],
  "viewport": {
    "width": 1024,
    "height": 900
  },
  "capture": {
    "selector": "[data-sample-id=\"form-validation\"]",
    "parts": {}
  },
  "structure": [
    "레이블·컨트롤·상태 피드백"
  ],
  "interactions": [
    "입력 오류·성공 상태·포커스 복구"
  ],
  "constraints": [
    "공통 CSS와 samples/runtime.js를 함께 사용",
    "서버 연결 없이 브라우저에서 동작하는 샘플"
  ]
}
```

## 적용

이메일 오류와 저장 성공을 같은 자리에서 안내합니다. 상태 안내를 유지하고 실제 서비스의 데이터 처리에 연결합니다.
