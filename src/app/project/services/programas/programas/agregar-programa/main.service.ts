import { Injectable } from '@angular/core';
import { FilesAgregarProgramaService } from './files.service';
import { FormProgramaService } from '../form.service';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendProgramasService } from '../backend.service';
import { MessageServiceGP } from '../../../components/message-service.service';
import { ConfirmationService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})

export class AgregarProgramaMainService {

    namesCrud: NamesCrud = {
        singular: 'programa',
        plural: 'programas',
        articulo_singular: 'el programa',
        articulo_plural: 'los programas',
        genero: 'masculino'
    };

    dialogChooseDocsMaestro: boolean = false;
    disposition: boolean = true;

    constructor(
        private backend: BackendProgramasService,
        private confirmationService: ConfirmationService,
        private files: FilesAgregarProgramaService,
        private form: FormProgramaService,
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm){
        this.form.modeForm = mode;
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'insert': await this.insertForm(); break;
        }
    }

    reset(){
        this.files.resetLocalFiles();
        this.form.resetForm();
    }

    async createForm(){
        await this.files.setContextUploader('create','servicio','agregar-programa');
        this.reset();
    }

    async openDialogChooseDocsMaestro(){
        await this.files.setContextUploader('create','servicio','agregar-programa');
        this.dialogChooseDocsMaestro = true;
    }

    async insertForm(){
        try {
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                const { files, ...formData } =  this.form.fbForm.value;
                let params = {
                    ...formData,
                    docsToUpload: responseUploader.docsToUpload
                };
                const response = await this.backend.insertProgramaBackend(params, this.namesCrud);
                if (response && response.dataWasInserted) {
                    this.form.nameProgramaAdded = response.dataInserted.Nombre_programa;
                    this.form.codProgramaAdded = response.dataInserted.Cod_Programa;
                    this.form.dialogSuccessAddPrograma = true;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    haveDirectorAlterno(){
        setTimeout(() => {
          this.confirmationService.confirm({
            header: "Director(a) alterno(a)",
            message: "¿El programa cuenta con director(a) alterno(a)?",
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-question-circle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-success p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: () => {
              this.form.haveDirectorAlterno(true)
            },
            reject: () => {
              this.form.haveDirectorAlterno(false)
            }
          })
        }, 700);
    }
}