import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { ModeForm } from "../../models/shared/ModeForm";

export class GPValidator {

    static notMinusOneCategory(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            if (control.value && control.value.ID_TipoSuspension && control.value.ID_TipoSuspension === -1) {
                return {notMinusOneCategory : true}
            }else if(control.value && control.value === -1){
                return {notMinusOneCategory : true}
            }else{
                return null;
            }
        };
    }

    static notValueNegativeYearsAcredit(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            if (control.value <= 0 && control.value !== null) {
                return { notValueNegativeYearsAcredit: true }
            }else{
                return null;
            }
        }
    }

    static notUpTo15YearsAcredit(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            if (control.value >= 15 && control.value !== null) {
                return { notUpTo15YearsAcredit: true }
            }else{
                return null;
            }
        }
    }

    static regexPattern(pattern: 'num_y_letras' | 'solo_num' | 'solo_letras' | 'num_o_letras' ): ValidatorFn {
        let regex : any ;
        switch (pattern) {
            case 'num_y_letras': regex = /^(?=.*[a-zA-ZñÑ]).+$/; break; // no acepta espacio en blanco y se necesita al menos una letra
            case 'num_o_letras': regex = /^(?!\s*$).+/; break; 
            case 'solo_num':  regex = /^[0-9]+$/; break;
            case 'solo_letras': regex = /^[a-zA-ZñÑ]+$/; break;
        }
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && !regex.test(control.value)) {
                switch (pattern) {
                    case 'num_y_letras': return { num_y_letras: true };
                    case 'num_o_letras': return { num_o_letras: true };
                    case 'solo_num': return { solo_num: true };
                    case 'solo_letras': return { solo_letras: true };
                }
                
            } else {
                return null;
            }
        };
    }

    static checkCorreoUV(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
          if (!control.value) return null;
          if (
            !/^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(uv.cl|postgrado.uv.cl)+$/.test(
              control.value.toLowerCase(),
            )
          ) {
            return { checkCorreoUV: true };
          } else {
            return null;
          }
        };
    }

    static existName(existName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
          const nombre = control.value?.trim().toLowerCase();
          const existe = existName.trim().toLowerCase() === nombre;
          return existe ? { existName: true } : null;
        };
    }

    static notSameAsDirector(directorControlName: string, directorSelectedControlName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const formGroup = control.parent as FormGroup;

            if (!formGroup) {
                return null; 
            }

            const directorValue = formGroup.get(directorControlName)?.value;
            const directorSelectedValue = formGroup.get(directorSelectedControlName)?.value;
            
            const directorAlternoValue = control.value;
            
            if (directorValue && directorAlternoValue && directorValue === directorAlternoValue && directorValue === directorSelectedValue) {
                return { notSameAsDirector: true };
            } else {
                return null;
            }
        };
    }

    static requiredDirectorAlternoSelected(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            const formGroup = control.parent as FormGroup;

            if (!formGroup) {
                return null; 
            }

            let haveDirectorAlterno = formGroup.get('haveDirectorAlterno')?.value;
            let DirectorAlterno_selected = formGroup.get('DirectorAlterno_selected')?.value;

            if ((haveDirectorAlterno === true) && (DirectorAlterno_selected === '' || DirectorAlterno_selected === null)) {
                return { required: true };
            }
    
            return null;
            
        }
    }

    static notSameDirectorsSelected(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            const formGroup = control.parent as FormGroup;

            if (!formGroup) {
                return null; 
            }

            let directorSelected = formGroup.get('Director_selected')?.value;
            let directorAlternoSelected = formGroup.get('DirectorAlterno_selected')?.value;

            if (directorSelected && directorAlternoSelected && directorSelected === directorAlternoSelected) {
                return { required: true };
            } else {
                return null;
            }
        }
    }

    static notSameAsDirectorInUpdate(rut_director: string, rut_directorAlterno: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const formGroup = control.parent as FormGroup;

            if (!formGroup) {
                return null; 
            }
            
            const director = control.value;
            
            if (director && director === rut_director ) {
                return { notSameDirectorInUpdate: true };
            }else if(director && director === rut_directorAlterno){
                return { notSameDirectorInUpdate: true };
            } else {
                return null;
            }
        };
    }

    static filesValidator(nameControl: string, getModeForm: () => ModeForm ): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const formGroup = control.parent as FormGroup;
            if (!formGroup) return null;
    
            const files = formGroup.get(nameControl)?.value;
            const modeForm = getModeForm();
            
            if (modeForm === 'create' || modeForm === 'edit') {
                if (!files || files.length === 0) {
                    return { required: true };
                }
            }
    
            return null;
        };
    }
}