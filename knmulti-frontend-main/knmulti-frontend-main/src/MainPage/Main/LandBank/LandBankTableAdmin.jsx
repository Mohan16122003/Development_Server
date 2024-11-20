import Avatar from '@mui/material/Avatar';
import { Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import httpService from '../../../lib/httpService';
import { makeItUnique } from '../../Employees/Projects/popups/AddProjectModal';
const dummy = ['-', '-', '-', '-', '-', '-', '-'];
const LandBankTableAdmin = ({ isAdmin }) => {
  const history = useHistory();
  const [ownerData, setOwnerData] = useState([]);
  const [landData, setLandData] = useState([]);
  const [allMouza, setAllMouza] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ownerName, setOwnerName] = useState('');
  const [status, setStatus] = useState('');
  const [selectedMouza, setSelectedMouza] = useState('');
  const [backupData, setBackupData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ownerName) {
      setOwnerData(
        ownerData.filter((el) =>
          el?.name?.toLowerCase().includes(ownerName?.toLowerCase())
        )
      );
    } else {
      setOwnerData(backupData);
    }
  }, [ownerName]);

  useEffect(() => {
    if (status) {
      let data = backupData.filter((el) => {
        if (status == 'OPEN') {
          return el.balance_due == 0 && el.total_land_cost == 0;
        }
        if (status == 'PAID') {
          return el.balance_due == 0 && el.total_land_cost > 0;
        }
        if (status == 'PARTIAL') {
          return el.balance_due > 0;
        }
        return el;
      });
      setOwnerData(data);
    } else {
      setOwnerData(backupData);
    }
  }, [status]);

  useEffect(async () => {
    if (selectedMouza) {
      try {
        setLoading(true);
        let res = await httpService.get(`/landbank?mouza=${selectedMouza}`);
        let newData = res?.data?.map((land) => {
          let landdta = {
            _id: land._id,
            owner_id: land.owner?._id,
            land_type: land?.land_type,
            plot_no: land.plot_no,
            landmark: land.landmark,
            files: land.files,
            project: land?.projects,
            mouza: land?.mouza,
          };
          return landdta;
        });
        let owner = res?.data?.map((land) => land?.owner);
        let unqObj = {};
        let arr = [];
        for (const obj of owner) {
          if (!unqObj[obj._id]) {
            unqObj[obj._id] = true;
            arr.push(obj);
          }
        }
        setOwnerData(arr);
        setLandData(newData);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error('somethiung went wrong !');
        setOwnerData(backupData);
      }
    } else {
      setOwnerData(backupData);
    }
  }, [selectedMouza]);

  useEffect(async () => {
    try {
      setLoading(true);
      let res = await httpService.get(`/landbank`);
      let newData = res?.data?.map((land) => {
        let landdta = {
          _id: land._id,
          owner_id: land.owner?._id,
          land_type: land?.land_type,
          plot_no: land.plot_no,
          landmark: land.landmark,
          files: land.files,
          project: land?.projects,
          mouza: land?.mouza,
        };
        return landdta;
      });
      let owner = res?.data?.map((land) => land?.owner);
      let unqObj = {};
      let arr = [];
      for (const obj of owner) {
        if (!unqObj[obj._id]) {
          unqObj[obj._id] = true;
          arr.push(obj);
        }
      }
      setBackupData(arr);
      setOwnerData(arr);
      setLandData(newData);
      setAllMouza(makeItUnique(newData));
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message);
      setLoading(false);
    }
  }, []);

  const handleRowClick = (val) => {
    let ownerLand = landData?.filter((el) => el?.owner_id == val);
    setExpandedRow(ownerLand);
  };

  function stringToColor(string) {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  const stringAvatar = (name) => {
    let modName = name.replace(/\s+/g, ' ');
    return {
      sx: {
        background: stringToColor(name),
        fontSize: '15px',
      },
      children: `${
        modName.trim()?.split(' ')[0][0]?.toUpperCase() ||
        modName.trim()[0].toUpperCase()
      }${modName.trim().split(' ')[1][0].toUpperCase()}`,
    };
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Landbank</title>
        <meta name="description" content="Dashboard" />
      </Helmet>
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row">
            {/* jin - changed col-sm-12 to col-sm-8  */}
            <div className="col-sm-8">
              <h3 className="page-title">Land Bank</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Land Bank</li>
              </ul>
            </div>
            <div className="col-auto float-right ml-auto">
              <Link to="/app/land-bank/add-land" className="btn add-btn">
                <i className="fa fa-plus" /> Add Land
              </Link>
            </div>
          </div>
        </div>

        {/* Land Bank Filter  */}

        <div className="row filter-row ">
          <div className="col-sm-6 col-md-3">
            <div className="form-group form-focus focused">
              <input
                type="text"
                style={{
                  padding: '8px',
                }}
                placeholder={'Search by Owner'}
                className="form-control"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
          </div>

          <div className="col-sm-3 col-md-3">
            <div className="form-group form-focus focused">
              <select
                className="custom-select form-control floating"
                name=""
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value={''} selected>
                  Choose Status
                </option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="OPEN">OPEN</option>
                <option value="PAID">PAID</option>
              </select>
              <label className="focus-label">Status</label>
            </div>
          </div>

          <div className="col-sm-3 col-md-3">
            <div className="form-group form-focus focused">
              <select
                className="custom-select form-control floating"
                name=""
                value={selectedMouza}
                onChange={(e) => setSelectedMouza(e.target.value)}
              >
                <option value={''} selected>
                  Choose Mouza
                </option>
                {allMouza.length &&
                  allMouza?.map((el) => (
                    <option value={el?.mouza}>{el?.mouza}</option>
                  ))}
              </select>
              <label className="focus-label">Mouza</label>
            </div>
          </div>

          <div className="col-sm-6 col-md-3">
            <button
              className="btn btn-danger"
              onClick={() => {
                setOwnerName('');
                setStatus('');
                setSelectedMouza('');
                setOwnerData(backupData);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="table-responsive">
            <Table striped hover className="table table-condensed">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Owner</th>
                  <th>Land Area </th>
                  <th>Total Cost</th>
                  <th>Discount</th>
                  <th>Net Cost</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              {loading ? (
                <tbody>
                  <tr>
                    {dummy.map((el, id) => (
                      <>
                        <td
                          key={id}
                          style={{ marginLeft: '10px', padding: '20px' }}
                        >
                          <Spin style={{ width: '1rem', height: '1rem' }} />
                        </td>
                      </>
                    ))}
                  </tr>
                </tbody>
              ) : !ownerData.length ? (
                <tbody>
                  <tr>
                    {dummy.map((el, id) => (
                      <td
                        key={id}
                        style={{ marginLeft: '10px', padding: '20px' }}
                      >
                        {el}
                      </td>
                    ))}
                  </tr>
                </tbody>
              ) : (
                ownerData
                  ?.slice((currentPage - 1) * 10, currentPage * 10)
                  .map((item, index) => (
                    <tbody key={index}>
                      <tr className="sub-container">
                        <td>{index + 1}</td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Avatar {...stringAvatar(`${item?.name}`)} />
                            <div style={{ marginLeft: '10px' }}>
                              <Link
                                to={{
                                  pathname: `/app/land-bank/profile/${item._id}`,
                                }}
                              >
                                <span style={{ color: '#1990ff' }}>
                                  {item?.name}
                                </span>
                              </Link>
                              {
                                expandedRow &&
                                expandedRow[0]?.owner_id === item._id ? (
                                  <i
                                    className="fa fa-chevron-circle-up m-l-5"
                                    style={{
                                      color: '#454545',
                                      height: '0.2rem',
                                      width: '0.2rem',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => setExpandedRow(null)}
                                  />
                                ) : (
                                  <i
                                    className="fa fa-chevron-circle-down m-l-5"
                                    style={{
                                      color: '#454545',
                                      height: '0.2rem',
                                      width: '0.2rem',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleRowClick(item._id)}
                                  />
                                )

                                // <i className="fas fa-chevron-circle-down"></i>
                              }
                            </div>
                          </div>
                          <i className="bi bi-plus m-l-5" />
                        </td>
                        <td>{item?.total_land_area || 0} Acres</td>
                        <td>₹ {item?.total_land_cost || 0}</td>
                        <td>₹ {item?.discount || 0}</td>
                        <td>₹ {item?.net_land_cost || 0}</td>
                        <td>
                          <Tag
                            style={{
                              marginLeft: '20px',
                              marginTop: '10px',
                              fontWeight: 600,
                            }}
                            color={
                              item.net_land_cost === 0
                                ? 'red'
                                : item.balance_due == 0
                                ? 'green'
                                : item.balance_due === item.net_land_cost
                                ? 'red'
                                : 'orange'
                            }
                            // {item.amount_paid == 0? "red":item.amount_paid>0&&item.amount_paid < item.total_land_cost?"orange":"green"}
                          >
                            {item.net_land_cost === 0
                              ? 'OPEN'
                              : item.balance_due == 0
                              ? 'PAID'
                              : item.balance_due === item.net_land_cost
                              ? 'OPEN'
                              : 'PARTIAL'}
                          </Tag>{' '}
                        </td>
                      </tr>
                      {expandedRow && expandedRow[0]?.owner_id === item._id && (
                        <tr style={{ position: 'relative' }}>
                          <td colSpan={4}>
                            <div className="expanded-content">
                              <Table
                                striped
                                bordered
                                hover
                                // style={{ marginLeft: '250px' }}
                              >
                                <thead>
                                  <tr>
                                    <th>S No.</th>
                                    <th>Land Type</th>
                                    <th>Mouza</th>
                                    <th>Landmark </th>
                                    <th>Plot No.</th>
                                    <th>Project</th>
                                    <th>Docs</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {expandedRow?.map((el, id) => (
                                    <tr key={id}>
                                      <td>{id + 1}</td>
                                      <td>{el?.land_type}</td>
                                      <td>{el?.mouza}</td>
                                      <td>{el?.landmark}</td>
                                      <td>{el?.plot_no}</td>
                                      <td>
                                        {el?.project ? (
                                          <Link
                                            to={`/app/projects/projects-view/${el.project?._id}`}
                                          >
                                            {el.project?.name}
                                          </Link>
                                        ) : (
                                          'Not Created'
                                        )}
                                      </td>
                                      <td
                                        style={{
                                          color: 'blue',
                                          cursor: 'pointer',
                                        }}
                                        onClick={() =>
                                          history.push(
                                            `/app/land-bank/profile/${item?._id}`
                                          )
                                        }
                                      >
                                        {' '}
                                        View{' '}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  ))
              )}
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandBankTableAdmin;
