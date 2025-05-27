export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string
  ) {
    super(message);
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }
  static unauthorize(message: string) {
    return new ApiError(401, message);
  }
  static notFound(message: string) {
    return new ApiError(404, message);
  }
  static internalServer(message: string = "Internal Server Error") {
    return new ApiError(500, message);
  }
}
