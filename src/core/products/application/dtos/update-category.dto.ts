export class UpdateCategoryDto {
  private constructor(public name?: string) {}

  static create(body: { [key: string]: any }): [string?, UpdateCategoryDto?] {
    if (!body.name) {
      return ["name: Nombre de categoria faltante."];
    }

    return [null, new UpdateCategoryDto(body.name)];
  }
}
