import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TimeField from 'react-simple-timefield';
import {
  addAttendance,
  editAttendance,
  fetchAttendanceRange,
} from '../../../lib/api';
import {
  checkIsEmployeePresent,
  dateTimeSplitterWrapper,
} from '../../../misc/helpers';
import Convert12To24 from './Convert12To24';
import { AttendanceTableContext } from './index';
import { toast } from 'react-toastify';

const EditAttendanceModal = ({ date, timesheet, employeeId, setData }) => {
  const user = useSelector((state) => state.authentication.value.user);

  var { attendanceState, setAttendanceState } = useContext(
    AttendanceTableContext
  );
  // const [currentTimeSheetData, setCurrentTimeSheetData] = useState(false);
  const [desData, setDesData] = useState('');
  const [newData, setNewData] = useState({
    employee: employeeId,
    date: new Date(date).toISOString(),
    description:[{ loggedUser: user?.name, description: '' }],
    sessions: [
      {
        sessionId: 1,
        from: null,
        upto: null,
      },
    ],
  });

  let sessionsEx;
  if (!timesheet) {
    sessionsEx = [];
  } else {
    sessionsEx = timesheet.sessions;
  }
  let punchOutTime = Convert12To24(
    moment(sessionsEx[0]?.upto).format('hh:mm:ss A')
  );
  let punchInTime = Convert12To24(
    moment(sessionsEx[0]?.from).format('hh:mm:ss A')
  );
  const [attendanceForEmployee, setAttendanceForEmployee] = useState([]);

  useEffect(async () => {
    let month = new Date(date).getMonth() + 1;
    let year = new Date(date).getFullYear();
    let range = {
      from: new Date(`${year}-${month}-01`),
      to: new Date(`${year}-${month}-31`),
    };
    const res = await fetchAttendanceRange(employeeId,range);
    console.log("response for single one",res)
    setAttendanceForEmployee(res);
  }, [employeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedData = {
      ...newData,
      sessions: [
        {
          ...newData.sessions[0],
          from: new Date(dateTimeSplitterWrapper(newData.sessions[0].from)).toISOString(),
          upto: new Date(dateTimeSplitterWrapper(newData.sessions[0].upto)).toISOString(),
        },
      ],
      description: [{ loggedUser: user?.name, description: desData }],
    };
    if (
      !checkIsEmployeePresent(employeeId, new Date(date), attendanceForEmployee)
      ) {
        // THIS GOES IN A POST METHOD
        try{
          await addAttendance(updatedData); //posting updated data.
          setAttendanceState(true);
          toast.success("Attendance Marked Successfully .")
        }catch(err){
          toast.error(err.data?.message);
        }
    } else {
      const { _id } = checkIsEmployeePresent(
        employeeId,
        new Date(date),
        attendanceForEmployee
      );
      // THIS GOES IN A PUT METHOD
      try{
        await editAttendance(_id, updatedData);
      }catch(err){
        console.log("error :",err.response)
      }
    }
    setData(null);

    setAttendanceState(!attendanceState);
  };

  return (
    <>
      <div
        id="edit-attendance"
        className="modal custom-modal fade"
        role="dialog"
        data-backdrop="static"
        data-keyboard={false}
        tabIndex="-1"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          {/* <div className="modal-dialog"> */}
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"> Attendance</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => setData(null)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Punch In Time <span className="text-danger">*</span>
                      </label>
                      <TimeField
                        value={punchInTime || '00:00:00'} // {String}   required, format '00:00' or '00:00:00'
                        onChange={(event) =>
                          setNewData({
                            ...newData,
                            sessions: [
                              {
                                ...newData.sessions[0],
                                from: event.target.value,
                              },
                            ],
                          })
                        } // {Function} required
                        input={
                          <input
                            className="form-control"
                            type="text"
                            name="from"
                          />
                        }
                        colon=":"
                        showSeconds
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Punch Out Time <span className="text-danger">*</span>
                      </label>
                      <TimeField
                        value={punchOutTime || '23:59:59'} // {String}   required, format '00:00' or '00:00:00'
                        onChange={(event) =>
                          setNewData({
                            ...newData,
                            sessions: [
                              {
                                ...newData.sessions[0],
                                upto: event.target.value,
                              },
                            ],
                          })
                        } // {Function} required
                        input={
                          <input
                            className="form-control"
                            type="text"
                            name="upto"
                          />
                        }
                        colon=":"
                        showSeconds
                      />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    {' '}
                    {/*col-sm-6*/}
                    <div className="form-group">
                      <label className="col-form-label">
                        Reason For Manual Input{' '}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows="3"
                        value={desData}
                        onChange={(e) => {
                          // setNewData({
                          //   ...newData,
                          //   description: e.target.value,
                          // });
                          setDesData(e.target.value);
                        }}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
              </form>
              {desData === '' && (
                <span className="text-danger">Reason is required</span>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={() => setData(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={desData === '' ? true : false}
                data-dismiss="modal"
                onClick={handleSubmit}
              >
                Save changes
              </button>
            </div>
          </div>
          {/* </div> */}
        </div>
      </div>
    </>
  );
};

export default EditAttendanceModal;
