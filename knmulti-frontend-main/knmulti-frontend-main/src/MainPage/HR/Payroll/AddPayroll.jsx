import React, { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  allemployee,
  fetchAttendanceRange,
  fetchLeaves,
  fetchholiday,
  getEmployee,
} from '../../../lib/api';
import { dateDiff, filterEmpAttendance } from '../../../misc/helpers';
import httpService from '../../../lib/httpService';
import {
  DAILY_WORKING_HOURS,
  TOTAL_WORKING_DAYS,
} from '../../../misc/constants';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
const AddPayroll = () => {
  const history = useHistory();
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [grossEarn, setGrossEarn] = useState(null);
  const [deduction, setDeduction] = useState(null);
  const [finalData, setFinalData] = useState(null);
  const [TDS, setTDS] = useState(0);
  const [ESI, setESI] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [empAttendanceTotal, setEmpAttendanceTotal] = useState([]);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [desc, setDesc] = useState('');
  const [empJoinDate, setEmpJoinDate] = useState(new Date().toISOString());
  const [payrollData, setPayrollData] = useState([]);
  const [payrollExist, setPayrollExist] = useState(false);
  // to get all Roles
  const calander = filterEmpAttendance(
    empAttendanceTotal,
    new Date(dateFrom).toISOString(),
    new Date(dateTo).toISOString()
  );
  useEffect(() => {
    let exist = payrollData?.filter((el) => {
      if (new Date(el.fromDate).getMonth() === new Date(dateFrom).getMonth()) {
        return true;
      } else {
        return false;
      }
    });
    if (exist.length) {
      setPayrollExist(true);
    }
  }, [dateFrom, dateTo, payrollData]);
  useEffect(async () => {
    const roles = await httpService.get('/role');
    setRoles(roles?.data);
  }, []);
  //   to get all empooyees
  useEffect(async () => {
    const res = await allemployee();
    setAllEmployees(
      res.map((data) => ({
        ...data,
        name: data?.firstName + ' ' + data?.lastName,
        joindate: data?.joinDate?.split('T')[0],
        role: data?.jobRole?.name,
      }))
    );
  }, []);

  // to get selected employee data and attendance of the selected user :
  useEffect(async () => {
    if (selectedEmpId) {
      let empData = await getEmployee(selectedEmpId);
      setSelectedEmployeeData(empData);
      let month = new Date(dateFrom).getMonth() + 1;
      let year = new Date(dateFrom).getFullYear();
      let range = {
        from: new Date(`${year}-${month}-01`),
        to: new Date(`${year}-${month}-31`),
      };
      let empAttendance = await fetchAttendanceRange(selectedEmpId,range);
      setEmpAttendanceTotal(empAttendance);
    }
  }, [selectedEmpId]);

  // attendanceData of selected employee
  useEffect(async () => {
    if (empAttendanceTotal.length) {
      let attendancehoursAndDays = filterEmpAttendance(
        empAttendanceTotal,
        new Date(dateFrom).toISOString(),
        new Date(dateTo).toISOString()
      );
      const leaves = await leavesData(selectedEmployeeData, dateFrom, dateTo);
      const paidLeaves = leaves?.paidLeaves;
      const unpaidLeaves = leaves?.unpaidLeaves || 0;
      const presentDays = attendancehoursAndDays?.workingDays || 0;
      const workingHours = attendancehoursAndDays?.workingHours || 0;
      const weeklyOff = attendancehoursAndDays?.weekOff || 0;
      const festiveLeaves =
        (await getHolidaysBetweenDates(dateFrom, dateTo)) || 0;
      const totalDays = presentDays
        ? presentDays + weeklyOff + paidLeaves + festiveLeaves
        : 0;
      setAttendanceData({
        ...attendanceData,
        presentDays,
        paidLeaves,
        weeklyOff,
        festiveLeaves,
        workingHours,
        totalDays,
        unpaidLeaves,
      });
    }
  }, [empAttendanceTotal, dateFrom, dateTo]);

  // salary data of the selected employee
  useEffect(async () => {
    if (attendanceData) {
      const basicSalary =
        Math.floor(selectedEmployeeData?.SALARYCOMPONENTS?.montlyctc) || 0;
      const empHRA = selectedEmployeeData?.SALARYCOMPONENTS?.M_HRA;
      const empTA = selectedEmployeeData?.SALARYCOMPONENTS?.TA;
      const empDA = selectedEmployeeData?.SALARYCOMPONENTS?.DA;
      const empMA = selectedEmployeeData?.SALARYCOMPONENTS?.MA;
      const HRA = empHRA || basicSalary * 0.5;
      const TA = empTA || basicSalary * 0.2;
      const DA = empDA || basicSalary * 0.2;
      const MA = empMA || basicSalary * 0.1;
      const totalSalary = Math.floor(basicSalary + HRA + TA + DA + MA) || 0;
      setEmployeeData({
        ...employeeData,
        basicSalary,
        TA,
        HRA,
        MA,
        DA,
        totalSalary,
      });
    }
  }, [attendanceData]);

  useEffect(async () => {
    if (selectedEmployeeData) {
      const res = await httpService.get(`/payroll?employeeId=${selectedEmpId}`);
      setPayrollData(res.data);
      const joinDateInMonths =
        selectedEmployeeData?.joinDate?.split('-')[0] +
        '-' +
        selectedEmployeeData?.joinDate?.split('-')[1] +
        '-' +
        '01';
      setEmpJoinDate(joinDateInMonths);
    } else {
      const nowDate = new Date();
      const firstDayPrevMonth =
        new Date(nowDate.getFullYear(), nowDate.getMonth())
          .toISOString()
          .slice(0, 8) + '01';
      setEmpJoinDate(firstDayPrevMonth);
    }
  }, [selectedEmployeeData]);
  const filterEmployees = (data) => {
    if (roleId) {
      let filtred = data.filter((el) => el?.jobRole?._id === roleId);
      return filtred;
    } else {
      return data;
    }
  };
  // calculating Gross salary data
  useEffect(() => {
    if (employeeData) {
      let grossBasic =
        (employeeData.basicSalary / TOTAL_WORKING_DAYS) *
        attendanceData?.totalDays;
      let grossDA =
        (employeeData.DA / TOTAL_WORKING_DAYS) * attendanceData?.totalDays;
      let grossHRA =
        (employeeData.HRA / TOTAL_WORKING_DAYS) * attendanceData?.totalDays;
      let grossSalary =
        (employeeData.totalSalary / TOTAL_WORKING_DAYS) *
        attendanceData.totalDays;
      setGrossEarn({
        ...grossEarn,
        grossBasic,
        grossDA,
        grossHRA,
        grossSalary,
      });
    }
  }, [employeeData]);
  // final data calculation
  useEffect(() => {
    let ESIdiduct =
      (grossEarn?.grossBasic + grossEarn?.grossDA) * (ESI / 100) || 0;
    let PFamount = (grossEarn?.grossBasic + grossEarn?.grossDA) * 0.12 || 0;
    let advanceAmount = advance || 0;
    let tds = (grossEarn?.grossBasic + grossEarn?.grossDA) * (TDS / 100) || 0;
    let total = ESIdiduct + PFamount + advanceAmount + tds;
    setDeduction({ ...deduction, ESIdiduct, PFamount, advanceAmount, total });
    const grossEarned = grossEarn?.grossSalary;
    let totalDeduction = total;
    let netSalary = grossEarned - total;
    setFinalData({ ...finalData, grossEarned, totalDeduction, netSalary });
  }, [employeeData, ESI, TDS, advance, grossEarn]);

  const getHolidaysBetweenDates = async (from, to) => {
    let holiday = await fetchholiday();
    let dateFrm = from.toISOString().split('T')[0];
    let dateTo = to.toISOString().split('T')[0];
    let count = 0;
    for (
      let i = new Date(dateFrm);
      i <= new Date(dateTo);
      i.setDate(i.getDate() + 1)
    ) {
      let data = holiday.filter(
        (el) =>
          new Date(el.date.split('T')[0]).toLocaleDateString() ==
          i.toLocaleDateString()
      );
      if (data.length) {
        count++;
      }
    }
    return count;
  };

  const leavesData = async (emp, from, to) => {
    let allLeaves = await fetchLeaves(emp._id);
    let approvedLeaves = allLeaves.map((el) => el.approved);
    if (approvedLeaves.length <= emp.employeeType.noOfLeaves) {
      let paidLeaves = allLeaves
        .filter((leave) => {
          return (
            new Date(allLeaves[0]?.fromDate) >= new Date(from) &&
            new Date(allLeaves[0]?.toDate) <= new Date(to) &&
            leave?.approved
          );
        })
        .map((e) => {
          return dateDiff(new Date(e?.fromDate), new Date(e?.toDate));
        })
        .reduce((acc, curr) => {
          acc += curr;
          return acc;
        }, 0);
      return { paidLeaves };
    } else {
      let unpaidLeaves = allLeaves
        .filter((leave) => {
          return (
            new Date(allLeaves[0]?.fromDate) >= new Date(from) &&
            new Date(allLeaves[0]?.toDate) <= new Date(to) &&
            leave?.approved
          );
        })
        .map((e) => {
          return dateDiff(new Date(e?.fromDate), new Date(e?.toDate));
        })
        .reduce((acc, curr) => {
          acc += curr;
          return acc;
        }, 0);
      return { unpaidLeaves };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const empSalary = {
      employeeId: selectedEmpId,
      fromDate: dateFrom.toISOString(),
      toDate: dateTo.toISOString(),
      netSalary: finalData.netSalary,
      description: desc,
      salaryRate: employeeData,
      attendance: attendanceData,
      earnedSalary: grossEarn,
      deduction,
      connfirm: 0,
    };
    let res = await httpService.post(`/payroll`, empSalary);
    // emailjs
    // .sendForm(
    //   'service_xcxiogi',
    //   'template_ws756yb',
    //   e.target,
    //   'hf0po8venBjKL4wIi'
    // )
    // .then((res) => {
    //   toast.success('Email Sent!');
    //   //console.log(res, 'res frm emaijs');
    // })
    // .catch((err) => {
    //   toast.error('Email failed!');
    //   //console.log(err, 'err frm emaijs');
    // });
    history.goBack();
  };

  return (
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>Add Payroll</title>
          <meta name="description" content="Add Payroll" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Add Payroll</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/app/administrator/payroll">Payroll</Link>
                  </li>
                  <li className="breadcrumb-item">Add Payroll</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="row">
                {/* select role of the employee */}
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>
                      Employee Role <span className="text-danger">*</span>
                    </label>
                    <select
                      onChange={(e) => setRoleId(e.target.value)}
                      className="custom-select"
                      style={{
                        height: '100%',
                        border: '1px solid #CED4DA',
                      }}
                      defaultValue={''}
                    >
                      <option value={''}>All Roles</option>
                      {roles?.map((role) => (
                        <option key={role?._id} value={role?._id}>
                          {role?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* select employee based on role selected */}

                <div className="col-sm-6 col-md-6">
                  <div className="form-group">
                    <label>
                      Employee Name <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      value={selectedEmpId}
                      onChange={(e) => {
                        setSelectedEmpId(e.target.value);
                      }}
                      required
                    >
                      <option value={''} selected>
                        Please Select
                      </option>
                      {filterEmployees(allEmployees).map((emp) => (
                        <option key={emp?._id} value={emp?._id}>
                          {emp?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* select date from which you want payroll */}

                <div className="col-sm-3">
                  <div className="form-group">
                    <label>
                      From <span className="text-danger">*</span>
                    </label>
                    <div>
                      <DatePicker
                        id="doj"
                        poppername="startDate"
                        className="form-control"
                        format="dd-MM-yyyy"
                        placeholder="dd-mm-yyyy"
                        name="fromDate"
                        value={new Date(dateFrom)}
                        onChange={(e) => {
                          setDateFrom(new Date(e));
                        }}
                        minDate={new Date(selectedEmployeeData?.joinDate)}
                      />
                    </div>
                  </div>

                  {!calander && (
                    <span className="text-danger">
                      From month and year must be Same
                    </span>
                  )}
                </div>

                {/* select the date till which you want payroll */}

                <div className="col-sm-3">
                  <div className="form-group">
                    <label>
                      To <span className="text-danger">*</span>
                    </label>
                    <div>
                      <DatePicker
                        id="dob"
                        poppername="startDate"
                        className="form-control"
                        format="dd-MM-yyyy"
                        placeholder="dd-mm-yyyy"
                        name="fromDate"
                        value={new Date(dateTo)}
                        onChange={(e) => {
                          setDateTo(new Date(e));
                        }}
                        minDate={new Date(empJoinDate)}
                      />
                    </div>
                  </div>

                  {!calander && (
                    <span className="text-danger">
                      From month and year must be Same
                    </span>
                  )}
                </div>
              </div>
              {/* basic salary section  */}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Basic Salary <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="basicSalary"
                        value={employeeData?.basicSalary}
                        required
                        readOnly
                        // onBlur={handleSalaryRate}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        DA <span className="text-danger">*</span>
                      </label>
                      <input
                        readOnly
                        className="form-control"
                        value={Math.round(employeeData?.DA)}
                        name="DA"
                        onChange={(e) => {
                          setEmployeeData({
                            ...employeeData,
                            DA: e.target.value,
                          });
                          // handleSalaryRate()
                        }}
                        type="number"
                      />
                    </div>
                  </div>
                </div>
                {/* HRA section  */}
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        TA <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        readOnly
                        name="HRA"
                        value={Math.round(employeeData?.TA)}
                        type="number"
                        // handleSalaryRate()
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        MA <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        readOnly
                        value={Math.round(employeeData?.MA)}
                        type="number"
                      />
                    </div>
                  </div>
                </div>
                {/* HRA section  */}
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        HRA <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        readOnly
                        name="HRA"
                        value={Math.round(employeeData?.HRA)}
                        type="number"
                        // handleSalaryRate()
                        // disabled
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Total Salary <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        readOnly
                        value={Math.round(employeeData?.totalSalary)}
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                {/* Tabs  */}
                <div style={{ paddingLeft: '0px' }} className="col-md-12 p-r-0">
                  <div className="card tab-box">
                    <div className="row user-tabs">
                      <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                        <ul className="nav nav-tabs nav-tabs-bottom">
                          <li className="nav-item">
                            <a
                              href="#emp_attendance"
                              data-toggle="tab"
                              className="nav-link active"
                            >
                              Attendance
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              href="#emp_grossearn"
                              data-toggle="tab"
                              className="nav-link"
                            >
                              Gross Earned
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              href="#emp_deduction"
                              data-toggle="tab"
                              className="nav-link"
                            >
                              Deduction
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    minHeight: '20vh',
                    maxHeight: '40vh',
                    overflowY: 'auto',
                  }}
                  className="card p-4 tab-content"
                >
                  {/* Atendance  */}
                  <div
                    className="tab-pane fade show active"
                    id="emp_attendance"
                  >
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>
                            Present Days <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="present"
                            value={attendanceData?.presentDays}
                            readOnly
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Paid Leaves</label>
                          <div>
                            <input
                              className="form-control"
                              type="number"
                              name="paidLeave"
                              value={attendanceData?.paidLeaves || 0}
                              onChange={(e) =>
                                setAttendanceData({
                                  ...attendanceData,
                                  paidLeaves: +e.target.value,
                                })
                              }
                              min={0}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Weekly OFF</label>
                          <div>
                            <input
                              className="form-control"
                              type="number"
                              name="weeklyOff"
                              value={attendanceData?.weeklyOff}
                              onChange={(e) =>
                                setAttendanceData({
                                  ...attendanceData,
                                  weeklyOff: e.target.value,
                                })
                              }
                              readOnly
                              min={0}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Festive Leaves</label>
                          <div
                            className="text-center form-control"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {attendanceData?.festiveLeaves}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Working Hours</label>
                          <div
                            className="text-center form-control"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {attendanceData?.workingHours || 0}/
                            {DAILY_WORKING_HOURS * 30}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Total Days</label>
                          <div
                            className="text-center form-control"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {attendanceData?.totalDays}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gross Earned  */}
                  <div className="tab-pane fade show" id="emp_grossearn">
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            Gross Basic Salary{' '}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="eBasicSalary"
                            value={Math.round(grossEarn?.grossBasic)}
                            readOnly
                            // onBlur={handleearnedSalaryCal}
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            Gross DA <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="eDA"
                            value={Math.round(grossEarn?.grossDA)}
                            onChange={(e) =>
                              setGrossEarn({
                                ...grossEarn,
                                grossDA: e.target.value,
                              })
                            }
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            Gross HRA <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="eHRA"
                            value={Math.round(grossEarn?.grossHRA)}
                            onChange={(e) =>
                              setGrossEarn({
                                ...grossEarn,
                                grossHRA: removeEventListener.target.value,
                              })
                            }
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            Gross Salary <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="totalEarned"
                            value={Math.round(grossEarn?.grossSalary)}
                            onChange={(e) =>
                              setGrossEarn({
                                ...grossEarn,
                                grossSalary: e.target.value,
                              })
                            }
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deduction  */}
                  <div className="tab-pane fade show" id="emp_deduction">
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            ESI{' '}
                            <span className="text-sm text-secondary">
                              {' '}
                              (in %)
                            </span>
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="esiAmount"
                            value={Math.round(ESI)}
                            onChange={(e) => setESI(+e.target.value)}
                            min={0}
                            // onBlur={handleDeductionCal}
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            PF Amount <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="PF"
                            value={deduction?.PFamount}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Advance</label>
                          <input
                            className="form-control"
                            type="number"
                            name="advanceAmt"
                            value={advance}
                            onChange={(e) => {
                              setAdvance(+e.target.value);
                            }}
                            // onBlur={handleDeductionCal}
                            min={0}
                          />
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>TDS</label>
                          <span className="text-sm text-secondary">
                            {' '}
                            (in %)
                          </span>
                          <input
                            className="form-control"
                            type="number"
                            name="TDS"
                            value={TDS}
                            onChange={(e) => setTDS(e.target.value)}
                            // onBlur={handleDeductionCal}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            Total Deduction{' '}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="totalDeduction"
                            value={deduction?.total}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Gross salary earned  */}
                <div className="row my-1">
                  <div className="col-md-6 text-right"></div>
                  <div className="col-md-3 text-right p-2">
                    Gross Salary Earned
                  </div>
                  <div className="col-md-3 text-right">
                    <input
                      className="form-control"
                      type="number"
                      name="totalEarned"
                      value={Math.round(finalData?.grossEarned)}
                      readOnly
                    />
                  </div>
                </div>
                {/* Total Deduction  */}
                <div className="row my-1">
                  <div className="col-md-6 text-right"></div>
                  <div className="col-md-3 text-right p-2">Total Deduction</div>
                  <div className="col-md-3 text-right">
                    <input
                      className="form-control"
                      type="number"
                      name="totalDeduction"
                      value={Math.round(finalData?.totalDeduction)}
                      readOnly
                    />
                  </div>
                </div>
                {/* net Salary  */}
                <div className="row my-1">
                  <div className="col-md-6 text-right"></div>
                  <div className="col-md-3 text-right p-2">Net Salary</div>
                  <div className="col-md-3 text-right">
                    <input
                      className="form-control"
                      type="number"
                      name="netSalary"
                      value={Math.round(finalData?.netSalary)}
                      readOnly
                    />
                  </div>
                </div>
                {/* Description if any  */}
                <div className="row my-2">
                  <div className="col-md-12">
                    <textarea
                      className="form-control"
                      placeholder="description..."
                      name="description"
                      cols="160"
                      rows="5"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                {/* confirmation submit */}
                {!payrollExist ? (
                  <div className="submit-section">
                    <button className="btn btn-primary submit-btn">
                      Confirm Submit
                    </button>
                  </div>
                ) : (
                  <div className="submit-section">
                    <button disabled className="btn btn-primary">
                      Payroll Already Exist
                    </button>
                    <br />
                    <Link to="/app/administrator/payroll">Go Back</Link>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddPayroll;
