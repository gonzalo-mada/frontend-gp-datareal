import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
    providedIn: 'root'
})

export class BackendCampusService {

    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
    }

    async getCampus(namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('campus/logica_getCampus')
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
    
    async insertCampus(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('campus/logica_insertCampus'),
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

    async updateCampus(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('campus/logica_updateCampus'),
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

    async deleteCampus(params: any, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('campus/logica_deleteCampus',{campusToDelete: params});
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

    async getDocsMongo(Cod_campus: any) {
        try {
            return await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('campus/getDocsMongo', false),
                    { Cod_campus }
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
                    this.serviceUtils.generateServiceMongo('campus/getArchiveDoc',false),
                    { id , needBinaryString }
                )
            }else{
                return await this.invoker.httpInvokeReport(
                    this.serviceUtils.generateServiceMongo('campus/getArchiveDoc',false), 
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