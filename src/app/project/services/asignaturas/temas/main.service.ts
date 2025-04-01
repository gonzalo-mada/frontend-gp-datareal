import { Injectable } from '@angular/core';
import { ConfirmationService, Message } from 'primeng/api';
import { Subject } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendTemasService } from './backend.service';
import { FormTemasService } from './form.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { TableTemasService } from './table.service';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { Tema } from 'src/app/project/models/asignaturas/Tema';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { HistorialActividadService } from '../../components/historial-actividad.service';
import { LoadinggpService } from '../../components/loadinggp.service';
import { FacultadesMainService } from '../../programas/facultad/main.service';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';

@Injectable({
    providedIn: 'root'
})

export class TemasMainService {

    namesCrud: NamesCrud = {
        singular: 'tema',
        plural: 'temas',
        articulo_singular: 'el tema',
        articulo_plural: 'los temas',
        genero: 'masculino'
    }

    message: any = {
        'facultad': 'No se encontraron programas para la facultad seleccionada.',
        'programa': 'No se encontraron temas para el programa seleccionado.',
    }

    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];

    programas_postgrado: any[] = [];
    temas: Tema[] = [];
    tema: Tema = {};

    //VARS PARA FILTROS DE TABLA
    cod_facultad_selected_notform: number = 0;
    cod_programa_postgrado_selected_notform: number = 0;
    disabledDropdownPrograma: boolean = true
    programas_postgrado_notform: any[] = [];

    cod_programa_selected : number = 0;
    showTable: boolean = false

    //MODAL
    dialogForm: boolean = false
    needUpdateHistorial: boolean = false;
    openedFromPageMantenedor: boolean = false;

    private onActionToBD = new Subject<void>();
    onActionToBD$ = this.onActionToBD.asObservable();

    constructor(
        private backend: BackendTemasService,
        private confirmationService: ConfirmationService,
        private form: FormTemasService,
        private messageService: MessageServiceGP,
        private table: TableTemasService,
        private systemService: LoadinggpService,
        private historialActividad: HistorialActividadService,
        private mainFacultad: FacultadesMainService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Tema | null){
        this.form.modeForm = mode;
        if (data) this.tema = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'historial': await this.openHistorialActividad(); break;
            // case 'rowExpandClick': await this.clickRowExpandTablePrograma(); break;
        }
    }

    async reset(){
        this.form.resetForm();
        this.table.resetSelectedRows();
        this.clearAllMessages();
    }

    resetDropdownsFilterTable(){
        this.clearAllMessages();
        this.disabledDropdownPrograma = true
        this.cod_facultad_selected_notform = 0;
        this.cod_programa_postgrado_selected_notform = 0;
        this.programas_postgrado_notform = [];
        this.showTable = false
    }

    resetWhenChangedDropdownFacultadNotForm(){
        this.showTable = false
        this.disabledDropdownPrograma = true;
        this.cod_programa_postgrado_selected_notform = 0;
    }

    resetArraysWhenChangedDropdownFacultad(){
        this.programas_postgrado = [];
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.temas.length, this.namesCrud);
    }

    emitActionToBD(){
        this.onActionToBD.next();
    }

    async getProgramasPorFacultad(showCountTableValues: boolean = true, needShowLoading = true){
		let params = { Cod_facultad: this.form.cod_facultad_selected }
		const response = await this.backend.getProgramasPorFacultad(params,needShowLoading);
		if (response) {
		  this.programas_postgrado = [...response];
		  if (this.programas_postgrado.length === 0 ) {
            this.form.setStatusControlPrograma(false);
            this.showMessageSinResultadosPrograma('f');
		  }else{
            if (showCountTableValues) {
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.programas_postgrado.length > 1
                    ? `${this.programas_postgrado.length} programas cargados.`
                    : `${this.programas_postgrado.length} programa cargado.`
                });
            }
            this.form.setStatusControlPrograma(true);
            this.clearMessagesSinResultados('f');
		  }
		}
	}

    //INICIO FUNCIONES PARA TABLA DE MANTENEDOR
    async getProgramasPorFacultadNotForm(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_facultad: this.cod_facultad_selected_notform }
        const response = await this.backend.getProgramasPorFacultad(params,needShowLoading);
        if (response) {
            this.programas_postgrado_notform = [...response];
            if (this.programas_postgrado_notform.length === 0 ) {
                this.disabledDropdownPrograma = true;
                this.showTable = false
                this.showMessageSinResultadosPrograma('m');
            }else{
            if (showCountTableValues){
                this.messageService.add({
                    key: 'main',
                    severity: 'info',
                    detail: this.programas_postgrado_notform.length > 1
                    ? `${this.programas_postgrado_notform.length} programas cargados.`
                    : `${this.programas_postgrado_notform.length} programa cargado.`
                });
            }
            this.clearMessagesSinResultados('m');
            this.disabledDropdownPrograma = false;
            }
        }
    }

    async getTemasPorProgramaNotForm(showCountTableValues: boolean = true): Promise<Tema[]> {
        let valuesPrincipalControls = {cod_facultad: this.cod_facultad_selected_notform, cod_programa: this.cod_programa_postgrado_selected_notform}
        let params = { cod_programa: this.cod_programa_postgrado_selected_notform, valuesPrincipalControls }
        this.temas = await this.backend.getTemasPorPrograma(params, this.namesCrud);
        this.temas.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues && this.temas.length !== 0) this.countTableValues();
        return this.temas;
    }
    //FIN FUNCIONES PARA TABLA DE MANTENEDOR


    async createForm(){
        await this.reset();
        await this.setPrincipalsControls();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        this.form.setForm('show',this.tema);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        this.form.setForm('edit',this.tema);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            const data_log = await this.setDataToLog();
            const data_params = this.form.setParamsForm();
            let params = { ...data_params, data_log }
            const response = await this.backend.insertTema(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted.nombre_tema,'creado',true,false)
                });
                this.emitActionToBD();
                this.setDropdownsFilterTable(response.dataInserted)

            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset()
        }
    }

    async updateForm(){
        try {
            const data_log = await this.setDataToLog(true);
            const params = this.form.setParamsForm();
            let paramsWithCod = { 
                ...params,
                data_log,
                cod_tema: this.tema.cod_tema
            }
            const response = await this.backend.updateTema(paramsWithCod,this.namesCrud);
            if ( response && response.dataWasUpdated && response.dataWasUpdated !== 0) {
                if (response.dataWasUpdated === 1) {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud, response.dataUpdated, 'actualizado', true, false)
                    });
                    this.emitActionToBD();
                }else{
                    this.messageService.add({
                        key: 'main',
                        severity: 'info',
                        detail: generateMessage(this.namesCrud, response.dataUpdated, 'actualizado', false, false)
                    });
                }
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: Tema[]){
        try {
            const response = await this.backend.deleteTema(dataToDelete,this.namesCrud);
            if (response && response.notDeleted.length !== 0) {
                for (let i = 0; i < response.notDeleted.length; i++) {
                    const element = response.notDeleted[i];
                    this.messageService.add({
                        key: 'main',
                        severity: 'warn',
                        summary:  `Error al eliminar ${this.namesCrud.singular}`,
                        detail: element.messageError,
                        sticky: true
                    });
                }
            }
            if (response && response.deleted.length !== 0) {
                const message = mergeNames(null,response.deleted,false,'data');
                if ( response.deleted.length > 1 ){
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,message,'eliminados',true, true)
                });
                }else{
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud,message,'eliminado',true, false)
                    });
                }
                this.emitActionToBD();
            }
        } catch (error) {
            console.log(error);
        }finally{
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.tema.nombre_tema}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let mencionToDelete = []
                mencionToDelete.push(this.tema);
                await this.deleteRegisters(mencionToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'nombre_tema');
        this.confirmationService.confirm({
            header: "Confirmar",
            message: `Es necesario confirmar la acción para eliminar ${message}. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                await this.deleteRegisters(data);
            }
        }) 
    }

    async setDropdownsFilterTable(dataInserted: any){
        //esta funcion permite setear automaticamente los dropdowns que están en la pagina del mantenedor
        if (this.openedFromPageMantenedor) {
            this.disabledDropdownPrograma = false;
            this.cod_facultad_selected_notform = dataInserted.cod_facultad;
            this.cod_programa_postgrado_selected_notform = dataInserted.cod_programa;
            await this.getProgramasPorFacultadNotForm(false);
            await this.getTemasPorProgramaNotForm();
        }
    }

    async setDropdownsAndTablesForm(){
        //funcion para setear automaticamente los dropdowns principales del formulario 
        this.systemService.loading(true);
        await this.setPrincipalsControls();
        this.form.setDisabledPrincipalControls();
        this.systemService.loading(false);
    }

    async setPrincipalsControls(){
        console.log("this.form.dataExternal",this.form.dataExternal);
        
        if (this.form.modeForm !== 'create') {
            console.log("if setPrincipalsControls");
            
            await Promise.all([
                this.getProgramasPorFacultad(false,false),
            ]);

        }else{
            console.log("else setPrincipalsControls");

            if (this.form.dataExternal.data === true) {
                this.form.setDataExternal(this.form.dataExternal);
                this.form.setValuesVarsByDataExternal();
                await Promise.all([
                    this.getProgramasPorFacultad(false,false),
                    
                ]);
                this.form.setControlsFormByDataExternal();
            }
        }
    }

    clearAllMessages(){
        this.messagesMantenedor = [];
        this.messagesFormulario = [];
    }

    clearMessagesSinResultados(key: 'm' | 'f'){
        key === 'm' ? this.messagesMantenedor = [] : this.messagesFormulario = [];
    }

    showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa' ) {
        const message = { severity: 'warn', detail: this.message[messageType] };
        key === 'm' ? this.messagesMantenedor = [message] : this.messagesFormulario = [message];
        this.messageService.add({
            key: 'main',
            severity: 'warn',
            detail: this.message[messageType]
        });
    }

    showMessageSinResultadosPrograma(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'facultad')
    }

    showMessageSinResultados(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'programa')
    }

    setVarsNotFormByDataExternal(dataExternal: DataExternal){
        this.cod_facultad_selected_notform = dataExternal.cod_facultad!;
        this.cod_programa_postgrado_selected_notform = dataExternal.cod_programa!;
    }

    async openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }

    setNeedUpdateHistorial(need: boolean){
        this.openedFromPageMantenedor = need;
        this.needUpdateHistorial = need;
    }

    async setDataToLog(needAux = false){
        const dataPrincipalControls = await this.form.getDataPrincipalControls();
        let dataToLog_aux ;
        if (needAux) {
            //se necesita obtener valores anteriores para el log
            let facultadSelected_aux = this.mainFacultad.facultades.find( f => f.Cod_facultad === this.tema.cod_facultad);
            let programaSelected_aux = this.programas_postgrado.find( f => f.Cod_Programa === this.tema.cod_programa);
            dataToLog_aux = { facultadSelected_aux: facultadSelected_aux!.Descripcion_facu, programaSelected_aux: programaSelected_aux!.Nombre_programa_completo }
        }
        let facultadSelected = this.mainFacultad.facultades.find( f => f.Cod_facultad === dataPrincipalControls.cod_facultad);
        let programaSelected = this.programas_postgrado.find( f => f.Cod_Programa === dataPrincipalControls.cod_programa);
        let dataToLog = { facultadSelected: facultadSelected!.Descripcion_facu, programaSelected: programaSelected!.Nombre_programa_completo }

        if (needAux) {
            return { ...dataToLog_aux , ...dataToLog}
        }else{
            return dataToLog
        }
    }
}