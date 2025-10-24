/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, IAction2Options } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { SISU_NETWORK_COMMAND } from './sisuNetworkCommands.js';

class ExecuteCommandAction extends Action2 {

	constructor(
		desc: Readonly<IAction2Options>,
		private readonly commandId: string,
		private readonly commandArgs?: unknown
	) {
		super(desc);
	}

	override run(accessor: ServicesAccessor): Promise<void> {
		const commandService = accessor.get(ICommandService);

		return commandService.executeCommand(this.commandId, this.commandArgs);
	}
}

export class SisuNetworkAction extends ExecuteCommandAction {

	static readonly ID = 'workbench.action.openSisuNetwork';
	static readonly LABEL = localize('sisuNetwork', "Sisu Network");

	constructor() {
		super({
			id: SisuNetworkAction.ID,
			title: localize2('sisuNetwork', "Sisu Network"),
			f1: true,
			category: Categories.View
		}, SISU_NETWORK_COMMAND);
	}
}
