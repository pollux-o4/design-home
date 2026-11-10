import { createTextLocalizer } from '../../shared/js/text-localizer.js';
import descriptions from './entry-messages-en.js';
import interfaceMessages from './messages-en.js';

export function localizeGlossary(entries, root) {
  const messages = { ...interfaceMessages };
  for (const entry of entries) {
    messages[entry.title] = entry.term;
    if (descriptions[entry.id]) messages[entry.desc] = descriptions[entry.id];
  }
  const phrases = Object.keys(messages).sort((a, b) => b.length - a.length);
  const translate = source => {
    const trimmed = source.trim();
    if (messages[trimmed]) return source.replace(trimmed, messages[trimmed]);
    const example = /^(.*) 예시 체험$/.exec(trimmed);
    if (example && messages[example[1]]) return `${messages[example[1]]} example`;
    const steps = /^이번 달 ([\d,]+) 걸음$/.exec(trimmed);
    if (steps) return `${steps[1]} steps this month`;
    const updated = /^([\d,]+) 걸음으로 갱신되었습니다\.$/.exec(trimmed);
    if (updated) return `Updated to ${updated[1]} steps.`;
    const application = /^(.*?)님, (.*?) 신청이 완료되었습니다\.$/.exec(trimmed);
    if (application) return `${application[1]}, your ${application[2]} application is complete.`;
    const spring = /^감쇠 (.*?)의 스프링입니다\. 값이 높을수록 빨리 안정됩니다\.$/.exec(trimmed);
    if (spring) return `Spring damping: ${spring[1]}. Higher values settle faster.`;
    const card = /^첫 번째 카드가 (.*?)로 바뀌었습니다\.$/.exec(trimmed);
    if (card) return `The first card is now ${translate(card[1])}.`;
    const selected = /^(.*?) 선택$/.exec(trimmed);
    if (selected) return `${translate(selected[1])} selected`;
    const date = /^선택 일시: (.*)$/.exec(trimmed);
    if (date) return `Selected date and time: ${date[1]}`;
    let text = source;
    for (const phrase of phrases) text = text.replaceAll(phrase, messages[phrase]);
    return text
      .replace(/(\d+)페이지/g, 'Page $1')
      .replace(/(\d+\s*\/\s*\d+) 페이지/g, 'Page $1')
      .replace(/(\d+)명/g, '$1 members')
      .replace(/(\d+)열/g, '$1 columns')
      .replace(/용어\s*(\d+)개/g, '$1 terms')
      .replace(/용어\s*$/g, 'Terms ')
      .replace(/Terms\s*(\d+)개/g, '$1 terms')
      .replace(/ 예시 체험/g, ' example')
      .replace(/ 공식 자료 \(새 탭\)/g, ' official reference (new tab)')
      .replace(/ 체험 화면/g, ' example')
      .replace(/ 체험/g, ' example')
      .replace(/ 재생/g, ' playing')
      .replace(/움직임 줄이기: 변화 후 상태를 표시합니다\./g, 'Reduced motion: showing the final state.');
  };
  const language = () => document.documentElement.lang === 'en' ? 'en' : 'ko';
  const localizer = createTextLocalizer(root, (text, lang) => lang === 'en' ? translate(text) : text, language);
  let sourceTitle = document.title, outputTitle = document.title;
  const update = () => {
    localizer.update();
    if (document.title !== outputTitle) sourceTitle = document.title;
    outputTitle = language() === 'en' ? translate(sourceTitle).replace('용어집', 'Glossary') : sourceTitle;
    document.title = outputTitle;
  };
  document.addEventListener('dh:language-change', update);
  update();
  return { update };
}
