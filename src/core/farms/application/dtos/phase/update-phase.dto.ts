export class UpdatePhaseDto {
  private constructor(public name?: string) {}

  static create(body: { [key: string]: any }): [string?, UpdatePhaseDto?] {
    if (!body.name) {
      return ["name: Nombre de fase faltante."];
    }

    return [null, new UpdatePhaseDto(body.name)];
  }
}
