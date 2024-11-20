import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import httpService from '../../lib/httpService';
import { useDispatch, useSelector } from 'react-redux';
import { createNotify } from '../../features/notify/notifySlice';
import DatePicker from 'react-date-picker';
import { Select } from 'antd';
import moment from 'moment';
const AddLeads = () => {
  const dispatch = useDispatch();
  const [employees, setEmployees] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [leadData, setLeadData] = useState(null);
  const [leadNo, setleadNo] = useState(
    `LD-${Math.floor(Math.random() * 1000)}`
  );
  const [projects, setProjects] = useState();
  const [status, setStatus] = useState();
  const user = useSelector((state) => state.authentication.value.user);
  const { state } = useLocation();
  const [selectedProject, setSelectedProject] = useState(null);
  const [existingProjects, setExistingProjects] = useState([]);
  const [existingEmployees, setExistingEmployees] = useState([]);
  const [emailExist, setEmailExist] = useState(false);
  const [phoneExist, setPhoneExist] = useState(false);
  const [leadLength, setLeadLength] = useState(false);
  const history = useHistory();

  useEffect(async () => {
    await fetchEmployees();
    await fetchProjects();
    await fetchLeadStatus();
    if (user && state) {
      const {
        address,
        assignType,
        assignedTo,
        currentAssigned,
        email,
        endDate,
        firstName,
        lastName,
        lead,
        nextAppointment,
        phone,
        pointDiscussed,
        project,
        startDate,
        status,
        totalCalls,
      } = state;
      setLeadData({
        address,
        assignType,
        assignedTo,
        currentAssigned,
        email,
        endDate,
        firstName,
        lastName,
        lead,
        nextAppointment,
        phone,
        pointDiscussed,
        startDate,
        status,
        totalCalls,
      });
      setleadNo(lead);
    } else {
      let res = await httpService.get(`/lead/latest`);
      if (res.data) {
        let latestLead = res.data?.lead.split('-')[1];
        setleadNo(`LD-${(+latestLead + 1).toString()}`);
      } else {
        setleadNo(`LD-${(1000).toString()}`);
      }
    }
  }, []);
  useEffect(() => {
    if (state) {
      setExistingProjects(state.project);
      let existing = [];
      state.project.forEach((elem) => {
        elem?.subPlots?.forEach((el) => {
          let exist = el?.leadsInfo?.filter((e) => e.lead === state._id);
          if (exist?.length) {
            existing.push(el);
          }
        });
      });
      setExistingEmployees(state.assignedTo);
    }
  }, [state]);

  useEffect(async()=>{
    if(leadData?.email?.length>2&&leadData.email.includes('@') ){
     setLeadLength(true)
     setEmailExist(await checkEmailExist(leadData.email))
    }
  },[leadData?.email])

  useEffect(async()=>{
    if(leadData?.phone?.length>5){
      setLeadLength(true)
      setPhoneExist(await checkPhoneExist(leadData.phone))
    }
  },[leadData?.phone])

  const checkEmailExist = async(email)=>{
    try{
      let res = await httpService.get(`lead/check-email`,{params:{email}})
      return res.data.error;
    }catch(err){
      return err;
    }
  }
  const checkPhoneExist = async(phone)=>{
    try{
      let res = await httpService.get(`lead/check-phone`,{params:{phone}})
      return res.data.error;
    }catch(err){
      return err;
    }
  }

  function getUniqueObjects(array, idField) {
    const uniqueObjects = [];
    const uniqueIds = new Set();
    for (const obj of array) {
      const objId = obj[idField];

      if (!uniqueIds.has(objId)) {
        uniqueIds.add(objId);
        uniqueObjects.push(obj);
      }
    }

    return uniqueObjects;
  }
  const fetchEmployees = async () => {
    const employees = await httpService.get('/employee');
    const salesEmployees = employees.data.filter(
      (v) => v?.jobRole?.name === 'Sales'
    );
    setEmployees(salesEmployees);
  };

  const fetchProjects = async () => {
    const res = await httpService.get('/project');
    setProjects(res.data?.filter((el) => el.saleStatus === 'Live'));
  };

  const fetchLeadStatus = async () => {
    const status = await httpService.get('/lead-status/switchable');
    setStatus(status.data);
  };
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectChange = (selectedValues) => {
    setSelectedItems(selectedValues);
  };
  const handleEmail = (e)=>{
    setLeadData({
        ...leadData,
        email: e.target.value,
      });
  }

  const handlePhone = (e)=>{
    setLeadData({
      ...leadData,
      phone: e.target.value,
    })
  }

  const handleSubmit = async () => {
    if (!leadData?.firstName.trim()) {
      toast.error('Please Enter Valid Lead First Name');
      return;
    }
    if (!leadData?.lastName.trim()) {
      toast.error('Please Enter Valid Lead Last Name');
      return;
    }
    if (!leadData?.email.trim()) {
      toast.error('Please Enter Valid Lead Email');
      return;
    }
    if (state) {
      // if leads data already exist (to update the leads data) :
      toast.info('Updating Lead Data');
      let leadUploadData = {
        ...leadData,
        project: [...state.project, selectedProject],
        lead: leadNo,
        leadType: 'New',
        createdBy: user._id,
        currentAssigned: selectedItems[0]
          ? selectedItems[0]
          : state.currentAssigned,
        assignedTo: selectedItems?.length ? selectedItems : state.assignedTo,
        plots: selectedPlot ? [...state.plots, selectedPlot] : state.plots,
      };
      let id = state._id;
      try {
        await httpService.put(`/lead/${id}`, leadUploadData);
        dispatch(
          createNotify({
            notifyHead: `New Lead Added`,
            notifyBody: `Lead ${leadUploadData?.firstName} ${leadUploadData?.lastName} is created`,
            createdBy: user?._id,
          })
        );
        if (selectedProject && selectedPlot) {
          const modifyProject = { ...selectedProject };
          modifyProject.subPlots = modifyProject?.subPlots?.map((subPlot) => {
            if (subPlot._id === selectedPlot?._id) {
              return {
                ...subPlot,
                leadsInfo: [
                  ...subPlot.leadsInfo,
                  {
                    lead: state._id,
                    leadType: 'New Lead',
                    isCustomer: false,
                  },
                ],
              };
            }
            return subPlot;
          });
          await httpService.put(
            `/project/${selectedProject._id}`,
            modifyProject
          );
        }
        toast.success('Lead Created successfully');
      } catch (err) {
        toast.error('something went wrong :', err.message);
      } finally {
        history.push('/app/employees/leads');
      }
    } else {
      try {
        let emailAndPhoneStatus = await httpService.get('/lead', {
          params: { email: leadData.email, phone: leadData.phone },
        });
        if (emailAndPhoneStatus.data?.error) {
          toast.error(emailAndPhoneStatus.data?.message);
          return;
        }
      } catch (err) {
        toast.error(err?.message);
      }
      // if all is good.... =>
      try {
        let leadUploadData = {
          ...leadData,
          lead: leadNo,
          leadType: 'New',
          createdBy: user._id,
          currentAssigned: selectedItems[0],
          assignedTo: selectedItems,
          plots: selectedPlot ? [selectedPlot] : [],
        };

        let res = await httpService.post('/lead', leadUploadData);
        dispatch(
          createNotify({
            notifyHead: `New Lead Added`,
            notifyBody: `Lead ${leadUploadData?.firstName} ${leadUploadData?.lastName} is created`,
            createdBy: user?._id,
          })
        );
        let newLead = res.data;
        if (selectedProject && selectedPlot) {
          const modifyProject = { ...selectedProject };
          modifyProject.subPlots = modifyProject?.subPlots?.map((subPlot) => {
            if (subPlot._id === selectedPlot?._id) {
              return {
                ...subPlot,
                leadsInfo: [
                  ...subPlot.leadsInfo,
                  {
                    lead: newLead?._id,
                    leadType: 'New Lead',
                    isCustomer: false,
                  },
                ],
              };
            }
            return subPlot;
          });
          await httpService.put(
            `/project/${selectedProject._id}`,
            modifyProject
          );
        }
        toast.success('Lead Created successfully');
      } catch (err) {
      } finally {
        history.push('/app/employees/leads');
      }
    }
  };
  const handlePlotChange = (e) => {
    if (state) {
      let exist = state.plots.filter((el) => el === e.target.value);
      if (exist?.length) {
        toast.error('Selected Plot already exist !');
      } else {
        setSelectedPlot(
          selectedProject?.subPlots?.filter((p) => p._id === e.target.value)[0]
        );
      }
    } else {
      setSelectedPlot(
        selectedProject?.subPlots?.filter((p) => p._id === e.target.value)[0]
      );
    }
  };
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Add Leads</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              {state?.edit? <h3 className='page-title' >Update Leads</h3> :<h3 className="page-title">Add Leads</h3>}
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/employees/leads">Leads</Link>
                </li>
                <li className="breadcrumb-item active">Add Leads</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-sm-12">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {/* !! add redirect option to create more customer */}
              <div className="row">
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>
                      Lead First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      required
                      placeholder='First Name'
                      value={leadData?.firstName}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          firstName: e.target.value,
                          name: `${e.target.value} ${leadData?.lastName}`,
                        })
                      }
                      type="text"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>
                      Lead Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                    placeholder='Last Name'
                      value={leadData?.lastName}
                      type="text"
                      required
                      className="form-control"
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          lastName: e.target.value,
                          name: `${leadData?.firstName} ${e.target.value}`,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label className="">
                      Lead Email <span className="text-danger">* </span>
                     {!state?.edit&& leadLength && (emailExist?<span className='text-danger' style={{fontSize:'12px'}} > Duplicate Email</span>:<span className='text-success' style={{fontSize:'12px'}} > Unique Email</span>)}
                    </label>
                    <input
                      required
                      placeholder='leads email (unique)'
                      value={leadData?.email}
                      type="email"
                      className="form-control"
                      onChange={handleEmail}
                      disabled={state?.edit}
                    />
                  </div>
                </div>

                <div className="col-sm-3">
                  <div className="form-group">
                    <label>
                      Lead Phone <span className="text-danger">*</span>
                      {!state?.edit&& leadLength && (phoneExist?<span className='text-danger' style={{fontSize:'12px'}} > Duplicate Phone</span>:<span className='text-success' style={{fontSize:'12px'}} > Unique Phone</span>)}
                    </label>
                    <input
                      required
                      value={leadData?.phone}
                      minLength={10}
                      maxLength={10}
                      type="tel"
                      placeholder='Leads phone (unique)'
                      className="form-control"
                      onChange={handlePhone}
                      disabled={state?.edit}
                    />
                  </div>
                </div>
              </div>

              <hr />
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      Address Line 1 <span className="text-danger">*</span>
                    </label>
                    <textarea
                      required
                      value={leadData?.address?.addressLine1}
                      className="form-control"
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          address: {
                            ...leadData?.address,
                            addressLine1: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Address Line 2</label>
                    <textarea
                      value={leadData?.address?.addressLine2}
                      className="form-control"
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          address: {
                            ...leadData?.address,
                            addressLine2: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>
                      City <span className="text-danger">*</span>
                    </label>
                    <input
                      required
                      value={leadData?.address?.city}
                      type="text"
                      className="form-control"
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          address: {
                            ...leadData?.address,
                            city: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>
                      State <span className="text-danger">*</span>
                    </label>
                    <select
                      required
                      value={leadData?.address?.state}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          address: {
                            ...leadData?.address,
                            state: e.target.value,
                          },
                        })
                      }
                      className="custom-select"
                    >
                      <option value={''}>Please Select</option>
                      {[
                        'Andhra Pradesh',
                        'Arunachal Pradesh',
                        'Assam',
                        'Bihar',
                        'Chhattisgarh',
                        'Goa',
                        'Gujarat',
                        'Haryana',
                        'Himachal Pradesh',
                        'Jammu and Kashmir',
                        'Jharkhand',
                        'Karnataka',
                        'Kerala',
                        'Madhya Pradesh',
                        'Maharashtra',
                        'Manipur',
                        'Meghalaya',
                        'Mizoram',
                        'Nagaland',
                        'Odisha',
                        'Punjab',
                        'Rajasthan',
                        'Sikkim',
                        'Tamil Nadu',
                        'Telangana',
                        'Tripura',
                        'Uttarakhand',
                        'Uttar Pradesh',
                        'West Bengal',
                        'Andaman and Nicobar Islands',
                        'Chandigarh',
                        'Dadra and Nagar Haveli',
                        'Daman and Diu',
                        'Delhi',
                        'Lakshadweep',
                        'Puducherry',
                      ].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Pin Code</label>
                    <input
                      required
                      value={leadData?.address?.zipCode}
                      type="number"
                      className="form-control"
                      min={100_000}
                      max={999_999}
                      minLength={6}
                      maxLength={6}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          address: {
                            ...leadData?.address,
                            zipCode: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <hr />
              <div className="row">
                <div className="col-sm-3 form-group">
                  <label>
                    Lead <span className="text-danger">#</span>
                  </label>
                  <input
                    disabled
                    value={leadNo}
                    placeholder="LD-0000XX"
                    onChange={(e) => setleadNo(e.target.value)}
                    className="form-control"
                    required
                    type="text"
                  />
                </div>
                <div className="col-sm-3 form-group">
                  <label>Lead Status</label>
                  <select
                    required
                    value={leadData?.status?._id}
                    onChange={(e) =>
                      setLeadData({
                        ...leadData,
                        status: e.target.value,
                      })
                    }
                    className="form-control"
                  >
                    <option value={''}>Select</option>
                    {status?.map((stat) => (
                      <option key={stat._id} value={stat._id}>
                        {stat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Start Date</label>
                    <div>
                      <DatePicker
                        className="form-control"
                        defaultValue={new Date()}
                        value={leadData?.startDate}
                        format={'dd/MM/yyyy'}
                        onChange={(e) =>
                          setLeadData({
                            ...leadData,
                            startDate: e,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>End Date</label>
                    <div>
                      <DatePicker
                        className="form-control"
                        defaultValue={
                          leadData?.endDate
                            ? moment(leadData?.endDate).toDate()
                            : moment().add(1, 'days').toDate()
                        }
                        value={leadData?.endDate}
                        onChange={(e) =>
                          setLeadData({
                            ...leadData,
                            endDate: e,
                          })
                        }
                        minDate={
                          leadData?.startDate
                            ? moment(leadData?.startDate)
                                .add(1, 'days')
                                .toDate()
                            : moment().add(1, 'days').toDate()
                        }
                        format={'dd/MM/yyyy'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr />
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Relevant Point Discussed</label>
                    <textarea
                      // required
                      value={leadData?.pointDiscussed}
                      className="form-control"
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          pointDiscussed: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Next Appointment</label>
                    <DatePicker
                      className="form-control"
                      value={leadData?.nextAppointment}
                      format={'dd/MM/yyyy'}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          nextAppointment: e,
                        })
                      }
                      minDate={
                        leadData?.startDate
                          ? moment(leadData?.startDate).add(1, 'days').toDate()
                          : moment().add(1, 'days').toDate()
                      }
                    />
                  </div>
                </div>

                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Total Calls</label>
                    <input
                      value={leadData?.totalCalls}
                      type="number"
                      className="form-control"
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          totalCalls: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <hr />
              {/* {user?.userType}
              {user?.jobRole?.name} */}
              {user?.jobRole?.name === 'Admin' && (
                <>
                  <>
                    {state ? (
                      <div className="row">
                        <div style={{ width: '50%' }}>
                          <div className="m-3 form-group">
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <label>Select Project</label>
                              <select
                              required
                                style={{
                                  width: '60%',
                                  marginLeft: '20px',
                                  marginRight: '30px',
                                }}
                                value={selectedProject?._id || ''}
                                onChange={(e) => {
                                  const projectId = e.target.value;
                                  setSelectedProject(
                                    projects.filter(
                                      (p) => p._id === projectId
                                    )[0]
                                  );
                                  setSelectedPlot(null);
                                }}
                                className="custom-select"
                              >
                                <option value={''}>Please Select</option>
                                {projects?.map((project) => (
                                  <option key={project._id} value={project._id}>
                                    {project.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <br />
                          <div className="m-3 form-group">
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <label>Select Plot</label>
                              <select
                              required
                                style={{
                                  width: '60%',
                                  marginLeft: '20px',
                                  marginRight: '30px',
                                }}
                                value={selectedPlot?._id || ''}
                                onChange={handlePlotChange}
                                className="custom-select"
                              >
                                <option hidden value="">
                                  Please Select
                                </option>
                                {selectedProject?.subPlots
                                  ?.filter((pl) => pl.sold != true)
                                  .map((plot) => (
                                    <option value={plot._id}>
                                      {plot.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div style={{ width: '50%' }}>
                          <div className="m-3 form-group">
                            <div>
                              <strong>Intrested Projects</strong>
                              <div
                                style={{
                                  display: 'flex',
                                  overflowX: 'auto',
                                  marginTop: '10px',
                                }}
                              >
                                {existingProjects?.map((el, id) => (
                                  <p
                                    style={{
                                      border: '1px solid red',
                                      padding: '0px 10px',
                                      borderRadius: '100px',
                                      margin: '0px 6px',
                                      whiteSpace: 'nowrap',
                                    }}
                                    key={id}
                                  >
                                    {el.parent}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                          <br />
                          <div className="m-3 form-group">
                            <div>
                              <strong>Intrested Plots</strong>
                              <div
                                style={{
                                  display: 'flex',
                                  overflowX: 'auto',
                                  marginTop: '10px',
                                }}
                              >
                                {existingProjects?.map((el, id) => (
                                  <p
                                    style={{
                                      border: '1px solid red',
                                      padding: '0px 10px',
                                      borderRadius: '100px',
                                      margin: '0px 6px',
                                      whiteSpace: 'nowrap',
                                    }}
                                    key={id}
                                  >
                                    {el.name}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="row">
                        <div className="col-sm-3 form-group">
                          <label>Select Project</label>
                          <select
                            required
                            value={selectedProject?._id || ''}
                            onChange={(e) => {
                              const projectId = e.target.value;
                              setSelectedProject(
                                projects.filter((p) => p._id === projectId)[0]
                              );
                              setLeadData({
                                ...leadData,
                                project: [projectId],
                              });
                              setSelectedPlot(null);
                            }}
                            className="custom-select"
                          >
                            <option value={''}>Please Select</option>
                            {projects?.map((project) => (
                              <option key={project._id} value={project._id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-sm-3 form-group">
                          <label>Select Plot</label>
                          <select
                            required
                            value={selectedPlot?._id || ''}
                            onChange={handlePlotChange}
                            className="custom-select"
                          >
                            <option hidden value="">
                              Please Select
                            </option>
                            {selectedProject?.subPlots
                              ?.filter((pl) => pl.sold != true)
                              .map((plot) => (
                                <option value={plot._id}>{plot.name}</option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <hr />
                  </>
                  {/* )} */}
                  {/* {assignType === 'Employee' && ( */}

                  <>
                    {state ? (
                      <div className="row">
                        <div style={{ width: '50%' }}>
                          <div className="m-3 form-group">
                            <label>Employees</label>
                            <Select
                              mode="multiple"
                              style={{
                                width: '60%',
                                marginLeft: '20px',
                                marginRight: '30px',
                              }}
                              placeholder="Please select"
                              onChange={handleSelectChange}
                            >
                              {selectedProject?.assignedTo?.length
                                ? selectedProject?.assignedTo?.map((emp) =>
                                    employees.map(
                                      (employee) =>
                                        emp === employee._id && (
                                          <option
                                            value={emp}
                                          >{`${employee.firstName} ${employee.lastName}`}</option>
                                        )
                                    )
                                  )
                                : employees.map((employee) => (
                                    <option
                                      value={employee?._id}
                                    >{`${employee?.firstName} ${employee?.lastName}`}</option>
                                  ))}
                            </Select>
                          </div>
                        </div>
                        <div style={{ width: '50%' }}>
                          <div className="m-3 form-group">
                            <strong>Assigned To</strong>
                            <div
                              style={{
                                display: 'flex',
                                overflowX: 'auto',
                                marginTop: '10px',
                              }}
                            >
                              {existingEmployees?.map((el, id) => (
                                <p
                                  style={{
                                    border: '1px solid red',
                                    padding: '0px 10px',
                                    borderRadius: '100px',
                                    margin: '0px 6px',
                                    whiteSpace: 'nowrap',
                                  }}
                                  key={id}
                                >
                                  {el.name}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="row">
                        <div className="col-sm-3 form-group">
                          <label>Employees</label>
                          <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            onChange={handleSelectChange}
                          >
                            {selectedProject?.assignedTo?.length
                              ? selectedProject?.assignedTo?.map((emp) =>
                                  employees.map(
                                    (employee) =>
                                      emp === employee._id && (
                                        <option
                                          value={emp}
                                        >{`${employee.firstName} ${employee.lastName}`}</option>
                                      )
                                  )
                                )
                              : employees.map((employee) => (
                                  <option
                                    value={employee?._id}
                                  >{`${employee?.firstName} ${employee?.lastName}`}</option>
                                ))}
                          </Select>
                        </div>
                      </div>
                    )}
                    <hr />
                  </>
                </>
              )}
              <div className="submit-section">
                {state ? (
                  <button
                    type="submit"
                    value="save"
                    className="btn btn-primary submit-btn"
                  >
                    Update
                  </button>
                ) : (
                  <button
                    type="submit"
                    value="save"
                    className="btn btn-primary submit-btn"
                  >
                    Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeads;
