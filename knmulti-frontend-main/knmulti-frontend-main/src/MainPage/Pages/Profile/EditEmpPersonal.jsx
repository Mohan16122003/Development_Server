import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateEmployee } from '../../../lib/api';
import httpService from '../../../lib/httpService';
import DatePicker from 'react-date-picker';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2';

const EditEmpPersonal = ({
  empId,
  pData,
  addressData,
  setEmployee,
  userName,
  isAdmin,
}) => {
  const [roles, setRoles] = useState([]);
  const [isChecked, setIsChecked] = useState(false);

  const [locs, setLocs] = useState([]);
  const [depts, setDepts] = useState([]);
  // console.log(pData, "pDatapData");
  const basicInfoObj = {
    firstName: '',
    middleName: '',
    lastName: '',
    blood: '',
    email: '',
    dob: '',
    gender: '',
    mobileNo: '',
    salary: '',
    jobRole: '',
    workLocation: '',
    department: '',
  };

  const [basicInfo, setBasicInfo] = useState(pData || basicInfoObj);

  const handleBasicInfo = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };
  const handleDOB = (e) => {
    setBasicInfo({ ...basicInfo, dob: e });
  };

  const fetchRoles = async () => {
    const roles = await httpService.get('/role');
    const locs = await httpService.get('/location');
    const depts = await httpService.get('/department');
    setRoles(roles?.data);
    setLocs(locs?.data);
    setDepts(depts?.data);
  };

  // Address
  const addressObj = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  };

  const [currentAddress, setCurrentAddress] = useState(
    addressData || addressObj
  );
  const [permanentAddress, setPermanentAddress] = useState(addressObj);

  const handleCurrentAddress = (e) => {
    setCurrentAddress({ ...currentAddress, [e.target.name]: e.target.value });
  };
  const handlePermanentAddress = (e) => {
    setCurrentAddress({ ...currentAddress, [e.target.name]: e.target.value });
  };

  const toLowercase = (e) => {
    e.target.value = e.target.value.toLowerCase();
  };

  const handleAddress = (e) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to ',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsChecked(!isChecked);
        if (isChecked === false) {
          setPermanentAddress({
            ...currentAddress,
          });
        } else {
          setPermanentAddress(addressObj);
        }
      }
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!basicInfo?.department) {
      toast.error('department is Required');
      return;
    }
    if (!basicInfo?.jobRole) {
      toast.error('Job Role is Required');
      return;
    }
    if (basicInfo?.workLocation === 'Please Select location') {
      toast.error('Work Location is Required');
      return;
    }
    updateEmployee(empId, {
      userName,
      ...basicInfo,
      currentAddress,
      permanentAddress,
    }).then((res) => {
      setEmployee();
      document.querySelectorAll('.close')?.forEach((e) => e.click());
    });
  };

  useEffect(() => {
    fetchRoles();
  }, []);
  let stateArr = [
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
  ];

  return (
    <div id="edit_emp_pinfo" className="modal custom-modal fade" role="dialog">
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Personal Information</h5>
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
            <form onSubmit={handleSubmit}>
              {/* tabs  */}
              <div style={{ paddingLeft: '0px' }} className="col-md-12 p-r-0">
                <div className="card tab-box">
                  <div className="row user-tabs">
                    <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                      <ul className="nav nav-tabs nav-tabs-bottom">
                        <li className="nav-item">
                          <a
                            href="#emp_pinfo"
                            data-toggle="tab"
                            className="nav-link active"
                            // onClick={(e) => setShowTrx(!showTrx)}
                          >
                            Personal Information
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#emp_address"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Address
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  minHeight: '65vh',
                  maxHeight: '65vh',
                  overflowY: 'auto',
                }}
                className="card p-4 tab-content"
              >
                <div className="tab-pane fade show active" id="emp_pinfo">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          name="firstName"
                          type="text"
                          className="form-control"
                          value={basicInfo?.firstName}
                          onChange={handleBasicInfo}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Middle Name</label>
                        <input
                          name="middleName"
                          type="text"
                          className="form-control"
                          value={basicInfo?.middleName}
                          onChange={handleBasicInfo}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          name="lastName"
                          type="text"
                          className="form-control"
                          value={basicInfo?.lastName}
                          onChange={handleBasicInfo}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          name="email"
                          type="email"
                          className="form-control"
                          value={basicInfo?.email}
                          onChange={handleBasicInfo}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Birth Date</label>
                        <div>
                          <DatePicker
                            // poppername="endDate"
                            className="form-control"
                            // style={{ border: 'none', backgroundColor: 'red' }}
                            value={basicInfo?.dob || ''}
                            onChange={(e) => handleDOB(e)}
                            disabled={!isAdmin}
                          />
                          {/* <input
                            name="dob"
                            className="form-control"
                            type="date"
                            value={basicInfo?.dob?.split("T")[0]}
                            onChange={handleBasicInfo}
                          /> */}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          className="custom-select"
                          name="gender"
                          value={basicInfo?.gender}
                          onChange={handleBasicInfo}
                          disabled={!isAdmin}
                        >
                          <option>Please Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHERS">Others</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Employee ID</label>
                        <input
                          type="number"
                          className="form-control"
                          value={empId}
                          onChange={handleBasicInfo}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          name="mobileNo"
                          type="number"
                          className="form-control"
                          value={basicInfo?.mobileNo}
                          onChange={handleBasicInfo}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Blood Group </label>
                        <input
                          name="blood"
                          type="text"
                          placeholder="Enter blood group"
                          className="form-control"
                          value={basicInfo?.blood}
                          onChange={handleBasicInfo}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Job Role <span className="text-danger">*</span>
                        </label>
                        <select
                          disabled={!isAdmin}
                          className="custom-select"
                          name="jobRole"
                          value={basicInfo?.jobRole}
                          onChange={handleBasicInfo}
                        >
                          <option>Please Select role</option>
                          {roles?.map((r, index) => (
                            <option key={index} value={r?._id}>
                              {r?.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Work Location <span className="text-danger">*</span>
                        </label>
                        <select
                          disabled={!isAdmin}
                          className="custom-select"
                          name="workLocation"
                          value={basicInfo?.workLocation}
                          onChange={handleBasicInfo}
                        >
                          <option>Please Select location</option>
                          {locs?.map((loc, index) => (
                            <option key={index} value={loc?._id}>
                              {loc?.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Department <span className="text-danger">*</span>
                        </label>
                        <select
                          disabled={!isAdmin}
                          className="custom-select"
                          name="department"
                          value={basicInfo?.department}
                          onChange={handleBasicInfo}
                        >
                          <option>Please Select department</option>
                          {depts?.map((dept, index) => (
                            <option key={index} value={dept?._id}>
                              {dept?.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address  */}

                <div className="tab-pane fade show" id="emp_address">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          Present Address
                        </label>
                        <textarea
                          className="form-control"
                          cols="10"
                          rows="2"
                          placeholder="House No, Street"
                          name="addressLine1"
                          value={currentAddress?.addressLine1}
                          onChange={handleCurrentAddress}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={currentAddress?.city}
                          onChange={handleCurrentAddress}
                          onInput={toLowercase}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">State</label>
                        <select
                          style={{ height: '44px' }}
                          className="custom-select"
                          name="state"
                          value={currentAddress?.state}
                          onChange={handleCurrentAddress}
                        >
                          <option value=""></option>
                          {stateArr.map((a) => (
                            <option value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">Pin code</label>
                        <input
                          type="tel"
                          maxLength={6}
                          className="form-control"
                          name="postalCode"
                          value={currentAddress?.postalCode}
                          onChange={handleCurrentAddress}
                        />
                      </div>
                    </div>
                  </div>
                  {['checkbox'].map((type) => (
                    <div
                      //  key={`default-${type}`}
                      className="col-mb-3"
                    >
                      <Form.Check
                        onClick={(e) => handleAddress(e)}
                        // value={isChecked}
                        checked={isChecked}
                        // onChange={handle_Adress()}
                        type={type}
                        id={`default-${type}`}
                        label={`Same as Present `}
                      />
                    </div>
                  ))}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          Permanent Address
                        </label>
                        <textarea
                          className="form-control"
                          cols="10"
                          rows="2"
                          placeholder="House No, Street"
                          name="addressLine1"
                          value={permanentAddress?.addressLine1}
                          onChange={handleCurrentAddress}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={permanentAddress?.city}
                          onChange={handlePermanentAddress}
                          onInput={toLowercase}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">State</label>
                        <select
                          style={{ height: '44px' }}
                          className="custom-select"
                          name="state"
                          value={permanentAddress?.state}
                          onChange={handlePermanentAddress}
                        >
                          <option value=""></option>
                          {stateArr.map((a) => (
                            <option value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">Pin code</label>
                        <input
                          type="tel"
                          maxLength={6}
                          className="form-control"
                          name="postalCode"
                          value={permanentAddress?.postalCode}
                          onChange={handlePermanentAddress}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="submit-section">
                <button className="btn btn-primary submit-btn" type="submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmpPersonal;
