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
      observation?: string;
    }[],
    public readonly sowReproductiveHistory?: {
      id?: string;
      reproductiveState?: {
        id?: string;
        name?: string;
      };
      startDate?: string;
      boarId?: string;
      birth?: {
        malePiglets?: number;
        femalePiglets?: number;
        deadPiglets?: number;
        averageLitterWeight?: number;
      };
    }[]
  ) {}

  static create(body: { [key: string]: any }): [string?, UpdatePigDto?] {
    if (body.farmId && !Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }

    if (body.type && !Object.values(PigType).includes(body.type)) {
      return [
        `type: Tipo de cerdo inválido. Valores permitidos: ${Object.values(
          PigType
        ).join(", ")}`,
      ];
    }

    if (body.sex && !Object.values(PigSex).includes(body.sex)) {
      return [
        `sex: Sexo del cerdo inválido. Valores permitidos: ${Object.values(
          PigSex
        ).join(", ")}`,
      ];
    }

    if (body.phaseId && !Validators.isValidUUID(body.phaseId)) {
      return ["phaseId: ID de fase inválido."];
    }

    if (body.breedId && !Validators.isValidUUID(body.breedId)) {
      return ["breedId: ID de raza inválido."];
    }

    if (
      body.code &&
      typeof body.code === "string" &&
      !Validators.isValidTagNumber(body.code)
    ) {
      return [
        "code: Código del cerdo inválido. Solo se permite: letras, números y guiones.",
      ];
    }

    if (
      body.ageDays !== undefined &&
      (typeof body.ageDays !== "number" ||
        body.ageDays < 0 ||
        !Number.isInteger(body.ageDays))
    ) {
      return ["ageDays: Edad en días inválida. Debe ser un entero positivo."];
    }

    if (
      body.initialPrice !== undefined &&
      (typeof body.initialPrice !== "number" || body.initialPrice < 0)
    ) {
      return [
        "initialPrice: Precio inicial inválido. Debe ser un número positivo.",
      ];
    }

    if (body.weights) {
      if (!Array.isArray(body.weights)) {
        return ["weights: Debe ser un array de objetos {id?, days, weight}"];
      }

      for (const weight of body.weights) {
        if (
          weight.days !== undefined &&
          (typeof weight.days !== "number" ||
            weight.days < 0 ||
            !Number.isInteger(weight.days))
        ) {
          return ["weights: El campo 'days' debe ser un entero positivo"];
        }

        if (
          weight.weight !== undefined &&
          (typeof weight.weight !== "number" || weight.weight <= 0)
        ) {
          return [
            "weights: El campo 'weight' debe ser un número positivo mayor que cero",
          ];
        }
      }
    }

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
          product.quantity !== undefined &&
          (typeof product.quantity !== "number" || product.quantity <= 0)
        ) {
          return ["quantity: Cantidad inválida o faltante."];
        }
        if (
          product.price !== undefined &&
          (typeof product.price !== "number" || product.price <= 0)
        ) {
          return ["price: Precio inválido o faltante."];
        }
        if (product.date && !Validators.date.test(product.date)) {
          return ["date: Fecha inválida o faltante."];
        }
        if (product.observation && typeof product.observation !== "string") {
          return ["observation: Debe ser una cadena de texto."];
        }
      }
    }

    if (body.sowReproductiveHistory) {
      if (!Array.isArray(body.sowReproductiveHistory)) {
        return [
          "sowReproductiveHistory: Debe ser un array de objetos {id?, reproductiveState?, startDate?, boarId?, birth?}",
        ];
      }

      for (const history of body.sowReproductiveHistory) {
        if (
          history.reproductiveState &&
          history.reproductiveState.id &&
          !Validators.isValidUUID(history.reproductiveState.id)
        ) {
          return ["reproductiveState: ID de estado reproductivo inválido."];
        }

        if (history.startDate && !Validators.date.test(history.startDate)) {
          return [
            "startDate: Fecha inicio estado reproductivo inválida o faltante.",
          ];
        }

        if (history.boarId && !Validators.isValidUUID(history.boarId)) {
          return ["boarId: ID cerdo reproductor inválido."];
        }

        if (history.birth) {
          const {
            malePiglets,
            femalePiglets,
            deadPiglets,
            averageLitterWeight,
          } = history.birth;

          if (
            femalePiglets !== undefined &&
            (typeof femalePiglets !== "number" || femalePiglets < 0)
          ) {
            return [
              "femalePiglets: Número de lechones hembras vivas obligatorio y debe ser válido.",
            ];
          }

          if (
            malePiglets !== undefined &&
            (typeof malePiglets !== "number" || malePiglets < 0)
          ) {
            return [
              "malePiglets: Número de lechones machos vivos obligatorio y debe ser válido.",
            ];
          }

          if (
            deadPiglets !== undefined &&
            (typeof deadPiglets !== "number" || deadPiglets < 0)
          ) {
            return [
              "deadPiglets: Número de lechones muertos obligatorio y debe ser válido.",
            ];
          }

          if (
            averageLitterWeight !== undefined &&
            (typeof averageLitterWeight !== "number" || averageLitterWeight < 0)
          ) {
            return [
              "averageLitterWeight: Peso promedio de la camada obligatorio y debe ser válido.",
            ];
          }
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
        body.weights,
        body.pigProducts,
        body.sowReproductiveHistory
      ),
    ];
  }
}
