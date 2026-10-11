```json
{
  "schemaVersion": 1,
  "id": "component-text-input",
  "title": "단문 입력 폼",
  "summary": "이메일·이름·제목 같은 한 줄 입력",
  "kind": "component",
  "category": "inputs-and-controls",
  "keywords": [
    "입력",
    "폼",
    "이메일",
    "로그인",
    "제목",
    "input"
  ],
  "useCases": [
    "입력",
    "폼"
  ],
  "sourcePath": "ui-components/index.html",
  "sources": [
    "ui-components/js/components/inputs-and-controls.js",
    "ui-components/css/components.css"
  ],
  "previewPath": "/ui-components/index.html?view=specimen&component=text-input",
  "tags": [
    "feedback"
  ],
  "viewport": {
    "width": 1024,
    "height": 900
  },
  "capture": {
    "selector": ".component-card:has([data-comp-id=\"text-input\"]) .component-body",
    "parts": {}
  },
  "structure": [
    "제품에서 사용할 단문 입력 폼"
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
