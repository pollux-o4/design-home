// Stable IDs shared by catalog validation, search and presentation.
export const TAG_GROUPS = Object.freeze({"purpose": "용도", "density": "정보 밀도", "mood": "분위기", "visual": "시각 표현", "interaction": "상호작용"});
const definitions = [
  {"id": "dashboard", "group": "purpose", "label": "대시보드", "aliases": ["dashboard", "대시보드", "분석"]},
  {"id": "admin", "group": "purpose", "label": "관리", "aliases": ["admin", "관리", "관리자"]},
  {"id": "data", "group": "purpose", "label": "데이터", "aliases": ["data", "데이터", "정보"]},
  {"id": "message", "group": "purpose", "label": "메시지", "aliases": ["message", "메시지"]},
  {"id": "high-density", "group": "density", "label": "높은 밀도", "aliases": ["high-density", "높은 밀도", "많은", "고밀도", "정보가 많은"]},
  {"id": "minimal", "group": "density", "label": "미니멀", "aliases": ["minimal", "미니멀", "심플", "간결", "깔끔", "clean", "가벼운"]},
  {"id": "classic", "group": "mood", "label": "클래식", "aliases": ["classic", "클래식", "아날로그"]},
  {"id": "calm", "group": "mood", "label": "차분", "aliases": ["calm", "차분", "은은", "부드러운"]},
  {"id": "bold", "group": "mood", "label": "강렬", "aliases": ["bold", "강렬", "원색"]},
  {"id": "playful", "group": "mood", "label": "유쾌", "aliases": ["playful", "유쾌", "개성", "키치"]},
  {"id": "friendly", "group": "mood", "label": "친근", "aliases": ["friendly", "친근", "귀여운", "귀여움"]},
  {"id": "premium", "group": "mood", "label": "고급", "aliases": ["premium", "고급", "세련"]},
  {"id": "futuristic", "group": "mood", "label": "미래적", "aliases": ["futuristic", "미래적", "미래"]},
  {"id": "dreamy", "group": "mood", "label": "몽환", "aliases": ["dreamy", "몽환", "감성"]},
  {"id": "modern", "group": "mood", "label": "현대적", "aliases": ["modern", "현대적", "현대"]},
  {"id": "immersive", "group": "mood", "label": "몰입", "aliases": ["immersive", "몰입"]},
  {"id": "experimental", "group": "mood", "label": "실험적", "aliases": ["experimental", "실험적", "실험", "날것", "거친"]},
  {"id": "retro", "group": "mood", "label": "복고", "aliases": ["retro", "복고", "레트로", "윈도우"]},
  {"id": "natural", "group": "mood", "label": "자연스러운", "aliases": ["natural", "자연스러운", "자연", "편안", "유연"]},
  {"id": "practical", "group": "mood", "label": "실용적", "aliases": ["practical", "실용적", "실용", "체계"]},
  {"id": "precise", "group": "mood", "label": "정교한", "aliases": ["precise", "정교한", "정교"]},
  {"id": "texture", "group": "visual", "label": "질감", "aliases": ["texture", "질감"]},
  {"id": "tactile", "group": "visual", "label": "촉각적", "aliases": ["tactile", "촉각적", "촉각"]},
  {"id": "transparent", "group": "visual", "label": "투명", "aliases": ["transparent", "투명"]},
  {"id": "rounded", "group": "visual", "label": "둥근", "aliases": ["rounded", "둥근"]},
  {"id": "dimensional", "group": "visual", "label": "입체", "aliases": ["dimensional", "입체", "공간"]},
  {"id": "gradient", "group": "visual", "label": "그래디언트", "aliases": ["gradient", "그래디언트"]},
  {"id": "dark", "group": "visual", "label": "다크", "aliases": ["dark", "다크", "어두운"]},
  {"id": "high-contrast", "group": "visual", "label": "고대비", "aliases": ["high-contrast", "고대비"]},
  {"id": "typography", "group": "visual", "label": "타이포그래피", "aliases": ["typography", "타이포그래피", "타이포", "글자"]},
  {"id": "pixel", "group": "visual", "label": "픽셀", "aliases": ["pixel", "픽셀"]},
  {"id": "organic", "group": "visual", "label": "곡선", "aliases": ["organic", "곡선"]},
  {"id": "motion", "group": "interaction", "label": "움직임", "aliases": ["motion", "움직임", "애니메이션", "모션"]},
  {"id": "feedback", "group": "interaction", "label": "피드백", "aliases": ["feedback", "피드백", "반응", "섬세", "조작"]},
];
for (const tag of definitions) {
  if (!Object.hasOwn(TAG_GROUPS, tag.group)) throw new Error(`정의되지 않은 태그 분류: ${tag.group}`);
}
if (new Set(definitions.map(tag => tag.id)).size !== definitions.length) throw new Error('중복 태그 정의');

export const TAGS = Object.freeze(Object.fromEntries(definitions.map(tag => [tag.id, Object.freeze({ ...tag, groupLabel: TAG_GROUPS[tag.group], aliases: Object.freeze(tag.aliases) })])));
export const Tag = Object.freeze(Object.fromEntries(definitions.map(tag => [tag.id.replaceAll('-', '_').toUpperCase(), tag.id])));

export function validateTags(ids) {
  if (!Array.isArray(ids) || ids.some(id => !Object.hasOwn(TAGS, id))) throw new Error('정의되지 않은 디자인 태그 ID');
  if (new Set(ids).size !== ids.length) throw new Error('중복 디자인 태그 ID');
  return Object.freeze([...ids]);
}

export const tagDetails = ids => validateTags(ids).map(id => TAGS[id]);
export function resolveTagIds(term) {
  return definitions.filter(tag => tag.aliases.some(alias => alias === term || (alias.length > 1 && term.startsWith(alias) && /^[가-힣]+$/.test(alias)))).map(tag => tag.id);
}
