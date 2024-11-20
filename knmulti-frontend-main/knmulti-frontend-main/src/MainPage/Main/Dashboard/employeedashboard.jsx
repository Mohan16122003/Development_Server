import React, { useEffect, useState } from 'react';
import { fetchLeaves } from '../../../lib/api';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import EmployeeTask from './EmployeeTask';
import httpService from '../../../lib/httpService';
import { Link } from 'react-router-dom';
// import { dateDiff,  } from '../../misc/helpers';
import {
  Avatar_02,
  Avatar_04,
  Avatar_08,
  Avatar_09,
} from '../../../Entryfile/imagepath.jsx';
import { dateDiff } from '../../../misc/helpers';
import { Table, Space } from 'antd';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import moment from 'moment';

const EmployeeDashboard = () => {
  const [selectRender, setSelectRender] = useState('default');
  const user = useSelector((state) => state.authentication.value.user);
  const [employeeList, setEmployeeList] = useState([]);
  const [filterQueries, setFilterQueries] = useState({
    name: '',
    date: null,
    month: null,
    year: null,
  });
  // const [filteredByNameList, setFilteredByNameList] = useState([]);
  const [filterQueries2, setFilterQueries2] = useState({
    month: { value: new Date().getMonth() },
    year: { value: new Date().getFullYear() },
  });
  const [totalLeaves, setTotalLeaves] = useState([]);
  const [TOTAL_LEAVES, setTOTAL_LEAVES] = useState();
  const [empTask, setEmpTask] = useState();
  const [filterEmpTask, setFilterEmpTask] = useState([]);
  const [today, setToday] = useState([]);
  const [tomorrow, setTomorrow] = useState([]);
  const todayDate = new Date().toDateString();
  const [curr, setCurr] = useState('');
  const [showDayTask, setShowDayTask] = useState(false);
  const [tomorrowTask, setTomorrowTask] = useState(false);
  const [showWeekTask, setShowWeekTask] = useState(true);
  //employee leaves
  const onFilterClick = async (e) => {
    setTOTAL_LEAVES(user?.totalLeaves);
    const res2 = await fetchLeaves(user?._id);
    var count = 0;
    for (let i = 0; i < res2?.length; i++) {
      if (res2[i].approved == true) {
        count =
          count +
          dateDiff(new Date(res2[i]?.fromDate), new Date(res2[i]?.toDate));
      }
    }
    setTotalLeaves(count);
  };
  //employee leaves

  useEffect(() => {
    onFilterClick();
  }, []);

  //employee task
  const fetchEmpTask = async () => {
    const res = await httpService.get(`/employeeTask`);
    setEmpTask(res?.data);
  };

  useEffect(() => {
    fetchEmpTask();
  }, []);

  const filterEmp = () => {
    let emp = empTask?.filter((e) => {
      if (e?.id === user?._id) {
        return e;
      }
    });
    setFilterEmpTask(emp);
  };

  useEffect(() => {
    filterEmp();
  }, [empTask]);

  const filterToday = (e) => {
    filterEmpTask
      ?.filter((e) => {
        if (new Date(e?.start).toDateString() === todayDate) {
          return e;
        }
      })
      .map((e) => {
        setToday((oldArray) => [...oldArray, e]);
      });
  };
  const filterTomorrow = (e) => {
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    filterEmpTask
      ?.filter((e) => {
        if (new Date(e?.start).toDateString() === tomorrow.toDateString()) {
          return e;
        }
      })
      .map((e) => {
        setTomorrow((oldArray) => [...oldArray, e]);
      });
  };
  useEffect(
    (e) => {
      filterToday();
      filterTomorrow();
    },
    [filterEmpTask]
  );

  const handleDelete = async (e) => {
    e.preventDefault();
    let res = await httpService.delete(`/employeeTask/${curr}`);
    let deletedTask = res.data?._id;
    setFilterEmpTask(filterEmpTask.filter((e) => e._id !== deletedTask));
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  const column = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="dash-card-icon-sm">
          <i className="fa fa-suitcase" />
          <span className="ml-4">{record?.title}</span>
        </div>
      ),
    },
    {
      title: 'Start',
      dataIndex: 'start',
      render: (text, record) => (
        <>
          <>{moment(record?.start).format('DD-MM-YYYY')}</>
          <span> -- </span>
          <>{moment(record?.start).format('HH:MM')}</>
        </>
      ),
    },
    {
      title: 'End',
      dataIndex: 'end',
      render: (text, record) => <>{moment(record?.end).format('DD-MM-YYYY')}</>,
    },
    {
      title: 'Action',
      render: (text, record) => (
        <Space size={'small'}>
          <div
            onClick={() => setCurr(record?._id)}
            className="ant-btn ant-btn-dangerous"
            data-toggle="modal"
            data-target="#delete_leavetype"
          >
            <i className="fa fa-trash-o m-r-5" /> Delete
          </div>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper p-5">
        <Helmet>
          <title>Dashboard</title>
          <meta name="description" content="Dashboard" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Welcome {user?.firstName}!</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item active">Dashboard</li>
                </ul>
              </div>
              <div className="col-auto float-right ml-auto">
                <a
                  href="#"
                  className="btn add-btn"
                  data-toggle="modal"
                  data-target="#add_task"
                >
                  <i className="fa fa-plus" />
                  Add New Task
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* /Page Content */}
        <div className="row">
          <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div className="card dash-widget">
              <Link to="/app/employees/leave request">
                <div className="card-body">
                  <Link to="/app/employees/leave request">
                    <span className="dash-widget-icon">
                      <i className="fa fa-cubes" />
                    </span>
                  </Link>
                  <div className="dash-widget-info">
                    <h3>{totalLeaves || 0}</h3>

                    <Link to="/app/employees/leave request">
                      {' '}
                      <span>Leaves Remaining</span>
                    </Link>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div className="card dash-widget">
              <Link to="/app/employees/leave request">
                <div className="card-body">
                  <Link to="/app/employees/leave request">
                    <span className="dash-widget-icon">
                      <i className="fa fa-cubes" />
                    </span>
                  </Link>
                  <div className="dash-widget-info">
                    <h3>
                      {TOTAL_LEAVES - totalLeaves > 0
                        ? TOTAL_LEAVES - totalLeaves || 0
                        : 24 - totalLeaves}
                    </h3>

                    <Link to="/app/employees/leave request">
                      {' '}
                      <span>Leaves Taken</span>
                    </Link>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Today's task */}
        <section>
          <h1
            className="dash-sec-title"
            onClick={() => {
              setTomorrowTask(false);
              setShowDayTask(true);
              setShowWeekTask(false);
            }}
          >
            Today's Tasks{' '}
          </h1>
          <div className="row">
            {showDayTask && (
              <div className="col-md-12">
                <div className="table-responsive">
                  <Table
                    className="table-striped"
                    pagination={{
                      total: today.length,
                      showTotal: (total, range) =>
                        `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                      showSizeChanger: true,
                      onShowSizeChange: onShowSizeChange,
                      itemRender: itemRender,
                    }}
                    style={{ overflowX: 'auto' }}
                    columns={column}
                    // bordered
                    dataSource={today}
                    rowKey={(record) => record._id}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* tomorrow task */}
        <section>
          <h1
            onClick={() => {
              setTomorrowTask(true);
              setShowDayTask(false);
              setShowWeekTask(false);
            }}
            className="dash-sec-title"
          >
            What's Happening Tomorrow
          </h1>
          <div className="row">
            {tomorrowTask && (
              <div className="col-md-12">
                <div className="table-responsive">
                  <Table
                    className="table-striped"
                    pagination={{
                      total: tomorrow.length,
                      showTotal: (total, range) =>
                        `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                      showSizeChanger: true,
                      onShowSizeChange: onShowSizeChange,
                      itemRender: itemRender,
                    }}
                    style={{ overflowX: 'auto' }}
                    columns={column}
                    // bordered
                    dataSource={tomorrow}
                    rowKey={(record) => record._id}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
        {/* 7 Days task  */}

        <section>
          <h1
            onClick={() => {
              setTomorrowTask(false);
              setShowDayTask(false);
              setShowWeekTask(true);
            }}
            className="dash-sec-title"
          >
            7 Days Task
          </h1>

          <div className="row">
            {showWeekTask && (
              <div className="col-md-12">
                <div className="table-responsive">
                  <Table
                    className="table-striped"
                    pagination={{
                      total: filterEmpTask?.length,
                      showTotal: (total, range) =>
                        `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                      showSizeChanger: true,
                      onShowSizeChange: onShowSizeChange,
                      itemRender: itemRender,
                    }}
                    style={{ overflowX: 'auto' }}
                    columns={column}
                    // bordered
                    dataSource={filterEmpTask}
                    rowKey={(record) => record._id}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <>
        <EmployeeTask empTask={filterEmpTask} fetchEmpTask={fetchEmpTask} />
      </>
      <div
        className="modal custom-modal fade"
        id="delete_leavetype"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Leave Type</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a
                      href=""
                      className="btn btn-primary continue-btn"
                      data-dismiss="modal"
                      onClick={handleDelete}
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
    </>
  );
};

export default EmployeeDashboard;
