/**
 * Crm Routes
 */
/* eslint-disable */
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ProjectList from '../Employees/Projects/projectlist';
import AddLeads from './AddLeads';
import AllStatus from './AllStatus';

const LeadsRoute = ({ match }) => {
  return (
    <Switch>
      <Route path={`/app/leads/lead-status`} component={AllStatus} />
      <Route path={`${match.url}/add-leads`} component={AddLeads} />
      <Route path={`${match.url}/projects`} component={ProjectList} />
    </Switch>
  );
};

export default LeadsRoute;
