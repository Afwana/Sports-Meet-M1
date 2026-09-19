import jwt, { SignOptions } from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env.local");
  }

  return secret;
}

export interface AdminToken {
  id: string;
  username: string;
  role: "Admin";
}

export function createAdminToken(payload: AdminToken): string {
  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyAdminToken(token: string): AdminToken {
  const decoded = jwt.verify(token, getJwtSecret());

  return decoded as unknown as AdminToken;
}
