import { Request, Response } from "express";
import { EmployeeType } from "../../../models/";

export default async function controllerGet(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  if (id) {
    const leaveType = await EmployeeType.findById(id);
    res.status(200).json(leaveType);
  } else {
    const leaveTypes = await EmployeeType.find({});
    res.status(200).json(leaveTypes);
  }
}
