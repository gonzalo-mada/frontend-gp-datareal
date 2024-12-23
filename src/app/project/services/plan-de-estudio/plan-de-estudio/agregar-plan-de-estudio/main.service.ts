import { Injectable } from '@angular/core';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendPlanesDeEstudiosService } from '../backend.service';
import { Programa } from 'src/app/project/models/programas/Programa';
import { MessageServiceGP } from '../../../components/message-service.service';
import { FormPlanDeEstudioService } from '../form.service';
import { FilesAgregarPlanesDeEstudiosService } from './files.service';

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

    disposition: boolean = true;
    dialogChooseDocsMaestro: boolean = false;
    cod_facultad_selected: number = 0;
    programas: Programa[] = [];
    programa: Programa = {};
    loadedProgramas: boolean = false;

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
        let params = { Cod_facultad: this.cod_facultad_selected }
        const response = await this.backend.getProgramasPorFacultad(params);
        if (response) {
          this.programas = [...response];
          if (this.programas.length === 0 ) {
              this.loadedProgramas = false;
              this.messageService.add({
                key: 'main',
                severity: 'warn',
                detail: `No se encontraron programas para la facultad seleccionada.`
              });
          }else{
              this.messageService.add({
                key: 'main',
                severity: 'info',
                detail: this.programas.length > 1
                  ? `${this.programas.length} programas cargados.`
                  : `${this.programas.length} programa cargado.`
              });
              this.loadedProgramas = true;
          }
        }
    }

    reset(){
        this.cod_facultad_selected = 0;
        this.programas = [];
        this.loadedProgramas = false;
    }

    async openDialogChooseDocsMaestro(){
        await this.files.setContextUploader('create','servicio','agregar-plandeestudio');
        this.dialogChooseDocsMaestro = true;
    }



}