import { Validators } from "../../../shared/utils/Validators";

export class ApplyProductDto {
  private constructor(
    public readonly productoId: string,
    public readonly pigs: string[],
    public readonly quantity: number,
    public readonly price: number,
    public readonly date: string,
    public readonly observation?: number
  ) {}

  static create(body: { [key: string]: any }): [string?, ApplyProductDto?] {
    if (!Validators.isValidUUID(body.productoId)) {
      return ["productoId: ID inválido o faltante."];
    }

    if (body.pigs && !Array.isArray(body.pigs)) {
      return ["pigs: Lista de cerdos inválido o faltante."];
    }

    if (typeof body.quantity !== "number" || body.quantity < 0) {
      return ["quantity: Cantidad inválido o faltante."];
    }

    if (typeof body.quantity !== "number" || body.quantity < 0) {
      return ["quantity: Cantidad inválido o faltante."];
    }

    if (typeof body.price !== "number" || body.price < 0) {
      return ["price: Precio inválido o faltante."];
    }
    if (!Validators.date.test(body.date)) {
      return ["date: Fecha inválida o faltante."];
    }

    return [
      null,
      new ApplyProductDto(
        body.productoId,
        body.pigsIds,
        body.quantity,
        body.price,
        body.date,
        body.observation
      ),
    ];
  }
}
