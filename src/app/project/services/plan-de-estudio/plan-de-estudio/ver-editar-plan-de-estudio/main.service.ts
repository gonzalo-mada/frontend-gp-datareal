import { Injectable } from '@angular/core';
import { FormPlanDeEstudioService } from '../form.service';
import { FilesVerEditarPlanEstudioService } from './files.service';
import { BackendPlanesDeEstudiosService } from '../backend.service';
import { PlanDeEstudioMainService } from '../main.service';
import { MessageServiceGP } from '../../../components/message-service.service';
import { ModeDialogPE } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { HistorialActividadService } from '../../../components/historial-actividad.service';
import { ConfirmationService } from 'primeng/api';
@Injectable({
    providedIn: 'root'
})
export class VerEditarPlanEstudioMainService {
    
    dialogUpdateMode!: ModeDialogPE;
    dialogUpdate: boolean = false
    //array para cada campo de PE
    estados: any[] = [];
    modalidades: any[] = [];
    jornadas: any[] = [];
    regimenes: any[] = [];
    reglamentos: any[] = [];
    articulaciones: any[] = [];
    asign_pc: any[] = [];
    certificaciones: any[] = [];
    asignaturas: any[] = [];
    asignaturasToDelete: any[] = [];
    menciones: any[] = [];
    rangos: any[] = [];

    constructor(
        private backend: BackendPlanesDeEstudiosService,
		private confirmationService: ConfirmationService,
        private form: FormPlanDeEstudioService,
        private files: FilesVerEditarPlanEstudioService,
        private main: PlanDeEstudioMainService,
        private messageService: MessageServiceGP,
        private historialActividad: HistorialActividadService
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get cod_plan_estudio(){
        return this.main.cod_plan_estudio
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

    async createFormUpdate(form: ModeDialogPE, collection: CollectionsMongo, isEditableBy: boolean){

        switch (form) {
            case 'reglamento':
                await this.commonFormUpdate(form, collection, false, isEditableBy);
                this.form.fbForm.get('cod_reglamento')!.valueChanges.subscribe( value => {
                    this.form.fbFormUpdate.get('cod_reglamento')?.patchValue(value);
                    this.form.fbFormUpdate.get('description_new')?.patchValue(this.form.selectedReglamento);
                });
            break;
        
            default:
                await this.commonFormUpdate(form, collection, true, isEditableBy);
            break;
        }

    }

    async commonFormUpdate(form: ModeDialogPE, collection: CollectionsMongo, needFiles: boolean, isEditableBy: boolean){
        await this.form.setFormUpdate(form, this.main.planDeEstudio, isEditableBy);
        if (this.mode === 'show' ) this.form.fbFormUpdate.disable();
        this.dialogUpdate = true;
        if (needFiles) {
            await this.files.setContextUploader('edit', 'servicio', 'ver/editar-plandeestudio', collection);
            const response = await this.files.loadDocsWithBinary(this.main.planDeEstudio.cod_plan_estudio!, collection!);
            if (response) {
                this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
            }
        }
        this.form.showButtonSubmitUpdate = true;
    }

    async updateForm(): Promise<ModeDialogPE> {
        const params = await this.setForm();
        if (params) {
            const response = await this.backend.updatePlanDeEstudio(params, this.main.namesCrud);
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
        if (this.dialogUpdateMode !== 'reglamento') {
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                const { files, ...formData } = this.form.fbFormUpdate.value;
                params = {
                    ...formData,
                    docsToUpload: responseUploader.docsToUpload,
                    docsToDelete: responseUploader.docsToDelete,
                    modeUpdate: this.dialogUpdateMode,
                    auxForm: this.main.planDeEstudio
                };
            }
        } else {
            const { files, ...formData } = this.form.fbFormUpdate.value;
            params = {
                ...formData,
                modeUpdate: this.dialogUpdateMode,
                auxForm: this.main.planDeEstudio
            };
        }
        return params; 
    }

    removeAsignatura(asign: any){
        console.log("asign",asign);
        
        const exists = this.asignaturasToDelete.some(asignatura => asignatura.cod_tema === asign.cod_tema);
        if (!exists) (this.asignaturasToDelete.push(asign));
        this.form.setAsignaturasToDelete(this.asignaturasToDelete);
    }

    cancelRemoveAsignatura(index: number){
        this.asignaturasToDelete.splice(index, 1);
        this.form.setAsignaturasToDelete(this.asignaturasToDelete);
    }

    resetTableAsignatura(){
        this.asignaturasToDelete = [];
    }

    async openHistorialActividad(){
        await this.historialActividad.refreshHistorialActividad();
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string, origen_s?: string, codigo?: number){
        this.historialActividad.setOrigen(origen,origen_s,codigo);
    }

    async refreshHistorialActividad(){
        await this.historialActividad.refreshHistorialActividad();
    }

}