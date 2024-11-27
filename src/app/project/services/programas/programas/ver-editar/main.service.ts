import { Injectable } from '@angular/core';
import { BackendProgramasService } from '../backend.service';
import { FilesVerEditarProgramaService } from './files.service';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { FormProgramaService } from '../form.service';
import { ModeDialog, Programa } from 'src/app/project/models/programas/Programa';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { MessageServiceGP } from '../../../components/message-service.service';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { ProgramaMainService } from '../main.service';

@Injectable({
    providedIn: 'root'
})


export class VerEditarProgramaMainService {

    programa: Programa = {};
    dialogUpdate: boolean = false
    dialogUpdateMode!: ModeDialog;

    constructor(
        private backend: BackendProgramasService,
        private main: ProgramaMainService,
        private form: FormProgramaService,
        private files: FilesVerEditarProgramaService,
        private messageService: MessageServiceGP,
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get cod_programa(){
        return this.main.cod_programa
    }

    get namesCrud(){
        return this.main.namesCrud
    }

    async setModeCrud(mode: ModeForm, data?: Programa | null, from?: CollectionsMongo | null ){
        this.form.modeForm = mode;
        if (data) this.programa = {...data};
        switch (mode) {
            case 'update': await this.updateForm(); break;
            case 'rowExpandClick': await this.clickRowExpandTablePrograma(from!); break;
        }
    }

    async updateForm(): Promise<ModeDialog> {
        const params = await this.setForm();
        
        const response = await this.backend.updateProgramaBackend(params, this.main.namesCrud);
    
        if (response && response.dataWasUpdated) {
            this.messageService.add({
                key: 'main',
                severity: 'success',
                detail:generateMessage(this.main.namesCrud,response.dataUpdated,'actualizado',true,false)
            });
            this.files.resetLocalFiles();
        }
    
        this.dialogUpdate = false;
        return this.dialogUpdateMode;
    }
    

    async setForm(): Promise<Object> {
        let params = {};
        if (this.dialogUpdateMode !== 'reglamento' && this.dialogUpdateMode !== 'estado acreditación') {
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                const { files, ...formData } = this.form.fbFormUpdate.value;
                params = {
                    ...formData,
                    docsToUpload: responseUploader.docsToUpload,
                    docsToDelete: responseUploader.docsToDelete,
                    modeUpdate: this.dialogUpdateMode,
                    auxForm: this.programa
                };
            }
        } else {
            const { files, ...formData } = this.form.fbFormUpdate.value;
            params = {
                ...formData,
                modeUpdate: this.dialogUpdateMode,
                auxForm: this.programa
            };
        }
        return params; 
    }

    async setLoadDocsWithBinary(codPrograma: number, from: string){
        return this.files.loadDocsWithBinary(codPrograma,from)
    }

    async clickRowExpandTablePrograma(from: CollectionsMongo){
        await this.files.setContextUploader('show','servicio','ver/editar-programa',from!)
        this.files.resetLocalFiles();
        await this.setLoadDocsWithBinary(this.cod_programa, from!)
    }
    

}