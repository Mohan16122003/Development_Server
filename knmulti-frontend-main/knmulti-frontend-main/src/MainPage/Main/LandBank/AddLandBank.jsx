import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory } from 'react-router-dom';
import FileUploadService from '../../Pages/Profile/FileUploadService';
import { toast } from 'react-toastify';
import httpService from '../../../lib/httpService';
import DocsModal from './modals/DocsModal';
import { useSelector, useDispatch } from 'react-redux';
import { createNotify } from '../../../features/notify/notifySlice';

export const casteData = [
  { value: 'select', name: '--Please Select Caste--', id: 1 },
  { value: 'Brahmins ', name: 'Brahmins ', id: 2 },
  { value: 'Kshatriyas', name: 'Kshatriyas', id: 3 },
  { value: 'Vaishyas', name: 'Vaishyas', id: 4 },
  { value: 'Sudras', name: 'Sudras', id: 5 },
  { value: 'Sharif/Ashraf', name: 'Sharif/Ashraf', id: 6 },
  { value: 'Atraf', name: 'Atraf', id: 7 },
  { value: 'Arzal', name: 'Arzal', id: 8 },
  { value: 'Ajlaf', name: 'Ajlaf', id: 9 },
  { value: 'Sudras', name: 'Sudras', id: 10 },
  { value: 'Other', name: 'Other', id: 11 },
];
export const religionData = [
  { value: 'select', name: '--Please Select Religion--', id: 1 },
  { value: 'Hindu', name: 'Hindu', id: 2 },
  { value: 'Muslim', name: 'Muslim', id: 3 },
  { value: 'Sikh', name: 'Sikh', id: 4 },
  { value: 'Christian', name: 'Christian', id: 5 },
  { value: 'Other', name: 'Other', id: 6 },
];
export const nationalityData = [
  { value: 'Indian', name: 'Indian', id: 1 },
  { value: 'Other', name: 'Other', id: 2 },
];
const AddLandBank = () => {
  const [owner, setOwner] = useState(null);
  const [otherCaste, setOtherCaste] = useState(false); //leaving for future use
  const [landDetails, setLandDetails] = useState({});
  const [landDocs, setLandDocs] = useState([]);
  const [landDocFile, setLandDocFile] = useState([]);
  const [docsModal, setDocsModal] = useState(false);
  const [minDate, setMinDate] = useState('');
  const history = useHistory();
  const empObj = useSelector((state) => state.authentication.value.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const calculateMinDate = () => {
      const today = new Date();
      const minDateValue = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      const formattedMinDate = minDateValue.toISOString().slice(0, 10);
      setMinDate(formattedMinDate);
    };
    calculateMinDate();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!landDocFile.length) {
      toast.error('Please Add Land Documents');
      return;
    }
    let vendorData = {
      name: owner.firstName + ' ' + owner.lastName,
      firstName: owner.firstName,
      lastName: owner.lastName,
      company: `${owner.name} company`,
      email: owner.email || '',
      phone: owner.phone || '',
      dob: owner.dob,
      mobile: owner.phone,
      website: owner.website || '',
      vendorType: 'landowner',
      otherDetails: {
        pan: owner.pan || '',
        gst: '',
        openingBalance: '',
        paymentTerms: '',
        tds: '',
        currency: '',
      },
      comments: [],
      vendorCredits: [],
      expenses: [],
      bills: [],
      caste: owner.caste,
      billAddress: owner.address,
      nationality: owner.nationality,
      religion: owner.religion,
    };

    toast
      .promise(httpService.post('/vendor', vendorData), {
        error: 'Failed to add vendor',
        success: 'Vendor added, Adding Land',
        pending: 'Adding vendor',
      })
      .then((res) => {
        let land = {
          ...landDetails,
          files: landDocFile,
          owner: res.data?._id,
        };
        toast.promise(httpService.post(`/landbank`, land), {
          error: 'Failed to add Land',
          success: 'Land Owner With land Added Successfully',
          pending: 'Adding Land',
        });
        dispatch(
          createNotify({
            notifyHead: `New Vendor Added`,
            notifyBody: `Vendor ${res?.data?.name} is created`,
            createdBy: empObj?._id,
          })
        );
      })
      .catch((err) => console.log(err));
    document.querySelectorAll('.close')?.forEach((e) => e.click());
    history.goBack();
  };

  const handleLandDetails = (e) => {
    setLandDetails({ ...landDetails, [e.target.name]: e.target.value });
  };

  const handleOwnerDetails = (e) => {
    setOwner({ ...owner, [e.target.name]: e.target.value });
  };
  const handleAddFiles = (doc) => {
    setLandDocs([...landDocs, doc]);
  };
  const handleDelete = (id) => {
    let filtredData = landDocs.filter((el, ind) => ind !== id);
    setLandDocs(filtredData);
  };
  const handleChangeFiles = (e) => {
    let newDoc = { name: e.target.name, file: e.target.files[0] };
    let allOthers = landDocs.filter((el) => el.name !== e.target.name);
    setLandDocs([...allOthers, newDoc]);
  };
  const handleUploadDocs = async () => {
    closeModal();
    if (landDocs.length) {
      let filesArr = [];
      for (const el of landDocs) {
        if (el.file) {
          try {
            toast.info('Uploading Files... \n Please wait...');
            const res = await FileUploadService.upload(el.file);
            let newDta = { name: el.name, file: res.data?.filePath };
            filesArr.push(newDta);
          } catch (error) {
            toast.error('Failed to upload files');
          }
        }
      }
      toast.success('All Files Uploaded.');
      setLandDocFile(filesArr);
    } else {
      toast.error('Please Add Atleast One File To Upload');
    }
  };
  const closeModal = () => {
    setDocsModal(false);
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Add Land Owner</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Add Land Owner</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/app/land-bank">LandBank</Link>
                </li>
                <li className="breadcrumb-item active">Add Land Owner</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-sm-12">
            <form onSubmit={handleSubmit}>
              <h4>Owner Details</h4>
              <div
                style={{ paddingLeft: '20px', borderLeft: '1px solid #ACACAC' }}
              >
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        First Name<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={owner?.firstName}
                        onChange={handleOwnerDetails}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Last Name<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={owner?.lastName}
                        onChange={handleOwnerDetails}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Date of Birth (dob){' '}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="dob"
                        value={owner?.dob}
                        onChange={handleOwnerDetails}
                        required
                        max={minDate}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Email<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="email"
                        value={owner?.email}
                        onChange={handleOwnerDetails}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Phone<span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="phone"
                        value={
                          owner?.phone?.length <= 10
                            ? owner?.phone
                            : owner?.phone?.slice(0, 10)
                        }
                        onChange={handleOwnerDetails}
                        required
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Nationality
                        <span className="text-danger">*</span>
                      </label>
                      <select
                        required
                        className="custom-select"
                        name="nationality"
                        value={owner?.nationality}
                        onChange={handleOwnerDetails}
                      >
                        <option value="">--Please select--</option>
                        {nationalityData?.map((el) => (
                          <option key={el.id} value={el.value}>
                            {el.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="religion">Religion</label>
                    <span className="text-danger">*</span>
                    <div className="form-group">
                      <select
                        required
                        className="custom-select"
                        name="religion"
                        value={owner?.religion}
                        onChange={handleOwnerDetails}
                      >
                        {religionData?.map((el) => (
                          <option key={el.id} value={el.name}>
                            {el.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={`${otherCaste ? 'col-md-3' : 'col-md-4'}`}>
                    <label htmlFor="caste">Caste</label>
                    <span className="text-danger">*</span>
                    <div className="form-group">
                      <select
                        required
                        className="custom-select"
                        name="caste"
                        value={owner?.caste}
                        onChange={handleOwnerDetails}
                      >
                        {casteData?.map((el) => (
                          <option key={el.id} value={el.value}>
                            {el.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {otherCaste && (
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Mention Caste<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="caste"
                          value={owner?.caste}
                          onChange={handleOwnerDetails}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Address <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="address"
                        id=""
                        cols="100"
                        rows="2"
                        className="form-control"
                        value={owner?.address}
                        onChange={handleOwnerDetails}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <h4>Land Details</h4>

              <div
                style={{ paddingLeft: '20px', borderLeft: '1px solid #ACACAC' }}
              >
                <div className="row">
                  {/* landmark */}

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Mouza</label>
                      <span className="text-danger">*</span>
                      <input
                        required
                        type="text"
                        className="form-control"
                        name="mouza"
                        placeholder="Area Name"
                        value={landDetails?.mouza}
                        onChange={handleLandDetails}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Landmark</label>
                      <span className="text-danger">*</span>
                      <input
                        required
                        type="text"
                        className="form-control"
                        name="landmark"
                        placeholder="Area Name"
                        value={landDetails?.landmark}
                        onChange={handleLandDetails}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Plot No <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="plot_no"
                        value={landDetails?.plot_no}
                        onChange={handleLandDetails}
                        min={0}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Land Type (Kissam) </label>
                      <span className="text-danger">*</span>
                      <select
                        className="custom-select"
                        name="land_type"
                        value={landDetails.land_type}
                        onChange={handleLandDetails}
                      >
                        <option value="">select Kisam</option>
                        <option value="Abadi lands">Abadi lands</option>
                        <option value="Non irrigated">Non irrigated</option>
                        <option value="Water bodies">Water bodies</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Land Area <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="land_area"
                        placeholder="In Acres"
                        value={landDetails?.land_area}
                        onChange={handleLandDetails}
                        required
                        step="0.01"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Land Cost ( total )
                        <span className="text-danger"> * </span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="amount in ₹"
                        name="land_cost"
                        value={landDetails?.land_cost}
                        onChange={handleLandDetails}
                        required
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Khata No</label>
                      <span className="text-danger">*</span>
                      <input
                        type="number"
                        className="form-control"
                        name="khata_no"
                        value={landDetails?.khata_no}
                        onChange={handleLandDetails}
                        min={0}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Chaka No</label>
                      <span className="text-danger">*</span>
                      <input
                        type="number"
                        className="form-control"
                        name="chakka_no"
                        value={landDetails?.chaka_no}
                        onChange={handleLandDetails}
                        min={0}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <h4>Land Documents</h4>

              <div
                style={{ paddingLeft: '20px', borderLeft: '1px solid #ACACAC' }}
              >
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Sale Dead ( P O A )
                        <span className="text-danger"> *</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="Sale_Dead"
                        onChange={handleChangeFiles}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Purchase Agreement
                        <span className="text-danger"> *</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="Purchase_Agreement"
                        onChange={handleChangeFiles}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        EC <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="EC"
                        onChange={handleChangeFiles}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Mutation <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="Mutation"
                        onChange={handleChangeFiles}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Conversion <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="Conversion"
                        onChange={handleChangeFiles}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Legal Heir <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="Legal_Heir"
                        onChange={handleChangeFiles}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    {landDocFile.length ? (
                      <p
                        className="form-control btn btn-secondary submit-btn"
                        style={{ cursor: 'no-drop' }}
                      >
                        Add More Documents
                      </p>
                    ) : (
                      <p
                        className="form-control btn btn-primary submit-btn"
                        onClick={() => {
                          setDocsModal(true);
                        }}
                      >
                        Add More Documents
                      </p>
                    )}
                  </div>

                  <div className="col-md-4">
                    {landDocFile.length ? (
                      <p
                        className="form-control btn btn-secondary submit-btn"
                        style={{ cursor: 'no-drop' }}
                      >
                        Upload All Documents{' '}
                      </p>
                    ) : (
                      <p
                        className="form-control btn btn-primary submit-btn"
                        style={{ background: '#00c5fb' }}
                        onClick={handleUploadDocs}
                      >
                        Upload All Documents{' '}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="form-group">
                    <div>
                      <label htmlFor="">Remarks</label>
                      <textarea
                        name="remark"
                        id=""
                        cols="100"
                        rows="5"
                        className="form-control"
                        value={landDetails.remark}
                        onChange={handleLandDetails}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="submit-section">
                {landDocFile.length ? (
                  <button className="btn btn-primary submit-btn">
                    Create Land
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary submit-btn"
                    onClick={() => toast.error('Please upload Documents First')}
                  >
                    please upload files
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      {docsModal && (
        <DocsModal
          data={landDocs}
          closeModal={closeModal}
          handleUploadDocs={handleUploadDocs}
          handleAddFiles={handleAddFiles}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default AddLandBank;
