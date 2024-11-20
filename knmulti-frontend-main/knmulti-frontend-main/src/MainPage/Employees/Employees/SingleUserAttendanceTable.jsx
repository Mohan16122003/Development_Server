import React, { useEffect, useState } from 'react';
import {
  DAILY_WORKING_HOURS,
  DAILY_BREAK_HOURS,
} from '../../../misc/constants';
import RemarkModal from '../../../components/RemarkModal';

const SingleUserAttendanceTable = ({ data, index }) => {
  const [remark, setRemark] = useState(null);
  const [leastProdLimit, setLeastProdLimit] = useState(180000);
  const [Prodtime, setProdTime] = useState(null);
  const [breakTime, setBreakTime] = useState(null);
  const [overTime, setOverTime] = useState(null);
  useEffect(() => {
    // to calculate producation time :
    let productionTime = data?.productionTime || 0;
    let totalTime = data?.totalTime || 0;
    let minutes = Math.floor((productionTime / (1000 * 60)) % 60);
    let hours = Math.floor(productionTime / (1000 * 60 * 60));
    if (hours < 0) {
      hours = 0;
    }
    if (minutes < 0) {
      minutes = 0;
    }
    setProdTime({ totalMin: minutes, totalHrs: hours });
    // to calculate break time :
    let totalDiff = totalTime - productionTime;
    let bminutes = Math.floor((totalDiff / (1000 * 60)) % 60);
    let bhours = Math.floor(totalDiff / (1000 * 60 * 60));
    if (bhours < 0) {
      bhours = 0;
    }
    if (bminutes < 0) {
      bminutes = 0;
    }
    setBreakTime({ hours: bhours, minutes: bminutes });
    // to calculate over time :
    if (totalTime > DAILY_WORKING_HOURS * 60 * 60 * 1000) {
      let breakTim = totalTime - productionTime;
      let overTime =
        totalTime -
        (breakTim - DAILY_BREAK_HOURS * 60 * 60 * 1000) -
        DAILY_WORKING_HOURS * 60 * 60 * 1000;
      let minutes = Math.floor((overTime / (1000 * 60)) % 60);
      let hours = Math.floor(overTime / (1000 * 60 * 60));
      if (hours < 0) {
        hours = 0;
      }
      if (minutes < 0) {
        minutes = 0;
      }
      setOverTime({ hours, minutes });
    } else {
      setOverTime({ hours: 0, minutes: 0 });
    }
    setLeastProdLimit((DAILY_WORKING_HOURS / 2) * (1000 * 60 * 60));
  }, [data]);
  const closeModal= ()=>{
    setRemark(null);
  }
  return (
    <>
      <tr>
        <td>{index + 1}</td>

        <td>{new Date(data?.date).toLocaleDateString()}</td>

        <td>
          {new Date(data?.date).getDay() == 0
            ? 'SUN'
            : data.productionTime < leastProdLimit
            ? 'Absent'
            : new Date(data?.sessions[0]?.from).toLocaleTimeString()}
        </td>
        <td>
          {data?.productionTime < leastProdLimit
            ? '-'
            : data?.sessions[data?.sessions.length - 1].upto
            ? new Date(
                data.sessions[data.sessions.length - 1].upto
              ).toLocaleTimeString()
            : new Date(
                data.sessions[data.sessions.length - 1].from
              ).toLocaleTimeString()}
        </td>

        <td>
          {Prodtime?.totalHrs < 10
            ? `0${Prodtime?.totalHrs}`
            : Prodtime?.totalHrs}
          :
          {Prodtime?.totalMin < 10
            ? `0${Prodtime?.totalMin}`
            : Prodtime?.totalMin}
        </td>

        <td>
          {breakTime?.hours < 10 ? `0${breakTime?.hours}` : breakTime?.hours}:
          {breakTime?.minutes < 10
            ? `0${breakTime?.minutes}`
            : breakTime?.minutes}
        </td>
        <td>
          {overTime?.hours < 10 ? `0${overTime?.hours}` : overTime?.hours}:
          {overTime?.minutes < 10 ? `0${overTime?.minutes}` : overTime?.minutes}
        </td>
        <td style={{fontWeight:"500", cursor:"pointer"}} onClick={() => setRemark(data.description)}>view</td>
      </tr>
      {remark&&<RemarkModal data={remark} closeModal={closeModal} />}
    </>
  );
};

export default SingleUserAttendanceTable;
