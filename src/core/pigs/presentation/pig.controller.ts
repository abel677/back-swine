import { Request, Response } from "express";
import { CreatePigUseCase } from "../application/use-cases/create-pig.usecase";
import { CreatePigDto } from "../application/dtos/create-pig.dto";
import { ApiError } from "../../shared/exceptions/custom-error";
import { GetAllPigUseCase } from "../application/use-cases/get-all-pig.usecase";
import { CreateWeightPigDto } from "../application/dtos/create-weight.dto";
import { CreatePigWeightUseCase } from "../application/use-cases/create-pig-weight.usecase";
import { UpdatePigDto } from "../application/dtos/update-pig.dto";
import { UpdatePigUseCase } from "../application/use-cases/update-pig.usecase";

export class PigController {
  constructor(
    private readonly createPigUseCase: CreatePigUseCase,
    private readonly getAllPigUseCase: GetAllPigUseCase,
    private readonly createPigWeightUseCase: CreatePigWeightUseCase,
    private readonly updatePigWeightUseCase: UpdatePigUseCase
  ) {}

  delete = async (req: Request, res: Response) => {};

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const result = await this.getAllPigUseCase.execute(userId);
    return res.status(200).json(result);
  };

  update = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const id = req.params.id;

    const [error, dto] = UpdatePigDto.create(req.body);
    if (error) throw ApiError.badRequest(error);

    const result = await this.updatePigWeightUseCase.execute(userId, id, dto);

    return res.status(201).json({
      message: "Cerdo actualizado con exito.",
      pig: result,
    });
  };

  create = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;

    const [error, dto] = CreatePigDto.create(req.body);
    if (error) throw ApiError.badRequest(error);

    const result = await this.createPigUseCase.execute(userId, dto);

    return res.status(201).json({
      message: "Cerdo registrado con exito.",
      pig: result,
    });
  };

  createPigWight = async (req: Request, res: Response) => {
    const pigId = req.params.id;
    const [error, dto] = CreateWeightPigDto.create(req.body);
    if (error) throw ApiError.badRequest(error);

    const result = await this.createPigWeightUseCase.execute(pigId, dto);
    return res.status(201).json({
      message: "Peso agregado con exito.",
      data: result,
    });
  };
}
