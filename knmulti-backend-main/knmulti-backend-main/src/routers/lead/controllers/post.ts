import { Response } from "express";
import { Lead } from "../../../models";
import RequestWithUser from "../../../utils/requestWithUser";

export default async function controllerPost(
  req: RequestWithUser,
  res: Response
) {
  const data = req.body;
  const lead = await Lead.create(data);
  res.status(200).json(lead);
}
