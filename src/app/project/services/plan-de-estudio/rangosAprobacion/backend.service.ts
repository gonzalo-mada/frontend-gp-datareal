import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
  providedIn: 'root'
})
export class BackendRangosAGService {

  constructor(
    private errorTemplateHandler: ErrorTemplateHandler,
    private invoker: InvokerService,
    private serviceUtils: ServiceUtils
  ) { }

  countTableRegisters(value: number, namesCrud: NamesCrud){
    this.serviceUtils.countTableValues(value,namesCrud);
  }

  async getRangosAprobacion(namesCrud: NamesCrud) {
    try {
      return await this.invoker.httpInvoke('rangoAprobacion/getRangoAprobacion');
    } catch (error: any) {
      this.errorTemplateHandler.processError(
        error, 
        {
          notifyMethod: 'alert',
          summary: `Error al obtener ${namesCrud.articulo_singular}. Intente nuevamente`,
          message: error?.message || error.detail.error.message.message
        }
      );
    }
  }

  async insertRangoAprobacion(params: any, namesCrud: NamesCrud) {
    try {
      const response = await this.serviceUtils.checkResponse(
        await this.invoker.httpInvoke('rangoAprobacion/insertRangoAprobacion', params),
        namesCrud
      );
      return response;
    } catch (error: any) {
      this.errorTemplateHandler.processError(
        error, 
        {
          notifyMethod: 'alert',
          summary: `Error al agregar ${namesCrud.articulo_singular}.`,
          message: error?.message || error.detail.error.message.message
        }
      );
    }
  }

  async updateRangoAprobacion(params: any, namesCrud: NamesCrud) {
    try {
      const response = await this.serviceUtils.checkResponse(
        await this.invoker.httpInvoke('rangoAprobacion/updateRangoAprobacion', params),
        namesCrud
      );
      return response;
    } catch (error: any) {
      this.errorTemplateHandler.processError(
        error, 
        {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${namesCrud.articulo_singular}.`,
          message: error?.message || error.detail.error.message.message
        }
      );
    }
  }

  async deleteRangoAprobacion(params: any, namesCrud: NamesCrud) {
    try {
      return await this.invoker.httpInvoke('rangoAprobacion/deleteRangoAprobacion', { rangoToDelete: params });
    } catch (error: any) {
      this.errorTemplateHandler.processError(
        error, 
        {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${namesCrud.articulo_singular}.`,
          message: error?.message || error.detail.error.message.message
        }
      );
    }
  }

}
