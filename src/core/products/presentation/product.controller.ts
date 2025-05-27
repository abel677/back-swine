import { Request, Response } from "express";
import { CreateProductUseCase } from "../application/use-cases/create-product.usecase";
import { UpdateProductUseCase } from "../application/use-cases/update-product.usecase";
import { GetAllProductUseCase } from "../application/use-cases/get-all-product.usecase";
import { CreateProductDto } from "../application/dtos/create-product.dto";
import { ApiError } from "../../shared/exceptions/custom-error";
import { ProductMapper } from "../infrastructure/mappers/product.mapper";
import { UpdateProductDto } from "../application/dtos/update-product.dto";

export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly getAllProductUseCase: GetAllProductUseCase
  ) {}

  delete = async (req: Request, res: Response) => {};

  getAll = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const products = await this.getAllProductUseCase.execute(userId);
    const result = products.map((product) =>
      ProductMapper.fromDomainToHttpResponse(product)
    );
    return res.status(200).json(result);
  };

  update = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const id = req.params.id;
    const [error, dto] = UpdateProductDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const product = await this.updateProductUseCase.execute(userId, id, dto);
    return res.status(201).json({
      message: "Producto actualizado con exito.",
      product: ProductMapper.fromDomainToHttpResponse(product),
    });
  };

  create = async (req: Request, res: Response) => {
    const userId = req.body.payload.id;
    const [error, dto] = CreateProductDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const product = await this.createProductUseCase.execute(userId, dto);
    return res.status(201).json({
      message: "Producto registrado con exito.",
      product: ProductMapper.fromDomainToHttpResponse(product),
    });
  };
}
