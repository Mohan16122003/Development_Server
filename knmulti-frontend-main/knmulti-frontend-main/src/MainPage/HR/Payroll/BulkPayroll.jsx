



// THIS COMPONENT HAS BEEN REPLACED BY CreateBulkPayroll



import React, { useEffect, useState } from 'react';
import httpService from '../../../lib/httpService';
import { allemployee, fetchAttendance, fetchLeaves } from '../../../lib/api';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Space, Table } from 'antd';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import { PAYROLL_STATES } from '../../../model/shared/leaveStates';
import { dateDiff, filterAttendance1 } from '../../../misc/helpers';
import { toast } from 'react-toastify';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';

function BulkPayroll() {
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [data, setData] = useState([]);
  const [filterQueries, setFilterQueries] = useState({
    department: '',
    fromDate: '',
    toDate: '',
  });
  // Fetch Departments
  const fetchDepartments = async () => {
    const departments = await httpService.get('/department');
    setDepartments(departments?.data);
  };
  // fetch employees
  const fetchAllEmployees = async () => {
    const res = await allemployee();
    setEmployees(res);
  };
  // Change department
  const handleDepartmentFilterChange = (e) => {
    setFilterQueries({ ...filterQueries, department: e.target.value });
  };
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

  async function processPayrollsBtn() {
    if (filterQueries.fromDate == undefined || filterQueries.fromDate == '') {
      toast.error('Please select a From Date');
      return;
    }
    if (filterQueries.toDate == undefined || filterQueries.toDate == '') {
      toast.error('Please select a To Date');
      return;
    }
    const payrolls = [];
    // filterQueries.department;

    if (filterQueries.department) {
      for (const employee of _emp) {
        if (
          employee?.SALARYCOMPONENTS?.montlyctc &&
          employee?.SALARYCOMPONENTS?.M_HRA
        ) {
          const salaryRate = {
            DA: 0,
            HRA: employee?.SALARYCOMPONENTS?.M_HRA,
            basicSalary: employee?.SALARYCOMPONENTS?.montlyctc,
          };
          let x = salaryRate?.basicSalary;
          let da = (x * 10) / 100;
          let hra = salaryRate?.HRA;
          let ts = +x + +da + +hra;
          salaryRate['DA'] = da;
          salaryRate['HRA'] = hra;
          salaryRate['totalSalary'] = ts;
          console.log(salaryRate, 'salaryRate');
          const resFA = await fetchAttendance(employee._id);
          console.log(resFA, 'attendance');
          const resFL = await fetchLeaves();
          const plannedLeaves = resFL
            ?.map((leave, index) => {
              return {
                _id: leave?._id,
                id: index + 1,
                employee: leave?.employee,
                leaveType: leave?.leaveType?.leaveTypeName,
                fromDate: new Date(leave?.fromDate).toLocaleDateString(),
                toDate: new Date(leave?.toDate).toLocaleDateString(),
                noofdays: dateDiff(
                  new Date(leave?.fromDate),
                  new Date(leave?.toDate)
                ),
                reason: leave?.reason,
                status: leave?.status,
              };
            })
            .filter((leave) => {
              return (
                new Date(firstDayPrevMonth).getMonth() >=
                  new Date(leave?.fromDate).getMonth() &&
                new Date(lastDayPrevMonth).getMonth() <=
                  new Date(leave?.toDate).getMonth()
              );
            })
            .map((e) => {
              return {
                ...plannedLeaves,
                noOfdays: dateDiff(new Date(e?.fromDate), new Date(e?.toDate)),
                name: e?.employee?.name,
                id: e?.employee?._id,
              };
            });
          const paidLeaves = plannedLeaves
            .filter((e1) => {
              return e1?.id === employee._id;
            })
            .map((e1) => {
              return e1?.noOfdays;
            });
          const presentDays = filterAttendance1(
            resFA,
            filterQueries.fromDate,
            filterQueries.toDate
          );
          const attendance = {
            present: presentDays,
            paidLeave: paidLeaves?.[0] || 0,
            weeklyOff: 0,
            festival: 0,
            paidDays: 0,
          };
          const earnedSalary = {
            eBasicSalary: 0,
            eDA: 0,
            eHRA: 0,
            incentive: 0,
            totalEarned: 0,
          };
          attendance['paidDays'] =
            +attendance?.present +
              +attendance?.paidLeave +
              +attendance?.weeklyOff ||
            +attendance?.festival ||
            0;

          if (attendance?.paidDays) {
            let x = (salaryRate?.basicSalary * +attendance?.paidDays) / 30;
            let da = (x * 10) / 100;

            let hra = (+x + +da) * 0.3;
            let hraatt = (hra * +attendance?.paidDays) / 30;
            let ts = +x + +da + +hraatt + +earnedSalary?.incentive;
            // console.log({ x, da, hraatt, hra });
            earnedSalary['eBasicSalary'] = x;
            earnedSalary['eDA'] = da;
            earnedSalary['eHRA'] = hraatt;
            earnedSalary['totalEarned'] = ts;
          }
          const deduction = {
            esiAmount: 0,
            PF: 0,
            advanceAmt: 0,
            TDS: 0,
            LWF: 0,
            professionalTax: 0,
            totalDeduction: 0,
          };
          if (salaryRate?.basicSalary && attendance?.paidDays) {
            let x = (+earnedSalary?.eBasicSalary + +earnedSalary?.eDA) * 0.12;
            let y =
              +x +
              +deduction?.advanceAmt +
              +deduction?.TDS -
              +deduction?.esiAmount;
            deduction['PF'] = x;
            deduction['totalDeduction'] = y;
          }
          const netSalary =
            +earnedSalary?.totalEarned - deduction?.totalDeduction;
          const empSalary = {
            employeeId: employee,
            fromDate: filterQueries.fromDate,
            toDate: filterQueries.toDate,
            netSalary,
            description: 'Bulk Processing Payroll',
            salaryRate,
            attendance,
            earnedSalary,
            deduction,
            connfirm: 0,
          };
          console.log(empSalary, 'Payroll');
          httpService.post(`/payroll`, empSalary).then((res) => {
            toast.success(
              `Salary payroll is processed for Employee ID: ${employee._id}`
            );
            setData((prevState) => {
              return [...prevState, { ...empSalary }];
            });
          });
        }
      }
    } else {
      for (const employee of employees) {
        const getPayRoll = await httpService.get('/payroll', {
          params: {
            employeeId: employee?._id,
            formDate: filterQueries?.fromDate.toString(),
            toDate: filterQueries?.toDate.toString(),
          },
        });
        if (getPayRoll.status !== 200) {
          return;
        }
        if (
          employee?.SALARYCOMPONENTS?.montlyctc &&
          employee?.SALARYCOMPONENTS?.M_HRA &&
          getPayRoll?.data?.length === 0
        ) {
          const salaryRate = {
            DA: 0,
            HRA: employee?.SALARYCOMPONENTS?.M_HRA,
            basicSalary: employee?.SALARYCOMPONENTS?.montlyctc,
          };
          let x = salaryRate?.basicSalary;
          let da = (x * 10) / 100;
          let hra = salaryRate?.HRA;
          let ts = +x + +da + +hra;
          salaryRate['DA'] = da;
          salaryRate['HRA'] = hra;
          salaryRate['totalSalary'] = ts;
          console.log(salaryRate, 'salaryRate');
          const resFA = await fetchAttendance(employee._id);
          console.log(resFA, 'attendance');
          const resFL = await fetchLeaves();
          const plannedLeaves = resFL
            ?.map((leave, index) => {
              return {
                _id: leave?._id,
                id: index + 1,
                employee: leave?.employee,
                leaveType: leave?.leaveType?.leaveTypeName,
                fromDate: new Date(leave?.fromDate).toLocaleDateString(),
                toDate: new Date(leave?.toDate).toLocaleDateString(),
                noofdays: dateDiff(
                  new Date(leave?.fromDate),
                  new Date(leave?.toDate)
                ),
                reason: leave?.reason,
                status: leave?.status,
              };
            })
            .filter((leave) => {
              return (
                new Date(firstDayPrevMonth).getMonth() >=
                  new Date(leave?.fromDate).getMonth() &&
                new Date(lastDayPrevMonth).getMonth() <=
                  new Date(leave?.toDate).getMonth()
              );
            })
            .map((e) => {
              return {
                ...plannedLeaves,
                noOfdays: dateDiff(new Date(e?.fromDate), new Date(e?.toDate)),
                name: e?.employee?.name,
                id: e?.employee?._id,
              };
            });
          const paidLeaves = plannedLeaves
            .filter((e1) => {
              return e1?.id === employee._id;
            })
            .map((e1) => {
              return e1?.noOfdays;
            });

          const presentDays = filterAttendance1(
            resFA,
            filterQueries.fromDate,
            filterQueries.toDate
          );
          const attendance = {
            present: presentDays,
            paidLeave: paidLeaves?.[0] || 0,
            weeklyOff: 0,
            festival: 0,
            paidDays: 0,
          };
          const earnedSalary = {
            eBasicSalary: 0,
            eDA: 0,
            eHRA: 0,
            incentive: 0,
            totalEarned: 0,
          };
          attendance['paidDays'] =
            +attendance?.present +
              +attendance?.paidLeave +
              +attendance?.weeklyOff ||
            +attendance?.festival ||
            0;

          if (attendance?.paidDays) {
            let x = (salaryRate?.basicSalary * +attendance?.paidDays) / 30;
            let da = (x * 10) / 100;

            let hra = (+x + +da) * 0.3;
            let hraatt = (hra * +attendance?.paidDays) / 30;
            let ts = +x + +da + +hraatt + +earnedSalary?.incentive;
            // console.log({ x, da, hraatt, hra });
            earnedSalary['eBasicSalary'] = x;
            earnedSalary['eDA'] = da;
            earnedSalary['eHRA'] = hraatt;
            earnedSalary['totalEarned'] = ts;
          }
          const deduction = {
            esiAmount: 0,
            PF: 0,
            advanceAmt: 0,
            TDS: 0,
            LWF: 0,
            professionalTax: 0,
            totalDeduction: 0,
          };
          if (salaryRate?.basicSalary && attendance?.paidDays) {
            let x = (+earnedSalary?.eBasicSalary + +earnedSalary?.eDA) * 0.12;
            let y =
              +x +
              +deduction?.advanceAmt +
              +deduction?.TDS -
              +deduction?.esiAmount;
            deduction['PF'] = x;
            deduction['totalDeduction'] = y;
          }
          const netSalary =
            +earnedSalary?.totalEarned - deduction?.totalDeduction;
          const empSalary = {
            employeeId: employee,
            fromDate: filterQueries.fromDate,
            toDate: filterQueries.toDate,
            netSalary,
            description: 'Bulk Processing Payroll',
            salaryRate,
            attendance,
            earnedSalary,
            deduction,
            connfirm: 0,
          };
          console.log(empSalary, 'Payroll');
          httpService.post(`/payroll`, empSalary).then((res) => {
            toast.success(
              `Salary payroll is processed for Employee ID: ${employee._id}`
            );
            setData((prevState) => {
              return [...prevState, { ...empSalary, _id: res?.data?._id }];
            });
          });
        }
      }
    }
  }
  console.log("hello world")
  const handleDelete = async (id) => {
    if (!id) {
      return;
    }
    httpService.delete(`/payroll/${id}`).then((res) => {
      if (res.status) {
        setData((prevState) => {
          return prevState.filter((item) => item?._id !== id);
        });
        toast.success('Payroll deleted successfully.');
      }
    });
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employeeId',
      render: (text, record) => (
        <h2 className="table-avatar">
          <Link to={`/app/profile/employee-profile/${record._id}`}>
            <Avatar sx={{ bgcolor: 'red[400]' }}>
              {record?.employeeId?.name?.substr(0, 1).toUpperCase()}
            </Avatar>
          </Link>
          <Link
            // onClick={(e) => {
            //   setRenderEdit(record?._id);
            //   setSelectRender('payrollView');
            // }}
            to={{
              pathname: `/app/administrator/payroll-view`,
              state: {
                id: record?._id,
                payrollData: data,
                setSelectRender: 'payrollView',
              },
            }}
          >
            {record?.employeeId?.name}{' '}
            <span>{record?.employeeId?.jobRole?.name}</span>
          </Link>
        </h2>
      ),
      sorter: (a, b) => a.name?.length - b.name?.length,
    },

    {
      title: 'From',
      dataIndex: 'fromDate',
      render: (text, record) => <span>{text} </span>,
      sorter: (a, b) => a.fromDate?.length - b.fromDate?.length,
    },
    {
      title: 'To',
      dataIndex: 'toDate',
      render: (text, record) => <span>{text?.split('T')[0]}</span>,
      sorter: (a, b) => a.toDate.length - b.toDate.length,
    },

    {
      title: 'Amount',
      dataIndex: 'netSalary',
      sorter: (a, b) => a.reason?.length - b.reason?.length,
      render: (text, record) => <span>{Math.round(text)}</span>,
    },
    {
      title: 'Payroll status',
      dataIndex: 'Payroll_status',
      sorter: (a, b) => a.reason?.length - b.reason?.length,
      render: (text, record) => (
        <div className="dropdown action-label text-center">
          {!record?.connfirm == '1' ? (
            <> {text || 'Pending'} </>
          ) : (
            <>
              {text == 'CREADIT' ? (
                text
              ) : (
                <a
                  className="btn btn-white btn-sm btn-rounded dropdown-toggle"
                  href="#"
                  data-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i
                    className={
                      text === 'CREADIT'
                        ? 'fa fa-dot-circle-o text-purple'
                        : text === 'PENDING'
                        ? 'fa fa-dot-circle-o text-danger'
                        : text === 'APPROVED'
                        ? 'fa fa-dot-circle-o text-success'
                        : 'fa fa-dot-circle-o text-danger'
                    }
                  />{' '}
                  {text || 'Pending'}
                  {''}
                </a>
              )}

              <div className="dropdown-menu dropdown-menu-right">
                {Object.keys(PAYROLL_STATES).map((state, index) => (
                  <span
                    key={index}
                    className="dropdown-item text-left"
                    onClick={() => {
                      handleLeaveStatusEdit(record, PAYROLL_STATES[state]);
                    }}
                  >
                    {String(state).toUpperCase()}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      width: '15%',
      title: 'Action',
      render: (text, record) => (
        <Space size={'small'}>
          {record?.connfirm == '1' ? (
            <>
              <i className={'fa fa-check-circle'} />
            </>
          ) : (
            <>
              <Link
                // onClick={() => {
                //   setRenderEdit(record?._id);
                //   setSelectRender('payrollEdit');
                // }}
                to={{
                  pathname: `/app/administrator/payroll-form`,
                  state: { edit: true, payId: record?._id, record },
                }}
                className="ant-btn"
                // data-toggle="modal"
                // data-target="#edit_leave"
              >
                <i className="fa fa-pencil  m-r-5" />
                Edit
              </Link>
            </>
          )}
          <button
            className="ant-btn ant-btn-dangerous"
            onClick={() => handleDelete(record?._id)}
          >
            <i className="fa fa-trash-o m-r-5" />
            Delete
          </button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchDepartments().then(() => {
      fetchAllEmployees().then(() => {
        setIsLoading(false);
      });
    });
  }, []); 

  const [_emp, set_Emp] = useState([]);

  function filtterEmployee(emps, dep) {
    const filtteredEmp = emps.filter((emp) => emp?.department === dep);
    setData(filtteredEmp);
    return set_Emp([...filtteredEmp]);
  }

  useEffect(() => {
    // TODO: Need to implement filter for employees based on department
    filtterEmployee(employees, filterQueries?.department);
  }, [filterQueries?.department]);

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
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Payroll Bulk Process</h3>
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
                    views={['month', 'year']}
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
                        fromDate: startMonth.toDate().toString(),
                        toDate: endMonth.toDate().toString(),
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
                  defaultValue={'all'}
                  onChange={(e) => handleDepartmentFilterChange(e)}
                >
                  <MenuItem value="all">All Department</MenuItem>
                  {departments.map((department) => (
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
                  /*locale={{
                    emptyText: 'No any payroll is processed currently.'
                  }}*/
                  className="table-striped"
                  pagination={{
                    total: data?.length,
                    showTotal: (total, range) =>
                      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    itemRender: itemRender,
                  }}
                  style={{ overflowX: 'auto' }}
                  columns={columns}
                  // bordered
                  dataSource={data}
                  rowKey={(record) => record._id}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* /Page Content */}
    </div>
  );
}

export default BulkPayroll;
