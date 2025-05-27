import { Request, Response } from "express";
import { CreatePhaseUseCase } from "../application/use-cases/phase/create-phase.usecase";
import { UpdatePhaseUseCase } from "../application/use-cases/phase/update-phase.usecase";
import { GetAllPhaseUseCase } from "../application/use-cases/phase/get-all-phase.usecase";
import { CreatePhaseDto } from "../application/dtos/phase/create-phase.dto";
import { ApiError } from "../../shared/exceptions/custom-error";
import { PhaseMapper } from "../infrastructure/mappers/phase.mapper";
import { UpdatePhaseDto } from "../application/dtos/phase/update-phase.dto";

export class PhaseController {
  constructor(
    private readonly createPhaseUseCase: CreatePhaseUseCase,
    private readonly updatePhaseUseCase: UpdatePhaseUseCase,
    private readonly getAllPhaseUseCase: GetAllPhaseUseCase
  ) {}

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const phases = await this.getAllPhaseUseCase.execute(userId);
    const result = phases.map((phase) =>
      PhaseMapper.fromDomainToHttpResponse(phase)
    );
    return res.status(200).json(result);
  };

  update = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const id = req.params.id;
    const [error, dto] = UpdatePhaseDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const phase = await this.updatePhaseUseCase.execute(userId, id, dto);
    return res.status(201).json({
      message: "Fase actualizada con exito.",
      phase: PhaseMapper.fromDomainToHttpResponse(phase),
    });
  };

  create = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const [error, dto] = CreatePhaseDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const phase = await this.createPhaseUseCase.execute(userId, dto);
    return res.status(201).json({
      message: "Fase registrada con exito.",
      phase: PhaseMapper.fromDomainToHttpResponse(phase),
    });
  };
}
