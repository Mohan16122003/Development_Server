import { Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { itemRender, onShowSizeChange } from '../../paginationfunction';
import { toast } from 'react-toastify';
import httpService from '../../../lib/httpService';

const ApplyToPayCredit = () => {
  const history = useHistory();
  const [amount, setAmount] = useState('');
  let { customerPayCreditInfo, invID, invNo, invBalDue, invData } =
    useLocation()?.state;

  const [customerPayCreditData, setCustomerPayCreditData] = useState([]);
  const [amountToPayCredit, setAmountToPayCredit] = useState(0);
  const [invoiceBalance, setInvoiceBalance] = useState(0);

  const [allCredit, setAllCredit] = useState([]);
  const [checkedPayments, setCheckedPayments] = useState([]);

  const updateAllCredit = (rId, bal, cred, payNo, pAmt, paymentAmount) => {
    // console.log('updateAllCredit: ', {rId});
    if (allCredit.length !== 0) {
      let updatedCreditPay = allCredit.map((c) => {
        if (c.id === rId) {
          c.paymentAmount = paymentAmount;
          c.excessAmount = bal - paymentAmount;
          c.amountReceived = cred;
          c.paymentNumber = payNo;
          c.pAmt = pAmt;
          return c;
        } else {
          return c;
        }
      });
      // console.log({ updatedCreditPay });
      setAllCredit([...updatedCreditPay]);
    } else {
      let creditBal = bal - paymentAmount;
      // console.log({ creditBal: creditBal, bal });
      setAllCredit([
        ...allCredit,
        {
          id: rId,
          paymentAmount: paymentAmount,
          excessAmount: creditBal,
          amountReceived: cred,
          paymentNumber: payNo,
          pAmt,
        },
      ]);
    }
  };

  const handleCreditPay = (e, rId, bal, cred, payNo, pAmt) => {
    const customerPayCredit = customerPayCreditData.filter(
      (p) => p._id === rId
    );
    console.log(customerPayCredit, 'customerPayCredit');
    const targetVal = e.target.value;
    let paymentAmount = Number(targetVal) ? Number(targetVal) : 0;
    setCustomerPayCreditData((prevState) => {
      return prevState.map((customerPayCreditDataItem) => {
        if (customerPayCreditDataItem._id === rId) {
          customerPayCreditDataItem.amc = paymentAmount;
          customerPayCreditDataItem.excessAmount =
            customerPayCreditDataItem.amountReceived - paymentAmount;
        }
        return { ...customerPayCreditDataItem };
      });
    });
    updateAllCredit(
      customerPayCredit,
      rId,
      bal,
      cred,
      payNo,
      pAmt,
      paymentAmount
    );
  };

  const handleClick = (e, record) => {
    if (record.amc !== 0) {
      setAllCredit((prevState) => {
        return prevState.filter((credit) => credit?.id !== record._id);
      });
      setCustomerPayCreditData((prevState) => {
        return prevState.map((payCredit) => {
          if (payCredit._id === record._id) {
            setAmountToPayCredit(amountToPayCredit - record.amc);
            setInvoiceBalance(invoiceBalance + record.amc);
            payCredit.excessAmount += record.amc;
            payCredit.paymentAmount -= record.amc;
            payCredit.amc = 0;
          }
          return { ...payCredit };
        });
      });
      return;
    }
    let currentAmount = amountToPayCredit;
    if (invoiceBalance <= invBalDue) {
      if (record.excessAmount >= invoiceBalance) {
        // alert('record.excessAmount >= invoiceBalance: '+ (invBalDue - invoiceBalance));
        const amc =
          record.excessAmount === invoiceBalance
            ? record.excessAmount
            : invoiceBalance;
        setInvoiceBalance(invoiceBalance - amc);
        currentAmount += amc;
        setCustomerPayCreditData((prevState) => {
          return prevState.map((item) => {
            if (item._id === record._id) {
              // alert('found: ' + amc + ' ' + invBalDue);
              const newExcessAmount = item.excessAmount - amc;
              updateAllCredit(
                item._id,
                item.excessAmount,
                newExcessAmount,
                item.paymentNumber,
                item.paymentAmount,
                amc
              );
              item.paymentAmount += amc;
              item.excessAmount = newExcessAmount;
              item.amc = amc;
            }
            return { ...item };
          });
        });
      } else {
        const amc = record.excessAmount;
        // alert('amc: ' + amc + ' ' + invBalDue);
        setInvoiceBalance(invoiceBalance - amc);
        currentAmount += amc;
        setCustomerPayCreditData((prevState) => {
          return prevState.map((item) => {
            console.log(item, 'prevState: item: ', item._id, record?._id);
            if (item._id === record._id) {
              const newExcessAmount = item.excessAmount - amc;
              updateAllCredit(
                item._id,
                item.excessAmount,
                newExcessAmount,
                item.paymentNumber,
                item.paymentAmount,
                amc
              );
              item.paymentAmount += record.excessAmount;
              item.excessAmount = newExcessAmount;
              item.amc = amc;
            }
            return { ...item };
          });
        });
      }
      setAmountToPayCredit(currentAmount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const creditList = allCredit.map((c) => {
      c.paymentAmount = +c.paymentAmount + +c.pAmt;
      return c;
    });

    const inv = {
      id: invID,
      invoiceNumber: invNo,
      // invoiceDate: moment().format("YYYY-MM-DD"),
      invoiceAmount: invData?.grandTotal,
      invBalDue: invBalDue - amountToPayCredit,
      paidAmount: amountToPayCredit,
    };

    await toast
      .promise(
        httpService.put(`/sale-payment/paycredit`, { creditList, inv }),
        {
          pending: 'Applying the Advance Payment',
          success: 'Payment added successfully',
          error: "Couldn't apply the Payment, recheck the details entered",
        }
      )
      .then((response) => {
        // console.log(response?.data);
        history.goBack();
      });
  };

  const columns = [
    {
      title: 'DATE',
      dataIndex: 'paymentDate',
      align: 'center',
      render: (paymentDate) => <span>{paymentDate?.split('T')[0]}</span>,
    },
    {
      title: 'PAYMENT NUMBER',
      dataIndex: 'paymentNumber',
      align: 'center',
      render: (text, record) => (
        <span>
          <Link to={`/app/sales/payment-view/${record._id}`}>{text}</Link>
        </span>
      ),
    },
    {
      title: 'ADVANCE AMOUNT',
      dataIndex: 'amountReceived',
      align: 'center',
    },
    {
      title: 'AMOUNT AVAILABLE',
      dataIndex: 'excessAmount',
      align: 'center',
    },
    {
      title: 'AMOUNT TO CREDIT',
      dataIndex: 'excessAmount',
      align: 'center',
      render: (text, record) => (
        <span>
          <input
            readOnly
            value={record?.amc}
            className="form-control"
            type="number"
            // onChange={(e) => {
            //   handleCreditPay(e, record?._id, record?.excessAmount, record?.amountReceived, record?.paymentNumber, record?.paymentAmount);
            //   // setAmount({
            //   //   ...amount,
            //   //   amount: e.target.value,
            //   // })
            // }}
            min={0}
            max={text}
          />
        </span>
      ),
    },
    {
      title: 'Check',
      dataIndex: 'excessAmount',
      align: 'center',
      render: (text, record) => (
        <span>
          <input
            disabled={record.amc === 0 && invoiceBalance === 0}
            type="checkbox"
            name=""
            className="form-control"
            onChange={(e) => handleClick(e, record)}
          />
        </span>
      ),
    },
  ];

  /* Hooks Start */

  useEffect(() => {
    setCustomerPayCreditData([
      ...customerPayCreditInfo.map((customerPayCredit) => {
        return {
          ...customerPayCredit,
          amc: 0,
        };
      }),
    ]);
    setInvoiceBalance(invBalDue);
  }, []);

  /*useEffect(() => {
    console.debug(customerPayCreditData, 'customerPayCreditData: Changed');
  }, [customerPayCreditData]);*/

  /* Hooks End */

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Apply Advance Payment</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col">
              <h3 className="page-title">Apply Advance Payment from {invNo}</h3>
            </div>
            <div className="col-auto float-right ml-auto">
              <h3 className="page-title">
                {' '}
                <span className="text-muted">Invoice Balance :-</span> ₹
                {invBalDue}
              </h3>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {/* <div className="row">
          <div className="text-right">
            {invBalDue}
          </div>
        </div> */}
        <div className="row">
          <div className="col-sm-12">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-12">
                  <div className="table-responsive">
                    <Table
                      className="table-striped"
                      pagination={{
                        total: customerPayCreditData?.length,
                        showTotal: (total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                        showSizeChanger: true,
                        onShowSizeChange: onShowSizeChange,
                        itemRender: itemRender,
                      }}
                      style={{ overflowX: 'auto' }}
                      columns={columns}
                      // bordered
                      dataSource={customerPayCreditData}
                      rowKey={(record) => record._id}
                    />
                  </div>
                </div>
              </div>

              <div className="row d-flex justify-content-end m-3">
                <div className="text-right p-3 pl-5 border border-warning d-flex flex-column">
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Amount to Credit: ₹{amountToPayCredit}
                  </div>{' '}
                  <br />
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Invoice Balance Due: ₹{invoiceBalance}
                  </div>{' '}
                  <br />
                </div>
              </div>
              <br />
              <div className="row">
                <button
                  className="btn btn-primary mr-2"
                  type="submit"
                  disabled={amountToPayCredit <= 0}
                >
                  Save
                </button>
                <div
                  className="btn btn-outline-secondary"
                  onClick={() => history.goBack()}
                >
                  Cancel
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyToPayCredit;
