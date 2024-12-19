import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
    providedIn: 'root'
})
export class BackendMencionesService {

  constructor(
    private errorTemplateHandler: ErrorTemplateHandler,
    private invoker: InvokerService, 
    private serviceUtils: ServiceUtils
  ){}

  countTableRegisters(value: number, namesCrud: NamesCrud){
    this.serviceUtils.countTableValues(value,namesCrud);
  }

  // Métodos CRUD para menciones
  async getMencionesBackend(namesCrud: NamesCrud) {
    try {
        return await this.invoker.httpInvoke('menciones/getMenciones');
    } catch (error: any) {
        this.errorTemplateHandler.processError(error, {
            notifyMethod: 'alert',
            summary: `Error al obtener ${namesCrud.articulo_plural}. Intente nuevamente.`,
            message: error?.message || error.detail.error.message.message
        });
    }
  }

  async insertMencionBackend(params: any, namesCrud: NamesCrud) {
    try {
        return this.serviceUtils.checkResponse(
            await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('menciones/insertMencion'),
                params
            ),
            namesCrud
        );
    } catch (error: any) {
        this.errorTemplateHandler.processError(error, {
            notifyMethod: 'alert',
            summary: `Error al agregar ${namesCrud.articulo_singular}.`,
            message: error?.message || error.detail.error.message.message
        });
    }
}

async updateMencionBackend(params: any, namesCrud: NamesCrud) {
  try {
      return this.serviceUtils.checkResponse(
          await this.invoker.httpInvoke(
              this.serviceUtils.generateServiceMongo('menciones/updateMencion'),
              params
          ),
          namesCrud
      );
  } catch (error: any) {
      this.errorTemplateHandler.processError(error, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${namesCrud.articulo_singular}.`,
          message: error?.message || error.detail.error.message.message
      });
  }
}

async deleteMencionBackend(params: any, namesCrud: NamesCrud) {
  try {
      return await this.invoker.httpInvoke('menciones/deleteMencion', {
          reglamentoToDelete: params
      });
  } catch (error: any) {
      this.errorTemplateHandler.processError(error, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${namesCrud.singular}`,
          message: error?.message || error.detail.error.message.message
      });
  }
}

  // Servicios relacionados con documentos en MongoDB
  async getDocumentosWithBinary(Cod_mencion: number) {
    try {
        return await this.invoker.httpInvoke(
            this.serviceUtils.generateServiceMongo('menciones/getDocumentosWithBinary', false),
            { Cod_mencion }
        );
    } catch (error: any) {
        this.errorTemplateHandler.processError(error, {
            notifyMethod: 'alert',
            summary: 'Error al obtener documentos',
            message: error?.message || error.detail.error.message.message
        });
    }
}

async getArchiveDoc(idDocumento: any) {
    try {
        return await this.invoker.httpInvokeReport(
            'menciones/getArchiveDoc',
            'pdf',
            { id: idDocumento }
        );
    } catch (error: any) {
        this.errorTemplateHandler.processError(error, {
            notifyMethod: 'alert',
            summary: 'Error al descargar documento',
            message: error?.message || error.detail.error.message.message
        });
    }
}

}
