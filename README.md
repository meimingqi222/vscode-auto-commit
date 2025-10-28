# Auto Commit Message Generator

一个智能的 VSCode 插件，使用 AI 自动生成 Git commit 消息。默认使用 DeepSeek API，同时支持任何 OpenAI 兼容的 API。

## 功能特性

- 🤖 自动分析暂存区的更改，生成合适的 commit 消息
- 🔧 支持自定义提示词模板
- 🌐 支持任何 OpenAI 兼容的 API 端点
- 💡 默认使用 DeepSeek API（经济实惠）
- 🎨 集成到 VSCode Git 界面，使用简单
- ⚙️ 灵活的配置选项（模型、温度、最大 token 数等）

## 安装

### 从源码安装

1. 克隆或下载此仓库
2. 进入项目目录：
   ```bash
   cd vscode-auto-commit
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 编译项目：
   ```bash
   npm run compile
   ```
5. 按 F5 在 VSCode 扩展开发模式下运行

### 打包安装

```bash
npm install -g @vscode/vsce
vsce package
```

然后在 VSCode 中选择 "从 VSIX 安装..."。

## 配置

打开 VSCode 设置，搜索 "Auto Commit"，可以配置以下选项：

### 必需配置

- **API Key**: 你的 API 密钥
  - 可以在设置中直接配置
  - 也可以设置环境变量 `DEEPSEEK_API_KEY`

### 可选配置

- **API Endpoint**: API 端点 URL（默认：`https://api.deepseek.com/v1/chat/completions`）
- **Model**: 模型名称（默认：`deepseek-chat`）
- **Prompt**: 提示词模板（使用 `{diff}` 作为占位符）
- **Max Tokens**: 最大 token 数量（默认：500）
- **Temperature**: 温度参数 0-1（默认：0.3）

### 提示词模板示例

默认提示词：
```
根据以下 git diff 内容，生成一个简洁明了的中文 commit 消息。格式要求：第一行是简短的标题（不超过50字），如果需要详细说明则空一行后添加详细描述。

Git diff:
```
{diff}
```

请直接返回 commit 消息，不要有任何额外的说明或格式标记。
```

你可以根据需要自定义提示词，`{diff}` 会被自动替换为实际的 git diff 内容。

## 使用方法

1. 在 Git 仓库中打开项目
2. 暂存（stage）你想要提交的文件
3. 点击 Git 面板标题栏中的 ✨ 图标（或使用命令面板搜索 "生成 Commit 消息"）
4. 等待 AI 生成 commit 消息
5. 消息会自动填充到 commit message 输入框中
6. 根据需要编辑消息，然后提交

## 使用其他 API

### 使用 OpenAI

```json
{
  "autoCommit.apiEndpoint": "https://api.openai.com/v1/chat/completions",
  "autoCommit.apiKey": "sk-your-openai-key",
  "autoCommit.model": "gpt-4"
}
```

### 使用其他兼容 API

只要 API 兼容 OpenAI 的聊天完成接口格式，就可以使用。修改 `apiEndpoint`、`apiKey` 和 `model` 即可。

## 开发

### 项目结构

```
vscode-auto-commit/
├── src/
│   ├── extension.ts       # 扩展主入口
│   ├── commitGenerator.ts # Commit 消息生成逻辑
│   ├── apiClient.ts       # API 调用客户端
│   └── git.d.ts          # Git API 类型定义
├── package.json          # 扩展配置
├── tsconfig.json         # TypeScript 配置
└── README.md            # 说明文档
```

### 构建命令

- `npm run compile`: 编译 TypeScript
- `npm run watch`: 监听文件变化并自动编译
- `npm run lint`: 运行代码检查

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
