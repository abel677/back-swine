export interface TokenService {
  generateToken<T extends object>(
    payload: T,
    duration?: string | number
  ): Promise<string | null>;

  validateToken<T extends object>(token: string): Promise<T | null>;
}
