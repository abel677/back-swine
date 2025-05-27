import { Validators } from "../../../shared/utils/Validators";

export class CreateProductDto {
  private constructor(
    public farmId: string,
    public categoryId: string,
    public name: string,
    public price: number,
    public description?: string
  ) {}

  static create(body: { [key: string]: any }): [string?, CreateProductDto?] {
    if (!Validators.isValidUUID(body.farmId)) {
      return ["farmId: ID de granja inválido o faltante."];
    }
    if (!Validators.isValidUUID(body.categoryId)) {
      return ["categoryId: ID de categoria inválido o faltante."];
    }

    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return ["name: Nombre de producto faltante o inválido."];
    }

    if (body.price === undefined || body.price === null) {
      return ["price: Precio de producto faltante."];
    }

    if (typeof body.price !== "number" || body.price < 0) {
      return [
        "price: Precio de producto debe ser un número mayor o igual a cero.",
      ];
    }

    if (
      body.description !== undefined &&
      typeof body.description !== "string"
    ) {
      return ["description: La descripción debe ser un texto si se envía."];
    }

    return [
      null,
      new CreateProductDto(
        body.farmId,
        body.categoryId,
        body.name.trim(),
        body.price,
        body.description?.trim()
      ),
    ];
  }
}
