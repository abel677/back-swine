import { Request, Response } from "express";
import { CreateCategoryUseCase } from "../application/use-cases/create-category.usecase";
import { UpdateCategoryUseCase } from "../application/use-cases/update-category.usecase";
import { GetAllCategoryUseCase } from "../application/use-cases/get-all-category.usecase";
import { CreateCategoryDto } from "../application/dtos/create-category.dto";
import { ApiError } from "../../shared/exceptions/custom-error";
import { CategoryMapper } from "../infrastructure/mappers/category.mapper";
import { UpdateCategoryDto } from "../application/dtos/update-category.dto";

export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly getAllCategoryUseCase: GetAllCategoryUseCase
  ) {}

  delete = async (req: Request, res: Response) => {};

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const categories = await this.getAllCategoryUseCase.execute(userId);
    const result = categories.map((category) =>
      CategoryMapper.fromDomainToHttpResponse(category)
    );
    return res.status(200).json(result);
  };

  update = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const id = req.params.id;
    const [error, dto] = UpdateCategoryDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const category = await this.updateCategoryUseCase.execute(userId, id, dto);
    return res.status(201).json({
      message: "Categoria actualizada con exito.",
      category: CategoryMapper.fromDomainToHttpResponse(category),
    });
  };

  create = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const [error, dto] = CreateCategoryDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const category = await this.createCategoryUseCase.execute(userId, dto);
    return res.status(201).json({
      message: "Categoria registrada con exito.",
      category: CategoryMapper.fromDomainToHttpResponse(category),
    });
  };
}
