import { Validators } from "../../../shared/utils/Validators";

export class CreateSowDto {
  private constructor(
    // datos generales
    public readonly farmId: string,
    public readonly breedId: string,
    public readonly phaseId: string,
    public readonly code: string,
    public readonly ageDays: number,
    public readonly initialPrice: number,

    public readonly reproductiveStateId?: string,
    public readonly startDate?: Date,
    public readonly boarId?: string,

    public readonly numberMalePiglets?: number,
    public readonly numberFemalePiglets?: number,
    public readonly numberDeadPiglets?: number,
    public readonly averageLiterWeight?: number
  ) {}

  static create(body: { [key: string]: any }): [string?, CreateSowDto?] {
    //datos generales
    if (!Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }

    if (!Validators.isValidUUID(body.breedId)) {
      return ["breedId: ID de raza inválido o faltante."];
    }

    if (!Validators.isValidUUID(body.phaseId)) {
      return ["phaseId: ID de fase inválido o faltante."];
    }

    if (
      typeof body.code !== "string" ||
      !Validators.isValidTagNumber(body.code)
    ) {
      return [
        "code: Código del cerdo inválido o faltante. Solo se permite: letras, números y guiones.",
      ];
    }

    if (typeof body.ageDays !== "number" || body.ageDays < 0) {
      return ["ageDays: Edad en días inválida o faltante."];
    }

    if (typeof body.initialPrice !== "number" || body.initialPrice < 0) {
      return ["initialPrice: Precio inicial inválido o faltante."];
    }

    // datos reproductivos

    if (body.reproductiveStateId && !Validators.isValidUUID(body.reproductiveStateId)) {
      return ["reproductiveStateId: ID de estado reproductivo inválido."];
    }

    if (body.startDate && !Validators.date.test(body.startDate)) {
      return [
        "startDate: Fecha inicio estado reproductivo inválida o faltante.",
      ];
    }

    if (body.boarId && !Validators.isValidUUID(body.boarId)) {
      return ["boarId: ID cerdo reproductor inválido."];
    }

    if (
      body.numberMalePiglets !== undefined &&
      (typeof body.numberMalePiglets !== "number" || body.numberMalePiglets < 0)
    ) {
      return ["numberMalePiglets: Número de lechones machos vivos inválido."];
    }

    if (
      body.numberFemalePiglets !== undefined &&
      (typeof body.numberFemalePiglets !== "number" ||
        body.numberFemalePiglets < 0)
    ) {
      return [
        "numberFemalePiglets: Número de lechones hembras vivas inválido.",
      ];
    }

    if (
      body.numberDeadPiglets !== undefined &&
      (typeof body.numberDeadPiglets !== "number" || body.numberDeadPiglets < 0)
    ) {
      return ["numberDeadPiglets: Número de lechones muertos inválido."];
    }

    if (
      body.averageLiterWeight !== undefined &&
      (typeof body.averageLiterWeight !== "number" ||
        body.averageLiterWeight < 0)
    ) {
      return ["averageLiterWeight: Peso promedio de la camada inválido."];
    }

    return [
      null,
      new CreateSowDto(
        body.farmId,
        body.breedId,
        body.phaseId,
        body.code,
        body.ageDays,
        body.initialPrice,

        body.reproductiveStateId,
        new Date(body.startDate),
        body.boarId,

        body.numberMalePiglets,
        body.numberFemalePiglets,
        body.numberDeadPiglets,
        body.averageLiterWeight
      ),
    ];
  }
}
