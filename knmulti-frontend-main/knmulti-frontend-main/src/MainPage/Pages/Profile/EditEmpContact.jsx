import React, { useEffect, useState } from 'react';
import { updateEmployee } from '../../../lib/api';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const EditEmpContact = ({ empId, conData, setEmployee, userName }) => {
  const personContactTemplate = {
    name: '',
    relationship: '',
    phone: '',
  };

  const [contactEditIndex, setContactEditIndex] = useState(-1);
  const [contactDetails, setContactDetails] = useState([]);
  const [oldContactDetails, setOldContactDetails] = useState([]);

  useEffect(() => {
    setContactDetails(conData);
    setOldContactDetails(conData);
  }, [conData]);

  const handleCancelContact = () => {
    setContactEditIndex(-1);
  };

  const handleAddContact = () => {
    const newContactDetails = [...contactDetails, personContactTemplate];
    setContactDetails(newContactDetails);
    setContactEditIndex(newContactDetails.length - 1);
  };
  const handleRemoveContact = (e, index) => {
    const updatedContactDetails = contactDetails.filter((edu, i) => index !== i);
    setContactDetails(updatedContactDetails);
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        updateEmployee(empId, {
          familyInformation: updatedContactDetails
        }).then((res) => {
          setEmployee();
          setContactEditIndex(-1);
        });

        document.querySelectorAll('.close')?.forEach((e) => e.click());
      }
    });
  };
  const handleContactEdit = (e, index) => {
    setOldContactDetails(contactDetails);
    const updatedContactDetails = contactDetails.map((contact, i) => {
      if (index === i) {
        // console.log(index, e.target.name, 'a', e.target.value, 'ritik');
        return { ...contact, [e.target.name]: e.target.value };
      } else {
        return contact;
      }
    });
    setContactDetails([...updatedContactDetails]);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (JSON.stringify(oldContactDetails) === JSON.stringify(contactDetails)) {
      toast.info('Contacts Details are upto date already!');
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        updateEmployee(empId, {
          familyInformation: contactDetails
        }).then((res) => {
          setContactEditIndex(-1);
          setEmployee();
          // document.querySelectorAll('.close')?.forEach((e) => e.click());
        });
      }
    });
  };

  return (
    <div
      id='edit_emp_contact'
      className='modal custom-modal fade'
      role='dialog'
    >
      <div
        className='modal-dialog modal-dialog-centered modal-lg'
        role='document'
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"> Contact</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          {/*  */}
          <div className="modal-body">
            {contactDetails?.map((bank, index) => (
              <form
                name={'contactDetailsForm'}
                onSubmit={handleSaveContact}
                key={index}
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Name <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={contactEditIndex !== index}
                        className='form-control'
                        type="text"
                        name="name"
                        value={bank?.name}
                        onChange={(e) => handleContactEdit(e, contactEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Relationship <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={contactEditIndex !== index}
                        className='form-control'
                        type="text"
                        name="relationship"
                        value={bank?.relationship}
                        onChange={(e) => handleContactEdit(e, contactEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={contactEditIndex !== index}
                        className='form-control'
                        type="number"
                        maxLength={10}
                        onWheel={(e) => e.currentTarget.blur()}
                        name='phone'
                        value={bank?.phone}
                        onChange={(e) => handleContactEdit(e, contactEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>

                  <div className="col-md-4 d-flex justify-content-between align-items-center">
                    <button
                      type={contactEditIndex === index ? 'submit' : 'button'}
                      style={{ width: '45%' }}
                      className={
                        contactEditIndex === index
                          ? 'btn btn-info'
                          : 'btn btn-secondary'
                      }
                      onClick={(e) => {
                        contactEditIndex !== index &&
                        setContactEditIndex(index);
                      }}
                    >
                      {contactEditIndex === index ? (
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
                        contactEditIndex === index
                          ? 'btn btn-secondary'
                          : 'btn btn-warning'
                      }
                      onClick={(e) => {
                        contactEditIndex === index
                          ? handleCancelContact(index)
                          : handleRemoveContact(e, index);
                      }}
                    >
                      {contactEditIndex === index ? (
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
              onClick={handleAddContact}
              disabled={contactEditIndex !== -1}
            >
              <i className={'fa fa-plus-circle'} /> Add Contact Details
            </button>
          </div>

          {/*  */}
        </div>
      </div>
    </div>
  );
};

export default EditEmpContact;
