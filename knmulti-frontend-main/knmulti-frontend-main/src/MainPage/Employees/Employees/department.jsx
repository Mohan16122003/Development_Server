import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { Table } from 'antd';
import 'antd/dist/antd.css';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import '../../antdstyle.css';
import httpService from '../../../lib/httpService';
import { fetchdepartment } from '../../../lib/api';

const Department = () => {
  const [data, setData] = useState([]);
  const [department, setDepartment] = useState([]);
  const [departmentToModify, setDepartmentToModify] = useState(null);
  const [departmentNameToAdd, setDepartmentNameToAdd] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetchdepartment();
      console.log(res);
      console.log('departments');
      setData(res.map((v, i) => ({ ...v, id: i + 1 })));

      console.log(res);
    })();
  }, []);

  const handleAddDepartment = async () => {
    const res = await httpService.post('/department', {
      name: departmentNameToAdd,
      active: true,
    });
    // console.log(res.data);
    setData((d) => [
      ...d,
      {
        ...res.data,
        id: d.length + 1,
        department: res.data.departmentName,
      },
    ]);
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  const handleEditDepartment = async () => {
    if (departmentToModify.name.length <= 0) return;
    const res = await httpService.put('/department/' + departmentToModify._id, {
      ...departmentToModify,
    });
    if (res) {
      setData((d) =>
        d.map((item) => (item._id === res.data._id ? departmentToModify : item))
      );
      document.querySelectorAll('.close')?.forEach((e) => e.click());
    }
  };

  const handleDeleteDepartment = async () => {
    const res = await httpService.delete(
      '/department/' + departmentToModify._id
    );
    const itemIndex = departmentToModify.id - 1;
    setData((d) => [
      ...d.slice(0, itemIndex),
      ...d
        .slice(itemIndex + 1)
        .map((i) => ({ ...i, id: i.id - 1, department: i.departmentName })),
    ]);
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      sorter: (a, b) => a.id.length - b.id.length,
    },
    {
      title: 'Department',
      dataIndex: 'name',
      sorter: (a, b) => a.department.length - b.department.length,
    },
    {
      title: 'Action',
      render: (text, record) => (
        <div className="dropdown dropdown-action text-right">
          <a
            href="#"
            className="action-icon dropdown-toggle"
            data-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a
              className="dropdown-item"
              href="#"
              data-toggle="modal"
              data-target="#edit_department"
              onClick={() => {
                setDepartmentToModify(record);
              }}
            >
              <i className="fa fa-pencil m-r-5" /> Edit
            </a>
            <a
              className="dropdown-item"
              href="#"
              data-toggle="modal"
              data-target="#delete_department"
              onClick={() => {
                setDepartmentToModify(record);
              }}
            >
              <i className="fa fa-trash-o m-r-5" /> Delete
            </a>
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Department </title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Department</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Department</li>
              </ul>
            </div>
            <div className="col-auto float-right ml-auto">
              <a
                href="#"
                className="btn add-btn"
                data-toggle="modal"
                data-target="#add_department"
              >
                <i className="fa fa-plus" /> Add Department
              </a>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                className="table-striped"
                pagination={{
                  total: data.length,
                  showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  showSizeChanger: true,
                  onShowSizeChange: onShowSizeChange,
                  itemRender: itemRender,
                }}
                style={{ overflowX: 'auto' }}
                columns={columns}
                // bordered
                dataSource={data}
                rowKey={(record) => record.id}
                onChange={console.log('change')}
              />
            </div>
          </div>
        </div>
      </div>
      {/* /Page Content */}
      {/* Add Department Modal */}
      <div
        id="add_department"
        className="modal custom-modal fade"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Department</h5>
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
                  handleAddDepartment();
                }}
              >
                <div className="form-group">
                  <label>
                    Department Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={departmentNameToAdd || ''}
                    onChange={(e) => setDepartmentNameToAdd(e.target.value)}
                  />
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Department Modal */}
      {/* Edit Department Modal */}
      <div
        id="edit_department"
        className="modal custom-modal fade"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"> Department</h5>
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
                  handleEditDepartment();
                }}
              >
                <div className="form-group">
                  <label>
                    Department Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    defaultValue={departmentToModify?.name || ''}
                    onChange={(e) => {
                      setDepartmentToModify((v) => ({
                        ...v,
                        name: e.target.value,
                      }));
                    }}
                    type="text"
                  />
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Department Modal */}
      {/* Delete Department Modal */}
      <div
        className="modal custom-modal fade"
        id="delete_department"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Department</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteDepartment();
                      }}
                      data-dismiss="modal"
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
      {/* /Delete Department Modal */}
    </div>
  );
};

export default Department;
