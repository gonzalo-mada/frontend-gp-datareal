import { Injectable } from '@angular/core';
import { FormPlanDeEstudioService } from '../form.service';
import { FilesVerEditarPlanEstudioService } from './files.service';
import { BackendPlanesDeEstudiosService } from '../backend.service';
import { PlanDeEstudioMainService } from '../main.service';
import { MessageServiceGP } from '../../../components/message-service.service';
@Injectable({
    providedIn: 'root'
})
export class VerEditarPlanEstudioMainService {
    
    dialogHistorialActividades: boolean = false;

    //array para cada campo de PE
    estados: any[] = [];
    modalidades: any[] = [];
    jornadas: any[] = [];
    regimenes: any[] = [];
    reglamentos: any[] = [];
    articulaciones: any[] = [];

    constructor(
        private backend: BackendPlanesDeEstudiosService,
        private form: FormPlanDeEstudioService,
        private files: FilesVerEditarPlanEstudioService,
        private main: PlanDeEstudioMainService,
        private messageService: MessageServiceGP,
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

}