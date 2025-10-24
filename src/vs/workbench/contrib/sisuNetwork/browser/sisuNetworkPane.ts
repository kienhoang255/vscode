/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor, IEditorPaneRegistry } from '../../../browser/editor.js';
import { EditorExtensions } from '../../../common/editor.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { SisuNetworkEditor } from './sisuNetworkEditor.js';
import { SisuNetworkInput } from './sisuNetworkInput.js';
import './sisuNetworkCommands.js';

// Register the editor pane
const editorPaneRegistry = Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane);
editorPaneRegistry.registerEditorPane(
    EditorPaneDescriptor.create(
        SisuNetworkEditor,
        SisuNetworkEditor.ID,
        'Sisu Network AI'
    ),
    [new SyncDescriptor(SisuNetworkInput)]// Use the ID string, not SyncDescriptor
);
