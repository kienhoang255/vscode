/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';

export const ILLMService = createDecorator<ILLMService>('llmService');

export enum ModelRequest {
	USER = 'user',
	AI = 'ai',
}

export interface ILLMService {
	sendMessage(message: string): Promise<string>;
	openWindow(windowId: number | undefined, url: string): Promise<string>;
	clearContext(url: string): void;
}

export class LLMService implements ILLMService {
	constructor(
		@INativeHostService private readonly nativeHostService: INativeHostService,
	) { }

	private readonly apiKey = 'AIzaSyBcGQanM7CqgNp-jAYwLVfAnz7nZk9COF8';
	private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
	private data: unknown[] = [];

	async sendMessage(message: string): Promise<string> {
		this.data.push({ role: ModelRequest.USER, parts: [{ text: message }] });
		try {
			const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					contents: [this.data],
				}),
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			this.data.push({ role: ModelRequest.AI, parts: [{ text: data }] });
			return data.candidates[0].content.parts[0].text || 'No response';

		} catch (error) {
			throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async openWindow(windowId: number | undefined, url: string): Promise<string> {
		const htmlContent = await this.nativeHostService.openSisuNetworkWindow(windowId, url);
		const cleaned = this.getReadableText(htmlContent);
		this.data.push({ role: ModelRequest.USER, parts: [{ text: 'Dưới đây là nội dung trang web: ' + cleaned }] });
		return htmlContent;
	}

	clearContext(newURL: string): void {
		this.data = [];
		this.data.push({ role: ModelRequest.USER, parts: [{ text: 'Đây là đường link của web: ' + newURL }] });
	}

	private getReadableText(html: string): string {
		try {
			const text = html
				.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
				.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
				.replace(/<[^>]+>/g, ' ')
				.replace(/<\/(p|div|section|article|h[1-6]|li|br|tr|table)>/gi, '\n')

				.replace(/<!--[\s\S]*?-->/g, '')
				.replace(/-->/g, '')
				.replace(/&nbsp;/g, ' ')
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'")

				.replace(/[ \t]+/g, ' ')
				.replace(/\n\s*\n+/g, '\n')
				.replace(/<!--[\s\S]*?-->/g, '')

				.trim();
			return text;

		} catch (err) {
			console.error('getReadableText error:', err);
			return '';
		}
	}

}
