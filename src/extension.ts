import * as vscode from 'vscode';
import { GitExtension, Repository } from './git';
import { generateCommitMessage } from './commitGenerator';

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Commit Message Generator 已激活');

    const disposable = vscode.commands.registerCommand(
        'vscode-auto-commit.generateCommitMessage',
        async () => {
            try {
                // 获取 Git 扩展
                const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
                if (!gitExtension) {
                    vscode.window.showErrorMessage('无法找到 Git 扩展');
                    return;
                }

                const git = gitExtension.getAPI(1);
                if (git.repositories.length === 0) {
                    vscode.window.showErrorMessage('未找到 Git 仓库');
                    return;
                }

                // 使用第一个仓库
                const repository = git.repositories[0];

                // 检查是否有暂存的文件
                if (repository.state.indexChanges.length === 0) {
                    vscode.window.showWarningMessage('没有暂存的文件，请先暂存要提交的更改');
                    return;
                }

                // 显示进度提示
                await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: '正在生成 Commit 消息...',
                        cancellable: false,
                    },
                    async (progress) => {
                        try {
                            // 生成 commit 消息
                            const commitMessage = await generateCommitMessage(repository);

                            // 设置到 input box
                            repository.inputBox.value = commitMessage;

                            vscode.window.showInformationMessage('Commit 消息已生成！');
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : '未知错误';
                            vscode.window.showErrorMessage(`生成失败: ${errorMessage}`);
                        }
                    }
                );
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '未知错误';
                vscode.window.showErrorMessage(`操作失败: ${errorMessage}`);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
