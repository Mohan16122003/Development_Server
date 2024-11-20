import React, { useState } from 'react';
import httpService from '../../../lib/httpService';
import FileUploadService from './FileUploadService';

const UploadDocument = ({
  putLink,
  fileInfoArr,
  certArr,
  fetchApi,
  userName = undefined,
  cert = false,
  isVendor = false,
}) => {
  const [currentFile, setcurrentFile] = useState('');

  const upload = async () => {
    try {
      const res = await FileUploadService.upload(currentFile);

      if (cert) {
        const resp = await httpService.put(`${putLink}`, {
          userName,
          certFile: [res?.data, ...certArr],
        });
      } else {
        if (isVendor) {
          await httpService.put(`${putLink}`, {
            name: userName,
            fileInfos: [res?.data, ...fileInfoArr],
          });
        } else {
          await httpService.put(`${putLink}`, {
            userName,
            fileInfos: [res?.data, ...fileInfoArr],
          });
        }
      }

      await fetchApi();
    } catch (err) {
      console.log('Could not upload file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('submit');
    if (currentFile != '') {
      upload();
    }
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  return (
    <div
      id="upload_document_modal"
      className="modal custom-modal fade"
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <div
          className="modal-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '500px',
            maxHeight: '700px',
            padding: '20px',
            paddingBottom: '30px',
          }}
        >
          <div className="modal-header">
            <h5 className="modal-title" style={{ fontWeight: '500' }}>
              Upload Certificate
            </h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          {/* <div className="modal-body"> */}
          <form onSubmit={handleSubmit} style={{ marginTop: '50px' }}>
            {/* <div className="row"> */}
            {/* <div className="col-md-6"> */}
            {/* <div className="form-group"> */}
            <label style={{ marginLeft: '13px', fontWeight: '300' }}>
              Document
            </label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setcurrentFile(e.target.files[0])}
              style={{ border: 'none' }}
              // disabled={!isAdmin}
            />
            {/* </div> */}
            {/* </div> */}
            {/* <div className="col-md-6">
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        className="form-control"
                        type="text"
                        // disabled={!isAdmin}
                      />
                    </div>
                  </div> */}
            {/* </div> */}
            <div className="submit-section">
              <button
                className="btn btn-primary submit-btn"

                // disabled={!isAdmin}
              >
                Submit
              </button>
            </div>
          </form>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
