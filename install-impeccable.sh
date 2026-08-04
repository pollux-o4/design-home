#!/usr/bin/env bash
# impeccable 디자인 스킬을 대상 레포에 로컬 전용으로 설치한다.
#   - .agents/skills/impeccable/ 로 복사 (스킬 내부 경로가 이 위치를 하드코딩함)
#   - 대상 레포 .gitignore 에 등록해 커밋되지 않게 한다
#
# 사용법:  ./install-impeccable.sh <대상-레포-경로>
# 예:      ./install-impeccable.sh ../prompt-gen

set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/impeccable"
IGNORE_LINE=".agents/skills/impeccable/"

if [ $# -ne 1 ]; then
  echo "사용법: $0 <대상-레포-경로>" >&2
  exit 1
fi

REPO="$1"

if [ ! -d "$REPO" ]; then
  echo "[오류] 대상 경로가 없음: $REPO" >&2
  exit 1
fi
if [ ! -f "$SRC/SKILL.md" ]; then
  echo "[오류] 원본 스킬을 찾을 수 없음: $SRC/SKILL.md" >&2
  exit 1
fi

DST="$REPO/.agents/skills/impeccable"

# 1) 복사 (기존 설치가 있으면 갱신)
mkdir -p "$(dirname "$DST")"
rm -rf "$DST"
cp -r "$SRC" "$DST"
echo "[복사] $(find "$DST" -type f | wc -l | tr -d ' ') files -> $DST"

# 2) .gitignore 등록 (중복 방지)
GITIGNORE="$REPO/.gitignore"
if [ -f "$GITIGNORE" ] && grep -qxF "$IGNORE_LINE" "$GITIGNORE"; then
  echo "[gitignore] 이미 등록됨"
else
  {
    echo ""
    echo "# Vendored design skill (로컬 전용, github: pbakaus/impeccable) — 커밋 안 함"
    echo "$IGNORE_LINE"
  } >> "$GITIGNORE"
  echo "[gitignore] 추가됨 -> $GITIGNORE"
fi

# 3) 동작 확인
echo "[검증] context.mjs 실행..."
if (cd "$REPO" && node .agents/skills/impeccable/scripts/context.mjs >/dev/null 2>&1); then
  echo "[검증] OK — 스킬이 $REPO 에서 동작함"
else
  echo "[검증] context.mjs 비정상 종료 (node 설치/버전 확인 필요)" >&2
fi

echo "완료."
