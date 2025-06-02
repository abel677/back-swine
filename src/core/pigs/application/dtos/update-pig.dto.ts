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
      id?: string;
      days?: number;
      weight?: number;
    }[],
    public readonly pigProducts?: {
      id?: string;
      productId?: string;
      quantity?: number;
      price?: number;
      date?: string;
      observation?: number;
    }[],
    public readonly reproductiveStateId?: string,
    public readonly boarId?: string,
    public readonly startDate?: Date,

    public readonly numberMalePiglets?: number,
    public readonly numberFemalePiglets?: number,
    public readonly numberDeadPiglets?: number,
    public readonly averageLiterWeight?: number
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
      body.ageDays &&
      (typeof body.ageDays !== "number" ||
        body.ageDays < 0 ||
        !Number.isInteger(body.ageDays))
    ) {
      return ["ageDays: Edad en días inválida. Debe ser un entero positivo."];
    }

    // Validación de initialPrice
    if (
      body.initialPrice &&
      (typeof body.initialPrice !== "number" || body.initialPrice < 0)
    ) {
      return [
        "initialPrice: Precio inicial inválido. Debe ser un número positivo.",
      ];
    }

    // Validación de weights (array de objetos {id?, days, weight})
    if (body.weights) {
      if (!Array.isArray(body.weights)) {
        return ["weights: Debe ser un array de objetos {id?, days, weight}"];
      }

      for (const weight of body.weights) {
        // Validar days
        if (
          weight.days &&
          (typeof weight.days !== "number" ||
            weight.days < 0 ||
            !Number.isInteger(weight.days))
        ) {
          return ["weights: El campo 'days' debe ser un entero positivo"];
        }

        // Validar weight
        if (
          weight.weight &&
          (typeof weight.weight !== "number" || weight.weight <= 0)
        ) {
          return [
            "weights: El campo 'weight' debe ser un número positivo mayor que cero",
          ];
        }
      }
    }

    // Validación de pigProduct (array de objetos {})
    if (body.pigProducts) {
      if (!Array.isArray(body.pigProducts)) {
        return [
          "pigProducts: Debe ser un array de objetos {id?, productId, quantity, price, date, observation?}",
        ];
      }

      for (const product of body.pigProducts) {
        if (product.productId && !Validators.isValidUUID(product.productId)) {
          return ["productId: ID inválido o faltante."];
        }
        if (
          product.quantity &&
          (typeof product.quantity !== "number" || product.quantity <= 0)
        ) {
          return ["quantity: Precio inválido o faltante."];
        }
        if (
          product.price &&
          (typeof product.price !== "number" || product.price <= 0)
        ) {
          return ["price: Precio inválido o faltante."];
        }
        if (body.date && !Validators.date.test(product.date)) {
          return ["date: Fecha inválida o faltante."];
        }
      }
    }

    // Datos reproductivos

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

        body.weights,
        body.pigProducts,

        body.reproductiveStateId,
        body.boarId,
        new Date(body.startDate),

        body.numberMalePiglets,
        body.numberFemalePiglets,
        body.numberDeadPiglets,
        body.averageLiterWeight
      ),
    ];
  }
}
