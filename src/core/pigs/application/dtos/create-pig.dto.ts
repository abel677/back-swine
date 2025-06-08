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
      reproductiveStateId: string;
      startDate: string;
      boarId?: string;
      birth?: {
        malePiglets: number;
        femalePiglets: number;
        deadPiglets: number;
        averageLitterWeight: number;
        birthDate: string;
        description?: string;
      };
    }[]
  ) {}

  static create(body: { [key: string]: any }): [string?, CreatePigDto?] {
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

    // Validaciones del historial reproductivo
    if (body.sowReproductiveHistoryPayload) {
      if (!Array.isArray(body.sowReproductiveHistoryPayload)) {
        return ["sowReproductiveHistory: Debe ser un arreglo válido."];
      }

      for (let i = 0; i < body.sowReproductiveHistoryPayload.length; i++) {
        const entry = body.sowReproductiveHistoryPayload[i];
        const prefix = `sowReproductiveHistory[${i}]`;

        if (
          !entry.reproductiveStateId ||
          !Validators.isValidUUID(entry.reproductiveStateId)
        ) {
          return [`${prefix}.reproductiveStateId: ID inválido o faltante.`];
        }

        if (!Validators.date.test(entry.startDate)) {
          return [`${prefix}.startDate: Fecha inválida o faltante.`];
        }

        if (entry.boarId && !Validators.isValidUUID(entry.boarId)) {
          return [`${prefix}.boarId: ID del cerdo reproductor inválido.`];
        }

        if (entry.birthPayload) {
          const {
            malePiglets,
            femalePiglets,
            deadPiglets,
            averageLitterWeight,
            birthDate,
          } = entry.birthPayload;

          if (typeof malePiglets !== "number" || malePiglets < 0) {
            return [`${prefix}.birthPayload.malePiglets: Número inválido.`];
          }

          if (typeof femalePiglets !== "number" || femalePiglets < 0) {
            return [`${prefix}.birthPayload.femalePiglets: Número inválido.`];
          }

          if (typeof deadPiglets !== "number" || deadPiglets < 0) {
            return [`${prefix}.birthPayload.deadPiglets: Número inválido.`];
          }

          if (
            typeof averageLitterWeight !== "number" ||
            averageLitterWeight < 0
          ) {
            return [
              `${prefix}.birthPayload.averageLitterWeight: Peso inválido.`,
            ];
          }

          if (!Validators.date.test(birthDate)) {
            return [`${prefix}.birthPayload.birthDate: Fecha inválida.`];
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
