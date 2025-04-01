import { Injectable } from '@angular/core';
import { Message } from 'primeng/api';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendAsignaturasService } from '../backend.service';
import { FormAsignaturasService } from '../form.service';
import { FilesAgregarAsignaturasService } from './files.service';
import { MessageServiceGP } from '../../../components/message-service.service';
import { Programa } from 'src/app/project/models/programas/Programa';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { filterDataFromArrayAsync } from 'src/app/project/tools/utils/form.utils';

@Injectable({
    providedIn: 'root'
})

export class AgregarAsignaturaMainService {
    namesCrud: NamesCrud = {
        singular: 'asignatura',
        plural: 'asignaturas',
        articulo_singular: 'la asignatura',
        articulo_plural: 'las asignaturas',
        genero: 'femenino',
    }

    message: any = {
        'facultad': 'No se encontraron programas para la facultad seleccionada.',
        'programa': 'No se encontraron planes de estudios para el programa seleccionado.',
    }

    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];

    programas: Programa[] = [];
    planes: PlanDeEstudio[] = [];

    constructor(
        private backend: BackendAsignaturasService,
        private form: FormAsignaturasService,
        private files: FilesAgregarAsignaturasService,
        private messageService: MessageServiceGP
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

    async getPlanesDeEstudiosPorPrograma(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_Programa: this.form.selected_CodigoPrograma }
        const response = await this.backend.getPlanesDeEstudiosPorPrograma(params,needShowLoading);
        if (response) {
          this.planes = [...response];
          if (this.planes.length === 0 ) {
            this.form.loadedPlanes = false;
            this.showMessageSinResultadosPlanes('f');
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.planes.length > 1
                    ? `${this.planes.length} planes de estudios cargados.`
                    : `${this.planes.length} plan de estudio cargado.`
                });
            }
            this.clearMessagesSinResultados('f');
            this.form.loadedPlanes = true;
          }
        }
        
    }

    reset(){
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.programas = [];
        this.planes = [];
        this.form.loadedProgramas = false;
        this.form.loadedPlanes = false;
    }

    async openDialogChooseDocsMaestro(){
        await this.files.setContextUploader('create','servicio','agregar-asignatura');
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

    resetArraysWhenChangedDropdownFacultad(){
        this.programas = [];
        this.planes = [];
        this.form.loadedPlanes = false
    }

    resetArraysWhenChangedDropdownPrograma(){
        this.planes = [];
    }

    resetFiles(){
        this.files.resetLocalFiles();
    }

    async insertForm(){
        try {
            const valuesSelected = this.form.getValuesSelected();
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                const params = this.form.setParamsForm();
                const { pre_requisitos_selected, secuencialidad_selected, paralelidad_selected, ...filteredForm } = params as { [key: string]: any };

                let paramsChecked = {
                    ...filteredForm,
                    valuesSelected,
                    docsToUpload: responseUploader.docsToUpload,
                    pre_requisitos_selected: await filterDataFromArrayAsync(pre_requisitos_selected),
                    secuencialidad_selected: await filterDataFromArrayAsync(secuencialidad_selected),
                    paralelidad_selected: await filterDataFromArrayAsync(paralelidad_selected),
                };
                const response = await this.backend.insertAsignatura(paramsChecked, this.namesCrud);
                if (response && response.dataWasInserted) {
                    this.form.nameAsignaturaAdded = response.dataInserted.nombre_asignatura;
                    this.form.codAsignaturaAdded = response.dataInserted.cod_asignatura;
                    this.form.dialogSuccessAdd = true;
                    this.form.confirmAdd = false;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}