import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
    providedIn: 'root'
})

export class BackendUnidadAcadService {

    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
    }

    async getFacultades() {
        try {
            return await this.invoker.httpInvoke('facultades/getFacultades')
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al obtener facultades. Intente nuevamente`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

    async getUnidadesAcademicas(namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('unidadesAcademicas/logica_getUnidadesAcademicas')
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
    
    async insertUnidadAcademica(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('unidadesAcademicas/logica_insertUnidadesAcademicas'),
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

    async updateUnidadAcademica(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('unidadesAcademicas/logica_updateUnidadesAcademicas'),
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

    async deleteUnidadAcademica(params: any, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('unidadesAcademicas/logica_deleteUnidadesAcademicas',{unidadAcadToDelete: params});
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al eliminar ${namesCrud.articulo_singular}.`,
                    message: error?.message
                }
            );
        }
    }

    async getDocumentosWithBinary(Cod_unidad_academica: any) {
        try {
            return await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('unidadesAcademicas/getDocumentosWithBinary'),
                    { Cod_unidad_academica }
                )
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al obtener documentos.`,
                    message: error?.message
                }
            );
        }
    }

    async getArchiveDoc(idDocumento: any) {
        try {
            return await this.invoker.httpInvokeReport('unidadesAcademicas/getArchivoDocumento', 'pdf', { id: idDocumento })
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al descargar documento.`,
                    message: error?.message
                }
            );
        }
    }

}