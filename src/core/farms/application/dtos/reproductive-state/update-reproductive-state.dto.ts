export class UpdateReproductiveStateDto {
  private constructor(public name?: string) {}

  static create(body: {
    [key: string]: any;
  }): [string?, UpdateReproductiveStateDto?] {
    if (!body.name) {
      return ["name: Nombre de estado reproductivo faltante."];
    }

    return [null, new UpdateReproductiveStateDto(body.name)];
  }
}
