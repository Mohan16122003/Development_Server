import React, { useEffect, useState } from 'react';
import { updateEmployee } from '../../../lib/api';
import DatePicker from 'react-date-picker';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const EditEmpExp = ({ empId, expData, setEmployee, userName }) => {
  const experienceTemplate = {
    startDate: '',
    endDate: '',
    company: '',
    designation: '',
    responsibilities: '',
  };
  const [experienceDetails, setExperienceDetails] = useState([]);
  const [oldExperienceDetails, setOldExperienceDetails] = useState([]);
  const [expIndex, setExpIndex] = useState();
  const [expEditIndex, setExpEditIndex] = useState(-1);

  useEffect(() => {
    setExperienceDetails(expData);
    setOldExperienceDetails(expData);
  }, [expData]);

  const handleExpDetails = (e) => {
    setExperienceDetails({
      ...experienceDetails,
      [e.target.name]: e.target.value
    });
  };
  // console.log(bankDetails, 'bankDetailsbankDetails');
  const handleEDitSetExp = (bank, index) => {
    setExpIndex(474);
    setExpEditIndex(index);
    // setbankDetailedit([bank]);
  };
  const handleCancelExp = (index) => {
    setExpIndex(475);
    setExpEditIndex(-1);
  };
  const handleAddExp = () => {
    const newExpDetails = [...experienceDetails, experienceTemplate];
    setExperienceDetails(newExpDetails);
    setExpEditIndex(newExpDetails.length - 1);
  };
  const handleRemoveExp = (e, index) => {
    const updatedExpDetails = experienceDetails.filter((edu, i) => index != i);
    setExperienceDetails(updatedExpDetails);
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        updateEmployee(empId, {
          userName,
          previousExperience: updatedExpDetails
        }).then((res) => {
          setEmployee();
          setExpEditIndex(-1);
        });

        document.querySelectorAll('.close')?.forEach((e) => e.click());
      }
    });
  };

  const handleDateEdit = (fieldName, value, index) => {
    const updateEduD = eduDetails.map((edu1, i) => {
      if (index === i) {
        return { ...edu1, [fieldName]: value };
      } else {
        return edu1;
      }
    });
    setOldEduDetails(eduDetails);
    setEduDetails([...updateEduD]);
  };

  const handleExpEdit = (e, index) => {
    const updateBankD = experienceDetails.map((bank1, i) => {
      if (index === i) {
        return { ...bank1, [e.target.name]: e.target.value };
      } else {
        return bank1;
      }
    });
    console.log(updateBankD, ' e.target.name');
    // setbankDetailedit([...updateBankD]);
    setOldExperienceDetails(bankDetails);
    setExperienceDetails([...updateBankD]);
    // console.log(bankDetailedit, 'bankDetailedit');
  };

  const handleSaveExp = (e) => {
    e.preventDefault();
    if (oldExperienceDetails === experienceDetails) {
      toast.info('Experience Details are upto date already!');
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        updateEmployee(empId, {
          userName,
          previousExperience: experienceDetails,
        }).then((res) => {
          setEmployee();
          setExpEditIndex(-1);
        });

        document.querySelectorAll('.close')?.forEach((e) => e.click());
      }
    });
  };

  return (
    <div id="edit_emp_exp" className="modal custom-modal fade" role="dialog">
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        // mw-100 w-75
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"> Experience</h5>
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
            {experienceDetails?.map((bank, index) => (
              <form
                name={'experienceDetailsForm'}
                onSubmit={handleSaveExp}
                key={index}
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Company <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={expEditIndex !== index}
                        className='form-control'
                        type="text"
                        name="company"
                        value={bank?.company}
                        onChange={(e) => handleExpEdit(e, expEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Designation <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={expEditIndex !== index}
                        className='form-control'
                        type="text"
                        name="designation"
                        value={bank?.designation}
                        onChange={(e) => handleExpEdit(e, expEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className='col-form-label'>
                        Start Date <span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        className='form-control'
                        value={bank?.startDate}
                        format={'dd/MM/yyyy'}
                        onChange={(e) => handleDateEdit('startDate', e, index)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className='col-form-label'>
                        End Date <span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        className='form-control'
                        value={bank?.endDate}
                        format={'dd/MM/yyyy'}
                        onChange={(e) => handleDateEdit('endDate', e, index)}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Responsibilities <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={expEditIndex !== index}
                        type='text'
                        name="responsibilities"
                        value={bank?.responsibilities}
                        className='form-control'
                        onChange={(e) => handleExpEdit(e, expEditIndex)}
                      />
                    </div>
                  </div>

                  <div className="col-md-4 d-flex justify-content-between align-items-center">
                    <button
                      type={expEditIndex === index ? 'submit' : 'button'}
                      style={{ width: '45%' }}
                      className={
                        expEditIndex === index
                          ? 'btn btn-info'
                          : 'btn btn-secondary'
                      }
                      onClick={(e) => {
                        expEditIndex !== index && setExpEditIndex(index);
                      }}
                    >
                      {expEditIndex === index ? (
                        <>
                          <i className={'fa fa-save'} /> Save
                        </>
                      ) : (
                        <>
                          <i className={'fa fa-pencil'} /> Edit
                        </>
                      )}
                    </button>
                    <div
                      style={{ width: '45%' }}
                      className={
                        expEditIndex === index
                          ? 'btn btn-secondary'
                          : 'btn btn-warning'
                      }
                      onClick={(e) => {
                        expEditIndex === index
                          ? handleCancelExp(index)
                          : handleRemoveExp(e, index);
                      }}
                    >
                      {expEditIndex === index ? (
                        <>
                          <i className={'fa fa-remove'} /> Cancel
                        </>
                      ) : (
                        <>
                          <i className={'fa fa-trash'} /> Delete
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            ))}
            <button
              className={'btn btn-primary float-right'}
              onClick={handleAddExp}
              disabled={expEditIndex !== -1}
            >
              <i className={'fa fa-plus-circle'} /> Add Experience Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmpExp;
