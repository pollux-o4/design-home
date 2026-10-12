export default {
  id: "feedback",
  title: "상태·피드백",
  term: "State & Feedback",
  desc: "진행 상황과 결과, 다음 행동을 명확하게 알려줍니다.",
  groups: [
    {
      id: "progress",
      title: "진행과 복구",
      desc: "기다림·빈 상태·오류와 재시도.",
      ids: [
        "skeleton-ui",
        "spinner",
        "progress-bar",
        "empty-state",
        "error-retry",
        "feedback-task-steps",
        "form-stepper",
      ],
    },
    {
      id: "messages",
      title: "알림과 정보",
      desc: "성공·안내·실행 취소와 짧은 상태.",
      ids: [
        "toast",
        "snackbar",
        "alert-banner",
        "tooltip",
        "badge",
        "avatar",
        "motion-counter",
        "motion-success-burst",
        "feedback-notification-center",
      ],
    },
    {
      id: "saving",
      title: "연결과 저장 상태",
      desc: "오프라인·낙관적 갱신·자동 저장과 실패 복구.",
      ids: ["feedback-connection", "feedback-optimistic", "feedback-autosave"],
    },
  ],
};
