import React from 'react';
import LandBankTableAdmin from './LandBankTableAdmin';
import { LandBankTableEmployee } from './LandBankTableEmployee';
import { useSelector } from 'react-redux';
import AddLandBank from './AddLandBank'
import { Route, Switch } from 'react-router-dom/cjs/react-router-dom.min';
import LandOwnerProfile from './Profile/LandOwnerProfile';
const index = ({match}) => {
  const authentication = useSelector((state) => state.authentication.value);
  const isAdmin = !authentication?.user?.jobRole?.authorities.includes('EMPLOYEE');
  return (
    <>
    <Switch>
    {isAdmin &&<Route exact path={`${match.url}`} component={LandBankTableAdmin} />}
      {!isAdmin && <Route exact path={'/'} ><LandBankTableEmployee /></Route>}
      {/* <Route path={`${match.url}/add-leads`} component={AddLeads} /> */}
     {isAdmin &&<Route exact path={`${match.url}/add-land`} component={AddLandBank} />}
     {isAdmin &&<Route exact path={`${match.url}/profile/:id`} component={LandOwnerProfile} />}
    </Switch>
    </>
  );
};

export default index;
