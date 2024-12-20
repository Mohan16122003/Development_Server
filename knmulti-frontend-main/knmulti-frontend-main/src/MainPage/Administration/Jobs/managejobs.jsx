import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Badge, Table } from 'antd';
import 'antd/dist/antd.css';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import '../../antdstyle.css';
import {
  addJob,
  deleteJob,
  fetchdepartment,
  fetchJobs,
  fetchLocations,
  updateJob,
} from '../../../lib/api';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const ManageJobs = () => {
  const [job, setJob] = useState([]);
  const [department, setDepartment] = useState([]);
  const [location, setLocation] = useState([]);
  const [rerender, setRerender] = useState(false);
  const [currentJob, setCurrentJob] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [jobStatus, setJobStatus] = useState('');
  // console.log(currentJob,"currentJobcurrentJob");

  useEffect(() => {
    (async () => {
      const res_d = await fetchdepartment();
      setDepartment(res_d);

      const res_l = await fetchLocations();
      setLocation(res_l);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetchJobs();
      // console.log(res);
      setJob(
        res.map((v, i) => ({
          ...v,
          id: i + 1,
          startDate: v.startDate?.split('T')[0],
          endDate: v.endDate?.split('T')[0],
          jobLocation: v.location?.name,
        }))
      );
      setIsLoading(false);
    })();
  }, [rerender]);

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  }, []);

  const submitJob = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to add this job?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newJob = {};
        newJob.title = e.target.title.value;
        newJob.location = e.target.location.value;
        newJob.numberOfVacancies = Number(e.target.numberOfVacancies.value);
        newJob.experience = e.target.experience.value;
        newJob.salaryFrom = Number(e.target.salaryFrom.value);
        newJob.salaryTo = Number(e.target.salaryTo.value);
        newJob.jobType = e.target.jobType.value;
        newJob.status = Boolean(e.target.status.value);
        newJob.startDate = new Date(e.target.startDate.value);
        newJob.endDate = new Date(e.target.endDate.value);
        newJob.description = e.target.description.value;
        newJob.department = e.target.department.value;

        // console.log(newJob.department, "aaaaaaaa-");

        if (newJob.title == undefined || newJob.title == '') {
          toast.error('Please select a Job title');
          return;
        }
        if (newJob.location == undefined || newJob.location == '-') {
          toast.error('Please select a location');
          return;
        }

        if (newJob.department == undefined || newJob.department == '-') {
          toast.error('Please select a department');
          return;
        }

        if (newJob.salaryFrom == undefined || newJob.salaryFrom == '') {
          toast.error('Please select Salary From');
          return;
        }
        document.getElementById('submit-job-btn').innerText = 'Submitting...';
        const res = await addJob(newJob);
        document.getElementById('submit-job-btn').innerText = 'Submit';
        // console.log(res);
        setRerender(!rerender);
        $('#add_job').modal('hide');
      }
    });
  };

  const submitEditJob = (e, _id) => {
    e.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to save modified details of this job?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newJob = {};
        newJob.title = e.target.title.value;
        newJob.location = e.target.location.value;
        newJob.numberOfVacancies = Number(e.target.numberOfVacancies.value);
        newJob.experience = e.target.experience.value;
        newJob.salaryFrom = Number(e.target.salaryFrom.value);
        newJob.salaryTo = Number(e.target.salaryTo.value);
        newJob.jobType = e.target.jobType.value;
        newJob.status = Boolean(jobStatus);
        newJob.startDate = new Date(e.target.startDate.value);
        newJob.endDate = new Date(e.target.endDate.value);
        newJob.description = e.target.description.value;
        newJob.department = e.target.department.value;
        console.log(newJob);
        document.getElementById('edit-job-btn').innerText = 'Submitting...';
        const res = await updateJob(newJob, _id);
        document.getElementById('edit-job-btn').innerText = 'Submit';
        // console.log(res);
        setRerender(!rerender);
        $('#edit_job').modal('hide');
      }
    });
  };
  const {
    isAccountent,
    isAccountManager,
    isAdmin,
    isHR,
    isHRManager,
    isSalesEmployee,
    isSalesManager,
  } = useSelector((val) => val.authentication);
  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      sorter: (a, b) => a.id.length - b.id.length,
    },
    {
      title: 'Job Title *',
      dataIndex: 'title',
      render: (text, record) => (
        <Link to={`/app/administrator/job-details/${record._id}`}>{text}</Link>
      ),
      sorter: (a, b) => a.title?.length - b.title?.length,
    },

    {
      title: 'Job Location',
      dataIndex: 'jobLocation',
      sorter: (a, b) => a.department - b.department,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      sorter: (a, b) => a.startDate - b.startDate,
    },

    {
      title: 'Expiry Date',
      dataIndex: 'endDate',
      sorter: (a, b) => a.endDate - b.endDate,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text, record) => (
        <span
          className={
            text
              ? 'text-success font-weight-bold'
              : 'text-danger font-weight-bold'
          }
        >
          {text ? 'Open' : 'Closed'}
        </span>
      ),
      // sorter: (a, b) => a.endDate.length - b.endDate.length,
    },
    {
      title: 'Job Type',
      dataIndex: 'jobtype',
      render: (text, record) => (
        <Badge
          color={
            record.jobType === 'Full Time'
              ? 'blue'
              : record.jobType === 'Part Time'
              ? 'green'
              : record.jobType === 'Internship'
              ? 'yellow'
              : 'red'
          }
          text={record.jobType}
        />
      ),
      sorter: (a, b) => a.jobtype?.length - b.jobtype?.length,
    },
    {
      title: 'Vacancies',
      dataIndex: 'numberOfVacancies',
      align: 'center',
      sorter: (a, b) => a.numberOfVacancies - b.numberOfVacancies,
    },
    {
      title: isAdmin || isHRManager ? 'Action' : '',
      align: 'center',
      render: (text, record) =>
        (isAdmin || isHRManager) && (
          <button
            className={'ant-btn ant-btn-dangerous'}
            onClick={() => {
              Swal.fire({
                title: 'Are you sure?',
                text: 'You want to delete this job?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
              }).then(async (result) => {
                if (result.isConfirmed) {
                  await deleteJob(record._id);
                  await setRerender(!rerender);
                }
              });
            }}
          >
            <i className={'fa fa-trash'} />
            &nbsp;&nbsp;Delete
          </button>
        ),
    },
  ];
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Jobs</title>
        <meta name="description" content="Login page" />
      </Helmet>
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
                <h3 className="page-title">Jobs</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Jobs</li>
                </ul>
              </div>
              <div className="col-auto float-right ml-auto">
                <a
                  href="#"
                  className="btn add-btn"
                  data-toggle="modal"
                  data-target="#add_job"
                >
                  <i className="fa fa-plus" /> Add Job
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
                    total: job.length,
                    showTotal: (total, range) =>
                      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    itemRender: itemRender,
                  }}
                  style={{ overflowX: 'auto' }}
                  columns={columns}
                  // bordered
                  dataSource={job}
                  rowKey={(record) => record._id}
                  // onChange={this.handleTableChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* /Page Content */}

      {/* Add Job Modal */}
      <div id="add_job" className="modal custom-modal fade" role="dialog">
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Job</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  submitJob(e);
                }}
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Job Title <span style={{ color: 'red' }}> *</span>
                      </label>
                      <input
                        required
                        className="form-control"
                        type="text"
                        name="title"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Department <span style={{ color: 'red' }}> *</span>
                      </label>
                      <select className="select" name="department" required>
                        <option value={''}>-</option>
                        {department.map((dep) => {
                          return (
                            <option value={dep._id} key={dep._id}>
                              {dep.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Location <span style={{ color: 'red' }}> *</span>
                      </label>
                      <select required className="select" name="location">
                        <option value={''}>-</option>
                        {location.map((dep) => {
                          return (
                            <option value={dep._id} key={dep._id}>
                              {dep.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        No of Vacancies <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        required
                        onWheel={(e) => e.currentTarget.blur()}
                        maxLength={10}
                        type="number"
                        className={'form-control'}
                        name="numberOfVacancies"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Experience <span style={{ color: 'red' }}> *</span>
                      </label>
                      <input
                        required
                        className="form-control"
                        type="number"
                        name="experience"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Salary From <span style={{ color: 'red' }}> *</span>
                      </label>
                      <input
                        required
                        onWheel={(e) => e.currentTarget.blur()}
                        maxLength={10}
                        type="number"
                        className="form-control"
                        name="salaryFrom"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Salary To <span style={{ color: 'red' }}> *</span>
                      </label>
                      <input
                        required
                        onWheel={(e) => e.currentTarget.blur()}
                        maxLength={10}
                        type="number"
                        className="form-control"
                        name="salaryTo"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Job Type</label>
                      <select className="select" name="jobType">
                        <option>Full Time</option>
                        <option>Part Time</option>
                        <option>Internship</option>
                        <option>Temporary</option>
                        <option>Remote</option>
                        <option>Others</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Status</label>
                      <select className="select" name="status">
                        <option value={true}>Open</option>
                        <option value={false}>Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Start Date <span style={{ color: 'red' }}> *</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        placeholder="yyyy-dd-mm"
                        name="startDate"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Expired Date <span style={{ color: 'red' }}> *</span>
                      </label>
                      <input
                        required
                        type="date"
                        className="form-control"
                        name="endDate"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>
                        Description <span style={{ color: 'red' }}> *</span>
                      </label>
                      <textarea
                        required
                        className="form-control"
                        defaultValue=""
                        name="description"
                      />
                    </div>
                  </div>
                </div>
                <div className="submit-section">
                  <button
                    className="btn btn-primary submit-btn"
                    id="submit-job-btn"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Add Job Modal */}

      {/* Edit Job Modal */}
      <div id="edit_job" className="modal custom-modal fade" role="dialog">
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"> Job</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  submitEditJob(e, currentJob._id);
                }}
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Job Title</label>
                      <input
                        className="form-control"
                        defaultValue={currentJob.title}
                        type="text"
                        name="title"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Department</label>
                      <select
                        className="select"
                        name="department"
                        value={currentJob.department}
                      >
                        {department.map((dep) => {
                          return (
                            <option value={dep._id} key={dep._id}>
                              {dep.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Location</label>
                      <select
                        className="select"
                        name="location"
                        value={currentJob.location?._id}
                      >
                        {location.map((dep) => {
                          return (
                            <option value={dep._id} key={dep._id}>
                              {dep.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>No of Vacancies</label>
                      <input
                        className="form-control"
                        type="text"
                        name="numberOfVacancies"
                        defaultValue={currentJob.numberOfVacancies}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Experience</label>
                      <input
                        className="form-control"
                        name="experience"
                        type="text"
                        defaultValue={currentJob.experience}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Salary From</label>
                      <input
                        type="text"
                        className="form-control"
                        name="salaryFrom"
                        defaultValue={currentJob.salaryFrom}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Salary To</label>
                      <input
                        type="text"
                        className="form-control"
                        name="salaryTo"
                        defaultValue={currentJob.salaryTo}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Job Type</label>
                      <select
                        className="select"
                        name="jobType"
                        value={currentJob.jobType}
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Temporary">Temporary</option>
                        <option value="Remote">Remote</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        className="select"
                        name="status"
                        value={currentJob.status}
                        onChange={() => setJobStatus(e.target.value)}
                      >
                        <option value={true}>Open</option>
                        <option value={false}>Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="startDate"
                        defaultValue={currentJob.startDate}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Expired Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="endDate"
                        defaultValue={currentJob.endDate}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        className="form-control"
                        defaultValue={currentJob.description}
                        name="description"
                      />
                    </div>
                  </div>
                </div>
                <div className="submit-section">
                  <button
                    className="btn btn-primary submit-btn"
                    id="edit-job-btn"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Job Modal */}
      {/* Delete Job Modal */}
      <div className="modal custom-modal fade" id="delete_job" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Job</h3>
                <p>Are you sure want to delete?</p>
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
      {/* /Delete Job Modal */}
    </div>
  );
};

export default ManageJobs;
