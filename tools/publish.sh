#!/usr/bin/env bash
# 作品集网站统一发布脚本。
#   tools/publish.sh check            构建 → 单元测试 → JS 语法 → 链接与结构校验（本地起临时服务器）
#   tools/publish.sh check --assets   同上，但先重新导出图片（sources/ 有新图时用）
#   tools/publish.sh deploy           check 全部通过后，从 dist/ 部署到 Vercel 生产环境（需本人确认后再跑）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
MODE="${1:-check}"
PORT=4173
SRV=""

cleanup() { if [[ -n "$SRV" ]]; then kill "$SRV" 2>/dev/null || true; fi; }
trap cleanup EXIT

port_in_use() { python3 - "$PORT" <<'PY'
import socket,sys
s=socket.socket(); s.settimeout(0.3)
sys.exit(0 if s.connect_ex(("127.0.0.1",int(sys.argv[1])))==0 else 1)
PY
}

if [[ "${2:-}" == "--assets" ]]; then
  echo "== 0/5 导出图片 (tools/prepare_assets.py)"; python3 tools/prepare_assets.py
fi
echo "== 1/5 构建"; python3 build.py
echo "== 2/5 单元测试"; python3 -m unittest discover tests
echo "== 3/5 JS 语法"; node --check dist/site.js; node --check dist/prototype.js; echo "ok"
echo "== 4/5 链接与结构校验"
if port_in_use; then
  echo "   127.0.0.1:$PORT 已有服务器，直接复用"
else
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory dist >/dev/null 2>&1 &
  SRV=$!; sleep 1
fi
python3 verify.py >/dev/null && echo "   verify.py 通过（报告在 qa/static-verification.json）"
echo "== 5/5 工作树状态"; git status --short | sed 's/^/   /' || true

case "$MODE" in
  check)
    echo "CHECK PASSED。预览：launch 配置 portfolio-web（http://127.0.0.1:$PORT）。本人确认后运行 tools/publish.sh deploy";;
  deploy)
    echo "== 部署到 Vercel 生产环境（项目 yucheng-feng-portfolio）"
    ( cd dist && npx vercel@64.7.0 deploy --prod --yes )
    echo "DEPLOYED。线上：https://yucheng-feng-portfolio.vercel.app/ 与 /en/";;
  *) echo "未知模式：$MODE（用 check 或 deploy）"; exit 2;;
esac
