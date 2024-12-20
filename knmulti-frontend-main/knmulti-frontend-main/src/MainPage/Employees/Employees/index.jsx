/**
 * Crm Routes
 */
/* eslint-disable */
import React, { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { createContext } from 'react';

import AllEmployeesList from './employeeslist';
import Holidays from './holidays';
import LeaveAdmin from './leave_admin';
import LeaveEmployee from './leaveemployee';
import Leavesetting from './leavesettings';
import AttendanceAdmin from './attendanceadmin';
import AttendanceEmployee from './attendanceemployee';
import Department from './department';
import Designation from './designation';
import Timesheet from './timesheet';
import Overtime from './overtime';
import ShiftScheduling from './shiftscheduling';
import ShiftList from './shiftlist';
import LeaveTypes from './leavetypes';
import AddEmployee from '../../Pages/Profile/AddEmployee';

const AttendanceTableContext = createContext({});

const EmployeesRoute = ({ match }) => {
  const [attendanceState, setAttendanceState] = useState(false);
  const [filteredAttendanceState, setFilteredAttendanceState] = useState({
    state: false,
    fId: '',
    emp_id: '',
  });

  const ProtectedRoute = ({
    component: Component,
    allowedRoles,
    blockedRoles,
    ...rest
  }) => {
    const userRole = localStorage.getItem('userRole');

    // Check if the user role is allowed or blocked
    if (allowedRoles.includes(userRole) && !blockedRoles.includes(userRole)) {
      return <Route {...rest} render={(props) => <Component {...props} />} />;
    } else {
      // Redirect to a different route or show an unauthorized message
      return <Redirect to="/unauthorized" />;
    }
  };

  return (
    <AttendanceTableContext.Provider
      value={{
        attendanceState,
        setAttendanceState,
        filteredAttendanceState,
        setFilteredAttendanceState,
      }}
    >
      <Switch>
        <Redirect
          exact
          from={`${match.url}/`}
          to={`${match.url}/allemployees`}
        />
        <Route
          exact
          path={`${match.url}/addemployee`}
          component={AddEmployee}
        />
        <Route
          path={`${match.url}/employees-list`}
          component={AllEmployeesList}
        />
        <Route path={`${match.url}/holidays`} component={Holidays} />
        <Route path={`${match.url}/leaves-admin`} component={LeaveAdmin} />
        <Route
          path={`${match.url}/leaves-employee`}
          component={LeaveEmployee}
        />
        <Route path={`${match.url}/leave-settings`} component={Leavesetting} />
        <Route
          path={`${match.url}/attendance-admin`}
          component={AttendanceAdmin}
        />
        <Route
          path={`${match.url}/attendance-employee`}
          component={AttendanceEmployee}
        />
        <Route path={`${match.url}/leave-types`} component={LeaveTypes} />
        <Route path={`${match.url}/departments`} component={Department} />
        <Route path={`${match.url}/designations`} component={Designation} />
        <Route path={`${match.url}/timesheet`} component={Timesheet} />
        <Route path={`${match.url}/overtime`} component={Overtime} />
        <Route
          path={`${match.url}/shift-scheduling`}
          component={ShiftScheduling}
        />
        <Route path={`${match.url}/shift-list`} component={ShiftList} />
      </Switch>
    </AttendanceTableContext.Provider>
  );
};

export default EmployeesRoute;
export { AttendanceTableContext };
