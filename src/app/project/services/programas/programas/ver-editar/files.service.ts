import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionUploader, UploaderFilesService } from '../../../components/uploader-files.service';
import { CollectionsMongo, ModeUploader, Module, NameComponent } from 'src/app/project/models/shared/Context';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { BackendProgramasService } from '../backend.service';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { FormProgramaService } from '../form.service';

@Injectable({
    providedIn: 'root'
})

export class FilesVerEditarProgramaService {
    private subscription: Subscription = new Subscription();
    filesSelected: any[] = [];
    filesUploaded: any[] = [];
    filesToDelete: any[] = [];

    constructor(
        private backend: BackendProgramasService,
        private form: FormProgramaService,
        private commonUtils: CommonUtils,
        private uploaderFilesService: UploaderFilesService
    ){}

    initFiles(){
        this.subscription.add(this.uploaderFilesService.contextUpdate$.subscribe( context => {
            if (context && context.component.name === 'ver/editar-programa') {
                // console.log("-->context files.service ver/editar-programa",context);
                this.setFiles();
            }
        }));
        this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( async from => {
            if (from && from.context.component.name === 'ver/editar-programa'){
                // console.log("valitador files.service ver/editar-programa",from);
                await this.handleFileAction(from);
                await this.updateFiles(from);
            }
        }));
        this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe( async from => {
            if (from) {
                if (from.mode === 'd') {
                    if (from.context.component.collection) {
                        console.log("DESCARGA REALIZADA DESDE SERVICIO FILES VER/EDITAR PROGRAMA");
                        this.downloadDoc(from.file , from.context.component.collection)
                    }
                }else{
                    if (from.context.component.collection) {
                        await this.getDocWithBinary(from.file, from.context.component.collection, from.mode, from.resolve! , from.reject!);
                    }
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

    setContextUploader(modeUploader: ModeUploader, moduleName: Module, nameComponent: NameComponent, collection?: CollectionsMongo ): Promise<boolean>{
        return this.uploaderFilesService.newSetContext(modeUploader, moduleName, nameComponent, collection);
    }

    async setActionUploader(action: ActionUploader): Promise<ActionUploadDoc>{
        return new Promise((resolve, reject) => {
            this.uploaderFilesService.setAction(action, resolve, reject);
        });
    }

    async updateFiles(from: any): Promise<boolean> {
        this.uploaderFilesService.filesSelected = [...this.filesSelected];
        this.uploaderFilesService.filesUploaded = [...this.filesUploaded];
        this.uploaderFilesService.filesToDelete = [...this.filesToDelete];
    
        const files = await this.uploaderFilesService.setConfigModeUploader();
        from.context.mode === 'edit' ? this.form.updateFilesFormUpdate(files) : this.form.updateFilesForm(files)    
        return true;
    }

    async downloadDoc(documento: any, from: string) {
        let blob: Blob = await this.backend.getArchiveDoc(documento.id, from, false);
        this.commonUtils.downloadBlob(blob, documento.nombre);      
    }

    async getDocWithBinary(documento: any, from: string, mode: 'g' | 'b', resolve?: Function, reject?: Function) {
        try {
            if (mode === 'g') {
                //no se necesita binario en formato string
                const response = await this.backend.getArchiveDoc(documento.id, from, false);
                if (resolve) resolve(response)
            }else{
                //si se necesita binario en formato string
                const response = await this.backend.getArchiveDoc(documento.id, from, true);
                if (resolve) resolve(response)
            }
        } catch (error) {
            if (reject) reject(error)
        }
    }

    async loadDocsWithBinary(codPrograma: number, from: string){
        this.uploaderFilesService.setLoading(true,true);  
        const files = await this.backend.getDocsMongo(codPrograma, from);
        await this.uploaderFilesService.updateFilesFromMongo(files);
        this.uploaderFilesService.setLoading(false);
        return files 
    }

    disabledButtonSeleccionar(){
        this.uploaderFilesService.disabledButtonSeleccionar();
    }

    enabledButtonSeleccionar(){
        this.uploaderFilesService.enabledButtonSeleccionar();
    }
}