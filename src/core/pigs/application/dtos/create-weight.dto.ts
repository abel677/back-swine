import { Validators } from "../../../shared/utils/Validators";

export class CreateWeightPigDto {
  private constructor(
    public readonly days: number,
    public readonly weight: number
  ) {}

  static create(body: { [key: string]: any }): [string?, CreateWeightPigDto?] {
    // if (!Validators.isValidUUID(body.pigId)) {
    //   return ["pigId: ID del cerdo inválido o faltante."];
    // }

    if (typeof body.days !== "number" || body.days < 0) {
      return ["days: Número de días inválido o faltante."];
    }
    if (typeof body.weight !== "number" || body.weight < 0) {
      return ["weight: Peso inválido o faltante."];
    }

    return [null, new CreateWeightPigDto(body.days, body.weight)];
  }
}
