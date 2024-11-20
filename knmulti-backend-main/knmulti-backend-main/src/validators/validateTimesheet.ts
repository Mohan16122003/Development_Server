import { ITimesheet } from "../db/schema/timesheet";
import { Employee } from "../models/employee";
const validateTimesheet = async(timesheet: ITimesheet) => {
  const errors: Array<{ message: string }> = [];
  if (!timesheet) return [{ message: "No data was provided" }];
  if (!timesheet.employee) errors.push({ message: "Employee Id is required" });
  if (!timesheet.date)
    errors.push({ message: "Data format error" });
  let empData = await Employee.findOne({_id:timesheet.employee});
  if(empData){
    let joinDate= new Date(empData.joinDate).getTime();
    let attendanceTime = new Date(timesheet.date).getTime();
    if(joinDate>attendanceTime){
      errors.push({message:"Employee Not Registred On This Date"})
    }
  }
  return errors;
};

export default validateTimesheet;
