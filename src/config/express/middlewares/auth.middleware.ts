import { NextFunction, Request, Response } from "express";
import { envConfig } from "../../envs";
import { JwtService } from "../../../core/shared/infrastructure/jwt.service";

const { JWT_SECRET } = envConfig;
const tokenService = new JwtService(JWT_SECRET);

export class AuthMiddleware {
  static validateJWT = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authorization = req.header("Authorization");

    if (!authorization) {
      return res.status(401).json({ error: "No autorizado." });
    }
    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token de acceso no valido." });
    }

    const token = authorization.split(" ").at(1) ?? "";

    try {
      const payload = await tokenService.validateToken<{ id: string }>(token);
      if (!payload) {
        return res.status(401).json({ error: "Token de acceso no valido." });
      }

      req.body.payload = payload;

      next();
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
