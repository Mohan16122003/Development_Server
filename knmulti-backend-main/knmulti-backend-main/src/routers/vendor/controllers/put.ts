// create an express put route for the vendor model

import { Request, Response } from "express";
import { Vendor } from "../../../models";
import mongoose from "mongoose";

export default async function controllerPut(req: Request, res: Response) {
  const { id } = req.params;
  if (id) {
    const vendor = await Vendor.findByIdAndUpdate(id, req.body, { new : true }).populate("projectList");
    if (vendor) {
      res.json(vendor);
    } else {
      res.status(404).json({ error: "Vendor not found" });
    }
  } else {
    res.status(400).json({ error: "Vendor id is required" });
  }
}

export const controllerComment = async(req:any,res:any)=>{
  const {id} = req.params;
  try{
    let vendorExist:any = await Vendor.findById(id);
    if(vendorExist){
      vendorExist.comments.push(req.body)
      await vendorExist.save()
      return res.status(200).json(vendorExist);
    }
  }catch(err){
    res.status(400).json({error:err})
  }
}

export const deleteComment = async(req:any, res:any)=>{
  let {id } = req.params;
  let {comment_id} = req.body;
  try{
    let vendor:any = await Vendor.findByIdAndUpdate(id, {$pull:{comments:{_id:comment_id}}},{new:true});
    return res.status(200).json(vendor)
  }catch(err){
    console.log(err);
    return res.status(400).json({error:err})
  }
}