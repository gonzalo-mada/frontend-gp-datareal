import { NamesCrud } from "../../models/shared/NamesCrud"
type mode = 'creado' | 'actualizado' | 'eliminado' | 'eliminados' | 'incluido'


export function generateMessage(namesCrud: NamesCrud, value: string | null, mode: mode, result: boolean, plural: boolean) : string {
    if (result) {
        if (plural) {
            //Los estados de acreditación ha sido creado exitosamente.
            return `
            ${capitalizeFirstLetter(namesCrud.articulo_plural)} 
            ${value != null ? value : ''} 
            han sido 
            ${getWordWithGender(mode , namesCrud.genero)}
            exitosamente.
            `
        }else{
            //El estado de acreditación ha sido creado exitosamente.
            return `
            ${capitalizeFirstLetter(namesCrud.articulo_singular)} 
            ${value != null ? value : ''} 
            ha sido 
            ${getWordWithGender(mode , namesCrud.genero)}
            exitosamente.
            `
        }
    }else{
        //Cambio. El estado de acreditación no ha recibido modificaciones.
        return `${capitalizeFirstLetter(namesCrud.singular)} ${value != null ? value : ''} no ha recibido modificaciones.`
    }
    
}

function capitalizeFirstLetter(word: string) : string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function getWordWithGender(word: string, gender: string) : string {
    if (gender === 'femenino') {
        if (word.endsWith('os')) {
          return word.replace(/os$/, 'as'); // Plural
        } else if (word.endsWith('o')) {
          return word.replace(/o$/, 'a'); // Singular
        }
      }
      return word;
}

export function mergeNames(namesCrud: NamesCrud | null,rowsSelected: any[], withHtml: boolean, keyData: string ) : string{
    const namesSelected = rowsSelected.map( data => data[keyData] )
    if (namesCrud) {
        const message = namesSelected.length === 1
        ? `${namesCrud.articulo_singular}${withHtml ? ': <b>' : ' '}${namesSelected[0]}${withHtml ? '</b>' : ''}`
        : `${namesCrud.articulo_plural}${withHtml ? ': <b>' : ' '}${namesSelected.join(', ')}${withHtml ? '</b>' : ''}`;
        return message
    }else{
        const message = namesSelected.length === 1
        ? `${withHtml ? ': <b>' : ' '}${namesSelected[0]}${withHtml ? '</b>' : ''}`
        : `${withHtml ? ': <b>' : ' '}${namesSelected.join(', ')}${withHtml ? '</b>' : ''}`;
        return message
    }
}

export function parseAsignaturas(event: any, array: any){
    const findByKey = (key: string, array: any[]): any | null => {
        for (const item of array) {
          if (item.key === key) {
            return item;
          }
          if (item.children && item.children.length > 0) {
            const found = findByKey(key, item.children);
            if (found) {
              return found;
            }
          }
        }
        return null;
    };

    // Filtrar únicamente las claves con 'checked' en true
    const filteredKeys = Object.keys(event).filter(key => event[key].checked === true);
    
    //esta funcion permite parsear los key que vienen desde la treetable
    const result = filteredKeys.map(key => {
        const parts = key.split('-');
        return {
            cod_asignatura: parts[0],
            cod_tema: parts[1] || null
        };
    });
    
    const selectedData = filteredKeys
        .map(key => findByKey(key, array))
        .filter(item => item && (!item.children || item.children.length === 0))
        .map(item => {
            if (item && item.parent) {
                delete item.parent; 
            }
            return item;
        });

    const codAsignaturasSet = new Set(result.map(item => item.cod_asignatura));
    const filteredResult = Array.from(codAsignaturasSet).map(cod_asignatura => {
        const temas = result.filter(item => item.cod_asignatura === cod_asignatura);
        return temas.some(item => item.cod_tema !== null) ?
            temas.filter(item => item.cod_tema !== null) :
            temas;
    }).flat();
    
    let response = {
        filteredResult,
        codAsignaturasSet,
        selectedData
    }
    // console.log("response",response);
    
    return response
}

export async function filterDataFromArrayAsync(array: any[]): Promise<any[]> {
    // Filtra solo la propiedad `data` de cada elemento del arreglo
    return array.map(item => item.data);
}
