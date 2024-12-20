import React, { useState } from 'react';
import { toast } from 'react-toastify';
import httpService from '../../../lib/httpService';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const EditVendorPersonContact = ({ fetchVendors, editVendorId, pContact }) => {
  const personContactTemplate = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
  };
  const [personContact, setPersonContact] = useState(
    pContact || [personContactTemplate]
  );

  const addPersonContactField = () => {
    setPersonContact([...personContact, personContactTemplate]);
  };

  const removePersonContactField = (e, index) => {
    if (index !== 0) {
      const updatedPersonContact = personContact.filter(
        (pct, i) => index !== i
      );
      setPersonContact(updatedPersonContact);
    }
  };

  const handlePersonContact = (e, index) => {
    const updatedPersonContact = personContact.map((pct, i) =>
      index == i ? Object.assign(pct, { [e.target.name]: e.target.value }) : pct
    );
    setPersonContact(updatedPersonContact);
  };

  const toInputUppercase = (e) => {
    e.target.value = ('' + e.target.value).toUpperCase();
  };

  const toCapitalize = (e) => {
    e.target.value =
      e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
  };

  const editVendor = async () => {
    let vendorData = {
      personContact,
    };

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
      .then(() => fetchVendors());
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editVendor();
  };

  return (
    <div
      id="edit_vendor_person_contact"
      className="modal custom-modal fade"
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg mw-100 w-75"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"> Vendor Person Contact</h5>
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
                                onChange={(e) => handlePersonContact(e, index)}
                                onInput={toCapitalize}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control"
                                type="text"
                                name="lastName"
                                value={p.lastName}
                                onChange={(e) => handlePersonContact(e, index)}
                                onInput={toCapitalize}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control"
                                type="email"
                                name="email"
                                value={p.email}
                                onChange={(e) => handlePersonContact(e, index)}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control"
                                type="number"
                                maxLength={10}
                                name="phone"
                                value={p.phone}
                                onChange={(e) => handlePersonContact(e, index)}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control"
                                type="number"
                                maxLength={10}
                                name="mobile"
                                value={p.mobile}
                                onChange={(e) => handlePersonContact(e, index)}
                              />
                            </td>
                            <td>
                              {index === 0 ? (
                                <span></span>
                              ) : (
                                <div
                                  className=""
                                  onClick={(e) =>
                                    removePersonContactField(e, index)
                                  }
                                >
                                  <DeleteForeverIcon />
                                </div>
                              )}
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

export default EditVendorPersonContact;
