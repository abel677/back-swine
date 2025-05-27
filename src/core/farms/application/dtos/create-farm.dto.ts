import { Validators } from "../../../shared/utils/Validators";

export class CreateFarmDto {
  private constructor(public name: string, public ownerId: string) {}

  static create(body: { [key: string]: any }): [string?, CreateFarmDto?] {
    if (!body.name) {
      return ["name: Nombre de granja faltante."];
    }
    if (!Validators.isValidUUID(body.ownerId)) {
      return ["ownerId: ID de usuario inválido."];
    }

    return [null, new CreateFarmDto(body.name, body.ownerId)];
  }
}
