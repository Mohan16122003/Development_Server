import React, { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import moment from 'moment/moment';
import { dateDiff } from '../../../../misc/helpers';
import { LEAVE_STATES } from '../../../../model/shared/leaveStates';
import { toast } from 'react-toastify';
import { addLeave } from '../../../../lib/api';
import httpService from '../../../../lib/httpService';

function AddLeave(props) {
  const {
    leaveTypes,
    leavesData,
    setLeavesData,
    totalTakenLeaves,
    empLeavesCount,
    user,
    isAdmin,
    employees,
    selectEmployee,
    totalLeave
  } = props;

  const [newLeave, setNewLeave] = useState({
    employee: user?._id,
    approved: false,
    approvedBy: null,
    approvedDate: null,
    status: LEAVE_STATES.pending
  });

  useEffect(() => {
    if (user)
      setNewLeave({
        ...newLeave,
        employee: user?._id
      });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const remainingLeaves = empLeavesCount -
      totalTakenLeaves -
      dateDiff(newLeave?.fromDate, newLeave?.toDate);

    if (remainingLeaves < 0) {
      return toast.error('All leaves are taken already.');
    }

    // console.log("emp leave", newLeave);
    if (!newLeave.leaveType) {
      toast.error('Select to Leave Type');
      return;
    }
    if (!newLeave.reason) {
      toast.error('Select Reason: ');
      return;
    }
    if (!newLeave.fromDate) {
      toast.error('Select From Date');
      return;
    }
    if (!newLeave.toDate) {
      toast.error('Select To Date');
      return;
    }

    const res = await addLeave(newLeave);
    const response = await httpService.post('/notify/', {
      notifyHead: `Leave Request Applied`,
      notifyBody: `Applied for Leave Request of ${dateDiff(
        new Date(res?.fromDate),
        new Date(res?.toDate)
      )} days by ${user?.userName}`,
      createdBy: user?._id
    });
    document.getElementById('add-leave-close-btn').click();
    /*dispatch(
      createNotify({
        notifyHead: `${
          leaveTypes.filter((lt) => lt._id === res.leaveType)[0].leaveTypeName
        } Request Applied`,
        notifyBody: `Applied for Leave Request of ${dateDiff(
          new Date(res?.fromDate),
          new Date(res?.toDate)
        )} days by ${empData?.userName}`,
        createdBy: empData?._id,
      })
    );*/
    // dispatch(createNotify({
    //   notifyHead: `Leave Request ${res2?.status}`,
    //   notifyBody: `Leave Request changed to ${res2?.status} regarding ${res2?.reason}`,
    //   createdBy: res2?.employee
    // }));

    // useEffect(() => {
    //   const leaveNotify = async () => {
    //     const res = await addLeave(newLeave);
    //     const ress = allemployee();
    //     // console.log(res, 'ALL EMPLoYEE');
    //     const admin = ress.filter((item) => item?.jobRole?.name === 'Admin');
    //     console.log(admin, 'ADMIN');
    //     console.log(admin, 'ADMIN');
    //     admin.forEach((item) => {
    //       dispatch(
    //         createNotify({
    //           notifyHead: `Leave Request Applied`,
    //           notifyBody: `Applied for Leave Request of ${dateDiff(
    //             new Date(res?.fromDate),
    //             new Date(res?.toDate)
    //           )} days by ${empData?.userName}`,
    //           createdBy: item?._id,
    //         })
    //       );
    //     });
    //   };
    //   leaveNotify();
    // }, [newLeave, addLeave]);

    // console.log('Leave ', res, ' added!');
    setLeavesData([
      ...leavesData,
      {
        id: leavesData.length + 1,
        leaveType: leaveTypes.filter((lt) => lt._id === res.leaveType)[0]
          .leaveTypeName,
        fromDate: new Date(res?.fromDate).toLocaleDateString(),
        toDate: new Date(res?.toDate).toLocaleDateString(),
        noofdays: dateDiff(new Date(res?.fromDate), new Date(res?.toDate)),
        reason: res?.reason,
        status: res?.status
      }
    ]);
  };

  return (
    <div id='add_leave' className='modal custom-modal fade' role='dialog'>
      <div className='modal-dialog modal-dialog-centered' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Add Leave</h5>
            <button
              id={'add-leave-close-btn'}
              type='button'
              className='close'
              data-dismiss='modal'
              aria-label='Close'
            >
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='modal-body'>
            <form
              onSubmit={handleSubmit}
            >
              {
                isAdmin &&
                <div className='form-group'>
                  <label>
                    Employee Name <span className='text-danger'>*</span>
                  </label>
                  <select
                    className='custom-select'
                    // value={employee}
                    // onChange={(e) => {
                    //   setEmployee(e.target.value);
                    // }}
                    onChange={selectEmployee}
                    required
                  >
                    <option value={''} selected>
                      Please Select
                    </option>
                    {employees?.map((emp) => (
                      <option key={emp?._id} value={emp?._id}>
                        {emp?.name}
                      </option>
                    ))}
                  </select>
                </div>
              }
              <div className='form-group'>
                <label>Leave Type</label> <span className='text-danger'>*</span>
                <select
                  required
                  className={'custom-select'}
                  id=''
                  onChange={(e) =>
                    setNewLeave({
                      ...newLeave,
                      leaveType: e.target.value
                    })
                  }
                >
                  <option
                    value={''}
                  >
                    None
                  </option>
                  {leaveTypes?.map((lType, index) => (
                    <option
                      key={index}
                      className=''
                      value={lType?._id}
                    >
                      {lType?.leaveTypeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className='form-group'>
                <label>
                  From <span className='text-danger'>*</span>
                </label>
                <div>
                  <DatePicker
                    required
                    className='form-control'
                    value={newLeave?.fromDate}
                    format={'dd/MM/yyyy'}
                    minDate={
                      !isAdmin &&
                      moment().add(1, 'days').toDate()
                    }
                    onChange={(e) => {
                      setNewLeave({
                        ...newLeave,
                        fromDate: e
                      });
                    }}
                  />
                </div>
              </div>
              <div className='form-group'>
                <label>
                  To <span className='text-danger'>*</span>
                </label>
                <div>
                  <DatePicker
                    required
                    disabled={!newLeave.fromDate}
                    className='form-control'
                    format={'dd/MM/yyyy'}
                    value={newLeave?.toDate}
                    minDate={
                      newLeave.fromDate ?
                        moment(newLeave.fromDate).add(1, 'days').toDate()
                        :
                        moment().add(2).toDate()
                    }
                    maxDate={
                      newLeave.fromDate &&
                      moment(newLeave.fromDate).endOf('year').toDate()
                    }
                    onChange={(e) => {
                      setNewLeave({
                        ...newLeave,
                        toDate: e
                      });
                      if (isAdmin) {
                        totalLeave(user, e);
                      }
                    }}
                  />
                </div>
              </div>
              <div className='form-group'>
                <label>Number of days</label>
                <input
                  className='form-control'
                  readOnly
                  type='text'
                  value={
                    newLeave?.fromDate && newLeave?.toDate
                      ? dateDiff(newLeave?.fromDate, newLeave?.toDate)
                      : '-'
                  }
                />
              </div>
              <div className='form-group'>
                <label>
                  Remaining Leaves <span className='text-danger'>*</span>
                </label>
                <input
                  className='form-control'
                  readOnly
                  value={
                    newLeave.fromDate && newLeave.toDate
                      ? empLeavesCount -
                      totalTakenLeaves -
                      dateDiff(newLeave?.fromDate, newLeave?.toDate)
                      : '-'
                  }
                  type='text'
                />
              </div>
              <div className='form-group'>
                <label>
                  Leave Reason <span className='text-danger'>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className='form-control'
                  defaultValue={newLeave?.reason}
                  onChange={(e) =>
                    setNewLeave({ ...newLeave, reason: e.target.value })
                  }
                />
              </div>
              <div className='submit-section'>
                <button className='btn btn-primary submit-btn'>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLeave;