import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Button from '@mui/material/Button';

const DocsModal = ({
  data,
  closeModal,
  handleUploadDocs,
  handleAddFiles,
  handleDelete,
}) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const handleAddFile = () => {
    if (!name) {
      toast.error('Name Cannot be empty');
      return;
    }
    if (!file) {
      toast.error('Choose A File');
      return;
    }
    let newDoc = { name, file };
    handleAddFiles(newDoc);
    setFile(null);
    setName('');
  };
  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          background: '#00000051',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '500',
        }}
        onClick={() => closeModal()}
      >
        <div
          style={{
            background: 'white',
            padding: '20px 50px',
            borderRadius: '10px',
            minWidth: '60%',
            zIndex: '1000',
            overflow: 'auto',
            maxHeight: '80%',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <table
            style={{ width: '100%', border: '1px solid #C6C7C8' }}
            className="table table-hover table-nowrap "
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>File</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!data?.length ? (
                <tr>
                  <td>No Data </td>
                </tr>
              ) : (
                data?.map((el, id) => (
                  <tr key={id}>
                    <td>{el.name}</td>
                    <td> {el.file?.name}</td>
                    <td
                      onClick={() => handleDelete(id)}
                      style={{ color: 'blue', cursor: 'pointer' }}
                    >
                      {' '}
                      <i className="fa fa-trash-o m-r-5" /> Delete{' '}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <h4 style={{ marginTop: '20px' }}>Add New File </h4>
          <div
            className="row"
            style={{
              marginBottom: '20px',
              padding: '12px',
              alignItems: 'center',
              border: '1px solid #C6C7C8',
            }}
          >
            <div className="col-md-4">
              <label>Name :</label>
              <input
                type="text"
                name="name"
                value={name}
                placeholder="Document Name"
                style={{
                  border: '0.5px solid #C6C7C8',
                  padding: '4px',
                  borderRadius: '4px',
                }}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="file">Choose File:</label>
              <input
                type="file"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                }}
              />
            </div>
            <Button
              style={{ height: '50%', padding: '10px 30px' }}
              variant="contained"
              onClick={handleAddFile}
            >
              Add
            </Button>
          </div>
          <div style={{ textAlign: 'end' }}>
            <Button
              style={{ height: '50%', padding: '10px 30px' }}
              variant="contained"
              onClick={handleUploadDocs}
            >
              Upload All
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocsModal;
