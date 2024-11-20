import React from 'react';
import SingleUserAttendanceTable from './SingleUserAttendanceTable';

const FilteredAttendanceEmployeeTable = ({ data }) => {
  return (
    <>
      <div className="table-responsive">
        <table className="table table-striped custom-table mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Date </th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Production</th>
              <th>Break</th>
              <th>Overtime</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <div>No Data </div>
            ) : (
              data
                .sort((a, b) => {
                  return new Date(a.date) - new Date(b.date);
                })
                .map((element, index) => (
                  <SingleUserAttendanceTable
                    key={index}
                    data={element}
                    index={index}
                  />
                ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default FilteredAttendanceEmployeeTable;
