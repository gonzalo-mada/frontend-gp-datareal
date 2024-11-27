import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
    providedIn: 'root'
})

export class BackendReglamentosService {
    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
    }

    // Métodos CRUD para reglamentos
    async getReglamentosBackend(namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('reglamentos/getReglamentos');
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: `Error al obtener ${namesCrud.articulo_plural}. Intente nuevamente.`,
                message: error?.message || error.detail.error.message.message
            });
        }
    }
    
    async insertReglamentoBackend(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('reglamentos/insertReglamento'),
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
    
    async updateReglamentoBackend(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('reglamentos/updateReglamento'),
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
    
    async deleteReglamentoBackend(params: any, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('reglamentos/deleteReglamentos', {
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
    async getDocumentosWithBinary(Cod_reglamento: number) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('reglamentos/getDocumentosWithBinary', false),
                { Cod_reglamento }
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
                'reglamentos/getArchiveDoc',
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