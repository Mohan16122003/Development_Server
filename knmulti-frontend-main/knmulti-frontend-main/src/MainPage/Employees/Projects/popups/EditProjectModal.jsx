import React, { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';


const EditProjectModal = ({ onSubmit, setProjectToEdit, projectToEdit, projectTypeEdit = "Plot" }) => {

  const [projectType, setProjectType] = useState(projectToEdit?.type || "");
  const [doj, Setdoj] = useState();
  useEffect(() => {
    setProjectType(projectToEdit?.type);

  }, []);
  useEffect(() => {
    const startdate = new Date(projectToEdit.startDate).toString()
    Setdoj(startdate);
  }, []);
  return (

    <div id="edit_project" className="modal custom-modal fade" role="dialog">
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"> Project</h5>
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
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      required
                      defaultValue={projectToEdit.name}
                      onChange={(e) => {
                        setProjectToEdit((d) => ({
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
                        className='form-control'
                        value={projectToEdit?.startDate}
                        format={'dd/MM/yyyy'}
                        onChange={(e) => {
                          setProjectToEdit((d) => ({
                            ...d,
                            startDate: e
                          }));
                        }}
                      />
                      {/* <input
                        className="form-control"
                        // defaultValue={projectToEdit.startDate?.substring(0, 10)}
                        onChange={(e) => {
                          setProjectToEdit((d) => ({
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
                      value={projectToEdit.type}
                      onChange={(e) => {
                        setProjectType(e.target.value);
                        setProjectToEdit((d) => ({
                          ...d,
                          type: e.target.value,
                          subtype: ''
                        }));
                      }}
                      className="custom-select"
                    >
                      <option value={''} hidden>
                        Select type
                      </option>
                      <option value={'Plot'}>Plotting</option>
                      <option value={'Housing'}>Housing</option>
                    </select>
                  </div>
                </div>
                {(projectType || projectTypeEdit) == "Plot" &&

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Sub Type</label>
                      <select
                        value={projectToEdit?.subtype}
                        onChange={(e) => {
                          setProjectToEdit((d) => ({
                            ...d,
                            subtype: e.target.value,
                          }));
                        }}
                        className="custom-select"
                      >
                        <option value={''} hidden>
                          Select type
                        </option>
                        <option value={'Residencial Plot'}>Residencial Plot</option>
                        <option value={'Commercial Plot'}>Commercial Plot</option>
                        <option value={'Farm Plot'}>Farm Plot</option>
                      </select>
                    </div>
                  </div>
                }
                {(projectType || projectTypeEdit) == "Housing" &&

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Sub Type</label>
                      <select
                        value={projectToEdit?.subtype}
                        onChange={(e) => {
                          setProjectToEdit((d) => ({
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
                }
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Sale Status</label>
                    <select
                      required
                      value={projectToEdit.saleStatus}
                      onChange={(e) => {
                        setProjectToEdit((d) => ({
                          ...d,
                          saleStatus: e.target.value,
                        }));
                      }}
                      className="custom-select"
                    >
                      <option value={''}>
                        Select Status
                      </option>
                      <option value={'Not Live'}>Not Live</option>
                      <option value={'Live'}>Live</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <div className="form-group">
                      <label>Cost/Sq Feet</label>
                      <input
                        required
                        onWheel={(e) => e.currentTarget.blur()}
                        defaultValue={projectToEdit.costPerSqFeet}
                        onChange={(e) => {
                          setProjectToEdit((d) => ({
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
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={4}
                  className="form-control"
                  placeholder="Description"
                  defaultValue={projectToEdit.description}
                  onChange={(e) => {
                    setProjectToEdit((d) => ({
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
  )
};

export default EditProjectModal;
