import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RangoAG } from "src/app/project/models/plan-de-estudio/RangoAG";
import { ModeForm } from "src/app/project/models/shared/ModeForm";
import { StateValidatorForm } from "src/app/project/models/shared/StateValidatorForm";
import { GPValidator } from "src/app/project/tools/validators/gp.validators";

@Injectable({
  providedIn: "root",
})
export class FormRangosAGService {
  public fbForm!: FormGroup;
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  constructor(private fb: FormBuilder) {}

  async initForm(): Promise<boolean> {
    this.fbForm = this.fb.group(
      {
        Descripcion_RangoAprobG: [
          "",
          [Validators.required, GPValidator.regexPattern("num_y_letras")],
        ],
        NotaMinima: [
          "4.00",
          [Validators.required, GPValidator.decimalValidator()], // Validador para decimales
        ],
        NotaMaxima: [
          "7.00",
          [Validators.required, GPValidator.decimalValidator()], // Validador para decimales
        ],
        RexeReglamentoEstudio: [
          "",
          [Validators.required, GPValidator.regexPattern("num_y_letras")],
        ],
        aux: [""],
      },
      {
        validators: GPValidator.minMaxValidator("NotaMinima", "NotaMaxima"),
      },
    );

    return true;
  }

  resetForm(): void {
    this.fbForm.reset({
      Descripcion_RangoAprobG: "",
      NotaMinima: "4.00",
      NotaMaxima: "7.00",
      RexeReglamentoEstudio: "",
      aux: "",
    });
    this.fbForm.enable();
  }

  setForm(mode: "show" | "edit", data: RangoAG): void {
    this.fbForm.patchValue({ ...data });
    if (mode === "show") {
      this.fbForm.disable();
    }
    if (mode === "edit") {
      this.fbForm.patchValue({ aux: data });
    }
  }
}