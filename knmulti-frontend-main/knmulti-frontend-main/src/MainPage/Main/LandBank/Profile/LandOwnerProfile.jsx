/**
 * TermsCondition Page
 */
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { Table } from 'react-bootstrap';
import 'antd/dist/antd.css';
import '../../../antdstyle.css';
import httpService from '../../../../lib/httpService';
import Swal from 'sweetalert2';
import { Backdrop, makeStyles, Paper } from '@material-ui/core';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import { red } from '@mui/material/colors';
import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';
import PhoneIcon from '@mui/icons-material/PhoneOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import AddressIcon from '@mui/icons-material/LocationOnOutlined';
import {
  AccountBalanceWallet,
  Add,
  DeleteOutline,
  Person,
  UploadFileOutlined,
  ViewAgenda,
} from '@mui/icons-material';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@material-ui/lab';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import {
  useLocation,
  useParams,
} from 'react-router-dom/cjs/react-router-dom.min';
import DocsModal from '../modals/DocsModal';
import FileUploadService from '../../../Pages/Profile/FileUploadService';
import { casteData, nationalityData, religionData } from '../AddLandBank';
import { createNotify } from '../../../../features/notify/notifySlice';
import { Tag } from 'antd';

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

const LandOwnerProfile = () => {
  const [owner, setOwner] = useState(null);
  const [lands, setLands] = useState([]);
  const [trx, setTrx] = useState([]);
  const user = useSelector((state) => state?.authentication.value.user);
  const [isLoading, setIsLoading] = useState(false);
  const [commentToAdd, setCommentToAdd] = useState('');
  const [showDocsModal, setShowDocsModal] = useState({ modal: false, id: '' });
  const [landDocs, setLandDocs] = useState([]);
  const [filesToupload, setFilesToupload] = useState([]);
  const [addlandDetails, setAddlandDetails] = useState(null);
  const [ownerData, setOwnerData] = useState(null); 
  const [bills, setBills] = useState([]);
  console.log('bills =>',bills);
  const [landToDelete, setLandToDelete] = useState('');
  const classes = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    if (owner) {
      let data = {
        name: owner?.name,
        billAddress: owner?.billAddress,
        caste: owner?.caste,
        nationality: owner?.nationality,
        religion: owner?.religion,
        phone: owner?.phone || 0,
        email: owner?.email || '',
        dob: owner?.dob,
      };
      setOwnerData(data);
    }
  }, [owner]);
  useEffect(async () => {
    setIsLoading(true);
    try {
      let bills = await httpService.get(
        `/vendortrx/getvendorbills?vendorId=${id}`
      );
      setBills(bills.data);
      setIsLoading(false);
    } catch (err) {
      toast.error('error while fetching bills');
      setIsLoading(false);
    }
    try {
      let res = await httpService.get(
        `/vendortrx/getvendorbillpayment?vendorId=${id}`
      );
      setTrx(res.data.reverse());
    } catch (err) {
      toast.error('error while getting Transections !');
    }
  }, []);

  useEffect(async () => {
    try {
      let res = await httpService.get(`/landbank?owner=${id}`);
      let newData = res?.data?.map((land) => {
        let landData = {
          _id: land._id,
          land_cost: land.land_cost,
          owner_id: land.owner?._id,
          land_area: land?.land_area,
          land_type: land.land_type,
          plot_no: land.plot_no,
          landmark: land.landmark,
          project_created: land.project_created,
          files: land.files,
        };
        return landData;
      });
      setLands(newData.reverse());
    } catch (err) {
      console.log(err.response);
      toast.error('error while getting Land Data');
    }
    try {
      let res = await httpService.get(`/vendor/${id}`);
      setOwner(res.data);
    } catch (err) {
      console.log('error =>', err);
    }
  }, []);

  useEffect(async () => {
    if (filesToupload.length && showDocsModal.id) {
      try {
        let res = await httpService.put(
          `/landbank/add-docs/${showDocsModal.id}`,
          { files: filesToupload }
        );
        let updatedLand = lands.map((el) => {
          if (el._id === res.data?._id) {
            return res.data;
          } else {
            return el;
          }
        });
        setLands(updatedLand);
        toast.success('Documents added successfully .');
        setFilesToupload([]);
        setShowDocsModal({ ...showDocsModal, id: '' });
      } catch (err) {
        console.log('error =>', err);
        toast.error('Something went wrong');
      }
    }
  }, [filesToupload, showDocsModal]);

  const checkBillExist = (id) => {
    let billExist = bills?.filter((bill) => bill.landId == id);
    if (billExist.length) {
      return billExist[0];
    } else {
      return null;
    }
  };

  const capatilize = (str) => {
    let wordArr = str?.trim()?.split(' ');
    let capital = '';
    for (let i = 0; i < wordArr?.length; i++) {
      for (let j = 0; j < wordArr[i].length; j++) {
        if (j == 0) {
          capital += ' ' + wordArr[i][j].toUpperCase();
        } else {
          capital += wordArr[i][j];
        }
      }
    }
    return capital;
  };

  const handleCommentAdd = async () => {
    try {
      let newComment = {
        comment: commentToAdd,
        date: new Date().toISOString(),
        createdBy: user._id,
      };
      let res = await httpService.put(`/vendor/add-comment/${id}`, newComment);
      toast.success('Comment Added Successfully');
      setOwner(res.data);
    } catch (err) {
      toast.error('Error while Adding the comment');
    }
    setCommentToAdd('');
  };

  const deleteComment = async (comment_id) => {
    try {
      let res = await httpService.put(`/vendor/remove-comment/${id}`, {
        comment_id,
      });
      setOwner(res.data);
      toast.success('Comment Deleted Successfully');
    } catch (err) {
      toast.error('Error while Deleting the comment');
    }
  };

  const handleUploadDocs = async () => {
    closeModal();
    if (landDocs.length) {
      let filesArr = [];
      toast.info('Uploading Files... \n Please wait...');
      for (const el of landDocs) {
        if (el.file) {
          try {
            const res = await FileUploadService.upload(el.file);
            let newDta = { name: el.name, file: res.data?.filePath };
            filesArr.push(newDta);
          } catch (error) {
            toast.error('Failed to upload files');
          }
        }
      }
      setFilesToupload(filesArr);
      if (filesArr.length) {
        toast.success('All Files Uploaded.. \n Proceed to add Land');
      }
    } else {
      toast.error('Please Add Atleast One File To Upload');
    }
  };

  const handleAddFiles = (val) => {
    setLandDocs([...landDocs, val]);
  };
  const handleAddDocs = (row) => {
    setShowDocsModal({ modal: true, id: row._id });
  };

  const handleDelete = (ind) => {
    let filtredData = landDocs.filter((el, id) => id !== ind);
    setLandDocs(filtredData);
  };

  const closeModal = () => {
    setShowDocsModal({ ...showDocsModal, modal: false });
  };
  const handleLandDetails = (e) => {
    setAddlandDetails({ ...addlandDetails, [e.target.name]: e.target.value });
  };
  const handleChangeFiles = (e) => {
    let newDoc = { name: e.target.name, file: e.target.files[0] };
    let allOthers = landDocs.filter((el) => el.name !== e.target.name);
    setLandDocs([...allOthers, newDoc]);
  };

  const handleAddLand = async (data, e) => {
    e.preventDefault();
    let final = { ...data, files: filesToupload, owner: id };
    try {
      let res = await httpService.post(`/landbank`, final);
      setLands([res.data, ...lands]);
      toast.success('Land Added Successfully');
      dispatch(
        createNotify({
          notifyHead: `Land ${res?.data?.landmark}`,
          notifyBody: `Land ${res?.data?.landmark}`,
          createdBy: user._id,
        })
      );
    } catch (err) {
      toast.error('Error While Adding Land');
    }
  };
  const handleOwnerDetails = (e) => {
    setOwnerData({ ...ownerData, [e.target.name]: e.target.value });
  };

  const handleUpdateOwner = async (data) => {
    try {
      let res = await httpService.put(`/vendor`, data);
      setOwner(res.data);
      toast.success('Owner Data Updated Successfully..');
      dispatch(
        createNotify({
          notifyHead: `Land Owner Details Updated`,
          notifyBody: `Land Owner Details Updated`,
          createdBy: user._id,
        })
      );
    } catch (err) {
      toast.error('Error While Updating Land Owner');
    }
  };

  const handleDeleteLand = async (landId) => {
    toast.info('Deleting Land..');
    try {
      await httpService.delete(`/landbank/${landId}`);
      toast.success('Land Deleted Successfully.');
      let updatedLands = lands.filter((el) => el._id !== landId);
      setLands(updatedLands);
      setLandToDelete('');
    } catch (err) {
      toast.error('Error While Deleting Land');
      setLandToDelete('');
    }
  };
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Land Owner Profile </title>
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
                  Profile / {capatilize(owner?.firstName)}{' '}
                  {capatilize(owner?.lastName)}
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/app/land-bank">LandBank</Link>
                  </li>
                  <li className="breadcrumb-item active">profile</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="card mb-0">
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <Stack justifyContent={'space-between'} direction={'row'}>
                    <Stack direction={'row'} alignItems={'center'} spacing={1}>
                      <Avatar
                        sx={{
                          bgcolor: red[400],
                          height: 52,
                          width: 52,
                          margin: '10px',
                        }}
                      >
                        {owner?.firstName[0]?.toUpperCase()}
                        {owner?.lastName[0]?.toUpperCase()}
                      </Avatar>
                      <Stack>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 500,
                          }}
                        >
                          <Person sx={{ margin: '10px' }} />
                          <span>
                            &nbsp;&nbsp;&nbsp;&nbsp;{capatilize(owner?.name)}
                          </span>
                          <span
                            style={{ marginLeft: '10px' }}
                            className={'badge bg-inverse-info'}
                          >
                            LAND OWNER
                          </span>
                          <br />
                          <EmailIcon sx={{ margin: '10px' }} />
                          <span>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {owner?.email || 'example@email.com'}
                          </span>
                          <br />
                          <PhoneIcon sx={{ margin: '10px' }} />
                          <span>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {owner?.phone || '-'}
                          </span>
                          {/* {state?.phone && <span>{state?.phone}</span>} */}
                          <br />
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
                        <div className="col-auto float-right ml-auto">
                          <p
                            className="btn add-btn"
                            data-toggle="modal"
                            data-target="#update_owner"
                          >
                            <EditIcon /> Edit
                          </p>
                        </div>
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
                    <span className="text-dark">Full Address : </span>
                    <br />
                    <>
                      {owner?.billAddress || 'Not Available'} <br />
                    </>
                  </div>
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
                      Date Of Birth :
                      <span>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {new Date(owner?.dob).toLocaleDateString()}
                      </span>
                    </Stack>
                    <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      Caste :<span>&nbsp;&nbsp;&nbsp;&nbsp;{owner?.caste}</span>
                    </Stack>
                    <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      Religion :
                      <span>&nbsp;&nbsp;&nbsp;&nbsp;{owner?.religion}</span>
                    </Stack>
                    <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      Nationality :
                      <span>&nbsp;&nbsp;&nbsp;&nbsp;{owner?.nationality}</span>
                    </Stack>
                    <Stack
                      direction={'row'}
                      marginBottom={2}
                      alignItems={'flex-end'}
                    >
                      Website :
                      <a href={`${owner?.website}`} target="_blank">
                        &nbsp;&nbsp;&nbsp;&nbsp;{owner?.website}
                      </a>
                      <span>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {owner?.website || 'Not Available'}
                      </span>
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
                    </div>
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
                    <>
                      <Stack
                        direction={'row'}
                        alignItems={'center'}
                        spacing={1}
                      >
                        <Stack>
                          <div
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 500,
                            }}
                          >
                            <Person />
                            <span>&nbsp;&nbsp;&nbsp;&nbsp;{owner?.name}</span>
                            <br />
                            <EmailIcon />
                            <span>
                              &nbsp;&nbsp;&nbsp;&nbsp;{owner?.email || '-'}
                            </span>
                            <br />
                            <>
                              <PhoneIcon />
                              <span>
                                &nbsp;&nbsp;&nbsp;&nbsp;{owner?.phone || '-'}
                              </span>
                            </>
                          </div>
                        </Stack>
                      </Stack>
                      <hr />
                    </>
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
                          href="#all-trx"
                          data-toggle="tab"
                          className="nav-link"
                        >
                          Transections
                        </a>
                      </li>

                      <li className="nav-item">
                        <a
                          href="#all-lands"
                          data-toggle="tab"
                          className="nav-link"
                        >
                          Lands
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
                          {owner?.timeline?.map((n, id) => (
                            <TimelineItem key={id}>
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
                          <p
                            className="btn add-btn"
                            data-toggle="modal"
                            data-target="#add_customer_comment"
                          >
                            <i className="fa fa-plus" /> Add Comment
                          </p>
                        </div>
                        <hr />
                        {owner?.comments?.length ? (
                          owner?.comments?.reverse().map((c, id) => (
                            <div
                              key={id}
                              className="list-group-item list-group-item-action flex-column align-items-start"
                            >
                              <p className="mb-1">{c?.comment}</p>
                              <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">
                                  By |{' '}
                                  <small>
                                    {c.createdBy?.firstName}{' '}
                                    {c.createdBy.lastName}
                                  </small>
                                </h5>
                                <small>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-toggle="modal"
                                    data-target="#delete_client"
                                    onClick={() => {
                                      deleteComment(c?._id);
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

                      <div className="tab-pane fade show" id="all-lands">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h4>All Lands</h4>
                          <p
                            className="btn add-btn"
                            data-toggle="modal"
                            data-target="#add_land"
                          >
                            <i className="fa fa-plus " /> Add Land
                          </p>
                        </div>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Landmark</th>
                              <th>Area</th>
                              <th>Type</th>
                              <th>Documents</th>
                              <th>Bills</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lands?.map((el, id) => (
                              <tr key={id}>
                                <td>{el?.landmark}</td>
                                <td>{el?.land_area}(Acres)</td>
                                <td>{el?.land_type}</td>
                                <td>
                                  {el.files.map((elem, id) => (
                                    <ul key={id}>
                                      <li>
                                        <a href={elem.file} target="_blank">
                                          {elem.name}
                                        </a>
                                      </li>
                                    </ul>
                                  ))}
                                  <li
                                    onClick={() => handleAddDocs(el)}
                                    style={{
                                      color: 'blue',
                                      textDecoration: 'none',
                                      paddingLeft: '20px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <strong>Add More</strong>
                                  </li>
                                </td>
                                <td>
                                  {checkBillExist(el._id) ? (
                                    <Link
                                      to={`/app/purchase/billinfo/${
                                        checkBillExist(el._id)._id
                                      }`}
                                    >
                                      {checkBillExist(el._id).billNo}{' '}
                                    </Link>
                                  ) : (
                                    <Link
                                      to={{
                                        pathname: `/app/purchase/createbill`,
                                        state: {
                                          data: el,
                                          isOwner: true,
                                          owner: {
                                            ...ownerData,
                                            id: owner?._id,
                                          },
                                        },
                                      }}
                                      style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                        paddingLeft: '20px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <strong>Create</strong>
                                    </Link>
                                  )}
                                </td>
                                {checkBillExist(el._id) ? (
                                  <td
                                    className="ant-btn-secondary"
                                    onClick={() =>
                                      toast.error('Please Delete Bill First')
                                    }
                                  >
                                    <i className="fa fa-trash-o m-r-5" />
                                  </td>
                                ) : (
                                  <td
                                    onClick={() => setLandToDelete(el._id)}
                                    className="ant-btn-dangerous"
                                    data-toggle="modal"
                                    data-target="#delete_land"
                                  >
                                    <i
                                      style={{ cursor: 'pointer' }}
                                      className="fa fa-trash-o m-r-5"
                                    />
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <hr />
                      </div>

                      <div className="tab-pane fade show" id="all-trx">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h4>All Transections</h4>
                        </div>
                        <h4>Bills</h4>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Bill No.</th>
                              <th>Net Amount</th>
                              <th>Paid Amount</th>
                              <th>Bill Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bills?.map((el, id) => (
                              <tr key={id}>
                                <td>
                                  <Link to={`/app/purchase/billinfo/${el._id}`}>
                                    {el?.billNo}
                                  </Link>
                                </td>
                                <td>₹ {Math.round(+el.total)}</td>
                                <td>₹ {Math.round(+el.payments)}</td>
                                <td>
                                  <Tag
                                    style={{
                                      marginLeft: '20px',
                                      marginTop: '10px',
                                      fontWeight: 600,
                                    }}
                                    color={
                                      el.status === 'PARTIAL'
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
                        <h4>Payments</h4>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Payment No.</th>
                              <th>Paid Amount</th>
                              <th>Payment Mode</th>
                              <th>Payment Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trx?.map((el, id) => (
                              <tr key={id}>
                                <td>
                                  <Link
                                    to={`/app/purchase/paymentinfo/${el._id}`}
                                  >
                                    {el?.paymentNo}
                                  </Link>
                                </td>
                                <td>₹ {el.amountPaid}</td>
                                <td>{el.paymentMode}</td>
                                <td>
                                  {new Date(el.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <hr />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="modal custom-modal fade" id="add_land">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Add Land In {owner?.name}'s Landbank </h3>

                <h4 style={{ textAlign: 'left' }}>Land Details</h4>
                <div
                  style={{
                    paddingLeft: '20px',
                    borderLeft: '1px solid #ACACAC',
                  }}
                >
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Land Type (Kissam) </label>
                        <span className="text-danger">*</span>
                        <select
                          className="custom-select"
                          name="land_type"
                          value={addlandDetails?.land_type}
                          onChange={handleLandDetails}
                        >
                          <option value="">select Kisam</option>
                          <option value="Abadi lands">Abadi lands</option>
                          <option value="Non irrigated">Non irrigated</option>
                          <option value="Water bodies">Water bodies</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Land Area <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="land_area"
                          placeholder="In Acres"
                          value={addlandDetails?.land_area}
                          onChange={handleLandDetails}
                          required
                          min={0}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Land Cost (total)
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="amount in ₹"
                          name="land_cost"
                          value={addlandDetails?.land_cost}
                          onChange={handleLandDetails}
                          required
                          min={0}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Mouza</label>
                        <span className="text-danger">*</span>
                        <input
                          required
                          type="text"
                          className="form-control"
                          name="mouza"
                          placeholder="Mouza Name"
                          value={addlandDetails?.mouza}
                          onChange={handleLandDetails}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Landmark</label>
                        <span className="text-danger">*</span>
                        <input
                          required
                          type="text"
                          className="form-control"
                          name="landmark"
                          placeholder="Area Name"
                          value={addlandDetails?.landmark}
                          onChange={handleLandDetails}
                          min={0}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Plot No <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="plot_no"
                          value={addlandDetails?.plot_no}
                          onChange={handleLandDetails}
                          min={0}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Chaka No</label>
                        <span className="text-danger">*</span>
                        <input
                          type="number"
                          className="form-control"
                          name="chakka_no"
                          value={addlandDetails?.chaka_no}
                          onChange={handleLandDetails}
                          min={0}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Khata No</label>
                        <span className="text-danger">*</span>
                        <input
                          type="number"
                          className="form-control"
                          name="khata_no"
                          value={addlandDetails?.khata_no}
                          onChange={handleLandDetails}
                          min={0}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group">
                        <div>
                          <label htmlFor="">Remarks</label>
                          <textarea
                            name="remark"
                            id=""
                            cols="100"
                            rows="2"
                            className="form-control"
                            value={addlandDetails?.remark}
                            onChange={handleLandDetails}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <h4 style={{ textAlign: 'left' }}>Land Documents</h4>
                <div
                  style={{
                    paddingLeft: '20px',
                    borderLeft: '1px solid #ACACAC',
                  }}
                >
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Sale Dead ( P O A )
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="Sale_Dead"
                          onChange={handleChangeFiles}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Purchase Agreement :
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="Purchase_Agreement"
                          onChange={handleChangeFiles}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          EC:<span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="EC"
                          onChange={handleChangeFiles}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Mutation<span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="Mutation"
                          onChange={handleChangeFiles}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Conversion<span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="Conversion"
                          onChange={handleChangeFiles}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Legal Heir<span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="Legal_Heir"
                          onChange={handleChangeFiles}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      {filesToupload.length ? (
                        <p
                          className="form-control"
                          style={{
                            background: '#6484A3',
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '16px',
                            textAlign: 'center',
                            borderRadius: '14px',
                            cursor: 'no-drop',
                          }}
                        >
                          Upload All Documents{' '}
                        </p>
                      ) : (
                        <p
                          className="form-control"
                          style={{
                            background: '#009efb',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '16px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: '14px',
                          }}
                          onClick={handleUploadDocs}
                        >
                          Upload All Documents
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {filesToupload.length ? (
                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <a
                        href=""
                        onClick={(e) => handleAddLand(addlandDetails, e)}
                        className="btn btn-primary continue-btn"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        Add Land
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <a
                        href=""
                        onClick={(e) => {}}
                        className="btn btn-primary continue-btn"
                        style={{ background: '#947B7C', cursor: 'no-drop' }}
                      >
                        Add Land
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal custom-modal fade" id="update_owner">
        <div className="modal-dialog modal-lg modal-dialog-centered ">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Update Land-Owner Details</h3>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={ownerData?.name}
                      onChange={handleOwnerDetails}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="email"
                      value={ownerData?.email}
                      onChange={handleOwnerDetails}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      maxLength="10"
                      className="form-control"
                      name="phone"
                      value={ownerData?.phone}
                      onChange={handleOwnerDetails}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="nationality">Nationality</label>
                  <span className="text-danger">*</span>
                  <div className="form-group">
                    <select
                      required
                      className="custom-select"
                      name="nationality"
                      value={ownerData?.nationality}
                      onChange={handleOwnerDetails}
                    >
                      {nationalityData?.map((el) => (
                        <option key={el.id} value={el.value}>
                          {el.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <label htmlFor="religion">Religion</label>
                  <span className="text-danger">*</span>
                  <div className="form-group">
                    <select
                      required
                      className="custom-select"
                      name="religion"
                      value={ownerData?.religion}
                      onChange={handleOwnerDetails}
                    >
                      {religionData?.map((el) => (
                        <option key={el.id} value={el.value}>
                          {el.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <label htmlFor="caste">Caste</label>
                  <span className="text-danger">*</span>
                  <div className="form-group">
                    <select
                      required
                      className="custom-select"
                      name="caste"
                      value={ownerData?.caste}
                      onChange={handleOwnerDetails}
                    >
                      {casteData?.map((el) => (
                        <option key={el.id} value={el.value}>
                          {el.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-8">
                  <div className="form-group">
                    <label>
                      Address <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="billAddress"
                      id=""
                      cols="100"
                      rows="2"
                      className="form-control"
                      value={ownerData?.billAddress}
                      onChange={handleOwnerDetails}
                    ></textarea>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Date of Birth (dob) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="dob"
                      value={ownerData?.dob}
                      onChange={handleOwnerDetails}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="submit-section float-left">
                  <button
                    className="btn btn-secondary submit-btn"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    Cencel
                  </button>
                  <button
                    onClick={() => handleUpdateOwner(ownerData)}
                    className="btn btn-primary submit-btn"
                    style={{ marginLeft: '20px' }}
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal custom-modal fade tab"
        id="delete_land"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Are You Sure to Delete Land ?</h3>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="submit-section">
                <button
                  onClick={() => handleDeleteLand(landToDelete)}
                  className="btn btn-primary submit-btn"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  Delete
                </button>
                <button
                  className="btn btn-secondary submit-btn m-l-5"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <Backdrop
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
                  projects?.filter((p) => p._id === e.target.value)[0]
                );
                setSelectedPlot(null);
              }}
              className="custom-select"
            >
              <option hidden value=""></option>
              {projects?.filter((p) => p?.type == addProjectType)?.map((project) => (
                  <option value={project?._id}>{project?.name}</option>
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
                <option value={plot?._id}>{plot?.name}</option>
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
                selectedProject.subPlots?.length === 0 && (
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
                  <InactiveTooltip title={selectedPlot?.name}>
                    <div
                      className="pin"
                      style={{
                        position: 'absolute',
                        top: JSON.parse(selectedPlot?.component.y) + 'px',
                        left: 7 + JSON.parse(selectedPlot?.component.x) + 'px',
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
                      top: 3 + JSON.parse(selectedPlot?.component.y) + 'px',
                      left: 3 + JSON.parse(selectedPlot?.component.x) + 'px',
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
                      <b>Name:</b> {selectedPlot?.name}
                    </h4>
                    <h4>
                      <b>Description:</b>{' '}
                      {selectedPlot?.description
                        ? selectedPlot?.description
                        : 'No Description'}
                    </h4>
                    <h4>
                      <b>Size:</b> {selectedPlot?.area} Sq Ft
                    </h4>
                    <h4>
                      <b>Price:</b> ₹{' '}
                      {selectedPlot?.cost ||
                        selectedPlot?.area * selectedProject?.costPerSqFeet}
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
                  setIsLoading(false);
                  refreshData(state?._id);
                }}
              >
                Cancel
              </button>

              <button
                style={{
                  marginTop: '3%',
                }}
                onClick={async () => {
                  if (!selectedPlot.name || !selectedProject.name)
                    return toast.error('Please select a project and plot');
                  if (
                    selectedPlot.leadsInfo.some(
                      (l) => l?.state === state?._id
                    )
                  )
                    return toast.error(
                      'Customer is already interested in this plot'
                    );
                  selectedPlot.leadsInfo = [
                    ...selectedPlot.leadsInfo,
                    {
                      state: state?._id,
                      status: 'New Lead',
                      isCustomer: true,
                    },
                  ];
                  selectedProject.subPlots[
                    selectedProject.subPlots.findIndex(
                      (l) => l._id === selectedPlot._id
                    )
                  ] = selectedPlot;
                  if (
                    !selectedProject.leadcustomers.some(
                      (lead) => lead?._id === state?._id
                    )
                  )
                    selectedProject.leadcustomers = [
                      ...selectedProject.leadcustomers,
                      state?._id,
                    ];
                  if (
                    !state?.project.some(
                      (p) => p?._id === selectedProject?._id
                    )
                  )
                    state?.project = [
                      ...state?.project,
                      selectedProject,
                    ].map((p) => p?._id);
                  toast
                    .promise(
                      Promise.all([
                        httpService.put(`/state/${state?._id}`, {
                          ...state,
                        }),
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
                      setIsLoading(false);
                      refreshData(state?._id);
                    });
                }}
                className="btn btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Backdrop>  */}

      {showDocsModal.modal && (
        <DocsModal
          data={landDocs}
          closeModal={closeModal}
          handleUploadDocs={handleUploadDocs}
          handleAddFiles={handleAddFiles}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
};
export default LandOwnerProfile;
