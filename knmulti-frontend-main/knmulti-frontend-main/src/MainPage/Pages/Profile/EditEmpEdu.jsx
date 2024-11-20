import React, { useEffect, useState } from 'react';
import { updateEmployee } from '../../../lib/api';
import Swal from 'sweetalert2';
import DatePicker from 'react-date-picker';
import { toast } from 'react-toastify';
// setBankDetails;

const EditEmpEdu = ({ empId, eduData, setEmployee, userName }) => {
  const eductionTemplate = {
    qualification: '',
    instution: '',
    startDate: '',
    endDate: '',
    university: '',
    specialization: '',
    score: 0,
    gradingSystem: '',
  };

  const [eduDetails, setEduDetails] = useState([]);
  const [oldEduDetails, setOldEduDetails] = useState([]);
  const [eduEditIndex, setEduEditIndex] = useState(-1);

  useEffect(() => {
    setEduDetails(eduData);
    setOldEduDetails(eduData);
  }, [eduData]);

  const handleCancelEduEdit = () => {
    setEduEditIndex(-1);
  };

  const handleAddEdu = () => {
    const newEDuDetails = [...eduDetails, eductionTemplate];
    setEduDetails(newEDuDetails);
    setEduEditIndex(newEDuDetails.length - 1);
  };

  const handleRemoveEdu = (e, index) => {
    const updatedEduDetails = eduDetails.filter((edu, i) => index != i);
    setEduDetails(updatedEduDetails);
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
          education: updatedEduDetails,
        }).then((res) => {
          setEmployee();
          setEduEditIndex(-1);
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

  const handleEduEdit = (e, index) => {
    const updateEduD = eduDetails.map((edu1, i) => {
      if (index === i) {
        return { ...edu1, [e.target.name]: e.target.value };
      } else {
        return edu1;
      }
    });
    setOldEduDetails(eduDetails);
    setEduDetails([...updateEduD]);
  };

  const handleSaveEdu = (e) => {
    e.preventDefault();
    if (oldEduDetails === eduDetails) {
      toast.info('Education Details are upto date already!');
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
        updateEmployee(empId, { userName, education: eduDetails }).then(
          (res) => {
            setEmployee();
            setEduEditIndex(-1);
          }
        );

        document.querySelectorAll('.close')?.forEach((e) => e.click());
      }
    });
  };

  return (
    <div id="edit_emp_edu" className="modal custom-modal fade" role="dialog">
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          {/*  */}
          <div className="modal-header">
            <h5 className="modal-title"> Eduction</h5>
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
            {eduDetails?.map((education, index) => (
              <form
                name={'educationDetailsForm'}
                onSubmit={handleSaveEdu}
                key={index}
              >
                <div className='row'>
                  <div className='col-md-6'>
                    <div className='form-group'>
                      <label className='col-form-label'>
                        Qualification <span className='text-danger'>*</span>
                      </label>
                      <input
                        required
                        disabled={eduEditIndex !== index}
                        className='form-control'
                        type='text'
                        name='qualification'
                        value={education?.qualification}
                        onChange={(e) => handleEduEdit(e, eduEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className='col-form-label'>
                        Institution <span className='text-danger'>*</span>
                      </label>
                      <input
                        required
                        disabled={eduEditIndex !== index}
                        className='form-control'
                        type='text'
                        name='instution'
                        value={education?.instution}
                        onChange={(e) => handleEduEdit(e, eduEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className='col-form-label'>
                        University <span className='text-danger'>*</span>
                      </label>
                      <input
                        required
                        disabled={eduEditIndex !== index}
                        className='form-control'
                        type='text'
                        name='university'
                        value={education?.university}
                        onChange={(e) => handleEduEdit(e, eduEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className='col-form-label'>
                        Specialization <span className='text-danger'>*</span>
                      </label>
                      <input
                        required
                        disabled={eduEditIndex !== index}
                        type='text'
                        name='specialization'
                        className='form-control'
                        value={education?.specialization}
                        onChange={(e) => handleEduEdit(e, eduEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Start Date <span className="text-danger">*</span>
                      </label>

                      <DatePicker
                        id='dob'
                        disabled={eduEditIndex !== index}
                        name='startDate'
                        className='form-control'
                        value={education.startDate && new Date(education?.startDate)}
                        format={'dd/MM/yyyy'}
                        onChange={(date) => handleDateEdit('startDate', date, index)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className='col-form-label'>
                        End Date <span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        disabled={eduEditIndex !== index}
                        className='form-control'
                        name='endDate'
                        value={education.endDate && new Date(education?.endDate)}
                        format={'dd/MM/yyyy'}
                        onChange={(date) => handleDateEdit('endDate', date, index)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label className="col-form-label">
                        Score <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={eduEditIndex !== index}
                        type='number'
                        name='score'
                        value={education?.score}
                        className='form-control'
                        onChange={(e) => handleEduEdit(e, eduEditIndex)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label className="col-form-label">
                        Grading System <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={eduEditIndex !== index}
                        name='gradingSystem'
                        type='text'
                        value={education?.gradingSystem}
                        className='form-control'
                        onChange={(e) => handleEduEdit(e, eduEditIndex)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 d-flex justify-content-between align-items-center">
                    <button
                      type={eduEditIndex === index ? 'submit' : 'button'}
                      style={{ width: '45%' }}
                      className={
                        eduEditIndex === index
                          ? 'btn btn-info'
                          : 'btn btn-secondary'
                      }
                      onClick={(e) => {
                        eduEditIndex !== index && setEduEditIndex(index);
                      }}
                    >
                      {eduEditIndex === index ? (
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
                        eduEditIndex === index
                          ? 'btn btn-secondary'
                          : 'btn btn-warning'
                      }
                      onClick={(e) => {
                        eduEditIndex === index
                          ? handleCancelEduEdit(index)
                          : handleRemoveEdu(e, index);
                      }}
                    >
                      {eduEditIndex === index ? (
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
              onClick={handleAddEdu}
              disabled={eduEditIndex !== -1}
            >
              <i className={'fa fa-plus-circle'} /> Add Education Details
            </button>
          </div>

          {/*  */}
        </div>
      </div>
    </div>
  );
};

export default EditEmpEdu;
