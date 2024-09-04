import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ActionsCrudService } from '../../services/actions-crud.service';

@Component({
  selector: 'app-dialog-visor-pdf',
  templateUrl: './dialog-visor-pdf.component.html',
  styles: [
  ]
})
export class DialogVisorPdfComponent implements OnChanges {
  
  @Input() visible: boolean = false;
  @Input() archivo!: any;
  @Input() id!: string;
  @Output() visibleChange = new EventEmitter<boolean>();

  nameArchive : string = '';

  constructor(private actionsCrudService : ActionsCrudService, private commonUtils : CommonUtils){}

  ngOnChanges(changes: SimpleChanges): void {
   
    if (changes['archivo']){
      if (!this.archivo.id) {
        this.nameArchive = this.archivo.name;
        
        setTimeout(() => {
          this.commonUtils.visorPDF(this.archivo, this.id, '800px', '100%', true);
        }, 100);

      }else{

        this.nameArchive = this.archivo.nombre;

        const pdfBlob = this.convertBase64ToBlob(this.archivo.dataBase64);
        setTimeout(() => {
          this.commonUtils.visorPDF(pdfBlob, this.id, '800px', '100%', true);
        }, 100);

      }
    }
  }

  download() {
    if (this.archivo.id) {
      this.commonUtils.downloadBlob(
        this.fileToBlob(this.archivo),
        this.archivo.nombre,
      );
    }else{
      this.commonUtils.downloadBlob(
        this.fileToBlob(this.archivo),
        this.archivo.name,
      );
    }
  }

  downloadMongo(){
    this.actionsCrudService.triggerDownloadDocUploaderAction(this.archivo)
  }

  print() {
    if (this.archivo) {
      var iframe = document.getElementById(
        `pdfvisor_${this.id}`,
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    }
  }

  private fileToBlob(file: any) {
    if (this.archivo.id) {
      return new Blob([file], { type: file.tipo });
    }else{
      return new Blob([file], { type: file.type });
    }
  }

  onChange(){
    this.visible == false ? true : false;
    this.visibleChange.emit(this.visible);
  }

  convertBase64ToBlob(base64String: string, contentType = 'application/pdf'): Blob {
    const byteString = window.atob(base64String);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: contentType });
  }
  
}
