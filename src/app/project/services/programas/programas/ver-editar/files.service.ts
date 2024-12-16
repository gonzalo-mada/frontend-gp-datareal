import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionUploader, UploaderFilesService } from '../../../components/uploader-files.service';
import { CollectionsMongo, ModeUploader, Module, NameComponent } from 'src/app/project/models/shared/Context';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { BackendProgramasService } from '../backend.service';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ModeDialog } from 'src/app/project/models/programas/Programa';
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
                console.log("-->context files.service ver/editar-programa",context);
                this.setFiles();
            }
        }));
        this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( async from => {
            if (from && from.context.component.name === 'ver/editar-programa'){
                console.log("valitador files.service ver/editar-programa",from);
                await this.handleFileAction(from);
                await this.updateFiles(from);
            }
        }));
        this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
            if (from) {
                if (from.context.component.collection) {
                    console.log("DESCARGA REALIZADA DESDE SERVICIO FILES VER/EDITAR PROGRAMA");
                    switch (from.context.component.collection) {
                      case 'maestro': this.downloadDoc(from.file,'maestro'); break;
                      case 'director': this.downloadDoc(from.file,'director'); break;
                      case 'directorAlterno': this.downloadDoc(from.file,'directorAlterno'); break;
                      case 'estado_maestro': this.downloadDoc(from.file,'estado_maestro'); break;
                      case 'grado_academico': this.downloadDoc(from.file,'grado_academico'); break;
                      case 'REXE': this.downloadDoc(from.file,'REXE'); break;
                      case 'titulo': this.downloadDoc(from.file,'titulo'); break;
                    }
                }else{
                    switch (from.context.component.name) {
                      case 'estado-acreditacion': this.downloadDoc(from.file,'estados_acreditacion'); break;
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
        let blob: Blob = await this.backend.getArchiveDoc(documento.id, from);
        this.commonUtils.downloadBlob(blob, documento.nombre);      
    }

    async loadDocsWithBinary(codPrograma: number, from: string){
        this.uploaderFilesService.setLoading(true,true);  
        const files = await this.backend.getDocumentosWithBinary(codPrograma, from);
        await this.uploaderFilesService.updateFilesFromMongo(files);
        this.uploaderFilesService.setLoading(false);
        return files 
    }
}