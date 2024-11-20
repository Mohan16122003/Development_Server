import { parse } from "csv-parse";
import { Response, Router } from "express";
import { UploadedFile } from "express-fileupload";
import XLSX from "xlsx"
import { Timesheet } from "../../models/timesheet";
import { Employee } from "../../models/employee";
const bulkTimesheetRouter = Router();

bulkTimesheetRouter.post("/", async (req: any, res: Response) => {
    if (req.user.jobRole.name == "Admin") {
        let file: any = req.files?.file;
        if (file.mimetype === "text/csv") {
            const csvFile = file
            if (!csvFile) {
                return res.status(400).send("No file uploaded");
            }
            const data = (csvFile as UploadedFile).data.toString();
            parse(data, {}, async (err, records) => {
                if (err) {
                    res.status(500).json(err);
                    return
                }
                let allEmployees = records?.filter((el: any) => el.some((str: string) => str.trim().length > 0));
                // Removing the first Line:
                allEmployees.shift()
                // Creating a non repeating array of employees;
                const firstEmpSeen = new Set()
                const filtredArray = [];
                for (const child of allEmployees) {
                    const firstElement = child[0];
                    if (!firstEmpSeen.has(firstElement)) {
                        filtredArray.push(child);
                        firstEmpSeen.add(firstElement);
                    }
                }
                // checking for employee joinDate from database;
                let error = { state: false, message: "" };
                for (let i = 0; i < filtredArray.length; i++) {
                    let date = convertDateFormat(filtredArray[i][1]);
                    let eachEmp: any = await Employee.findById(filtredArray[i][0]).select("joinDate");
                    let eachTimeSheet = await Timesheet.find({ employee: filtredArray[i][0], date: new Date(date).toISOString() })
                    if (eachTimeSheet.length) {
                        error = { state: true, message: "One OR More Employee's Attendence for Given Date already exists ! Please Check your Uploaded File" }
                    }
                    if (!eachEmp) {
                        error = { state: true, message: "Invalid employee Id: One of the EmployeeId is invalid ! Please Check your Uploaded File" }
                    }
                    if (new Date(eachEmp?.joinDate) > new Date(date)) {
                        error = { state: true, message: "One Or More Employees Are Not Registered on Given Date ! Please Check the Uploaded file" }
                    }
                }
                if (error.state) {
                    res.status(400).json({ message: error.message })
                    return
                } else {
                    let finalData = allEmployees?.map((el: any) => {
                        let date = convertDateFormat(el[1]);
                        return {
                            employee: el[0],
                            date: new Date(date),
                            sessions: [{ from: convertToFullDate(date, el[2]), upto: convertToFullDate(date, el[3]), session_id: 1 }],
                            description: [{ description: el[4] || "Bulk Payroll Process", loggedUser: `${req.user.firstName} ${req.user.lastName}` }]
                        }
                    })
                    try {
                        let Bulkdata = await Timesheet.insertMany(finalData);
                        res.status(200).json({ Bulkdata, message: "Bulk Data is Uploaded Successfully" });
                        return
                    } catch (err:any) {
                        res.status(500).json({ message: err.message });
                        return;
                    }
                }
            })
        } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            let xlsxFile = file;
            let data = readXLSXData(xlsxFile?.data);

            parse(data, {}, async (err, records) => {
                if (err) {
                    res.status(500).json(err);
                    return
                }
                let allEmployees = records?.filter((el: any) => el.some((str: string) => str.trim().length > 0));
                // Removing the first Line:
                allEmployees.shift()
                // Creating a non repeating array of employees; 
                const firstEmpSeen = new Set()
                const filtredArray = [];
                for (const child of allEmployees) {
                    const firstElement = child[0];
                    if (!firstEmpSeen.has(firstElement)) {
                        filtredArray.push(child);
                        firstEmpSeen.add(firstElement);
                    }
                }
                // checking for employee joinDate from database;
                let error = { state: false, message: "" };
                for (let i = 0; i < filtredArray.length; i++) {
                    let date = convertDateFormat(filtredArray[i][1]);
                    let eachEmp: any = await Employee.findById(filtredArray[i][0]).select("joinDate");
                    let eachTimeSheet = await Timesheet.find({ employee: filtredArray[i][0], date: new Date(date).toISOString() })
                    if (eachTimeSheet.length) {
                        error = { state: true, message: "One OR More Employee's Attendence for Given Date already exists ! Please Check your Uploaded File" }
                    }
                    if (!eachEmp) {
                        error = { state: true, message: "Invalid employee Id: One of the EmployeeId is invalid ! Please Check your Uploaded File" }
                    }
                    if (new Date(eachEmp?.joinDate) > new Date(date)) {
                        error = { state: true, message: "One Or More Employees Are Not Registered on Given Date ! Please Check the Uploaded file" }
                    }
                }
                if (error.state) {
                    res.status(400).json({ message: error.message })
                    return
                } else {
                    let finalData = allEmployees?.map((el: any) => {
                        let date = convertDateFormat(el[1]);
                        return {
                            employee: el[0],
                            date: new Date(date),
                            sessions: [{ from: convertToFullDate(date, el[2]), upto: convertToFullDate(date, el[3]), session_id: 1 }],
                            description: [{ description: el[4] || "Bulk Payroll Process", loggedUser: `${req.user.firstName} ${req.user.lastName}` }]
                        }
                    })
                    try {
                        let Bulkdata = await Timesheet.insertMany(finalData);
                        res.status(200).json({ Bulkdata, message: "Bulk Data is Uploaded Successfully" });
                        return
                    } catch (err) {
                        res.status(500).json({ message: "internal server error :", err });
                        return;
                    }
                }
            })
        } else {
            res.status(400).json({ message: "Unsupported File" })
        }
    } else {
        res.status(400).json({ message: "You are Not Authorized To Changes" })
        return
    }
})
export default bulkTimesheetRouter;

const readXLSXData = (file: any) => {
    const workBook = XLSX.read(file, { type: "buffer" })
    const sheetName = workBook.SheetNames[0];
    const workSheet = workBook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_csv(workSheet)
    return jsonData;
}


function convertDateFormat(originalDate: string) {
    const dateComponents = originalDate.split('-');
    const convertedDate = `${dateComponents[2]}-${dateComponents[1]}-${dateComponents[0]}`;
    return convertedDate;
}

const convertToFullDate = (date: any, time: string) => {
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split('.');
    const fullDate = new Date(+year, +month - 1, +day);
    fullDate.setHours(+hours);
    fullDate.setMinutes(+minutes);

    return fullDate;
}