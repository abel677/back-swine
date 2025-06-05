import { PigSex, PigType } from "../../../shared/domain/enums";
import { Validators } from "../../../shared/utils/Validators";

export class CreatePigDto {
  private constructor(
    public readonly farmId: string,
    public readonly type: PigType,
    public readonly sex: PigSex,
    public readonly phaseId: string,
    public readonly breedId: string,
    public readonly code: string,
    public readonly ageDays: number,
    public readonly initialPrice: number,
    public readonly sowReproductiveHistory?: {
      reproductiveState: {
        id: string;
        name: string;
      };
      startDate: string;
      boarId: string;
      birth?: {
        malePiglets: number;
        femalePiglets: number;
        deadPiglets: number;
        averageLitterWeight: number;
      };
    }[]
  ) {}

  static create(body: { [key: string]: any }): [string?, CreatePigDto?] {
    // Validaciones generales
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

    if (
      typeof body.ageDays !== "number" ||
      body.ageDays < 0 ||
      !Number.isInteger(body.ageDays)
    ) {
      return [
        "ageDays: Edad en días inválida o faltante. Debe ser un entero positivo.",
      ];
    }

    if (typeof body.initialPrice !== "number" || body.initialPrice < 0) {
      return ["initialPrice: Precio inicial inválido o faltante."];
    }

    // Validaciones de historial reproductivo (si aplica)
    if (body.sowReproductiveHistory) {
      if (!Array.isArray(body.sowReproductiveHistory)) {
        return ["sowReproductiveHistory: Debe ser un arreglo de objetos."];
      }

      for (const history of body.sowReproductiveHistory) {

        if (
          !history.reproductiveState ||
          !Validators.isValidUUID(history.reproductiveState.id) ||
          typeof history.reproductiveState.name !== "string"
        ) {
          return [
            "sowReproductiveHistory.reproductiveState: Datos inválidos o faltantes.",
          ];
        }

        if (!Validators.date.test(history.startDate)) {
          return [
            "sowReproductiveHistory.startDate: Fecha inválida o faltante.",
          ];
        }

        if (!Validators.isValidUUID(history.boarId)) {
          return [
            "sowReproductiveHistory.boarId: ID del cerdo reproductor inválido o faltante.",
          ];
        }

        if (history.birth) {
          const {
            malePiglets,
            femalePiglets,
            deadPiglets,
            averageLitterWeight,
          } = history.birth;

          if (typeof malePiglets !== "number" || malePiglets < 0) {
            return [
              "birth.malePiglets: Número de lechones machos inválido o faltante.",
            ];
          }

          if (typeof femalePiglets !== "number" || femalePiglets < 0) {
            return [
              "birth.femalePiglets: Número de lechones hembras inválido o faltante.",
            ];
          }

          if (typeof deadPiglets !== "number" || deadPiglets < 0) {
            return [
              "birth.deadPiglets: Número de lechones muertos inválido o faltante.",
            ];
          }

          if (
            typeof averageLitterWeight !== "number" ||
            averageLitterWeight < 0
          ) {
            return [
              "birth.averageLitterWeight: Peso promedio inválido o faltante.",
            ];
          }
        }
      }
    }

    return [
      undefined,
      new CreatePigDto(
        body.farmId,
        body.type,
        body.sex,
        body.phaseId,
        body.breedId,
        body.code,
        body.ageDays,
        body.initialPrice,
        body.sowReproductiveHistory
      ),
    ];
  }
}
