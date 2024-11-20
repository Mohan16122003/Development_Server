import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { Badge, Table } from 'antd';
import 'antd/dist/antd.css';
import { itemRender, onShowSizeChange } from '../paginationfunction';
import '../antdstyle.css';
import { editLeave, fetchLeaves, fetchLeaveTypes } from '../../lib/api';
import { dateDiff, localeDateStringToDateObj } from '../../misc/helpers';
import { LEAVE_STATES } from '../../model/shared/leaveStates';
import { useDispatch, useSelector } from 'react-redux';
import AddLeave from './Employees/popups/AddLeave';
import httpService from '../../lib/httpService';
import moment from 'moment';

const findOIDForLeaveTypeName = (name) => {
};

const LeaveRequest = () => {
  const { user } = JSON.parse(localStorage.getItem('auth'));

  const dispatch = useDispatch();

  const empData = useSelector((state) => state?.authentication?.value?.user);

  const [unFormattedLeavesData, setUnFormattedLeavesData] = useState([]);
  const [leavesData, setLeavesData] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [editLeaveData, setEditLeaveData] = useState(null);
  const [empLeavesCount, setEmpLeavesCount] = useState(0);

  useEffect(async () => {
    const employeeType = (await httpService.get(`/employee-type/${user?.employeeType}`)).data;
    setEmpLeavesCount(employeeType?.noOfLeaves);
    const res = await fetchLeaveTypes();
    setLeaveTypes(res);
    const res2 = await fetchLeaves(user?._id);
    // console.log(res2);
    setUnFormattedLeavesData(res2);
    setLeavesData(
      res2?.map((leave, index) => {
        return {
          ...leave,
          id: index + 1,
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
    );
  }, []);
  const [totalTakenLeaves, setTotalTakenLeaves] = useState();
  const totalLeave = async () => {
    const res2 = await fetchLeaves(user?._id);
    const startDateOfYear =
      moment().startOf('year').toDate();
    const endDateOfYear =
      moment().endOf('year').toDate();
    // console.log()
    const leavesOfThisYear = res2.filter((leave) => {
      return new Date(leave?.fromDate) >= startDateOfYear;
    });
    var count = 0;
    for (let i = 0; i < leavesOfThisYear.length; i++) {
      const leave = leavesOfThisYear[i];
      if (leave.approved === true && new Date(leave.toDate) <= endDateOfYear) {
        count =
          count +
          dateDiff(new Date(res2[i]?.fromDate), new Date(res2[i]?.toDate));
        // console.log(dateDiff(new Date(res2[i]?.fromDate), new Date(res2[i]?.toDate)), "setTotalLeavessetTotalLeaves");
      } else if (leave.approved === true) {
        count =
          count +
          dateDiff(new Date(res2[i]?.fromDate), endDateOfYear);
      }
      // console.log(count, "setTotalLeaves");
    }
    // alert('Total Leaves taken at this year are '+ count)
    setTotalTakenLeaves(count);
  };
  useEffect(() => {
    totalLeave();
  }, []);

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  });

  const handleEdit = async (e) => {
    // e.preventDefault();
    let { createdAt, updatedAt, id, noofdays, ...rest } = editLeaveData;
    let putObject = {
      ...rest,
      leaveType: (() => {
        let ogLeaveData = leavesData.filter(
          (leave) => leave?._id === rest._id
        )[0];
        if (editLeaveData?.leaveType === ogLeaveData?.leaveType) {
          return unFormattedLeavesData.filter(
            (leave) => leave?._id === rest._id
          )[0].leaveType;
        }
        return editLeaveData?.leaveType;
      })(),
      fromDate:
        typeof editLeaveData?.fromDate === 'object'
          ? editLeaveData?.fromDate
          : localeDateStringToDateObj(editLeaveData?.fromDate),
      toDate:
        typeof editLeaveData?.toDate === 'object'
          ? editLeaveData?.toDate
          : localeDateStringToDateObj(editLeaveData?.toDate),
      reason: editLeaveData?.reason,
      employee: user?._id,
      approved: false,
      approvedBy: null,
      approvedDate: null,
      status: LEAVE_STATES.pending,
    };
    // console.log(putObject);

    const res = await editLeave(putObject?._id, putObject);
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      sorter: (a, b) => a.leavetype.length - b.leavetype.length,
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      sorter: (a, b) => a.leavetype.length - b.leavetype.length,
    },

    {
      title: 'From',
      dataIndex: 'fromDate',
      sorter: (a, b) => a.fromDate.length - b.fromDate.length,
    },
    {
      title: 'To',
      dataIndex: 'toDate',
      sorter: (a, b) => a.toDate.length - b.toDate.length,
    },

    {
      title: 'No Of Days',
      dataIndex: 'noofdays',
      sorter: (a, b) => a.noofdays.length - b.noofdays.length,
    },

    {
      title: 'Reason',
      dataIndex: 'reason',
      render: (text) => (
        <span>
          {String(text).length > 20
            ? String(text).substring(0, 20) + '...'
            : text}
        </span>
      ),
      sorter: (a, b) => a.reason.length - b.reason.length,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text, record) => (
        <Badge
          color={
            text === 'NEW'
              ? 'purple'
              : text === 'PENDING'
                ? 'blue'
                : text === 'APPROVED'
                  ? 'green'
                  : 'red'
          }
          text={text?.slice(0, 1) + text?.slice(1)?.toLowerCase()}
        />
      ),
      sorter: (a, b) => a.status.length - b.status.length,
    },
    // {
    //   title: 'Action',
    //   render: (text, record) => (
    //     <div className="dropdown dropdown-action text-right">
    //       <a
    //         href="#"
    //         className="action-icon dropdown-toggle"
    //         data-toggle="dropdown"
    //         aria-expanded="false"
    //       >
    //         <i className="material-icons">more_vert</i>
    //       </a>
    //       <div className="dropdown-menu dropdown-menu-right">
    //         <a
    //           className="dropdown-item"
    //           href="#"
    //           data-toggle="modal"
    //           data-target="#edit_leave"
    //           onClick={() => setEditLeaveData(record)}
    //         >
    //           <i className="fa fa-pencil m-r-5" /> Edit
    //         </a>
    //         <a
    //           className="dropdown-item"
    //           href="#"
    //           data-toggle="modal"
    //           data-target="#delete_approve"
    //         >
    //           <i className="fa fa-trash-o m-r-5" /> Delete
    //         </a>
    //       </div>
    //     </div>
    //   ),
    // },
  ];

  // const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Leaves </title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Leaves</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Leaves</li>
              </ul>
            </div>
            <div className="col-auto float-right ml-auto">
              <a
                href="#"
                className="btn add-btn"
                data-toggle="modal"
                data-target="#add_leave"
              >
                <i className="fa fa-plus" /> Add Leave
              </a>
            </div>
          </div>
        </div>
        {/* /Page Header */}

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                className="table-striped"
                pagination={{
                  total: leavesData.length,
                  showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  showSizeChanger: true,
                  onShowSizeChange: onShowSizeChange,
                  itemRender: itemRender,
                }}
                style={{ overflowX: 'auto' }}
                columns={columns}
                // bordered
                dataSource={leavesData}
                rowKey={(record) => record?.id}
                // onChange={console.log('change')}
              />
            </div>
          </div>
        </div>
      </div>
      {/* /Page Content */}
      {/* Add Leave Modal */}
      <AddLeave
        user={user}
        leaveTypes={leaveTypes}
        leavesData={leavesData}
        setLeavesData={setLeavesData}
        totalTakenLeaves={totalTakenLeaves}
        empLeavesCount={empLeavesCount}
      />
      {/* /Add Leave Modal */}
      {/* Edit Leave Modal */}
      <div id='edit_leave' className='modal custom-modal fade' role='dialog'>
        <div className='modal-dialog modal-dialog-centered' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'> Leave</h5>
              <button
                type='button'
                className='close'
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <a
                    className="btn form-control btn-white dropdown-toggle"
                    href="#"
                    data-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {leaveTypes?.filter(
                      (lt) => lt?._id === editLeaveData?.leaveType
                    )[0]?.leaveTypeName || editLeaveData?.leaveType}
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                    {leaveTypes?.map((lType, index) => (
                      <span
                        key={index}
                        className="dropdown-item"
                        onClick={() =>
                          setEditLeaveData({
                            ...editLeaveData,
                            leaveType: lType?._id,
                            reason: lType?.leaveTypeDescription,
                          })
                        }
                      >
                        <i className="fa" /> {lType?.leaveTypeName}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    From <span className="text-danger">*</span>
                  </label>
                  <div>
                    <input
                      className="form-control"
                      defaultValue={
                        new Date(editLeaveData?.fromDate) || '01-01-2021'
                      }
                      type="date"
                      onChange={(e) =>
                        setEditLeaveData({
                          ...editLeaveData,
                          fromDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    To <span className="text-danger">*</span>
                  </label>
                  <div>
                    <input
                      className="form-control"
                      defaultValue={
                        new Date(editLeaveData?.toDate) || '01-01-2021'
                      }
                      type="date"
                      onChange={(e) =>
                        setEditLeaveData({
                          ...editLeaveData,
                          toDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                {/* <div className="form-group">
                  <label>
                    Number of days <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    defaultValue={2}
                  />
                </div> */}
                {/* <div className="form-group">
                  <label>
                    Remaining Leaves <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    readOnly
                    defaultValue={12}
                    type="text"
                  />
                </div> */}
                <div className="form-group">
                  <label>
                    Leave Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="form-control"
                    defaultValue={editLeaveData?.reason}
                    onChange={(e) =>
                      setEditLeaveData({
                        ...editLeaveData,
                        reason: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="submit-section">
                  <button
                    className="btn btn-primary submit-btn"
                    onClick={handleEdit}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Leave Modal */}
      {/* Approve Leave Modal */}
      <div className="modal custom-modal fade" id="approve_leave" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Leave Approve</h3>
                <p>Are you sure want to approve for this leave?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a href="" className="btn btn-primary continue-btn">
                      Approve
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href=""
                      data-dismiss="modal"
                      className="btn btn-primary cancel-btn"
                    >
                      Decline
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Approve Leave Modal */}
      {/* Delete Leave Modal */}
      <div
        className="modal custom-modal fade"
        id="delete_approve"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Leave</h3>
                <p>Are you sure want to delete this leave?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a href="" className="btn btn-primary continue-btn">
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href=""
                      data-dismiss="modal"
                      className="btn btn-primary cancel-btn"
                    >
                      Cancel
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Leave Modal */}
    </div>
  );
};

export default LeaveRequest;
