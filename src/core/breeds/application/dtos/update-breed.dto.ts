export class UpdateBreedDto {
  private constructor(public name?: string) {}

  static create(body: { [key: string]: any }): [string?, UpdateBreedDto?] {
    if (!body.name) {
      return ["name: Nombre de fase faltante."];
    }

    return [null, new UpdateBreedDto(body.name)];
  }
}
