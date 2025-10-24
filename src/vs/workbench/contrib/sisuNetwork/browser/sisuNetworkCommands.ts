/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { KeybindingsRegistry, KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { SisuNetworkInput } from './sisuNetworkInput.js';

export const SISU_NETWORK_COMMAND = 'workbench.action.openSisuNetworkCommand';

// Register actual command that opens the editor
KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: SISU_NETWORK_COMMAND,
	weight: KeybindingWeight.WorkbenchContrib,
	when: undefined,
	primary: undefined,
	handler: async (accessor: ServicesAccessor) => {
		const editorService = accessor.get(IEditorService);
		const input = new SisuNetworkInput();
		return editorService.openEditor(input);
	}
});
