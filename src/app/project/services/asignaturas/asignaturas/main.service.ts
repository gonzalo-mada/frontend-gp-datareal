import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendAsignaturasService } from './backend.service';
import { ConfirmationService } from 'primeng/api';
import { FormAsignaturasService } from './form.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { Router } from '@angular/router';
import { TableAsignaturasService } from './table.service';
import { Asignatura } from 'src/app/project/models/asignaturas/Asignatura';

@Injectable({
    providedIn: 'root'
})


export class AsignaturasMainService {

    namesCrud: NamesCrud = {
        singular: 'asignatura',
        plural: 'asignaturas',
        articulo_singular: 'la asignatura',
        articulo_plural: 'las asignaturas',
        genero: 'femenino',
    }
    mode: ModeForm;
    asignaturas: Asignatura[] = [];
    asignatura: Asignatura = {};

    constructor(
        private backend: BackendAsignaturasService,
        private confirmationService: ConfirmationService,
        private form: FormAsignaturasService,
        private messageService: MessageServiceGP,
        private router: Router,
        private table: TableAsignaturasService
    ){}

    async setModeCrud(mode: ModeForm, data?: Asignatura | null){
        this.form.modeForm = mode;
        if (data) this.asignatura = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            // case 'show': this.showForm(); break;
            // case 'edit': this.editForm(); break;
            // case 'delete': this.openConfirmationDelete(); break;
            // case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
        }
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.asignaturas.length, this.namesCrud);
    }
    
    reset(){
        //todo
    }

    createForm(){
        this.router.navigate([`/asignaturas/add/`])
    }
}