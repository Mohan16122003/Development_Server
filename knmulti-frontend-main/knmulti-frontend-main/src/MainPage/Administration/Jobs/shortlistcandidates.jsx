/**
 * Signin Firebase
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { Select, Space, Table } from 'antd';
import 'antd/dist/antd.css';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import '../../antdstyle.css';
import {
  deleteCandidate,
  fetchCandidate,
  fetchdepartment,
  fetchJobs,
  updateCandidate,
} from '../../../lib/api';
import { APPLICANT_STATE } from '../../../model/shared/applicantStates';
import { ONBOARDING_STATES } from '../../../model/shared/onboardingStates';
import AddEmpAuth from '../../Employees/Employees/AddEmpAuth';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { createNotify } from '../../../features/notify/notifySlice';

const ShortlistCandidate = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [rerender, setRerender] = useState(false);
  const [filterQueries, setFilterQueries] = useState({
    name: '',
    jobType: '',
    status: '',
    from: null,
    to: null,
  });

  const [currCand, setCurrCand] = useState('');

  const findShortListedCandidates = async () => {
    const res = await fetchCandidate();
    const shortListedCandidates = res.filter(
      (candidate) => candidate?.onBoarding === true
    );
    // let jobs = shortListedCandidates.map(async (candidate) => {
    //   const res2 = await fetchJob(candidate?.job);
    //   return res2;
    // });
    const res3 = await fetchdepartment();
    setDepartmentData(res3);
    // console.log(jobs);
    // jobs = await Promise.all(jobs);
    const res2 = await fetchJobs();
    setJobData(res2);
    setData(shortListedCandidates);
  };

  useEffect(async () => {
    findShortListedCandidates();
  }, [rerender]);

  const {
    isAccountent,
    isAccountManager,
    isAdmin,
    isHR,
    isHRManager,
    isSalesEmployee,
    isSalesManager,
  } = useSelector((val) => val.authentication);

  const handleFilterQueryChange = (e) => {
    e.preventDefault();
    setFilterQueries({ ...filterQueries, [e.target.name]: e.target.value });
  };

  const onFilterClick = async (e) => {
    e.preventDefault();
    const res = await fetchCandidate();
    const shortListedCandidates = res.filter(
      (candidate) => candidate?.onBoarding === true
    );
    let filteredData = [...shortListedCandidates];
    if (filterQueries.name) {
      // const res = await fetchCandidate();
      // filteredData = [
      //   ...filteredData,
      //   ...res.filter(
      //     (candidate) =>
      //       candidate?.name.toLowerCase() === filterQueries.name.toLowerCase()
      //   ),
      // ];
      filteredData = filteredData.filter(
        (fd) =>
          fd?.name.toLowerCase().indexOf(filterQueries.name.toLowerCase()) > -1
      );
    }
    if (filterQueries.jobType) {
      // const res = await getCandidatesByJobId(filterQueries.jobType);
      // filteredData = [...filteredData, ...res];
      filteredData = filteredData.filter(
        (fd) => fd?.job == filterQueries?.jobType
      );
    }
    if (filterQueries.status) {
      // const res = await getCandidatesByStatus(
      //   filterQueries.status.toUpperCase()
      // );
      // filteredData = [...filteredData, ...res];
      filteredData = filteredData.filter(
        (fd) => fd?.status.toUpperCase() == filterQueries?.status.toUpperCase()
      );
    }
    if (filterQueries.from) {
      // const res = await fetchCandidate();
      // console.log(typeof res[0]?.createdAt);
      // filteredData = [
      //   ...filteredData,
      //   ...res.filter(
      //     (candidate) => candidate?.createdAt >= filterQueries.from
      //   ),
      // ];
      filteredData = filteredData.filter(
        (fd) => fd?.createdAt.createdAt.split('T')[0] >= filterQueries?.from
      );
    }
    if (filterQueries.to) {
      // const res = await fetchCandidate();
      // console.log(typeof res[0]?.createdAt);
      // filteredData = [
      //   ...filteredData,
      //   ...res.filter((candidate) => candidate?.createdAt < filterQueries.to),
      // ];
      filteredData = filteredData.filter(
        (fd) => fd?.createdAt.split('T')[0] <= filterQueries?.to
      );
    }
    // console.log(filteredData);
    // console.log(filterQueries);
    if (!filteredData.length) {
      toast.warn('No Data Found related to the search');
    }

    let uniqueFilteredData = [];
    filteredData.forEach((c) => {
      if (!uniqueFilteredData.includes(c)) {
        uniqueFilteredData.push(c);
      }
    });
    setData(uniqueFilteredData);
  };

  const columns = [
    {
      title: '#',
      dataIndex: '_id',
      render: (text, record) => (
        <span>
          {(() => {
            let pos;
            for (let index = 0; index < data?.length; index++) {
              const element = data[index];
              if (element?._id === record?._id) {
                pos = index + 1;
                break;
              }
            }
            return pos;
          })()}
        </span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => (
        <>
          <Link to={`/app/profile/candidate-profile/${record?._id}`}>
            {text}
            <br />
          </Link>
          <span
            style={{
              fontSize: 12,
            }}
          >
            {new Date(record?.createdAt).toLocaleDateString()}
          </span>
        </>
      ),
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: 'Job Title',
      dataIndex: 'job',
      render: (text, record) => (
        <Link
          to={{
            pathname: `/app/administrator/job-details/${text}`,
            job: jobData.filter((j) => j?._id === record?._id)[0],
          }}
        >
          {jobData?.filter((job) => job?._id === record?.job)[0]?.title}
        </Link>
      ),
      sorter: (a, b) => a.jobtitle.length - b.jobtitle.length,
    },

    {
      title: 'Department',
      render: (text, record) => (
        <span>
          {
            departmentData?.filter(
              (dep) =>
                dep?._id ===
                jobData?.filter((job) => job?._id === record?.job)[0]
                  ?.department
            )[0]?.name
          }
        </span>
      ),
      sorter: (a, b) => a.department.length - b.department.length,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '20%',
      render: (text, record) => (
        <Select
          style={{ width: 230 }}
          value={text}
          onChange={(key) => {
            updateCandidate(record?._id, {
              ...record,
              status: ONBOARDING_STATES[key],
            }).then((res) => {
              dispatch(
                createNotify({
                  notifyHead: `Candidates Status Updated`,
                  notifyBody: `Candidates Status is ${ONBOARDING_STATES[key]}`,
                  createdBy: res.employeeId,
                })
              );
              setData([...data.filter((c) => c._id !== res._id), res]);
              setRerender(!rerender);
            });
          }}
        >
          {Object.values(ONBOARDING_STATES).map((key) => (
            <Option value={key} label={APPLICANT_STATE[key]}>
              {ONBOARDING_STATES[key]}
            </Option>
          ))}
        </Select>
      ),
      sorter: (a, b) => a.status.length - b.status.length,
    },
    {
      title: isAdmin || isHRManager ? 'Action' : '',
      width: '10%',
      render: (text, record) =>
        isAdmin || isHRManager ? (
          <Space size={'small'}>
            {record?.isEmployee ? (
              <Link
                className="ant-btn"
                to={`/app/profile/employee-profile/${record?.employeeId}`}
              >
                <i className="fa fa-pencil m-r-5" /> View Employee
              </Link>
            ) : (
              <a
                className="ant-btn"
                href="#"
                data-toggle="modal"
                data-target="#add_emp_login"
                onClick={(e) => setCurrCand(record)}
                // aria-disabled={}
              >
                <i className="fa fa-pencil m-r-5" /> Convert Employee
              </a>
            )}

            <a
              className="ant-btn ant-btn-dangerous"
              href="#"
              data-toggle="modal"
              data-target="#delete_job"
              onClick={(e) => {
                deleteCandidate(record?._id).then(() => {
                  setRerender(!rerender);
                });
              }}
            >
              <i className="fa fa-trash-o m-r-5" /> Delete
            </a>
          </Space>
        ) : null,
    },
  ];

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <Helmet>
          <title>Shortlist Candidates</title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col-12">
                <h3 className="page-title">Shortlist Candidates</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">Jobs</li>
                  <li className="breadcrumb-item active">
                    Shortlist Candidates
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          {/* Applications Statistics */}
          <div className="row">
            <div className="col-md-3">
              <div className="stats-info">
                <h6>Total Shortlisted Candidates</h6>
                <h4>{data?.length}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-info">
                <h6>Agreement Sent</h6>
                <h4>
                  {
                    data?.filter(
                      (c) => c?.status === ONBOARDING_STATES.agreementSent
                    ).length
                  }{' '}
                  <span>Candidates</span>
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-info">
                <h6>Confirmed Joining </h6>
                <h4>
                  {
                    data?.filter(
                      (c) =>
                        c?.status === ONBOARDING_STATES.confirmedJoiningDate
                    ).length
                  }{' '}
                  <span>Candidates</span>
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-info">
                <h6>Sent Offer Letter</h6>
                <h4>
                  {
                    data?.filter(
                      (c) => c?.status === ONBOARDING_STATES.sentOfferLetter
                    ).length
                  }{' '}
                  <span>Candidates</span>
                </h4>
              </div>
            </div>
          </div>
          {/* Applications Statistics */}
          {/* Search Filter */}
          <div className="row filter-row">
            <div className="col-sm-6 col-md-4 col-lg-4 col-xl-3 col-12">
              <div className="form-group form-focus focused">
                <input
                  name="name"
                  type="text"
                  className="form-control floating"
                  value={filterQueries?.name}
                  onChange={handleFilterQueryChange}
                />
                <label className="focus-label">Candidate Name</label>
              </div>
            </div>
            <div className="col-sm-6 col-md-4 col-lg-4 col-xl-3 col-12">
              <div className="form-group form-focus focused text-left">
                <a
                  className="btn form-control btn-white dropdown-toggle"
                  href="#"
                  data-toggle="dropdown"
                  aria-expanded="false"
                >
                  {jobData.filter((j) => j?._id === filterQueries?.jobType)[0]
                    ?.title || 'Job'}
                </a>
                <div className="dropdown-menu dropdown-menu-right custom_drop_down_menu">
                  {jobData?.map((job) => (
                    <span
                      className="dropdown-item custom_drop_down_item"
                      onClick={() =>
                        setFilterQueries({
                          ...filterQueries,
                          jobType: job?._id,
                        })
                      }
                    >
                      <i className="fa" /> {job?.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-md-4 col-lg-4 col-xl-3 col-12">
              <div className="form-group form-focus focused text-left">
                <a
                  className="btn form-control btn-white dropdown-toggle"
                  href="#"
                  data-toggle="dropdown"
                  aria-expanded="false"
                >
                  {filterQueries?.status || 'Status'}
                </a>
                <div className="dropdown-menu dropdown-menu-right custom_drop_down_menu">
                  {Object.values(ONBOARDING_STATES)?.map((status) => (
                    <span
                      className="dropdown-item custom_drop_down_item"
                      onClick={() =>
                        setFilterQueries({ ...filterQueries, status: status })
                      }
                    >
                      <i className="fa" /> {status}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
              <div className="form-group form-focus select-focus">
                <input
                  name="from"
                  className="form-control floating"
                  type="date"
                  onChange={handleFilterQueryChange}
                />
                <label className="focus-label">From</label>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
              <div className="form-group form-focus select-focus">
                <input
                  name="to"
                  className="form-control floating"
                  type="date"
                  onChange={handleFilterQueryChange}
                />
                <label className="focus-label">To</label>
              </div>
            </div> */}
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-1 col-12">
              <button className="btn btn-success" onClick={onFilterClick}>
                {' '}
                Search{' '}
              </button>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-1 col-12">
              <button
                className="btn btn-danger"
                onClick={(e) => {
                  setRerender(!rerender);
                  setFilterQueries({
                    ...filterQueries,
                    name: '',
                    jobType: '',
                    status: '',
                    from: null,
                    to: null,
                  });
                }}
              >
                Reset
              </button>
            </div>
          </div>
          {/* /Search Filter */}
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive">
                <Table
                  className="table-striped"
                  pagination={{
                    total: data.length,
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
                  rowKey={(record) => record.id}
                  // onChange={this.handleTableChange}
                />
              </div>
            </div>
          </div>
          {currCand && (
            <AddEmpAuth candData={currCand} setRerender={setRerender} />
          )}
        </div>
        {/* /Page Content */}
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default ShortlistCandidate;
