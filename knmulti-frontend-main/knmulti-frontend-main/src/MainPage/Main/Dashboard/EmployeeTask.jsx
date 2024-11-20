import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import httpService from '../../../lib/httpService';
import { toast } from 'react-toastify';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const events = [
  {
    title: 'Big Meeting',
    allDay: true,
    start: new Date(2021, 6, 0),
    end: new Date(2021, 6, 0),
  },
  {
    title: 'Vacation',
    start: new Date(2021, 6, 7),
    end: new Date(2021, 6, 10),
  },
  {
    title: 'Conference',
    start: new Date(2021, 6, 20),
    end: new Date(2021, 6, 23),
  },
  {
    title: 'Conference sept.',
    start: new Date('2022-09-08T18:30:00.000Z'),
    end: new Date('2022-09-09T18:30:00.000Z'),
  },
  {
    title: 'Conf more lorem ipsum aa',
    start: new Date('2022-09-06T18:30:00.000Z'),
    end: new Date('2022-09-08T18:30:00.000Z'),
  },
];
function App({ empTask, fetchEmpTask }) {
  const empTask_2 = [];
  const user = useSelector((state) => state.authentication.value.user);
  const [newEvent, setNewEvent] = useState({
    id: user?._id,
    title: '',
    start: '',
    end: '',
  });
  const [allEvents, setAllEvents] = useState(empTask_2);
  // console.log(newEvent,'newEvents');
  // console.log(allEvents,'allEvents../');

  function handleAddEvent() {
    setAllEvents([...allEvents, newEvent]);
    events.push(newEvent);
  }
  const handleSubmit = async (e) => {
    if (!newEvent.title.trim()) {
      toast.error('Please Enter Task Name');
      return;
    }
    if (!newEvent.start) {
      toast.error('Please Enter Start Date');
      return;
    }
    if (!newEvent.end) {
      toast.error('Please Enter End Date');
      return;
    }
    await httpService.post(`/employeeTask`, newEvent);
    fetchEmpTask();
    toast.success('Task Added Successfully');
    setNewEvent({ id: user?._id, title: '', start: '', end: '' });
  };
  const saveToEmpTask = (e) => {
    empTask?.map((e) => {
      empTask_2.push({
        title: e?.title,
        start: new Date(e?.start),
        end: new Date(e?.end),
      });
    });
  };
  useEffect(() => {
    saveToEmpTask();
  }, []);

  return (
    <div id="add_task" className="modal custom-modal fade" role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Task</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add Title"
                  style={{}}
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>
              <div className="row mx-2 my-3">
                <div className="col-md-4 ">
                  <DatePicker
                    className="form-control"
                    placeholderText="Start Date"
                    style={{ marginRight: '10px', zindex: '100' }}
                    selected={newEvent.start}
                    onChange={(start) => setNewEvent({ ...newEvent, start })}
                  />
                </div>

                <div className="col-md-4">
                  <DatePicker
                    style={{ marginRight: '10px', zindex: '100' }}
                    className="form-control"
                    placeholderText="End Date"
                    selected={newEvent.end}
                    onChange={(end) => setNewEvent({ ...newEvent, end })}
                  />
                </div>

                <div className="col-md-4">
                  <button
                    className="btn btn-info"
                    onClick={(e) => {
                      handleAddEvent();
                      handleSubmit();
                    }}
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
            {/* <input type="text"  className="form-control"   placeholder="Add Title" style={{  }} value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <DatePicker  className="form-control"   placeholderText="Start Date" style={{ marginRight: "10px" }} selected={newEvent.start} onChange={(start) => setNewEvent({ ...newEvent, start })} />
                <DatePicker  className="form-control"   placeholderText="End Date" selected={newEvent.end} onChange={(end) => setNewEvent({ ...newEvent, end })} />
                <br></br>
                <button stlye={{ marginTop: "10px" }} onClick={(e)=>{handleAddEvent();handleSubmit();}}>
                    Add Task
                </button> */}
            <Calendar
              localizer={localizer}
              events={allEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500, margin: '50px', zIndex: '1' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
