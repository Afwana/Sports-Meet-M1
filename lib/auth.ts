import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: string;
  employeeCode: string;
  role: "Employee" | "Captain";
}

export function createToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
