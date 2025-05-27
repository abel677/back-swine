import { PigPhase } from "../../domain/enums";
import { Validators } from "../../utils/Validators";

export class PigDtoValidator {
  static validateBase(body: any): string {
    if (!Validators.isValidUUID(body.farmId)) {
      return "farmId: ID de granja invalido o faltante.";
    }
    if (!Validators.isValidUUID(body.breedId)) {
      return "breedId: ID de raza invalido o faltante.";
    }
    if (!Validators.isValidTagNumber(body.code)) {
      return "code: Código de etiqueta solo admite números, letras y guiones (PX-00-0001).";
    }

    if (!Object.values(PigPhase).includes(body.phase)) {
      return `phase: Fase invalida o faltante. Valores permitidos: ${Object.values(
        PigPhase
      ).join(", ")}`;
    }
    if (!body.price || typeof body.price !== "number") {
      return "price: Precio inválido o faltante. Debe ser un número entero positivo mayor igual 0.";
    }
    if (!body.ageDays || typeof body.ageDays !== "number") {
      return "ageDays: Edad en días inválido o faltante. Debe ser un número entero positivo.";
    }

    return "";
  }
  static validateBasePartial(body: any): string {
    if ("farmId" in body && !Validators.isValidUUID(body.farmId)) {
      return "farmId: ID de granja inválido.";
    }
    if ("breedId" in body && !Validators.isValidUUID(body.breedId)) {
      return "breedId: ID de raza inválido.";
    }
    if ("code" in body && !Validators.isValidTagNumber(body.code)) {
      return "code: Código de etiqueta solo admite números, letras y guiones (PX-00-0001).";
    }
    if ("phase" in body && !Object.values(PigPhase).includes(body.phase)) {
      return `phase: Fase inválida. Valores permitidos: ${Object.values(
        PigPhase
      ).join(", ")}`;
    }
    if ("price" in body && (typeof body.price !== "number" || body.price < 0)) {
      return "price: Precio inválido. Debe ser un número entero positivo mayor o igual a 0.";
    }
    if (
      "ageDays" in body &&
      (typeof body.ageDays !== "number" || body.ageDays < 0)
    ) {
      return "ageDays: Edad en días inválida. Debe ser un número entero positivo.";
    }

    return "";
  }
}
