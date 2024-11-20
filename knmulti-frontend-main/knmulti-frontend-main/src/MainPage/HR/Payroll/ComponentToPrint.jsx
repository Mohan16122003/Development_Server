import React, { useEffect, useState } from 'react';
import { headerlogo } from '../../../Entryfile/imagepath';
import { allemployee } from '../../../lib/api';

export const ComponentToPrint = React.forwardRef(
  ({ number2words, selectedPayslip, employeeData }, ref) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return (
      <div className="row" ref={ref}>
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h4 className="payslip-title">
                Payslip for the month of :{' '}
                {monthNames[new Date(selectedPayslip?.fromDate).getMonth()]}
              </h4>
              <div className="row">
                <div className="col-sm-6 m-b-20">
                  <img src={headerlogo} className="inv-logo" alt="" />
                  <ul className="list-unstyled mb-0">
                    <li>KN Multiprojects</li>
                    <li>Banglore,</li>
                    <li>India</li>
                  </ul>
                </div>
                <div className="col-sm-6 m-b-20">
                  <div className="invoice-details">
                    <h3 className="text-uppercase">Payslip #49029</h3>
                    <ul className="list-unstyled">
                      <li>
                        Salary Month:{' '}
                        <span>
                          {
                            monthNames[
                              new Date(selectedPayslip?.fromDate).getMonth()
                            ]
                          }
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 m-b-20">
                  <ul className="list-unstyled">
                    <li>
                      <h5 className="mb-0">
                        <strong>{employeeData?.name}</strong>
                      </h5>
                    </li>
                    <li>
                      <span>{employeeData?.jobRole?.name}</span>
                    </li>
                    <li>Employee ID: {employeeData?._id}</li>
                    <li>
                      Joining Date:
                      {new Date(
                        employeeData?.joinDate
                      ).toLocaleDateString()}{' '}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div>
                    <h4 className="m-b-10">
                      <strong>Earnings</strong>
                    </h4>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <td>
                            <strong>Basic Salary</strong>{' '}
                            <span className="float-right">
                              Rs.
                              {selectedPayslip?.earnedSalary?.grossBasic}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>House Rent Allowance (H.R.A.)</strong>{' '}
                            <span className="float-right">
                              Rs.
                              {selectedPayslip?.earnedSalary?.grossHRA}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Travel Allowance (T.A) </strong>{' '}
                            <span className="float-right">
                              Rs.
                              {selectedPayslip?.earnedSalary?.gorssTA}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Dearness Allowance (D.A) </strong>{' '}
                            <span className="float-right">
                              Rs.
                              {selectedPayslip?.earnedSalary?.grossDA}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Medical Allowance (M.A) </strong>{' '}
                            <span className="float-right">
                              Rs.
                              {selectedPayslip?.earnedSalary?.gorssMA}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Total Earnings</strong>{' '}
                            <span className="float-right">
                              <strong>
                                Rs.
                                {selectedPayslip?.earnedSalary?.grossSalary}
                              </strong>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div>
                    <h4 className="m-b-10">
                      <strong>Deductions</strong>
                    </h4>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <td>
                            <strong>Tax Deducted at Source (T.D.S.)</strong>{' '}
                            <span className="float-right">
                              Rs.{selectedPayslip?.deduction?.TDS||0}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Provident Fund Number</strong>{' '}
                            <span className="float-right">
                              {employeeData?.personalInformation?.PFno||"-"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Provident Fund</strong>{' '}
                            <span className="float-right">
                              Rs.{selectedPayslip?.deduction?.PFamount}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>ESI Number</strong>{' '}
                            <span className="float-right">
                            {employeeData?.personalInformation?.ESIno||"-"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>ESI</strong>{' '}
                            <span className="float-right">
                              Rs.{selectedPayslip?.deduction?.ESIdiduct}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Loan</strong>{' '}
                            <span className="float-right">
                              Rs.
                              {employeeData?.personalInformation.loan||"-"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Total Deductions</strong>{' '}
                            <span className="float-right">
                              <strong>
                                Rs.
                                {selectedPayslip?.deduction?.total}
                              </strong>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-sm-12">
                  <p>
                    <strong>Net Salary: Rs.{selectedPayslip?.netSalary}</strong>{' '}
                    {/* ({number2words( (payrollData?.netSalary))}) */}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
