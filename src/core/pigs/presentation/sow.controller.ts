import { Request, Response } from "express";
import { ApiError } from "../../shared/exceptions/custom-error";
import { CreateSowUseCase } from "../application/use-cases/create-sow.usecase";
import { CreateSowDto } from "../application/dtos/create-sow.dto";
import { GetAllSowUseCase } from "../application/use-cases/get-all-sow.usecase";
import { UpdateSowUseCase } from "../application/use-cases/update-sow.usecase";
import { UpdateSowDto } from "../application/dtos/update-sow.dto";

export class SowController {
  constructor(
    private readonly createSowUseCase: CreateSowUseCase,
    private readonly getAllSowUseCase: GetAllSowUseCase,
    private readonly updateSowUseCase: UpdateSowUseCase
  ) {}

  delete = async (req: Request, res: Response) => {};

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const result = await this.getAllSowUseCase.execute(userId);
    return res.status(200).json(result);
  };

  update = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const id = req.params.id;

    const [error, dto] = UpdateSowDto.create(req.body);
    if (error) throw ApiError.badRequest(error);

    const result = await this.updateSowUseCase.execute(userId, id, dto);

    return res.status(201).json({
      message: "Cerda actualizada con exito.",
      sow: result,
    });
  };

  create = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;

    const [error, dto] = CreateSowDto.create(req.body);
    if (error) throw ApiError.badRequest(error);

    const result = await this.createSowUseCase.execute(userId, dto);

    return res.status(201).json({
      message: "Cerda reproductora registrada con exito.",
      sow: result,
    });
  };
}
