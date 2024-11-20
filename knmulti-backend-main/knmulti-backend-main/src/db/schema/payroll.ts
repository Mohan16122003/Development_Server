import moment from "moment";
import { Document, Types, Schema } from "mongoose";
import { GeneralLedger } from "../../models/generalLedger";
import { Employee } from "../../models/employee";

interface IPayroll extends Document {
  employeeId: number;
  fromDate: Date;
  Payroll_status: String;
  toDate: Date;
  salaryRate: {
    DA: number,
    HRA: number,
    MA: number,
    TA: number,
    basicSalary: number,
    totalSalary: number,
  };
  attendance: {
    festiveLeaves: number,
    paidLeaves: number,
    presentDays: number,
    totalDays: number,
    unpaidLeaves: number,
    weeklyOff: number,
    workingHours: number
  };
  earnedSalary: {
    gorssMA: number,
    gorssTA: number,
    grossBasic: number,
    grossDA: number,
    grossHRA: number,
    grossSalary:number
  };
  deduction: {
    ESIdiduct: number,
    PFamount: number,
    advanceAmount: number,
    total:number
  };
  netSalary: number;
  connfirm: number;
  description: string;
}

const payrollSchema = new Schema<IPayroll>({
  employeeId: {
    type: Number, ref: "Employee"
  },
  fromDate: Date,
  Payroll_status: String,
  toDate: Date,
  salaryRate: {
    DA: Number,
    HRA: Number,
    MA: Number,
    TA: Number,
    basicSalary: Number,
    totalSalary: Number,
  },
  attendance: {
    festiveLeaves: Number,
    paidLeaves: Number,
    presentDays: Number,
    totalDays: Number,
    unpaidLeaves: Number,
    weeklyOff: Number,
    workingHours: Number
  },
  earnedSalary: {
    gorssMA: Number,
    gorssTA: Number,
    grossBasic: Number,
    grossDA: Number,
    grossHRA: Number,
    grossSalary:Number
  },
  deduction: {
    ESIdiduct: Number,
    PFamount: Number,
    advanceAmount: Number,
    total:Number
  },
  netSalary: Number,
  connfirm: Number,
  description: String,
},
  {
    timestamps: true
  });

// payrollSchema.post("save", async function(next){

//   const emp = await Employee.findById(this?.employeeId);
//   const tt = 0 - this?.netSalary;
//   const gl = {
//     date: moment().format("YYYY-MM-DD"),
//     journalId: `JL-${Math.ceil(Math.random()*100000)}`,
//     referenceId: `RTX-${Math.ceil(Math.random()*100000)}`,
//     notes: "payroll",
//     journalType : "payed",
//     currency: "INR",
//     category: "employee",
//     clientName: { 
//       userId: this?.employeeId,
//       name: emp?.name
//     },
//     transaction: [{
//       account: "cash",
//       description: "Payroll Payment",
//       debits: this?.netSalary,
//       credits: 0
//     }],
//     total: tt
//   }
//   await GeneralLedger.create(gl)
//   next();
// })


export { IPayroll, payrollSchema };
