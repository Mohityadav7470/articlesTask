import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: string | jwt.JwtPayload;
}

const verifyAccessToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new Error("Forbidden: No access token provided");
  }

  try {
    jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
      (
        err: jwt.VerifyErrors | null,
        decoded: jwt.JwtPayload | string | undefined
      ) => {
        if (err) {
          // return res.status(403).json({ message: "Forbidden" });
          throw new Error("Forbidden: Invalid token");
        }
        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    console.error("Invalid access token:", error);
    throw new Error("Forbidden: Invalid access token");
  }
};
export { verifyAccessToken, AuthenticatedRequest };
