/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MenuRegistry, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILLMService, LLMService } from '../common/LLMService.js';
import { SisuNetworkAction } from './sisuNetworkAction.js';

registerAction2(SisuNetworkAction);
registerSingleton(ILLMService, LLMService, InstantiationType.Delayed);
MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, { command: { id: SisuNetworkAction.ID, title: 'Sisu Network' }, group: '1_sisu', order: 1 });
