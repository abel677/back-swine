import { Request, Response } from "express";
import { CreateBreedDto } from "../application/dtos/create-breed.dto";
import { CreateBreedUseCase } from "../application/use-cases/create-breed.usecase";
import { BreedMapper } from "../infrastructure/mappers/breed.mapper";
import { ApiError } from "../../shared/exceptions/custom-error";
import { GetAllBreedUseCase } from "../application/use-cases/get-all-breed.usecase";
import { UpdateBreedUseCase } from "../application/use-cases/update-breed.usecase";
import { UpdateBreedDto } from "../application/dtos/update-breed.dto";

export class BreedController {
  constructor(
    private readonly createBreedUseCase: CreateBreedUseCase,
    private readonly updateBreedUseCase: UpdateBreedUseCase,
    private readonly getAllBreedsUseCase: GetAllBreedUseCase
  ) {}

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const breeds = await this.getAllBreedsUseCase.execute(userId);
    const result = breeds.map((breed) =>
      BreedMapper.fromDomainToHttpResponse(breed)
    );
    return res.status(201).json(result);
  };

  update = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const id = req.params.id;
    const [error, dto] = UpdateBreedDto.create(req.body);
    if (error) throw ApiError.badRequest(error);

    const breed = await this.updateBreedUseCase.execute(userId, id, dto);
    return res.status(201).json({
      message: "Raza actualizada con exito.",
      breed: BreedMapper.fromDomainToHttpResponse(breed),
    });
  };

  create = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const [error, dto] = CreateBreedDto.create(req.body);
    if (error) throw ApiError.badRequest(error);

    const breed = await this.createBreedUseCase.execute(userId, dto);
    return res.status(201).json({
      message: "Raza registrada con exito.",
      breed: BreedMapper.fromDomainToHttpResponse(breed),
    });
  };
}
