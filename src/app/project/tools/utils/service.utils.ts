import { Injectable } from '@angular/core';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MessageServiceGP } from '../../services/components/message-service.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceUtils {
  constructor(private messageService: MessageServiceGP, private errorTemplateHandler: ErrorTemplateHandler){}

  public async checkResponse(response: any, namesCrud: NamesCrud) {
    //esta funcion muestra un toast de color AMARILLO cuando el error es controlado.
    if ( response.withControlledErrors ) {
      this.messageService.clear();
      this.messageService.add({
        key: 'main',
        severity: 'warn',
        summary:  `Error al ${response.method} ${namesCrud.singular}`,
        detail: response.error.message.message,
        sticky: true
      });
      this.errorTemplateHandler.processError(response.error, {
        notifyMethod: 'none',
      });
      return response
    }else{
      return response
    }
  }

  public generateServiceMongo(
    nameService: string, 
    loading: boolean = true, 
    retry: number = 0, 
    timeout: number = 80000
  ){
    return {
      service: nameService,
      loading: loading,
      retry: retry,
      timeout: timeout
    };
  }
  
  public countTableValues(value: number, namesCrud: NamesCrud){
    this.messageService.clear();
    this.messageService.add({
      key: 'main',
      severity: 'info',
      detail: value !== 1
       ? `${value} ${namesCrud.plural} ${namesCrud.genero === 'masculino' ? 'listados' : 'listadas'}.`
       : `${value} ${namesCrud.singular} ${namesCrud.genero === 'masculino' ? 'listado' : 'listada'}.`
    });
  }
}