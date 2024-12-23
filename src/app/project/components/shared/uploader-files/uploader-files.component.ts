import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FileUtils } from '../../../tools/utils/file.utils';
import { FileUpload } from 'primeng/fileupload';
import { Subscription } from 'rxjs';
import { UploaderFilesService } from '../../../services/components/uploader-files.service';
import { Context } from '../../../models/shared/Context';
import { MessageServiceGP } from 'src/app/project/services/components/message-service.service';

@Component({
  selector: 'app-uploader-files',
  templateUrl: './uploader-files.component.html',
  styles: [
  ]
})

export class UploaderFilesComponent implements OnInit, OnDestroy {

  @ViewChild('uploader') uploader!: FileUpload;
  @Input() mode: string = '';
  // @Input() context!: Context;

  docsToUpload : any[] = [];
  leyendas: any[] = [
    { label: ' Archivo en línea' , icon:'pi-cloud' , color:'estado-cloud'},
    { label: ' Archivo por subir' , icon:'pi-cloud-upload' , color:'estado-upload'}
  ];
  files: any[] = [];

  dialogVisorPDF: boolean = false;
  doc: any ;
  extrasDocs: any;
  context!: Context;
  totalFileSizeNumber: number = 0;

  private subscription: Subscription = new Subscription();

  constructor(
    private fileUtils: FileUtils,
    private messageService: MessageServiceGP,
    public uploaderFilesService: UploaderFilesService,
  ){}
 
  get disabled(): boolean | null {
    return this.uploaderFilesService.disabledButtonSeleccionarArchivos;
  }

  ngOnInit() {
    this.subscription.add(this.uploaderFilesService.contextUpdate$.subscribe( context => {
      if (context) {
        if (context.module && context.component) {
          // console.log("CONTEXT FROM UPLOADER",context);       
          this.context = context;
        }
      }
    }))
    this.subscription.add(this.uploaderFilesService.actionUploader$.subscribe( updateUploader => {
      // console.log("updateUploader",updateUploader);
      if (updateUploader) {
        switch (updateUploader.action) {
          case 'upload': this.newUploadHandler(updateUploader.resolve! , updateUploader.reject!); break;
          case 'reset': this.resetQueueUploader(this.context);
        }
      }
    }));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  choose(callback: any){
    callback();
  }

  onSelect(event: any, uploader: FileUpload){
    //Valida si archivos seleccionados supera el limite
    if (!this.validateTotalFileSize(uploader)) {
      // Si la validación falla, no continuar con la carga
      return;
    }
    
    // Filtrar los archivos nuevos, verificando que no estén ya en la lista
    const uniqueFiles = uploader._files.filter((newFile: File) => {
      const isDuplicate = this.uploaderFilesService.files.some(fileLoaded => {
        if (this.fileUtils.areFilesEqual(fileLoaded , newFile)) {
          this.messageService.add({
            key: 'main',
            severity: 'error',
            detail: `El documento con nombre ${newFile.name} ya existe.`,
          });
          return true; // El archivo es duplicado
        }
        return false; // No es duplicado
      });
      return !isDuplicate; // Filtra solo los archivos únicos
    });

    uniqueFiles.forEach((newFile: File) => {
      const fileToSelect = {
        nombre: newFile.name , 
        tipo: newFile.type, 
        extras:{pesoDocumento: newFile.size ,comentarios:''} , 
        origFile: newFile , 
        from: this.context.component.collection,
        mode: this.context.mode,
      }
      this.uploaderFilesService.filesSelected.push(fileToSelect);
      this.messageService.add({
        key: 'main',
        severity: 'success',
        detail: `Documento adjuntado exitosamente.`,
      });
    });

    this.uploaderFilesService.updateValidatorFiles('select',this.context, {filesSelected:this.uploaderFilesService.filesSelected});
    uploader._files = [];
  }

  async newUploadHandler(resolve: Function, reject: Function){
    try {
      this.docsToUpload = [];
      if (this.uploaderFilesService.files.length != 0) {
        //subieron docs
        
        for (let i = 0; i < this.uploaderFilesService.files.length; i++) {
          const doc = this.uploaderFilesService.files[i];        
          if (!doc.id) {
            //modo subir nuevo archivo
            
            let file: any = await this.fileUtils.onSelectFile(doc.origFile);
    
            const extras = {
              pesoDocumento: doc.extras.pesoDocumento,
              comentarios: doc.extras.comentarios
            };
  
            let documento: any = {
              nombre: `${file.filename}.${file.format}`,
              archivo: file.binary,
              tipo: file.format,
              extras: extras,
              from: doc.from
            };
            this.docsToUpload.push(documento)
            
          }else{
            //modo actualizar archivo

            const extras = {
              pesoDocumento: doc.extras.pesoDocumento,
              comentarios: doc.extras.comentarios
            };
            
            let documento: any = {
              id: doc.id,
              nombre: `${doc.nombre}`,
              dataBase64: doc.dataBase64,
              tipo: doc.tipo,
              extras: extras,
              from: doc.from
            };
            
            this.docsToUpload.push(documento)
          }
        }
        resolve({success: true, docsToUpload: this.docsToUpload, docsToDelete: this.uploaderFilesService.filesToDelete})
      }else{
        resolve({success: true , docsToUpload: this.docsToUpload = [], docsToDelete: this.uploaderFilesService.filesToDelete })
      }
    } catch (e) {
      reject(e);
    }
  }

  onCommentChange(index: number, comment: string) {
    this.uploaderFilesService.files[index].extras.comentarios = comment;
  }

  onRemoveTemplatingFile(file: any, index: number) {
    if (file.id) {
      this.uploaderFilesService.filesToDelete.push(file);
      this.uploaderFilesService.filesUploaded.splice(index, 1);
      this.uploaderFilesService.updateValidatorFiles('delete-uploaded',this.context, {filesToDelete:  this.uploaderFilesService.filesToDelete , filesUploaded: this.uploaderFilesService.filesUploaded});
    }else{
      //eliminar de memoria navegador
      this.uploaderFilesService.filesSelected = this.uploaderFilesService.filesSelected.filter((f) => f.origFile != file.origFile);
      this.uploaderFilesService.updateValidatorFiles('delete-selected',this.context, {filesSelected:  this.uploaderFilesService.filesSelected});
    }
  }

  cancelDeleteFile(file: any, index: number){
    const fileExists = this.uploaderFilesService.files.some(existingFile => existingFile.nombre === file.nombre);
    if (!fileExists) {
      if (file.id) {
        let totalRemoveTemplating = file.extras.pesoDocumento + this.uploaderFilesService.totalFileSize
        if (totalRemoveTemplating > this.uploaderFilesService.limitValueUploader) {
          this.messageService.add({
            key: 'main',
            severity: 'error',
            detail: `El peso total de archivos adjuntados supera los 10MB.`,
          });
          return
        }
        this.uploaderFilesService.filesUploaded.push(file);
      }
      this.uploaderFilesService.filesToDelete.splice(index, 1);
    } else {
      this.messageService.add({
        key: 'main',
        severity: 'error',
        detail: `El documento con nombre ${file.nombre} no es posible cancelar su eliminación ya que está como documento adjunto.`,
      });
    }
    this.uploaderFilesService.updateValidatorFiles('cancel-delete',this.context, {filesToDelete:this.uploaderFilesService.filesToDelete , filesUploaded:this.uploaderFilesService.filesUploaded});
  }

  resetQueueUploader(context: Context){
    console.log("me llamaron reset queue uploader desde:", context);
    this.docsToUpload = [];  
    this.uploader?.clear();
    // this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.resetUploader();
  }

  showVisorPDF(event: any){   
    this.dialogVisorPDF = true;
    this.doc = event;
  }

  downloadDoc(event: any){
    this.uploaderFilesService.triggerDownloadDoc(this.context, event);
  }

  test(){
    console.log("FILES:",this.uploaderFilesService.files);
    console.log("FILES TO DELETE:",this.uploaderFilesService.filesToDelete);
    console.log("FILES UPLOADED:",this.uploaderFilesService.filesUploaded);
    // console.log("FILES SELECT:",this.uploaderFilesService.filesFromModeSelect);
    // console.log("FILES CREATE OR EDIT:",this.uploaderFilesService.filesFromModeCreateOrEdit);


  }

  test2(event: any){
    console.log("ARCHIVOS EN COLA UPLOADER",event._files);
  }

  test3(){
    console.log("VALOR DE TOTALFILESIZE SERVICE",this.uploaderFilesService.totalFileSize);
  }

  test4(){
    console.log("totalFileSizeNumber",this.totalFileSizeNumber);
    
  }

  validateTotalFileSize(uploader: FileUpload) {
    // Inicializa el tamaño total a partir de los archivos previamente subidos
    this.totalFileSizeNumber = this.uploaderFilesService.filesUploaded.reduce((total, file) => total + file.extras.pesoDocumento, 0) + this.uploaderFilesService.filesSelected.reduce((total, file) => total + file.extras.pesoDocumento, 0);
    
    // Añadir el tamaño de los archivos nuevos que el usuario intenta subir
    let newFilesSize = 0;
    for (let i = 0; i < uploader._files.length; i++) {
      const file = uploader._files[i];
      newFilesSize += file.size;
    }
    this.totalFileSizeNumber += newFilesSize;

    // Verificar si el tamaño total excede el límite de 10 MB
    if (this.totalFileSizeNumber > this.uploaderFilesService.limitValueUploader) {
      this.messageService.add({
        key: 'main',
        severity: 'error',
        detail: `El peso total de archivos adjuntados supera los 10MB.`,
      });
  
      if (this.uploaderFilesService.totalFileSize === 0) {
        // este es el caso cuando el usuario seleccionó muchos archivos al comienzo y el total superó el limite
        uploader._files = [];
      }else{
        uploader._files = uploader._files.filter(file => {
          // Verifica si el archivo está en this.uploaderFilesService.files
          return this.uploaderFilesService.files.some(serviceFile => serviceFile.origFile === file);
        });
      }
      return false; 
    }
  
    return true;
  }
}
