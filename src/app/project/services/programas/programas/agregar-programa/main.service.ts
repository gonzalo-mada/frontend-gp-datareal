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
    dialogSuccessAddPrograma: boolean = false;
    disposition: boolean = true;

    constructor(
        private backend: BackendProgramasService,
        private confirmationService: ConfirmationService,
        private files: FilesAgregarProgramaService,
        private form: FormProgramaService,
        private messageService: MessageServiceGP
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

    chooseDocsMaestro(){
        this.files.setContextUploader('select','servicio','agregar-programa')
        .then(() => {
            this.dialogChooseDocsMaestro = true;
        })
        .catch((error)=> {
            console.log("error al inicializar uploader de docs maestros",error);
        })
    }

    createForm(){
        this.files.setContextUploader('create','servicio','agregar-programa')
        .then(() => {
            this.form.resetForm();
        })
    }

    async insertForm(){
        this.files.setActionUploader('upload')
        .then(async (responseUploader) => {
            if (responseUploader) {
                const { files, ...formData } =  this.form.fbForm.value;
                let params = {
                    ...formData,
                    docsToUpload: responseUploader.docsToUpload
                };
                await this.backend.insertProgramaBackend(params, this.namesCrud)
                .then((response) => {
                    if (response && response.dataWasInserted) {
                        this.form.nameProgramaAdded = response.dataInserted.Nombre_programa;
                        this.form.codProgramaAdded = response.dataInserted.Cod_Programa;
                        this.dialogSuccessAddPrograma = true;
                    }
                })
                .finally(() => {
                    this.files.resetLocalFiles();
                })
            }
        })
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