import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormProgramaService } from '../form.service';
import { ActionUploader, UploaderFilesService } from '../../../components/uploader-files.service';
import { CollectionsMongo, ModeUploader, Module, NameComponent } from 'src/app/project/models/shared/Context';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';

@Injectable({
    providedIn: 'root'
})

export class FilesAgregarProgramaService {
    private subscription: Subscription = new Subscription();
    filesSelected: any[] = [];
    filesUploaded: any[] = [];
    filesToDelete: any[] = [];

    constructor(
        private form: FormProgramaService,
        private uploaderFilesService: UploaderFilesService
    ){}

    initFiles(){
        this.subscription.add(this.uploaderFilesService.contextUpdate$.subscribe( context => {
            if (context && context.component.name === 'agregar-programa') {
                console.log("-->context files.service agregar-programa",context);
                this.setFiles();
            }
        }));
        this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( async from => {
            if (from && from.context.component.name === 'agregar-programa'){
                console.log("valitador files.service agregar-programa",from);
                await this.handleFileAction(from);
                await this.updateFiles();
            }
        }));
    }

    private async handleFileAction(from: any) {
        switch (from.action) {
            case 'select':
                this.filesSelected = [...from.files.filesSelected];
            break;
            case 'uploaded':
                this.filesUploaded = [...from.files.filesUploaded];
            break;
            case 'delete-selected':
                this.filesSelected = [...from.files.filesSelected]; 
            break;
            case 'cancel-delete':
                this.filesToDelete = [...from.files.filesToDelete];
                this.filesUploaded = [...from.files.filesUploaded];
            break;
            case 'delete-uploaded':
                this.filesToDelete = [...from.files.filesToDelete];
                this.filesUploaded = [...from.files.filesUploaded];
            break;
        }
    }

    resetLocalFiles(){
        this.filesSelected = [];
        this.filesUploaded = [];
        this.filesToDelete = [];
    }

    setFiles(){
        this.uploaderFilesService.filesSelected = [...this.filesSelected];
        this.uploaderFilesService.filesUploaded = [...this.filesUploaded];
        this.uploaderFilesService.filesToDelete = [...this.filesToDelete];
    }

    setContextUploader(modeUploader: ModeUploader, moduleName: Module, nameComponent: NameComponent, collection?: CollectionsMongo): Promise<boolean>{
        return this.uploaderFilesService.newSetContext(modeUploader, moduleName, nameComponent, collection);
    }

    async setActionUploader(action: ActionUploader): Promise<ActionUploadDoc>{
        return new Promise((resolve, reject) => {
            this.uploaderFilesService.setAction(action, resolve, reject);
        });
    }

    async updateFiles(): Promise<boolean> {
        this.uploaderFilesService.filesSelected = [...this.filesSelected];
        this.uploaderFilesService.filesUploaded = [...this.filesUploaded];
        this.uploaderFilesService.filesToDelete = [...this.filesToDelete];
    
        const files = await this.uploaderFilesService.setConfigModeUploader();
        this.form.updateFilesForm(files);
    
        return true;
    }
}