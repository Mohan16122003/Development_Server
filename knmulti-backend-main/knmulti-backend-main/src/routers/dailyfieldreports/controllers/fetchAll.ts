import { Request, Response } from "express";
import { DFReport } from "../../../models/dailyfilledreport";


export default async function  getDFRsAll(req: Request, res: Response) {
  try{
    const data = await DFReport.find();
    res.status(200).json(data)
  }catch(err){
    res.status(500).json({message:"Error while getting DFR's",err})
  }
}