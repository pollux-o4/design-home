(function () {
  const { define, register, icon } = CanvasSamples;
  const status = '<p class="sample-status" data-status role="status"></p>';
  register(
    "state-morphing",
    "상태에 따라 변하는 UI",
    "같은 요소 안에서 상태와 조작을 이어갑니다.",
    [
      {
        title: "상태 변형",
        desc: "전환을 통해 현재 상태를 이해합니다.",
        components: [
          define({
            id: "morph-action",
            title: "버튼에서 진행과 완료로",
            term: "State-driven Morphing Action",
            level: "basic",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/CSS/transition",
            desc: "하나의 버튼이 진행 표시와 완료 상태로 변합니다. 실제 전송 없는 로컬 시뮬레이션입니다.",
            behavior: "morphAction",
            html: `<div class="morph-stage"><button class="morph-action" data-morph-action data-state="idle"><span data-action-label>파일 보내기</span><span class="morph-meter" aria-hidden="true"></span></button><button class="ui-btn" data-action-cancel hidden>취소</button></div>${status}`,
          }),
          define({
            id: "morph-island",
            title: "작은 상태에서 확장 컨트롤로",
            term: "Adaptive Status Island",
            level: "advanced",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API",
            desc: "작은 재생 상태를 펼쳐 곡 전환과 재생 조작을 제공합니다. 실제 오디오 없는 로컬 시뮬레이션입니다.",
            behavior: "morphIsland",
            html: `<div class="morph-stage"><div class="morph-island" data-island><button class="island-summary" data-island-toggle aria-expanded="false"><span class="island-art" aria-hidden="true">${icon("layers")}</span><span><strong data-track>Quiet Morning</strong><small data-play-state>일시 정지</small></span><span aria-hidden="true">${icon("chevron")}</span></button><div class="island-detail" data-island-detail hidden><p>재생 컨트롤 · 로컬 시뮬레이션</p><div class="island-controls"><button data-play>재생</button><button data-next>다음 곡</button><button data-collapse>접기</button></div></div></div></div>${status}`,
          }),
        ],
      },
    ],
  );
})();
