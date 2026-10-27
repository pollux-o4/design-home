import { staticMode, getJSON } from './api.js';

export async function showProject() {
  const theme = document.querySelector('#workspace-theme');
  theme.value = window.getTheme();
  theme.addEventListener('change', () => window.setTheme(theme.value));
  const project = staticMode
    ? await fetch(new URL('data/project.json', document.baseURI)).then(response => {
      if (!response.ok) throw new Error('프로젝트 정보를 불러오지 못했습니다.');
      return response.json();
    })
    : await getJSON('/api/project');
  document.querySelector('#project-name').textContent = project.name;
  document.querySelector('#project-status').textContent = project.configured
    ? '이 프로젝트의 자료와 검토 기록'
    : '프로젝트 설정 전 · 품질 점검 도구는 바로 사용 가능';
}
