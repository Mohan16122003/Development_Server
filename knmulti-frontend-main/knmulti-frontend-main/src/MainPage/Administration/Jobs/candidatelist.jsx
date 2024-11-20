import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { Badge, Select, Table } from 'antd';
import 'antd/dist/antd.css';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import '../../antdstyle.css';
import {
  deleteCandidate,
  fetchCandidate,
  fetchJobs,
  updateCandidate,
} from '../../../lib/api';
import { APPLICANT_STATE } from '../../../model/shared/applicantStates';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const CandidateList = () => {
  const [data, setData] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [filterQueries, setFilterQueries] = useState({
    name: '',
    jobType: '',
    status: '',
    from: '',
    to: '',
  });

  const [rerender, setRerender] = useState(false);
  const {
    isAccountent,
    isAccountManager,
    isAdmin,
    isHR,
    isHRManager,
    isSalesEmployee,
    isSalesManager,
  } = useSelector((val) => val.authentication);

  useEffect(() => {
    (async () => {
      const res = await fetchCandidate();
      setData(res);
      const res2 = await fetchJobs();
      setJobData(res2);
    })();
  }, [rerender]);

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  });

  const handleFilterQueryChange = (e) => {
    e.preventDefault();
    setFilterQueries({ ...filterQueries, [e.target.name]: e.target.value });
  };

  const onFilterClick = async (e) => {
    e.preventDefault();
    // console.log({ filterQueries })
    const res = await fetchCandidate();
    let filteredData = [...res];
    if (filterQueries.name) {
      // filteredData = [
      //   ...filteredData,
      //   ...res.filter(
      //     (candidate) =>
      //       // candidate?.name.toLowerCase() === filterQueries.name.toLowerCase()
      //       candidate?.name.toLowerCase().indexOf(filterQueries.name.toLowerCase()) > -1
      //   ),
      // ];
      filteredData = filteredData.filter(
        (fd) =>
          fd?.name.toLowerCase().indexOf(filterQueries.name.toLowerCase()) > -1
      );
    }
    if (filterQueries.jobType) {
      // console.log("jobType", filterQueries.jobType)
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
    if (filterQueries?.from) {
      // const res = await fetchCandidate();
      // console.log(typeof res[0]?.createdAt);
      // filteredData = [
      //   ...filteredData,
      //   ...res.filter(
      //     (candidate) => candidate?.createdAt >= filterQueries.from
      //   ),
      // ];
      filteredData = filteredData.filter(
        (fd) => fd?.createdAt.split('T')[0] >= filterQueries?.from
      );
    }
    if (filterQueries?.to) {
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

    if (!filteredData.length) {
      toast.warn('No Data Found related to the search');
    }
    // console.log(filterQueries);
    // if(filteredData.length){
    let uniqueFilteredData = [];
    filteredData.forEach((c) => {
      if (!uniqueFilteredData.includes(c)) {
        uniqueFilteredData.push(c);
      }
    });
    setData(uniqueFilteredData);
    // } else {
    //   // setRerender(!rerender);
    // }
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
        /*<h2 className="table-avatar">
          {
            record?.link &&
            <Link
              to={`/app/profile/candidate-profile/${record?._id}`}
              className="avatar"
            >
              <img alt="" src={record?.image} />
            </Link>
          }

        </h2>*/
        <Link
          className={''}
          to={`/app/profile/candidate-profile/${record?._id}`}
        >
          {text}
        </Link>
      ),
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: 'Role',
      render: (text, record) => (
        <Link
          to={{
            pathname: `/app/administrator/job-details/${record?.job}`,
            job: jobData.filter((j) => j?._id === record?._id)[0],
          }}
        >
          {jobData?.filter((job) => job?._id === record?.job)[0]?.title}
        </Link>
      ),
    },
    {
      title: 'Mobile Number',
      dataIndex: 'mobile',
      sorter: (a, b) => a.mobile - b.mobile,
    },

    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => a.email.length - b.email.length,
    },
    {
      title: 'Applied On',
      // dataIndex: 'createdAt',
      render: (text, record) => (
        <span>{new Date(record?.createdAt).toLocaleDateString()}</span>
      ),
      sorter: (a, b) => a.createdAt - b.createdAt,
    },
    {
      dataIndex: 'status',
      title: 'Status',
      render: (text, record) => (
        <>
          {record?.onBoarding !== true &&
          record?.status !== APPLICANT_STATE.selected &&
          record?.status !== APPLICANT_STATE.rejected ? (
            <Select
              style={{ width: 150 }}
              value={text?.slice(0, 1) + text?.slice(1)?.toLowerCase()}
              onChange={(key) =>
                updateCandidate(record?._id, {
                  ...record,
                  status: APPLICANT_STATE[key],
                }).then((res) => {
                  toast.success('Applicant status updated successfully!');
                  setData([...data.filter((c) => c._id !== res._id), res]);
                  setRerender(!rerender);
                })
              }
            >
              {Object?.keys(APPLICANT_STATE)?.map((key) => (
                <Option value={key} label={APPLICANT_STATE[key]}>
                  <Badge
                    color={
                      APPLICANT_STATE[key] === APPLICANT_STATE.applied
                        ? 'purple'
                        : APPLICANT_STATE[key] === APPLICANT_STATE.underReview
                        ? `blue`
                        : APPLICANT_STATE[key] === APPLICANT_STATE.shortlisted
                        ? `lime`
                        : APPLICANT_STATE[key] === APPLICANT_STATE.hrRound
                        ? `lime`
                        : APPLICANT_STATE[key] === APPLICANT_STATE.selected
                        ? `green`
                        : `red`
                    }
                    text={APPLICANT_STATE[key]}
                  />
                </Option>
              ))}
            </Select>
          ) : (
            <Badge
              color={
                record?.status === APPLICANT_STATE.applied
                  ? 'purple'
                  : record?.status === APPLICANT_STATE.underReview
                  ? `blue`
                  : record?.status === APPLICANT_STATE.shortlisted
                  ? `lime`
                  : record?.status === APPLICANT_STATE.hrRound
                  ? `lime`
                  : record?.status === APPLICANT_STATE.selected
                  ? `green`
                  : `red`
              }
              /*className={`text-${(() => {
                  return record?.status === APPLICANT_STATE.applied ?
                    'purple' : record?.status === APPLICANT_STATE.underReview ?
                      `info` : record?.status === APPLICANT_STATE.shortlisted ?
                        `primary` : record?.status === APPLICANT_STATE.hrRound ?
                          `primary` : record?.status === APPLICANT_STATE.selected ?
                            `success` : `danger`;
                })()}`}*/
              text={text}
            />
          )}
        </>
      ),
    },
    {
      title: isAdmin || isHRManager ? 'Action' : '',
      render: (text, record) =>
        isAdmin || isHRManager ? (
          <a
            className="ant-btn ant-btn-dangerous"
            href="#"
            data-toggle="modal"
            data-target="#delete_job"
            onClick={(e) => {
              deleteCandidate(record?._id).then(() => {
                toast.success('Applicant deleted successfully!');
                setRerender(!rerender);
              });
            }}
          >
            <i className={'fa fa-trash'} />
            &nbsp;&nbsp;Delete
          </a>
        ) : null,
    },
  ];

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <Helmet>
          <title>Candidates List</title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Candidates List</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">Jobs</li>
                  <li className="breadcrumb-item active">Candidates List</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          {/* Applications Statistics */}
          <div className="row">
            <div className="col-md-3">
              <div className="stats-info">
                <h6>Total Applications</h6>
                <h4>{data?.length}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-info">
                <h6>Shortlisted</h6>
                <h4>
                  {
                    data?.filter(
                      (c) => c?.status === APPLICANT_STATE.shortlisted
                    ).length
                  }{' '}
                  <span>Applications</span>
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-info">
                <h6>Selected </h6>
                <h4>
                  {
                    data?.filter((c) => c?.status === APPLICANT_STATE.selected)
                      .length
                  }{' '}
                  <span>Applications</span>
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-info">
                <h6>Rejected</h6>
                <h4>
                  {
                    data?.filter((c) => c?.status === APPLICANT_STATE.rejected)
                      .length
                  }{' '}
                  <span>Applications</span>
                </h4>
              </div>
            </div>
          </div>
          {/* Applications Statistics */}
          {/* Search Filter */}
          <div className="row filter-row">
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
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
            <div className="col-sm-6 col-md-4 col-lg-3 col-xl-2 col-12">
              <div className="form-group form-focus focused text-left">
                <a
                  className="btn form-control btn-white dropdown-toggle"
                  href="#"
                  data-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    fontSize: '11px',
                    paddingLeft: '0px',
                    overflowX: 'clip',
                  }}
                >
                  {jobData.filter((j) => j?._id === filterQueries?.jobType)[0]
                    ?.title || 'Job'}
                </a>
                <div
                  className="dropdown-menu dropdown-menu-right custom_drop_down_menu"
                  style={{ width: 'auto' }}
                >
                  {jobData?.map((job) => (
                    <span
                      className="dropdown-item custom_drop_down_item"
                      style={{ overflow: 'hidden', padding: '0.5rem 2rem' }}
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
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
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
                  {Object.values(APPLICANT_STATE)?.map((status) => (
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
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
              <div className="form-group form-focus select-focus">
                <input
                  name="from"
                  className="form-control floating"
                  type="date"
                  value={filterQueries?.from}
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
                  value={filterQueries?.to}
                  onChange={handleFilterQueryChange}
                />
                <label className="focus-label">To</label>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-1 col-12">
              <button className="btn btn-success" onClick={onFilterClick}>
                Search
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
                    to: '',
                    from: '',
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
                />
              </div>
            </div>
          </div>
        </div>
        {/* /Page Content */}
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default CandidateList;
