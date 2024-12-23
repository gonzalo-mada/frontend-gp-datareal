import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
    providedIn: 'root'
})

export class BackendEstadosAcreditacionService {

    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
    }

    async getEstadosAcreditacion(namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('estados_acreditacion/getEstadosAcreditacion')
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
    
    async insertEstadoAcreditacion(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('estados_acreditacion/insertEstadoAcreditacion'),
                    params
                ),
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

    async updateEstadoAcreditacion(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('estados_acreditacion/updateEstadoAcreditacion'),
                    params
                ),
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

    async deleteEstadoAcreditacion(params: any, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('estados_acreditacion/deleteEstadoAcreditacion',{estadosAcreditacionToDelete: params});
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

    async getDocsMongo(params: any) {
        try {
            return await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('estados_acreditacion/getDocsMongo',false),
                    params
                )
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al obtener documentos.`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

    async getArchiveDoc(id: any, needBinaryString: boolean) {
        try {
            if (needBinaryString) {
                return await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('estados_acreditacion/getArchiveDoc',false),
                    { id , needBinaryString }
                )
            }else{
                return await this.invoker.httpInvokeReport(
                    this.serviceUtils.generateServiceMongo('estados_acreditacion/getArchiveDoc',false), 
                    'pdf', 
                    { id , needBinaryString }
                )
            }
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al descargar documento.`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

}