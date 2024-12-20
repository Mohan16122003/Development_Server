import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchTax } from '../../../lib/api/index';
import httpService from '../../../lib/httpService';
import { Badge, Space } from 'antd';

const Taxes = () => {
  const [data, setData] = useState([]);
  const [taxName, setTaxName] = useState('');
  const [taxpercentage, setTaxPercentage] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [editTax, setEditTax] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetchTax();
      setData(res);
    })();
  }, []);

  const handleAddTax = async () => {
    const data = {
      name: taxName,
      type: type,
      amount: taxpercentage,
      status: status,
    };
    console.log(data.name, '________________');
    if (data?.name == undefined || data?.name == '') {
      // alert("Please select a job role");
      toast.error('Please Name');

      return;
    }
    if (data?.type == undefined || data?.type == '') {
      // alert("Please select a job role");
      toast.error('Please Enter Type');
      return;
    }
    if (data?.status == undefined || data?.status == '') {
      // alert("Please select a job role");
      toast.error('Please Enter amount');

      return;
    }
    console.log(data);
    const res = await httpService.post('/tax', data);
    const resN = await fetchTax();
    setData(resN);
    console.log(res);
    document.querySelectorAll('.close')?.forEach((e) => e.click());
    setTaxName('')
    setType('')
    setTaxPercentage('')
    setStatus('')
  };

  // edit axios
  const handleEditTax = async () => {
    const res = await httpService.put(`/tax/${editTax._id}`, editTax);
    const resN = await fetchTax();
    setData(resN);
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  const handleDelete = async () => {
    await httpService.delete(`/tax/${editTax._id}`);
    const res = await fetchTax();
    setData(res);
    document.querySelectorAll('.cancel-btn')?.forEach((e) => e.click());
  };

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  });

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Taxes </title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Taxes</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Taxes</li>
              </ul>
            </div>
            <div className="col-auto float-right ml-auto">
              <a
                href="#"
                className="btn add-btn"
                data-toggle="modal"
                data-target="#add_tax"
              >
                <i className="fa fa-plus" /> Add Tax
              </a>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <table className="table table-striped custom-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tax Name </th>
                    <th>Tax type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((record, i) => {
                    return (
                      <tr>
                        <td>{i + 1}</td>
                        <td>{record.name}</td>
                        <td>{record.type}</td>
                        <td>{record.amount}</td>
                        <td>
                          <Space
                            size={'small'}
                          >
                            <Badge
                              status={record.status ? 'success' : 'error'}
                              text={record.status ? 'Active' : 'Inactive'}
                            />
                          </Space>
                        </td>
                        <td width={'5%'}>
                          <Space
                            size={'small'}
                          >
                            <a
                              className='ant-btn'
                              href='#'
                              data-toggle='modal'
                              data-target='#edit_tax'
                              onClick={() => {
                                setEditTax(record);
                              }}
                            >
                              <i className='fa fa-pencil m-r-5' /> Edit
                            </a>
                            <a
                              className='ant-btn ant-btn-dangerous'
                              href='#'
                              data-toggle='modal'
                              data-target='#delete_tax'
                              onClick={() => {
                                setEditTax(record);
                              }}
                            >
                              <i className='fa fa-trash-o m-r-5' /> Delete
                            </a>
                          </Space>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Content */}
      {/* Add Tax Modal */}
      <div id="add_tax" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Tax</h5>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTax();
                }}
              >
                <div className="form-group">
                  <label>
                    Tax Name <span className="text-danger">*</span>
                  </label>
                  <input
                    value={taxName}
                    className="form-control"
                    type="text"
                    onChange={(event) => setTaxName(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Tax Type <span className="text-danger">*</span>
                  </label>
                  <select
                    value={type}
                    className="form-control"
                    onChange={(event) => setType(event.target.value)}
                  >
                    <option value={''}>Tax type</option>
                    <option>Percentage</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Amount <span className="text-danger">*</span>
                  </label>
                  <input
                    value={taxpercentage}
                    className="form-control"
                    type="text"
                    onChange={(event) => setTaxPercentage(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                    value={status}
                    className="form-control"
                    placeholder=" Pending / Approved "
                    onChange={(event) => {
                      console.log(event.target.value,'setStatus');
                      setStatus(event.target.value);
                    }}
                  >
                    <option value={''}>Tax status</option>
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
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
      {/* /Add Tax Modal */}
      {/* Edit Tax Modal */}
      <div id="edit_tax" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"> Tax</h5>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditTax();
                }}
              >
                <div className="form-group">
                  <label>
                    Tax Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    defaultValue={editTax.name}
                    onChange={(event) =>
                      setEditTax({ ...editTax, name: event.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    Tax Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    value={editTax.type}
                    onChange={(event) =>
                      setEditTax((d) => ({ ...d, type: event.target.value }))
                    }
                  >
                    <option>Percentage</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Amount <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={editTax.amount}
                    onChange={(event) =>
                      setEditTax((d) => ({ ...d, amount: event.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    value={editTax.status}
                    onChange={(event) =>
                      setEditTax((d) => ({ ...d, status: event.target.value }))
                    }
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn " type="submit">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Tax Modal */}
      {/* Delete Tax Modal */}
      <div className="modal custom-modal fade" id="delete_tax" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Tax</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                      href=""
                      className="btn btn-primary continue-btn"
                    >
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href=""
                      data-dismiss="modal"
                      className="btn btn-primary cancel-btn"
                    >
                      Cancel
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Tax Modal */}
    </div>
  );
}

export default Taxes;
