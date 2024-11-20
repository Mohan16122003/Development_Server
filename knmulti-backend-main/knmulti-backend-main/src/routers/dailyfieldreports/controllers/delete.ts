import { Request, Response } from "express";
import { DFReport } from "../../../models/dailyfilledreport";


export default async function  deleteDFR(req: Request, res: Response) {
  try{
    const { id } = req.params;
    await DFReport.findByIdAndDelete({_id:id});
    res.status(200).json({message:"DFR deleted successfully"})
  }catch(err){
    res.status(500).json({message:"Error while deling DFR",err})
  }
}