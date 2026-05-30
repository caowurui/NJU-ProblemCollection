# 题目管理系统

一个基于 Web 的题目管理系统，支持选择不同教材、浏览章节目录、查看和练习对应章节的题目。

## 功能特性

- **教材切换** — 顶部下拉菜单切换教材，左侧目录和题目自动更新
- **章节目录树** — 树状结构展示教材章节，支持展开/折叠、全部展开/折叠
- **题目浏览** — 点击章节节点，右侧按顺序展示该章所有题目，支持鼠标滚轮和键盘滚动
- **LaTeX 渲染** — 题目内容采用 KaTeX 渲染数学公式，显示清晰
- **答案查看** — 每道题可独立展开/隐藏答案，按 `Esc` 一键收起所有答案
- **来源标注** — 每道题标注出处（如某年某考试第几题），方便针对性复习
- **按需加载** — 题目数据按教材拆分，首次点选章节时自动加载对应文件，后续秒回

## 项目结构

```
NJU-ProblemCollection/
├── index.html              # 主页面
├── css/
│   └── style.css           # 布局与样式
├── js/
│   ├── data/
│   │   ├── textbooks-教材与章节信息.json           # 教材列表 + 章节树 + 文件映射
│   │   ├── problems-高等数学（第七版）上册.json     # 高数上册题目（18 节 32 题）
│   │   ├── problems-线性代数（第六版）.json         # 线代题目（9 节 10 题）
│   │   └── problems-概率论与数理统计.json           # 概率论题目（6 节 8 题）
│   └── script.js           # 前端主逻辑 + API 接口层
├── .nojekyll               # 禁用 Jekyll，确保 GitHub Pages 正常服务
├── .zed/
│   └── tasks.json          # 编辑器任务配置
├── REASONIX.md             # AI 辅助开发的项目知识摘要
└── README.md
```

## 在线访问（GitHub Pages）

本项目已配置 GitHub Pages，访问地址：

[https://caowurui.github.io/NJU-ProblemCollection/](https://caowurui.github.io/NJU-ProblemCollection/)

## 快速开始

1. 启动一个本地 HTTP 服务器（因 KaTeX 通过 CDN 加载，需用 `http://` 协议访问）：

   ```bash
   python -m http.server 8080
   ```

2. 在浏览器中打开 `http://localhost:8080`

3. 从顶部下拉菜单选择教材，在左侧目录树中点选章节，右侧即显示题目

## 技术栈

| 技术 | 用途 |
|------|------|
| 原生 HTML + CSS + JS | 前端（无框架依赖） |
| KaTeX | 数学公式渲染（CDN） |
| JSON 文件 | 数据存储（按教材拆分，按需加载） |

## 如何添加题目

按教材为粒度管理，每个教材对应一个 JSON 文件。以高数为例，编辑 `js/data/problems-高等数学（第七版）上册.json`：

```json
{
  "章节ID": [
    {
      "content": "题目内容（支持 $LaTeX$ 公式）",
      "answer": "答案内容",
      "source": "来源，如 2024年期中考试 第1题",
      "image": "可选配图URL"
    }
  ]
}
```

章节 ID 与 `js/data/textbooks-教材与章节信息.json` 中 `chapters` 的 `id` 字段保持一致即可。

### 添加新教材

1. 在 `js/data/textbooks-教材与章节信息.json` 的 `textbooks` 数组中新增教材条目
2. 在同文件的 `chapters` 对象中新增章节树
3. 在同文件的 `problemFiles` 对象中注册新教材对应的题目文件路径
4. 新建 `js/data/problems-教材名.json` 并写入题目数据
5. 无需修改 HTML 和 JS

## 题目呈现方式

每道题显示为卡片，包含：

- **题号** + **来源**（右上角）
- **题目内容**（KaTeX 渲染）
- **可选配图**
- **答案**（默认隐藏，点击按钮展开）

## 对接后端

`js/script.js` 中的 `API` 对象当前使用 JSON 文件加载数据，替换为真实后端只需重写该对象的三个方法：

- `fetchTextbooks()` — 获取教材列表
- `fetchChapters(textbookId)` — 获取某教材的章节树
- `fetchProblems(chapterId)` — 获取某章节的题目列表

返回 Promise，数据格式与 JSON 文件中相应字段一致即可。
