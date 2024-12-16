import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionUploader, UploaderFilesService } from '../../components/uploader-files.service';
import { FormReglamentosService } from './form.service';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { BackendReglamentosService } from './backend.service';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { CollectionsMongo, LabelComponent, ModeUploader, Module, NameComponent } from 'src/app/project/models/shared/Context';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';

@Injectable({
    providedIn: 'root'
})

export class FilesReglamentosService {
    private subscription: Subscription = new Subscription();
    filesSelected: any[] = [];
    filesUploaded: any[] = [];
    filesToDelete: any[] = [];

    constructor(
        private backend: BackendReglamentosService,
        private commonUtils: CommonUtils,
        private form: FormReglamentosService,
        private uploaderFilesService: UploaderFilesService
    ){}

    initFiles(){
        this.subscription.add(this.uploaderFilesService.contextUpdate$.subscribe( context => {
            if (context && context.component.name === 'reglamentos') {
                // console.log("-->context files.service reglamento",context);
                this.setFiles();

            }
        }));
        this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( async from => {
        if (from && from.context.component.name === 'reglamentos'){
            // console.log("valitador files.service reglamento",from);
            await this.handleFileAction(from);
            await this.updateFiles();
        }
        }));
        this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
            if (from) {
                if (from.context.component.name === 'reglamentos') {
                    console.log("DESCARGA REALIZADA DESDE SERVICIO FILES REGLAMENTOS");
                    this.downloadDoc(from.file)
                }
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
                this.filesSelected = [...from.files.filesSelected];
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

    async downloadDoc(documento: any) {
        let blob: Blob = await this.backend.getArchiveDoc(documento.id);
        this.commonUtils.downloadBlob(blob, documento.nombre);      
    }

    async loadDocsWithBinary(reglamento: Reglamento){
        this.uploaderFilesService.setLoading(true,true);  
        const files = await this.backend.getDocumentosWithBinary(reglamento.Cod_reglamento!);
        await this.uploaderFilesService.updateFilesFromMongo(files);
        this.uploaderFilesService.setLoading(false); 
    }
    
}
