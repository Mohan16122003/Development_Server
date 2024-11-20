import React, { useEffect, useState, uspayrollDataeState } from 'react';
import { Helmet } from 'react-helmet';
import { getEmployee } from '../../../lib/api';
import Payslip from './payslip';
import { useHistory, useLocation } from 'react-router-dom';
import httpService from '../../../lib/httpService';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import {
  DAILY_WORKING_HOURS,
  TOTAL_WORKING_DAYS,
} from '../../../misc/constants';

const PayrollView = () => {
  const { state } = useLocation();
  let { payrollData, setSelectRender } = state;
  const history = useHistory();

  const [employeeList, setEmployeeList] = useState([]);

  //employee list
  useEffect(async () => {
    const res = await getEmployee(payrollData?.employeeId?._id);
    setEmployeeList(res);
  }, []);
  //

  const handleSubmit = (e) => {
    e.preventDefault();
    // return;
    const empSalary = {
      connfirm: 1,
    };
    httpService.put(`/payroll/${payrollData._id}`, empSalary).then((res) => {
      history.goBack();
    });

    // emailjs
    //   .sendForm(
    //     'service_xcxiogi',
    //     'template_ws756yb',
    //     e.target,
    //     'hf0po8venBjKL4wIi'
    //   )
    //   .then((res) => {
    //     toast.success('Email Sent!');
    //     console.log(res, 'res frm emaijs');
    //   })
    //   .catch((err) => {
    //     toast.error('Email failed!');
    //     console.log(err, 'err frm emaijs');
    //   });
  };

  const [payslipRender, setPayslipRender] = useState('default');
  const [connfirm, setconnfirm] = useState(payrollData?.connfirm);
  const [fromDate, setfromDate] = useState(
    new Date(payrollData?.fromDate).toLocaleDateString()
  );
  const [toDate, settoDate] = useState(
    new Date(payrollData?.toDate).toLocaleDateString()
  );
  const [netSalary, setnetSalary] = useState(payrollData?.netSalary);
  const [description, setdescription] = useState(payrollData?.description);
  const [salaryRate, setsalaryRate] = useState({
    basicSalary: payrollData?.salaryRate?.basicSalary || 0,
    DA: payrollData?.salaryRate?.DA || 0,
    HRA: payrollData?.salaryRate?.HRA || 0,
    MA: payrollData?.salaryRate?.MA || 0,
    TA: payrollData?.salaryRate?.TA || 0,
    totalSalary: payrollData?.salaryRate?.totalSalary || 0,
  });

  const [attendance, setattendance] = useState({
    present: payrollData?.attendance?.presentDays || 0,
    paidLeave: payrollData?.attendance?.paidLeaves || 0,
    weeklyOff: payrollData?.attendance?.weeklyOff || 0,
    festival: payrollData?.attendance?.festiveLeaves || 0,
    totalDays: payrollData?.attendance?.totalDays || 0,
    totalHrs: payrollData?.attendance?.workingHours || 0,
  });

  const [earnedSalary, setearnedSalary] = useState({
    eBasicSalary: payrollData?.earnedSalary?.grossBasic || 0,
    eDA: payrollData?.earnedSalary?.grossDA || 0,
    eHRA: payrollData?.earnedSalary?.grossHRA || 0,
    MA: payrollData?.earnedSalary?.gorssMA || 0,
    TA: payrollData?.earnedSalary?.gorssTA || 0,
    totalEarned: payrollData?.earnedSalary?.grossSalary || 0,
  });

  const [deduction, setdeduction] = useState({
    esiAmount: payrollData?.deduction?.ESIdiduct || 0,
    PF: payrollData?.deduction?.PFamount || 0,
    advanceAmt: payrollData?.deduction?.advanceAmount || 0,
    TDS: payrollData?.deduction?.TDS || 0,
    LWF: 0,
    professionalTax: 0,
    totalDeduction: payrollData?.deduction?.total || 0,
  });

  return (
    <>
      {payslipRender === 'default' ? (
        <div className="page-wrapper">
          <Helmet>
            <title>View Payroll</title>
            <meta name="description" content="Add Payroll" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3
                    className="page-title"
                    onClick={(e) => {
                      setSelectRender('default');
                    }}
                  >
                    Payroll Item
                  </h3>
                  <ul className="breadcrumb">
                    <Link
                      className="breadcrumb-item"
                      to={'/app/administrator/payroll'}
                    >
                      <li>Payroll View</li>
                    </Link>
                    <li
                      className="breadcrumb-item text-primary"
                      role="button"
                      onClick={(e) => {
                        setPayslipRender('payslip');
                      }}
                    >
                      Pay Slip
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-12">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-sm-6 col-md-3">
                      <div className="form-group">
                        <label>
                          Employee Name <span className="text-danger">*</span>
                        </label>
                        <input
                          readOnly
                          className="form-control"
                          name="name"
                          value={payrollData?.employeeId?.name}
                          defaultValue={payrollData?.employeeId?.name}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Email</label>
                        <div>
                          <input
                            readOnly
                            className="form-control"
                            type="email"
                            name="email"
                            value={employeeList?.email}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>
                          From <span className="text-danger">*</span>
                        </label>
                        <div>
                          <input
                            disabled
                            className="form-control"
                            type="text"
                            placeholder="mm-dd-yyyy"
                            name="fromDate"
                            value={fromDate}
                            onChange={(e) => setfromDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>
                          To <span className="text-danger">*</span>
                        </label>
                        <div>
                          <input
                            disabled
                            className="form-control"
                            type="text"
                            placeholder="mm-dd-yyyy"
                            name="toDate"
                            value={toDate}
                            onChange={(e) => settoDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          Basic Salary <span className="text-danger">*</span>
                        </label>
                        <input
                          readOnly
                          className="form-control"
                          type="number"
                          name="basicSalary"
                          value={Math.round(salaryRate?.basicSalary)}
                          onChange={(e) =>
                            setsalaryRate({
                              ...salaryRate,
                              basicSalary: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          DA <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          name="da"
                          value={Math.round(salaryRate?.DA)}
                          readOnly
                          type="number"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          TA <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          readOnly
                          name="hra"
                          value={Math.round(salaryRate?.TA)}
                          type="number"
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          MA <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          readOnly
                          value={Math.round(salaryRate?.MA)}
                          type="number"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          HRA <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          readOnly
                          name="hra"
                          value={Math.round(salaryRate?.HRA)}
                          type="number"
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          Total Salary <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          readOnly
                          value={Math.round(salaryRate?.totalSalary)}
                          type="number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tabs  */}
                  <div
                    style={{ paddingLeft: '0px' }}
                    className="col-md-12 p-r-0"
                  >
                    <div className="card tab-box">
                      <div className="row user-tabs">
                        <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                          <ul className="nav nav-tabs nav-tabs-bottom">
                            <li className="nav-item">
                              <a
                                href="#emp_attendance"
                                data-toggle="tab"
                                className="nav-link active"
                              >
                                Attendance
                              </a>
                            </li>
                            <li className="nav-item">
                              <a
                                href="#emp_grossearn"
                                data-toggle="tab"
                                className="nav-link"
                              >
                                Gross Earned
                              </a>
                            </li>
                            <li className="nav-item">
                              <a
                                href="#emp_deduction"
                                data-toggle="tab"
                                className="nav-link"
                              >
                                Deduction
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      minHeight: '20vh',
                      maxHeight: '40vh',
                      overflowY: 'auto',
                    }}
                    className="card p-4 tab-content"
                  >
                    {/* Atendance  */}
                    <div
                      className="tab-pane fade show active"
                      id="emp_attendance"
                    >
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>
                              Present Days{' '}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              readOnly
                              type="number"
                              className="form-control"
                              name="present"
                              value={attendance?.present}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Paid Leave</label>
                            <div>
                              <input
                                readOnly
                                className="form-control"
                                type="number"
                                name="paidLeave"
                                value={attendance?.paidLeave}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Weekly OFF</label>
                            <div>
                              <input
                                readOnly
                                className="form-control"
                                type="number"
                                name="weeklyOff"
                                value={attendance?.weeklyOff}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Festival</label>
                            <input
                              readOnly
                              type="number"
                              className="form-control"
                              name="festival"
                              value={attendance?.festival}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Total Hours</label>
                            <div>
                              <input
                                className="form-control"
                                type="text"
                                name="paidDays"
                                value={`${Math.round(attendance?.totalHrs)} / ${
                                  TOTAL_WORKING_DAYS * DAILY_WORKING_HOURS
                                } `}
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Total Days</label>
                            <div>
                              <input
                                className="form-control"
                                type="number"
                                name="paidDays"
                                value={attendance?.totalDays}
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gross Earned  */}
                    <div className="tab-pane fade show" id="emp_grossearn">
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              Gross Basic Salary{' '}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="number"
                              name="eBasicSalary"
                              value={Math.round(earnedSalary?.eBasicSalary)}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              Gross DA <span className="text-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="number"
                              name="eDA"
                              value={earnedSalary?.eDA}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              Gross HRA <span className="text-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="number"
                              name="eHRA"
                              value={earnedSalary?.eHRA}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>Gross MA</label>
                            <input
                              readOnly
                              className="form-control"
                              type="number"
                              name="incentive"
                              value={earnedSalary?.MA}
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              Gross TA
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="number"
                              value={Math.round(earnedSalary?.TA)}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              Gross Salary{' '}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="number"
                              value={Math.round(earnedSalary?.totalEarned)}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deduction  */}
                    <div className="tab-pane fade show" id="emp_deduction">
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              ESI Amount <span className="text-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              value={Math.round(deduction?.esiAmount)}
                              disabled
                              type="number"
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              PF Amount <span className="text-danger">*</span>
                            </label>
                            <input
                              readOnly
                              className="form-control"
                              type="number"
                              name="pf"
                              value={Math.round(deduction?.PF)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>Advance</label>
                            <input
                              readOnly
                              className="form-control"
                              type="number"
                              name="advanceAmt"
                              value={deduction?.advanceAmt}
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>TDS</label>
                            <input
                              readOnly
                              className="form-control"
                              type="number"
                              name="tds"
                              value={deduction?.TDS}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              Total Deduction{' '}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="number"
                              value={Math.round(deduction?.totalDeduction)}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row my-1">
                    <div className="col-md-6 text-right"></div>
                    <div className="col-md-3 text-right p-2">
                      Gross Salary Earned
                    </div>
                    <div className="col-md-3 text-right">
                      <input
                        className="form-control"
                        type="number"
                        name="totalEarned"
                        value={Math.round(earnedSalary?.totalEarned)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="row my-1">
                    <div className="col-md-6 text-right"></div>
                    <div className="col-md-3 text-right p-2">
                      Total Deduction
                    </div>
                    <div className="col-md-3 text-right">
                      <input
                        className="form-control"
                        type="number"
                        name="totalDeduction"
                        value={Math.round(deduction?.totalDeduction)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="row my-1">
                    <div className="col-md-6 text-right"></div>
                    <div className="col-md-3 text-right p-2">Net Salary</div>
                    <div className="col-md-3 text-right">
                      <input
                        className="form-control"
                        type="number"
                        name="netSalary"
                        value={Math.round(netSalary)}
                        readOnly
                      />
                    </div>
                  </div>
                  {/* extra info not to display */}
                  <input
                    readOnly
                    className="d-none"
                    type="text"
                    name="department"
                    value={employeeList?.department}
                  />
                  <input
                    readOnly
                    className="d-none"
                    type="text"
                    name="jobRole"
                    value={employeeList?.jobRole?.name}
                  />
                  <input
                    readOnly
                    className="d-none"
                    type="text"
                    name="Dob"
                    value={new Date(employeeList?.dob).toDateString()}
                  />
                  <input
                    readOnly
                    className="d-none"
                    type="text"
                    name="wrkLocation"
                    value={employeeList?.workLocation?.name}
                  />
                  <input
                    readOnly
                    className="d-none"
                    type="text"
                    name="mobileNo"
                    value={employeeList?.mobileNo}
                  />
                  <input
                    readOnly
                    className="d-none"
                    type="text"
                    name="bankAcc"
                    value={employeeList?.bankDetails?.accountNumber}
                  />
                  <input
                    readOnly
                    className="d-none"
                    type="text"
                    name="bankIfsc"
                    value={employeeList?.bankDetails?.IFSC}
                  />
                  {/*  */}
                  <div className="row my-2">
                    <div className="col-md-12">
                      <textarea
                        readOnly
                        className="form-control"
                        placeholder="description..."
                        name="description"
                        cols="160"
                        rows="5"
                        value={description}
                      ></textarea>
                    </div>
                  </div>
                  <div className="submit-section">
                    {/* <button className="btn btn-primary submit-btn">
                      Confirm
                    </button> */}
                    {/* {connfirm} */}
                    {connfirm === 0 ? (
                      <button className="btn btn-primary submit-btn">
                        Confirm
                      </button>
                    ) : connfirm === 1 ? (
                      <button className="btn btn-primary submit-btn">
                        Send Email
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-primary submit-btn">
                          Confirm
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : payslipRender === 'payslip' ? (
        <Payslip
          payrollData={payrollData}
          setPayslipRender={setPayslipRender}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default PayrollView;
