import { Router } from "express";
import auth from "../middlewares/auth";
import authRouter from "./auth";
import billRouter from "./bill";
import calenderRouter from "./calender";
import candidateRouter from "./candidate";
import categoryRouter from "./category";
import clientRouter from "./client";
import creditNotesRouter from "./creditNote"; 
import customerRouter from "./customer";
import dashboardRouter from "./dashboard";
import deliveryChallanRouter from "./deliveryChallan";
import departmentRouter from "./department";
import employeeTaskRouter from "./employeeTask";
import documentsRouter from "./document";
import emailRouter from "./email";
import employeeRouter from "./employee";
import expenseRouter from "./expense";
import generalLedgerRouter from "./generalLedger";
import goalRouter from "./goal";
import goalTypeRouter from "./goalType";
import holidayRouter from "./holiday";
import investmentRouter from "./investment";
import jobRouter from "./job";
import leadRouter from "./lead";
import leaveRouter from "./leave";
import leaveTypeRouter from "./leave-type";
import employeeTypeRouter from "./employee-type";
import loanRouter from "./loan";
import locationRouter from "./location";
import overtimeRouter from "./overtime";
import policyRouter from "./policy";
import projectRouter from "./project";
import providentFundRouter from "./providentFund";
import recurringInvoice from "./recurringInvoice";
import bulkTimesheetRouter from "./bulkTimesheetRouter"


import roleRouter from "./role";
import roleAccessPremRouter from "./roleAccessPrem";
import saleEstimateRouter from "./saleEstimate";
import saleInvoiceRouter from "./saleInvoice";
import salePaymentRouter from "./salePayment";
import saleReportRouter from "./saleReport";
import salesOrderRouter from "./salesOrder";
import taxRouter from "./tax";
import ticketsRouter from "./tickets";
import timesheetRouter from "./timesheet";
import vendorRouter from "./vendor";
import vendorCreditRouter from "./vendorCredit";
import vendorTransaction from "./vendorTransaction";
import stockRouter from "./Stock";
import fileCred from "./filesCrud";
import leadStatusRouter from "./leadStats";
import landSaleRouter from "./landSale";
import reportRouter from "./report";
import payrollRouter from "./payroll"; 
import mailRouter from "./mail";
import notifyRouter from "./notify";
import dfrRouter from "./dailyfieldreports";
import landBankRouter from "./landBank";

const router = Router();

router.use("/auth", authRouter);
router.use("/project", auth, projectRouter);
router.use("/dashboard", auth, dashboardRouter);
router.use("/department", auth, departmentRouter);
router.use("/employeeTask", employeeTaskRouter);
router.use("/role", auth, roleRouter);
router.use("/employee", auth, employeeRouter);
router.use("/client", auth, clientRouter); 
router.use("/location", auth, locationRouter);
router.use("/holiday", auth, holidayRouter);
router.use("/calendar", auth, calenderRouter);
router.use("/category", auth, categoryRouter);
router.use("/overtime", auth, overtimeRouter);
router.use("/leave-type", auth, leaveTypeRouter);
router.use("/employee-type", auth, employeeTypeRouter);
router.use("/investment", auth, investmentRouter);
router.use("/loan", auth, loanRouter);
router.use("/provident-fund", auth, providentFundRouter);
router.use("/tax", auth, taxRouter);
router.use("/job", jobRouter);
router.use("/candidate", candidateRouter);
router.use("/policy", auth, policyRouter);
router.use("/ticket", auth, ticketsRouter);
router.use("/goal-type", auth, goalTypeRouter);
router.use("/goal", auth, goalRouter);
router.use("/sale-estimate", auth, saleEstimateRouter);
router.use("/sale-invoice", auth, saleInvoiceRouter);
router.use("/sale-payment", auth, salePaymentRouter);
router.use("/sale-order", auth, salesOrderRouter);
router.use("/deliverychallan", auth, deliveryChallanRouter);
router.use("/recurring-invoice", auth, recurringInvoice);

router.use("/lead", auth, leadRouter);
router.use("/lead-status", auth, leadStatusRouter);
router.use("/mail", auth, mailRouter);
router.use("/customer", auth, customerRouter);
router.use("/credit-note", auth, creditNotesRouter);
router.use("/vendor", auth, vendorRouter); 
router.use("/vendor-credit", auth, vendorCreditRouter);
router.use("/email", auth, emailRouter); 
router.use("/leave", auth, leaveRouter);
router.use("/report", auth, saleReportRouter);
router.use("/bill", auth, billRouter); 
router.use("/documents", auth, documentsRouter);
router.use("/timesheets", auth, timesheetRouter);
router.use("/bulk-timesheets", auth, bulkTimesheetRouter);
router.use("/roleaccessprem", auth, roleAccessPremRouter);
router.use("/generalledger", auth, generalLedgerRouter);
router.use("/vendortrx", auth, vendorTransaction);
router.use("/landsale", auth, landSaleRouter);
router.use("/stock", auth, stockRouter);
router.use("/file", fileCred);
router.use("/reportdata", auth, reportRouter);
router.use("/payroll", auth, payrollRouter);
router.use("/notify", auth, notifyRouter);
router.use("/dailyfieldreport",auth, dfrRouter)
router.use("/landbank",auth,landBankRouter)
export default router;  