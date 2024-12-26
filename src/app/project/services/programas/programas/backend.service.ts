import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';

@Injectable({
    providedIn: 'root'
})

export class BackendProgramasService {

    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
    }

    async getDirector( params: any , loading = true, type: 'director' | 'alterno'){
        try {
            return await this.invoker.httpInvoke({service: 'programas/getDirector', loading: loading},params)
            
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, {
                  notifyMethod: 'alert',
                  message: `Hubo un error al buscar director(a) ${ type === 'alterno' ? 'alterno(a)' : ''}. Intente nuevamente.`,
                }
            );
        }
    }

    async getTiposProgramas(loading = true){
        try {
            return await this.invoker.httpInvoke({service: 'tiposprogramas/getTiposProgramas', loading: loading})
            
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener tipos de programas. Intente nuevamente.'
            });
        }

    }

    async getCampus(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'campus/logica_getCampus', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener campus. Intente nuevamente.',
            });
        }
    }

    async getUnidadesAcademicas(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'unidadesAcademicas/logica_getUnidadesAcademicasWithoutColor', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener unidades académicas. Intente nuevamente.',
            });
        }
    }
    
    async getUnidadesAcademicasPrograma(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'unidadesAcademicas/getUnidadesAcademicasPrograma', loading: loading }, params);
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener unidades académicas y programas. Intente nuevamente.',
            });
        }
    }
    
    async getCertificacionIntermediaPrograma(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'certificacionIntermedia/getCertificacionIntermedia_Prog', loading: loading }, params);
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener certificaciones intermedias. Intente nuevamente.',
            });
        }
    }
    
    async getInstituciones(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'programas/getInstituciones', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener instituciones. Intente nuevamente.',
            });
        }
    }
    
    async getInstitucionesSelected(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'programas/getInstitucionesSelected', loading: loading }, params);
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener instituciones. Intente nuevamente.',
            });
        }
    }
    
    async getEstadosMaestros(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'estado_maestro/getEstadosMaestros', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener estados maestros. Intente nuevamente.',
            });
        }
    }
    
    async getTiposGraduaciones(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'tipoGraduacionConjunta/getTipoGradConjunta', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener tipos de graduaciones. Intente nuevamente.',
            });
        }
    }
    
    async getCertificacionIntermedia(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'certificacionIntermedia/getCertificacionIntermedia', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener certificaciones intermedias. Intente nuevamente.',
            });
        }
    }
    
    async getSuspensiones(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'suspensiones/getSuspensiones', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener tipos de suspensiones. Intente nuevamente.',
            });
        }
    }

    async getReglamentos(loading = true) {
        try {
            return await this.invoker.httpInvoke({
                service: 'reglamentos/getReglamentos',
                loading: loading
            });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener reglamentos. Intente nuevamente.'
            });
        }
    }
    
    async getEstadosAcreditacion(loading = true) {
        try {
            return await this.invoker.httpInvoke({
                service: 'estados_acreditacion/getEstadosAcreditacion',
                loading: loading
            });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener estados de acreditación. Intente nuevamente.'
            });
        }
    }
    
    async getArchiveDoc(id: any, from: string, needBinaryString: boolean) {
        try {
            if (needBinaryString) {
                return await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('programas/getArchiveDoc',false),
                    { id , needBinaryString, from }
                )
            }else{
                return await this.invoker.httpInvokeReport(
                    this.serviceUtils.generateServiceMongo('programas/getArchiveDoc',false), 
                    'pdf', 
                    { id , needBinaryString, from }
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
    
    async getDocsMongo(cod_programa: number, from: string, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('programas/getDocsMongo', false),
                { Cod_Programa: cod_programa, from: from }
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: 'Error al obtener documentos',
                message: error.detail.error.message.message
            });
        }
    }
    
    async getLogPrograma(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                { service: 'programas/getLogPrograma', loading: loading },
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener historial de actividades. Intente nuevamente.'
            });
        }
    }
    
    async getPrograma(params: any, loading = true, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('programas/getPrograma', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: `Error al obtener ${namesCrud.articulo_singular}.`,
                message: error?.message || error.detail.error.message.message
            });
        }
    }
    
    async getFacultades() {
        try {
            return await this.invoker.httpInvoke('facultades/getFacultades');
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener facultades. Intente nuevamente.'
            });
        }
    }
    
    async getProgramas() {
        try {
            return await this.invoker.httpInvoke('programas/getProgramas');
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener programas. Intente nuevamente.'
            });
        }
    }
    
    async getProgramasPorFacultad(params: any) {
        try {
            return await this.invoker.httpInvoke('programas/getProgramasPorFacultad', params);
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener programas por facultad seleccionada. Intente nuevamente.'
            });
        }
    }
    
    async getProgramasPorFacultadMerged(params: any) {
        try {
            return await this.invoker.httpInvoke('programas/getProgramasPorFacultadMerged', params);
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener programas por facultad seleccionada. Intente nuevamente.'
            });
        }
    }
    
    async insertProgramaBackend(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('programas/insertPrograma'),
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
    
    async updateProgramaBackend(params: any, namesCrud: NamesCrud): Promise<any> {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('programas/updatePrograma'),
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

    async deleteProgramaBackend(params: any, namesCrud: NamesCrud){
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('programas/deletePrograma'),
                    {programasToDelete: params}
                ),
                namesCrud
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, {
                  notifyMethod: 'alert',
                  summary: `Error al eliminar ${namesCrud.singular}`,
                  message: error?.message || error.detail.error.message.message
                }
            );
        }
    }


}