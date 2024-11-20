import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import httpService from '../../../lib/httpService';
import { useDispatch, useSelector } from 'react-redux';
import { createNotify } from '../../../features/notify/notifySlice';
import { Avatar_02 } from '../../../Entryfile/imagepath';
import { dateFormatter } from '../../../misc/helpers';
import { GENDERS } from '../../../model/shared/genders';

const AddEmpAuth = ({ candData: candidate, setRerender }) => {

  const dispatch = useDispatch();

  const empObj = useSelector((state) => state?.authentication?.value?.user);

  const [roles, setRoles] = useState([]);

  const [empData, setEmpData] = useState({
    firstName: candidate?.firstName || '',
    lastName: candidate?.lastName || '',
    userName: '',
    email: candidate?.email || '',
    password: '',
    cnfPassword: '',
    joinDate: '',
    mobileNo: candidate?.mobile || '',
    jobRole: ''
  });

  const handleChange = (e) => {
    setEmpData({ ...empData, [e.target.name]: e.target.value });
  };

  const fetchRoles = async () => {
    const roles = await httpService.get('/role');
    setRoles(roles?.data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleNewSubmit = async (e) => {
    e.preventDefault();
    console.log(empData);
    if (empData.password !== empData.cnfPassword) {
      toast.error('Password and Confirm Password does not match');
      return;
    }
    if (empData.jobRole == '' || empData.jobRole == 'Please Select role') {
      // alert("Please select a job role");
      toast.error('Please select a job role');
      return;
    }
    const empRes = await httpService.post('/employee', { ...empData, userName: empData?.email });

    if (empRes.status === 201) {
      dispatch(createNotify({
        notifyHead: `New Employee Added`,
        notifyBody: `Employee ${empRes?.data?.userName} is created`,
        createdBy: empObj?._id
      }));

      await httpService.put(`/candidate/${candidate._id}`, { isEmployee: true, employeeId: empRes.data._id });
      await setRerender(true);
      document.querySelectorAll('.close')?.forEach((e) => e.click());
    }

  };

  return (
    <div id='add_emp_login' className='modal custom-modal fade' role='dialog'>
      <div
        className='modal-dialog modal-dialog-centered modal-lg'
        role='document'
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Profile Information</h5>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              aria-label='Close'
            >
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='modal-body'>
            <form>
              <div className='row'>
                <div className='col-md-12'>
                  <div className='profile-img-wrap edit-img'>
                    <img
                      className='inline-block'
                      src={Avatar_02}
                      alt='user'
                    />
                    <div className='fileupload btn'>
                      <span className='btn-text'>edit</span>
                      <input className='upload' type='file' />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='form-group'>
                        <label>First Name</label>
                        <input
                          required
                          name='firstName'
                          type='text'
                          className='form-control'
                          defaultValue={candidate?.firstName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='form-group'>
                        <label>Last Name</label>
                        <input
                          required
                          name='lastName'
                          type='text'
                          className='form-control'
                          defaultValue={candidate?.lastName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='form-group'>
                        <label>Email</label>
                        <input
                          required
                          name='email'
                          type='text'
                          className='form-control'
                          defaultValue={candidate?.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='form-group'>
                        <label>Birth Date</label>
                        <div>
                          <input
                            required
                            name='dob'
                            className='form-control'
                            type='date'
                            defaultValue={dateFormatter(candidate?.dob)}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='form-group'>
                        <label>Gender</label>
                        <div className='form-group form-focus focused text-left'>
                          <a
                            className='btn form-control btn-white dropdown-toggle'
                            href='#'
                            data-toggle='dropdown'
                            aria-expanded='false'
                          >
                            {empData?.gender || 'Gender'}
                          </a>
                          <div className='dropdown-menu dropdown-menu-right'>
                            {GENDERS.map((gender) => (
                              <span
                                className='dropdown-item'
                                onClick={() =>
                                  setEmpData({
                                    ...empData,
                                    gender: gender
                                  })
                                }
                              >
                                  {gender}
                                </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='form-group'>
                        <label>
                          Job Role <span className='text-danger'>*</span>
                        </label>
                        <div className='form-focus focused text-left'>
                          <a
                            className='btn form-control btn-white dropdown-toggle'
                            href='#'
                            data-toggle='dropdown'
                            aria-expanded='false'
                          >
                            {empData?.jobRole?.name || 'Job Role'}
                          </a>
                          <div className='dropdown-menu dropdown-menu-right'>
                            {roles.map((role) => (
                              <span
                                className='dropdown-item'
                                onClick={() =>
                                  setEmpData({
                                    ...empData,
                                    jobRole: { ...role }
                                  })
                                }
                              >
                              {role?.name}
                            </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='form-group'>
                        <label>Employee ID</label>
                        <input
                          type='text'
                          className='form-control'
                          defaultValue={'KN-0000XXX'}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*<div className='row'>
                <div className='col-md-12'>
                  <div className='form-group'>
                    <label>Address</label>
                    <input
                      type='text'
                      className='form-control'
                      defaultValue={employee?.address?.addressLine1
                        .concat(', ')
                        .concat(employee?.address?.addressLine2)
                        .concat(', ')
                        .concat(employee?.address?.city)}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          address: {
                            ...empData.address,
                            addressLine1: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>State</label>
                    <input
                      type='text'
                      className='form-control'
                      defaultValue={employee?.address?.state}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          address: {
                            ...empData.address,
                            state: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>Country</label>
                    <input
                      type='text'
                      className='form-control'
                      defaultValue={employee?.address?.country}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          address: {
                            ...empData.address,
                            country: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>Pin Code</label>
                    <input
                      type='text'
                      className='form-control'
                      defaultValue={employee?.address?.postalCode}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          address: {
                            ...empData.address,
                            postalCode: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>Phone Number</label>
                    <input
                      name='mobileNo'
                      type='text'
                      className='form-control'
                      defaultValue={employee?.mobileNo}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>Salary</label>
                    <input
                      name='salary'
                      type='text'
                      className='form-control'
                      defaultValue={employee?.salary}
                      onChange={handleChange}
                      // disabled={!isAdmin}
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>
                      Job Role <span className='text-danger'>*</span>
                    </label>
                    <div className='form-focus focused text-left'>
                      <a
                        className='btn form-control btn-white dropdown-toggle'
                        href='#'
                        data-toggle='dropdown'
                        aria-expanded='false'
                      >
                        {empData?.jobRole?.name || 'Job Role'}
                      </a>
                      <div className='dropdown-menu dropdown-menu-right'>
                        {roles.map((role) => (
                          <span
                            className='dropdown-item'
                            onClick={() =>
                              setEmpData({
                                ...empData,
                                jobRole: role?._id
                              })
                            }
                          >
                              {role?.name}
                            </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                 Bank Details Form
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>IFSC</label>
                    <input
                      type='text'
                      name='IFSC'
                      className='form-control'
                      defaultValue={employee?.bankDetails?.IFSC}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          bankDetails: {
                            ...empData.bankDetails,
                            [e.target.name]: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>Aadhar</label>
                    <input
                      type='text'
                      name='aadhar'
                      className='form-control'
                      defaultValue={employee?.bankDetails?.aadhar}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          bankDetails: {
                            ...empData.bankDetails,
                            [e.target.name]: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>Account No.</label>
                    <input
                      type='text'
                      name='accountNumber'
                      className='form-control'
                      defaultValue={employee?.bankDetails?.accountNumber}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          bankDetails: {
                            ...empData.bankDetails,
                            [e.target.name]: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>Account Holder</label>
                    <input
                      type='text'
                      name='accountHoldersName'
                      className='form-control'
                      defaultValue={employee?.bankDetails?.accountHoldersName}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          bankDetails: {
                            ...empData.bankDetails,
                            [e.target.name]: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>PAN</label>
                    <input
                      type='text'
                      name='pan'
                      className='form-control'
                      defaultValue={employee?.bankDetails?.pan}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          bankDetails: {
                            ...empData.bankDetails,
                            [e.target.name]: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='form-group'>
                    <label>UPI</label>
                    <input
                      type='text'
                      name='upi'
                      className='form-control'
                      defaultValue={employee?.bankDetails?.upi}
                      onChange={(e) =>
                        setEmpData({
                          ...empData,
                          bankDetails: {
                            ...empData.bankDetails,
                            [e.target.name]: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>*/}
              <div className='submit-section'>
                <button
                  className='btn btn-primary submit-btn'
                  onClick={handleNewSubmit}
                >
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

export default AddEmpAuth;