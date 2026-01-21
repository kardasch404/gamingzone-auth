export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(userId: string): Promise<string>;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): { userId: string };
}
