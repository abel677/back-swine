import { Request, Response } from "express";
import { SignUpDto } from "../application/dtos/sign-up.dto";
import { ApiError } from "../../shared/exceptions/custom-error";
import { SignUpUseCase } from "../application/use-cases/sign-up.usecase";
import { SignInDto } from "../application/dtos/sign-in.dto";
import { SignInUseCase } from "../application/use-cases/sign-in.usecase";
import { VerifyAccountUseCase } from "../application/use-cases/verify-account.usecase";

export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly verifyAccountUseCase: VerifyAccountUseCase
  ) {}

  verify = async (req: Request, res: Response) => {
    const token = req.params.token;
    const result = await this.verifyAccountUseCase.execute(token);
    return res.status(200).send(result);
  };

  signIn = async (req: Request, res: Response) => {
    const [error, dto] = SignInDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const result = await this.signInUseCase.execute(dto);
    return res.status(201).json(result);
  };

  signUp = async (req: Request, res: Response) => {
    const [error, dto] = SignUpDto.create(req.body);
    if (error) throw ApiError.badRequest(error);
    const result = await this.signUpUseCase.execute(dto);
    return res.status(201).json(result);
  };
}
