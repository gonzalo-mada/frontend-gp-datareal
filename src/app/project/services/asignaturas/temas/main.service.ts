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

    programas: any[] = [];
    temas: Tema[] = [];
    tema: Tema = {};

    //VARS ELEMENTS MANTENEDOR (DROPDOWNS FILTER TABLE / SHOWTABLE)
    cod_programa_selected : number = 0;
    showTable: boolean = false

    //MODAL
    dialogForm: boolean = false

    private onActionToBD = new Subject<void>();
    onActionToBD$ = this.onActionToBD.asObservable();

    constructor(
        private backend: BackendTemasService,
        private confirmationService: ConfirmationService,
        private form: FormTemasService,
        private messageService: MessageServiceGP,
        private table: TableTemasService
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
            // case 'rowExpandClick': await this.clickRowExpandTablePrograma(); break;
        }
    }

    reset(){
        this.form.resetForm();
        this.table.resetSelectedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.temas.length, this.namesCrud);
    }

    emitActionToBD(){
        this.onActionToBD.next();
    }

    async getTemasPorPrograma(showCountTableValues: boolean = true): Promise<Tema[]> {
        let params = { cod_programa: this.cod_programa_selected }
        this.temas = await this.backend.getTemasPorPrograma(params, this.namesCrud);
        this.temas.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues) this.countTableValues();
        return this.temas;
    }

    async getProgramasPorFacultad(showCountTableValues: boolean = true, needShowLoading = true){
		let params = { Cod_facultad: this.form.cod_facultad_selected }
		const response = await this.backend.getProgramasPorFacultad(params,needShowLoading);
		if (response) {
		  this.programas = [...response];
		  if (this.programas.length === 0 ) {
            this.form.setStatusControlPrograma(false);
            this.showMessageSinResultadosPrograma('f');
		  }else{
            if (showCountTableValues) {
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.programas.length > 1
                    ? `${this.programas.length} programas cargados.`
                    : `${this.programas.length} programa cargado.`
                });
            }
            this.form.setStatusControlPrograma(true);
            this.clearMessagesSinResultados('f');
		  }
		}
	}

    async createForm(){
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        this.form.setForm('show',this.tema);
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        this.form.setForm('edit',this.tema);
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            const params = this.form.setParamsForm();
            const response = await this.backend.insertTema(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted,'creado',true,false)
                });
                this.emitActionToBD();
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            // if ( !this.wasFilteredTable) await this.setDropdownsFilterTable();
            this.getTemasPorPrograma(false);
            this.reset()
        }
    }

    async updateForm(){
        try {
            const params = this.form.setParamsForm();
            let paramsWithCod = { 
                ...params,
                cod_tema: this.tema.cod_tema
            }
            const response = await this.backend.updateTema(paramsWithCod,this.namesCrud);
            if ( response && response.dataWasUpdated ) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                });
                this.emitActionToBD();
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            // if ( !this.wasFilteredTable) await this.setDropdownsFilterTable();
            this.getTemasPorPrograma(false);
            this.reset();
        }
    }

    async deleteMenciones(dataToDelete: Tema[]){
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
            this.getTemasPorPrograma(false);
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
                await this.deleteMenciones(mencionToDelete);
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
                await this.deleteMenciones(data);
            }
        }) 
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

    resetArraysWhenChangedDropdownFacultad(){
        this.programas = [];
    }
}