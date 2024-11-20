import React, { useState } from 'react';
import DatePicker from 'react-date-picker';
import { Space } from 'antd';
import httpService from '../../../../lib/httpService';
import { toast } from 'react-toastify';

function AddEmployeeModal(props) {
  const [uniqueUsername, setUniqueUsername] = useState({
    state: false,
    message: '',
  });
  const [uniqueEmail, setUniqueEmail] = useState({ state: false, message: '' });
  const {
    workLocs,
    employeeToAdd,
    setEmployeeToAdd,
    handleNewSubmit,
    employeeType,
    employeeTypeValue,
    departments,
    roles,
    currentFile,
    setcurrentFile,
    UploadImage,
    uploadLoading,
  } = props;
  const [join, setJoin] = useState(new Date());
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (uniqueUsername.state && uniqueEmail.state) {
      handleNewSubmit();
    } else {
      toast.error('username or email already exist');
      return;
    }
  };
  const handleUsernameChange = (e) => {
    const checkUserExist = async (value) => {
      try {
        let res = await httpService.get(`/employee?username=${value}`);
        setUniqueUsername(res.data);
      } catch (err) {
        toast.error('something went wrong');
      }
    };
    if (e.target.value?.length > 3) {
      checkUserExist(e.target.value);
    }
    setEmployeeToAdd({
      ...employeeToAdd,
      userName: e.target.value,
    });
  };

  const handleEmailChange = (e) => {
    const checkUserExist = async (value) => {
      try {
        let res = await httpService.get(`/employee?email=${value}`);
        setUniqueEmail(res.data);
      } catch (err) {
        toast.error('something went wrong');
      }
    };
    if (e.target.value.includes('@')) {
      checkUserExist(e.target.value);
    }
    setEmployeeToAdd({
      ...employeeToAdd,
      email: e.target.value,
    });
  };
  return (
    <div id="add_employee" className="modal custom-modal fade" role="dialog">
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Employee</h5>
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
            <form autoComplete={'off'} onSubmit={handleFormSubmit}>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="col-form-label">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      name="firstName"
                      defaultValue={employeeToAdd?.firstName || ''}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          firstName: e.target.value,
                        });
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="col-form-label">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      name="lastName"
                      defaultValue={employeeToAdd?.lastName || ''}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          lastName: e.target.value,
                        });
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="col-form-label">
                      Username <span className="text-danger">*</span>
                      <span className="text-sm text-secondary">
                        {' '}
                        must be 4 characters alteast
                      </span>
                    </label>
                    <input
                      autoComplete={'nope'}
                      className="form-control"
                      type="text"
                      minLength={4}
                      name="userName"
                      value={employeeToAdd?.userName}
                      onChange={handleUsernameChange}
                      required
                    />
                    {employeeToAdd?.userName?.length > 3 && (
                      <p
                        className={`text-sm ${
                          uniqueUsername.state ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {uniqueUsername.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="col-form-label">
                      Email <span className="text-danger">*</span>
                      <span className="text-sm text-secondary">
                        {' '}
                        email should be unique
                      </span>
                    </label>
                    <input
                      className="form-control"
                      type="email"
                      name="email"
                      defaultValue={employeeToAdd?.email || ''}
                      onChange={handleEmailChange}
                      required
                    />
                    {employeeToAdd?.email?.length > 3 &&
                      employeeToAdd?.email?.includes('@') && (
                        <p
                          className={`text-sm ${
                            uniqueEmail.state ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {uniqueEmail.message}
                        </p>
                      )}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="col-form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      maxLength={20}
                      autoComplete={'new-password'}
                      className="form-control"
                      type="password"
                      defaultValue={employeeToAdd?.password || ''}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          password: e.target.value,
                        });
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="col-form-label">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      maxLength={20}
                      className="form-control"
                      type="password"
                      name="password"
                      defaultValue={employeeToAdd?.cnfPassword || ''}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          cnfPassword: e.target.value,
                        });
                      }}
                      required
                    />
                    {employeeToAdd?.cnfPassword &&
                      employeeToAdd?.password !==
                        employeeToAdd?.cnfPassword && (
                        <span className="text-danger text-sm">
                          password and confirm password does not match
                        </span>
                      )}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="col-form-label">
                      Joining Date <span className="text-danger">*</span>
                    </label>
                    <div>
                      <DatePicker
                        className="form-control"
                        format={'dd/MM/y'}
                        value={join}
                        onChange={(e) => {
                          let date = new Date(e).toISOString();
                          setJoin(e);
                          setEmployeeToAdd({
                            ...employeeToAdd,
                            joinDate: date,
                          });
                        }}
                        maxDate={new Date()}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="col-form-label">
                      Phone <span className="text-danger">*</span>
                      <span
                        className={`text-secondary text-sm  ${
                          employeeToAdd?.mobileNo?.length < 10 ||
                          !employeeToAdd?.mobileNo
                            ? 'text-danger'
                            : 'text-success'
                        } `}
                      >
                        {' '}
                        {employeeToAdd?.mobileNo?.length || 0}/10{' '}
                      </span>
                    </label>
                    <input
                      maxLength={10}
                      minLength={10}
                      className="form-control"
                      type="tel"
                      name="mobileNo"
                      defaultValue={employeeToAdd?.mobileNo || ''}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          mobileNo: e.target.value,
                        });
                      }}
                      pattern="[6-9]{1}[0-9]{9}"
                      title="Phone number with 6-9 and remaing 9 digit with 0-9"
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      Employee Type <span className="text-danger">*</span>
                    </label>
                    <select
                      role="button"
                      className="custom-select"
                      name="employeeType"
                      onChange={employeeTypeValue}
                      required
                    >
                      <option value={''}>Select Employee Type</option>
                      {employeeType?.map((r, index) => (
                        <option key={index} value={r._id}>
                          {r.employeeTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      Department <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      role="button"
                      name="department"
                      value={employeeToAdd?.department}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          department: e.target.value,
                        });
                      }}
                      required
                    >
                      <option value={''}>Select Department</option>
                      {departments?.map((r, index) => (
                        <option key={index} value={r._id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group" role="button">
                    <label>
                      Employment Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      role="button"
                      name="employmentType"
                      value={employeeToAdd?.employmentType}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          employmentType: e.target.value,
                        });
                      }}
                      required
                    >
                      <option value={''}>Please Select Employment Type</option>
                      <option>Full Time</option>
                      <option>Part Time</option>
                      <option>Contractual</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      Work Location <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      name="workLocation"
                      value={employeeToAdd?.workLocation}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          workLocation: e.target.value,
                        });
                      }}
                      required
                    >
                      <option value={''}>Please Select Work Location</option>
                      {workLocs?.map((loc, index) => (
                        <option key={index} value={loc?._id}>
                          {loc?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group" role="button">
                    <label>
                      Job Role <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      role="button"
                      name="jobRole"
                      value={employeeToAdd?.jobRole}
                      onChange={(e) => {
                        setEmployeeToAdd({
                          ...employeeToAdd,
                          jobRole: e.target.value,
                        });
                      }}
                      required
                    >
                      <option value={''}>Please Select Job role</option>
                      {roles?.map((r, index) => (
                        <option key={index} value={r?._id}>
                          {r?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <Space size={'small'}>
                    <div className="form-group ">
                      <label>Upload your Pic</label>
                      <div className="custom-file">
                        <input
                          name="resumeFile"
                          type="file"
                          // required
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
                          {currentFile?.fileName ||
                          currentFile?.name ||
                          currentFile[0]?.fileName ? (
                            <span className="">
                              {currentFile?.name} {currentFile[0]?.fileName}{' '}
                              {currentFile?.fileName}{' '}
                            </span>
                          ) : (
                            'Choose file'
                          )}

                          {/* {currentFile[0]?.fileName ? currentFile[0]?.fileName : "Choose file"} */}
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-info mt-50"
                      onClick={() => UploadImage()}
                      disabled={uploadLoading == 'Uploading'}
                    >
                      {uploadLoading == 'disable' ? 'Change' : uploadLoading}
                    </button>
                  </Space>
                </div>
              </div>
              <div className="submit-section">
                <button className="btn btn-primary submit-btn">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployeeModal;
