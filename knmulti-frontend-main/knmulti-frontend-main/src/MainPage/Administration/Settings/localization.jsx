/**
 * Signin Firebase
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import httpService from '../../../lib/httpService';
import AddLocationModal from './AddLocationModal';
import { Table, Space } from 'antd';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import moment from 'moment';

const Localization = () => {
  const [locs, setLocs] = useState([]);
  const [locName, setLocName] = useState('');
  const [curr, setCurr] = useState('');

  const fetchLocation = async () => {
    const res = await httpService.get(`/location`);
    console.log('res =>', res.data);
    setLocs(res?.data);
  };

  const handleLinkClick = (e, locId, locN) => {
    setCurr(locId);
    setLocName(locN);
  };

  const handleLocName = async (e) => {
    e.preventDefault();
    await httpService.put(`/location/${curr}`, { name: locName });
    await fetchLocation();
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    await httpService.delete(`/location/${curr}`);
    await fetchLocation();
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  useEffect(() => {
    fetchLocation();

    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
  }, []);

  const column = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      render: (text, record) => (
        <>{moment(record?.createdAt).format('DD-MM-YYYY')}</>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      render: (text, record) => (
        <>{moment(record?.updatedAt).format('DD-MM-YYYY')}</>
      ),
    },
    {
      title: 'Actions',
      render: (text, record) => (
        <Space size={'small'}>
          <div
            onClick={() => handleLinkClick(text, record._id, record.name)}
            className="ant-btn"
            data-toggle="modal"
            data-target="#edit_loc"
          >
            <i className="fa fa-pencil m-r-5" /> Edit
          </div>
          <div
            onClick={() => handleLinkClick(text, record._id, record.name)}
            className="ant-btn ant-btn-dangerous"
            data-toggle="modal"
            data-target="#delete_loc"
          >
            <i className="fa fa-trash-o m-r-5" /> Delete
          </div>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Localization </title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Work Location</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Setting</Link>
                </li>
                <li className="breadcrumb-item active">Location</li>
              </ul>
            </div>
            <div className="col-auto float-right ml-auto">
              <Link
                to="#"
                className="btn btn-primary btn-block"
                data-toggle="modal"
                data-target="#add_loc"
              >
                <i className="fa fa-plus" /> Add Location
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                className="table-striped"
                pagination={{
                  total: locs.length,
                  showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  showSizeChanger: true,
                  onShowSizeChange: onShowSizeChange,
                  itemRender: itemRender,
                }}
                style={{ overflowX: 'auto' }}
                columns={column}
                // bordered
                dataSource={locs}
                rowKey={(record) => record._id}
              />
            </div>
          </div>
        </div>
      </div>

      <div id="edit_loc" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content modal-md">
            <div className="modal-header">
              <h5 className="modal-title"> Location</h5>
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
              <form>
                <div className="form-group">
                  <label>
                    Location <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    // defaultValue="Team Leader"
                    type="text"
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                  />
                </div>
                <div className="submit-section">
                  <div
                    className="btn btn-primary"
                    data-dismiss="modal"
                    onClick={handleLocName}
                  >
                    Save
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* delete  */}
      <div className="modal custom-modal fade" id="delete_loc" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Location</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row text-center">
                  <div className="col-6" onClick={handleDelete}>
                    <Link
                      to="#"
                      className="btn btn-primary"
                      data-dismiss="modal"
                    >
                      Delete
                    </Link>
                  </div>
                  <div className="col-6">
                    <Link
                      to="#"
                      data-dismiss="modal"
                      className="btn btn-primary"
                    >
                      Cancel
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddLocationModal fetchLocation={fetchLocation} />

      {/* /Page Content */}
    </div>
  );
};

export default Localization;
