import { Request, Response } from "express";
import { CreateBoarDto } from "../application/dtos/create-boar.dto";
import { ApiError } from "../../shared/exceptions/custom-error";
import { CreateBoarUseCase } from "../application/use-cases/create-boar.usecase";
import { GetAllBoarUseCase } from "../application/use-cases/get-all-boar.usecase";

export class BoarController {
  constructor(
    private readonly createBoarUseCase: CreateBoarUseCase,
    private readonly getAllBoarUseCase: GetAllBoarUseCase
  ) {}

  delete = async (req: Request, res: Response) => {};

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const boards = await this.getAllBoarUseCase.execute(userId);
    return res.status(200).json(boards);
  };

  update = async (req: Request, res: Response) => {};

  create = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const [error, dto] = CreateBoarDto.create(req.body);

    if (error) throw ApiError.badRequest(error);
    const boar = await this.createBoarUseCase.execute(userId, dto);
    return res.status(201).json({
      message: "Cerdo reproductor registrado con exito.",
      boar: boar,
    });
  };
}
