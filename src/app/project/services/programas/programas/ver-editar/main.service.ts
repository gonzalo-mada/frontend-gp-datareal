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
import { Campus } from 'src/app/project/models/programas/Campus';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { Router } from '@angular/router';
import { HistorialActividadService } from '../../../components/historial-actividad.service';
import { Message } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})


export class VerEditarProgramaMainService {
    
    programa: Programa = {};
    dialogUpdate: boolean = false
    dialogUpdateMode!: ModeDialog;
    showButtonSubmitUpdate: boolean = false;

    //arrays para update
    campus: Campus[] = [];
    instituciones: any[] = [];
    institucionesSelected: any[] = [];
    tiposProgramas : any[] = [];
    tiposProgramasGrouped : any[] = [];
    estadosMaestros: any[] = [];
    unidadesAcademicasPrograma: any[] = [];
    unidadesAcademicas: any[] = [];
    unidadesAcademicasGrouped: any[] = [];
    tiposGraduaciones: any[] = [];
    certificaciones: any[] = [];
    certificacionesPrograma: any[] = [];
    suspensiones: any[] = [];

    constructor(
        private backend: BackendProgramasService,
        private main: ProgramaMainService,
        private form: FormProgramaService,
        private files: FilesVerEditarProgramaService,
        private messageService: MessageServiceGP,
        private router: Router,
        private historialActividad: HistorialActividadService
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

    get mode(){
        return this.main.mode
    }

    async setModeCrud(mode: ModeForm, data?: Programa | null, from?: CollectionsMongo | null ){
        this.form.modeForm = mode;
        if (data) this.programa = {...data};
        switch (mode) {
            case 'update': await this.updateForm(); break;
            case 'rowExpandClick': await this.clickRowExpandTablePrograma(from!); break;
        }
    }

    reset(){
        this.files.resetLocalFiles();
    }

    async updateForm(): Promise<ModeDialog> {
        const params = await this.setForm();
        if (params) {
            const response = await this.backend.updateProgramaBackend(params, this.main.namesCrud);
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

    async createFormUpdate(form: ModeDialog, collection: CollectionsMongo, isEditableWithPE: boolean){

        switch (form) {
            case 'estado acreditación':
                await this.commonFormUpdate(form, collection, false, isEditableWithPE);
                this.form.fbForm.get('Cod_acreditacion')!.valueChanges.subscribe( value => {
                    this.form.fbFormUpdate.get('Cod_acreditacion')?.patchValue(value);
                    this.form.fbFormUpdate.get('nombreEstadoAcreditacion')?.patchValue(this.form.estadoAcreditacionSiglaSelected);
                });
            break;

            case 'reglamento':
                await this.commonFormUpdate(form, collection, false, isEditableWithPE);
                this.form.fbForm.get('Cod_Reglamento')!.valueChanges.subscribe( value => {
                    this.form.fbFormUpdate.get('Cod_Reglamento')?.patchValue(value);
                    this.form.fbFormUpdate.get('nombreReglamento')?.patchValue(this.form.reglamentoSelected);
                });
            break;
        
            default:
                await this.commonFormUpdate(form, collection, true, isEditableWithPE);
            break;
        }

    }

    async commonFormUpdate(form: ModeDialog, collection: CollectionsMongo, needFiles: boolean, isEditableWithPE: boolean){
        await this.form.setFormUpdate(form, this.programa, isEditableWithPE);
        if (this.mode === 'show' && form !== 'unidades académicas') this.form.fbFormUpdate.disable();
        this.dialogUpdate = true;
        if (needFiles) {
            await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', collection);
            const response = await this.files.loadDocsWithBinary(this.cod_programa , collection!);
            if (response) {
                this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
            }
        }
        this.showButtonSubmitUpdate = true;
    }

    disabledButtonSeleccionar(){
        this.files.disabledButtonSeleccionar();
    }

    enabledButtonSeleccionar(){
        this.files.enabledButtonSeleccionar();
    }

    goToShowPrograma(){
        const cod_programa = this.programa.Cod_Programa;
        this.router.navigate([`/programa/show/${cod_programa}`])
    }

    goToEditPrograma(){
        const cod_programa = this.programa.Cod_Programa;
        this.router.navigate([`/programa/edit/${cod_programa}`])
    }

    updateFilesUploader(){
        this.files.setFiles();
    }

    openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string, origen_s?: string, codigo?: number){
        this.historialActividad.setOrigen(origen,origen_s,codigo);
    }

    async refreshHistorialActividad(){
        await this.historialActividad.refreshHistorialActividad();
    }
    

}