/**
 * Signin Firebase
 */
import { CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import {
  fetchdepartment,
  fetchJob,
  fetchLocations,
  updateJob,
} from '../../../lib/api';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const JobDetails = () => {
  let { id } = useParams();
  const [job, setJob] = useState({});
  const [department, setDepartment] = useState([]);
  const [location, setLocation] = useState([]);
  const [rerender, setRerender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res_d = await fetchdepartment();
      setDepartment(res_d);

      const res_l = await fetchLocations();
      setLocation(res_l);
    })();
  }, []);
  // console.log(department, 'department');

  useEffect(() => {
    (async () => {
      const res = await fetchJob(id);
      setJob({
        ...res,
        startDate: res.startDate?.split('T')[0],
        endDate: res.endDate?.split('T')[0],
      });
      setIsLoading(false);
    })();
  }, [rerender]);

  const { isAdmin, isHRManager } = useSelector((val) => val.authentication);

  const editJob = async (e) => {
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
        newJob.status = e.target.status.value?.toLowerCase?.() === 'true';
        newJob.startDate = new Date(e.target.startDate.value);
        newJob.endDate = new Date(e.target.endDate.value);
        newJob.description = e.target.description.value;
        newJob.department = e.target.department.value;
        alert(JSON.stringify(newJob));
        document.getElementById('edit-job-btn').innerText = 'Submitting...';
        const res = await updateJob(newJob, id);
        document.getElementById('edit-job-btn').innerText = 'Submit';
        setRerender(!rerender);
        $('#edit_job').modal('hide');
      }
    });
  };

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  });

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
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Job Details</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Job Details</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            <div className="col-md-8">
              <div className="job-info job-widget">
                <h3 className="job-title">{job.title}</h3>
                <br />
                <ul className="job-post-det">
                  <li>
                    <i className="fa fa-calendar" /> Post Date:{'  '}
                    <span className="text-blue">{job.startDate}</span>
                  </li>
                  <li>
                    <i className="fa fa-calendar" /> Last Date:{'  '}
                    <span className="text-blue">{job.endDate}</span>
                  </li>
                  <li>
                    <i className="fa fa-user-o" /> Applications:{' '}
                    <span className="text-blue">{job?.candidates?.length}</span>
                  </li>
                </ul>
              </div>
              <div className="job-content job-widget">
                <div className="job-desc-title">
                  <h4>Description:</h4>
                </div>
                <div className="job-description">
                  <p>{job.description}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="job-det-info job-widget">
                {(isAdmin || isHRManager) && (
                  <a
                    className="btn job-btn"
                    href="#"
                    data-toggle="modal"
                    data-target="#edit_job"
                  >
                    Edit
                  </a>
                )}
                <div className="info-list">
                  <span>
                    <i className="fa fa-bar-chart" />
                  </span>
                  <h5>Job Type</h5>
                  <p> {job.jobType}</p>
                </div>
                <div className="info-list">
                  <span>
                    <i className="fa fa-money" />
                  </span>
                  <h5>Salary</h5>
                  <p>
                    ₹{job.salaryFrom} - ₹{job.salaryTo}
                  </p>
                </div>
                <div className="info-list">
                  <span>
                    <i className="fa fa-suitcase" />
                  </span>
                  <h5>Experience</h5>
                  <p>{job.experience}</p>
                </div>
                <div className="info-list">
                  <span>
                    <i className="fa fa-ticket" />
                  </span>
                  <h5>Vacancy</h5>
                  <p>{job.numberOfVacancies}</p>
                </div>
                <div className="info-list">
                  <span>
                    <i className="fa fa-map-signs" />
                  </span>
                  <h5>Location</h5>
                  <p> {job.location?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* /Page Content */}
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
                  editJob(e, id);
                }}
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Job Title</label>
                      <input
                        className="form-control"
                        defaultValue={job.title}
                        type="text"
                        name="title"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Department</label>
                      <select
                        required
                        className="select"
                        name="department"
                        value={job.department}
                      >
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
                      <label>Location</label>
                      <select
                        required
                        className="select"
                        name="location"
                        value={job.location?._id}
                      >
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
                      <label>No of Vacancies</label>
                      <input
                        required
                        className="form-control"
                        type="text"
                        name="numberOfVacancies"
                        defaultValue={job.numberOfVacancies}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Experience</label>
                      <input
                        onWheel={(e) => e.currentTarget.blur()}
                        type="number"
                        className="form-control"
                        name="experience"
                        defaultValue={job.experience}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Salary From</label>
                      <input
                        onWheel={(e) => e.currentTarget.blur()}
                        type="number"
                        className="form-control"
                        name="salaryFrom"
                        defaultValue={job.salaryFrom}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Salary To</label>
                      <input
                        onWheel={(e) => e.currentTarget.blur()}
                        type="number"
                        className="form-control"
                        name="salaryTo"
                        defaultValue={job.salaryTo}
                        required
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
                        value={job.jobType}
                        required
                      >
                        <option value={''}>-</option>
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
                        value={job.status}
                        required
                      >
                        <option value={''}>-</option>
                        <option value="true">Open</option>
                        <option value="false">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        required
                        type="date"
                        className="form-control"
                        name="startDate"
                        defaultValue={job.startDate}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Expired Date</label>
                      <input
                        required
                        type="date"
                        className="form-control"
                        name="endDate"
                        defaultValue={job.endDate}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        required
                        className="form-control"
                        defaultValue={job.description}
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
    </div>
  );
};

export default JobDetails;
