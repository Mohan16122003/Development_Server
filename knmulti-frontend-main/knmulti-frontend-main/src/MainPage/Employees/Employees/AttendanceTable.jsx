import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAttendanceRange, fetchLeaves } from '../../../lib/api';
import {
  DAILY_WORKING_HOURS,
  MIN_WORKING_HOURS,
} from '../../../misc/constants';
import { daysInMonth } from '../../../misc/helpers';
import AttendanceModal from './AttendanceModal';
import { AttendanceTableContext } from './index';
import moment from 'moment';
import Title from 'antd/lib/typography/Title';
import BlockIcon from '@mui/icons-material/Block';
import useFetchAndMemoize from '../../../hooks/useFetchAndMemoize';
const attendanceFormatter = (
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
  attendanceList
) => {
  if (year) {
    let resArr = [];
    let newList = attendanceList?.filter((a, index) => {
      const date = new Date(a?.date);
      if (date?.getMonth() === month && date?.getFullYear() === year) {
        // return date.getDate();
        return a;
      }
    });
    // newList = newList.map((element) => new Date(element?.date).getDate());
    let dateList = newList?.map((element) => new Date(element?.date).getDate());
    for (let index = 1; index <= daysInMonth(month, year); index++) {
      if (dateList?.includes(index)) {
        let timeSheet = newList.filter(
          (element) => new Date(element?.date).getDate() === index
        )[0];
        resArr.push({
          date: new Date(year, month, index),
          timesheet: timeSheet,
          isPresent:
            Math.floor(timeSheet.productionTime / (1000 * 60 * 60)) >
            DAILY_WORKING_HOURS / 2,
        });
      } else {
        resArr.push({
          date: new Date(year, month, index),
          timesheet: null,
          isPresent: false,
        });
      }
    }
    return resArr;
  }
  return new Array(daysInMonth(month, year)).fill(0);
};

const AttendanceTable = ({ employee, filterQueries, dateRange }) => {
  const [leavesData, setLeavesData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const {
    setFilteredAttendanceState,
    filteredAttendanceState,
  } = useContext(AttendanceTableContext);

  const [attendance, setAttendance] = useState([]);
  const [data, setData] = useState({
    date: null,
    timesheet: null,
    isPresent: null,
    isLeaveReq: false,
  });
  const isLeave = (date) => {
    const approvedLeaves = leavesData?.filter((leave) => {
      return (
        leave?.status === 'APPROVED' &&
        new Date(date) >= new Date(leave.fromDate) &&
        new Date(date) <= new Date(leave.toDate)
      );
    });
    return approvedLeaves?.length > 0;
  };
  const getTimeSheetOfEmployeeWithRange = (id, date) => {
    let month = date.month.value + 1;
    let year = date.year.value;
    let range = {
      from: new Date(`${year}-${month}-01`),
      to: new Date(`${year}-${month}-31`),
    };
    if (!dataFetched) {
      return new Promise((resolve, reject)=>{
        setTimeout(() => {
        fetchAttendanceRange(id,range).then(res=>{
          setDataFetched(true);
          resolve(res)
        }).catch(err=>{
          reject(err);
        })
        }, 500);
      })
    }
  };
  const attendanceData = useFetchAndMemoize(
    getTimeSheetOfEmployeeWithRange,
    employee._id,
    dateRange
  );
  useEffect(() => {
    if(attendanceData?.length){
      setAttendance(attendanceData)
    }
    fetchLeaves(employee?._id).then((res2) => {
      setLeavesData(res2);
    });
  }, [attendanceData]);
useEffect(()=>{
  setDataFetched(false);
},[dateRange])
  const formattedDates = leavesData?.map((dateString) => {
    const momentDate = moment(
      dateString,
      'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)'
    );
    return momentDate?.format('DD-MM-YYYY');
  });

  return (
    <>
      <tr style={{ position: 'relative' }} id={`row-${employee._id}`}>
        <td style={{ background: 'white', position: 'sticky', left: '0px' }}>
          <h2 className="table-avatar">
            <Link
              className="avatar avatar-xs"
              to={`/app/profile/employee-profile/${employee?._id}`}
            >
              <img
                src={employee?.fileInfoPic[0]?.filePath}
                alt=""
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                }}
              />
            </Link>
            <a
              onClick={() =>
                setFilteredAttendanceState({
                  ...filteredAttendanceState,
                  state: true,
                  fId: employee?.firstName,
                  emp_id: employee?._id,
                  emp:employee,
                  data:attendance,
                })
              }
            >
              {employee?.firstName} {employee?.lastName} [{employee?._id}]
            </a>
          </h2>
        </td>

        {attendanceFormatter(
          filterQueries?.month?.value,
          filterQueries?.year?.value,
          attendance
        ).map((a) => {
          return (
            <td key={a?.date} style={{ border: '2px solid #F6F6F6' }}>
              {formattedDates?.map((dateString) => {
                const parts = dateString?.split('-');
                const formattedDate = new Date(
                  parts[2],
                  parts[1] - 1,
                  parts[0]
                );
                if (
                  formattedDate.getTime() === a?.date?.getTime() &&
                  a?.isPresent
                ) {
                  return (
                    <>
                      <a
                        href="#attendance_info"
                        data-toggle={a ? 'modal' : 'modal'}
                        data-target={
                          a ? '#attendance_info' : '#attendance_info'
                        }
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-around',
                        }}
                        attendanceFormatter
                      >
                        <i
                          className="fa fa-dot-circle-o text-success"
                          onClick={() => {
                            if (!a)
                              setData({
                                date: null,
                                timesheet: null,
                                isPresent: null,
                              });
                            setData(a);
                          }}
                        />
                      </a>
                    </>
                  );
                }
              })}

              {/* {a} */}
              {a.isPresent && (
                <a
                  href=""
                  data-toggle={a ? 'modal' : 'modal'}
                  data-target={a ? '#attendance_info' : '#attendance_info'}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <i
                    className="fa fa-check text-success"
                    onClick={() => {
                      if (!a)
                        setData({
                          date: null,
                          timesheet: null,
                          isPresent: null,
                        });
                      setData(a);
                    }}
                  />
                  {Math.floor(
                    a?.timesheet?.productionTime / (1000 * 60 * 60)
                  ) <= MIN_WORKING_HOURS && (
                    <i
                      className="fa fa-close text-danger"
                      onClick={() => {
                        if (!a) {
                          setData({
                            date: null,
                            timesheet: null,
                            isPresent: null,
                          });
                          setData(a);
                        }
                      }}
                    />
                  )}
                </a>
              )}

              {!a.isPresent && new Date(a.date) <= new Date() && (
                <a
                  href="#attendance_info"
                  data-toggle={a ? 'modal' : 'modal'}
                  data-target={a ? '#attendance_info' : '#attendance_info'}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  {!isLeave(a.date) &&
                  new Date(employee?.joinDate).getTime() >
                    new Date(a.date).getTime() ? (
                    <BlockIcon
                      className="text-secondary no_cursor"
                      fontSize="16px"
                    />
                  ) : (
                    <i
                      className={`fa fa-close text-danger `}
                      onClick={() => {
                        if (!a)
                          setData({
                            date: null,
                            timesheet: null,
                            isPresent: null,
                          });
                        setData(a);
                      }}
                      // style={{ cursor: 'no-drop' }}
                    />
                  )}
                </a>
              )}
              {!a.isPresent &&
                new Date(a.date).getDay() !== 0 &&
                isLeave(a.date) && (
                  <Title type={'danger'} level={4}>
                    L
                  </Title>
                )}
            </td>
          );
        })}
      </tr>
      {data?.date && (
        <AttendanceModal
          data={data}
          timesheet={data?.timesheet}
          setData={setData}
          employeeId={employee?._id}
        />
      )}
    </>
  );
};

export default AttendanceTable;
