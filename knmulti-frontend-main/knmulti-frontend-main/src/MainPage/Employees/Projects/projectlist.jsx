import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import 'react-summernote/dist/react-summernote.css'; // import styles
import '../../index.css';
import httpService from '../../../lib/httpService';
import { toast } from 'react-toastify';
import { CircularProgress } from '@mui/material';
import AddProjectModal from './popups/AddProjectModal';
import EditProjectModal from './popups/EditProjectModal';
import DeleteProjectModal from './popups/DeleteProjectModal';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import { Badge, Space, Table } from 'antd';
import moment from 'moment';
import { useSelector } from 'react-redux';

const ProjectList = (props) => {
  const [projectList, setProjectList] = React.useState([]);
  const [projectsFromServer, setProjectsFromServer] = React.useState([]);
  const [projectToEdit, setProjectToEdit] = React.useState({});
  const [projectNameToSearch, setProjectNameToSearch] = React.useState('');
  const [projectTypeFilter, setProjectTypeFilter] = React.useState('');
  const [projectSubTypeFilter, setProjectSubTypeFilter] = React.useState('');
  const [isLoading, setLoading] = React.useState(true);
  const [totalPlotArea, setTotalPlotArea] = useState(0);
  const [plotAreaUnderDiscussion, setPlotAreaUnderDiscussion] = useState(0);
  const [plotAreaInNegotiation, setPlotAreaInNegotiation] = useState(0);
  const [plotAreaLeadsWon, setPlotAreaLeadsWon] = useState(0);
  const [plotAreaSoldOut, setPlotAreaSoldOut] = useState(0);
  const [totalPlots, setTotalPlots] = useState(0);
  const [totalPlotsSoldOut, setTotalPlotsSoldOut] = useState(0);
  const [totalPlotsInDiscussion, setTotalPlotsInDiscussion] = useState(0);
  const [totalPlotsInNegotiation, setTotalPlotsInNegotiation] = useState(0);
  const [totalPlotsLeadsWon, setTotalPlotsLeadsWon] = useState(0);
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    let role = JSON.parse(localStorage.getItem('auth'))?.user?.jobRole?.name;
    console.log('role =>', role);
    setAdmin(role === 'Admin' || role === 'Sales Manager');
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await httpService.get('/project');
      setProjectsFromServer(result.data);
      result.data.forEach((project) => {
        const totalArea = project.subPlots.reduce((a, b) => a + b.area, 0);
        const totalAreaSold = project.subPlots
          .filter((l) => l.sold)
          .reduce((a, b) => a + b.area, 0);
        const totalAreaInDiscussion = project.subPlots
          .filter(
            (p) =>
              !p.sold &&
              p.leadsInfo.some(
                (l) => l.leadType === 'Discussions' || l.leadType === 'New Lead'
              )
          )
          .reduce((a, b) => a + b.area, 0);
        const totalAreaInNegotiation = project.subPlots
          .filter(
            (p) =>
              !p.sold && p.leadsInfo.some((l) => l.leadType === 'Negotiations')
          )
          .reduce((a, b) => a + b.area, 0);
        const totalAreaLeadsWons = project.subPlots
          .filter(
            (p) => !p.sold && p.leadsInfo.some((l) => l.leadType === 'Lead Won')
          )
          .reduce((a, b) => a + b.area, 0);
        const totalPlots = project.subPlots.length;
        const totalPlotsSoldOut = project.subPlots.filter((l) => l.sold).length;
        const totalPlotsInDiscussion = project.subPlots.filter(
          (p) =>
            !p.sold &&
            p.leadsInfo.some(
              (l) => l.leadType === 'Discussions' || l.leadType === 'New Lead'
            )
        ).length;
        const totalPlotsInNegotiation = project.subPlots.filter(
          (p) =>
            !p.sold && p.leadsInfo.some((l) => l.leadType === 'Negotiations')
        ).length;
        const totalPlotsLeadsWons = project.subPlots.filter(
          (p) => !p.sold && p.leadsInfo.some((l) => l.leadType === 'Lead Won')
        ).length;
        setTotalPlotArea((d) => d + totalArea);
        setPlotAreaSoldOut((d) => d + totalAreaSold);
        setPlotAreaInNegotiation((d) => d + totalAreaInNegotiation);
        setPlotAreaLeadsWon((d) => d + totalAreaLeadsWons);
        setPlotAreaUnderDiscussion((d) => d + totalAreaInDiscussion);
        setTotalPlots((d) => d + totalPlots);
        setTotalPlotsSoldOut((d) => d + totalPlotsSoldOut);
        setTotalPlotsInDiscussion((d) => d + totalPlotsInDiscussion);
        setTotalPlotsInNegotiation((d) => d + totalPlotsInNegotiation);
        setTotalPlotsLeadsWon((d) => d + totalPlotsLeadsWons);
      });
    } catch (error) {}
    setLoading(false);
  };

  const searchProject = async (e) => {
    e.preventDefault();
    const filteredProjects = projectsFromServer.filter((project) =>
      project.name.toLowerCase().includes(projectNameToSearch.toLowerCase())
    );
    setProjectList(filteredProjects);
  };

  useEffect(() => {
    if (!isLoading && projectNameToSearch) {
      const filteredProjects = projectsFromServer.filter((project) =>
        project.name.toLowerCase().includes(projectNameToSearch.toLowerCase())
      );
      setProjectList(filteredProjects);
    } else {
      setProjectList(projectsFromServer);
    }
  }, [isLoading, projectNameToSearch]);

  useEffect(() => {
    if (projectTypeFilter !== '') {
      const filteredProjects = projectsFromServer.filter(
        (project) => project?.type === projectTypeFilter
      );
      setProjectList(filteredProjects);
    } else {
      setProjectList(projectsFromServer);
    }
  }, [projectTypeFilter]);

  useEffect(() => {
    if (projectSubTypeFilter !== '') {
      const filteredProjects = projectsFromServer.filter(
        (project) => project?.subtype === projectSubTypeFilter
      );
      setProjectList(filteredProjects);
    } else {
      setProjectList(projectsFromServer);
    }
  }, [projectSubTypeFilter]);

  const editProjects = async (e) => {
    await toast.promise(
      new Promise((resolve, reject) => {
        httpService
          .put(`/project/${projectToEdit._id}`, projectToEdit)
          .then((res) => {
            fetchData();
            setProjectToEdit({});
            document.querySelectorAll('.close')?.forEach((e) => e.click());
            resolve();
            e.target.reset();
          })
          .catch((err) => {
            reject();
          });
      }),
      {
        pending: 'Updating Project...',
        success: 'Project Updated Successfully',
        error: 'Something went wrong',
      }
    );
  };

  const deleteProject = async () => {
    toast.promise(
      new Promise((resolve, reject) => {
        httpService.delete(`/project/${projectToEdit._id}`).then((res) => {
          if (res.status < 400) {
            fetchData();
            document.querySelectorAll('.cancel-btn')?.forEach((e) => e.click());
            setProjectToEdit({});
            resolve();
          } else {
            reject();
          }
        });
      }),
      {
        pending: 'Deleting Project...',
        success: 'Project Deleted Successfully',
        error: 'Something went wrong',
      }
    );
  };

  const convertDate = (date) => {
    var newDate = new Date(date);
    var dateString =
      newDate.getDate() +
      '/' +
      (newDate.getMonth() + 1) +
      '/' +
      newDate.getFullYear();
    return dateString;
  };

  const { isAdmin, isSalesManager } = useSelector((val) => val.authentication);

  const column = [
    {
      title: 'Project',
      dataIndex: 'name',
      render: (text, record) => (
        <Link to={`/app/projects/projects-view/${record?._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Project Type',
      dataIndex: 'type',
    },
    {
      title: 'Sub Type',
      dataIndex: 'subtype',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      render: (text, record) => (
        <>{moment(record?.startDate).format('DD-MM-YYYY')}</>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'saleStatus',
      render: (text, record) => (
        <Badge
          status={
            record?.saleStatus?.toUpperCase() === 'LIVE' ? 'success' : 'error'
          }
          text={
            record?.saleStatus?.charAt(0).toUpperCase() +
            record?.saleStatus?.slice(1)
          }
        />
      ),
    },
    {
      title: isAdmin ? 'Action' : '',
      render: (text, record) =>
        isAdmin || isSalesManager ? (
          <Space size={'small'}>
            <div
              className="ant-btn"
              data-toggle="modal"
              data-target="#edit_project"
              onClick={() => setProjectToEdit(record)}
            >
              <i className="fa fa-pencil m-r-5" /> Edit
            </div>
            <div
              className="ant-btn ant-btn-dangerous"
              data-toggle="modal"
              data-target="#delete_project"
              onClick={() => setProjectToEdit(record)}
            >
              <i className="fa fa-trash-o m-r-5" /> Delete
            </div>
          </Space>
        ) : null,
      width: '10%',
    },
  ];

  const noAdminColumn = [
    {
      title: 'Project',
      dataIndex: 'name',
      render: (text, record) => (
        <Link to={`/app/projects/projects-view/${record?._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Project Type',
      dataIndex: 'type',
    },
    {
      title: 'Sub Type',
      dataIndex: 'subtype',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      render: (text, record) => (
        <>{moment(record?.startDate).format('DD-MM-YYYY')}</>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'saleStatus',
      render: (text, record) => (
        <Badge
          status={
            record?.saleStatus?.toUpperCase() === 'LIVE' ? 'success' : 'error'
          }
          text={
            record?.saleStatus?.charAt(0).toUpperCase() +
            record?.saleStatus?.slice(1)
          }
        />
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Projects </title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      {isLoading && (
        <div
          style={{
            height: '90vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          className="content container-fluid"
        >
          <CircularProgress />
        </div>
      )}
      {!isLoading && (
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Projects</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Projects</li>
                </ul>
              </div>
              {isAdmin || isSalesManager ? (
                <div className="col-auto float-right ml-auto">
                  <a
                    href="#"
                    className="btn add-btn"
                    data-toggle="modal"
                    data-target="#create_project"
                  >
                    <i className="fa fa-plus" /> Create Project
                  </a>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>

          <div className="row filter-row">
            <div className="col-sm-6 col-md-4">
              <div className="form-group form-focus focused">
                <input
                  onChange={(e) => {
                    setProjectNameToSearch(e.target.value);
                  }}
                  type="text"
                  required
                  placeholder="Project Name"
                  style={{
                    padding: '10px',
                  }}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-sm-6 col-md-2">
              <a
                href="#"
                onClick={searchProject}
                className="btn btn-success btn-block"
              >
                {' '}
                Search{' '}
              </a>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="form-group form-focus select-focus">
                <select
                  onChange={(e) => {
                    setProjectTypeFilter(e.target.value);
                  }}
                  className="custom-select"
                  style={{
                    height: '100%',
                    border: '1px solid #CED4DA',
                  }}
                >
                  <option value={''}>Project Type</option>
                  <option value={'Plot'}>Plotting</option>
                  <option value={'Housing'}>Housing</option>
                </select>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="form-group form-focus select-focus">
                <select
                  onChange={(e) => {
                    setProjectSubTypeFilter(e.target.value);
                  }}
                  className="custom-select"
                  style={{
                    height: '100%',
                    border: '1px solid #CED4DA',
                  }}
                >
                  <option value={''}>Project Subtype</option>
                  <option value={'Residencial Plot'}>Residencial Plot</option>
                  <option value={'Commercial Plot'}>Commercial Plot</option>
                  <option value={'Farm Plot'}>Farm Plot</option>
                  <option value={'Apartment'}>Apartment</option>
                  <option value={'Simplex'}>Simplex</option>
                  <option value={'Duplex'}>Duplex</option>
                  <option value={'Triplex'}>Triplex</option>
                  <option value={'Villa'}>Villa</option>
                  <option value={'Bunglow'}>Bunglow</option>
                  <option value={'Penthouse'}>Penthouse</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive">
                <Table
                  className="table-striped"
                  pagination={{
                    total: projectList.length,
                    showTotal: (total, range) =>
                      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    itemRender: itemRender,
                  }}
                  style={{ overflowX: 'auto' }}
                  columns={column}
                  // bordered
                  dataSource={projectList}
                  rowKey={(record) => record._id}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <AddProjectModal fetchData={fetchData} />
      <EditProjectModal
        onSubmit={editProjects}
        setProjectToEdit={setProjectToEdit}
        projectToEdit={projectToEdit}
      />
      <DeleteProjectModal onSubmit={deleteProject} />
    </div>
  );
};

export default ProjectList;
