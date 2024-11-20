import React, { useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
const DFRaddReportRow = ({
  customer,
  item,
  index,
  handleItemsAddition,
  removeitem,
}) => {
  const [nameAddress, setNameAddress] = useState(item.name);
  const [date, setDate] = useState(item.nextAppoinment);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const handleSelectedCustomer = (id) => {
    let selected = customer?.filter((el) => el._id === id);
    setSelectedCustomer(selected[0]);
    setNameAddress(selected[0]?.displayName);
    handleItemsAddition(
      {
        target: {
          value: selected[0]?.phone || selected[0].workPhone,
          name: 'contactNo',
        },
      },
      index
    );
    handleItemsAddition(
      { target: { value: selected[0]?.displayName, name: 'name' } },
      index
    );
  };

  const filterAddendance = (data, text = nameAddress) => {
    if (text) {
      return data.filter((el) =>
        el.displayName?.toLowerCase().includes(text.toLowerCase())
      );
    } else {
      return null;
    }
  };
  return (
    <tr className="text-center">
      {/* <td>{index + 1}</td> */}
      <td>
        <div
          style={{
            position: 'relative',
          }}
        >
          <input
            className="form-control"
            type="text"
            name="name"
            required
            placeholder="search"
            value={nameAddress}
            onChange={(e) => {
              if (!e.target.value) {
                setSelectedCustomer(null);
              }
              setNameAddress(e.target.value);
            }}
          />
          {!selectedCustomer && (
            <ul
              style={{
                position: 'absolute',
                width: '100%',
                background: 'white',
                listStyle: 'none',
                margin: '0',
                padding: '2px',
                textAlign: 'start',
                zIndex: '100',
              }}
            >
              {filterAddendance(customer)?.map((el, id) => (
                <li
                  key={id}
                  onClick={() => handleSelectedCustomer(el._id)}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  {el.displayName}
                </li>
              ))}
            </ul>
          )}
        </div>
      </td>
      <td>
        <input
          className="form-control"
          type="number"
          name="contactNo"
          maxLength={10}
          value={item?.contactNo}
          disabled={true}
        />
      </td>

      <td>
        <input
          onWheel={(e) => e.currentTarget.blur()}
          className="form-control"
          type="number"
          name="callNo"
          value={item?.callNo}
          onChange={(e) => handleItemsAddition(e, index)}
          min={0}
        />
      </td>
      <td>
        <textarea
          rows={1}
          onWheel={(e) => e.currentTarget.blur()}
          className="form-control"
          type="text"
          name="releventPoint"
          value={item.releventPoint}
          onChange={(e) => handleItemsAddition(e, index)}
        />
      </td>
      <td>
        <input
          type="datetime-local"
          name="nextAppoinment"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            handleItemsAddition(e, index);
          }}
        />
      </td>
      <td>
        <div className="" onClick={(e) => removeitem(e, index)}>
          <DeleteForeverIcon />
        </div>
      </td>
    </tr>
  );
};

export default DFRaddReportRow;
