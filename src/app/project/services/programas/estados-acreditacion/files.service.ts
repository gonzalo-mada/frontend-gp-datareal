import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionUploader, UploaderFilesService } from '../../components/uploader-files.service';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { CollectionsMongo, ModeUploader, Module, NameComponent } from 'src/app/project/models/shared/Context';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { BackendEstadosAcreditacionService } from './backend.service';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { FormEstadosAcreditacionService } from './form.service';

@Injectable({
    providedIn: 'root'
})

export class FilesEstadosAcreditacionService {
    private subscription: Subscription = new Subscription();
    filesSelected: any[] = [];
    filesUploaded: any[] = [];
    filesToDelete: any[] = [];

    constructor(
        private backend: BackendEstadosAcreditacionService,
        private commonUtils: CommonUtils,
        private form: FormEstadosAcreditacionService,
        private uploaderFilesService: UploaderFilesService
    ){}

    initFiles(){
        this.subscription.add(this.uploaderFilesService.contextUpdate$.subscribe( context => {
            if (context && context.component.name === 'estado-acreditacion') {
                // console.log("-->context files.service 'estado-acreditacion",context);
                this.setFiles();

            }
        }));
        this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( async from => {
        if (from && from.context.component.name === 'estado-acreditacion'){
            // console.log("valitador files.service 'estado-acreditacion",from);
            await this.handleFileAction(from);
            await this.updateFiles();
        }
        }));
        this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(async from => {
            if (from) {
                if (from.context.component.name === 'estado-acreditacion') {
                    if (from.mode === 'd') {
                        console.log("DESCARGA REALIZADA DESDE SERVICIO FILES estado-acreditacion");
                        await this.downloadDoc(from.file)
                    }else{
                        await this.getDocWithBinary(from.file, from.mode, from.resolve! , from.reject!);
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
        let blob: Blob = await this.backend.getArchiveDoc(documento.id,false);
        this.commonUtils.downloadBlob(blob, documento.nombre);      
    }

    async getDocWithBinary(documento: any, mode: 'g' | 'b', resolve: Function, reject: Function) {
        try {
            if (mode === 'g') {
                //no se necesita binario en formato string
                const response = await this.backend.getArchiveDoc(documento.id, false);
                resolve(response)
            }else{
                //si se necesita binario en formato string
                const response = await this.backend.getArchiveDoc(documento.id, true);
                resolve(response)
            }
        } catch (error) {
            reject(error)
        }
    }

    async loadDocsWithBinary(estadoAcreditacion: EstadosAcreditacion){
        this.uploaderFilesService.setLoading(true,true);  
        const files = await this.backend.getDocsMongo({Cod_acreditacion: estadoAcreditacion.Cod_acreditacion});
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
