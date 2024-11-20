import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const LeadInterest = ({
  plotId,
  project,
  item,
  updateLeadInterest,
  leadStatus,
}) => {
  const [lead, setLead] = useState(null);
  useEffect(() => {
    let data =
      project?.leadsInfo?.filter((el) => el.lead === item._id) ||
      project.leadsInfo?.filter((el) => el.customer === item.customer);
    if (data?.length) {
      setLead(data[0]);
    }
  }, [project]);
  return (
    <>
      <tr>
        <td>
          <Link
            style={{ color: 'red' }}
            to={`/app/projects/projects-view/${project?.parent_id}`}
          >
            {project?.parent}
          </Link>
        </td>
        <td
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {project?.name}
        </td>
        <td>{project?.parent_type}</td>
        <td>
          <Link
            to={{
              pathname: item?.currentAssigned?._id
                ? `/app/profile/employee-profile/${item?.currentAssigned?._id}`
                : '/app/employees/leads/#',
            }}
          >
            {item?.currentAssigned
              ? `${item?.currentAssigned?.name}`
              : 'Not Assigned'}
          </Link>
        </td>

        <td>
          <div style={{ width: 'full' }}>
            <select
              value={lead?.leadType}
              disabled={
                lead?.leadType === 'Lost' ||
                lead?.leadType === 'Won' ||
                lead?.leadType === 'Under Registration' ||
                lead?.leadType == 'Registration'
              }
              onChange={(e) => {
                updateLeadInterest(
                  project,
                  project.parent_id,
                  e.target?.value,
                  item?._id
                );
              }}
              className="custom-select"
            >
              <option value="">{lead?.leadType}</option>
              {leadStatus?.map((status, id) => (
                <option key={id} value={status?.name}>
                  {status?.name}
                </option>
              ))}
            </select>
          </div>
        </td>
      </tr>
    </>
  );
};

export default LeadInterest;
