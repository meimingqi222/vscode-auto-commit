import axios from 'axios';

export interface APIConfig {
    apiEndpoint: string;
    apiKey: string;
    model: string;
    prompt: string;
    maxTokens: number;
    temperature: number;
}

export interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * 调用 OpenAI 兼容的 API
 */
export async function callOpenAIAPI(config: APIConfig): Promise<string> {
    try {
        const response = await axios.post<OpenAIResponse>(
            config.apiEndpoint,
            {
                model: config.model,
                messages: [
                    {
                        role: 'user',
                        content: config.prompt,
                    },
                ],
                max_tokens: config.maxTokens,
                temperature: config.temperature,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                timeout: 30000, // 30秒超时
            }
        );

        if (!response.data.choices || response.data.choices.length === 0) {
            throw new Error('API 返回了空响应');
        }

        const message = response.data.choices[0].message.content;
        return message;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // 服务器返回了错误响应
                const statusCode = error.response.status;
                const errorData = error.response.data;
                throw new Error(`API 错误 (${statusCode}): ${JSON.stringify(errorData)}`);
            } else if (error.request) {
                // 请求已发送但没有收到响应
                throw new Error('无法连接到 API 服务器，请检查网络连接和 API 端点配置');
            }
        }
        throw new Error(`API 调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
}
