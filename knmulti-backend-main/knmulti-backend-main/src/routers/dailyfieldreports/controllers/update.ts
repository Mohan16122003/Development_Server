import { Request, Response } from "express";
import { DFReport } from "../../../models/dailyfilledreport";


export default async function  updateDFR(req: Request, res: Response) {
  try{
    const { id } = req.params;
    const data = await DFReport.findByIdAndUpdate({_id:id},req.body);
    res.status(200).json(data)
  }catch(err){
    res.status(500).json({message:"Error while getting DFR's",err})
  }
}