import { Request, Response } from "express";
import { CreateFarmDto } from "../application/dtos/create-farm.dto";
import { ApiError } from "../../shared/exceptions/custom-error";
import { CreateFirstFarmUseCase } from "../application/use-cases/create-first-farm.usecase";
import { GetAllFarmsUseCase } from "../application/use-cases/get-all-farms.usecase";

export class FarmController {
  constructor(
    private readonly createFirstFarmUseCase: CreateFirstFarmUseCase,
    private readonly getAllFarmsUseCase: GetAllFarmsUseCase
  ) {}

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const result = await this.getAllFarmsUseCase.execute(userId);
    return res.status(201).json(result);
  };

  createFirst = async (req: Request, res: Response) => {
    const ownerId = req.body.payload.id;
    req.body.ownerId = ownerId;
    const [error, dto] = CreateFarmDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const result = await this.createFirstFarmUseCase.execute(dto);
    return res.status(201).json(result);
  };
}
