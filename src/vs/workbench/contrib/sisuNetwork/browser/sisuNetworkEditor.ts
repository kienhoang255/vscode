/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { SisuNetworkInput } from './sisuNetworkInput.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IWebviewElement } from '../../../contrib/webview/browser/webview.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { safeSetInnerHtml } from '../../../../base/browser/domSanitize.js';
import { ILLMService, ModelRequest } from '../common/LLMService.js';

export class SisuNetworkEditor extends EditorPane {

	static readonly ID = 'workbench.editor.sisuNetwork';

	private webview!: IWebviewElement;
	private container!: HTMLElement;
	private contentDiv!: HTMLElement;

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@ILLMService private readonly llmService: ILLMService
	) {
		super(SisuNetworkEditor.ID, group, telemetryService, themeService, storageService,);
	}

	protected createEditor(parent: HTMLElement): void {
		this.renderTemplate(parent);
	}

	private async openNativeWindow(url: string): Promise<void> {
		try {
			safeSetInnerHtml(this.contentDiv, '<div style="text-align: center; padding: 20px;">Loading...</div>');
			const windowId = this.group.windowId;
			const htmlContent = await this.llmService.openWindow(windowId, url);
			this.llmService.clearContext(url);
			safeSetInnerHtml(this.contentDiv, htmlContent);

		} catch (error) {
			safeSetInnerHtml(this.contentDiv, `<div style="color: var(--vscode-errorForeground); text-align: center; padding: 20px;">
                Failed to load content: ${error instanceof Error ? error.message : 'Unknown error'}
            </div>`);
		}
	}

	private renderTemplate(parent: HTMLElement): void {
		this.container = parent;
		this.container.style.display = 'flex';
		this.container.style.flexDirection = 'column';
		this.container.style.alignItems = 'center';
		this.container.style.justifyContent = 'center';
		this.container.style.height = '100%';

		const inputWrapper = document.createElement('div');
		inputWrapper.style.display = 'flex';
		inputWrapper.style.width = 'calc(75% - 10px)';

		const urlInput = document.createElement('input');
		urlInput.type = 'text';
		urlInput.value = 'https://vnexpress.net/';
		urlInput.style.flex = '1';

		const openButton = document.createElement('button');
		openButton.textContent = 'Load URL';
		openButton.style.cursor = 'pointer';

		const mainContentContainer = document.createElement('div');
		mainContentContainer.style.display = 'flex';
		mainContentContainer.style.width = '100%';
		mainContentContainer.style.height = 'calc(100% - 35px)';
		mainContentContainer.style.gap = '10px';

		this.contentDiv = document.createElement('div');
		this.contentDiv.style.width = '75%';
		this.contentDiv.style.height = '100%';
		this.contentDiv.style.overflow = 'auto';
		this.contentDiv.style.border = '1px solid var(--vscode-widget-border)';
		this.contentDiv.style.borderRadius = '4px';
		this.contentDiv.style.backgroundColor = 'var(--vscode-editor-background)';
		safeSetInnerHtml(this.contentDiv, '<div style="text-align: center; padding: 20px;">Enter URL and click Load Content</div>');

		const chatLLM = document.createElement('div');
		chatLLM.style.width = 'calc(25% - 20px)';
		chatLLM.style.height = 'calc(100% - 20px)';
		chatLLM.style.border = '1px solid var(--vscode-widget-border)';
		chatLLM.style.borderRadius = '4px';
		chatLLM.style.backgroundColor = 'var(--vscode-editor-background)';
		chatLLM.style.padding = '10px';
		chatLLM.style.overflow = 'auto';

		const chatHeader = document.createElement('div');
		chatHeader.style.fontWeight = 'bold';
		chatHeader.style.marginBottom = '10px';
		chatHeader.style.borderBottom = '1px solid var(--vscode-widget-border)';
		chatHeader.style.paddingBottom = '5px';
		chatHeader.textContent = 'AI Assistant';

		const chatMessages = document.createElement('div');
		chatMessages.style.height = 'calc(100% - 80px)';
		chatMessages.style.width = '100%';
		chatMessages.style.overflow = 'auto';
		chatMessages.style.marginBottom = '10px';
		chatMessages.style.display = 'flex';
		chatMessages.style.flexDirection = 'column';

		const chatInput = document.createElement('input');
		chatInput.type = 'text';
		chatInput.placeholder = 'Type your message...';
		chatInput.style.width = 'calc(100% - 10px)';
		chatInput.style.padding = '5px';
		chatInput.style.border = '1px solid var(--vscode-widget-border)';
		chatInput.style.borderRadius = '3px';
		chatInput.style.backgroundColor = 'var(--vscode-input-background)';
		chatInput.style.color = 'var(--vscode-input-foreground)';

		chatLLM.appendChild(chatHeader);
		chatLLM.appendChild(chatMessages);
		chatLLM.appendChild(chatInput);

		mainContentContainer.appendChild(this.contentDiv);
		mainContentContainer.appendChild(chatLLM);

		openButton.addEventListener('click', () => {
			const url = urlInput.value.trim();
			if (url) {
				this.openNativeWindow(url.startsWith('http') ? url : `https://${url}`);
			}
		});

		urlInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				openButton.click();
			}
		});

		chatInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				const message = chatInput.value.trim();
				chatInput.disabled = true;
				chatInput.style.backgroundColor = 'lightgray';
				if (message) {
					this.renderMessage(ModelRequest.USER, message, chatMessages);
					chatInput.value = '';
					this.renderMessage(ModelRequest.AI, 'We are thinking...', chatMessages, (ele) => {
						this.llmService.sendMessage(message).then(response => {
							chatInput.disabled = false;
							chatInput.style.backgroundColor = 'var(--vscode-input-background)';
							ele.textContent = response;
						}).catch(err => {
							chatInput.disabled = false;
							chatInput.style.backgroundColor = 'var(--vscode-input-background)';
							ele.textContent = 'Failed to get AI response';
							console.log(err);
						});
					});
				}
			}
		});

		this.container.appendChild(inputWrapper);
		inputWrapper.appendChild(urlInput);
		inputWrapper.appendChild(openButton);
		this.container.appendChild(mainContentContainer);

	}

	private renderMessage(role: ModelRequest, message: string, parentHTML: HTMLElement, callback?: (ele: HTMLElement) => void): void {
		const messageDiv = document.createElement('pre');
		messageDiv.style.marginBottom = '5px';
		messageDiv.style.padding = '5px 10px';
		messageDiv.style.width = 'fit-content';
		messageDiv.style.alignSelf = role === ModelRequest.USER ? 'end' : '';
		messageDiv.style.backgroundColor = role === ModelRequest.USER ? 'var(--vscode-list-hoverBackground)' : 'transparent';
		messageDiv.style.borderRadius = '50px 2px 50px 50px';
		messageDiv.style.whiteSpace = 'pre-wrap';
		messageDiv.textContent = `${message}`;
		parentHTML.appendChild(messageDiv);
		parentHTML.scrollTop = parentHTML.scrollHeight;
		callback?.(messageDiv);
	}

	override async setInput(input: EditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void> {
		if (!(input instanceof SisuNetworkInput)) {
			throw new Error('Invalid input type for SisuNetworkEditor');
		}
		await super.setInput(input, options, context, token);
	}

	override layout(dimension: Dimension): void {
		if (this.container) {
			this.container.style.width = dimension.width + 'px';
			this.container.style.height = dimension.height + 'px';
		}
	}

	override dispose(): void {
		if (this.webview) {
			this.webview.dispose();
		}
		super.dispose();
	}
}
