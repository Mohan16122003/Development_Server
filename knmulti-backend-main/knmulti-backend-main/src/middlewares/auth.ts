// verify auth token in the request header

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Employee } from "../models/employee";

export default async function auth(req: Request, res: Response, next: any) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  try {
    jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET!,
      async (err: any, decoded: any) => {
        if (err) {
          return res.status(401).send({ message: "Unauthorized" });
        }
        const user = await Employee.findById(decoded.id).populate('jobRole');
        if (user) {
          // console.log(user);
          (req as any).user = user;
          return next();
        }
        return res.status(401).send({ message: "Unauthorized" });
      }
    );
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized" });
  }
}

