import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory, useLocation } from 'react-router-dom';
import httpService from '../../../lib/httpService';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Button, Space } from 'antd';

const CreateSalesOrder = () => {
  const [customer, setCustomer] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [orderToAdd, setOrderToAdd] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [itemsToAdd, setItemsToAdd] = useState([]);
  const [typediscount, settypediscount] = useState('percent');
  const [discountValue, setdiscountValue] = useState('');
  
  const [total, setTotal] = useState(0);

  const history = useHistory();
  const { state } = useLocation();

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%',
      });
    }
    fetchCustomers();
    fetchEmployees();
    setOrderToAdd({
      ...orderToAdd,
      orderDate: moment().format('YYYY-MM-DD'),
    });
  }, []);

  useEffect(() => {
    if (state?.edit) {
      const {
        customer,
        amount,
        customerNotes,
        delivery,
        discount,
        employee,
        grandTotal,
        items,
        orderDate,
        paymentTerms,
        reference,
        salesOrder,
        shipmentDate,
        termsAndConditions,
        
        discountVarient,
      } = state;
      console.log(state, 'sate.edit');
      setOrderToAdd({
        customer: customer?._id,
        amount,
        customerNotes,
        delivery,
        discount,
        employee,
        grandTotal,
        items,
        orderDate,
        paymentTerms,
        reference,
        salesOrder,
        shipmentDate,
        termsAndConditions,
      });
      setItemsToAdd(items);
      
      settypediscount(discountVarient?.discountType);
      setdiscountValue(discountVarient?.discountValue);
      setDiscount(discount);
    }
  }, []);
  
  const handleInlineDiscountValue = () => {
    let updatedDiscount
    if (typediscount == 'INR') {
      // setDiscount(discountValue);
      updatedDiscount = discountValue;
    }
    if (typediscount == 'percent') {
      updatedDiscount = (total * discountValue) / 100;
      // setDiscount(discoun1);
    }
    setDiscount(updatedDiscount);
  };
  useEffect(()=>{
    handleInlineDiscountValue();

  },[typediscount,discountValue,total])


  useEffect(() => {
    if (state?.customerId) {
      setOrderToAdd({
        ...orderToAdd,
        customer: state?.customerId,
        orderDate: moment().format('YYYY-MM-DD'),
      });

      selectCustomer(state?.customerId);
    }
  }, []);

  useEffect(() => {
    let newTotal = 0;
    itemsToAdd.forEach((item) => {
      newTotal = newTotal + parseInt(item.amount);
    });
    setTotal(newTotal);
  }, [itemsToAdd]);

  useEffect(() => {
    setGrandTotal(total - discount);
  }, [total, discount]);

  const fetchCustomers = async () => {
    const customers = await httpService.get('/customer');
    setCustomer(customers.data);
  };

  const fetchEmployees = async () => {
    const employees = await httpService.get('/employee');
    setEmployees(employees.data);
  };

  const selectCustomer = (id) => {
    customer.forEach((item) => {
      if (item._id === id) {
        setOrderToAdd({
          ...orderToAdd,
          customer: id,
        });
        setSelectedCustomer(item);
      }
    });
  };

  const handleItemsAddition = (e, index) => {
    const updatedItemList = itemsToAdd.map((pct, i) =>
      index == i ? Object.assign(pct, { [e.target.name]: e.target.value }) : pct
    );
    updatedItemList[index].amount =
      parseInt(updatedItemList[index].quantity) *
      parseInt(updatedItemList[index].unitCost);
    setItemsToAdd(updatedItemList);
  };

  const removeItem = (e, index) => {
    const updatedItemList = itemsToAdd.filter((pct, i) => index !== i);
    setItemsToAdd(updatedItemList);
  };

  const addItems = () => {
    setItemsToAdd([
      ...itemsToAdd,
      {
        item: '',
        description: '',
        unitCost: 0,
        quantity: 0,
        amount: '',
        editing: true
      }
    ]);
  };

  const toggleItemToEditing = (index) => {
    setItemsToAdd(prevState => {
      prevState[index].editing = !prevState[index].editing;
      return [...prevState];
    });
  };

  const handleAddModifyItemForm = (e, index) => {
    e.preventDefault();
    const item = itemsToAdd[index];
    if (item?.item === '') {
      return toast.error(`Item Required at ${++index}th row.`);
    } else if (item?.unitCost === '') {
      return toast.error(`Unit Cost Required at ${++index}th row.`);
    } else if (item?.quantity === '') {
      return toast.error(`Quantity Required at ${++index}th row.`);
    } else {
      console.log('ItemToAdd: Submitted');
      toggleItemToEditing(index);
    }
  };

  const handleSubmit = async (e) => {
    const salesOrder = {
      ...orderToAdd,
      items: itemsToAdd,
      amount: total,
      discount: discount,
      grandTotal: grandTotal,
      discountVarient: {
        discountType: typediscount,
        discountValue: discountValue
      }
    };
    if (itemsToAdd.length === 0) {
      toast.error('Please Add Items');
      return;
    } else {
      const filtered = itemsToAdd.filter(item => {
        return (item?.item === '' && item?.unitCost == 0 && item?.quantity == 0);
      });
      console.log(filtered, 'filtered');
      if (filtered.length !== 0) {
        return toast.error('Items rows not filled.');
      }
      setItemsToAdd(filtered);
    }
    if (
      orderToAdd.customer == undefined ||
      orderToAdd.customer == ''
    ) {
      toast.error('Please Select Customer');
      return;
    }

    
    if (state?.edit) {
      const response = await toast.promise(
        httpService.put(`/sale-order/${state._id}`, salesOrder),
        {
          pending: 'Creating sales order',
          success: 'Sales Order Created',
          error: "Couldn't create Sales Order, recheck the details entered",
        }
      );
      if (e.submit) {
        history.push({
          pathname: '/app/apps/email',
          state: {
            id: response?.data?._id,
            subject: `Details for order ${response?.data?.salesOrder}`,
            pdf: response?.data?.pdf_url,
            index: response?.data?.salesOrder,
            type: 'sale-order',
            emailId: response?.data?.customer?.email,
            backTo: -4,
          },
        });
        return;
      }
      history.push('/app/sales/salesorder');
      return;
    }
    const response = await toast.promise(
      httpService.post('/sale-order', salesOrder),
      {
        pending: 'Creating sales order',
        success: 'Sales Order Created',
        error: "Couldn't create Sales Order, recheck the details entered",
      }
    );
    if (e.submit) {
      history.push({
        pathname: '/app/apps/email',
        state: {
          id: response?.data?._id,
          subject: `Details for order ${response?.data?.salesOrder}`,
          pdf: response?.data?.pdf_url,
          index: response?.data?.salesOrder,
          type: 'sale-order',
          emailId: response?.data?.customer?.email,
          backTo: -4,
        },
      });
      return;
    }

    history.push('/app/sales/salesorder');
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>New Sales Order</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">New Sales Order</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">New Sales Order</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-sm-12">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              {/* !! add redirect option to create more customer */}
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className='text-danger'>Customer Name *</label>
                    <select
                      required
                      value={orderToAdd?.customer}
                      onChange={(e) => {
                        selectCustomer(e.target.value);
                      }}
                      className='custom-select'
                    >
                      <option value={''}>Select</option>
                      {customer.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-sm-6 form-group">
                  <label className="text-danger">Sales Order#</label>
                  <input
                    value={orderToAdd?.salesOrder || null}
                    placeholder="SO-000XX"
                    onChange={(e) => {
                      setOrderToAdd({
                        ...orderToAdd,
                        salesOrder: e.target.value,
                      });
                    }}
                    disabled={true}
                    className="form-control"
                    type="text"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6 form-group">
                  <label>Reference#</label>
                  <input
                    value={orderToAdd?.reference || null}
                    onChange={(e) => {
                      setOrderToAdd({
                        ...orderToAdd,
                        reference: e.target.value,
                      });
                    }}
                    className="form-control"
                    type="text"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Sales Order Date</label>
                    <div>
                      <input
                        value={orderToAdd?.orderDate?.split('T')[0] || ``}
                        className="form-control"
                        onChange={(e) => {
                          setOrderToAdd({
                            ...orderToAdd,
                            orderDate: e.target.value,
                          });
                        }}
                        type="date"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Order Expected Date</label>
                    <div>
                      <input
                        value={orderToAdd?.shipmentDate?.split('T')[0] || null}
                        onChange={(e) => {
                          setOrderToAdd({
                            ...orderToAdd,
                            shipmentDate: e.target.value,
                          });
                        }}
                        className="form-control"
                        type="date"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Payment Terms</label>
                    <div>
                      <select
                        value={orderToAdd?.paymentTerms || null}
                        onChange={(e) => {
                          setOrderToAdd({
                            ...orderToAdd,
                            paymentTerms: e.target.value,
                          });
                        }}
                        className="form-control"
                        type="date"
                      >
                        {[
                          'Net 15',
                          'Net 30',
                          'Net 45',
                          'Net 60',
                          'Due end of month',
                          'Due end of next month',
                          'Due on receipt',
                        ].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                        <option value=''>
                          Please Select
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-sm-6 form-group">
                  <label>Employees</label>
                  <select
                    value={orderToAdd?.employee || null}
                    onChange={(e) => {
                      setOrderToAdd({
                        ...orderToAdd,
                        employee: parseInt(e.target.value),
                      });
                    }}
                    className="custom-select"
                  >
                    <option>Please Select</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {`${employee.firstName} ${employee.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-md-12 col-sm-12">
                  <div className="table-responsive">
                    <table className="table table-hover table-white">
                      <thead>
                        <tr className="text-center">
                          <th>S.No.</th>
                          <th>Item</th>
                          <th>Description</th>
                          <th>Unit Cost</th>
                          <th>Qty</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                      {
                        itemsToAdd.map((p, index) => (
                          <tr className='text-center'
                              key={index}
                          >
                            <td colSpan={7}>
                              <div>
                                <Space
                                  size={'small'}
                                >
                                  <input
                                    readOnly
                                    className='form-control'
                                    value={index + 1}
                                  />
                                  <input
                                    required
                                    readOnly={!p.editing}
                                    className='form-control'
                                    type='text'
                                    name='item'
                                    value={p.item}
                                    onChange={(e) => handleItemsAddition(e, index)}
                                  />
                                  <input
                                    readOnly={!p.editing}
                                    className='form-control'
                                    type='text'
                                    name='description'
                                    value={p.description}
                                    onChange={(e) => handleItemsAddition(e, index)}
                                  />
                                  <input
                                    required
                                    readOnly={!p.editing}
                                    className='form-control'
                                    type='number'
                                    name='unitCost'
                                    value={p.unitCost}
                                    min={1}
                                    onChange={(e) => handleItemsAddition(e, index)}
                                    onWheel={(e) => e.currentTarget.blur()}
                                  />
                                  <input
                                    required
                                    readOnly={!p.editing}
                                    className='form-control'
                                    type='number'
                                    maxLength={10}
                                    name='quantity'
                                    min={1}
                                    value={p.quantity}
                                    onChange={(e) => handleItemsAddition(e, index)}
                                    onWheel={(e) => e.currentTarget.blur()}
                                  />
                                  <input
                                    readOnly
                                    className='form-control'
                                    value={p?.amount || 0}
                                  />
                                  {
                                    p.editing ?
                                      <Space
                                        size={'small'}
                                      >
                                        <Button
                                          style={{
                                            width: 80
                                          }}
                                          disabled={p.editing}
                                          onClick={() => toggleItemToEditing(index)}
                                          icon={<i className='fa fa-pencil mr-1' />}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          htmlType={'submit'}
                                          style={{
                                            width: 80
                                          }}
                                          onClick={(e) => handleAddModifyItemForm(e, index)}
                                          icon={<i className='fa fa-save mr-1' />}
                                        >
                                          Save
                                        </Button>
                                      </Space>
                                      :
                                      <Space
                                        size={'small'}
                                      >
                                        <Button
                                          style={{
                                            width: 80
                                          }}
                                          onClick={() => toggleItemToEditing(index)}
                                          icon={<i className='fa fa-pencil mr-1' />}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          style={{
                                            width: 80
                                          }}
                                          icon={<i className='fa fa-trash-o mr-1' />}
                                          onClick={() => removeItem(index)}
                                          danger
                                        >
                                          Delete
                                        </Button>
                                      </Space>
                                  }
                                </Space>
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                      </tbody>
                    </table>
                    <div className="btn btn-primary" onClick={addItems}>
                      + Add Items
                    </div>
                  </div>
                  <hr />
                  <div className="table-responsive">
                    <table className="table table-hover table-white">
                      <tbody>
                      <tr>
                        <td />
                        <td />
                        <td />
                        <td />
                        <td className='text-right'>Total</td>
                        <td
                          style={{
                            textAlign: 'right',
                            paddingRight: '30px',
                            width: '230px'
                          }}
                        >
                          {total || 0}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: 'right'
                          }}
                        >
                          <Space size={'small'}>
                            <p>
                              Discount
                            </p>
                            <input
                              onWheel={(e) => e.currentTarget.blur()}
                              value={discountValue}
                              style={{ width: '180px' }}
                              className='form-control'
                              type='number'
                              onChange={(e) => {
                                setdiscountValue(e.target.value);
                              }}
                              onBlur={handleInlineDiscountValue}
                            />
                            <select
                              className='custom-select'
                              style={{ width: '180px' }}
                              name='discountType'
                              value={typediscount}
                              onChange={(e) => {
                                settypediscount(e.target.value);
                                handleInlineDiscountValue(e.target.value);
                              }}
                            >

                              <option value='percent'>%</option>
                              <option value='INR'>&#x20B9;</option>
                            </select>
                          </Space>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            width: '230px'
                          }}
                        >
                          <input
                            onWheel={(e) => e.currentTarget.blur()}
                            className='form-control text-right p-0'
                            value={discount || 0}
                            type='number'
                            readOnly
                            onChange={(e) => {
                              setDiscount(e.target.value);
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={5}
                          style={{ textAlign: 'right', fontWeight: 'bold' }}
                        >
                          Grand Total
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            paddingRight: '30px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            width: '230px'
                          }}
                        >
                          {grandTotal || 0}
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label>Customer Notes</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={orderToAdd?.customerNotes || null}
                          onChange={(e) => {
                            setOrderToAdd({
                              ...orderToAdd,
                              customerNotes: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label>Terms & Conditions</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={orderToAdd?.termsAndConditions || null}
                          onChange={(e) => {
                            setOrderToAdd({
                              ...orderToAdd,
                              termsAndConditions: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="submit-section">
                {/* <button onClick={e => handleSubmit({...e, submit: true})} type="submit" value="send" className="btn btn-primary submit-btn m-r-10">
                  Save &amp; Send
                </button> */}
                <button
                  onClick={(e) => handleSubmit({ ...e, submit: false })}
                  type="submit"
                  value="save"
                  className="btn btn-primary submit-btn"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Page Content */}
    </div>
  );
};

export default CreateSalesOrder;
