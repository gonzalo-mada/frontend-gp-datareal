import { Injectable } from '@angular/core';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendPlanesDeEstudiosService } from '../backend.service';
import { Programa } from 'src/app/project/models/programas/Programa';
import { MessageServiceGP } from '../../../components/message-service.service';
import { FormPlanDeEstudioService } from '../form.service';
import { FilesAgregarPlanesDeEstudiosService } from './files.service';
import { Message } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})

export class AgregarPlanDeEstudioMainService {

    namesCrud: NamesCrud = {
        singular: 'plan de estudio',
        plural: 'planes de estudios',
        articulo_singular: 'el plan de estudio',
        articulo_plural: 'los planes de estudios',
        genero: 'masculino',
    };

    message: any = {
        'facultad': 'No se encontraron programas para la facultad seleccionada.',
        'programa': 'No se encontraron planes de estudios para el programa seleccionado.',
    }
    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];

    pendingForms: any[] = [
        { title: 'Continuar con Asignaturas', subtitle: 'Permite asociar asignaturas al plan de estudio recién agregado', icon: 'pi pi-book', isConditional: false, form: 'asignatura', needAsign: false },
        { title: 'Continuar con Certificación intermedia', subtitle: 'Permite asociar certificaciones intermedias con asignaturas al plan de estudio recién agregado', icon: 'fa fa-stamp', isConditional: true, form: 'tiene_certificacion', needAsign: true },
        { title: 'Continuar con Articulación', subtitle: 'Permite crear articulaciones entre programas de pregrado y el plan de estudio recién agregado', icon: 'fa fa-handshake', isConditional: true, form: 'tiene_articulacion', needAsign: true },
        { title: 'Continuar con Asignaturas plan común', subtitle: 'Permite asociar asignaturas del plan de estudio recien agregado a un plan común', icon: 'fa fa-arrows-turn-to-dots', isConditional: true, form: 'tiene_plan_comun', needAsign: true },
        { title: 'Continuar con Rangos de aprobación', subtitle: 'Permite asociar rangos de aprobación a un plan de estudio recién agregado', icon: 'fa fa-list-ol', isConditional: true, form: 'tiene_rango_aprob_g', needAsign: false },
        { title: 'Continuar con Menciones', subtitle: 'Permite asociar menciones a un plan de estudio recién agregado', icon: 'fa fa-diagram-project', isConditional: true, form: 'tiene_mencion', needAsign: true },
    ]


    programas: Programa[] = [];
    programa: Programa = {};


    constructor(
        private backend: BackendPlanesDeEstudiosService,
        private form: FormPlanDeEstudioService,
        private files: FilesAgregarPlanesDeEstudiosService,
        private messageService: MessageServiceGP,
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    async getProgramasPorFacultad(){
        let params = { Cod_facultad: this.form.selected_CodigoFacultad }
        const response = await this.backend.getProgramasPorFacultad(params);
        if (response) {
          this.programas = [...response];
          if (this.programas.length === 0 ) {
              this.form.loadedProgramas = false;
              this.showMessageSinResultadosPrograma('f');
          }else{
              this.messageService.add({
                key: 'main',
                severity: 'info',
                detail: this.programas.length > 1
                  ? `${this.programas.length} programas cargados.`
                  : `${this.programas.length} programa cargado.`
              });
              this.form.loadedProgramas = true;
              this.clearMessagesSinResultados('f');
          }
        }
    }

    reset(){
        this.programas = [];
        this.form.loadedProgramas = false;
    }

    async openDialogChooseDocsMaestro(){
        await this.files.setContextUploader('create','servicio','agregar-plandeestudio');
        this.form.dialogChooseDocsMaestro = true;
    }

    clearAllMessages(){
        this.messagesMantenedor = [];
        this.messagesFormulario = [];
    }

	clearMessagesSinResultados(key: 'm' | 'f'){
        key === 'm' ? this.messagesMantenedor = [] : this.messagesFormulario = [];
    }

    showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa') {
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

    showMessageSinResultadosPlanes(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'programa')
    }

    async insertForm(){
        try {
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                const params = this.form.setParamsForm();
                let paramsChecked = {
                    ...params,
                    docsToUpload: responseUploader.docsToUpload
                };
                const response = await this.backend.insertPlanDeEstudio(paramsChecked, this.namesCrud);
                if (response && response.dataWasInserted) {
                    console.log("response",response);
                    this.form.namePlanDeEstudioAdded = response.dataInserted.nombre_plan_estudio;
                    this.form.codPlanDeEstudioAdded = response.dataInserted.cod_plan_estudio;
                    this.form.dataToPendingForm = {
                        data: true,
                        cod_plan_estudio: response.dataInserted.cod_plan_estudio,
                        cod_programa: response.dataInserted.cod_programa,
                        cod_facultad: response.dataInserted.cod_facultad,
                        show: false
                    }
                    this.form.showCardForm = false;
                    this.form.confirmAdd = false;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }



}