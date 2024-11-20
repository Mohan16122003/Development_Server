import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import React, { useEffect, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Link } from 'react-router-dom';
import moment from 'moment';
import httpService from '../../../lib/httpService';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import { Avatar, Space, Table } from 'antd';
import { allemployee, fetchLeaves, fetchholiday } from '../../../lib/api';
import { toast } from 'react-toastify';
import {
  DAILY_BREAK_HOURS,
  DAILY_WORKING_HOURS,
  TOTAL_WORKING_DAYS,
} from '../../../misc/constants';
import { dateDiff } from '../../../misc/helpers';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const CreateBulkPayroll = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [departments, setDepartments] = useState([]);
  // payroll filters
  const [allPayroll, setAllPayroll] = useState([]);
  // employees filters:
  const [allEmployees, setAllEmployees] = useState([]);
  const [filtredEmp, setFiltredEmp] = useState([]); // all employees of selected department
  const [empFinal, setEmpFinal] = useState([]); // employees of selected date and no payroll exist;
  const [finalEmpIds, setFinalEmpIds] = useState([]);
  const [filterQueries, setFilterQueries] = useState(null);
  const [timeSheetBtw, setTimeSheetBtw] = useState([]);
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchPayrolls();
  }, []);
  // to filter employees on based on the selected month and year :
  useEffect(() => {
    if (filtredEmp.length && selectedMonthYear) {
      let empFilter = filtredEmp.filter((el) => {
        let empJoinMonth = new Date(el.joinDate).getMonth() + 1;
        let empJoinYear = new Date(el.joinDate).getFullYear();
        if (
          selectedMonthYear?.month >= empJoinMonth &&
          selectedMonthYear?.year >= empJoinYear
        ) {
          return true;
        } else {
          return false;
        }
      });
      let payrollFilter = allPayroll?.filter((el) => {
        let payrollMonth = new Date(el.fromDate).getMonth() + 1;
        let payrollYear = new Date(el.fromDate).getFullYear();
        if (
          selectedMonthYear.month == payrollMonth &&
          selectedMonthYear.year == payrollYear
        ) {
          return true;
        } else {
          return false;
        }
      });
      let finalEmployees = empFilter.filter((el) => {
          return !payrollFilter?.some((e) => e?.employeeId?._id == el._id);
        });
        let empIds = finalEmployees.map((el) => el._id).filter((el) => el && el);
        setFinalEmpIds(empIds);
        setEmpFinal(finalEmployees);
    }
  }, [filtredEmp, selectedMonthYear]);
  // to get timesheet of an employee:
  useEffect(async () => {
    if (finalEmpIds.length) {
      try {
        let res = await httpService.get(`/timesheets`, {
          params: {
            empIdArr: finalEmpIds,
          },
        });
        let timeBtw = res?.data?.filter((el) => {
          const timeShtMonth = new Date(el.date).getMonth() + 1;
          const timeshtYr = new Date(el.date).getFullYear();
          if (
            selectedMonthYear.month === timeShtMonth &&
            selectedMonthYear.year === timeshtYr
          ) {
            return true;
          } else {
            return false;
          }
        });
        setTimeSheetBtw(timeBtw);
      } catch (err) {
        toast.error('cannot get data of employees !');
      }
    } else {
      setTimeSheetBtw([]);
    }
  }, [finalEmpIds]);
  useEffect(async () => {
    if (timeSheetBtw) {
      let arr = Object.values(
        timeSheetBtw.reduce((accumulator, obj) => {
          const { employee, productionTime, totalTime } = obj;

          if (accumulator[employee]) {
            accumulator[employee].productionTime += productionTime;
            accumulator[employee].totalTime += totalTime;
          } else {
            accumulator[employee] = { employee, productionTime, totalTime };
          }
          return accumulator;
        }, {})
      );
      setIsLoading(true)
      let mergedArr = await mergeArray(arr, empFinal);
      setIsLoading(false)
      setTableData(mergedArr);
    }
  }, [timeSheetBtw]);
  const history = useHistory()
  const mergeArray = async (arr1, arr2) => {
    const mergedArray = [...arr1];
    for (const obj2 of arr2) {
      const existingObj = mergedArray.find(
        (obj1) => obj1.employee === obj2._id
      );
      if (existingObj) {
        existingObj['name'] = obj2.name;
        existingObj['fromDate'] = filterQueries?.fromDate;
        existingObj['attendance'] = await calculateAttendance(
          existingObj.productionTime,
          obj2
        );
        (existingObj['toDate'] = filterQueries?.toDate),
          (existingObj['employeeId'] = obj2._id),
          (existingObj['description'] = 'Bulk Payroll'),
          (existingObj['salaryRate'] = calcSalaryRate(obj2?.SALARYCOMPONENTS)), // calculate slary rate ;
          (existingObj['earnedSalary'] = caclcEarned(
            existingObj?.attendance?.totalDays,
            obj2.SALARYCOMPONENTS
          )); // calculate earned salary;
        existingObj['deduction'] = calculateDeduc(existingObj?.earnedSalary); // calculate decuction ;
        existingObj['connfirm'] = 0;
        existingObj['joinDate'] = obj2.joinDate;
        existingObj['netSalary'] = Math.floor(
          existingObj?.earnedSalary?.grossSalary - existingObj?.deduction?.total
        );
      } else {
        let newObj = {};
        newObj['name'] = obj2.name;
        newObj['totalProd'] = 0;
        newObj['prodTime'] = 0;
        newObj['fromDate'] = new Date(filterQueries?.fromDate);
        newObj['toDate'] = new Date(filterQueries?.toDate);
        newObj['employeeId'] = obj2._id;
        newObj['employee'] = obj2._id;
        newObj['description'] = 'Bulk Payroll';
        newObj['salaryRate'] = calcSalaryRate(obj2?.SALARYCOMPONENTS); // calculate slary rate ;
        newObj['attendance'] = await calculateAttendance(0, obj2); // calculate attendance ;
        newObj['earnedSalary'] = caclcEarned(
          existingObj?.attendance?.totalDays,
          obj2.SALARYCOMPONENTS
        ); // calculate earned salary;
        newObj['deduction'] = calculateDeduc(newObj.earnedSalary); // calculate decuction ;
        newObj['connfirm'] = 0;
        newObj['joinDate'] = obj2.joinDate;
        newObj['netSalary'] = 0;
        mergedArray.push(newObj);
      }
    }
    return mergedArray;
  };
  const caclcEarned = (days, emp) => {
    if (days) {
      const daySalary = Math.floor((emp?.anualctc / 12)/ TOTAL_WORKING_DAYS);
      const basicSalary =
        Math.floor(emp?.montlyctc / TOTAL_WORKING_DAYS) * days || 0;
      const totalSalary = daySalary * days || 0;
      const empHRA = (emp?.M_HRA / TOTAL_WORKING_DAYS) * days;
      const empTA = (emp?.TA / TOTAL_WORKING_DAYS) * days;
      const empDA = (emp?.DA / TOTAL_WORKING_DAYS) * days;
      const empMA = (emp?.MA / TOTAL_WORKING_DAYS) * days;
      const HRA = empHRA || basicSalary * 0.5;
      const TA = empTA || basicSalary * 0.2;
      const DA = empDA || basicSalary * 0.2;
      const MA = empMA || basicSalary * 0.1;
      let obj = {
        grossBasic: +basicSalary.toFixed(3) || 0,
        grossDA: +DA.toFixed(3) || 0,
        grossHRA: +HRA.toFixed(3) || 0,
        gorssTA: +TA.toFixed(3) || 0,
        gorssMA: +MA.toFixed(3) || 0,
        grossSalary: +totalSalary.toFixed(3) || 0,
      };
      return obj;
    } else {
      let obj = {
        grossBasic: 0,
        grossDA: 0,
        grossHRA: 0,
        gorssTA: 0,
        gorssMA: 0,
        grossSalary: 0,
      };
      return obj;
    }
  };
  const calculateDeduc = (emp) => {
    let ESIdiduct = (+emp?.grossSalary) * 0.01 || 0;
    let PFamount = (+emp?.grossSalary) * 0.12 || 0;
    let advanceAmount = 0;
    let total = ESIdiduct + PFamount + advanceAmount;
    let obj = {
      ESIdiduct: ESIdiduct || 0,
      PFamount: PFamount || 0,
      advanceAmount: advanceAmount || 0,
      total: total || 0,
    };
    return obj;
  };
  const calcSalaryRate = (emp) => {
    let obj = {
      basicSalary: emp?.montlyctc || 0,
      TA: emp?.TA || 0,
      HRA: emp?.M_HRA || 0,
      MA: emp?.MA || 0,
      totalSalary: Math.floor(emp?.anualctc / 12) || 0,
      DA: emp?.DA || 0,
    };
    return obj;
  };
  const calculateAttendance = async (prod, emp) => {
    if (prod) {
      let startDate = new Date(filterQueries?.fromDate).getDate();
      let endDate = new Date(filterQueries?.toDate).getDate();
      let endYear = new Date(filterQueries?.toDate).getFullYear();
      let endMonth = new Date(filterQueries?.toDate).getMonth() + 1;
      const leaves = await leavesData(emp);
      const workingHours = +(prod / 3600000).toFixed(3) || 0;
      const presentDays =
        Math.floor(workingHours / (DAILY_WORKING_HOURS - DAILY_BREAK_HOURS)) ||
        0;
      const paidLeaves = leaves?.paidLeaves || 0;
      const unpaidLeaves = leaves?.unpaidLeaves || 0;
      let weekOff = 0;
      let joinDate = new Date(emp.joinDate).getDate();
      let joinedMonth = new Date(emp.joinDate).getMonth() + 1;
      let joinYear = new Date(emp.joinDate).getFullYear();
      if (
        joinYear == endYear &&
        joinedMonth == endMonth &&
        joinDate > startDate
      ) {
        for (let i = joinDate; i <= endDate; i++) {
          var newDate = `${endYear}-${endMonth}-${i}`;
          if (!new Date(newDate).getDay()) {
            weekOff++;
          }
        }
      } else {
        for (let i = startDate; i <= endDate; i++) {
          var newDate = `${endYear}-${endMonth}-${i}`;
          if (!new Date(newDate).getDay()) {
            weekOff++;
          }
        }
      }
      const weeklyOff = weekOff || 4;
      const festiveLeaves = (await getHolidaysBetweenDates()) || 0;
      const totalDays = presentDays
        ? presentDays + weeklyOff + paidLeaves + festiveLeaves
        : 0;
      let obj = {
        presentDays,
        paidLeaves,
        weeklyOff,
        festiveLeaves,
        workingHours,
        totalDays,
        unpaidLeaves,
      };
      return obj;
    } else {
      let obj = {
        presentDays: 0,
        paidLeaves: 0,
        weeklyOff: 0,
        festiveLeaves: 0,
        workingHours: 0,
        totalDays: 0,
        unpaidLeaves: 0,
      };
      return obj;
    }
  };
  const leavesData = async (emp) => {
    let from = filterQueries?.fromDate;
    let to = filterQueries?.toDate;
    let allLeaves = await fetchLeaves(emp._id);
    let approvedLeaves = allLeaves.map((el) => el.approved);
    if (approvedLeaves.length <= emp.employeeType?.noOfLeaves) {
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
  const getHolidaysBetweenDates = async () => {
    let from = new Date(filterQueries?.fromDate);
    let to = new Date(filterQueries?.toDate);
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
  const fetchEmployees = async () => {
    let res = await allemployee();
    setAllEmployees(res);
  };
  const fetchDepartments = async () => {
    const res = await httpService.get('/department');
    setDepartments(res?.data);
  };
  const fetchPayrolls = async () => {
    try {
      const getPayRoll = await httpService.get('/payroll');
      setAllPayroll(getPayRoll?.data);
    } catch (err) {
      toast.error(`something went wrong :${err.message}`);
    }
  };
  const handleDepartmentChange = (e) => {
    let depId = e.target.value;
    if (depId) {
      let empFilter = allEmployees?.filter((el) => el.department === depId);
      setFiltredEmp(empFilter);
    } else {
      setFiltredEmp(allEmployees);
    }
  };
  function titleCase(text) {
    const words = text.toLowerCase().split(' ');

    const titleCaseWords = words.map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const restOfWord = word.slice(1);
      return firstLetter + restOfWord;
    });

    return titleCaseWords.join(' ');
  }
  const processPayrollsBtn = () => {
    console.log(tableData)
    if (!filterQueries) {
      toast.error('Please select a Date');
      return;
    }
    tableData.map(async(el)=>{
      try{
        let res = await httpService.post(`/payroll`,el);
        if(res){
          toast.success("Payroll of all Employees has been processed")
        }
      }catch(err){
        toast.error("something went wrong !",err.message)
      }
    })
    history.goBack()
  };
  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      render: (text, record) => (
        <div className="table-avatar">
          <Link to={`/app/profile/employee-profile/${record?.employeeId}`}>
            {titleCase(record?.name)}
          </Link>
        </div>
      ),
      sorter: (a, b) => a.name - b.name,
    },
    {
      title: 'Month',
      render: (text, record) => (
        <span>
          {new Date(filterQueries?.fromDate).toLocaleString('default', {
            month: 'long',
          })}{' '}
        </span>
      ),
    },
    {
      title: 'Attendance',
      dataIndex:"attendance",
      render: (text, record) => (
        <span> {record?.attendance.totalDays} </span>
      ),
      sorter: (a, b) => a.attendance.totalDays - b.attendance.totalDays
    },
    {
      title: 'Basic (50%)',
      dataIndex:"basicSalary",
      render: (text, record) => (
        <span> {record?.salaryRate?.basicSalary.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.salaryRate.basicSalary - b.salaryRate.basicSalary
    },
    {
      title: 'HRA (20%)',
      dataIndex:"basicHra",
      render: (text, record) => (
        <span> {record?.salaryRate?.HRA.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.salaryRate.HRA - b.salaryRate.HRA
    },
    {
      title: 'DA (10%)',
      dataIndex:"basicSalary",
      render: (text, record) => (
        <span> {record?.salaryRate?.DA.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.salaryRate.DA - b.salaryRate.DA
    },
    {
      title: 'TA (10%)',
      dataIndex:"basicSalary",
      render: (text, record) => (
        <span> {record?.salaryRate?.TA.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.salaryRate.TA - b.salaryRate.TA
    },
    {
      title: 'MA (5%)',
      dataIndex:"basicSalary",
      render: (text, record) => (
        <span> {record?.salaryRate?.MA.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.salaryRate.MA - b.salaryRate.MA
    },
    {
      title: 'Gross Salary',
      dataIndex:"grossSalary",
      render: (text, record) => (
        <span> {record?.earnedSalary?.grossSalary.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.earnedSalary.grossSalary - b.earnedSalary.grossSalary
    },

    {
      title: 'ESI (1%)',
      dataIndex:"deduction",
      render: (text, record) => (
        <span> {record?.deduction?.ESIdiduct.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.deduction?.ESIdiduct - b.deduction?.ESIdiduct
    },
    {
      title: 'PF (12%)',
      dataIndex:"deduction",
      render: (text, record) => (
        <span> {record?.deduction?.PFamount.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.deduction?.PFamount - b.deduction?.PFamount
    },
    {
      title: 'Net Deduction',
      dataIndex:"deduction",
      render: (text, record) => (
        <span> {record?.deduction?.total.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.deduction?.total - b.deduction?.total
    },
    {
      title: 'Net Salary',
      dataIndex:"netSalary",
      render: (text, record) => (
        <span> {record?.netSalary.toFixed(2)} </span>
      ),
      sorter: (a, b) => a.netSalary - b.netSalary
    },
    // {
    //   width: '15%',
    //   title: 'Action',
    //   render: (text, record) => (
    //     <Space size={'small'}>
    //       {record?.connfirm == '1' ? (
    //         <>
    //           <i className={'fa fa-check-circle'} />
    //         </>
    //       ) : (
    //         <>
    //           <Link
    //             to={{
    //               pathname: `/app/administrator/payroll-form`,
    //               state: { edit: true, payId: record?.id, record },
    //             }}
    //             className="ant-btn"
    //           >
    //             <i className="fa fa-pencil  m-r-5" />
    //             Edit
    //           </Link>
    //         </>
    //       )}
    //       <button
    //         className="ant-btn ant-btn-dangerous"
    //         onClick={() => handleDelete(record?._id)}
    //       >
    //         <i className="fa fa-trash-o m-r-5" />
    //         Delete
    //       </button>
    //     </Space>
    //   ),
    // },
  ];
  return (
    <div className={'page-wrapper'}>
      {/* Page Content */}
      {isLoading ? (
        <div
          style={{
            height: '90vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          className="content container-fluid"
        >
          <CircularProgress />
        </div>
      ) : (
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Payroll Bulk Processing</h3>
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

          <Stack
            direction={'row'}
            spacing={4}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
            sx={{ marginBottom: '40px', height: '50px' }}
          >
            <Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                  <DatePicker
                    label={'Month Year'}
                    views={['year', 'month']}
                    slotProps={{
                      field: {
                        variant: 'filled',
                      },
                    }}
                    onChange={(e) => {
                      e = new Date(e);
                      const startMonth = moment(e);
                      const endMonth = moment(e).endOf('month');
                      setFilterQueries({
                        ...filterQueries,
                        fromDate: new Date(startMonth).toISOString(),
                        toDate: new Date(endMonth).toISOString(),
                      });
                    }}
                    onAccept={(e) => {
                      e = new Date(e);
                      setSelectedMonthYear({
                        month: e.getMonth() + 1,
                        year: e.getFullYear(),
                      });
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Box>
            <Box sx={{ width: '250px', height: '50px' }}>
              <FormControl fullWidth>
                {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  displayEmpty
                  // value={s}
                  defaultValue={''}
                  onChange={handleDepartmentChange}
                >
                  <MenuItem value="">All Department</MenuItem>
                  {departments?.map((department) => (
                    <MenuItem value={department._id} key={department?._id}>
                      {department?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: '500px', height: '100%' }}>
              <Button
                startIcon={<i className={'fa fa-money'} />}
                color={'info'}
                sx={{ height: '55px', fontWeight: 900 }}
                variant="outlined"
                onClick={processPayrollsBtn}
              >
                Process Payrolls
              </Button>
            </Box>
          </Stack>
          {/* /Search Filter */}

          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive">
                <Table
                  pagination={{
                    total: tableData?.length,
                    showTotal: (total, range) =>
                      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    itemRender: itemRender,
                  }}
                  style={{ overflowX: 'auto' }}
                  columns={columns}
                  bordered
                  dataSource={tableData}
                  key={(record) => record._id}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* /Page Content */}
    </div>
  );
};

export default CreateBulkPayroll;
