import React, { useState } from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import httpService from '../../lib/httpService';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { grey } from '@mui/material/colors';

import { Empty } from 'antd';

const AllStatus = () => {
  const [prospectList, setprospectList] = useState([]);
  const [siteVisitList, setsiteVisitList] = useState([]);
  const [discussionList, setdiscussionList] = useState([]);
  const [negotiationsList, setnegotiationsList] = useState([]);
  const [wonList, setwonList] = useState([]);
  const [lostList, setlostList] = useState([]);
  const [bookingList, setbookingList] = useState([]);
  const [registrationList, setregistrationList] = useState([]);

  const [data, setData] = useState([]);

  const fetchAllStatus = async () => {
    const { data } = await httpService.get('/project/allstatus');
    setData(data);

    const prospect = await data.filter(
      (d) => d?.leadType == 'New Lead' && (d?.lead.lId || d?.customer.cId)
    );
    setprospectList(prospect);
    // const id = prospect[0].customer.cId;
    // const res = await httpService.get('/customer/' + id);
    // console.log(res, 'res');
    // console.log(res.data.phone);
    const siteVisit = await data.filter(
      (d) => d?.leadType == 'Site Visit' && (d?.lead.lId || d?.customer.cId)
    );
    setsiteVisitList(siteVisit);
    const discussion = await data.filter(
      (d) => d?.leadType == 'Discussion' && (d?.lead.lId || d?.customer.cId)
    );
    setdiscussionList(discussion);
    const negotiations = await data.filter(
      (d) => d?.leadType == 'Negotiations' && (d?.lead.lId || d?.customer.cId)
    );
    setnegotiationsList(negotiations);
    const won = await data.filter(
      (d) => d?.leadType == 'Won' && (d?.lead.lId || d?.customer.cId)
    );
    setwonList(won);
    const lost = await data.filter(
      (d) => d?.leadType == 'Lost' && (d?.lead.lId || d?.customer.cId)
    );
    setlostList(lost);
    const booking = await data.filter(
      (d) => d?.leadType == 'Booking' && (d?.lead.lId || d?.customer.cId)
    );
    setbookingList(booking);
    const registration = await data.filter(
      (d) => d?.leadType == 'Registration' && (d?.lead.lId || d?.customer.cId)
    );
    setregistrationList(registration);

    let tastCounter = data.length + 1;
  };
  useEffect(() => {
    fetchAllStatus();
    fetchProjects();
  }, []);

  const [leadInterest, setLeadInterest] = useState([]);
  const [leadStatus, setLeadStatus] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    const res = await httpService.get('/project');
    setProjects(res.data);
  };

  const updateLeadInterest = async (
    plot_id,
    project_id,
    status,
    customer_id
  ) => {
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
          .find((p) => p?._id === plot_id)
          .leadsInfo.find((p) =>
            p.isCustomer ? p?.customer === customer_id : p?.lead === customer_id
          ).leadType = status;
        setProjects((d) =>
          d.map((p) => (p._id === project_id ? projectToModify : p))
        );

        const plot = projectToModify.subPlots.find((p) => p?._id === plot_id);
        await toast
          .promise(
            httpService.put(`/project/status/${project_id}`, {
              project: projectToModify,
              status,
              plot,
              lead: customer_id,
              leadcustomer: customer_id,
            }),
            {
              pending: 'Updating customer Status',
              success: 'customer Status Updated',
              error: 'Error Updating customer Status',
            }
          )
          .then((res) => {
            setLeadInterest([]);

            setIsLoading(!isLoading);

            fetchAllStatus();
          });
      } else {
        fetchAllStatus();
      }
    });
  };

  const onDragEnd = (result) => {
    console.log(result, 'RESULT');
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    if (
      destination.droppableId === 'Prospect' &&
      source.droppableId === 'Site Visit'
    )
      return;
    if (
      (destination.droppableId === 'Site Visit' ||
        destination.droppableId === 'Prospect') &&
      source.droppableId === 'Discussion'
    )
      return;
    if (
      (destination.droppableId === 'Site Visit' ||
        destination.droppableId === 'Discussion' ||
        destination.droppableId === 'Prospect') &&
      source.droppableId === 'Negotiations'
    )
      return;
    if (
      (destination.droppableId === 'Site Visit' ||
        destination.droppableId === 'Discussion' ||
        destination.droppableId === 'Prospect' ||
        destination.droppableId === 'Negotiations') &&
      source.droppableId === 'Booking'
    )
      return;
    if (
      (destination.droppableId === 'Site Visit' ||
        destination.droppableId === 'Discussion' ||
        destination.droppableId === 'Prospect' ||
        destination.droppableId === 'Negotiations' ||
        destination.droppableId === 'Booking') &&
      source.droppableId === 'Registration'
    )
      return;

    // // Update the status on the backend
    const project_id = draggableId.split(',')[0];
    const plot_id = draggableId.split(',')[1];
    const cus_id = draggableId.split(',')[2];
    const status = destination.droppableId.toString();

    let movedItem;
    const prospect = Array.from(prospectList);
    const siteVisit = Array.from(siteVisitList);
    const discussion = Array.from(discussionList);
    const negotiations = Array.from(negotiationsList);
    const won = Array.from(wonList);
    const booking = Array.from(bookingList);
    const registration = Array.from(registrationList);
    const lost = Array.from(lostList);

    switch (source.droppableId) {
      case 'Prospect':
        movedItem = prospect[source.index];
        prospect.splice(source.index, 1);
        break;
      case 'Site Visit':
        movedItem = siteVisit.splice(source.index, 1);
        break;
      case 'Discussion':
        movedItem = discussion.splice(source.index, 1);
        break;
      case 'Negotiations':
        movedItem = negotiations.splice(source.index, 1);
        break;
      case 'Won':
        movedItem = won.splice(source.index, 1);
        break;
      case 'Booking':
        movedItem = booking.splice(source.index, 1);
        break;
      case 'Registration':
        movedItem = registration.splice(source.index, 1);
        break;
      case 'Lost':
        movedItem = lost.splice(source.index, 1);
        break;
      default:
        break;
    }

    switch (destination.droppableId) {
      case 'Prospect':
        prospect.splice(destination.index, 0, movedItem);
        break;
      case 'Site Visit':
        siteVisit.splice(destination.index, 0, movedItem);
        break;
      case 'Discussion':
        discussion.splice(destination.index, 0, movedItem);
        break;
      case 'Negotiations':
        negotiations.splice(destination.index, 0, movedItem);
        break;
      case 'Won':
        won.splice(destination.index, 0, movedItem);
        break;
      case 'Booking':
        booking.splice(destination.index, 0, movedItem);
        break;
      case 'Registration':
        registration.splice(destination.index, 0, movedItem);
        break;
      case 'Lost':
        lost.splice(destination.index, 0, movedItem);
        break;
      default:
        break;
    }

    updateLeadInterest(plot_id, project_id, status, cus_id);
    setsiteVisitList(siteVisit);
    setprospectList(prospect);
    setdiscussionList(discussion);
    setwonList(won);
    setnegotiationsList(negotiations);
    setbookingList(booking);
    setregistrationList(registrationList);
    setlostList(lostList);
  };

  return (
    <div className="page-wrapper" style={{ background: '#fbfcfe' }}>
      <Helmet>
        <title>All Status</title>
        <meta name="description" content="All Status" />
      </Helmet>
      {/* Page Content */}
      {/* <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Status</h3>
            </div>
          </div>
        </div>
      </div> */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className={'p-2'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, minmax(350px, 1fr))',
            gap: 0,
            overflow: 'auto',
          }}
        >
          <Droppable droppableId="Prospect">
            {(provided) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '400px',
                  // borderRight: '2px solid',
                  borderColor: '#ccc8c8',
                  background: '#f1f0fe',
                  borderRadius: '10px',
                  margin: '10px',
                  paddingTop: '20px',
                  boxShadow:
                    'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  position: 'relative',
                }}
                key={1}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  style={{
                    backgroundColor: '#8a27b3',
                    color: '#f1f0fe',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                  }}
                >
                  {prospectList.length}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: '#8a27b3',
                    // fontSize: '23px',
                  }}
                >
                  Prospect
                </h3>

                {prospectList.length ? (
                  <div style={{ margin: 8 }}>
                    {prospectList.map((data, index) => {
                      return (
                        <>
                          <Draggable
                            draggableId={`${data?.projectData?.pId},${
                              data.subPlot?._id
                            },${
                              data.isCustomer
                                ? data?.customer?.cId
                                : data?.lead?.lId
                            }`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="col-sm-12"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                key={index}
                              >
                                <div
                                  style={{
                                    padding: '2px 0px',
                                    // background:
                                    //   'radial-gradient(circle, #4e54c8 0%,#8f94fb 100%)',
                                    borderRadius: '5px',
                                  }}
                                ></div>
                                <div className="card text-center">
                                  <div
                                    className="card-body"
                                    // style={{
                                    //   boxShadow:
                                    //     'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                                    // }}
                                  >
                                    {data?.isCustomer ? (
                                      <h5
                                        className="card-title text-danger"
                                        style={{
                                          color: '#8a27b3',
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: '#8a27b3',
                                          }}
                                        >
                                          <i
                                            className="fa fa-area-chart"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/customer-profile/${data?.customer?.cId}`}
                                        >
                                          <span style={{ color: '#8a27b3' }}>
                                            {' '}
                                            {data?.customer?.name}{' '}
                                          </span>
                                        </Link>
                                      </h5>
                                    ) : (
                                      <h5
                                        className="card-title"
                                        style={{ color: '#8a27b3' }}
                                      >
                                        <span
                                          style={{
                                            color: '#8a27b3',
                                          }}
                                        >
                                          <i
                                            className="fa fa-area-chart"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/lead-profile/${data?.lead?.lId}`}
                                        >
                                          {data?.lead?.name}
                                        </Link>
                                      </h5>
                                    )}
                                    <p
                                      className="card-text"
                                      style={{ fontSize: '15px' }}
                                    >
                                      <Link
                                        style={{ color: '#8a27b3' }}
                                        to={`/app/projects/projects-view/${data?.projectData?.pId}`}
                                      >
                                        {data?.projectData?.pName}
                                      </Link>{' '}
                                      : {data?.projectData?.pType} /{' '}
                                      {data?.projectData?.pSubType}
                                    </p>
                                    <p
                                      className="card-text"
                                      style={{ fontSize: '15px' }}
                                    >
                                      {data?.subPlot?.spName} &nbsp;|&nbsp;
                                      {data?.subPlot?.spArea} &nbsp;|&nbsp; ₹
                                      {data?.subPlot?.cost}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        </>
                      );
                    })}

                    {provided.placeholder}
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Empty description="There is no projects." />
                  </div>
                )}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="Site Visit">
            {(provided) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  // borderRight: '2px solid',
                  borderColor: '#ccc8c8',
                  background: '#fef8ea',
                  borderRadius: '10px',
                  margin: '10px',
                  paddingTop: '20px',
                  boxShadow:
                    'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  position: 'relative',
                }}
                key={2}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  style={{
                    backgroundColor: '#F37335',
                    color: '#fef8ea',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                  }}
                >
                  {siteVisitList.length}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: '#F37335',
                  }}
                >
                  Site visit
                </h3>
                {siteVisitList.length ? (
                  <div style={{ margin: 8 }}>
                    {siteVisitList.map((data, index) => {
                      return (
                        <>
                          <Draggable
                            draggableId={`${data?.projectData?.pId},${
                              data.subPlot?._id
                            },${
                              data.isCustomer
                                ? data?.customer?.cId
                                : data?.lead?.lId
                            }`}
                            // {`${data?.projectData?.pId}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="col-sm-12"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                key={index}
                              >
                                <div
                                  style={{
                                    padding: '2px 0px',
                                    // background:
                                    //   'radial-gradient(circle, #FDC830 0%,  #F37335 100%)',
                                    borderRadius: '5px',
                                  }}
                                ></div>
                                <div className="card text-center">
                                  <div
                                    className="card-body"
                                    style={
                                      {
                                        // boxShadow:
                                        //   'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                                      }
                                    }
                                  >
                                    {data?.isCustomer ? (
                                      <h5 className="card-title">
                                        <span style={{ color: '#F37335' }}>
                                          <i
                                            className="fa fa-eye"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/customer-profile/${data?.customer?.cId}`}
                                        >
                                          <span style={{ color: '#F37335' }}>
                                            {data?.customer?.name}
                                          </span>
                                        </Link>
                                      </h5>
                                    ) : (
                                      <h5 className="card-title">
                                        <span style={{ color: '#F37335' }}>
                                          <i
                                            className="fa fa-eye"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/lead-profile/${data?.lead?.lId}`}
                                        >
                                          {data?.lead?.name}
                                        </Link>
                                      </h5>
                                    )}
                                    <p className="card-text">
                                      <Link
                                        style={{ color: '#F37335' }}
                                        to={`/app/projects/projects-view/${data?.projectData?.pId}`}
                                      >
                                        {data?.projectData?.pName}
                                      </Link>{' '}
                                      : {data?.projectData?.pType} /{' '}
                                      {data?.projectData?.pSubType}
                                    </p>
                                    <p className="card-text">
                                      {data?.subPlot?.spName} &nbsp;|&nbsp;{' '}
                                      {data?.subPlot?.spArea} &nbsp;|&nbsp; ₹{' '}
                                      {data?.subPlot?.cost}
                                    </p>
                                    {/* <span
                          style={{
                            marginRight: '15px',
                          }}
                        >
                          <a href="tel:+" style={{ color: 'black' }}>
                            <i className="fa fa-phone fa-lg"></i>
                          </a>
                        </span>
                        <span style={{ marginLeft: '15px' }}>
                          <a href="mailto:" style={{ color: 'black' }}>
                            <i className="fa fa-envelope-o fa-lg"></i>
                          </a>
                        </span> */}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        </>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Empty description="There is no projects." />
                  </div>
                )}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="Discussion">
            {(provided) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  // borderRight: '2px solid',
                  borderColor: '#ccc8c8',
                  borderRadius: '10px',
                  background: '#cae5fa',
                  margin: '10px',
                  paddingTop: '20px',
                  boxShadow:
                    'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  position: 'relative',
                }}
                key={3}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  style={{
                    backgroundColor: '#283aa3',
                    color: '#cae5fa',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                  }}
                >
                  {discussionList.length}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: '#283aa3',
                  }}
                >
                  Discussion
                </h3>

                {discussionList.length ? (
                  <div style={{ margin: 8 }}>
                    {discussionList?.map((data, index) => {
                      return (
                        <>
                          <Draggable
                            draggableId={`${data?.projectData?.pId},${
                              data.subPlot?._id
                            },${
                              data.isCustomer
                                ? data?.customer?.cId
                                : data?.lead?.lId
                            }`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="col-sm-12"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                key={index}
                              >
                                <div
                                  style={{
                                    padding: '2px 0px',
                                    // background:
                                    // 'radial-gradient(circle, #1F1C2C 0%,  #928DAB 100%)',
                                    borderRadius: '5px',
                                  }}
                                ></div>
                                <div className="card text-center">
                                  <div
                                    className="card-body"
                                    style={{
                                      boxShadow:
                                        'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                                    }}
                                  >
                                    {data?.isCustomer ? (
                                      <h5 className="card-title">
                                        <span style={{ color: '#283aa3' }}>
                                          <i
                                            className="fa fa-users"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/customer-profile/${data?.customer?.cId}`}
                                        >
                                          <span style={{ color: '#283aa3' }}>
                                            {data?.customer?.name}
                                          </span>
                                        </Link>
                                      </h5>
                                    ) : (
                                      <h5 className="card-title">
                                        <span style={{ color: '#292E49' }}>
                                          <i
                                            className="fa fa-users"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/lead-profile/${data?.lead?.lId}`}
                                        >
                                          {data?.lead?.name}
                                        </Link>
                                      </h5>
                                    )}
                                    <p className="card-text">
                                      <Link
                                        style={{ color: '#283aa3' }}
                                        to={`/app/projects/projects-view/${data?.projectData?.pId}`}
                                      >
                                        {data?.projectData?.pName}
                                      </Link>{' '}
                                      : {data?.projectData?.pType} /{' '}
                                      {data?.projectData?.pSubType}
                                    </p>
                                    <p className="card-text">
                                      {data?.subPlot?.spName} &nbsp;|&nbsp;{' '}
                                      {data?.subPlot?.spArea} &nbsp;|&nbsp; ₹{' '}
                                      {data?.subPlot?.cost}
                                    </p>
                                    {/* <span
                          style={{
                            marginRight: '15px',
                          }}
                        >
                          <a href="tel:+" style={{ color: 'black' }}>
                            <i className="fa fa-phone fa-lg"></i>
                          </a>
                        </span>
                        <span style={{ marginLeft: '15px' }}>
                          <a href="mailto:" style={{ color: 'black' }}>
                            <i className="fa fa-envelope-o fa-lg"></i>
                          </a>
                        </span> */}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        </>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Empty description="There is no projects." />
                  </div>
                )}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="Negotiations">
            {(provided) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  // borderRight: '2px solid',
                  minHeight: '400px',
                  borderColor: '#ccc8c8',
                  background: '#f1f0fe',
                  borderRadius: '10px',
                  margin: '10px',
                  paddingTop: '20px',
                  boxShadow:
                    'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  position: 'relative',
                }}
                key={4}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  style={{
                    backgroundColor: '#E100FF',
                    color: '#f1f0fe',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                  }}
                >
                  {negotiationsList.length}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: '#E100FF',
                  }}
                >
                  Negotiations
                </h3>
                {negotiationsList.length ? (
                  <div style={{ margin: 8 }} id="negotiations">
                    {negotiationsList.map((data, index) => {
                      return (
                        <>
                          <Draggable
                            draggableId={`${data?.projectData?.pId},${
                              data.subPlot?._id
                            },${
                              data.isCustomer
                                ? data?.customer?.cId
                                : data?.lead?.lId
                            }`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="col-sm-12"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                key={index}
                              >
                                {/* <div className="col-sm-12"> */}
                                <div
                                  style={{
                                    padding: '2px 0px',
                                    // background:
                                    //   'radial-gradient(circle, #7F00FF 0%, #E100FF 100%)',
                                    borderRadius: '5px',
                                  }}
                                ></div>
                                <div className="card text-center">
                                  <div
                                    className="card-body"
                                    style={
                                      {
                                        // boxShadow:
                                        //   'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                                      }
                                    }
                                  >
                                    {data?.isCustomer ? (
                                      <h5 className="card-title">
                                        <span style={{ color: '#1F1C2C' }}>
                                          <i
                                            className="fa fa-phone"
                                            aria-hidden="true"
                                            style={{
                                              color: '#E100FF',
                                              marginRight: '5px',
                                            }}
                                          ></i>
                                        </span>
                                        {'  '}
                                        <Link
                                          to={`/app/profile/customer-profile/${data?.customer?.cId}`}
                                        >
                                          <span style={{ color: '#E100FF' }}>
                                            {data?.customer?.name}
                                          </span>
                                        </Link>
                                      </h5>
                                    ) : (
                                      <h5 className="card-title">
                                        <span style={{ color: '#E100FF' }}>
                                          <i
                                            className="fa fa-phone"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/lead-profile/${data?.lead?.lId}`}
                                        >
                                          {data?.lead?.name}
                                        </Link>
                                      </h5>
                                    )}
                                    <p className="card-text">
                                      <Link
                                        style={{ color: '#E100FF' }}
                                        to={`/app/projects/projects-view/${data?.projectData?.pId}`}
                                      >
                                        {data?.projectData?.pName}
                                      </Link>{' '}
                                      : {data?.projectData?.pType} /{' '}
                                      {data?.projectData?.pSubType}
                                    </p>
                                    <p className="card-text">
                                      {data?.subPlot?.spName}&nbsp;|&nbsp;{' '}
                                      {data?.subPlot?.spArea}&nbsp;|&nbsp; ₹{' '}
                                      {data?.subPlot?.cost}
                                    </p>
                                    {/* <span
                                style={{
                                  marginRight: '15px',
                                }}
                              >
                                <a href="tel:+" style={{ color: 'black' }}>
                                  <i className="fa fa-phone fa-lg"></i>
                                </a>
                              </span>
                              <span style={{ marginLeft: '15px' }}>
                                <a href="mailto:" style={{ color: 'black' }}>
                                  <i className="fa fa-envelope-o fa-lg"></i>
                                </a>
                              </span> */}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        </>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Empty description="There is no projects." />
                  </div>
                )}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="Won">
            {(provided) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',

                  background: '#e7feec',
                  borderRadius: '10px',
                  margin: '10px',
                  paddingTop: '20px',
                  boxShadow:
                    'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  position: 'relative',
                }}
                key={8}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  style={{
                    backgroundColor: 'green',
                    color: '#e7feec',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                  }}
                >
                  {wonList.length}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: 'green',
                  }}
                >
                  Won
                </h3>
                {wonList.length ? (
                  <div style={{ margin: 8 }}>
                    {wonList.map((data) => {
                      return (
                        <>
                          <div className="col-sm-12">
                            <div
                              style={{
                                padding: '2px 0px',
                                // background:
                                //   'radial-gradient(circle, #ee0979 0%, #ee0979 100%)',
                                borderRadius: '5px',
                              }}
                            ></div>
                            <div className="card text-center">
                              <div className="card-body">
                                {data?.isCustomer ? (
                                  <h5 className="card-title">
                                    <span style={{ color: 'green' }}>
                                      <i
                                        className="fa fa-check"
                                        aria-hidden="true"
                                      ></i>
                                    </span>{' '}
                                    <Link
                                      to={`/app/profile/customer-profile/${data?.customer?.cId}`}
                                    >
                                      <span style={{ color: 'green' }}>
                                        {data?.customer?.name}
                                      </span>
                                    </Link>
                                  </h5>
                                ) : (
                                  <h5 className="card-title">
                                    <span style={{ color: 'green' }}>
                                      <i
                                        className="fa fa-check"
                                        aria-hidden="true"
                                      ></i>
                                    </span>{' '}
                                    <Link
                                      style={{ color: 'green' }}
                                      to={`/app/profile/lead-profile/${data?.lead?.lId}`}
                                    >
                                      {data?.lead?.name}
                                    </Link>
                                  </h5>
                                )}
                                <p className="card-text">
                                  <Link
                                    style={{ color: 'green' }}
                                    to={`/app/projects/projects-view/${data?.projectData?.pId}`}
                                  >
                                    {data?.projectData?.pName}
                                  </Link>{' '}
                                  : {data?.projectData?.pType} /{' '}
                                  {data?.projectData?.pSubType}
                                </p>
                                <p className="card-text">
                                  {data?.subPlot?.spName} &nbsp;|&nbsp;{' '}
                                  {data?.subPlot?.spArea} &nbsp;|&nbsp; ₹{' '}
                                  {data?.subPlot?.cost}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Empty description="There is no projects." />
                  </div>
                )}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="Booking">
            {(provided) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  // borderRight: '2px solid',
                  borderColor: '#ccc8c8',
                  // background: '#f19698',
                  background: '#F6D2C5',
                  borderRadius: '10px',
                  margin: '10px',
                  paddingTop: '20px',
                  boxShadow:
                    'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  position: 'relative',
                }}
                key={6}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  style={{
                    backgroundColor: '#80391e',
                    color: '#F6D2C5',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                  }}
                >
                  {bookingList.length}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: '#80391e',
                  }}
                >
                  Booking
                </h3>
                {bookingList.length ? (
                  <div style={{ margin: 8 }} id="booking">
                    {bookingList.map((data, index) => {
                      return (
                        <>
                          <Draggable
                            draggableId={`${data?.projectData?.pId},${
                              data.subPlot?._id
                            },${
                              data.isCustomer
                                ? data?.customer?.cId
                                : data?.lead?.lId
                            }`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="col-sm-12"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                key={index}
                              >
                                <div
                                  style={{
                                    padding: '2px 0px',
                                    // background:
                                    //   'radial-gradient(circle, #FEAC5E 0%, #C779D0 35%, #4BC0C8 100%)',
                                    borderRadius: '5px',
                                  }}
                                ></div>
                                <div className="card text-center">
                                  <div
                                    className="card-body"
                                    // style={{
                                    //   boxShadow:
                                    //     'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                                    // }}
                                  >
                                    {data?.isCustomer ? (
                                      <h5 className="card-title">
                                        <span style={{ color: '#80391e' }}>
                                          <i
                                            className="fa fa-book"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/customer-profile/${data?.customer?.cId}`}
                                        >
                                          <span style={{ color: '#80391e' }}>
                                            {data?.customer?.name}
                                          </span>
                                        </Link>
                                      </h5>
                                    ) : (
                                      <h5 className="card-title">
                                        <span style={{ color: '#80391e' }}>
                                          <i
                                            className="fa fa-book"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/lead-profile/${data?.lead?.lId}`}
                                        >
                                          {data?.lead?.name}
                                        </Link>
                                      </h5>
                                    )}
                                    <p className="card-text">
                                      <Link
                                        style={{ color: '#80391e' }}
                                        to={`/app/projects/projects-view/${data?.projectData?.pId}`}
                                      >
                                        {data?.projectData?.pName}
                                      </Link>{' '}
                                      : {data?.projectData?.pType} /{' '}
                                      {data?.projectData?.pSubType}
                                    </p>
                                    <p className="card-text">
                                      {data?.subPlot?.spName} &nbsp;|&nbsp;{' '}
                                      {data?.subPlot?.spArea} &nbsp;|&nbsp; ₹{' '}
                                      {data?.subPlot?.cost}
                                    </p>
                                    {/* <span
                          style={{
                            marginRight: '15px',
                          }}
                        >
                          <a href="tel:+" style={{ color: 'black' }}>
                            <i className="fa fa-phone fa-lg"></i>
                          </a>
                        </span>
                        <span style={{ marginLeft: '15px' }}>
                          <a href="mailto:" style={{ color: 'black' }}>
                            <i className="fa fa-envelope-o fa-lg"></i>
                          </a>
                        </span> */}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        </>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Empty description="There is no projects." />
                  </div>
                )}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="Registration">
            {(provided) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  // borderRight: '2px solid',
                  borderColor: '#ccc8c8',
                  borderRadius: '10px',
                  margin: '10px',
                  paddingTop: '20px',
                  background: '#ccecfc',
                  boxShadow:
                    'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  position: 'relative',
                }}
                key={7}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  style={{
                    backgroundColor: '#195e83',
                    color: '#ccecfc',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                  }}
                >
                  {registrationList.length}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: '#195e83',
                  }}
                >
                  Registration
                </h3>
                {registrationList.length ? (
                  <div style={{ margin: 8 }} id="registration">
                    {registrationList.map((data, index) => {
                      return (
                        <>
                          <Draggable
                            draggableId={`${data?.projectData?.pId},${
                              data.subPlot?._id
                            },${
                              data.isCustomer
                                ? data?.customer?.cId
                                : data?.lead?.lId
                            }`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="col-sm-12"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                key={index}
                              >
                                <div
                                  style={{
                                    padding: '2px 0px',
                                    // background:
                                    //   'radial-gradient(circle, #7F7FD5 0%, #86A8E7 35%, #91EAE4 100%)',
                                    borderRadius: '5px',
                                  }}
                                ></div>
                                <div className="card text-center">
                                  <div
                                    className="card-body"
                                    // style={{
                                    //   boxShadow:
                                    //     'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                                    // }}
                                  >
                                    {data?.isCustomer ? (
                                      <h5 className="card-title">
                                        <span
                                          style={{
                                            color: '#195e83',
                                            marginRight: '5px',
                                          }}
                                        >
                                          <i
                                            className="fa fa-user-plus"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/customer-profile/${data?.customer?.cId}`}
                                        >
                                          <span style={{ color: '#195e83' }}>
                                            {data?.customer?.name}
                                          </span>
                                        </Link>
                                      </h5>
                                    ) : (
                                      <h5 className="card-title">
                                        <span
                                          style={{
                                            color: '#195e83',
                                            marginRight: '5px',
                                          }}
                                        >
                                          <i
                                            className="fa fa-user-plus"
                                            aria-hidden="true"
                                          ></i>
                                        </span>{' '}
                                        <Link
                                          to={`/app/profile/lead-profile/${data?.lead?.lId}`}
                                        >
                                          {data?.lead?.name}
                                        </Link>
                                      </h5>
                                    )}
                                    <p className="card-text">
                                      <Link
                                        style={{ color: '#195e83' }}
                                        to={`/app/projects/projects-view/${data?.projectData?.pId}`}
                                      >
                                        {data?.projectData?.pName}
                                      </Link>{' '}
                                      : {data?.projectData?.pType} /{' '}
                                      {data?.projectData?.pSubType}
                                    </p>
                                    <p className="card-text">
                                      {data?.subPlot?.spName} &nbsp;|&nbsp;{' '}
                                      {data?.subPlot?.spArea} &nbsp;|&nbsp; ₹{' '}
                                      {data?.subPlot?.cost}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        </>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Empty description="There is no projects." />
                  </div>
                )}
              </div>
            )}
          </Droppable>
          <Droppable droppableId="Lost">
            {(provided) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',

                  background: '#ffdbdb',
                  borderRadius: '10px',
                  margin: '10px',
                  paddingTop: '20px',
                  boxShadow:
                    'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  position: 'relative',
                }}
                key={8}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  style={{
                    backgroundColor: 'red',
                    color: '#ffdbdb',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                  }}
                >
                  {lostList.length}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: 'red',
                  }}
                >
                  Lost
                </h3>

                {lostList.length ? (
                  <div style={{ margin: 8 }}>
                    {lostList.map((data) => {
                      return (
                        <>
                          <div className="col-sm-12">
                            <div
                              style={{
                                padding: '2px 0px',
                                // background:
                                //   'radial-gradient(circle, #ee0979 0%, #ee0979 100%)',
                                borderRadius: '5px',
                              }}
                            ></div>
                            <div className="card text-center">
                              <div
                                className="card-body"
                                // style={{
                                //   boxShadow:
                                //     'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                                // }}
                              >
                                {data?.isCustomer ? (
                                  <h5 className="card-title">
                                    <span style={{ color: 'red' }}>
                                      <i
                                        className="fa fa-times"
                                        aria-hidden="true"
                                      ></i>
                                    </span>{' '}
                                    <Link
                                      to={`/app/profile/customer-profile/${data?.customer?.cId}`}
                                    >
                                      <span style={{ color: 'red' }}>
                                        {data?.customer?.name}
                                      </span>
                                    </Link>
                                  </h5>
                                ) : (
                                  <h5 className="card-title">
                                    <span style={{ color: 'red' }}>
                                      <i
                                        className="fa fa-times"
                                        aria-hidden="true"
                                      ></i>
                                    </span>{' '}
                                    <Link
                                      style={{ color: 'red' }}
                                      to={`/app/profile/lead-profile/${data?.lead?.lId}`}
                                    >
                                      {data?.lead?.name}
                                    </Link>
                                  </h5>
                                )}
                                <p className="card-text">
                                  <Link
                                    style={{ color: 'red' }}
                                    to={`/app/projects/projects-view/${data?.projectData?.pId}`}
                                  >
                                    {data?.projectData?.pName}
                                  </Link>{' '}
                                  : {data?.projectData?.pType} /{' '}
                                  {data?.projectData?.pSubType}
                                </p>
                                <p className="card-text">
                                  {data?.subPlot?.spName} &nbsp;|&nbsp;{' '}
                                  {data?.subPlot?.spArea} &nbsp;|&nbsp; ₹{' '}
                                  {data?.subPlot?.cost}
                                </p>
                                {/* <span
                         style={{
                           marginRight: '15px',
                         }}
                       >
                         <a href="tel:+" style={{ color: 'black' }}>
                           <i className="fa fa-phone fa-lg"></i>
                         </a>
                       </span>
                       <span style={{ marginLeft: '15px' }}>
                         <a href="mailto:" style={{ color: 'black' }}>
                           <i className="fa fa-envelope-o fa-lg"></i>
                         </a>
                       </span> */}
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Empty description="There is no projects." />
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
};

export default AllStatus;
