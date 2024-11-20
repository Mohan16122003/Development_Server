import { Request, Response } from "express";
import { validateTimesheet } from "../../../validators";
import { Timesheet } from "../../../models/timesheet";

export default async function controllerPost(req: Request, res: Response) {
  const data = req.body;
  const errors = await validateTimesheet(data);
  if (errors?.length) {
    res.status(400).json(errors);
    return;    
  }
  const timesheet = new Timesheet(data);
  let response = await timesheet.save();
  if (response) {
    res.status(200).json(response);
  } else {
    res.status(404).json({ message: "timesheet not found" });
  }
}