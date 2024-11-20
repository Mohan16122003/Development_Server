import { Request, Response } from "express";
import { Employee } from "../../../models/employee";

export default async function controllerGet(req: Request, res: Response) {
  const { id } = req.params;
  const { username, email } = req.query;
  if (id) {
    const employee = await Employee.findById(id, {
      password: 0,
    })
      .populate("jobRole")
      .populate("workLocation")
      .populate("department")
      .populate("employeeType");
    if (employee) {
      res.status(200).json(employee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } else if (username) {
    const userExist = await Employee.findOne({ userName: username });
    if (userExist) {
      res
        .status(200)
        .json({ message: "Username Already Exists", state: false });
    } else {
      res.status(200).json({ message: "Username Available", state: true });
    }
  } else if (email) {
    const userExist = await Employee.findOne({ email: email });
    if (userExist) {
      res.status(200).json({ message: "Email Already Exists", state: false });
    } else {
      res.status(200).json({ message: "Email Available", state: true });
    }
  } else {
    const { page = 1, limit = 100 } = req.query;
    const employees = await Employee.find(
      {},
      {
        password: 0,
      }
    )
      .populate("jobRole")
      .populate("workLocation")
      .populate("department")
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(limit as string) * (parseInt(page as string) - 1));
    res.status(200).json(employees);
  }
}
