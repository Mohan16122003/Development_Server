import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { handleLogout } from '../../../initialpage/Sidebar/header';
import { fetchAttendanceRange } from '../../../lib/api';
import { DAILY_WORKING_HOURS } from '../../../misc/constants';
import {
  checkIsEmployeePresent,
  filterAttendance,
  totalNumberOfOvertimes,
  totalTimeThisMonth,
} from '../../../misc/helpers';
import { MONTHS, DAYS } from '../../../model/shared/months';
import { YEARS } from '../../../model/shared/years';
import FilteredAttendanceEmployeeTable from './FilteredAttendanceEmployeeTable';

const AttendanceEmployee = () => {
  const { user } = JSON.parse(localStorage.getItem('auth'));
  const { _id } = user;
  const [attendance, setAttendance] = useState([]);
  const [dailyLoginData, setDailyLoginData] = useState(null);
  const [filterQueries, setFilterQueries] = useState({
    month: {
      value: new Date().getMonth(),
      name: MONTHS[new Date().getMonth()].name,
    },
    year: {
      value: new Date().getFullYear(),
      name: new Date().getFullYear(),
    },
  });
  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  });

  useEffect(async () => {
    let month = filterQueries.month?.value + 1;
    let year = filterQueries.year?.value;
    let range = {
      from: new Date(`${year}-${month}-01`),
      to: new Date(`${year}-${month}-31`),
    };
    const res = await fetchAttendanceRange(_id, range);
    setAttendance(res);
    setDailyLoginData(checkIsEmployeePresent(_id, new Date(), res));
  }, []);
  const overtime =
    dailyLoginData &&
    DAILY_WORKING_HOURS - Number(dailyLoginData?.hours).toFixed(3) < 0
      ? Math.abs(
          DAILY_WORKING_HOURS - Number(dailyLoginData?.hours).toFixed(3)
        ).toFixed(3)
      : 0;

  const breakTime =
    dailyLoginData &&
    DAILY_WORKING_HOURS - Number(dailyLoginData?.hours).toFixed(3) > 0
      ? (
          DAILY_WORKING_HOURS - Number(dailyLoginData?.hours).toFixed(3)
        ).toFixed(3)
      : 0;

  const handleFilterClick = async () => {
    let month = filterQueries.month?.value + 1;
    let year = filterQueries.year?.value;
    let range = {
      from: new Date(`${year}-${month}-01`),
      to: new Date(`${year}-${month}-31`),
    };
    console.log('range =>', month, year);
    console.log('qre =>', filterQueries);
    const res = await fetchAttendanceRange(_id, range);
    setAttendance(res);
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Attendance </title>
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Attendance</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Attendance</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {dailyLoginData && (
          <div className="row">
            <div className="col-md-4">
              <div className="card punch-status">
                <div className="card-body">
                  <h5 className="card-title">
                    Timesheet{' '}
                    <small className="text-muted">
                      {dailyLoginData &&
                        new Date(dailyLoginData?.date).toLocaleDateString()}
                    </small>
                  </h5>
                  <div className="punch-det">
                    <h6>Punch In at</h6>
                    <p>
                      {dailyLoginData &&
                        new Date(
                          dailyLoginData?.sessions[0]?.from
                        ).toLocaleString()}
                    </p>
                  </div>
                  <div className="punch-info">
                    <div className="punch-hours">
                      <span>
                        {dailyLoginData &&
                          Number(dailyLoginData?.hours).toFixed(3)}{' '}
                        hrs
                      </span>
                    </div>
                  </div>
                  <div className="punch-btn-section">
                    <Link
                      // type="button"
                      className="btn btn-primary punch-btn"
                      onClick={handleLogout}
                      to="/login"
                    >
                      Punch Out
                    </Link>
                  </div>
                  <div className="statistics">
                    <div className="row">
                      <div className="col-md-6 col-6 text-center">
                        <div className="stats-box">
                          <p>Break</p>
                          <h6>{breakTime} hrs</h6>
                        </div>
                      </div>
                      <div className="col-md-6 col-6 text-center">
                        <div className="stats-box">
                          <p>Overtime</p>
                          <h6>{overtime} hrs</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card att-statistics">
                <div className="card-body">
                  <h5 className="card-title">Statistics</h5>
                  <div className="stats-list">
                    <div className="stats-info">
                      <p>
                        Today{' '}
                        <strong>
                          {Number(dailyLoginData?.hours).toFixed(2)}{' '}
                          <small>/ 8 hrs</small>
                        </strong>
                      </p>
                      <div className="progress">
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{
                            width: `${(dailyLoginData?.hours / 8) * 100}%`,
                          }}
                          aria-valuenow={(dailyLoginData?.hours / 8) * 100}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>

                    <div className="stats-info">
                      <p>
                        This Month{' '}
                        <strong>
                          {Number(
                            totalTimeThisMonth(
                              _id,
                              new Date().getMonth(),
                              attendance
                            )
                          ).toFixed(2)}{' '}
                          <small>/ 160 hrs</small>
                        </strong>
                      </p>
                      <div className="progress">
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{
                            width: `${
                              (totalTimeThisMonth(
                                _id,
                                new Date().getMonth(),
                                attendance
                              ) /
                                160) *
                              100
                            }%`,
                          }}
                          aria-valuenow={
                            (totalTimeThisMonth(
                              _id,
                              new Date().getMonth(),
                              attendance
                            ) /
                              160) *
                            100
                          }
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                    <div className="stats-info">
                      <p>
                        Remaining{' '}
                        <strong>
                          {Number(
                            160 -
                              totalTimeThisMonth(
                                _id,
                                new Date().getMonth(),
                                attendance
                              )
                          ).toFixed(2)}{' '}
                          <small>/ 160 hrs</small>
                        </strong>
                      </p>
                      <div className="progress">
                        <div
                          className="progress-bar bg-danger"
                          role="progressbar"
                          style={{
                            width: `${
                              ((160 -
                                totalTimeThisMonth(
                                  _id,
                                  new Date().getMonth(),
                                  attendance
                                )) /
                                160) *
                              100
                            }%`,
                          }}
                          aria-valuenow={
                            160 -
                            totalTimeThisMonth(
                              _id,
                              new Date().getMonth(),
                              attendance
                            )
                          }
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                    <div className="stats-info">
                      <p>
                        Overtime{' '}
                        <strong>
                          {totalNumberOfOvertimes(_id, attendance)}
                        </strong>
                      </p>
                      <div className="progress">
                        <div
                          className="progress-bar bg-info"
                          role="progressbar"
                          style={{
                            width: `${
                              (totalNumberOfOvertimes(_id, attendance) / 30) *
                              100
                            }%`,
                          }}
                          aria-valuenow={totalNumberOfOvertimes(
                            _id,
                            attendance
                          )}
                          aria-valuemin={0}
                          aria-valuemax={30}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card recent-activity">
                <div className="card-body">
                  <h5 className="card-title">Today Activity</h5>
                  <ul className="res-activity-list">
                    {dailyLoginData?.sessions?.map((session) => {
                      if (session.from && session.upto) {
                        return (
                          <>
                            <li>
                              <p className="mb-0">Punch In at</p>
                              <p className="res-activity-time">
                                <i className="fa fa-clock-o" />{' '}
                                {new Date(session?.from).toLocaleTimeString()}
                              </p>
                            </li>
                            <li>
                              <p className="mb-0">Punch Out at</p>
                              <p className="res-activity-time">
                                <i className="fa fa-clock-o" />{' '}
                                {new Date(session?.upto).toLocaleTimeString()}
                              </p>
                            </li>
                          </>
                        );
                      } else {
                        return (
                          <li>
                            <p className="mb-0">Punch In at</p>
                            <p className="res-activity-time">
                              <i className="fa fa-clock-o" />{' '}
                              {new Date(session?.from).toLocaleTimeString()}
                            </p>
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Search Filter */}

        <div className="row filter-row">
          {/* <div className="col-sm-1">
            <div className="form-group form-focus focused text-right">
              <a
                className="btn form-control btn-white dropdown-toggle"
                href="#"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                {filterQueries?.date || 'Date'}
              </a>
              <div className="dropdown-menu dropdown-menu-right">
                {DAYS?.map((val, index) => (
                  <span
                    key={index}
                    className="dropdown-item ml-2"
                    onClick={() =>
                      setFilterQueries({
                        ...filterQueries,
                        date: val.value,
                      })
                    }
                  >
                    <i className="fa text-right" /> {val?.name}
                  </span>
                ))}
              </div>
            </div>
          </div> */}
          <div className="col-sm-4">
            <div className="form-group form-focus focused text-left">
              <a
                className="btn form-control btn-white dropdown-toggle"
                href="#"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                {filterQueries?.month?.name || 'Month'}
              </a>
              <div className="dropdown-menu dropdown-menu-right">
                {MONTHS?.map((month, index) => (
                  <span
                    key={index}
                    className="dropdown-item"
                    onClick={() =>
                      setFilterQueries({
                        ...filterQueries,
                        month: month,
                      })
                    }
                  >
                    <i className="fa" /> {month?.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group form-focus select-focus">
              <a
                className="btn form-control btn-white dropdown-toggle"
                href="#"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                {filterQueries?.year?.name || 'Year'}
              </a>
              <div className="dropdown-menu dropdown-menu-right">
                {YEARS?.map((year, index) => (
                  <span
                    key={index}
                    className="dropdown-item"
                    onClick={() =>
                      setFilterQueries({
                        ...filterQueries,
                        year: year,
                      })
                    }
                  >
                    <i className="fa" /> {year?.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <button
              className="btn btn-success btn-block"
              onClick={handleFilterClick}
            >
              {' '}
              Search{' '}
            </button>
          </div>
        </div>

        {/* /Search Filter */}
        <div className="row">
          <div className="col-lg-12">
            <FilteredAttendanceEmployeeTable data={attendance} />
          </div>
        </div>
      </div>
      {/* /Page Content */}
    </div>
  );
};

export default AttendanceEmployee;
