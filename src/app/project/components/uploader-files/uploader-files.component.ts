import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { docMongoCampus, extras } from 'src/app/project/models/Campus'
import { FileUtils } from '../../tools/utils/file.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-uploader-files',
  templateUrl: './uploader-files.component.html',
  styles: [
  ]
})

export class UploaderFilesComponent implements OnChanges, OnDestroy {

  constructor(private fileUtils: FileUtils, private errorTemplateHandler: ErrorTemplateHandler, private messageService: MessageService){}
  

  @ViewChild('uploader') uploader!: FileUpload;

  @Input() resetQueueUploaderEmitter: EventEmitter<void> = new EventEmitter();
  @Input() files: docMongoCampus[] = [];
  @Input() extrasDocs: any ;
  @Input() triggerUpload : any;

  @Output() filesChange = new EventEmitter<any>();
  @Output() saveOrUpdateDoc = new EventEmitter<any>();
  @Output() deleteDoc = new EventEmitter<any>();

  docsToUpload : any[] = [];

  private subscription!: Subscription;
  

  ngOnChanges(changes: SimpleChanges): void {

    // console.log("changes",changes);
    

    if (changes['triggerUpload'] && (Object.keys(changes['triggerUpload'].currentValue).length !== 0) ) { 
      // console.log("trigger from uploader", this.triggerUpload);
      this.uploadHandler(this.triggerUpload);
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.resetQueueUploaderEmitter.subscribe(() => {
      // console.log("hola fui emitido");
      
      this.resetQueueUploader();
    });

    
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  choose(event: any, callback: any){
    callback();
  }

  onSelect(event: FileSelectEvent, uploader: FileUpload){

    const uniqueFiles = event.currentFiles.filter((newFile: File) => {
      return !this.files.some(fileWithComment => fileWithComment.nombre === newFile.name && fileWithComment.extras.pesoDocumento === newFile.size);
    });

    // console.log("tetetettetetete",uploader.files);
    

    if (uniqueFiles.length == 0) {
      let lastFile = event.currentFiles[event.currentFiles.length - 1 ];
      this.messageService.add({
        key: 'campus',
        severity: 'error',
        detail: `El documento con nombre ${lastFile.name} ya existe.`,
      });
      const fileIndex = uploader.files.findIndex(file => file === lastFile);
      if (fileIndex !== -1) {
        uploader.remove(event.originalEvent, fileIndex);
      }
    }
       
    uniqueFiles.forEach((newFile: File) => {
      this.files.push({nombre: newFile.name , tipo: newFile.type, extras:{pesoDocumento: newFile.size ,comentarios:''} , origFile: newFile});
    });

    this.filesChange.emit(this.files)
  }

  async uploadHandler(event: any){
    const { resolve, reject } = event;
    
    if (this.files.length != 0) {
      //subieron docs
      
      for (let i = 0; i < this.files.length; i++) {
        const doc = this.files[i];
        if (!doc.id) {
          //modo subir nuevo archivo
          // console.log("entre al modo nuevo archivo");
          
          let file: any = await this.fileUtils.onSelectFile(doc.origFile);
  
          const extras = {
            pesoDocumento: doc.extras.pesoDocumento,
            comentarios: doc.extras.comentarios
          };
          const combinedExtras = {
            ...this.extrasDocs,
            ...extras
          }
          let documento: any = {
            nombre: `${file.filename}.${file.format}`,
            archivo: file.binary,
            tipo: file.format,
            extras: combinedExtras,
          };
          this.docsToUpload.push(documento)
          
          
        }else{
          //modo actualizar archivo
          // console.log("entre al modo actualizar archivo");
          const extras = {
            pesoDocumento: doc.extras.pesoDocumento,
            comentarios: doc.extras.comentarios
          };
          const combinedExtras = {
            ...this.extrasDocs,
            ...extras
          }
          
          let documento: any = {
            id: doc.id,
            nombre: `${doc.nombre}`,
            dataBase64: doc.dataBase64,
            tipo: doc.tipo,
            extras: combinedExtras,
          };
          
          this.docsToUpload.push(documento)
        }
      }
      resolve({success: true, docs: this.docsToUpload})
    }else{
      resolve({success: true , docs: this.docsToUpload = [] })
    }
    
    this.filesChange.emit(this.files)
    this.resetQueueUploader();
  }


  onCommentChange(index: number, comment: string) {
    this.files[index].extras.comentarios = comment;
  }

  async onRemoveTemplatingFile(file: any, uploader: FileUpload, index: number) {
    if (file.id) {
      //eliminar de mongo
      try {
        const result: any = await new Promise( (resolve , reject) => {
          this.deleteDoc.emit({file , resolve , reject})
        });
        
        if ( result.success ) {
          // hubo eliminación de doc en mongodb por tanto limpio 
          // uploader.files = uploader.files.filter((f) => f != file.origFile);
          this.files.splice(index, 1);
        }
      
      } catch (error) {
        this.errorTemplateHandler.processError(error, {
          notifyMethod: 'alert',
          message: 'Hubo un error al eliminar el documento. Intente nuevamente.',
        });
      }
    }else{
      //eliminar de memoria navegador
      uploader.files = uploader.files.filter((f) => f != file.origFile);
      this.files.splice(index, 1);
    }

    this.filesChange.emit(this.files)
  }

  resetQueueUploader(){
    // console.log("resetie uploader");
    this.docsToUpload = [];  
    this.uploader.clear();
  }

  test(){
    console.log("this files from test",this.files);
    console.log("files from uploader ",this.uploader._files);
    
  }

}
