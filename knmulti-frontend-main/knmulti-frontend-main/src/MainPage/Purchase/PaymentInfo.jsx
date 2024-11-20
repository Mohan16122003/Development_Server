import { Delete, Download, Email, Upload } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import httpService from '../../lib/httpService';
import DeleteModel from './DeleteModel';
import FileUploadModel from './FileUploadModel';
import { useSelector } from 'react-redux';

const PaymentInfo = () => {
  const { id } = useParams();
  const history = useHistory();

  const [payInfo, setPayInfo] = useState('');
  const { isAdmin } = useSelector((val) => val.authentication);
  const fetchVendorPayInfo = () => {
    toast
      .promise(httpService.get(`/vendortrx/getvendorbillpayment?_id=${id}`), {
        error: 'Failed to fetch vendor bills',
        success: 'Bills fetch successfully',
        pending: 'fetching vendor bill...',
      })
      .then((res) => setPayInfo(res.data[0]));
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };

  const deleteBillPay = () => {
    toast
      .promise(httpService.delete(`/vendortrx/removevendorbillpayment/${id}`), {
        error: 'Failed to delete vendor bills payment',
        success: 'Bill payment deleted successfully',
        pending: 'deleting vendor bill payment...',
      })
      .then((res) => {
        history.goBack();
        history.goBack();
      });
    document.querySelectorAll('.close')?.forEach((e) => e.click());
  };
  useEffect(() => {
    fetchVendorPayInfo();
  }, []);

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Payment Info</title>
        <meta name="description" content="vendor bill" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col">
              <h3 className="page-title">Payment Info</h3>
            </div>
            <div className="col">
              <div className="rounded-circle bg-primary p-2 float-right">
                <a
                  href={payInfo?.pdf_url}
                  target="_blank"
                  className="text-light"
                  download
                >
                  <Download />
                </a>
              </div>
              <div className="rounded-circle bg-primary p-2 float-right mr-2">
                <Link
                  to={{
                    pathname: '/app/apps/email',
                    state: {
                      id: payInfo?._id,
                      subject: `Details for Vendor Bills Payment ${payInfo?.paymentNo}`,
                      pdf: payInfo?.pdf_url,
                      index: payInfo?.paymentNo,
                      type: 'vendor-payment',
                      emailId: `${payInfo?.vendorId?.email}`,
                      backTo: -2,
                    },
                  }}
                  className="text-light"
                >
                  <Email />
                </Link>
              </div>
              {/* <div className='rounded-circle bg-primary p-2 float-right mr-2'>
                <Link
                  to={{pathname : "/app/purchase/billpayment", state: {payInfo, edit: true} }}
                  className="text-light"
                >
                  <Edit />
                </Link>
              </div> */}
              {isAdmin && (
                <div className="rounded-circle bg-primary p-2 float-right mr-2">
                  <Link
                    to={'#'}
                    className="text-light"
                    data-toggle="modal"
                    data-target="#delete_client"
                  >
                    <Delete />
                  </Link>
                </div>
              )}
              <div className="rounded-circle bg-primary p-2 float-right mr-2">
                <Link
                  to={'#'}
                  className="text-light"
                  data-toggle="modal"
                  data-target="#upload_file"
                >
                  <Upload />
                </Link>
              </div>
              {/* <div className="btn btn-primary float-right mr-2">
                <Link
                  className='text-light'
                  to={{ pathname:`/app/purchase/billpayment`, state: {vendorId: `${payInfo?.vendorId?._id}`, billId: `${payInfo?._id}`} }}
                >Record Payment</Link>
              </div> */}
            </div>
          </div>
        </div>
        <div
          className="h3 text-center"
          style={{ color: 'gray', marginBottom: '50px' }}
        >
          Payment Made
        </div>
        <div className="d-flex justify-content-between">
          <div className="flex-grow-1">
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td>Payment#</td>
                  <td>{payInfo?.paymentNo}</td>
                </tr>
                <tr>
                  <td>Payment Date</td>
                  <td>{payInfo?.paymentDate?.split('T')[0]}</td>
                </tr>
                <tr>
                  <td>Reference Number</td>
                  <td>{payInfo?.referenceId}</td>
                </tr>
                <tr>
                  <td>Paid To</td>
                  <td>
                    <Link
                      to={`${
                        payInfo?.vendorId?.vendorType == 'landowner'
                          ? `/app/land-bank/profile/${payInfo?.vendorId?._id}`
                          : `/app/profile/vendor-profile/${payInfo?.vendorId?._id}`
                      }`}
                    >
                      {payInfo?.vendorId?.name}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td>Payment Mode</td>
                  <td>{payInfo?.paymentMode}</td>
                </tr>
                <tr>
                  <td>Paid Through</td>
                  <td>{payInfo?.paymentThrough}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex-grow-1"></div>
          <div className="flex-grow-2">
            <div
              className="p-5 text-center bg-success"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(38,166,109,255), #6dbd70)`,
                borderRadius: '5px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.3rem',
              }}
            >
              Amount Paid <br />₹ {payInfo?.amountPaid}
            </div>
          </div>
        </div>
        <hr />
        <div>
          <p className="text-muted">Paid To</p>
          <div className="ml-3">
            <Link
              to={`${
                payInfo?.vendorId?.vendorType == 'landowner'
                  ? `/app/land-bank/profile/${payInfo?.vendorId?._id}`
                  : `/app/profile/vendor-profile/${payInfo?.vendorId?._id}`
              }`}
            >
              <p className="h4">{payInfo?.vendorId?.name}</p>
            </Link>
            <div>{payInfo?.vendorId?.billAddress}</div>
          </div>
        </div>
        <hr />
        <div className="h4">Payment for</div>
        <div>
          <table class="table table-striped">
            <thead>
              <tr className="bg-primary">
                <th style={{ color: 'white' }}>Bill Number</th>
                <th style={{ color: 'white' }}>Bill Date</th>
                <th style={{ color: 'white' }}>Bill Amount</th>
                <th style={{ color: 'white' }}>Payment Amount</th>
              </tr>
            </thead>
            <tbody>
              {payInfo?.vendorBill?.length > 0 &&
                payInfo?.vendorBill.map((trx) => (
                  <tr>
                    <td>
                      <Link to={`/app/purchase/billinfo/${trx?._id}`}>
                        {trx?.billNo}
                      </Link>
                    </td>
                    <td>{trx?.billDate?.split('T')[0]}</td>
                    <td>₹{trx?.total}</td>
                    <td>₹{trx?.billPaymentAmount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <hr />
        {payInfo?.notes && (
          <div>
            <div className="h4">More Information</div>
            <p className="text-muted">Notes: {payInfo?.notes}</p>
          </div>
        )}

        <DeleteModel title="Bill Payment" fn={deleteBillPay} />
        <FileUploadModel
          modLink={`/vendortrx/updatevendorbillpayment/${payInfo?._id}`}
          filesInfo={payInfo?.fileInfos}
        />
      </div>
    </div>
  );
};

export default PaymentInfo;
