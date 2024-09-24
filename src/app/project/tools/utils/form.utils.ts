import { NamesCrud } from "../../models/shared/NamesCrud"
type mode = 'creado' | 'actualizado' | 'eliminado' | 'eliminados'


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
        //Error. El estado de acreditación no ha sido creado.
        return `${capitalizeFirstLetter(namesCrud.singular)} no ha sido ${getWordWithGender(mode , namesCrud.genero)}. Intente nuevamente`
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