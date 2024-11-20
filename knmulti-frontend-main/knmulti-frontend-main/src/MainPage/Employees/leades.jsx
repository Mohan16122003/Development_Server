import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { Space, Tag } from 'antd';
import Avatar from '@mui/material/Avatar';
import 'antd/dist/antd.css';
import '../antdstyle.css';
import httpService from '../../lib/httpService';
import { toast } from 'react-toastify';
import { CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { Table } from 'react-bootstrap';
import Pagination from '@mui/material/Pagination';
import Swal from 'sweetalert2';
import LeadInterest from '../Lead/LeadInterest';
import { InfoCircleFilled } from '@ant-design/icons';

const Leads = () => {
  const user = useSelector((state) => state.authentication.value.user);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reInsertData, setReInsertData] = useState();
  const [leadStatus, setLeadStatus] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projects, setProjects] = useState([]);
  const [leadInterest, setLeadInterest] = useState([]);
  const [projectsLength, setProjectsLength] = useState(0);
  const [leadIdToDelete, setLeadIdToDelete] = useState('');
  const fetchLeads = async () => {
    setIsLoading(true);
    if (user?.jobRole?.name === 'Admin') {
      const leads = await httpService.get('/lead');
      setData(leads?.data?.data);
      setReInsertData(leads?.data?.data);
      setTotalPages(Math.ceil(leads.data.length / 10));
      setIsLoading(false);
    } else {
      const leads = await httpService.get(`/lead/employee/${user?._id}`);
      setData(leads.data);
    }
  };
  const fetchLeadStatus = async () => {
    const status = await httpService.get('/lead-status/switchable');
    setLeadStatus(status.data);
    setIsLoading(false);
  };

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeadStatus();
      fetchLeads();
    }
  }, [user]);

  const deleteLead = (e) => {
    e.preventDefault();
    httpService
      .delete(`/lead/${leadIdToDelete}`)
      .then(async (res) => {
        if (res.status === 200) {
          toast.success('Lead Deleted!');
          await fetchLeads();
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message ||
            'Unable to delete lead due to unknown error!'
        );
      });
    document.querySelectorAll('.cancel-btn')?.forEach((e) => e.click());
  };

  useEffect(() => {
    let prodLength = data.reduce((acc, curr) => {
      acc += curr.project?.length;
      return acc;
    }, 0);
    setProjectsLength(prodLength);
    data.map((item) => {
      const projects = item?.project;
      projects?.forEach((plot) => {
        const interest = plot?.leadsInfo?.filter((l) => l?.lead == item._id);
        // if (!plot.sold) {
        setLeadInterest((d) => [...interest.map((v) => ({ ...v, plot }))]);
      });
      // };
      // refreshData(item._id);
    });
  }, [data]);
  const [expandedRow, setExpandedRow] = useState(null);
  const handleRowClick = (item) => {
    if (expandedRow?._id === item._id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(item);
    }
  };

  const filterCustomerName = (e) => {
    if (e.target.value === '') {
      setData(reInsertData);
      return;
    }
    setData((resData) =>
      resData?.filter((data, i) =>
        data?.name?.toLowerCase()?.includes(e.target.value?.toLowerCase())
      )
    );
  };

  const filterCustomerEmail = (e) => {
    if (e.target.value === '') {
      setData(reInsertData);
      return;
    }
    setData((resData) =>
      resData?.filter((data, i) =>
        data?.email?.toLowerCase()?.includes(e.target.value?.toLowerCase())
      )
    );
  };

  const fetchLeadProfile = async (id) => {
    const response = await httpService.get(`/lead/${id}`);
    const projects = response?.data.project;
    projects.forEach((project) => {
      project.subPlots.forEach((plot) => {
        const interest = plot?.leadsInfo?.filter(
          (l) => l.lead == response?.data._id
        );
        // if (!plot.sold) {
        setLeadInterest((d) => [
          ...interest?.map((v) => ({ ...v, plot, project })),
        ]);
        // }
      });
    });
  };

  const fetchProjects = async () => {
    const res = await httpService.get('/project');
    setProjects(res.data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);
  const findLeads = (id, plots) => {
    const lead = plots.find((p) => p?._id === id);
    return lead.leadsInfo;
  };

  const updateLeadInterest = async (plot, project_id, status, lead) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change the Customer interest status',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const projectToModify = projects.find((p) => p?._id === project_id);
        projectToModify.subPlots
          .find((p) => p?._id === plot?._id)
          .leadsInfo.find((p) => p?.lead === lead).leadType = status;
        setProjects((d) =>
          d.map((p) => (p._id === project_id ? projectToModify : p))
        );
        await toast
          .promise(
            httpService.put(`/project/status/${project_id}`, {
              project: projectToModify,
              lead: lead,
              plot: plot,
              status,
            }),
            {
              pending: 'Updating customer Status',
              success: 'customer Status Updated',
              error: 'Error Updating customer Status',
            }
          )
          .then((res) => {
            if (res?.data?.customerType) {
              history.push({
                pathname: `/app/profile/customer-profile/${res?.data?._id}`,
              });
              setData(changedData);
              setExpandedRow(null);
            } else {
              let changedData = data?.map((el) => {
                if (el._id === lead) {
                  let project = el?.project?.map((e) => {
                    if (e.parent_id === res.data._id) {
                      return {
                        ...plot,
                        leadsInfo: findLeads(e._id, res.data.subPlots),
                      };
                    } else {
                      return e;
                    }
                  });
                  return { ...el, project };
                } else {
                  return el;
                }
              });
              setData(changedData);
              setExpandedRow(null);
            }
            setData(changedData);
            setExpandedRow(null);
          });
        setExpandedRow(null);
      }
      setExpandedRow(null);
    });
  };
  function stringToColor(string) {
    let hash = 0;
    let i;
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name) {
    let modName = name.replace(/\s+/g, ' ');
    return {
      sx: {
        bgcolor: stringToColor(name),
        fontSize: '15px',
      },
      children: `${modName.trim().split(' ')[0][0].toUpperCase()}${modName
        .trim()
        .split(' ')[1][0]
        .toUpperCase()}`,
    };
  }
  const { isAccountManager, isAdmin, isSalesManager } = useSelector(
    (val) => val.authentication
  );

  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, data.length);
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Leads </title>
        <meta name="description" content="Login page" />
      </Helmet>
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
              {/* jin - changed col-sm-12 to col-sm-8  */}
              <div className="col-sm-8">
                <h3 className="page-title">Leads</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Leads</li>
                </ul>
              </div>
              {!isAccountManager && (
                <div className="col-auto float-right ml-auto">
                  <Link to="/app/leads/add-leads" className="btn add-btn">
                    <i className="fa fa-plus" /> Add Lead
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <div
                className="stats-info"
                style={{
                  background: '#cae5fa',
                  border: '2px solid #ededed',
                  boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.2)',
                }}
              >
                <h6>Total Leads</h6>
                <h4>{data?.length}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div
                className="stats-info"
                style={{
                  background: '#ffdbdb',
                  border: '2px solid #ededed',
                  boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.2)',
                }}
              >
                <h6>Total Projects</h6>
                <h4>{projectsLength}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div
                className="stats-info"
                style={{
                  background: '#fbeacc',
                  border: '2px solid #ededed',
                  boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.2)',
                }}
              >
                <h6>Leads Lost</h6>
                <h4>
                  {
                    leadInterest?.filter((item) => item?.leadType == 'Lost')
                      .length
                  }
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div
                className="stats-info"
                style={{
                  background: '#bef3c2',
                  border: '2px solid #ededed',
                  boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.2)',
                }}
              >
                <h6>Active Leads</h6>
                <h4>
                  {data?.filter((item) => item.project?.length !== 0).length ||
                    0}
                </h4>
              </div>
            </div>
          </div>
          <div className="row filter-row">
            <div className="col-sm-6 col-md-3">
              <div className="form-group form-focus focused">
                <div>
                  <input
                    placeholder="Lead Name"
                    className="form-control"
                    type="text"
                    style={{
                      padding: '10px',
                    }}
                    onChange={(e) => filterCustomerName(e)}
                  />
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="form-group form-focus focused">
                <div>
                  <input
                    placeholder="Email"
                    className="form-control"
                    style={{
                      padding: '10px',
                    }}
                    type="text"
                    onChange={(e) => filterCustomerEmail(e)}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* /Page Header */}

          <div className="container first-container col-sm-12 pull-left table-responsive">
            {/* <h2>Condensed Table 1 </h2> */}
            <Table striped hover className="table table-condensed">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type of customer</th>
                  <th>Lead interest Count</th>
                  <th>Phone</th>
                  <th>Email</th>
                  {isAdmin || isSalesManager ? (
                    <th>
                      <span style={{ marginLeft: '50px' }}>Action</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              {data
                .slice((currentPage - 1) * 10, currentPage * 10)
                .map((item, index) => (
                  <tbody key={index}>
                    <tr className="sub-container">
                      {/* <td>{item.customerType}</td> */}

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Avatar {...stringAvatar(`${item?.name}`)} />

                          <div style={{ marginLeft: '10px' }}>
                            <Link to={`/app/profile/lead-profile/${item._id}`}>
                              <span style={{ color: '#1990ff' }}>
                                {item.name}
                              </span>
                            </Link>

                            {
                              item.project?.length !== 0 &&
                                (expandedRow?._id === item._id ? (
                                  <i
                                    className="fa fa-chevron-circle-up m-l-5"
                                    style={{
                                      color: '#454545',
                                      height: '0.2rem',
                                      width: '0.2rem',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleRowClick(item)}
                                  />
                                ) : (
                                  <i
                                    className="fa fa-chevron-circle-down m-l-5"
                                    style={{
                                      color: '#454545',
                                      height: '0.2rem',
                                      width: '0.2rem',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleRowClick(item)}
                                  />
                                ))

                              // <i class="fas fa-chevron-circle-down"></i>
                            }
                          </div>
                        </div>
                        {/* <i className="bi bi-plus m-l-5" /> */}
                      </td>
                      <td>
                        <Tag
                          style={{
                            marginLeft: '20px',
                            marginTop: '10px',
                            fontWeight: 600,
                          }}
                          color={item.customer ? 'green' : 'blue'}
                        >
                          {item.customer ? 'Customer' : 'New'}
                        </Tag>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            border: 'none',
                            marginRight: '30px',
                          }}
                        >
                          {item.project?.length}
                        </span>{' '}
                      </td>
                      <td>{item.phone || item.workPhone}</td>
                      <td>{item.email}</td>
                      {isAdmin || isSalesManager ? (
                        <td>
                          <Space size={'small'}>
                            <Link
                              className="ant-btn"
                              to={{
                                pathname: '/app/leads/add-leads',
                                state: { ...item, edit: true },
                              }}
                            >
                              <i className="fa fa-pencil m-r-5" /> Edit
                            </Link>
                            <div
                              className="ant-btn ant-btn-dangerous"
                              data-toggle="modal"
                              data-target="#delete_lead"
                              onClick={(e) => {
                                e.preventDefault();
                                setLeadIdToDelete(item._id);
                              }}
                            >
                              <i className="fa fa-trash-o m-r-5" /> Delete
                            </div>
                          </Space>
                        </td>
                      ) : (
                        ''
                      )}
                    </tr>

                    {expandedRow?._id === item._id && (
                      <tr key={item._id} style={{ position: 'relative' }}>
                        <td colSpan={4}>
                          <div className="expanded-content">
                            <Table
                              striped
                              bordered
                              hover
                              // style={{ marginLeft: '250px' }}
                            >
                              <thead>
                                <tr>
                                  <th>Current Project</th>
                                  <th>Plot Interest</th>
                                  <th>Type of property</th>
                                  <th>Assigned Staff</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              {/* {refreshData(item._id)( */}
                              <tbody>
                                {expandedRow?.project?.map((project, id) => (
                                  <LeadInterest
                                    key={id}
                                    plotId={expandedRow.plots[id]}
                                    item={expandedRow}
                                    project={project}
                                    leadStatus={leadStatus}
                                    updateLeadInterest={updateLeadInterest}
                                  />
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
            </Table>
            <hr />
            <div
              style={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center',
                marginTop: '30px',
                marginBottom: '30px',
              }}
            >
              {' '}
              <h5 style={{ marginTop: '5px' }}>
                Showing {startIndex} to {endIndex} of {data.length} entries
              </h5>
              <Pagination
                count={totalPages}
                color="primary"
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Lead Modal */}
      {/* <div className="modal custom-modal fade" id="delete_lead" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Lead</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a
                      className="btn btn-primary continue-btn"
                      onClick={deleteLead}
                    >
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
      </div> */}
      {/* Delete Lead Modal */}
      <div className="modal custom-modal fade" id="delete_lead" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <InfoCircleFilled
                    style={{
                      color: 'orange',
                      fontSize: '1.5rem',
                      marginRight: '10px',
                    }}
                  />
                  <h4 style={{ marginTop: '10px' }}>Delete Lead</h4>
                </div>
                <p style={{ color: 'gray' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Are you sure want to
                  delete?
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div
                  className="row"
                  style={{
                    display: 'flex',
                    justifyContent: 'end',
                  }}
                >
                  <div className="">
                    <a
                      data-dismiss="modal"
                      className="btn"
                      style={{ borderColor: 'gray' }}
                    >
                      Cancel
                    </a>
                  </div>
                  <div className="">
                    <a
                      href=""
                      onClick={deleteLead}
                      className="btn btn-primary continue-btn"
                      data-dismiss="modal"
                    >
                      Delete
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
