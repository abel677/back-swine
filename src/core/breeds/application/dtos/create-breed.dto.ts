import { Validators } from "../../../shared/utils/Validators";

export class CreateBreedDto {
  private constructor(public farmId: string, public name: string) {}

  static create(body: { [key: string]: any }): [string?, CreateBreedDto?] {
    if (!Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }
    if (!body.name) {
      return ["name: Nombre de raza faltante."];
    }
    return [null, new CreateBreedDto(body.farmId, body.name)];
  }
}
