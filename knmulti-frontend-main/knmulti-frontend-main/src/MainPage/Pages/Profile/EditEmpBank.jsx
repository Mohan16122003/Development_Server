import React, { useEffect, useState } from 'react';
import { updateEmployee } from '../../../lib/api';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const EditEmpBank = ({ empId, bankData, setEmployee, userName }) => {
  const bankDetailsObj = {
    accountHoldersName: '',
    accountNumber: '',
    IFSC: '',
    upi: '',
    bankname: '',
    branch: '',
    bankdetails1: '',
  };

  const [bankDetails, setBankDetails] = useState([]);
  const [oldBankDetails, setOldBankDetails] = useState([]);
  const [bankEditIndex, setBankEditIndex] = useState(-1);

  useEffect(() => {
    setBankDetails(bankData);
    setOldBankDetails(bankData);
  }, [bankData]);

  const handleCancelBankEdit = () => {
    setBankEditIndex(-1);
  };

  const handleAddBank = () => {
    const newBankDetails = [...bankDetails, bankDetailsObj];
    setBankDetails(newBankDetails);
    setBankEditIndex(newBankDetails.length - 1);
  };
  const handleRemoveBank = (e, index) => {
    const updatedBankDetails = bankDetails.filter((edu, i) => index !== i);
    setBankDetails(updatedBankDetails);
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
          bankDetails: updatedBankDetails,
        }).then((res) => {
          setEmployee();
          setBankEditIndex(-1);
        });

        document.querySelectorAll('.close')?.forEach((e) => e.click());
      }
    });
  };
  const handleBankEdit = (e, index) => {
    const updateBankD = bankDetails.map((bank1, i) => {
      if (index === i) {
        return { ...bank1, [e.target.name]: e.target.value };
      } else {
        return bank1;
      }
    });
    setOldBankDetails(bankDetails);
    setBankDetails([...updateBankD]);
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    if (oldBankDetails === bankDetails) {
      toast.info('Bank Details are upto date already!');
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
        updateEmployee(empId, { userName, bankDetails }).then((res) => {
          setEmployee();
          setBankEditIndex(-1);
        });

        document.querySelectorAll('.close')?.forEach((e) => e.click());
      }
    });
  };

  return (
    <div id="edit_emp_bank" className="modal custom-modal fade" role="dialog">
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"> Bank Details</h5>
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
            {bankDetails?.map((bank, index) => (
              <form
                name={'bankDetailsForm'}
                onSubmit={handleSaveBank}
                key={index}
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Bank Details <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={bankEditIndex !== index}
                        className='form-control'
                        type="text"
                        name="bankdetails1"
                        value={bank?.bankdetails1}
                        onChange={(e) => handleBankEdit(e, bankEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Bank Name <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={bankEditIndex !== index}
                        className='form-control'
                        type="text"
                        name="bankname"
                        value={bank?.bankname}
                        onChange={(e) => handleBankEdit(e, bankEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Account Holder <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={bankEditIndex !== index}
                        className='form-control'
                        type="text"
                        name="accountHoldersName"
                        value={bank?.accountHoldersName}
                        onChange={(e) => handleBankEdit(e, bankEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Account Number <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={bankEditIndex !== index}
                        type='text'
                        pattern="[0-9]{11}"
                        maxLength={11}
                        title="Please enter valid Account Code. E.g. 52520065104"
                        name="accountNumber"
                        className="form-control"
                        value={bank?.accountNumber}
                        onChange={(e) => handleBankEdit(e, bankEditIndex)}
                        // onInput={toInputUppercase}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        IFSC <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={bankEditIndex !== index}
                        type='text'
                        maxLength={11}
                        pattern="[a-zA-Z]{4}[0-9]{7}"
                        // pattern="[a-zA-Z]{2}[0-9]{5}[a-zA-Z]{1}"
                        title="Please enter valid IFSC Code. E.g. ABHY0065104"
                        name="IFSC"
                        value={bank?.IFSC}
                        className='form-control'
                        onChange={(e) => handleBankEdit(e, bankEditIndex)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Branch <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={bankEditIndex !== index}
                        type='text'
                        name="branch"
                        value={bank?.branch}
                        className='form-control'
                        onChange={(e) => handleBankEdit(e, bankEditIndex)}
                      />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="form-group">
                      <label className="col-form-label">
                        UPI ID <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        disabled={bankEditIndex !== index}
                        type='text'
                        name="upi"
                        value={bank?.upi}
                        className='form-control'
                        onChange={(e) => handleBankEdit(e, bankEditIndex)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 d-flex justify-content-between align-items-center">
                    <button
                      type={bankEditIndex === index ? 'submit' : 'button'}
                      style={{ width: '45%' }}
                      className={
                        bankEditIndex === index
                          ? 'btn btn-info'
                          : 'btn btn-secondary'
                      }
                      onClick={(e) => {
                        bankEditIndex !== index && setBankEditIndex(index);
                      }}
                    >
                      {bankEditIndex === index ? (
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
                        bankEditIndex === index
                          ? 'btn btn-secondary'
                          : 'btn btn-warning'
                      }
                      onClick={(e) => {
                        bankEditIndex === index
                          ? handleCancelBankEdit(index)
                          : handleRemoveBank(e, index);
                      }}
                    >
                      {bankEditIndex === index ? (
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
              onClick={handleAddBank}
              disabled={bankEditIndex !== -1}
            >
              <i className={'fa fa-plus-circle'} /> Add Bank Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmpBank;
