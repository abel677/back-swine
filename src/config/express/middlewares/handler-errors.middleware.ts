import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../../core/shared/exceptions/custom-error";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      //...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Para errores inesperados (no operacionales)
  console.error("💥 Error no manejado:", err);
  return res.status(500).json({
    status: "error",
    message: "Algo salió mal",
    //...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
