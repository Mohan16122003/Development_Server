import React, { useEffect, useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { toast } from 'react-toastify';
import httpService from '../../lib/httpService';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createNotify } from '../../features/notify/notifySlice';
import Swal from 'sweetalert2';
import { Button, Space } from 'antd';

import FileUploadService from '../../MainPage/Pages/Profile/FileUploadService';
import Form from 'react-bootstrap/Form';

const AddVendor = ({ fetchVendors, editForm = false, editVendorId = null }) => {
  const history = useHistory();

  const dispatch = useDispatch();

  const empId = useSelector((state) => state?.authentication?.value?.user?._id);

  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [company, setcompany] = useState('');
  const [name, setname] = useState('');
  const [email, setemail] = useState('');
  const [phone, setphone] = useState('');
  const [mobile, setmobile] = useState('');
  const [website, setwebsite] = useState('');
  const [vendorType, setvendorType] = useState('');
  const [currentFile, setcurrentFile] = useState('');

  // ///
  const [isChecked, setIsChecked] = useState(false);
  const [customerToAdd, setCustomerToAdd] = useState({
    contactPersons: [],
  });

  const [otherDetails, setotherDetails] = useState({
    pan: '',
    gst: '',
    openingBalance: '',
    paymentTerms: '',
    tds: '',
    currency: 'INR',
  });

  const [billAddress, setbillAddress] = useState('');

  const [shipAddress, setshipAddress] = useState('');

  const handle_Adress = (e) => {
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
          if (isChecked === false) {
            setshipAddress(billAddress);
          }
        } else {
          setshipAddress(shipAddress);
        }
      } else {
        setIsChecked(false);
      }
    });
  };

  // const personContactTemplate = {
  //   firstName: '',
  //   lastName: '',
  //   email: '',
  //   phone: '',
  //   mobile: '',
  //   editing: false,
  // };
  // const [personContact, setPersonContact] = useState([personContactTemplate]);

  const [dName, setdName] = useState([]);

  const handleotherDetails = (e) => {
    setotherDetails({ ...otherDetails, [e.target.name]: e.target.value });
  };

  const handlebillAddress = (e) => {
    setbillAddress(e.target.value);
  };

  const handleshipAddress = (e) => {
    setshipAddress(e.target.value);
  };

  // const addPersonContactField = () => {
  //   setPersonContact([...personContact, personContactTemplate]);
  // };

  const removePersonContactField = (e, index) => {
    if (index !== 0) {
      const updatedPersonContact = personContact.filter(
        (pct, i) => index !== i
      );
      setPersonContact(updatedPersonContact);
    }
  };

  const addPersonContactField = () => {
    setCustomerToAdd((prevState) => {
      return {
        ...prevState,
        contactPersons: [
          ...prevState?.contactPersons,
          {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            editing: true,
          },
        ],
      };
    });
  };

  const handlePersonContact = (e, index, property) => {
    setCustomerToAdd((prevState) => {
      prevState.contactPersons[index][property] = e.target.value;
      return {
        ...prevState,
        contactPersons: [...prevState?.contactPersons],
      };
    });
  };

  const toggleItemToEditing = (index) => {
    setCustomerToAdd((prevState) => {
      prevState.contactPersons[index].editing =
        !prevState?.contactPersons[index].editing;
      return { ...prevState };
    });
  };

  // const handlePersonContact = (e, index) => {
  //   const updatedPersonContact = personContact.map((pct, i) =>
  //     index == i ? Object.assign(pct, { [e.target.name]: e.target.value }) : pct
  //   );
  //   setPersonContact(updatedPersonContact);
  // };

  // const handlePersonContact = (e, index, property) => {
  //   setPersonContact((prevState) => {
  //     prevState.contactPersons[index][property] = e.target.value;
  //     return {
  //       ...prevState,
  //       contactPersons: [...prevState?.contactPersons],
  //     };
  //   });
  // };

  const addVendorData = async () => {
    if (!vendorType) {
      toast.error('Select Project');
      return;
    }
    const filedata = await FileUploadService.upload(currentFile);

    let vendorData = {
      // fileInfos : {
      //   fileName:filedata?.data.fileName ,
      //   filePath:filedata?.data.filePath
      // },
      fileInfos: filedata?.data,
      name,
      firstName,
      lastName,
      company,
      email,
      phone,
      mobile,
      website,
      vendorType,
      otherDetails,
      billAddress,
      shipAddress,
      personContact: { 
        ...customerToAdd,
        isChecked,
      },
    };

    toast
      .promise(
        httpService.post('/vendor', {
          ...vendorData,
        }),
        {
          error: 'Failed to add vendor',
          success: 'Vendor added successfully',
          pending: 'Adding vendor',
        }
      )
      .then((res) => {
        dispatch(
          createNotify({
            notifyHead: `Vendor ${res?.data?.name}`,
            notifyBody: `Vendor ${res?.data?.name} got Created`,
            createdBy: empId,
          })
        );
        history.goBack();
      });
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  const editVendor = async () => {
    let vendorData = {
      name,
      firstName,
      lastName,
      company,
      email,
      phone,
      mobile,
      website,
      vendorType,
      otherDetails,
      billAddress,
      shipAddress,
      personContact: {
        ...customerToAdd,
        isChecked,
      },
    };

    // const customerData =
    // console.log(customerData, 'customerData');

    toast
      .promise(
        httpService.put(`/vendor/${editVendorId}`, {
          ...vendorData,
        }),
        {
          error: 'Failed to edit vendor',
          success: 'Vendor edited successfully',
          pending: 'Editing vendor',
        }
      )
      .then((res) => {
        dispatch(
          createNotify({
            notifyHead: `Vendor ${res?.data?.name}`,
            notifyBody: `Vendor ${res?.data?.name} got Updated`,
            createdBy: empId,
          })
        );
        fetchVendors();
      });
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  async function fetchVendor(id) {
    const res = await httpService.get('/vendor/' + id);
    const vd = res.data;
    setfirstName(vd.firstName);
    setlastName(vd.lastName);
    setname(vd.name);
    setcompany(vd.company);
    setemail(vd.email);
    setphone(vd.phone);
    setmobile(vd.mobile);
    setwebsite(vd.website);
    setvendorType(vd.vendorType);
    setotherDetails(vd.otherDetails);
    setbillAddress(vd.billAddress);
    setshipAddress(vd.shipAddress);
    setPersonContact(vd.personContact);
  }

  useEffect(() => {
    if (editForm && editVendorId) {
      fetchVendor(editVendorId);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editForm) {
      editVendor();
    } else {
      addVendorData();
    }
  };

  const toInputUppercase = (e) => {
    e.target.value = ('' + e.target.value).toUpperCase();
  };

  const toCapitalize = (e) => {
    e.target.value =
      e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
  };

  let abc = [];
  const handleDName = () => {
    if (company) {
      abc.push(company);
    }
    if (firstName) {
      abc.push(`${firstName} ${lastName}`);
      if (lastName) {
        abc.push(`${lastName} ${firstName}`);
      }
    }
    setdName([...abc]);
  };

  // let stateArr = [
  //   'Andhra Pradesh',
  //   'Arunachal Pradesh',
  //   'Assam',
  //   'Bihar',
  //   'Chhattisgarh',
  //   'Goa',
  //   'Gujarat',
  //   'Haryana',
  //   'Himachal Pradesh',
  //   'Jammu and Kashmir',
  //   'Jharkhand',
  //   'Karnataka',
  //   'Kerala',
  //   'Madhya Pradesh',
  //   'Maharashtra',
  //   'Manipur',
  //   'Meghalaya',
  //   'Mizoram',
  //   'Nagaland',
  //   'Odisha',
  //   'Punjab',
  //   'Rajasthan',
  //   'Sikkim',
  //   'Tamil Nadu',
  //   'Telangana',
  //   'Tripura',
  //   'Uttarakhand',
  //   'Uttar Pradesh',
  //   'West Bengal',
  //   'Andaman and Nicobar Islands',
  //   'Chandigarh',
  //   'Dadra and Nagar Haveli',
  //   'Daman and Diu',
  //   'Delhi',
  //   'Lakshadweep',
  //   'Puducherry',
  // ];

  // const toggleItemToEditing = (index) => {
  //   setPersonContact((prevState) => {
  //     prevState.contactPersons[index].editing =
  //       !prevState?.contactPersons[index].editing;
  //     return { ...prevState };
  //   });
  // };

  const handleAddModifyItemForm = (index) => {
    const item = customerToAdd?.contactPersons[index];
    if (item?.firstName === '') {
      return toast.error(`First Name Required at ${++index}th row.`);
    } else if (item?.lastName === '') {
      return toast.error(`Last Name Required at ${++index}th row.`);
    } else if (item?.email === '') {
      return toast.error(`Email Required at ${++index}th row.`);
    } else if (item?.phone === '') {
      return toast.error(`Phone Required at ${++index}th row.`);
    } else {
      toggleItemToEditing(index);
    }
  };

  return (
    <div className="page-wrapper"> 
      <Helmet>
        <title>Add Vendor</title>
        <meta name="description" content="Add vendor" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col">
              <h3 className="page-title">Add Vendor</h3>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="col-form-label">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => {
                        setfirstName(e.target.value);
                      }}
                      onBlur={handleDName}
                      onInput={toCapitalize}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="col-form-label">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      name="lastName"
                      value={lastName}
                      onChange={(e) => {
                        setlastName(e.target.value);
                      }}
                      className="form-control"
                      type="text"
                      onBlur={handleDName}
                      onInput={toCapitalize}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label className="col-form-label">Company</label>
                    <input
                      name="company"
                      value={company}
                      onChange={(e) => {
                        setcompany(e.target.value);
                      }}
                      onBlur={handleDName}
                      className="form-control floating"
                      type="text"
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label className="col-form-label">
                      Vendor Display Name <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      name="name"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      onFocus={handleDName}
                      required
                    >
                      {editForm ? (
                        <option value={name}>{name}</option>
                      ) : (
                        <option value="">Select Display Name</option>
                      )}
                      <div className="dropdown-divider"></div>
                      {dName.map((d) => (
                        <option value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Email <span className="text-danger"></span>
                    </label>
                    <input
                      name="email"
                      placeholder="Email."
                      pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}{@}"
                      title="Please enter valid Email. E.g. r@gmail.com"
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                      className="form-control"
                      type="email"
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      name="website"
                      value={website}
                      onChange={(e) => setwebsite(e.target.value)}
                      className="form-control"
                      type="text"
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>Work Phone</label>
                    <input
                      name="phone"
                      value={phone}
                      onChange={(e) => setphone(e.target.value)}
                      className="form-control floating"
                      type="tel"
                      maxLength={10}
                      // required
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Mobile <span className="text-danger">*</span>
                    </label>
                    <input
                      name="mobile"
                      value={mobile}
                      onChange={(e) => setmobile(e.target.value)}
                      className="form-control floating"
                      type="tel"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Vendor Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      name="vendorType"
                      value={vendorType}
                      required
                      onChange={(e) => setvendorType(e.target.value)}
                    >
                      <option value="">Select Vendor Type</option>
                      <option value="supplier">supplier</option>
                      <option value="agent">agent</option>
                    </select>
                  </div>
                </div>
                {/* <div className="row"> */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Upload your Pic </label>
                    <div className="custom-file">
                      <input
                        name="resumeFile"
                        type="file"
                        className="custom-file-input"
                        id="cv_upload"
                        value={currentFile?.fileName}
                        onChange={(e) => setcurrentFile(e.target.files[0])}
                      />
                      <label
                        className="custom-file-label"
                        htmlFor="cv_upload"
                        value={currentFile?.fileName}
                      >
                        {currentFile?.fileName || currentFile?.name ? (
                          <span className="">
                            {' '}
                            {currentFile?.name} {currentFile?.fileName}{' '}
                          </span>
                        ) : (
                          'Choose file'
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                {/* </div> */}
              </div>

              <div style={{ paddingLeft: '0px' }} className="col-md-12 p-r-0">
                <div className="card tab-box">
                  <div className="row user-tabs">
                    <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                      <ul className="nav nav-tabs nav-tabs-bottom">
                        <li className="nav-item">
                          <a
                            href="#vendor_other_details"
                            data-toggle="tab"
                            className="nav-link active"
                            // onClick={(e) => setShowTrx(!showTrx)}
                          >
                            Other Details
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#vendor_address"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Address
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#vendor_con"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Contact Person
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* Other Details  */}
              <div
                style={{
                  minHeight: '65vh',
                  maxHeight: '65vh',
                  overflowY: 'auto',
                }}
                className="card p-4 tab-content"
              >
                <div
                  className="tab-pane fade show active"
                  id="vendor_other_details"
                >
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>PAN</label>
                        <input
                          placeholder="PAN No."
                          maxLength="10"
                          pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}"
                          title="Please enter valid PAN number. E.g. AAAAA9999A"
                          className="form-control"
                          type="text"
                          name="pan"
                          value={otherDetails.pan}
                          onChange={handleotherDetails}
                          onInput={toInputUppercase}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>GST</label>
                        <input
                          placeholder="GST No."
                          maxLength="15"
                          pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                          title="Please enter valid PAN number. E.g. 99AAAFA9999A1Z5"
                          className="form-control"
                          type="text"
                          name="gst"
                          value={otherDetails.gst}
                          onChange={handleotherDetails}
                          onInput={toInputUppercase}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Opening Balance</label>
                        <input
                          className="form-control"
                          type="number"
                          // step={0.01}
                          onWheel={(e) => e.target.blur()}
                          placeholder="0"
                          name="openingBalance"
                          value={otherDetails.openingBalance}
                          onChange={handleotherDetails}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label> Payment Terms</label>
                        <select
                          className="custom-select"
                          name="paymentTerms"
                          value={otherDetails.paymentTerms}
                          onChange={handleotherDetails}
                        >
                          <option value=""></option>
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Net 45">Net 45</option>
                          <option value="Net 60">Net 60</option>
                          <option value="Due end of the Month">
                            Due end of the Month
                          </option>
                          <option value="Due end of next Month">
                            Due end of next Month
                          </option>
                          <option value="Due on Receipt">Due on Receipt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>TDS</label>
                        <select
                          className="custom-select"
                          name="tds"
                          value={otherDetails.tds}
                          onChange={handleotherDetails}
                        >
                          <option value=""></option>
                          <option value="Commission or Brokerage - [5 %]">
                            Commission or Brokerage - [5 %]
                          </option>
                          <option value="Commission or Brokerage (Reduced) - [3.75 %]">
                            Commission or Brokerage (Reduced) - [3.75 %]
                          </option>
                          <option value="Dividend - [10 %]">
                            Dividend - [10 %]
                          </option>
                          <option value="Dividend (Reduced) - [7.5 %]">
                            Dividend (Reduced) - [7.5 %]
                          </option>
                          <option value="ther Interest than securities - [10 %]">
                            Other Interest than securities - [10 %]
                          </option>
                          <option value="Other Interest than securities (Reduced) - [7.5 %]">
                            Other Interest than securities (Reduced) - [7.5 %]
                          </option>
                          <option value="Payment of contractors for Others - [2 %]">
                            Payment of contractors for Others - [2 %]
                          </option>
                          <option value="Payment of contractors for Others (Reduced) - [1.5 %]">
                            Payment of contractors for Others (Reduced) - [1.5
                            %]
                          </option>
                          <option value="Professional Fees - [10 %]">
                            Professional Fees - [10 %]
                          </option>
                          <option value="Professional Fees (Reduced) - [7.5 %]">
                            Professional Fees (Reduced) - [7.5 %]
                          </option>
                          <option value="Rent on land or furniture - [10 %]">
                            Rent on land or furniture - [10 %]
                          </option>
                          <option value="Rent on land or furniture (Reduced) - [7.5 %]">
                            Rent on land or furniture (Reduced) - [7.5 %]
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group d-none">
                        <label>Currency</label>
                        <select
                          className="custom-select"
                          name="currency"
                          value={otherDetails.currency}
                          onChange={handleotherDetails}
                          disabled
                        >
                          <option value="INR">INR - Indian Rupee</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Address  */}
                {/* <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">Attention</label>
                        <input
                          type="text"
                          id=""
                          className="form-control"
                          name="attention"
                          value={billAddress.attention}
                          onChange={handlebillAddress}
                          onInput={toCapitalize}
                        />
                      </div>
                    </div>
                  </div> */}
                <div className="tab-pane fade show" id="vendor_address">
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
                          name="address"
                          value={billAddress}
                          onChange={handlebillAddress}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  {/* <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={billAddress?.city}
                          onChange={handlebillAddress}
                          onInput={toCapitalize}
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
                          value={billAddress?.state}
                          onChange={handlebillAddress}
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
                        <label className="col-form-label">Pincode</label>
                        <input
                          type="tel"
                          maxLength={6}
                          className="form-control"
                          name="postalCode"
                          value={billAddress?.postalCode}
                          onChange={handlebillAddress}
                        />
                      </div>
                    </div>

                  </div> */}

                  {/* {isChecked} */}
                  {['checkbox'].map((type) => (
                    <div
                      //  key={`default-${type}`}
                      className="col-mb-3"
                    >
                      <Form.Check
                        onChange={handle_Adress}
                        checked={isChecked}
                        type={'checkbox'}
                        id={`default-checkbox`}
                        label={`Same as Present `}
                      />
                    </div>
                  ))}

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          {' '}
                          Permanent Address
                        </label>
                        <textarea
                          className="form-control"
                          cols="10"
                          rows="2"
                          placeholder="House No, Street"
                          name="address"
                          value={shipAddress}
                          onChange={handleshipAddress}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="Permanentcity"
                          value={shipAddress?.city}
                          onChange={handleshipAddress}
                          onInput={toCapitalize}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">State</label>
                        <select
                          style={{ height: '44px' }}
                          className="custom-select"
                          name="Permanentstate"
                          value={shipAddress?.state}
                          onChange={handleshipAddress}
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
                        <label className="col-form-label">Pincode</label>
                        <input
                          type="tel"
                          maxLength={6}
                          className="form-control"
                          name="PermanentpostalCode"
                          value={shipAddress?.pincode}
                          onChange={handleshipAddress}
                        />
                      </div>
                    </div>
                  </div> */}


                  {/* <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">Local Contact</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="localcontact"
                          value={address?.}
                          maxLength={10}
                          onChange={handleaddress}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          {' '}
                          Emergency Contact
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="emergencyContact"
                          maxLength={10}
                          value={address?.emergencyContact}
                          onChange={handleaddress}
                        />
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Person Contact  */}
                {/* <div className="tab-pane fade show" id="vendor_con">
                  <div className="row">
                    <div className="col-md-12 col-sm-12">
                      <div className="table-responsive">
                        <table className="table table-hover table-white">
                          <thead>
                            <tr className="text-center">
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Email Address</th>
                              <th>Work phone</th>
                              <th>Mobile</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {personContact.map((p, index) => (
                              <tr className="text-center" key={index}>
                                <td>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="firstName"
                                    value={p.firstName}
                                    onChange={(e) =>
                                      handlePersonContact(e, index)
                                    }
                                    onInput={toCapitalize}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="lastName"
                                    value={p.lastName}
                                    onChange={(e) =>
                                      handlePersonContact(e, index)
                                    }
                                    onInput={toCapitalize}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control"
                                    type="email"
                                    name="email"
                                    value={p.email}
                                    onChange={(e) =>
                                      handlePersonContact(e, index)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control"
                                    type="number"
                                    maxLength={10}
                                    name="phone"
                                    value={p.phone}
                                    onChange={(e) =>
                                      handlePersonContact(e, index)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control"
                                    type="number"
                                    maxLength={10}
                                    name="mobile"
                                    value={p.mobile}
                                    onChange={(e) =>
                                      handlePersonContact(e, index)
                                    }
                                  />
                                </td>
                                <td>
                                  
                                  <div
                                    className=""
                                    onClick={(e) =>
                                      removePersonContactField(e, index)
                                    }
                                  >
                                    <DeleteForeverIcon />
                                  </div>
                                  
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div
                          className="btn btn-primary"
                          onClick={addPersonContactField}
                        >
                          + Add Contacts
                        </div>
                      </div>
                    </div>
                  </div>
                 
                </div> */}

                {/*  */}
                <div className="tab-pane fade show" id="vendor_con">
                  {/* <div className="tab-pane fade show" id="emp_contact"> */}
                  <div className="row">
                    <div className="col-md-12 col-sm-12">
                      <div className="table-responsive">
                        <table className="table table-hover table-white">
                          <thead>
                            <tr className="text-center">
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Email</th>
                              <th>Mobile</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerToAdd?.contactPersons?.map(
                              (personContact, index) => (
                                <tr className="text-center" key={index}>
                                  <td>
                                    <input
                                      required
                                      readOnly={!personContact.editing}
                                      className="form-control"
                                      type="text"
                                      name="firstName"
                                      value={personContact?.firstName}
                                      onChange={(e) =>
                                        handlePersonContact(
                                          e,
                                          index,
                                          'firstName'
                                        )
                                      }
                                      onInput={toCapitalize}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      required
                                      readOnly={!personContact.editing}
                                      className="form-control"
                                      type="text"
                                      name="lastName"
                                      value={personContact?.lastName}
                                      onChange={(e) =>
                                        handlePersonContact(
                                          e,
                                          index,
                                          'lastName'
                                        )
                                      }
                                      onInput={toCapitalize}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      required
                                      readOnly={!personContact.editing}
                                      className="form-control"
                                      type="email"
                                      name="email"
                                      value={personContact?.email}
                                      onChange={(e) =>
                                        handlePersonContact(e, index, 'email')
                                      }
                                      // onInput={toCapitalize}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      required
                                      readOnly={!personContact.editing}
                                      className="form-control"
                                      type="tel"
                                      maxLength={10}
                                      name="phone"
                                      value={personContact?.phone}
                                      onChange={(e) =>
                                        handlePersonContact(e, index, 'phone')
                                      }
                                    />
                                  </td>
                                  <td className={'align-middle'}>
                                    {personContact.editing ? (
                                      <Space size={'small'}>
                                        <Button
                                          style={{
                                            width: 80,
                                          }}
                                          disabled={personContact.editing}
                                          onClick={() =>
                                            toggleItemToEditing(index)
                                          }
                                          icon={
                                            <i className="fa fa-pencil mr-1" />
                                          }
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          htmlType={'submit'}
                                          style={{
                                            width: 80,
                                          }}
                                          onClick={(e) =>
                                            handleAddModifyItemForm(index)
                                          }
                                          icon={
                                            <i className="fa fa-save mr-1" />
                                          }
                                        >
                                          Save
                                        </Button>
                                      </Space>
                                    ) : (
                                      <Space size={'small'}>
                                        <Button
                                          style={{
                                            width: 80,
                                          }}
                                          onClick={() =>
                                            toggleItemToEditing(index)
                                          }
                                          icon={
                                            <i className="fa fa-pencil mr-1" />
                                          }
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          style={{
                                            width: 80,
                                          }}
                                          icon={
                                            <i className="fa fa-trash-o mr-1" />
                                          }
                                          onClick={(e) => removeItem(e, index)}
                                          danger
                                        >
                                          Delete
                                        </Button>
                                      </Space>
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                        <div
                          className="btn btn-primary"
                          onClick={addPersonContactField}
                        >
                          + Add Contacts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/*  */}

              {/*  */}
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

export default AddVendor;
