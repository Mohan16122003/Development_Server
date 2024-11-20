import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import httpService from '../../../../lib/httpService';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createNotify } from '../../../../features/notify/notifySlice';
export const makeItUnique = (data)=>{
  let uniqueArr = [];
  let uniqueObj = {};
  data.forEach(obj=>{
   if(!uniqueObj[obj.mouza]){
    uniqueObj[obj.mouza] = obj
    uniqueArr.push(obj);
   }
  })
  return uniqueArr
}
export default function AddProjectModal({ fetchData }) {
  const [projectType, setProjectType] = useState('');
  const [projectToAdd, setProjectToAdd] = useState(null);
  const empObj = useSelector((state) => state?.authentication?.value?.user);
  const [doj, Setdoj] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [activeLand, setActiveLand] = useState([]);
  const [uniqueMouza, setUniqueMouza] = useState([]);
  const [landMark, setLandmark] = useState([]);
  const [plotsArray, setPlotsArray] = useState([]);
  const dispatch = useDispatch();
  const { Option } = Select;

  const fetchEmployees = async () => {
    const employees = await httpService.get('/employee');

    const salesEmployees = employees.data.filter(
      (v, i) => v?.jobRole?.name === 'Sales'
    );
    setEmployees(salesEmployees);
  };

  const fetchLand = async () => {
    try {
      let res = await httpService.get(`/landbank/active`);
      setActiveLand(res.data);
      setUniqueMouza(makeItUnique(res.data));
    } catch (err) {
      toast.error('Error while fetching Land');
    }
  };
  useEffect(() => {
    fetchEmployees();
    fetchLand();
  }, []);
  const handleSelectChange = (selectedValues) => {
    setProjectToAdd({ ...projectToAdd, assignedTo: selectedValues });
  };

  const handleSelectPlots = (selectedPlots)=>{
    setProjectToAdd({...projectToAdd, lands:selectedPlots})
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectToAdd.name) {
      toast.error('Select Project  Name');
      return;
    }
    if (!projectToAdd.startDate) {
      toast.error('Select Start Date');
      return;
    }
    if (!projectToAdd.type) {
      toast.error('Select Project Type');
      return;
    }
    if (!projectToAdd.type) {
      toast.error('Select Project Type');
      return;
    }
    if (!projectToAdd.lands.length) {
     return toast.error('Please select Land to Create Project');
    }
    let totalLandArea = [] 
    activeLand.forEach((el)=>{
        projectToAdd.lands.forEach((land)=>{
          if(el._id===land){
            totalLandArea.push(el);
          }
      })
    })
    projectToAdd.landArea = totalLandArea.reduce((acc,cmp)=>{
      acc+= +cmp.land_area;
      return Math.round(acc*43560)
    },0)
    await toast.promise(
      new Promise((resolve, reject) => {
        httpService
          .post('/project', projectToAdd)
          .then((res) => {
            dispatch(
              createNotify({
                notifyHead: `New Project Added`,
                notifyBody: `Project ${res?.data?.name} is created`,
                createdBy: empObj?._id,
              })
            );
            fetchData();
            document.querySelectorAll('.close')?.forEach((e) => e.click());
            resolve();
            e.target.reset();
          })
          .catch((err) => {
            reject(err);
          });
      }),
      {
        error: 'Something went wrong!',
        success: 'Project added successfully!',
        pending: 'Adding project...',
      }
    );
  };
  return (
    <div id="create_project" className="modal custom-modal fade" role="dialog">
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Project</h5>
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
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      required
                      onChange={(e) => {
                        setProjectToAdd((d) => ({
                          ...d,
                          name: e.target.value,
                        }));
                      }}
                      className="form-control"
                      type="text"
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Start Date</label>
                    <div>
                      <DatePicker
                        required
                        className="form-control"
                        value={doj}
                        format={'dd/MM/yyyy'}
                        onChange={(e) => {
                          setProjectToAdd((d) => ({
                            ...d,
                            startDate: new Date(e).toISOString(),
                          }));
                          Setdoj(e);
                        }}
                      />
                      {/* {projectToAdd.startDate} */}
                      {/* <input
                        className="form-control"
                        onChange={(e) => {
                          setProjectToAdd((d) => ({
                            ...d,
                            startDate: e.target.value,
                          }));
                        }}
                        type="date"
                      /> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      required
                      onChange={(e) => {
                        setProjectType(e.target.value);
                        setProjectToAdd((d) => ({
                          ...d,
                          type: e.target.value,
                          subtype: '',
                        }));
                      }}
                      className="custom-select"
                    >
                      <option value={''}>Select type</option>
                      <option value={'Plot'}>Plotting</option>
                      <option value={'Housing'}>Housing</option>
                    </select>
                  </div>
                </div>
                {projectType == 'Plot' && (
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Sub Type</label>
                      <select
                        onChange={(e) => {
                          setProjectToAdd((d) => ({
                            ...d,
                            subtype: e.target.value,
                          }));
                        }}
                        className="custom-select"
                      >
                        <option value={''} hidden>
                          Select type
                        </option>
                        <option value={'Residencial Plot'}>
                          Residencial Plot
                        </option>
                        <option value={'Commercial Plot'}>
                          Commercial Plot
                        </option>
                        <option value={'Farm Plot'}>Farm Plot</option>
                      </select>
                    </div>
                  </div>
                )}
                {projectType == 'Housing' && (
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Sub Type</label>
                      <select
                        onChange={(e) => {
                          setProjectToAdd((d) => ({
                            ...d,
                            subtype: e.target.value,
                          }));
                        }}
                        className="custom-select"
                      >
                        <option value={''} hidden>
                          Select type
                        </option>
                        <option value={'Apartment'}>Apartment</option>
                        <option value={'Simplex'}>Simplex</option>
                        <option value={'Duplex'}>Duplex</option>
                        <option value={'Triplex'}>Triplex</option>
                        <option value={'Villa'}>Villa</option>
                        <option value={'Bunglow'}>Bunglow</option>
                        <option value={'Penthouse'}>Penthouse</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Project Status</label>
                    <select
                      required
                      onChange={(e) => {
                        setProjectToAdd((d) => ({
                          ...d,
                          saleStatus: e.target.value,
                        }));
                      }}
                      className="custom-select"
                    >
                      <option value={''}>Select Status</option>
                      <option value={'Not Live'}>Not Live</option>
                      <option value={'Live'}>Live</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor={'inp-cost-sq-feet'}>Cost/sq Feet</label>
                    <input
                      required
                      min={0}
                      onWheel={(e) => e.currentTarget.blur()}
                      id={'inp-cost-sq-feet'}
                      onChange={(e) => {
                        setProjectToAdd((d) => ({
                          ...d,
                          costPerSqFeet: e.target.value,
                        }));
                      }}
                      className="form-control"
                      type="number"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6 form-group" style={{ height: '80px' }}>
                  <label>Employees</label>

                  <Select
                    mode="multiple"
                    style={{ width: '100%', minHeight: '100%' }}
                    placeholder="Please select"
                    onChange={handleSelectChange}
                  >
                    {employees.map((employee) => (
                      <Option key={employee?._id} value={employee?._id}>
                        {`${employee.firstName} ${employee.lastName}`}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Select Land Mouza</label>
                    <select
                      required
                      onChange={(e) => {
                        setPlotsArray([])
                        setLandmark(
                          activeLand.filter((el) => el.mouza === e.target.value)
                        );
                      }}  
                      className="custom-select"
                    >
                      <option value={''}>--please select--</option>
                      {uniqueMouza?.map((land) => (
                        <option key={land?._id} value={land?.mouza}>
                          {land?.mouza}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {landMark.length ? (
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Select Landmark</label>
                      <select
                        required
                        onChange={(e) => {
                          setPlotsArray(
                            activeLand.filter(
                              (el) => el.landmark == e.target.value
                            )
                          );
                        }}
                        className="custom-select"
                      >
                        <option value={''}>--please select--</option>
                        {makeItUnique(landMark)?.map((land) => (
                          <option key={land?._id} value={land?.landmark}>
                            {land?.landmark}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
              ):''}

                {landMark.length && plotsArray.length ? (
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Select Plot</label>
                      <Select
                        required
                        mode="multiple"
                        style={{ width: '100%', minHeight: '100%' }}
                        placeholder="Please select"
                        onChange={handleSelectPlots}
                      >
                        {plotsArray?.length&&landMark?.map((land) => (
                          <Option key={land?._id} value={land._id}>
                            {land?.plot_no}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                ):''}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={4}
                  className="form-control"
                  placeholder="Description"
                  defaultValue={''}
                  onChange={(e) => {
                    setProjectToAdd((d) => ({
                      ...d,
                      description: e.target.value,
                    }));
                  }}
                />
              </div>
              <div className="submit-section">
                <button className="btn btn-primary submit-btn">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
