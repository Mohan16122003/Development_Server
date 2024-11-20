import { Request, Response } from "express";
import { DFReport } from "../../../models/dailyfilledreport";

export default async function createDFR(req: Request, res: Response) {
try{
    const data = await DFReport.create(req.body);
    res.status(201).json(data);
}catch(err){
    res.status(500).json({message:"error while creating a New DFR"})
}
}