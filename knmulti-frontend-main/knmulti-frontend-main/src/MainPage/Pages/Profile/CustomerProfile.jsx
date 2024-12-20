import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
// import { Table } from 'antd';
import { Backdrop, makeStyles, Paper } from '@material-ui/core';
import 'antd/dist/antd.css';
import Swal from 'sweetalert2';
import httpService from '../../../lib/httpService';
import '../../antdstyle.css';
import { Tag } from 'antd';

// import { Backdrop, makeStyles, Paper } from '@mui/material';
import {
  AccountBalanceWallet,
  DeleteOutline,
  Person,
} from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import AddressIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneIcon from '@mui/icons-material/PhoneOutlined';
import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { red } from '@mui/material/colors';
import { Table } from 'react-bootstrap';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fileToDataURI } from '../../../misc/helpers';
import EditCustomerAddress from './EditCustomerAddress';

import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@material-ui/lab';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import LeadProfileIntrestTable from './LeadProfileIntrestTable';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '6px 16px',
  },
  notesInput: {
    width: '60vw',
    backgroundColor: '#fff',
  },
  notesAddButton: {
    paddingBottom: 0,
    marginBottom: 6,
  },
}));

const InactiveTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 250,
  },
});

const CustomerProfile = () => {
  const dispatch = useDispatch();
  // const { user } = JSON.parse(localStorage.getItem('auth'));
  const [customer, setCustomer] = useState(null);
  const [timelineArr, setTimelineArr] = useState([]);
  // const user = useSelector((state) => state.authentication.value.user);

  const [isLoading, setIsLoading] = useState(true);
  const [commentToAdd, setCommentToAdd] = useState('');
  const [delCom, setDelCom] = useState();
  // const isAdmin = user && user?.userType === 'admin';
  let { id } = useParams();
  const classes = useStyles();

  // add plot intesreted
  const [projects, setProjects] = useState([]);
  const [addProject, setAddProject] = useState(false);
  const [addProjectType, setAddProjectType] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState({});
  const layoutMapRef = useRef(null);
  const [leadInterest, setLeadInterest] = useState([]);
  const [leadStatus, setLeadStatus] = useState([]);

  // User Transections State management
  const [estimates, setEstimates] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  // Credit
  const [customerAllCreditAmount, setCustomerAllCreditAmount] = useState(0);

  useEffect(async () => {
    const { data } = await httpService.get('/customer/' + id);
    const tla = await data?.timeline?.reverse();
    setTimelineArr(tla);
    fetchAllCredit();
  }, [isLoading, projects]);

  useEffect(async () => {
    const res = await httpService.get('/customer/' + id);
    setCustomer(res.data);
    const projects = await res.data.project;
    projects?.forEach((project) => {
      project.subPlots.forEach((plot) => {
        const interest = plot.leadsInfo.filter(
          (l) => l.customer == res.data._id
        );
        // if (!plot.sold) {
        setLeadInterest((d) => [
          ...d,
          ...interest.map((v) => ({ ...v, plot, project })),
        ]);
        // }
      });
    });
    setIsLoading(false);
    fetchProjects();
    fetchStatus();
    fetchAllCredit();
  }, []);

  // fetcch user transections
  useEffect(() => {
    fetchEstimates();
    fetchSalesOrder();
    fetchCustomerInovices();
    fetchPaymentReceived();
    fetchCreditNotes();
  }, []);

  const fetchEstimates = async () => {
    const res = await httpService.get(`/customer/estimate/${id}`);
    setEstimates(res.data);
  };
  const fetchSalesOrder = async () => {
    // const res = await httpService.get('/sales-order/customer/' + id);
    // setBills(res.data);
  };
  const fetchCustomerInovices = async () => {
    const res = await httpService.get(`/customer/invoices/${id}`);
    setInvoices(res.data);
  };
  const fetchPaymentReceived = async () => {
    const res = await httpService.get(`/customer/payments/${id}`);
    setPayments(res.data);
  };
  const fetchCreditNotes = async () => {
    // const res = await httpService.get('/credit-note/customer/' + id);
    // setBills(res.data);
  };

  const refreshData = async (id) => {
    const res = await httpService.get('/customer/' + id);
    setCustomer(res.data);

    const projects = await res.data.project;
    projects.forEach((project) => {
      project.subPlots.forEach((plot) => {
        const interest = plot.leadsInfo.filter(
          (l) => l.customer == res.data._id
        );
        // if (!plot.sold) {
        setLeadInterest((d) => [
          ...d,
          ...interest.map((v) => ({ ...v, plot, project })),
        ]);
        // }
      });
    });

    fetchProjects();
    fetchStatus();
    fetchAllCredit();
    setIsLoading(false);
  };

  const fetchStatus = async () => {
    const { data } = await httpService.get('/lead-status/switchable');
    setLeadStatus(data);
    setIsLoading(false);
  };

  const fetchAllCredit = async () => {
    httpService.get(`/sale-payment?customer=${id}`).then((res) => {
      // setInvData(res.data)
      const payData = res.data.filter((pay) => pay?.excessAmount > 0);
      const advPayAmt = payData.reduce((acc, curr) => {
        return acc + +curr?.excessAmount;
      }, 0);
      setCustomerAllCreditAmount(advPayAmt);
    });
  };

  const handleDocumentChange = (file) => {
    if (!file) {
      setNewUpload({ ...newUpload, data: '' });
      return;
    }

    fileToDataURI(file).then((res) =>
      setNewUpload({ ...newUpload, data: res })
    );
  };
  const { isAdmin, isSalesManager } = useSelector((val) => val.authentication);
  const fetchProjects = async () => {
    const res = await httpService.get('/project');
    let liveProjects = res.data.filter((p) => p.saleStatus == 'Live');
    setProjects(liveProjects);
  };

  const fetchCustomerProfile = async () => {
    const response = await httpService.get(`/customer/${id}`);
    setCustomer(response.data);

    const tla = await response.data.timeline;
    setTimelineArr(tla);
    // setProfileFetched(true);
    const projects = await response.data.project;

    projects.forEach((project) => {
      project.subPlots.forEach((plot) => {
        const interest = plot.leadsInfo.filter(
          (l) => l.customer == response.data._id
        );
        if (!plot.sold) {
          setLeadInterest((d) => [
            ...d,
            ...interest.map((v) => ({ ...v, plot, project })),
          ]);
        }
      });
    });
  };

  const handleDocumentsSubmit = async (e) => {
    e.preventDefault();
    // if (documents?.uploads?.length > 0) {
    //   editDocuments(id, newUpload).then((res) =>
    //     console.log('From edit documents : ', res)
    //   );
    // } else {
    //   postDocuments(id, newUpload).then((res) =>
    //   );
    // }
  };

  const handleCommentAdd = async () => {
    if (commentToAdd === '') return;
    const response = await toast.promise(
      httpService.put(`/customer/comment/${customer?._id}`, { commentToAdd }),
      {
        pending: 'Adding Comment',
        success: 'Comment Added successfully',
        error: "couldn't add comment, please recheck the details entered",
      }
    );
    setCommentToAdd('');
    document.querySelectorAll('.close')?.forEach((e) => e.click());
    refreshData(customer?._id);
  };

  const deleteComment = (e) => {
    const customerComments = customer.comments.filter((c) => c._id !== delCom);
    toast
      .promise(
        httpService.put(`/customer/${customer?._id}`, {
          ...customer,
          comments: [...customerComments],
        }),
        {
          success: 'Customer comment deleted successfully',
          pending: 'Deleting Customer comment',
        }
      )
      .then(() => {
        document.querySelectorAll('.cancel-btn')?.forEach((e) => e.click());
        refreshData(customer?._id);
      });
  };
  const updateLeadInterest = async (plot, project, status, leadCustomer) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change the Customer interest status',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const projectToModify = projects.find((p) => p._id === project);
        projectToModify.subPlots
          .find((p) => p._id === plot._id)
          .leadsInfo.find((l) => l.customer === customer._id).leadType = status;
        setProjects((d) =>
          d.map((p) => (p._id === project ? projectToModify : p))
        );
        await toast
          .promise(
            httpService.put(`/project/status/${project}`, {
              project: projectToModify,
              status,
              plot,
              leadcustomer: leadCustomer,
              ...(customer.lead && { lead: customer.lead }),
            }),
            {
              pending: 'Updating customer Status',
              success: 'customer Status Updated',
              error: 'Error Updating customer Status',
            }
          )
          .then((res) => {
            setLeadInterest([]);
            setIsLoading(false);
            refreshData(customer?._id);
          });
      }
    });
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Customer Profile </title>
        <meta name="description" content="Customer Profile" />
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
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">
                  Customer Profile / {customer?.displayName}
                </h3>
                {/*  */}
                {/* <div>
                  <span className={'badge bg-inverse-info'}>₹ 8000000</span>
                </div> */}
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="card mb-0">
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <Stack justifyContent={'space-between'} direction={'row'}>
                    <Stack direction={'row'} alignItems={'center'} spacing={1}>
                      <Avatar sx={{ bgcolor: red[400], height: 52, width: 52 }}>
                        {customer?.displayName?.substr(0, 1)}
                      </Avatar>
                      <Stack>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 500,
                          }}
                        >
                          <Person />
                          <span>
                            &nbsp;&nbsp;&nbsp;&nbsp;{customer?.firstName}{' '}
                            {customer?.lastName}{' '}
                          </span>{' '}
                          <span className={'badge bg-inverse-info'}>
                            CUSTOMER
                          </span>
                          <br />
                          {customer?.email && (
                            <>
                              <EmailIcon />
                              <span>
                                &nbsp;&nbsp;&nbsp;&nbsp;{customer?.email}
                              </span>
                              <br />
                            </>
                          )}
                          <PhoneIcon />
                          <span>
                            &nbsp;&nbsp;&nbsp;&nbsp;{customer?.workPhone}
                          </span>{' '}
                          {customer?.phone && <span>{customer?.phone}</span>}
                          <br />
                          {/* { customer?.workPhone && 
                            <>
                              <PhoneIcon />
                              <span>&nbsp;&nbsp;&nbsp;&nbsp;{customer?.workPhone}</span>
                            </>
                          } */}
                          <AccountBalanceWallet />
                          <span className={'badge bg-inverse-info ml-3'}>
                            ₹{customerAllCreditAmount}
                          </span>
                        </div>
                      </Stack>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'} spacing={1}>
                      <Button
                        sx={{
                          color: 'black',
                          width: '18px',
                          height: '30px',
                          fontSize: '1rem',
                        }}
                      >
                        {isAdmin && (
                          <div className="col-auto float-right ml-auto">
                            <Link
                              className="btn add-btn"
                              to={{
                                pathname: '/app/sales/add-customers',
                                state: {
                                  ...customer,
                                  contactPersonsData: [
                                    ...customer?.contactPersons,
                                  ],
                                  edit: true,
                                },
                              }}
                            >
                              <EditIcon /> Edit
                            </Link>
                          </div>
                        )}
                      </Button>
                    </Stack>
                  </Stack>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 pr-0 mt-1">
              <div
                className="card mb-0"
                id="accordionExample"
                style={{
                  height: '100%',
                }}
              >
                <div
                  className="card-body"
                  style={{
                    minHeight: '65vh',
                  }}
                >
                  {/* <div
                    style={{

                      marginBottom: '50px',
                    }}
                  >
                  </div> */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div className="float-left">
                      <button
                        type="button"
                        style={{
                          border: 'none',
                          backgroundColor: '#FFFFFF',
                          fontSize: '18px',
                        }}
                        data-toggle="collapse"
                        data-target="#Basic"
                        aria-expanded="false"
                        aria-controls="Basic"
                      >
                        <span style={{ color: 'black' }}>
                          <AddressIcon />
                        </span>{' '}
                        &nbsp;&nbsp;&nbsp;&nbsp; Address
                      </button>
                    </div>
                    {/* <div className='float-right'>
                          <a
                            href="#"
                            // className="btn add-btn"
                            data-toggle="modal"
                            data-target="#edit_customeraddress"
                          >
                            <EditIcon />
                          </a>
                      </div> */}
                  </div>
                  <hr />
                  <div
                    id="Basic"
                    aria-labelledby="Basic"
                    data-parent="#accordionExample"
                    className="collapse"
                    style={{
                      fontSize: '1rem',
                      color: '#8c8c8c',
                    }}
                  >
                    <span className="text-dark">Billing Address</span>
                    <br />
                    {customer?.billingAddress?.state ? (
                      <>
                        {customer?.billingAddress?.attention} <br />
                        {customer?.billingAddress?.addressLine1} <br />
                        {customer?.billingAddress?.addressLine2}{' '}
                        {customer?.billingAddress?.city} <br />
                        {customer?.billingAddress?.state}{' '}
                        {customer?.billingAddress?.country} <br />
                        {customer?.billingAddress?.zipcode} <br />
                        Phone: {customer?.billingAddress?.phone} <br />
                        Fax: {customer?.billingAddress?.fax} <br />
                      </>
                    ) : (
                      <p className={'text-info'}>Not Available</p>
                    )}
                  </div>
                  {/* <div
                    style={{

                      fontSize: '1rem',
                      color: '#8c8c8c',
                    }}
                  >
                    <span className='text-dark'>Shipping Address</span>
                    <br />
                    { customer?.shippingAddress?.state ? 
                      <>
                      {customer?.shippingAddress?.attention} <br />
                      {customer?.shippingAddress?.addressLine1} <br />
                      {customer?.shippingAddress?.addressLine2} {" "}
                      {customer?.shippingAddress?.city} <br />
                      {customer?.shippingAddress?.state} {" "}
                      {customer?.shippingAddress?.country} <br />
                      {customer?.shippingAddress?.zipcode} <br />
                      Phone: {customer?.shippingAddress?.phone} <br />
                      Fax: {customer?.shippingAddress?.fax} <br />
                      </>
                    :
                      <div>
                        Not Available
                      </div>
                    }
                  </div> */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div className="float-left">
                      <button
                        type="button"
                        style={{
                          border: 'none',
                          backgroundColor: '#FFFFFF',
                          fontSize: '18px',
                        }}
                        data-toggle="collapse"
                        data-target="#Other"
                        aria-expanded="false"
                        aria-controls="Other"
                      >
                        <span style={{ color: 'black' }}>
                          <SupervisorAccountIcon />
                        </span>{' '}
                        &nbsp;&nbsp;&nbsp;&nbsp; Other Details
                      </button>
                    </div>
                    {/* <div className='float-right'>
                        <a
                          href="#"
                          // className="btn add-btn"
                          data-toggle="modal"
                          data-target="#edit_customer_other_details"
                        >
                          <EditIcon />
                        </a>
                    </div> */}
                  </div>
                  <hr />
                  <div
                    id="Other"
                    aria-labelledby="Other"
                    data-parent="#accordionExample"
                    className="collapse"
                    style={{
                      fontSize: '1rem',
                      color: '#8c8c8c',
                      marginBottom: '50px',
                    }}
                  >
                    <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      PAN No :
                      <span>&nbsp;&nbsp;&nbsp;&nbsp;{customer?.pan}</span>
                    </Stack>
                    <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      GST No :
                      <span>&nbsp;&nbsp;&nbsp;&nbsp;{customer?.gst}</span>
                    </Stack>
                    <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      Customer Type :
                      <span>
                        &nbsp;&nbsp;&nbsp;&nbsp;{customer?.customerType}
                      </span>
                    </Stack>
                    {/* <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      Payment Terms : 
                      <span>&nbsp;&nbsp;&nbsp;&nbsp;{customer?.paymentTerms}</span>
                    </Stack> */}
                    <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      Website :
                      <a href={`${customer?.website}`} target="_blank">
                        &nbsp;&nbsp;&nbsp;&nbsp;{customer?.website}
                      </a>
                      {/* <span>&nbsp;&nbsp;&nbsp;&nbsp;{customer?.website}</span> */}
                    </Stack>
                  </div>
                  <h4
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div className="float-left">
                      <button
                        type="button"
                        style={{
                          border: 'none',
                          backgroundColor: '#FFFFFF',
                          fontSize: '18px',
                        }}
                        data-toggle="collapse"
                        data-target="#Contact"
                        aria-expanded="false"
                        aria-controls="Contact"
                      >
                        <span style={{ color: 'black' }}>
                          <PhoneIcon />
                        </span>{' '}
                        &nbsp;&nbsp;&nbsp;&nbsp;Contact Details
                      </button>
                      (
                      {customer?.contactPersons[0]?.firstName
                        ? customer?.contactPersons?.length
                        : 0}
                      )
                    </div>
                    {/* <div className='float-right'>
                        <a
                          href="#"
                          // className="btn add-btn"
                          data-toggle="modal"
                          data-target="#edit_customer_person_contact"
                        >
                          <EditIcon />
                        </a>
                    </div> */}
                  </h4>
                  <hr />
                  <div
                    id="Contact"
                    aria-labelledby="Contact"
                    data-parent="#accordionExample"
                    className="collapse"
                    style={{
                      fontSize: '1rem',
                      color: '#8c8c8c',
                      marginBottom: '50px',
                    }}
                  >
                    {customer?.contactPersons?.length &&
                    customer?.contactPersons[0]?.firstName ? (
                      customer?.contactPersons?.map((pc) => (
                        <>
                          <Stack
                            direction={'row'}
                            alignItems={'center'}
                            spacing={1}
                          >
                            <Avatar
                              sx={{ bgcolor: red[400], height: 52, width: 52 }}
                            >
                              {pc.firstName?.substr(0, 1)}
                            </Avatar>
                            <Stack>
                              <div
                                style={{
                                  fontSize: '1.1rem',
                                  fontWeight: 500,
                                }}
                              >
                                <Person />
                                <span>
                                  &nbsp;&nbsp;&nbsp;&nbsp;{pc?.firstName}{' '}
                                  {pc?.lastName}
                                </span>
                                <br />
                                <EmailIcon />
                                <span>&nbsp;&nbsp;&nbsp;&nbsp;{pc?.email}</span>
                                <br />
                                {pc?.phone && (
                                  <>
                                    <PhoneIcon />
                                    <span>
                                      &nbsp;&nbsp;&nbsp;&nbsp;{pc?.phone}
                                    </span>
                                  </>
                                )}
                              </div>
                            </Stack>
                          </Stack>
                          <hr />
                        </>
                      ))
                    ) : (
                      <Stack
                        direction={'row'}
                        marginBottom={2}
                        alignItems={'flex-end'}
                      >
                        No Contacts Available
                      </Stack>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8 pl-1">
              <div className="card tab-box mb-0 mt-1">
                <div className="row user-tabs mb-1 px-1">
                  <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                    <ul className="nav nav-tabs nav-tabs-bottom">
                      <li className="nav-item">
                        <a
                          href="#activities"
                          data-toggle="tab"
                          className="nav-link active"
                        >
                          Timeline
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#customer_comment"
                          data-toggle="tab"
                          className="nav-link"
                        >
                          Comments
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#emp_trx"
                          data-toggle="tab"
                          className="nav-link"
                        >
                          Transactions
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#projects"
                          data-toggle="tab"
                          className="nav-link"
                        >
                          Interests
                        </a>
                      </li>
                    </ul>
                    <div
                      style={{
                        height: '75vh',
                        overflowY: 'auto',
                      }}
                      className="p-4 tab-content"
                    >
                      <div
                        id="activities"
                        className="pro-overview tab-pane fade show active"
                      >
                        <h3>Timeline</h3>
                        <hr />
                        <Timeline>
                          {timelineArr?.map((n) => (
                            <TimelineItem>
                              <TimelineOppositeContent>
                                <h6
                                  style={{
                                    marginTop: '16px',
                                  }}
                                  className="mb-0"
                                >
                                  <span
                                    style={{
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </span>{' '}
                                  at{' '}
                                  {new Date(n.createdAt).toLocaleTimeString()}
                                </h6>
                              </TimelineOppositeContent>
                              <TimelineSeparator>
                                <TimelineDot>
                                  <LaptopMacIcon />
                                </TimelineDot>
                                <TimelineConnector />
                              </TimelineSeparator>
                              <TimelineContent>
                                <Paper
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                  }}
                                  elevation={1}
                                  className={classes.paper}
                                >
                                  <h5>{n.timelineType}</h5>
                                  <hr
                                    style={{
                                      margin: '0px',
                                      marginBottom: '8px',
                                    }}
                                  />
                                  <p>{n.description}</p>
                                </Paper>
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                        </Timeline>
                      </div>

                      <div className="tab-pane fade show" id="customer_comment">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h3>Comments</h3>
                          <Link
                            to="#"
                            className="btn add-btn"
                            data-toggle="modal"
                            data-target="#add_customer_comment"
                          >
                            <i className="fa fa-plus" /> Add Comment
                          </Link>
                        </div>
                        <hr />
                        {/* <Invoices invoice={customer.invoices} /> */}
                        {customer?.comments.length ? (
                          customer?.comments.reverse().map((c) => (
                            <div
                              key={c._id}
                              className="list-group-item list-group-item-action flex-column align-items-start"
                            >
                              <p className="mb-1">{c?.comment}</p>
                              <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">
                                  By {c?.employee?.firstName}{' '}
                                  {c?.employee?.lastName} |{' '}
                                  <small>
                                    {c?.date.split('T')[0]}
                                    {/* | {c?.date.split("T")[1].split(".")[0]} */}
                                  </small>
                                </h5>
                                <small>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-toggle="modal"
                                    data-target="#delete_client"
                                    onClick={() => {
                                      setDelCom(c._id);
                                    }}
                                  >
                                    <DeleteOutline />
                                  </a>
                                </small>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div></div>
                        )}
                      </div>
                      {/* change this div and create table...  */}

                      <div className="tab-pane fade show" id="emp_trx">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                          }}
                        >
                          <h4>Estimates</h4>
                          <Link
                            to={{
                              pathname: `/app/sales/createestimates`,
                              state: { customerId: customer._id },
                            }}
                          >
                            <button className="btn add-btn mr-3">
                              <i className="fa fa-plus" />
                              Create
                            </button>
                          </Link>
                        </div>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Estimate No.</th>
                              <th>Plot No.</th>
                              <th>Net Amount</th>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {estimates?.map((el, id) => (
                              <tr key={id}>
                                <td>
                                  <Link
                                    to={`/app/sales/estimatesview/${el._id}`}
                                  >
                                    {el?.estimate}
                                  </Link>
                                </td>
                                <td>
                                  <Link
                                    to={`/app/projects/projects-view/${el.project}`}
                                  >
                                    {el.plot}
                                  </Link>
                                </td>
                                <td>₹ {Math.round(+el.amount)}</td>
                                <td>
                                  {new Date(el.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                  <Tag
                                    style={{
                                      marginLeft: '20px',
                                      marginTop: '10px',
                                      fontWeight: 600,
                                    }}
                                    color={
                                      el.status === 'OPEN'
                                        ? `yellow`
                                        : el.status == 'OPEN'
                                        ? 'green'
                                        : 'red'
                                    }
                                  >
                                    {el.status}
                                  </Tag>{' '}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <hr />

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                          }}
                        >
                          <h4>Invoices</h4>
                          <Link
                            to={{
                              pathname: `/app/sales/createinvoice`,
                              state: { customerId: customer._id },
                            }}
                          >
                            <button className="btn add-btn mr-3">
                              <i className="fa fa-plus" />
                              Create
                            </button>
                          </Link>
                        </div>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Invoice No.</th>
                              <th>Plot No.</th>
                              <th>Net Amount</th>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices?.map((el, id) => (
                              <tr key={id}>
                                <td>
                                  <Link
                                    to={`/app/sales/invoice-view/${el._id}`}
                                  >
                                    {el?.invoice}
                                  </Link>
                                </td>
                                <td>
                                  <Link
                                    to={`/app/projects/projects-view/${el.project}`}
                                  >
                                    {el.plot}
                                  </Link>
                                </td>
                                <td>₹ {Math.round(+el.grandTotal)}</td>
                                <td>
                                  {new Date(el.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                  <Tag
                                    style={{
                                      marginLeft: '20px',
                                      marginTop: '10px',
                                      fontWeight: 600,
                                    }}
                                    color={
                                      el.status === 'OPEN'
                                        ? `yellow`
                                        : el.status == 'PAID'
                                        ? 'green'
                                        : 'red'
                                    }
                                  >
                                    {el.status}
                                  </Tag>{' '}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <hr />

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                          }}
                        >
                          <h4>Payments Received</h4>
                          <Link
                            to={{
                              pathname: `/app/sales/record-payment`,
                              state: { customerId: customer._id },
                            }}
                          >
                            <button className="btn add-btn mr-3">
                              <i className="fa fa-plus" />
                              New Payment
                            </button>
                          </Link>
                        </div>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Payment No.</th>
                              <th>Deposit To</th>
                              <th>Amount</th>
                              <th>Date</th>
                              <th>Mode</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments?.map((el, id) => (
                              <tr key={id}>
                                <td>
                                  <Link
                                    to={`/app/sales/payment-view/${el._id}`}
                                  >
                                    {el?.paymentNumber}
                                  </Link>
                                </td>
                                <td>{el.depositTo}</td>
                                <td>₹ {Math.round(+el.paymentAmount)}</td>
                                <td>
                                  {new Date(
                                    el.paymentDate
                                  ).toLocaleDateString()}
                                </td>
                                <td>{el.paymentMode}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <hr />
                      </div>

                      <div id="projects" className="tab-pane fade">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <h4>Interests</h4>
                          <div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setAddProjectType('Plot');
                                setAddProject(true);
                              }}
                              className="btn btn-primary mr-2"
                            >
                              Add Plotting
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setAddProjectType('Housing');
                                setAddProject(true);
                              }}
                              className="btn btn-primary"
                            >
                              Add Housing
                            </button>
                          </div>
                        </div>
                        <hr />
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Project</TableCell>
                                <TableCell>Plot</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {customer?.projects?.map((project, id) => (
                                <LeadProfileIntrestTable
                                  key={id}
                                  isCustomer={true}
                                  plotId={customer.plots[id]}
                                  item={customer}
                                  project={project}
                                  leadStatus={leadStatus}
                                  updateLeadInterest={updateLeadInterest}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>

                      <div
                        className="tab-pane fade show"
                        // className="tab-pane fade show active"
                        id="emp_trx"
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h3>Transaction</h3>
                        </div>
                        <hr />
                      </div>
                      <div
                        id="emp_doc"
                        className="pro-overview tab-pane fade show"
                      >
                        <hr />
                        {/* <DocumentsPane documents={documents} /> */}
                      </div>
                      <div className="tab-pane fade show" id="emp_project">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h3>Project</h3>
                          <Link
                            to="#"
                            className="btn add-btn"
                            data-toggle="modal"
                            data-target="#add_projectmodal"
                          >
                            <i className="fa fa-plus" /> Add Project
                          </Link>
                        </div>
                        <hr />
                        {/* <Invoices invoice={customer.invoices} /> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Upload Certificate Modal */}
          <div
            id="upload_docume nt_modal"
            className="modal custom-modal fade"
            role="dialog"
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Upload Certificate</h5>
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
                  {/* <form>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Document</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) =>
                          handleDocumentChange(e.target.files[0] || null)
                        }
                        style={{ border: 'none' }}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        className="form-control"
                        type="text"
                        onChange={(e) =>
                          setNewUpload({
                            ...newUpload,
                            description: e.target.value,
                          })
                        }
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                </div>
                <div className="submit-section">
                  <button
                    className="btn btn-primary submit-btn"
                    onClick={handleDocumentsSubmit}
                    disabled={!isAdmin}
                  >
                    Submit
                  </button>
                </div>
              </form> */}
                </div>
              </div>
            </div>
          </div>
          {/* Comment modal */}
          <div
            className="modal custom-modal fade tab"
            id="add_customer_comment"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-header">
                    <h3>Add a comment</h3>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="col-md-12">
                    <input
                      value={commentToAdd}
                      className="form-control"
                      type="text"
                      onChange={(e) => setCommentToAdd(e.target.value)}
                    />
                  </div>
                  <div className="submit-section">
                    <button
                      onClick={() => handleCommentAdd()}
                      className="btn btn-primary submit-btn"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Comment modal */}
          {/* /Upload Certificate Modal */}
          {/* Address modal */}
          {customer?.billingAddress && customer?.shippingAddress ? (
            <EditCustomerAddress
              refreshData={refreshData}
              customerData={customer}
              editCustomerId={customer._id}
              bAddress={customer.billingAddress}
              sAddress={customer.shippingAddress}
            />
          ) : (
            <></>
          )}
          {/* Address modal */}
        </div>
      )}

      {/* Delete Comment  */}
      <div className="modal custom-modal fade" id="delete_client" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Customer</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a
                      href=""
                      onClick={(e) => {
                        e.preventDefault();
                        deleteComment();
                      }}
                      className="btn btn-primary continue-btn"
                    >
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
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

      <Backdrop
        open={addProject}
        style={{ zIndex: '9999' }}
        onClick={() => {
          setAddProject(false);
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              width: '75%',
              height: '90%',
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '30px',
              position: 'relative',
            }}
          >
            <h4>Select Project</h4>
            <select
              value={selectedProject?._id || ''}
              onChange={(e) => {
                setSelectedProject(
                  projects.filter((p) => p._id === e.target.value)[0]
                );
                setSelectedPlot(null);
              }}
              className="custom-select"
            >
              <option hidden value=""></option>
              {projects
                ?.filter((p) => p?.type == addProjectType)
                .map((project) => (
                  <option value={project._id}>{project.name}</option>
                ))}
            </select>
            <br />
            <h4
              style={{
                marginTop: '20px',
              }}
            >
              Select {addProjectType}
            </h4>
            <select
              value={selectedPlot?._id || ''}
              onChange={(e) => {
                setSelectedPlot(
                  selectedProject?.subPlots?.filter(
                    (p) => p._id === e.target.value
                  )[0]
                );
              }}
              className="custom-select"
            >
              <option hidden value=""></option>
              {selectedProject?.subPlots?.map((plot) => (
                <option value={plot._id}>{plot.name}</option>
              ))}
            </select>
            <div
              style={{
                height: '55%',
                marginTop: '20px',
                overflowY: 'scroll',
              }}
            >
              {!selectedProject?.name && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#DCDCE1',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <h2>
                    <b>No Project Selected</b>
                  </h2>
                </div>
              )}
              {selectedProject?.name &&
                selectedProject.subPlots.length === 0 && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#DCDCE1',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <h2>
                      <b>No Layout for this project</b>
                    </h2>
                  </div>
                )}
              <div
                style={{
                  position: 'relative',
                }}
              >
                <img ref={layoutMapRef} src={selectedProject?.layout} />
                {selectedPlot?.name && selectedPlot?.component && (
                  <InactiveTooltip title={selectedPlot.name}>
                    <div
                      className="pin"
                      style={{
                        position: 'absolute',
                        top: JSON.parse(selectedPlot.component.y) + 'px',
                        left: 7 + JSON.parse(selectedPlot.component.x) + 'px',
                        background: '#EF473A',
                      }}
                    ></div>
                  </InactiveTooltip>
                )}
                {selectedPlot?.name && selectedPlot?.component && (
                  <div
                    id="selected-plot"
                    style={{
                      position: 'absolute',
                      top: 3 + JSON.parse(selectedPlot.component.y) + 'px',
                      left: 3 + JSON.parse(selectedPlot.component.x) + 'px',
                      width: '22%',
                      cursor: 'move',
                      zIndex: '9999',
                      backgroundColor: 'white',
                      padding: '30px',
                      borderTop: '1px solid #E7E7E7',
                      boxShadow:
                        'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px',
                    }}
                  >
                    <h4
                      style={{
                        textAlign: 'center',
                      }}
                    >
                      <b>Details</b>
                    </h4>
                    <h4>
                      <br />
                      <b>Name:</b> {selectedPlot.name}
                    </h4>
                    <h4>
                      <b>Description:</b>{' '}
                      {selectedPlot.description
                        ? selectedPlot.description
                        : 'No Description'}
                    </h4>
                    <h4>
                      <b>Size:</b> {selectedPlot.area} Sq Ft
                    </h4>
                    <h4>
                      <b>Price:</b> ₹{' '}
                      {selectedPlot.cost ||
                        selectedPlot.area * selectedProject.costPerSqFeet}
                    </h4>
                    <h4>
                      <b>Interested leads:</b>{' '}
                      {selectedPlot.leadsInfo?.length || 0}
                    </h4>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex my-2">
              <button
                className="btn btn-secondary mr-2"
                onClick={(e) => {
                  setSelectedPlot(null);
                  setSelectedProject(null);
                  setAddProject(false);
                  setLeadInterest([]);
                  setIsLoading(false);
                  refreshData(customer._id);
                }}
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!selectedPlot.name || !selectedProject.name)
                    return toast.error('Please select a project and plot');
                  if (
                    selectedPlot.leadsInfo.some(
                      (l) => l?.customer === customer?._id
                    )
                  )
                    return toast.error(
                      'Customer is already interested in this plot'
                    );
                  selectedPlot.leadsInfo = [
                    ...selectedPlot.leadsInfo,
                    {
                      customer: customer?._id,
                      status: 'Prospect',
                      isCustomer: true,
                      ...(customer?.lead && { lead: customer.lead }),
                    },
                  ];
                  selectedProject.subPlots[
                    selectedProject.subPlots.findIndex(
                      (l) => l._id === selectedPlot._id
                    )
                  ] = selectedPlot;
                  if (
                    !selectedProject.leadcustomers.some(
                      (lead) => lead?._id === customer?._id
                    )
                  )
                    selectedProject.leadcustomers = [
                      ...selectedProject.leadcustomers,
                      customer?._id,
                    ];
                  if (
                    !customer?.project.some(
                      (p) => p?._id === selectedProject?._id
                    )
                  )
                    customer.project = [
                      ...customer?.project,
                      selectedProject,
                    ].map((p) => p?._id);
                  toast
                    .promise(
                      Promise.all([
                        httpService.put(
                          `/customer/${customer._id}/add-intrest`,
                          {
                            ...customer,
                            plots: [...customer.plots, selectedPlot._id],
                          }
                        ),
                        httpService.put(
                          `/project/${selectedProject._id}`,
                          selectedProject
                        ),
                      ]),
                      {
                        success: 'Customer added to project',
                        error: 'Error adding Customer to project',
                        pending: 'Adding Customer to project',
                      }
                    )
                    .then(() => {
                      setSelectedPlot(null);
                      setSelectedProject(null);
                      setAddProject(false);
                      setLeadInterest([]);
                      setIsLoading(false);
                      refreshData(customer._id);
                      fetchEstimates();
                    });
                }}
                className="btn btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Backdrop>
    </div>
  );
};
export default CustomerProfile;
