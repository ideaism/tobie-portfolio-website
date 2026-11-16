# 交接单合同（项目文件夹 → portfolio-web）

publisher 是唯一改动本仓库的 agent。输入是三份交接单：

- `../01-commons-fridge/portfolio/handoff.md` → `CASES['commons-fridge']`
- `../02-playbook/portfolio/handoff.md` → `CASES['playbook']`
- `../03-qingju/portfolio/handoff.md` → `CASES['qingju']`
- `../04-shared/SMT-交接单.md` → `CASES['smt']`

只处理 `status: ready` 的交接单；第 6 节“待本人确认”里未勾选的条目不上线。

## 交接单各节怎么落地

| 交接单 | 落到哪里 | 怎么写 |
|---|---|---|
| 1. 事实卡 | `cases.py` → `CASES[slug]['facts']` | 四元组 `[zh 字段, en 字段, zh 值, en 值]`；改值不改字段数 |
| 2. 章节 | `cases.py` → `CASES[slug]['sections']` | 每节 `label / title / text / insight` 全部 `[zh, en]` 成对；`text` 是段落列表；新增节插在指定位置，后续节编号顺延（label 里的 "0N /" 也要改） |
| 3. 图 | ① 原图复制到 `sources/work/<slug>/`；② `tools/prepare_assets.py` 的 `JOBS` 加一行 `'<slug>/<name>': (路径, 最大宽, 质量)`；③ 运行 `python3 tools/prepare_assets.py`；④ `figures.py` 的 `FIGURES[(slug, 节号)]` 加条目 | `kind` 用 `image` / `phones` / `pair`；`prov` 只能是 `PROV` 里的键（original / wire / team / research / photo / mixed）；`label` 与 `caption` 都 `[zh, en]`；手机截图宽 390–480 |
| 4. 原型与外链 | 外链 → `cases.py` 的 `external`；嵌入 → `prototypes.py`（见 `tests/test_prototypes.py` 的保真规则） | 嵌入只允许原始界面或真实可运行原型；需要登录的产品只外链 |
| 5. 禁止的说法 | 合并后 grep 一遍 `cases.py` 的对应案例 | 出现即退回交接单 |
| 来源 | `docs/sources.md` 对应小节加一条 | 文件 / commit / Figma 节点 / 日期 |

节号变化时同步检查：`figures.py` 的 `(slug, n)` 键、`prototypes.py` 里按 `number` 匹配的嵌入（如 `commons-fridge` 第 5 节的 v1.8 原型）、`build.py` 的 `CASE_HERO`。

## 顺序

1. 读根 `../CLAUDE.md`（事实规则）、`README.md`、`docs/design-system.md`（不重做设计系统，产品截图不重新上色）。
2. 逐份处理 ready 的交接单，按上表落地。
3. `tools/publish.sh check`：构建 → 11 项单元测试 → JS 语法 → `verify.py` 链接与结构校验。失败就修到通过。
4. 用预览（launch 配置 `portfolio-web`，端口 4173）截中英两页给本人看。
5. 本人说“部署”后 `tools/publish.sh deploy`；成功后把交接单 `status` 改为 `published`（只改这一行），本地提交一次；不 push，除非本人要求。
6. PDF 作品集（`dist/assets/Yucheng-Feng-Portfolio.pdf`）另行同步：网站文案改动后，由本人在 Figma 投递稿里同步并重新导出，publisher 只替换文件。

## 不做的事

不改项目文件夹里的源材料；不从交接单之外的地方补事实；不写效果性数字；中文版不出现 Web3 / 链上。
