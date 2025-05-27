import { Validators } from "../../../shared/utils/Validators";

export class SignInDto {
  private constructor(public email: string, public password: string) {}

  static create(body: { [key: string]: any }): [string?, SignInDto?] {
    if (!Validators.email.test(body.email)) {
      return ["email: Correo electrónico inválido."];
    }
    if (!body.password) {
      return ["password: Contraseña faltante."];
    }
    return [null, new SignInDto(body.email, body.password)];
  }
}
