import { Validators } from "../../../shared/utils/Validators";

export class SignUpDto {
  private constructor(
    //public name: string,
    public email: string,
    public password: string
  ) {}

  static create(body: { [key: string]: any }): [string?, SignUpDto?] {
    // if (!body.name) {
    //   return ["name: Nombre de usuario faltante."];
    // }
    if (!Validators.email.test(body.email)) {
      return ["email: Correo electrónico inválido."];
    }
    if (!Validators.password.test(body.password)) {
      return [
        "password: La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
      ];
    }
    return [null, new SignUpDto(body.email, body.password)];
  }
}
