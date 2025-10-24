/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EditorInput } from '../../../common/editor/editorInput.js';
import { URI } from '../../../../base/common/uri.js';

export class SisuNetworkInput extends EditorInput {
	static readonly ID = 'workbench.input.sisuNetwork';

	static resource = URI.from({
		scheme: 'sisunetwork',
		path: 'sisunetwork'
	});

	constructor() {
		super();
	}

	override get typeId(): string {
		return SisuNetworkInput.ID;
	}

	override get editorId(): string {
		return 'workbench.editor.sisuNetwork';
	}

	override getName(): string {
		return 'Sisu Network AI';
	}

	override get resource(): URI {
		return SisuNetworkInput.resource;
	}

	override matches(other: EditorInput): boolean {
		return other instanceof SisuNetworkInput;
	}
}
