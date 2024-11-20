import React, { useEffect, useState } from 'react';
import '../../antdstyle.css';
import 'antd/dist/antd.css';
import Swal from 'sweetalert2';

import httpService from '../../../lib/httpService';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { createNotify } from '../../../features/notify/notifySlice';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { Button, Space } from 'antd';

const AddCustomers = () => {
  const history = useHistory();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const empObj = useSelector((state) => state?.authentication?.value?.user);
  const [isChecked, setIsChecked] = useState(false);
  const [customerToAdd, setCustomerToAdd] = useState({
    contactPersons: [],
  });

  // const [form, setForm] = useState('Other Details');
  const [customerType, setCustomerType] = useState('Business');

  useEffect(() => {
    if (state?.edit) {
      const {
        shippingAddress,
        companyName,
        contactPersons,
        contactPersonsData,
        displayName,
        email,
        facebook,
        salutation,
        firstName,
        lastName,
        customerType,
        openingBalance,
        paidBalance,
        pan,
        phone,
        remarks,
        billingAddress,
        twitter,
        website,
        workPhone,
        isChecked,
      } = state;
      setCustomerToAdd({
        shippingAddress,
        companyName,
        contactPersons: contactPersonsData || contactPersons,
        displayName,
        email,
        facebook,
        salutation,
        firstName,
        lastName,
        openingBalance,
        paidBalance,
        pan,
        phone,
        remarks,
        billingAddress,
        twitter,
        website,
        workPhone,
      });
      console.log(state, 'statestate');
      // const billingAddressCmp = JSON.stringify(billingAddress);
      // const shippingAddressCmp = JSON.stringify(shippingAddress);
      // if (shippingAddressCmp !== JSON.stringify({})) {
      //   setIsChecked(shippingAddressCmp === billingAddressCmp);
      // }
      setCustomerType(customerType);
    }
  }, []);

  const handleAdd = async () => {
    console.log('handleAdd');
    if (!customerToAdd?.shippingAddress?.addressLine1.length < 1) {
      if (!customerToAdd?.shippingAddress?.city) {
        toast.error(' Address city is Required');
        return;
      }
      if (!customerToAdd?.shippingAddress?.state) {
        toast.error('State  is Required');
        return;
      }
      if (!customerToAdd?.shippingAddress?.zipcode) {
        toast.error('Zipcode  is Required');
        return;
      }
    }

    if (!customerToAdd?.displayName) {
      toast.error('Display Name is Required');
      return;
    }

    if (!customerToAdd?.email) {
      toast.error('Email is Required');
      return;
    }

    // if(!customerToAdd?.phone){
    //   toast.error("Phone Number is Required");
    //   return;
    //   }

    if (!customerToAdd?.lastName) {
      toast.error(' last name is Required');
      return;
    }

    console.log('beforeCustomerData');
    const customerData = {
      ...customerToAdd,
      customerType,
      isChecked,
    };
    console.log(customerData, 'customerData');

    if (state?.edit) {
      toast
        .promise(httpService.put(`/customer/${state?._id}`, customerData), {
          pending: 'Uploading Customers',
          success: 'Customer Updated!',
          error: 'There was some problem while creating the customer',
        })
        .then((res) => {
          dispatch(
            createNotify({
              notifyHead: `Customer Updated`,
              notifyBody: `Customer ${res?.data?.displayName} is updated`,
              createdBy: empObj?._id,
            })
          );
          history.goBack();
        });
    } else {
      toast
        .promise(httpService.post('/customer', customerData), {
          pending: 'Uploading Customers',
          success: 'Customer Created!',
          error: 'There was some problem while creating the customer',
        })
        .then((res) => {
          dispatch(
            createNotify({
              notifyHead: `New Customer Added`,
              notifyBody: `Customer ${res?.data?.displayName} is created`,
              createdBy: empObj?._id,
            })
          );
          history.goBack();
        });
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

  const removePersonContactField = (index) => {
    setCustomerToAdd((prevState) => {
      return {
        ...prevState,
        contactPersons: prevState?.contactPersons?.filter(
          (item, idx) => index !== idx
        ),
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

  const toInputUppercase = (e) => {
    e.target.value = ('' + e.target.value).toUpperCase();
  };

  const toCapitalize = (e) => {
    e.target.value =
      e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
  };
  const handleAddress = (e) => {
    console.log(e.target.value, isChecked, 'isChecked');
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
          setCustomerToAdd({
            ...customerToAdd,
            billingAddress: {
              ...customerToAdd?.shippingAddress,
            },
          });
        } else {
          setCustomerToAdd({
            ...customerToAdd,
            billingAddress: {
              attention: '',
              addressLine1: '',
              state: '',
              city: '',
              zipcode: '',
            },
          });
        }
      } else {
        setIsChecked(false);
      }
    });
  };
  // console.log('aaaaaaaaaaa,', customerToAdd)
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
    <div className="page-wrapper">
      <Helmet>
        <title>Add Customer</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Add Customer</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Add Customer</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleAdd();
                e.target.reset();
              }}
            >
              <div className="row mb-4">
                <label className="col-sm-2 col-form-label">Customer Type</label>
                <div className="col-sm-8">
                  {/* <div className="row"> */}
                  <input
                    onClick={(e) => {
                      setCustomerType('Business');
                    }}
                    className="form-check-input"
                    type="radio"
                    name="customerType"
                    id="radio1"
                    value="option1"
                    checked={customerType === 'Business'}
                  />
                  <label className="form-check-label mr-2" htmlFor="radio1">
                    Business
                  </label>
                  <input
                    onClick={(e) => {
                      setCustomerType('Individual');
                    }}
                    className="form-check-input ml-2"
                    type="radio"
                    name="customerType"
                    id="radio1"
                    value="option2"
                    checked={customerType === 'Individual'}
                  />
                  <label className="form-check-label ml-4" htmlFor="radio2">
                    Individual
                  </label>
                  {/* </div> */}
                </div>
              </div>
              <div className="col-md-12 p-0">
                <label className="col-form-label">
                  <span>
                    Primary Contact <span className="text-danger"> *</span>
                  </span>
                </label>
                <div className="row">
                  <div className="col-sm-2">
                    <select
                      className="form-control"
                      // placeholder='salutation'
                      name="salutation"
                      value={customerToAdd?.salutation}
                      onChange={(e) => {
                        setCustomerToAdd({
                          ...customerToAdd,
                          salutation: e.target.value,
                        });
                      }}
                    >
                      <option value={''}>Select Salutation</option>
                      {['Mr.', 'Mrs.', 'Ms.', 'Miss.', 'Dr.'].map(
                        (s, index) => (
                          <option key={index} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="col-sm-3">
                    <input
                      value={customerToAdd?.firstName}
                      defaultValue={customerToAdd?.firstName}
                      onChange={(e) => {
                        setCustomerToAdd({
                          ...customerToAdd,
                          firstName: e.target.value,
                          displayName: '',
                        });
                      }}
                      placeholder="First Name"
                      className="form-control"
                      onInput={toCapitalize}
                      required
                    />
                  </div>
                  <div className="col-sm-3">
                    <input
                      value={customerToAdd?.lastName}
                      defaultValue={customerToAdd?.lastName}
                      required
                      onChange={(e) => {
                        setCustomerToAdd({
                          ...customerToAdd,
                          lastName: e.target.value,
                          displayName: '',
                        });
                      }}
                      placeholder="Last Name"
                      className="form-control"
                      onInput={toCapitalize}
                    />
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      Company Name<span className="text-danger">*</span>
                    </label>
                    <input
                      defaultValue={customerToAdd?.companyName}
                      onChange={(e) => {
                        setCustomerToAdd({
                          ...customerToAdd,
                          companyName: e.target.value,
                        });
                      }}
                      className="form-control"
                      type="text"
                      onInput={toCapitalize}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      Customer Display Name{' '}
                      <span className="text-danger">*</span>
                    </label>

                    <select
                      value={customerToAdd?.displayName}
                      // defaultValue={customerToAdd?.displayName}
                      // value={customerToAdd?.displayName}
                      onChange={(e) => {
                        setCustomerToAdd({
                          ...customerToAdd,
                          displayName: e.target.value,
                        });
                      }}
                      type="text"
                      className="form-control"
                      required
                    >
                      <option value={''}>Select</option>
                      {customerToAdd?.firstName && customerToAdd?.lastName && (
                        <option
                          value={`${customerToAdd?.firstName} ${customerToAdd?.lastName}`}
                        >{`${customerToAdd?.firstName} ${customerToAdd?.lastName}`}</option>
                      )}
                      {customerToAdd?.firstName && customerToAdd?.lastName && (
                        <option
                          value={`${customerToAdd?.lastName}, ${customerToAdd?.firstName}`}
                        >{`${customerToAdd?.lastName}, ${customerToAdd?.firstName}`}</option>
                      )}
                      {customerToAdd?.companyName && (
                        <option
                          value={`${customerToAdd?.companyName}`}
                        >{`${customerToAdd?.companyName}`}</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      Customer Email <span className="text-danger">*</span>
                    </label>
                    <input
                      defaultValue={customerToAdd?.email}
                      onChange={(e) => {
                        setCustomerToAdd({
                          ...customerToAdd,
                          email: e.target.value,
                        });
                      }}
                      type="email"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="from-group">
                    <label>
                      Customer Phone <span className="text-danger">*</span>
                    </label>
                    <div className="row">
                      <div className="col-sm-6">
                        <input
                          placeholder="Phone"
                          defaultValue={customerToAdd?.phone}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              phone: e.target.value,
                            });
                          }}
                          type="tel"
                          className="form-control"
                          maxLength={10}
                        />
                      </div>
                      <div className="col-sm-6">
                        <input
                          placeholder="Work Phone"
                          defaultValue={
                            customerToAdd?.workPhone || customerToAdd?.phone
                          }
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              workPhone: e.target.value,
                            });
                          }}
                          type="tel"
                          className="form-control"
                          maxLength={10}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      defaultValue={customerToAdd?.website}
                      onChange={(e) => {
                        setCustomerToAdd({
                          ...customerToAdd,
                          website: e.target.value,
                        });
                      }}
                      type="text"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
              <hr />

              <div style={{ paddingLeft: '0px' }} className="col-md-12 p-r-0">
                <div className="card tab-box">
                  <div className="row user-tabs">
                    <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                      <ul className="nav nav-tabs nav-tabs-bottom">
                        <li className="nav-item">
                          <a
                            href="#customer_other_details"
                            data-toggle="tab"
                            className="nav-link active"
                            // onClick={(e) => setShowTrx(!showTrx)}
                          >
                            Other Details
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#customer_address"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Address
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#customer_con"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Contact Person
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#customer_remark"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Remarks
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
                <div
                  className="tab-pane fade show active"
                  id="customer_other_details"
                >
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>PAN</label>
                        <input
                          placeholder="PAN No."
                          maxLength="10"
                          pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}"
                          title="Please enter valid PAN number. E.g. AAAAA9999A"
                          defaultValue={customerToAdd?.pan}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              pan: e.target.value,
                            });
                          }}
                          type="text"
                          className="form-control"
                          onInput={toInputUppercase}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">GST Number</label>
                        <input
                          placeholder="GST No."
                          maxLength="15"
                          pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                          title="Please enter valid PAN number. E.g. 99AAAFA9999A1Z5"
                          className="form-control"
                          type="text"
                          name="gst"
                          value={customerToAdd?.gst}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              gst: e.target.value,
                            });
                          }}
                          onInput={toInputUppercase}
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Opening Balance (INR)</label>
                        <input
                          onWheel={(e) => e.currentTarget.blur()}
                          value={customerToAdd?.openingBalance}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              openingBalance: e.target.value,
                            });
                          }}
                          type="number"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Facebook ID</label>
                        <input
                          defaultValue={customerToAdd?.facebook}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              facebook: e.target.value,
                            });
                          }}
                          type="text"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="from-group">
                        <label>Twitter ID</label>
                        <input
                          defaultValue={customerToAdd?.twitter}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              twitter: e.target.value,
                            });
                          }}
                          type="text"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade show" id="customer_address">
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
                          value={customerToAdd?.shippingAddress?.attention}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              shippingAddress: {
                                ...customerToAdd?.shippingAddress,
                                attention: e.target.value,
                                addressLine1: e.target.value,
                              },
                            });
                          }}
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
                          value={customerToAdd?.shippingAddress?.city}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              shippingAddress: {
                                ...customerToAdd?.shippingAddress,
                                city: e.target.value,
                              },
                            });
                          }}
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
                          value={customerToAdd?.shippingAddress?.state}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              shippingAddress: {
                                ...customerToAdd?.shippingAddress,
                                state: e.target.value,
                              },
                            });
                          }}
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
                          value={customerToAdd?.shippingAddress?.zipcode}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              shippingAddress: {
                                ...customerToAdd?.shippingAddress,
                                zipcode: e.target.value,
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    //  key={`default-${type}`}
                    className="col-mb-3"
                  >
                    <Form.Check
                      onChange={handleAddress}
                      checked={isChecked}
                      type={'checkbox'}
                      id={`default-checkbox`}
                      label={`Same as Present `}
                    />
                  </div>
                  <br></br>
                  <hr></hr>
                  <div className="row">
                    <div className="col-sm-6 col-md-6">
                      <div className="form-group">
                        <label>Permanent Address</label>
                        <textarea
                          name="addressLine1"
                          value={customerToAdd?.billingAddress?.addressLine1}
                          placeholder="House No, Street"
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              billingAddress: {
                                ...customerToAdd?.billingAddress,
                                addressLine1: e.target.value,
                              },
                            });
                          }}
                          type="text"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          value={customerToAdd?.billingAddress?.city}
                          placeholder="City"
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              billingAddress: {
                                ...customerToAdd?.billingAddress,
                                city: e.target.value,
                              },
                            });
                          }}
                          type="text"
                          className="form-control"
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
                          value={customerToAdd?.billingAddress?.state}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              billingAddress: {
                                ...customerToAdd?.billingAddress,
                                state: e.target.value,
                              },
                            });
                          }}
                        >
                          <option value=""></option>
                          {stateArr.map((a) => (
                            <option value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          value={customerToAdd?.billingAddress?.zipcode}
                          onChange={(e) => {
                            setCustomerToAdd({
                              ...customerToAdd,
                              billingAddress: {
                                ...customerToAdd?.billingAddress,
                                zipcode: e.target.value,
                              },
                            });
                          }}
                          type="tel"
                          className="form-control"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* //select */}
                <div className="tab-pane fade show" id="customer_con">
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
                <div className="tab-pane fade show" id="customer_remark">
                  <div className="col-md-6">
                    <p>
                      Remarks{' '}
                      <span className="text-secondary fs-6">
                        (for internal use only)
                      </span>
                    </p>
                    <textarea
                      defaultValue={customerToAdd?.remarks}
                      placeholder="Remark"
                      onChange={(e) => {
                        setCustomerToAdd({
                          ...customerToAdd,
                          remarks: e.target.value,
                        });
                      }}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
              <div className="submit-section">
                <button className="btn btn-primary submit-btn mb-4">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomers;
