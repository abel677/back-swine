import { Validators } from "../../../shared/utils/Validators";

export class UpdateSowDto {
  private constructor(
    public readonly farmId?: string,
    public readonly breedId?: string,
    public readonly phaseId?: string,
    public readonly code?: string,
    public readonly ageDays?: number,
    public readonly initialPrice?: number,

    public readonly reproductiveStateId?: string,
    public readonly startDate?: Date,
    public readonly boarId?: string,

    public readonly numberMalePiglets?: number,
    public readonly numberFemalePiglets?: number,
    public readonly numberDeadPiglets?: number,
    public readonly averageLiterWeight?: number
  ) {}

  static create(body: { [key: string]: any }): [string?, UpdateSowDto?] {
    if (body.farmId && !Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido."];
    }

    if (body.breedId && !Validators.isValidUUID(body.breedId)) {
      return ["breedId: ID de raza inválido."];
    }

    if (body.phaseId && !Validators.isValidUUID(body.phaseId)) {
      return ["phaseId: ID de fase inválido."];
    }

    if (
      body.code !== undefined &&
      (typeof body.code !== "string" || !Validators.isValidTagNumber(body.code))
    ) {
      return [
        "code: Código del cerdo inválido. Solo se permite: letras, números y guiones.",
      ];
    }

    if (
      body.ageDays !== undefined &&
      (typeof body.ageDays !== "number" || body.ageDays < 0)
    ) {
      return ["ageDays: Edad en días inválida."];
    }

    if (
      body.initialPrice !== undefined &&
      (typeof body.initialPrice !== "number" || body.initialPrice < 0)
    ) {
      return ["initialPrice: Precio inicial inválido."];
    }

    if (
      body.reproductiveStateId &&
      !Validators.isValidUUID(body.reproductiveStateId)
    ) {
      return ["reproductiveStateId: ID de estado reproductivo inválido."];
    }

    if (body.startDate && !Validators.date.test(body.startDate)) {
      return ["startDate: Fecha inicio estado reproductivo inválida."];
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
      new UpdateSowDto(
        body.farmId,
        body.breedId,
        body.phaseId,
        body.code,
        body.ageDays,
        body.initialPrice,

        body.reproductiveStateId,
        body.startDate ? new Date(body.startDate) : undefined,
        body.boarId,

        body.numberMalePiglets,
        body.numberFemalePiglets,
        body.numberDeadPiglets,
        body.averageLiterWeight
      ),
    ];
  }
}
