import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Stack, TableCell, TableRow } from '@mui/material';
import Avatar from '@mui/material/Avatar';

const LeadProfileIntrestTable = ({
  plotId,
  isCustomer = false,
  project,
  item,
  updateLeadInterest,
  leadStatus,
}) => {
  const [lead, setLead] = useState(null);
  console.log('projec =>', item);
  useEffect(() => {
    let leadData =
      project?.leadsInfo?.find((el) => el.lead === item._id) ||
      project?.leadsInfo?.find((el) => el.customer === item.customer);

    let customerData = project?.leadsInfo?.find(
      (el) => el.customer === item._id
    );
    if (leadData && !isCustomer) {
      setLead(leadData);
    }
    if (customerData && isCustomer) {
      setLead(customerData);
    }
  }, [project]);
  return (
    <TableRow>
      <TableCell>
        <Link
          style={{ color: 'red' }}
          to={`/app/projects/projects-view/${project?.parent_id}`}
        >
          {project?.parent}
        </Link>
      </TableCell>
      <TableCell>{project?.name}</TableCell>
      {!isCustomer && (
        <TableCell>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
            }}
            spacing={1}
          >
            <Avatar sx={{ bgcolor: 'red[400]' }}>
              {item?.currentAssigned?.name?.substr(0, 1)}
            </Avatar>
            <div>
              {item?.currentAssigned
                ? `${item?.currentAssigned?.name}`
                : 'Not Assigned'}
            </div>
          </Stack>
        </TableCell>
      )}
      <TableCell>
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
      </TableCell>
    </TableRow>
  );
};

export default LeadProfileIntrestTable;
