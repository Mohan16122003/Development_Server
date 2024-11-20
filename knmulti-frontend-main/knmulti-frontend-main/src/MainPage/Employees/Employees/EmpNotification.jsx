import { Delete } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { deleteNotify, getNotify, getUserNotify } from '../../../features/notify/notifySlice';

const EmpNotification = () => {
  const dispatch = useDispatch();

  const [notifyItems, setnotifyItems] = useState([]);

  const notifyData = useSelector(({ notification }) => notification?.notify);
  const user = useSelector((state) => state?.authentication?.value?.user);

  useEffect(() => {
    if (user && user?.jobRole?.authorities.includes('ADMIN')) {
      // alert('isAdmin')
      dispatch(getNotify());
    } else if (user)
      user._id && dispatch(getUserNotify(user._id));
  }, [user]);

  useEffect(() => {
    if (notifyData) {
      setnotifyItems([...notifyData]);
    }
  }, [notifyData]);

  const deleteNotification = async (notifyId) => {
    await dispatch(deleteNotify(notifyId));
  };

  return (
    <div className='page-wrapper'>
      <Helmet>
        <title>Notification Info</title>
        <meta name='description' content='Notification Info' />
      </Helmet>
      {/* Page Content */}
      <div className='content container-fluid'>
        {/* Page Header */}
        <div className='page-header'>
          <div className='row'>
            <div className='col'>
              <h3 className='page-title'>Notification Details</h3>
            </div>
            <div className='col'></div>
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <ul className='list-group col-12'>
              {notifyItems &&
                notifyItems?.map((n, index) => (
                  <li key={index} className='list-group-item col-12'>
                    <div className='card col-12'>
                      <h5 className='card-header d-flex justify-content-between'>
                        {n?.notifyHead}
                        <Delete
                          style={{ cursor: 'pointer', color: 'red' }}
                          onClick={(e) => deleteNotification(n?._id)}
                        />
                      </h5>
                      <div className='card-body'>
                        <h5 className='card-title'>{n?.notifyBody}</h5>
                        <small className='text-muted'>
                          {n?.notifyDate?.split('T')[0]}
                        </small>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpNotification;
