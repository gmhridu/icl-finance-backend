export interface IJwtPayload {
  userId: string;
  [key: string]: any;
  number?: string;
  state?: string;         // encrypted timestamp
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}