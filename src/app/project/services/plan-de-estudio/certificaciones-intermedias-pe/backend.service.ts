import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
    providedIn: 'root'
})

export class BackendCertifIntermediasPEService {

    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
    }

    async getProgramasPostgrado(loading = true) {
        try {
            return await this.invoker.httpInvoke({service: 'programas/getProgramas', loading: loading});
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener programas. Intente nuevamente.`,
                }
            );
        }
    }

    async getProgramasPostgradoConCertifIntermediaPorFacultad(params: any,loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getProgramasPostgradoConCertifIntermediaPorFacultad', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener programas con certificación intermedia. Intente nuevamente.`,
                }
            );
        }
    }

    async getPlanesDeEstudiosColumnaPorPrograma(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getPlanesDeEstudiosColumnaPorPrograma', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener planes de estudios por programa seleccionado. Intente nuevamente.`,
                }
            );
        }
    }
    
    async getAsignaturasSimplificatedConTemaAgrupado(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getAsignaturasSimplificatedConTemaAgrupado', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener asignaturas por plan de estudio seleccionado. Intente nuevamente.`,
                }
            );
        }
    }

    async getCertificacionIntermedia_Prog(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('certificacionIntermediaPE/getCertificacionIntermedia_Prog', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener certificaciones intermedias por programa seleccionado. Intente nuevamente.`,
                }
            );
        }
    }

    async getProgramasPorFacultad(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('programas/getProgramasPorFacultad', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener programas por facultad seleccionada. Intente nuevamente.'
            });
        }
    }

    async getCertificacionesIntermediasPorPlanDeEstudio(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('certificacionIntermediaPE/getCertificacionesIntermediasPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener certificaciones intermedias por plan de estudio seleccionado. Intente nuevamente.`,
                }
            );
        }
    }
    
    async insertAsignaturasToCertifIntermedia(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('certificacionIntermediaPE/insertAsignaturasToCertifIntermedia'),
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

    async updateAsignaturasToCertifIntermedia(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('certificacionIntermediaPE/updateAsignaturasToCertifIntermedia'),
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

    async deleteAsignaturasToCertifIntermedia(params: any, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('certificacionIntermediaPE/deleteAsignaturasToCertifIntermedia',{asignCiToDelete: params});
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