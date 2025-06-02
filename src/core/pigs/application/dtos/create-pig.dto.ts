import { PigSex, PigType } from "../../../shared/domain/enums";
import { Validators } from "../../../shared/utils/Validators";

export class CreatePigDto {
  private constructor(
    // datos generales
    public readonly farmId: string,
    public readonly type: PigType,
    public readonly sex: PigSex,
    public readonly phaseId: string,
    public readonly breedId: string,
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

  static create(body: { [key: string]: any }): [string?, CreatePigDto?] {
    //datos generales
    if (!Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }

    if (!Object.values(PigType).includes(body.type)) {
      return [
        `type: Tipo de cerdo inválido o faltante. Valores permitidos: ${Object.values(
          PigType
        ).join(", ")}`,
      ];
    }
    if (!Object.values(PigSex).includes(body.sex)) {
      return [
        `sex: Sexo del cerdo inválido o faltante. Valores permitidos: ${Object.values(
          PigSex
        ).join(", ")}`,
      ];
    }

    if (!Validators.isValidUUID(body.phaseId)) {
      return ["phaseId: ID de fase inválido o faltante."];
    }

    if (!Validators.isValidUUID(body.breedId)) {
      return ["breedId: ID de raza inválido o faltante."];
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

    if (
      body.reproductiveStateId &&
      !Validators.isValidUUID(body.reproductiveStateId)
    ) {
      return ["reproductiveStateId: ID de estado reproductivo inválido."];
    }

    // si hay un estado reproductivo
    if (body.reproductiveStateId) {
      if (!Validators.date.test(body.startDate)) {
        return ["startDate: Fecha de inicio obligatoria y debe ser válida."];
      }

      if (
        (body.numberFemalePiglets &&
          typeof body.numberFemalePiglets !== "number") ||
        body.numberFemalePiglets < 0
      ) {
        return [
          "numberFemalePiglets: Número de lechones hembras vivas obligatorio y debe ser válido.",
        ];
      }

      if (
        (body.numberMalePiglets &&
          typeof body.numberMalePiglets !== "number") ||
        body.numberMalePiglets < 0
      ) {
        return [
          "numberMalePiglets: Número de lechones machos vivos obligatorio y debe ser válido.",
        ];
      }

      if (
        (body.numberDeadPiglets &&
          typeof body.numberDeadPiglets !== "number") ||
        body.numberDeadPiglets < 0
      ) {
        return [
          "numberDeadPiglets: Número de lechones muertos obligatorio y debe ser válido.",
        ];
      }

      if (
        (body.averageLiterWeight &&
          typeof body.averageLiterWeight !== "number") ||
        body.averageLiterWeight < 0
      ) {
        return [
          "averageLiterWeight: Peso promedio de la camada obligatorio y debe ser válido.",
        ];
      }
    }

    if (body.startDate && !Validators.date.test(body.startDate)) {
      return [
        "startDate: Fecha inicio estado reproductivo inválida o faltante.",
      ];
    }

    if (body.boarId && !Validators.isValidUUID(body.boarId)) {
      return ["boarId: ID cerdo reproductor inválido."];
    }

    return [
      null,
      new CreatePigDto(
        body.farmId,
        body.type,
        body.sex,
        body.phaseId,
        body.breedId,
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
