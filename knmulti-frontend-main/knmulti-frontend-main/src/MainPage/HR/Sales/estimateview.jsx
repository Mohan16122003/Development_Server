import { Delete, Download, Edit, Email } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import httpService from '../../../lib/httpService';
import { useSelector } from 'react-redux';

const EstimatesView = () => {
  const { id } = useParams();
  const history = useHistory();

  const [estimateData, setEstimateData] = useState();
  const [invoiceExists, setInvoiceExists] = useState(false);
  const [viewPDF, setViewPDF] = useState(false);

  const { isAdmin } = useSelector((val) => val.authentication);

  const fetchEstimate = (id) => {
    toast
      .promise(httpService.get(`/sale-estimate/${id}`), {
        error: 'Failed to fetch estimate',
        pending: 'fetching estimate...',
      })
      .then((res) => {
        setEstimateData(res.data);
        if (res?.data?.isInvoiced && res?.data?.invoiceId) {
          httpService
            .get(`/sale-invoice/${res?.data?.invoiceId}`)
            .then((res) => {
              if (res?.data) {
                setInvoiceExists(true);
              }
            });
        }
      });
  };

  useEffect(() => {
    fetchEstimate(id);
  }, [id]);

  const pdfView = () => {
    return (
      <>
        <div
          style={{ height: '100vh' }}
          className="d-flex justify-content-center"
        >
          {!estimateData.hasOwnProperty('pdf_url') && <p>PDF Not Available</p>}
          <object
            data={estimateData?.pdf_url}
            type="application/pdf"
            width={'80%'}
            height="100%"
          />
        </div>
      </>
    );
  };

  const handleDelete = () => {
    toast
      .promise(httpService.delete(`/sale-estimate/${id}`), {
        error: 'Failed to delete estimate',
        success: 'Estimate Deleted Successfully',
        pending: 'deleting estimate...',
      })
      .then((res) => {
        document.querySelectorAll('.cancel-btn')?.forEach((e) => e.click());
        history.goBack();
        history.goBack();
      });
  };

  const EstimateView = () => {
    return (
      <>
        <div className="d-flex">
          <div className="p-2 mr-2 flex-fill">
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td>Date</td>
                  <td>{estimateData?.estimateDate?.split('T')[0]}</td>
                </tr>
                <tr>
                  <td>Expiry</td>
                  <td>{estimateData?.expiryDate?.split('T')[0]}</td>
                </tr>
                <tr>
                  <td>REFERENCE#</td>
                  <td>{estimateData?.reference}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-2 ml-2 flex-fill">
            <div>
              <p className="h5">Customer Address</p>
              <div className="ml-3">
                <Link
                  to={`/app/profile/customer-profile/${estimateData?.customer?._id}`}
                >
                  <div>{estimateData?.customer?.displayName}</div>
                </Link>
                <div>{estimateData?.customer?.billingAddress?.attention}</div>
                <div>
                  {estimateData?.customer?.billingAddress?.addressLine1}
                </div>
                <div>
                  {estimateData?.customer?.billingAddress?.addressLine2}
                </div>
                <div>
                  {estimateData?.customer?.billingAddress?.city} -{' '}
                  {estimateData?.customer?.billingAddress?.state}
                </div>
                <div>{estimateData?.customer?.billingAddress?.zipcode}</div>
              </div>
            </div>
            <hr />
            {/* <div>
              <p className="h5">Project</p>
                <div className='ml-3'>
                  <Link to={`/app/profile/customer-profile/${estimateData?.customer?._id}`}>
                    <div>{estimateData?.customer?.displayName}</div>
                  </Link>
                </div>
            </div> */}
          </div>
        </div>

        <div>
          <table className="table table-striped">
            <thead>
              <tr className="bg-primary">
                <th>Item and Description</th>
                <th>Qty</th>
                {/* <th>Unit</th> */}
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {estimateData?.items?.length > 0 &&
                estimateData?.items.map((trx) => (
                  <tr>
                    <td>
                      {trx?.item} - {trx?.description}
                    </td>
                    <td>{trx?.quantity}</td>
                    <td>{trx?.unitCost}</td>
                    <td>₹{trx?.amount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <hr />

        <div className="d-flex justify-content-between">
          <div className="flex-grow-1"></div>
          <div className="flex-grow-1"></div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between">
              <p className="h4">Sub Total</p>
              <p className="h4">₹{estimateData?.amount}</p>
            </div>
            <div className="d-flex justify-content-between">
              <p className="h4">Tax Amount</p>
              <p className="h4">₹{estimateData?.taxAmount}</p>
            </div>
            <div className="d-flex justify-content-between">
              <p className="h4 text-muted">Discount</p>
              <p className="h4 text-muted">(-)₹{estimateData?.discount}</p>
            </div>
            {/* <div className="d-flex justify-content-between">
              <p className="h4 text-muted">TDS</p>
              <p className="h4 text-muted">₹{estimateData?.taxAmount}</p>
            </div>  */}
            {/* {
              estimateData?.adjustment?.adjustmentValue !== 0 &&
              <div className="d-flex justify-content-between">
                <p className="h4 text-muted">{estimateData?.adjustment?.adjustmentName}</p>
                <p className="h4 text-muted">₹{estimateData?.adjustment?.adjustmentValue}</p>
              </div>
            } */}
            <hr />
            <div className="d-flex justify-content-between">
              <p className="h4">Total</p>
              <p className="h4">₹{estimateData?.grandTotal}</p>
            </div>
          </div>
        </div>

        <hr />
        {(estimateData?.customerNotes || estimateData?.termsAndConditions) && (
          <div>
            <div className="h4">More Informations</div>
            {estimateData?.customerNotes && (
              <div>
                <p className="h5 text-muted">Notes</p>
                <p className="text-muted ml-3">{estimateData?.customerNotes}</p>
              </div>
            )}
            {estimateData?.termsAndConditions && (
              <div>
                <p className="h5 text-muted">Terms and Conditions</p>
                <p className="text-muted ml-3">
                  {estimateData?.termsAndConditions}
                </p>
              </div>
            )}
          </div>
        )}

        <hr />
      </>
    );
  };

  const DeleteEstimatePopUp = () => {
    return (
      <div
        className="modal custom-modal fade"
        id="delete_estimate"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Estimate</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                      href=""
                      className="btn btn-primary continue-btn"
                    >
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href=""
                      data-dismiss="modal"
                      className="btn btn-primary cancel-btn"
                    >
                      Cancel
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const GoToInvPopUp = () => {
    return (
      <div
        className="modal custom-modal fade"
        id="delete_estimate"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Estimate</h3>
                <p>Please Delete the Related INVOICE...</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Link
                      className="btn btn-primary continue-btn"
                      to={{
                        pathname: `/app/sales/invoice-view/${estimateData?.invoiceId}`,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .querySelectorAll('.cancel-btn')
                          ?.forEach((e) => e.click());
                        history.push(
                          `/app/sales/invoice-view/${estimateData?.invoiceId}`
                        );
                      }}
                    >
                      Go to Invoice
                    </Link>
                  </div>
                  <div className="col-6">
                    <a
                      href=""
                      data-dismiss="modal"
                      className="btn btn-primary cancel-btn"
                    >
                      Cancel
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>ESTIMATE</title>
        <meta name="description" content="vendor bill" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col d-flex">
              <h3 className="page-title">
                Estimate :- {estimateData?.estimate}
              </h3>
              <span
                className={
                  estimateData?.isInvoiced
                    ? 'badge bg-success p-2 h5 ml-2'
                    : 'badge bg-warning p-2 h5 ml-2'
                }
              >
                {estimateData?.status}
              </span>
            </div>
            <div className="col">
              <a
                href={estimateData?.pdf_url}
                target="_blank"
                className="rounded-circle bg-primary p-2 float-right text-light"
                download
              >
                <Download />
              </a>
              {isAdmin && (
                <Link
                  to={'#'}
                  className="rounded-circle bg-primary p-2 float-right mr-2 text-light"
                  data-toggle="modal"
                  data-target="#delete_estimate"
                >
                  <Delete />
                </Link>
              )}
              <>
                <Link
                  to={{
                    pathname: '/app/apps/email',
                    state: {
                      id: estimateData?._id,
                      subject: `Estimate for order ${estimateData?.estimate}`,
                      pdf: estimateData?.pdf_url,
                      index: estimateData?.estimate,
                      type: 'estimate',
                      emailId: estimateData?.customer?.email,
                      backTo: -2,
                    },
                  }}
                  className="rounded-circle bg-primary p-2 float-right mr-2 text-light"
                >
                  <Email />
                </Link>
                {!estimateData?.isInvoiced && (
                  <>
                    <Link
                      to={{
                        pathname: '/app/sales/createestimates',
                        state: { ...estimateData, edit: true },
                      }}
                      className="rounded-circle bg-primary p-2 float-right mr-2 text-light"
                    >
                      <Edit />
                    </Link>
                    <Link
                      className="btn btn-primary float-right mr-2 text-light"
                      to={{
                        pathname: `/app/sales/createInvoice`,
                        state: {
                          ...estimateData,
                          taxType: 'tcs',
                          tcsTax: estimateData?.tax?._id || null,
                          edit: false,
                          estConvert: true,
                        },
                      }}
                    >
                      Convert to Invoice
                    </Link>
                  </>
                )}
                {invoiceExists && (
                  <Link
                    className="btn btn-primary float-right mr-2 text-light"
                    to={{
                      pathname: `/app/sales/invoice-view/${estimateData?.invoiceId}`,
                    }}
                  >
                    View Invoice
                  </Link>
                )}
              </>
            </div>
          </div>
        </div>

        <div>
          <div className="custom-control custom-switch float-right">
            <input
              type="checkbox"
              className="custom-control-input"
              id="customSwitch1"
              onChange={() => setViewPDF(!viewPDF)}
            />
            <label className="custom-control-label" htmlFor="customSwitch1">
              Show PDF View
            </label>
          </div>
        </div>

        {viewPDF ? pdfView() : EstimateView()}

        {/* Delete Estimate Modal */}
        {invoiceExists ? GoToInvPopUp() : DeleteEstimatePopUp()}
      </div>
    </div>
  );
};

export default EstimatesView;
