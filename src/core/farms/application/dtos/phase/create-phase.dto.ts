import { Validators } from "../../../../shared/utils/Validators";

export class CreatePhaseDto {
  private constructor(public farmId: string, public name: string) {}

  static create(body: { [key: string]: any }): [string?, CreatePhaseDto?] {
    if (!Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }
    if (!body.name) {
      return ["name: Nombre de fase faltante."];
    }

    return [null, new CreatePhaseDto(body.farmId, body.name)];
  }
}
