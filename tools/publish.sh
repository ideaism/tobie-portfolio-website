#!/usr/bin/env bash
# 作品集网站统一发布脚本。
#   tools/publish.sh check            构建 → 单元测试 → JS 语法 → 链接与结构校验（本地起临时服务器）
#   tools/publish.sh check --assets   同上，但先重新导出图片（sources/ 有新图时用）
#   tools/publish.sh deploy           已停用（旧的 Vercel 部署）。上线用 ~/其他任务/部署中心/tools/部署国内版.sh
set -euo pipefail
export PYTHONUTF8=1   # Windows 上 Python 默认按系统编码读写文件，中文会坏；强制 UTF-8
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
# 不能写成「verify.py && echo 通过」：那样 verify.py 失败时脚本不会停，后面照样打印 CHECK PASSED（2026-11-15 发现）
if ! python3 verify.py >/dev/null; then
  echo "CHECK FAILED：verify.py 没通过。单独运行 python3 verify.py 看具体哪一条。"; exit 1
fi
echo "   verify.py 通过（报告在 qa/static-verification.json）"
echo "== 5/5 工作树状态"; git status --short | sed 's/^/   /' || true

case "$MODE" in
  check)
    echo "CHECK PASSED。预览：launch 配置 portfolio-web（http://127.0.0.1:$PORT）。本人确认后运行 ~/其他任务/部署中心/tools/部署国内版.sh（更新 www.tobiefeng.com）";;
  deploy)
    # 2026-11-14 起停用：旧的 Vercel 地址已是 404。线上是 www.tobiefeng.com，用部署中心的脚本更新。
    echo "tools/publish.sh deploy 已停用。上线请运行 ~/其他任务/部署中心/tools/部署国内版.sh（先问本人）。"; exit 2;;
  *) echo "未知模式：$MODE（用 check 或 deploy）"; exit 2;;
esac
