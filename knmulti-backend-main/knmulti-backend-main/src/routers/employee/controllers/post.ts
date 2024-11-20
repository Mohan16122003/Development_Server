import { Request, Response } from "express";
import { Employee } from "../../../models/employee";
import { validateEmployee } from "../../../validators";
import bcrypt from "bcryptjs";

export default async function controllerPost(req: Request, res: Response) {
  const data = req.body;
  // const isempUN = await
  const errors = validateEmployee(data);
  if (errors.length) {
    return res.status(400).json(errors);
  }
  let isExists: any = false;
  isExists = await Employee.findOne({ email: data.email });
  if (isExists) {
    return res.status(400).json({ message: "This email id is already exist" });
  }
  isExists = await Employee.findOne({ userName: data.userName });
  if (isExists) {
    return res.status(400).json({ message: "This username is already exist" });
  }
  data.password = await bcrypt.hash(data.password, 10);
  try {
    const employee = await Employee.create(data);
    res.status(201).json(employee);
  } catch (err: any) {
    console.log("Error", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
  // const employee = new Employee(data);
  // employee.save((err, employee) => {
  //   if (err) {
  //     res.status(500).json({ msg: "userName or Email already exits!" });
  //     return;
  //   } else {
  //     res.status(200).json(employee);
  //   }
  // });
}
