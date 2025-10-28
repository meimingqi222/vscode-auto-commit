import * as vscode from 'vscode';
import { Repository } from './git';
import { callOpenAIAPI } from './apiClient';
import * as cp from 'child_process';
import * as util from 'util';

const exec = util.promisify(cp.exec);

/**
 * 语言映射：语言代码 -> 语言描述（用英文，AI 更容易理解）
 */
const LANGUAGE_MAP: Record<string, string> = {
    'zh-CN': 'Simplified Chinese',
    'zh-cn': 'Simplified Chinese',
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ru': 'Russian'
};

/**
 * 获取当前语言
 */
function getLanguage(config: vscode.WorkspaceConfiguration): string {
    const configLang = config.get<string>('language') || 'auto';
    
    if (configLang !== 'auto') {
        return LANGUAGE_MAP[configLang] || 'English';
    }
    
    // 自动检测 VSCode 语言
    const vscodeLocale = vscode.env.language;
    return LANGUAGE_MAP[vscodeLocale] || 'English';
}

/**
 * 获取暂存区的 diff
 */
async function getStagedDiff(repository: Repository): Promise<string> {
    try {
        const repoPath = repository.rootUri.fsPath;
        const { stdout } = await exec('git diff --cached', { cwd: repoPath, maxBuffer: 1024 * 1024 * 10 });
        return stdout;
    } catch (error) {
        throw new Error(`获取 diff 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
}

/**
 * 生成 commit 消息
 */
export async function generateCommitMessage(repository: Repository): Promise<string> {
    // 获取配置
    const config = vscode.workspace.getConfiguration('autoCommit');
    const apiKey = config.get<string>('apiKey') || process.env.DEEPSEEK_API_KEY || '';
    
    if (!apiKey) {
        throw new Error('未配置 API Key，请在设置中配置或设置环境变量 DEEPSEEK_API_KEY');
    }

    const apiEndpoint = config.get<string>('apiEndpoint') || 'https://api.deepseek.com/v1/chat/completions';
    const model = config.get<string>('model') || 'deepseek-chat';
    const promptTemplate = config.get<string>('prompt') || '根据以下 git diff 内容，生成一个符合 Conventional Commits 规范的 commit 消息。';
    const maxTokens = config.get<number>('maxTokens') || 500;
    const temperature = config.get<number>('temperature') || 0.3;
    const language = getLanguage(config);

    // 获取暂存区的 diff
    const diff = await getStagedDiff(repository);
    
    if (!diff || diff.trim().length === 0) {
        throw new Error('暂存区没有变更');
    }

    // 限制 diff 长度，避免超过 token 限制
    const maxDiffLength = 8000;
    const truncatedDiff = diff.length > maxDiffLength 
        ? diff.substring(0, maxDiffLength) + '\n\n...(内容过长，已截断)'
        : diff;

    // 替换提示词中的占位符
    let prompt = promptTemplate.replace('{diff}', truncatedDiff);
    
    // 替换语言占位符
    prompt = prompt.replace('{language}', language);

    // 调用 API
    const commitMessage = await callOpenAIAPI({
        apiEndpoint,
        apiKey,
        model,
        prompt,
        maxTokens,
        temperature,
    });

    return commitMessage.trim();
}
