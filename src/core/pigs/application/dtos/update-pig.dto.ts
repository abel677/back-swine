import { PigSex, PigType } from "../../../shared/domain/enums";
import { Validators } from "../../../shared/utils/Validators";

export class UpdatePigDto {
  private constructor(
    public readonly farmId?: string,
    public readonly type?: PigType,
    public readonly sex?: PigSex,
    public readonly phaseId?: string,
    public readonly breedId?: string,
    public readonly code?: string,
    public readonly ageDays?: number,
    public readonly initialPrice?: number,
    public readonly weights?: {
      id: string;
      days: number;
      weight: number;
    }[]
  ) {}

  static create(body: { [key: string]: any }): [string?, UpdatePigDto?] {
    // Validación de farmId
    if (body.farmId && !Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }

    // Validación de type
    if (body.type && !Object.values(PigType).includes(body.type)) {
      return [
        `type: Tipo de cerdo inválido. Valores permitidos: ${Object.values(
          PigType
        ).join(", ")}`,
      ];
    }

    // Validación de sex
    if (body.sex && !Object.values(PigSex).includes(body.sex)) {
      return [
        `sex: Sexo del cerdo inválido. Valores permitidos: ${Object.values(
          PigSex
        ).join(", ")}`,
      ];
    }

    // Validación de phaseId
    if (body.phaseId && !Validators.isValidUUID(body.phaseId)) {
      return ["phaseId: ID de fase inválido."];
    }

    // Validación de breedId
    if (body.breedId && !Validators.isValidUUID(body.breedId)) {
      return ["breedId: ID de raza inválido."];
    }

    // Validación de code
    if (
      body.code &&
      typeof body.code === "string" &&
      !Validators.isValidTagNumber(body.code)
    ) {
      return [
        "code: Código del cerdo inválido. Solo se permite: letras, números y guiones.",
      ];
    }

    // Validación de ageDays
    if (
      body.ageDays !== undefined &&
      (typeof body.ageDays !== "number" ||
        body.ageDays < 0 ||
        !Number.isInteger(body.ageDays))
    ) {
      return ["ageDays: Edad en días inválida. Debe ser un entero positivo."];
    }

    // Validación de initialPrice
    if (
      body.initialPrice !== undefined &&
      (typeof body.initialPrice !== "number" || body.initialPrice < 0)
    ) {
      return [
        "initialPrice: Precio inicial inválido. Debe ser un número positivo.",
      ];
    }

    // Validación de weights (array de objetos {id?, days, weight})
    if (body.weights !== undefined) {
      if (!Array.isArray(body.weights)) {
        return ["weights: Debe ser un array de objetos {id?, days, weight}"];
      }

      for (const weight of body.weights) {
        // Validar id (opcional, pero si viene debe ser UUID válido)
        // if (
        //   weight.id !== undefined &&
        //   (typeof weight.id !== "string" || !Validators.isValidUUID(weight.id))
        // ) {
        //   return [
        //     "weights: El campo 'id' debe ser un UUID válido cuando está presente",
        //   ];
        // }

        // Validar days
        if (
          typeof weight.days !== "number" ||
          weight.days < 0 ||
          !Number.isInteger(weight.days)
        ) {
          return ["weights: El campo 'days' debe ser un entero positivo"];
        }

        // Validar weight
        if (typeof weight.weight !== "number" || weight.weight <= 0) {
          return [
            "weights: El campo 'weight' debe ser un número positivo mayor que cero",
          ];
        }
      }
    }

    return [
      undefined,
      new UpdatePigDto(
        body.farmId,
        body.type,
        body.sex,
        body.phaseId,
        body.breedId,
        body.code,
        body.ageDays,
        body.initialPrice,
        body.weights
      ),
    ];
  }
}
