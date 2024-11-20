import moment from 'moment';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation,Link } from 'react-router-dom';
import {
  allemployee,
  fetchAttendanceRange,
  fetchLeaves,
  getEmployee,
} from '../../../lib/api';
import {
  dateDiff,
  filterAttendance1, 
} from '../../../misc/helpers';
import httpService from '../../../lib/httpService';
import emailjs from 'emailjs-com';
import { toast } from 'react-toastify';
import DatePicker from 'react-date-picker';

const PayrollForm = () => {
  const { state } = useLocation();
  const history = useHistory();

  // employeeRole
  const [empRole, setEmpRole] = useState('');
  // employees based on role
  const [allEmployees, setAllEmployees] = useState([]);
  // selected employee id  
  const [employee, setEmployee] = useState();
  //  to limit the calander date (should not go beyond join date)
  const [empJoinDate, setEmpJoinDate] = useState(new Date().toISOString());
  const [dateFrom, setDateFrom ] = useState(new Date())
  const [dateTo, setDateTo ] = useState(new Date())
  // from - to date of which you want payroll
  const [fromDate, setfromDate] = useState(new Date().toISOString());
  const [toDate, settoDate] = useState(new Date().toISOString());
  // based on the role and employee, salary will be fatched
  const [salaryRate, setsalaryRate] = useState({
    basicSalary: 0,
    DA: 0,
    HRA: 0,
    totalSalary: 0,
  });
  // attendance of the employee
  const [empAttendance, setEmpAttendance]= useState([])
  // attendance count of the employee
  const [empAttendenceCount, setEmpAttendenceCount] = useState(null);
  // paid leaves of selected employee during selected period
  const [selectedEmpPaidLeaves, setSelectedEmpPaidLeaves] = useState(0)
  // all leaves by selected employee
  const [totalLeaves, setTotalLeaves] = useState([]);
  // selected emploee data 
  const [employeeData, setEmployeeData] = useState(null);
  console.log("employee data:",employeeData)
  const [plannedLeaves, setPlannedLeaves] = useState([]);
  const [roles, setRoles] = useState([]);
  const [netSalary, setnetSalary] = useState(0);
  const [description, setdescription] = useState('');
  const [attendance, setattendance] = useState({
    present: 0,
    paidLeave: 0,
    weeklyOff: 0,
    festival: 0,
    paidDays: 0,
  });
  const [earnedSalary, setearnedSalary] = useState({
    eBasicSalary: 0,
    eDA: 0,
    eHRA: 0,
    incentive: 0,
    totalEarned: 0,
  });
  const [salaryrateedit, Setsalaryrateedit] = useState();
  const [deduction, setdeduction] = useState({
    esiAmount: 0,
    PF: 0,
    advanceAmt: 0,
    TDS: 0,
    LWF: 0,
    professionalTax: 0,
    totalDeduction: 0,
  });
  // getting all the employees
  useEffect(() => {
    fetchAllEmployees();
  }, []);
  const fetchAllEmployees = async () => {
    const res = await allemployee(); 
    setAllEmployees(
      res.map((data) => ({
        ...data,
        name: data?.firstName + ' ' + data?.lastName,
        joindate: data?.joinDate?.split('T')[0],
        role: data?.jobRole?.name,
      }))
    ); 
  };
  // to filter employees based on role
  function search(data) {
    if (empRole) {
      let filtred = data.filter((el) => el?.jobRole?._id === empRole);
      return filtred;
    } else {
      return data;
    }
  }
  // to get attendance of the user 
  useEffect(()=>{
    if(empAttendance.length){
      setEmpAttendenceCount(filterAttendance1(empAttendance, fromDate, toDate));
    }
  },[empAttendance,fromDate,toDate])
  
  useEffect(async()=>{
    if(employee){
      let month = new Date(fromDate).getMonth() + 1;
    let year = new Date(fromDate).getFullYear();
    let range = {
      from: new Date(`${year}-${month}-01`),
      to: new Date(`${year}-${month}-31`),
    };
      const empAttendance = await fetchAttendanceRange(employee,range);
      setEmpAttendance(empAttendance)
      const leaves = await fetchLeaves(employee);
      setTotalLeaves(leaves);
      const empData = await getEmployee(employee);
      setEmployeeData(empData);
    }
  },[employee])

  useEffect(() => {
    if (employeeData) {
      const joinDateInMonths =
        employeeData?.joinDate?.split('-')[0] +
        '-' +
        employeeData?.joinDate?.split('-')[1] +
        '-' +
        '01';
      setEmpJoinDate(joinDateInMonths);
    } else {
      setEmpJoinDate(firstDayPrevMonth);
    }
  }, [employeeData]);


  useEffect(() => {
    loadFn();

  }, [dateFrom,dateTo,dateFrom]);

  const handleSalaryRate = () => {
    if (salaryRate?.basicSalary) {
      let x = salaryRate?.basicSalary;
      let da = (x * 10) / 100;
      // let hra = (+x + +da) * 0.3 ;
      let hra = salaryRate?.HRA;
      // //console.lo('hra____',hra,salaryRate?.HRA);
      let ts = +x + +da + +hra;
      // //console.log({ x, da, hra, ts });
      setsalaryRate({ ...salaryRate, DA: da, HRA: hra, totalSalary: ts });
    }
  };

  const handleHra = () => {
    if (salaryRate?.basicSalary) {
      let x = salaryRate?.basicSalary;
      let da = salaryRate?.DA;
      let hra = salaryRate?.HRA;
      let ts = +x + +da + +hra;
      setsalaryRate({ ...salaryRate, DA: da, HRA: hra, totalSalary: ts });
    }
  };
  let presentDays = () => {
    if (!state?.edit) {
      setattendance({
        ...attendance,
        present: empAttendenceCount,
        weeklyOff: sun?.length,
        paidLeave: selectedEmpPaidLeaves || 0,
      });
    }
  };

  const handleattendance = (e) => {
    setattendance({ ...attendance, [e.target.name]: e.target.value });
  };

  const handlePaidDays = () => {
    let x = +attendance?.present + +attendance?.paidLeave + +attendance?.festival ||0;
    setattendance({ ...attendance, paidDays: x });
  };
  const handleearnedSalary = (e) => {
    setearnedSalary({ ...earnedSalary, [e.target.name]: e.target.value });
  };
  const handleearnedSalaryCal = () => {
    if (salaryrateedit && attendance?.paidDays) {
      let x = (salaryRate?.basicSalary * +attendance?.paidDays) / 26;
      let da = (x * 10) / 100;
      let hra = (+x + +da) * 0.3;
      let hraatt = (hra * +attendance?.paidDays) / 30;
      let ts = +x + +da + +hraatt + +earnedSalary?.incentive;
      setearnedSalary({
        ...earnedSalary,
        eBasicSalary: (x * 50) / 100,
        eDA: da,
        eHRA: hraatt,
        totalEarned: ts,
      });
    }
  };

  // const handle_HRAcal = () => {
  //   //console.log('handle_HRAcal', salaryRate?.basicSalary);
  //   if (salaryRate?.basicSalary && attendance?.paidDays) {
  //     let x = (salaryRate?.basicSalary * +attendance?.paidDays) / 30;
  //     // let da = (x * 10) / 100;
  //     let da = salaryRate?.DA;

  //     // let hra =  (+x + +da) * 0.3;
  //     let hra1 = (salaryRate?.HRA * +attendance?.paidDays) / 30;
  //     let hra = hra1;
  //     //console.log('handle_HRAcal4', salaryRate?.basicSalary, da, hra, x);
  //     let ts = +x + +da + +hra + +earnedSalary?.incentive;
  //     // //console.log({ x, da, hra, ts });
  //     setearnedSalary({
  //       ...earnedSalary,
  //       eBasicSalary: x,
  //       eDA: da,
  //       eHRA: hra,
  //       totalEarned: ts,
  //     });
  //   }
  // };

  const handle_HRAcal = () => {
    //console.log('handle_HRAcal', salaryRate?.basicSalary);
    if (salaryRate?.basicSalary && attendance?.paidDays) {
      let x = salaryRate?.basicSalary / 26;
      // let da = (x * 10) / 100;
      let da = salaryRate?.DA;
      // let hra =  (+x + +da) * 0.3;
      let hra1 = (salaryRate?.HRA * +attendance?.paidDays) / 30;
      let hra = hra1;
      // //console.log('handle_HRAcal4', salaryRate?.basicSalary, da, hra, x);
      let ts = x * attendance.paidDays;
      // //console.log({ x, da, hra, ts });
      setearnedSalary({
        ...earnedSalary,
        eBasicSalary: x,
        eDA: da,
        eHRA: hra,
        totalEarned: ts,
      });
    }
  };

  const handlededuction = (e) => {
    setdeduction({ ...deduction, [e.target.name]: e.target.value });
  };

  const handleDeductionCal = () => {
    //console.log('testing deduction', deduction?.esiAmount);
    if (salaryRate?.basicSalary && attendance?.paidDays) {
      let x = (+earnedSalary?.eBasicSalary + +earnedSalary?.eDA) * 0.12;
      let y =
        +x + +deduction?.advanceAmt + +deduction?.TDS - +deduction?.esiAmount;
      setdeduction({ ...deduction, PF: x, totalDeduction: y });
    }
  };

  const handleNetSalary = () => {
    const x = +earnedSalary?.totalEarned - deduction?.totalDeduction;
    setnetSalary(x);
  };

  useEffect(() => {
    handleSalaryRate();
  }, [salaryRate?.basicSalary]);
  useEffect(() => {
    handleearnedSalaryCal();
  }, [attendance?.paidDays, salaryRate?.basicSalary, salaryRate?.HRA]);
  useEffect(() => {
    handle_HRAcal();
  }, [attendance?.paidDays, salaryRate?.HRA, salaryRate?.HRA, salaryRate?.DA]);

  useEffect(() => {
    handleDeductionCal();
  }, [
    earnedSalary,
    deduction?.advanceAmt,
    deduction?.TDS,
    deduction?.esiAmount,
  ]);

  useEffect(() => {
    handleNetSalary();
  }, [earnedSalary?.totalEarned, deduction?.totalDeduction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fromDate == undefined || fromDate == '') {
      toast.error('Please select a From Date');
      return;
    }
    if (toDate == undefined || toDate == '') {
      toast.error('Please select a To Date');
      return;
    }
    if (salaryRate?.basicSalary == undefined || salaryRate?.basicSalary == '') {
      toast.error('Please select a Basic Salary ');
      return;
    }
    if (attendance?.present == undefined || attendance?.present == '') {
      toast.error('There is no Present Days');
      return;
    }
    if (employee == undefined || employee == '') {
      toast.error('Please select a Employee Name ');
      return;
    }

    const empSalary = {
      employeeId: employee,
      fromDate,
      toDate,
      netSalary,
      description,
      salaryRate,
      attendance,
      earnedSalary,
      deduction,
      connfirm: 0,
    };
    if (state?.edit) {
      httpService.put(`/payroll/${state?.payId}`, empSalary).then((res) => {
        history.goBack();
      });
      return;
    }
    httpService.post(`/payroll`, empSalary).then((res) => {
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
    });
  };

  
  //present day
  const onFilterClick = async (e) => {
    if (e) {
      // console.log("employee attendance :",empAttendance) // fix the attendance, if employee's attendance is less then required attendance       
      let arr = plannedLeaves?.filter(elem=>elem?.id == e).map(e1 => e1?.noOfdays);
      let totalDays = 0
      for(let i=0;i<arr.length;i++){
        totalDays+=arr[i]
      }
      setSelectedEmpPaidLeaves(totalDays);
      Setsalaryrateedit(employeeData?.SALARYCOMPONENTS?.montlyctc);
      setsalaryRate({
        ...salaryRate,
        HRA: employeeData?.SALARYCOMPONENTS?.M_HRA,
        basicSalary: employeeData?.SALARYCOMPONENTS?.montlyctc,
      });
      setEmpAttendenceCount(filterAttendance1(empAttendance, fromDate, toDate));
    }
  };
  useEffect(() => {
    onFilterClick(employee);
  }, [employee,fromDate,toDate]);



  useEffect(() => {
    handlePaidDays();
    // handleSalaryRate();
  }, [attendance?.present]);
  // //console.log(employeesDetails, 'employeeemployee');
  useEffect(() => {
    presentDays();
  }, [empAttendenceCount]);

  // Record from State (uselocation)
  // useEffect(() => {
  //   if (state?.edit) {
  //     const {
  //       employeeId,
  //       fromDate,
  //       toDate,
  //       salaryRate,
  //       earnedSalary,
  //       attendance,
  //       deduction,
  //       description,
  //     } = state?.record;
  //     setEmployee(employeeId?._id);
  //     settoDate(toDate?.split('T')[0]);
  //     setsalaryRate({ ...salaryRate });
  //     setattendance({ ...attendance });
  //     setearnedSalary({ ...earnedSalary });
  //     setdeduction({ ...deduction });
  //     setdescription(description);
  //     // setnetSalary(netSalary);
  //   }
  // }, []);

  const nowDate = new Date();
  const firstDayPrevMonth =
    new Date(nowDate.getFullYear(), nowDate.getMonth())
      .toISOString()
      .slice(0, 8) + '01';
  const lastDayPrevMonth = new Date(nowDate.getFullYear(), nowDate.getMonth())
    .toISOString()
    .slice(0, 10);

  function sundaysInMonth(m, y) {
    let days = new Date(y, m, 0).getDate();
    let sundays = [8 - new Date(m + '/01/' + y).getDay()];
    for (var i = sundays[0] + 7; i < days; i += 7) {
      sundays.push(i);
    }
    return sundays;
  }
  const filterQueries2 ={
    month: { value: new Date().getMonth()},
    year: { value: new Date().getFullYear() },
  }
  let sun = sundaysInMonth(
    filterQueries2?.month?.value + 1,
    filterQueries2?.year?.value
  );
  //end
  const loadFn = async () => {
    // let leavesData = totalLeaves?.map((leave, index) => {
    //     return {
    //       _id: leave?._id,
    //       id: index + 1,
    //       employee: leave?.employee,
    //       leaveType: leave?.leaveType?.leaveTypeName,
    //       fromDate: new Date(leave?.fromDate).toLocaleDateString(),
    //       toDate: new Date(leave?.toDate).toLocaleDateString(),
    //       noofdays: dateDiff(
    //         new Date(leave?.fromDate),
    //         new Date(leave?.toDate)
    //       ),
    //       reason: leave?.reason,
    //       status: leave?.status,
    //     };
    //   })
    let leavesPlanned = totalLeaves?.filter((leave) => {
          return (
            +dateFrom.toLocaleString().split("/")[0] >= +(leave?.fromDate?.split('-')[1]) &&
            +dateTo.toLocaleString().split("/")[0] <= +(leave?.toDate?.split('-')[1])&&leave?.approved
          );
        }).map((e) => {
          return {
            ...plannedLeaves,
            noOfdays: dateDiff(new Date(e?.fromDate), new Date(e?.toDate)),
            name: e?.employee?.name,
            id: e?.employee?._id,
          };
        });
        setPlannedLeaves(leavesPlanned)
  };
  //present day

  const fetchRolesAndDepartments = async () => {
    const roles = await httpService.get('/role');
    setRoles(roles?.data);
    //console.log(roles?.data, 'Roles');
    // setEmployeeType(employeeTypes001?.data);
  };

  useEffect(() => {
    fetchRolesAndDepartments();
  }, []);

  return (
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
                <li className="breadcrumb-item">
                  Add Payroll
                </li>
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
                      onChange={(e) => setEmpRole(e.target.value)}
                      className="custom-select"
                      style={{
                        height: '100%',
                        border: '1px solid #CED4DA',
                      }}
                    >
                      <option value={''}>All Roles</option>
                      {roles.map((role) => (
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
                      value={employee}
                      onChange={(e) => {
                        setEmployee(e.target.value);
                      }}
                      required
                    >
                      <option value={''} selected>
                        Please Select
                      </option>
                      {search(allEmployees).map((emp) => (
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
                          setDateFrom(new Date(e))
                          const day = e.getDate()<10?`0${e.getDate()}`:e.getDate().toString()
                          const month = (e.getMonth()+1)<10?`0${e.getMonth()+1}`:e.getMonth().toString()
                          const year = e.getFullYear().toString()
                          setfromDate(`${year}-${month}-${day}T18:30:00.000Z`);
                        }}
                        minDate={new Date(empJoinDate)}
                      />
                    </div>
                  </div>

                  {empAttendenceCount === 'monthisnotsame' && (
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
                          setDateTo(new Date(e))
                          const day = e.getDate()<10?`0${e.getDate()}`:e.getDate().toString()
                          const month = (e.getMonth()+1)<10?`0${e.getMonth()+1}`:e.getMonth().toString()
                          const year = e.getFullYear().toString()
                          settoDate(`${year}-${month}-${day}T18:30:00.000Z`);
                        }}
                        minDate={new Date(empJoinDate)}
                      />
                    </div>
                  </div>

                  {empAttendenceCount === 'monthisnotsame' && (
                    <span className="text-danger">
                      From month and year must be Same
                    </span>
                  )}
                </div>
              </div>
            <form onSubmit={handleSubmit}>

              {/* basic salary section  */}
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      Basic Salary <span className="text-danger">*</span>
                    </label>
                    <input
                      disabled
                      className="form-control"
                      type="number"
                      name="basicSalary"
                      // value={salaryRate?.basicSalary}
                      value={Math.round(salaryRate?.basicSalary)}
                      onChange={(e) => {
                        setsalaryRate({
                          ...salaryRate,
                          basicSalary: e.target.value,
                        });
                        // handleSalaryRate()
                      }}
                      // onBlur={handleSalaryRate}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      DA <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      value={Math.round(salaryRate?.DA)}
                      name="DA"
                      onChange={(e) => {
                        setsalaryRate({
                          ...salaryRate,
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
                      HRA <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      // readOnly
                      disabled
                      name="HRA"
                      value={Math.round(salaryRate?.HRA)}
                      onChange={(e) => {
                        setsalaryRate({
                          ...salaryRate,
                          HRA: e.target.value,
                        });
                        // handleSalaryRate()
                      }}
                      // handleSalaryRate()

                      type="number"
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
                      value={Math.round(salaryRate?.totalSalary)}
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
                <div className="tab-pane fade show active" id="emp_attendance">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Present Days <span className="text-danger">*</span>
                        </label>
                        <input
                          disabled
                          type="number"
                          className="form-control"
                          name="present"
                          value={attendance?.present}
                          onChange={handleattendance}
                          onBlur={handlePaidDays}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Paid Leave</label>
                        <div>
                          <input
                            className="form-control"
                            type="number"
                            name="paidLeave"
                            value={attendance?.paidLeave}
                            onChange={handleattendance}
                            onBlur={handlePaidDays}
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
                            value={attendance?.weeklyOff}
                            onChange={handleattendance}
                            onBlur={handlePaidDays}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Festival</label>
                        <input
                          type="number"
                          className="form-control"
                          name="festival"
                          value={attendance?.festival}
                          onChange={handleattendance}
                          onBlur={handlePaidDays}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Paid Days</label>
                        <div>
                          <input
                            className="form-control"
                            type="number"
                            name="paidDays"
                            value={attendance?.paidDays}
                            onChange={handleattendance}
                            disabled
                          />
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
                          value={Math.round(earnedSalary?.eBasicSalary)}
                          onChange={handleearnedSalary}
                          onBlur={handleearnedSalaryCal}
                          readOnly
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
                          value={Math.round(earnedSalary?.eDA)}
                          onChange={handleearnedSalary}
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
                          value={Math.round(earnedSalary?.eHRA)}
                          onChange={handleearnedSalary}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Incentive</label>
                        <input
                          className="form-control"
                          type="number"
                          name="incentive"
                          value={earnedSalary?.incentive}
                          onChange={handleearnedSalary}
                          onBlur={handleearnedSalaryCal}
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Gross </label>
                        <input
                          className="form-control"
                          type="number"
                          name="incentive"
                          value={earnedSalary?.incentive}
                          onChange={handleearnedSalary}
                          onBlur={handleearnedSalaryCal}
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
                          value={Math.round(earnedSalary?.totalEarned)}
                          onChange={handleearnedSalary}
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
                          ESI Amount <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          type="number"
                          name="esiAmount"
                          value={Math.round(deduction?.esiAmount)}
                          onChange={handlededuction}
                          onBlur={handleDeductionCal}
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
                          value={Math.round(deduction?.PF)}
                          onChange={handlededuction}
                          disabled
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
                          value={deduction?.advanceAmt}
                          onChange={handlededuction}
                          onBlur={handleDeductionCal}
                        />
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>TDS</label>
                        <input
                          className="form-control"
                          type="number"
                          name="TDS"
                          value={deduction?.TDS}
                          onChange={handlededuction}
                          onBlur={handleDeductionCal}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          Total Deduction <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          type="number"
                          name="totalDeduction"
                          value={Math.round(deduction?.totalDeduction)}
                          onChange={handlededuction}
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
                    value={Math.round(earnedSalary?.totalEarned)}
                    onChange={handleearnedSalary}
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
                    value={Math.round(deduction?.totalDeduction)}
                    onChange={handlededuction}
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
                    value={Math.round(netSalary)}
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
                    value={description}
                    onChange={(e) => setdescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
              {/* confirmation submit */}
              <div className="submit-section">
                <button className="btn btn-primary submit-btn">
                  Confirm Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollForm;
