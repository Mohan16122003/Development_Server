import React, { useEffect, useState, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  allemployee,
  fetchAttendanceRange,
  fetchLeaves,
  getEmployee,
} from '../../../lib/api';
import { MONTHS } from '../../../model/shared/months';
import { YEARS } from '../../../model/shared/years';
import AttendanceTable from './AttendanceTable';
import FilteredAttendanceEmployeeTable from './FilteredAttendanceEmployeeTable';
import { daysInMonth } from '../../../misc/helpers';
import { AttendanceTableContext } from './index';
import AttendanceStats from '../../../components/AttendanceStats';
import AttendanceTablee from '../../../components/AttendanceTablee';
import UploadAttencanceFile from '../../../components/UploadAttencanceFile';
import DownloadAttendance from '../../../components/DownloadAttendance';
import { DAILY_WORKING_HOURS } from '../../../misc/constants';
import DownloadSingleAttendance from '../../../components/DownloadSingleAttendance';

const AttendanceAdmin = () => {
  const { filteredAttendanceState, setFilteredAttendanceState } = useContext(
    AttendanceTableContext
  );
  const [employeeList, setEmployeeList] = useState([]);
  const [filterQueries, setFilterQueries] = useState({
    name: '',
    date: null,
    month: null,
    year: null,
  });
  // const [filteredByNameList, setFilteredByNameList] = useState([]);
  const [filteredByNameEmployee, setFilteredByNameEmployee] = useState(null);
  const [filterQueries2, setFilterQueries2] = useState({
    month: { value: new Date().getMonth() },
    year: { value: new Date().getFullYear() },
  });
  const [totalLeaves, setTotalLeaves] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [plannedLeaves, setPlannedLeaves] = useState([]);
  const [plannedEmpId, setPlannedEmpId] = useState([]);
  const [currentRender, setCurrentRender] = useState('default');
  const [presentEmpId, setPresentEmpId] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const loadFn = async () => {
    const res = await fetchLeaves();
    const resPlannedLeaves = res?.filter(
      (leave) =>
        leave?.status === 'APPROVED' &&
        new Date().getTime() > new Date(leave?.fromDate).getTime() &&
        new Date().getTime() < new Date(leave?.toDate).getTime()
    );
    setPlannedLeaves(resPlannedLeaves);
    resPlannedLeaves?.map((e) =>
      setPlannedEmpId((oldArray) => [...oldArray, e?.employee?._id])
    );
  };
  useEffect(() => {
    loadFn();
  }, []);

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  }, []);

  useEffect(async () => {
    const res = await allemployee();
    setEmployeeList(res);
    setEmployeeData(res);
  }, []);
  const currentRenderChange = (val) => {
    setCurrentRender(val);
  };
  const DAYS = (() => {
    let days = [];
    for (
      let i = 0;
      i <
      daysInMonth(filterQueries2?.month?.value, filterQueries2?.year?.value);
      i++
    ) {
      days.push(i + 1);
    }
    return days;
  })();

  //get sundays dates
  let d = new Date(
    filterQueries2?.year?.value,
    filterQueries2?.month?.value + 1,
    0
  );
  let sun = [];
  let sunTill = [];
  for (var i = 1; i <= DAYS.length; i++) {
    //looping through days in month
    let newDate = new Date(d.getFullYear(), d.getMonth(), i);
    if (newDate.getDay() == 0) {
      //if Sunday
      sun.push(i);
    }
  }
  //end
  // get Sundays till date
  for (let i = 1; i <= new Date().getDate(); i++) {
    let newDate = new Date(d.getFullYear(), d.getMonth(), i);
    if (newDate.getDay() == 0) {
      sunTill.push(i);
    }
  }

  useEffect(async () => {
    if (filteredAttendanceState?.state) {
      setEmployee(filteredAttendanceState.emp);
      setFilteredByNameEmployee(filteredAttendanceState.data);
      const res2 = await fetchLeaves(filteredAttendanceState?.emp_id);
      setTotalLeaves(res2);
      setFilteredAttendanceState({ ...filteredAttendanceState, state: false });
    } else {
    }
  }, [filteredAttendanceState]);

  let days2 = DAYS;
  let modifiedArr = [];
  for (let i = 0; i < sun.length; i++) {
    var newArr = days2.map((element, index) => {
      if (element === sun[i]) {
        return 'SUN';
      }
      return element;
    });
    modifiedArr = newArr;
    days2 = modifiedArr;
  }
  const calcPresentData = (data) => {
    let timeLimit = (DAILY_WORKING_HOURS / 2) * (1000 * 60 * 60);
    return data.filter((el) => el?.productionTime > timeLimit);
  };
  const claculateAbsent = (data) => {
    let timeLimit = (DAILY_WORKING_HOURS / 2) * (1000 * 60 * 60);
    return data.filter(
      (el) =>
        new Date(el.sessions[0].from).getDay() && el.productionTime < timeLimit
    );
  };

  return (
    <>
      {currentRender === 'default' ? (
        <div className="page-wrapper">
          <Helmet>
            <title>Attendance </title>
            <meta name="description" content="Login page" />
          </Helmet>
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="col-sm-6">
                  <h3 className="page-title">Attendance</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/app/dashboard">Dashboard</Link>
                    </li>
                    <li
                      className={`${
                        filteredByNameEmployee
                          ? 'breadcrumb-item text-dark cursor-pointer'
                          : 'breadcrumb-item'
                      } `}
                      onClick={() => {
                        setFilteredByNameEmployee(null);
                      }}
                    >
                      Attendance
                    </li>
                    {filteredByNameEmployee && (
                      <li className="breadcrumb-item">
                        {filteredAttendanceState?.fId}
                      </li>
                    )}
                  </ul>
                </div>
                {!filteredByNameEmployee ? (
                  <div className="row" style={{ marginTop: '6px' }}>
                    <UploadAttencanceFile />
                    <DownloadAttendance range={filterQueries2} />
                  </div>
                ) : (
                  <div className="row" style={{ marginTop: '6px' }}>
                    <DownloadSingleAttendance
                      data={filteredAttendanceState}
                      date={filterQueries2}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* /Page Header */}
            {/* Search Filter */}
            <div className="row filter-row">
              <div className="col-sm-6 col-md-3">
                <div className="form-group form-focus focused">
                  <input
                    type="text"
                    value={filterQueries?.name}
                    className="form-control floating"
                    onChange={(e) =>
                      setFilterQueries({
                        ...filterQueries,
                        name: e.target.value,
                      })
                    }
                  />
                  <label className="focus-label">Employee Name</label>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <div className="form-group form-focus focused text-left">
                  <a
                    className="btn form-control btn-white dropdown-toggle"
                    href="#"
                    data-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {filterQueries?.month?.name || 'Month'}
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-right attendance_drop_menu"
                    // style={{ width: '100%', padding: '0.5rem 0.5rem' }}
                  >
                    {MONTHS.filter((month) => {
                      return month.value <= 11;
                    })?.map((month, index) => (
                      <span
                        key={index}
                        className="dropdown-item attendance_drop_item"
                        onClick={() => {
                          setFilterQueries({
                            ...filterQueries,
                            month: month,
                          });
                          setFilterQueries2({
                            ...filterQueries2,
                            month: month,
                          });
                          filteredByNameEmployee &&
                            setFilteredAttendanceState({
                              ...filteredAttendanceState,
                              state: true,
                            });
                        }}
                      >
                        {month?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <div className="form-group form-focus select-focus">
                  <a
                    className="btn form-control btn-white dropdown-toggle"
                    href="#"
                    data-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {filterQueries?.year?.name || 'Year'}
                  </a>
                  <div className="dropdown-menu dropdown-menu-right attendance_drop_menu">
                    {YEARS?.map((year, index) => (
                      <span
                        key={index}
                        className="dropdown-item attendance_drop_item"
                        onClick={() => {
                          setFilterQueries({
                            ...filterQueries,
                            year: year,
                          });
                          setFilterQueries2({
                            ...filterQueries2,
                            year: year,
                          });
                          filteredByNameEmployee &&
                            setFilteredAttendanceState({
                              ...filteredAttendanceState,
                              state: true,
                            });
                        }}
                      >
                        <i className="fa" /> {year?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <button
                  className="btn btn-danger btn-block"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            {/* {filteredByNameEmployee  */}
            {filteredByNameEmployee ? (
              <div className="row">
                <div className="col-md-3">
                  <div className="stats-info">
                    <h6>Present</h6>
                    <h4>
                      {calcPresentData(filteredByNameEmployee).length}/
                      {daysInMonth(
                        filterQueries2?.month?.value,
                        filterQueries2?.year?.value
                      ) - sun.length}
                    </h4>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <h6>Absent</h6>
                    <h4>
                      {claculateAbsent(filteredByNameEmployee).length ||
                        new Date().getDate() -
                          calcPresentData(filteredByNameEmployee)?.length -
                          sunTill.length}{' '}
                    </h4>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <h6>Leaves</h6>
                    <h4>
                      {totalLeaves?.length} <span>applied</span>
                    </h4>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <h6>Remaining Leaves</h6>
                    <h4>
                      {employee?.employeeType?.noOfLeaves -
                        totalLeaves?.length >
                      0
                        ? employee?.employeeType?.noOfLeaves -
                          totalLeaves?.length
                        : 0}
                    </h4>
                  </div>
                </div>
              </div>
            ) : (
              <AttendanceStats
                currentRenderChange={currentRenderChange}
                setPresentEmpId={setPresentEmpId}
                plannedLeaves={plannedLeaves}
                employeeData={employeeData}
                plannedEmpId={plannedEmpId}
              />
            )}
            <div className="row">
              <div className="col-sm-12 mb-3">
                <span>
                  <span
                    className="text text-primary"
                    style={{ fontSize: '20px', fontWeight: 'bolder' }}
                  >
                    Month :
                  </span>{' '}
                  <span
                    className="ml-1"
                    style={{ fontSize: '18px', fontWeight: 'bolder' }}
                  >
                    {filterQueries?.month?.name ||
                      MONTHS.filter(
                        (month) =>
                          month.value === parseInt(new Date().getMonth())
                      )[0]?.name}
                  </span>
                </span>{' '}
                <span className="ml-4">
                  <span
                    className="text text-primary"
                    style={{ fontSize: '20px', fontWeight: 'bolder' }}
                  >
                    Year :{' '}
                  </span>
                  {'  '}
                  <span
                    className="ml-1"
                    style={{ fontSize: '18px', fontWeight: 'bolder' }}
                  >
                    {filterQueries?.year?.name ||
                      YEARS.filter(
                        (year) =>
                          year.value === parseInt(new Date().getFullYear())
                      )[0]?.name}
                  </span>
                </span>{' '}
              </div>
              <div className="col-lg-12">
                <div className="table-responsive">
                  {filteredByNameEmployee ? (
                    <FilteredAttendanceEmployeeTable
                      data={filteredByNameEmployee}
                    />
                  ) : (
                    <>
                      <table className="table table-striped custom-table table-nowrap mb-0">
                        <thead>
                          <tr style={{ position: 'relative' }}>
                            <th
                              style={{
                                position: 'sticky',
                                left: '0px',
                                background: 'white',
                              }}
                            >
                              Employee
                            </th>
                            {days2.map((day, index) => {
                              return (
                                <>
                                  <th
                                    key={index}
                                    style={{
                                      backgroundColor:
                                        day === 'SUN' ? 'yellow' : ' ',
                                    }}
                                  >
                                    {day}
                                  </th>
                                </>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {filterQueries
                            ? employeeList
                                ?.filter((emp) => {
                                  if (filterQueries?.name == '') {
                                    return emp;
                                  } else if (
                                    emp.firstName
                                      ?.toLowerCase()
                                      .includes(
                                        filterQueries?.name?.toLowerCase()
                                      )
                                  ) {
                                    return emp;
                                  }
                                })
                                .map((emp) => (
                                  <AttendanceTable
                                    employee={emp}
                                    filterQueries={filterQueries}
                                    dateRange={filterQueries2}
                                  />
                                ))
                            : null}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* /Page Content */}
        </div>
      ) : (
        <AttendanceTablee
          currentRender={currentRender}
          presentEmpId={presentEmpId}
          setCurrentRender={setCurrentRender}
        />
      )}
    </>
  );
};

export default AttendanceAdmin;
