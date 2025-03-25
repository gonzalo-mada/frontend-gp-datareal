import { Injectable } from '@angular/core';
import { FormAsignaturasService } from '../form.service';
import { BackendAsignaturasService } from '../backend.service';
import { AsignaturasMainService } from '../main.service';
import { MessageServiceGP } from '../../../components/message-service.service';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { ModeDialogAsign } from 'src/app/project/models/asignaturas/Asignatura';
import { FilesVerEditarAsignatura } from './files.service';
import { HistorialActividadService } from '../../../components/historial-actividad.service';
@Injectable({
    providedIn: 'root'
})
export class VerEditarAsignaturaMainService {
    
    dialogUpdateMode!: ModeDialogAsign;
    dialogUpdate: boolean = false
    //array para cada campo de PE
    modalidades: any[] = [];
    jornadas: any[] = [];
    regimenes: any[] = [];
    articulaciones: any[] = [];
    tipos_evaluaciones: any[] = [];
    tipos_colegiadas: any[] = [];
    menciones: any[] = [];
    menciones_asign: any[] = [];
    prerrequisitos_asign: any[] = [];
    temas: any[] = [];
    temas_asign: any[] = [];
    secuencialidades: any[] = [];
    secuencialidades_asign: any[] = [];

    constructor(
        private backend: BackendAsignaturasService,
        private form: FormAsignaturasService,
        private files: FilesVerEditarAsignatura,
        private main: AsignaturasMainService,
        private messageService: MessageServiceGP,
        private historialActividad: HistorialActividadService
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get cod_asignatura(){
        return this.main.cod_asignatura
    }

    get namesCrud(){
        return this.main.namesCrud
    }

    get mode(){
        return this.main.mode
    }

    enabledButtonSeleccionar(){
        this.files.enabledButtonSeleccionar();
    }

    disabledButtonSeleccionar(){
        this.files.disabledButtonSeleccionar();
    }

    async createFormUpdate(form: ModeDialogAsign, collection: CollectionsMongo, canEdit: boolean){

        switch (form) {
        
            default:
                await this.commonFormUpdate(form, collection, true, canEdit);
            break;
        }

    }

    async commonFormUpdate(form: ModeDialogAsign, collection: CollectionsMongo, needFiles: boolean, canEdit: boolean){
        await this.form.setFormUpdate(form, this.main.asignatura, canEdit);
        if (this.mode === 'show' ) this.form.fbFormUpdate.disable();
        this.dialogUpdate = true;
        if (needFiles) {
            await this.files.setContextUploader('edit', 'servicio', 'ver/editar-asignatura', collection);
            const response = await this.files.loadDocsWithBinary(this.main.asignatura.cod_asignatura!, collection!);
            if (response) {
                this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
            }
        }
        this.form.showButtonSubmitUpdate = true;
    }

    async updateForm(): Promise<ModeDialogAsign> {
        const params = await this.setForm();
        if (params) {
            const response = await this.backend.updateAsignatura(params, this.main.namesCrud);
            if (response && response.dataWasUpdated) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail:generateMessage(this.main.namesCrud,response.dataUpdated,'actualizado',true,false)
                });
                this.files.resetLocalFiles();
            }
        }
        this.dialogUpdate = false;
        return this.dialogUpdateMode;
    }

    async setForm(): Promise<Object> {
        let params = {};
        const responseUploader = await this.files.setActionUploader('upload');
        if (responseUploader) {
            const { files, ...formData } = this.form.fbFormUpdate.value;
            params = {
                ...formData,
                docsToUpload: responseUploader.docsToUpload,
                docsToDelete: responseUploader.docsToDelete,
                modeUpdate: this.dialogUpdateMode,
                auxForm: this.main.asignatura
            };
        }
        return params; 
    }

    async openHistorialActividad(){
        await this.historialActividad.refreshHistorialActividad();
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string, origen_s?: string, codigo?: string){
        this.historialActividad.setOrigen(origen,origen_s,codigo);
    }

    async refreshHistorialActividad(){
        await this.historialActividad.refreshHistorialActividad();
    }



}