import { Validators } from "../../../shared/utils/Validators";

export class CreateCategoryDto {
  private constructor(public farmId: string, public name: string) {}

  static create(body: { [key: string]: any }): [string?, CreateCategoryDto?] {
    if (!Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }
    if (!body.name) {
      return ["name: Nombre de categoria faltante."];
    }

    return [null, new CreateCategoryDto(body.farmId, body.name)];
  }
}
