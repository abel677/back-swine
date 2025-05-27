import { Validators } from "../../../../shared/utils/Validators";

export class CreateReproductiveStateDto {
  private constructor(public farmId: string, public name: string) {}

  static create(body: {
    [key: string]: any;
  }): [string?, CreateReproductiveStateDto?] {
    if (!Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }
    if (!body.name) {
      return ["name: Nombre de estado reproductivo faltante."];
    }

    return [null, new CreateReproductiveStateDto(body.farmId, body.name)];
  }
}
