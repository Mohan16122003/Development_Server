/**
 * Crm Routes
 */
/* eslint-disable */
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Admindashboard from './admindashboard';
import Employeedashboard from './employeedashboard';

const DashboardRoute = () => {
  const { isAdmin } = useSelector((val) => val.authentication);

  return (
    <>
      {isAdmin && <Admindashboard isAdmin={isAdmin} />}
      {!isAdmin && <Employeedashboard isAdmin={isAdmin} />}
    </>
  );
};

export default DashboardRoute;
