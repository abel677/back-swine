import jwt from "jsonwebtoken";
import { TokenService } from "../domain/token-service.port";

export class JwtService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly defaultExpiration: number = Math.floor(Date.now() / 1000) +
      60 * 60
  ) {}

  async generateToken(
    payload: object,
    duration: number = this.defaultExpiration
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        this.secret,
        {
          expiresIn: duration,
        },
        (err, token) => {
          if (err) return resolve(null);
          resolve(token!);
        }
      );
    });
  }

  validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, this.secret, (error, decoded) => {
        if (error) resolve(null);
        resolve(decoded as T);
      });
    });
  }
}
