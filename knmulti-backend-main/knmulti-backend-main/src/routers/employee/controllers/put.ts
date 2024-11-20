// create an express put route for the employee controller

import { Request, Response } from "express";
import { Employee } from "../../../models/employee";
import { validateEmployee } from "../../../validators";
import bcrypt from "bcryptjs";
export default async function controllerPut(req: Request, res: Response) {
  const data = req.body;
  const user = (req as any).user;
  // console.log('data',data);
  // const errors = validateEmployee(data);
  // if (errors.length) {
  //   res.status(400).json(errors);
  //   return;
  // }
  const { id } = req.params;
  if (id) {
    data?.password
      ? (data.password = await bcrypt.hash(data?.password, 10))
      : "";
    const employee = await Employee.findByIdAndUpdate(
      id,
      {
        userName: user.userName || user?.email,
        ...data,
      },
      { new: true }
    );
    if (employee) {
      res.status(200).json(employee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } else {
    res.status(400).json({ message: "Employee id is required" });
  }
}

// const controllerPut = async(req:Request,res:Response)=>{
//   try{
//   let employee =  await Employee.findByIdAndUpdate(req.params.id,req.body,{new:true})
//   console.log('employee after update =>',employee);
//   res.status(200).json(employee)
//   }catch(err){
//     res.status(400).json(err);
//   }
// }

// export default controllerPut
