/**
 * Crm Routes
 */
/* eslint-disable */
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import EmployeeSalary from './employeesalary';
import Payrollitem from './payrollitem';
import PayrollView from './PayrollView';
import Payslip from './payslip';
// import BulkPayroll from './BulkPayroll';
import CreateBulkPayroll from './CreateBulkPayroll';

const ReportsRoute = ({ match }) => (
  <Switch>
    <Redirect exact from={`${match.url}/`} to={`${match.url}/_salary`} />
    <Route path={`${match.url}/_salary`} component={EmployeeSalary} />
    <Route path={`${match.url}/payroll-items`} component={Payrollitem} />
    {/* <Route path={`${match.url}/payroll-view`} component={PayrollView} /> */}
    <Route path={`/app/administrator/payroll-view`} component={PayrollView} />
    <Route path={`${match.url}/salary-view`} component={Payslip} />
    <Route path={`/app/administrator/bulk-payroll`} component={CreateBulkPayroll} />
  </Switch>
);

export default ReportsRoute;
