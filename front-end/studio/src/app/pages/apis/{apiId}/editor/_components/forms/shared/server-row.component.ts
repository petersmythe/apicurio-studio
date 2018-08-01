/**
 * @license
 * Copyright 2017 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";
import {Oas30Document, Oas30Operation, Oas30PathItem, Oas30Server} from "oai-ts-core";
import {createChangePropertyCommand, ICommand} from "oai-ts-commands";
import {CommandService} from "../../../_services/command.service";
import {EditorsService} from "../../../_services/editors.service";
import {ServerEditorComponent} from "../../editors/server-editor.component";
import {ServerEventData} from "../../dialogs/add-server.component";


@Component({
    moduleId: module.id,
    selector: "server-row",
    templateUrl: "server-row.component.html",
    styleUrls: ["server-row.component.css"],
    encapsulation: ViewEncapsulation.None
})
export class ServerRowComponent {

    @Input() server: Oas30Server;

    @Output() onEdit: EventEmitter<ServerEventData> = new EventEmitter<ServerEventData>();
    @Output() onDelete: EventEmitter<boolean> = new EventEmitter<boolean>();

    protected _editing: boolean = false;

    constructor(private commandService: CommandService, private editorsService: EditorsService) {}

    public hasUrl(): boolean {
        return this.server.url ? true : false;
    }

    public description(): string {
        if (this.server.description) {
            return this.server.description
        } else {
            return "No description.";
        }
    }

    public hasDescription(): boolean {
        return this.server.description ? true : false;
    }

    public isEditing(): boolean {
        return this._editing;
    }

    public toggle(): void {
        this._editing = !this._editing;
    }

    public edit(): void {
        let serverEditor: ServerEditorComponent = this.editorsService.getServerEditor();
        let parent: Oas30Document | Oas30PathItem | Oas30Operation = this.server.parent() as any;
        serverEditor.open({
            onSave: (data) => this.onEdit.emit(data),
            onCancel: () => {}
        }, parent, this.server);
    }

    public cancel(): void {
        this._editing = false;
    }

    public delete(): void {
        this.onDelete.emit(true);
    }

    public setDescription(description: string): void {
        // TODO create a new ChangeServerDescription command as it's a special case when used in a multi-user editing environment (why?)
        let command: ICommand = createChangePropertyCommand<string>(this.server.ownerDocument(), this.server, "description", description);
        this.commandService.emit(command);
    }

    public onGlobalKeyDown(event: KeyboardEvent): void {
        if (event.key === "Escape"  && !event.metaKey && !event.altKey && !event.ctrlKey) {
            this.cancel();
        }
    }

}
