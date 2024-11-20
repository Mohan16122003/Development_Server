import React, { useEffect, useState } from 'react';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import { Table } from 'antd';
import DatePicker from 'react-date-picker';
import Swal from 'sweetalert2';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { toast } from 'react-toastify';
import httpService from '../../../lib/httpService';
import { useSelector } from 'react-redux';
import DFRaddReportRow from './DFRaddReportRow';
import jwtDecode from 'jwt-decode';

const DFRForm = ({ employeeData }) => {
  const [todaysReport, setTodaysReport] = useState({ id: '', child: [] });
  const [customer, setCustomer] = useState([]);
  const [editData, setEditData] = useState({ id: '', date: new Date() });
  const [itemsToAdd, setItemsToAdd] = useState([]);
  const [dfrTable, setDfrTable] = useState([]);
  const {
    value,
    isAdmin,
    isHR,
    isHRManager,
    isAccountent,
    isAccountManager,
    isSalesEmployee,
    isSalesManager,
  } = useSelector((val) => val.authentication);

  useEffect(() => {
    getDfrData(employeeData._id);
    fetchCustomers();
  }, [employeeData._id]);
  useEffect(() => {
    setEditData({ ...editData, id: todaysReport.id });
  }, [employeeData]);

  const getDfrData = async (id) => {
    try {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      let res = await httpService.get(`/dailyfieldreport/${id}`);
      setDfrTable(
        res.data
          .map((el, id) => ({
            key: id.toString(),
            id: el._id,
            index: id + 1,
            child: el.leadInfo,
            date: new Date(el.date).toLocaleDateString('en-GB', options),
            total_tasks: el.leadInfo.length,
            name: employeeData.firstName,
            date_stock: el.date,
          }))
          .sort((a, b) => a.id - b.id)
      );
      let todaysData = res.data
        .filter((el) => isToday(new Date(el.date)))
        .map((el) => ({ child: el.leadInfo || [], id: el?._id }));
      setTodaysReport(...todaysData);
    } catch (err) {
      toast.error("Error while fetching uesr's data");
      throw err;
    }
  };
  const isToday = (date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };
  const fetchCustomers = async () => {
    const customers = await httpService.get('/customer');
    setCustomer(customers.data);
  };

  const handleItemsAddition = (e, index) => {
    const updatedItemList = itemsToAdd.map((pct, i) =>
      index == i ? Object.assign(pct, { [e.target.name]: e.target.value }) : pct
    );
    setItemsToAdd(updatedItemList);
  };

  const removeitem = (e, index) => {
    if (index !== 0) {
      const updatedItemList = itemsToAdd.filter((pct, i) => index !== i);
      setItemsToAdd(updatedItemList);
    }
  };

  const addItems = () => {
    setItemsToAdd([
      ...itemsToAdd,
      {
        name: '',
        contactNo: '',
        callNo: '',
        releventPoint: '',
        nextAppoinment: '',
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        const data = {
          leadInfo: itemsToAdd,
          assigned_by: value.user?._id,
          assigned_to: employeeData._id,
        };
        httpService.post(`/dailyfieldreport/`, data).then((res) => {
          console.log('response after submitting dfr', res);
          toast.info('Daily Report added successfully');
        });
        document.querySelectorAll('.close')?.forEach((e) => e.click());
        getDfrData(employeeData._id);
        setItemsToAdd([]);
      }
    });
  };

  const expandedRowRender = (val) => {
    const columns = [
      { title: 'Sl No', dataIndex: 'index', key: 'index' },
      { title: 'Lead Info', dataIndex: 'name', key: 'name' },
      { title: 'Contact No', dataIndex: 'phone', key: 'phone' },
      { title: 'Call No.', dataIndex: 'totalCalls', key: 'totalCalls' },
      {
        title: 'Relevent Point Discussed',
        dataIndex: 'pointDiscussed',
        key: 'pointDiscussed',
      },
      {
        title: 'Next Appointment',
        dataIndex: 'nextAppointment',
        key: 'nextAppointment',
      },
    ];
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const data = val?.child.map((el, id) => ({
      index: id + 1,
      name: el.name,
      phone: el.contactNo,
      totalCalls: el.callNo,
      pointDiscussed: el.releventPoint,
      nextAppointment: new Date(el.nextAppoinment).toLocaleString(
        'en-GB',
        options
      ),
    }));
    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  const columns = [
    { title: 'S. No.', dataIndex: 'index', key: 'index' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Task Done', dataIndex: 'total_tasks', key: 'total_tasks' },
    {
      title: 'Action',
      key: 'operation',
      render: (element) =>
        isAdmin || isHR || isHRManager ? (
          <a
            data-toggle="modal"
            data-target="#update_report"
            onClick={() => handleUpdateData(element)}
            style={{ color: 'blue' }}
          >
            Edit
          </a>
        ) : (
          ''
        ),
    },
  ];

  const toInputUppercase = (e) => {
    e.target.value = ('' + e.target.value).toUpperCase();
  };

  const toCapitalize = (e) => {
    e.target.value =
      e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        const data = {
          leadInfo: itemsToAdd,
          assigned_by: value.user?._id,
          assigned_to: employeeData._id,
          date: editData.date,
        };
        httpService
          .put(`/dailyfieldreport/${editData.id}`, data)
          .then((res) => {
            toast.info('Daily Report Updated successfully');
            getDfrData(employeeData._id);
            setItemsToAdd([]);
          });
        document.querySelectorAll('.close')?.forEach((e) => e.click());
      }
    });
  };

  const handleUpdateData = (data) => {
    setItemsToAdd(data?.child);
    setEditData({
      id: data.id,
      date: data.date_stock ? new Date(data.date_stock) : new Date(),
    });
  };
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3>Daily Field Report</h3>
        {todaysReport?.child?.length ? (
          <a
            onClick={() => handleUpdateData(todaysReport)}
            href="#"
            className="btn add-btn"
            data-toggle="modal"
            data-target="#update_report"
          >
            <i className="fa fa-plus" /> Update Report
          </a>
        ) : (
          <a
            href="#"
            className="btn add-btn"
            data-toggle="modal"
            data-target="#add_report"
          >
            <i className="fa fa-plus" /> Add Report
          </a>
        )}
      </div>
      <hr />

      {/* <div className="table-responsive"> */}
      <Table
        columns={columns}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
        dataSource={dfrTable}
        size="small"
        className="table-striped"
        pagination={{
          total: dfrTable?.length,
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          itemRender: itemRender,
        }}
      />
      {/* </div> */}
      {!todaysReport?.child?.length && (
        <div id="add_report" className="modal custom-modal fade" role="dialog">
          <div
            className="modal-dialog modal-dialog-centered modal-lg mw-100 w-75"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"> Daily Field Report</h5>
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
                    <div
                      style={{
                        margin: '20px',
                      }}
                    >
                      <label htmlFor="">Date</label>
                      <DatePicker
                        disabled={true}
                        className="form-control"
                        name="date"
                        value={editData.date}
                        format={'dd/MM/yyyy'}
                      />
                    </div>

                    <div className="col-md-12 col-sm-12">
                      <div className="table-responsive">
                        <table
                          style={{ minHeight: '300px' }}
                          className="table table-hover table-white "
                        >
                          <thead>
                            <tr className="text-center">
                              <th>Name and Adrress</th>
                              <th>Mobile.No.</th>
                              <th>No. Calls</th>
                              <th>Relevant Point Discussed</th>
                              <th>Next Appoinment</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsToAdd?.map((el, index) => (
                              <DFRaddReportRow
                                key={index}
                                handleItemsAddition={handleItemsAddition}
                                customer={customer}
                                item={el}
                                index={index}
                                removeitem={removeitem}
                              />
                            ))}
                          </tbody>
                        </table>
                        <div className="btn btn-primary" onClick={addItems}>
                          + Add Items
                        </div>
                      </div>
                      <div className="submit-section">
                        <button
                          className="btn btn-primary submit-btn"
                          type="submit"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div id="update_report" className="modal custom-modal fade" role="dialog">
        <div
          className="modal-dialog modal-dialog-centered modal-lg mw-100 w-75"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"> Update Daily Field Report</h5>
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
              <form onSubmit={handleUpdate}>
                <div className="row">
                  <div
                    style={{
                      margin: '20px',
                    }}
                  >
                    <label htmlFor="">Date</label>
                    <DatePicker
                      disabled={true}
                      className="form-control"
                      name="date"
                      value={editData.date}
                      format={'dd/MM/yyyy'}
                    />
                  </div>

                  <div className="col-md-12 col-sm-12">
                    <div className="table-responsive">
                      <table
                        style={{ minHeight: '300px' }}
                        className="table table-hover table-white "
                      >
                        <thead>
                          <tr className="text-center">
                            <th>Name and Adrress</th>
                            <th>Mobile.No.</th>
                            <th>No. Calls</th>
                            <th>Relevant Point Discussed</th>
                            <th>Next Appoinment</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemsToAdd?.map((el, index) => (
                            <DFRaddReportRow
                              key={index}
                              handleItemsAddition={handleItemsAddition}
                              customer={customer}
                              item={el}
                              index={index}
                              removeitem={removeitem}
                            />
                          ))}
                        </tbody>
                      </table>
                      <div className="btn btn-primary" onClick={addItems}>
                        + Add Items
                      </div>
                    </div>
                    <div className="submit-section">
                      <button
                        className="btn btn-primary submit-btn"
                        type="submit"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DFRForm;
