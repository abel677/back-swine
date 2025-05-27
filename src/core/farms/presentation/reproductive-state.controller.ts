import { Request, Response } from "express";
import { CreateReproductiveStateUseCase } from "../application/use-cases/reproductive-state/create-reproductive-state.usecase";
import { GetAllReproductiveStateUseCase } from "../application/use-cases/reproductive-state/get-all-reproductive-state.usecase";
import { ReproductiveStateMapper } from "../infrastructure/mappers/reproductive-state.mapper";

import { ApiError } from "../../shared/exceptions/custom-error";
import { UpdateReproductiveStateUseCase } from "../application/use-cases/reproductive-state/update-reproductive-state.usecase";
import { UpdateReproductiveStateDto } from "../application/dtos/reproductive-state/update-reproductive-state.dto";
import { CreateReproductiveStateDto } from "../application/dtos/reproductive-state/create-reproductive-state.dto";

export class ReproductiveStateController {
  constructor(
    private readonly createReproductiveStateUseCase: CreateReproductiveStateUseCase,
    private readonly updateReproductiveStateUseCase: UpdateReproductiveStateUseCase,
    private readonly getAllReproductiveStateUseCase: GetAllReproductiveStateUseCase
  ) {}

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const reproductiveStates =
      await this.getAllReproductiveStateUseCase.execute(userId);
    const result = reproductiveStates.map((reproductiveState) =>
      ReproductiveStateMapper.fromDomainToHttpResponse(reproductiveState)
    );
    return res.status(200).json(result);
  };

  update = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const id = req.params.id;
    const [error, dto] = UpdateReproductiveStateDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const reproductiveState = await this.updateReproductiveStateUseCase.execute(
      userId,
      id,
      dto
    );
    return res.status(201).json({
      message: "Estado reproductivo actualizado con exito.",
      reproductiveState:
        ReproductiveStateMapper.fromDomainToHttpResponse(reproductiveState),
    });
  };

  create = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const [error, dto] = CreateReproductiveStateDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const reproductiveState = await this.createReproductiveStateUseCase.execute(
      userId,
      dto
    );
    return res.status(201).json({
      message: "Estado reproductivo registrado con exito.",
      reproductiveState:
        ReproductiveStateMapper.fromDomainToHttpResponse(reproductiveState),
    });
  };
}
