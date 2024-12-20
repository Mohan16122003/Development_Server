import { Add, DeleteOutline } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import httpService from '../../../lib/httpService';

const AddPlotTable = ({ projectId, fetchProjectDetails, projectType, areaCost, subPlots }) => {
  const [plotData, setplotData] = useState([]);
  const plotTemplate = {
    name: '',
    dimension: '',
    area: 0,
    areaCost: areaCost,
    corner: 0,
    other: 0,
    cost: 0,
    facing: '',
    description: ''
  };
  useEffect(() => {
    if (areaCost) {
      setplotData([{
        ...plotTemplate,
        areaCost: areaCost
      }]);
    }
    if (subPlots && subPlots.length > 0) {
      setplotData([...subPlots]);
    }
  }, [areaCost, subPlots]);


  const addPlotField = () => {
    setplotData([...plotData, plotTemplate]);
  };

  const removePlotField = (e, index) => {
    if (index !== 0) {
      const updatedPlot = plotData.filter((plt, i) => index !== i);
      setplotData(updatedPlot);
    }
  };

  const handlePlotData = (e, index) => {
    const updatedPlot = plotData.map((plot, i) => {
      if (index == i) {
        const targetName = e.target.name;
        const targetValue = e.target.value;
        const obj = {
          [targetName]: targetValue
        };
        if (targetName === 'areaCost' && !isNaN(targetValue)) {
          obj[targetName] = parseInt(targetValue);
          obj['cost'] = plot?.area * parseInt(targetValue) + plot?.corner + plot?.other;
        } else if (targetName === 'corner' && !isNaN(targetValue)) {
          obj[targetName] = parseInt(targetValue);
          obj['cost'] = plot?.area * plot?.areaCost + parseInt(targetValue) + plot?.other;
        } else if (targetName === 'other' && !isNaN(targetValue)) {
          obj[targetName] = parseInt(targetValue);
          obj['cost'] = plot?.area * plot?.areaCost + plot?.corner + parseInt(targetValue);
        }
        Object.assign(plot, obj);
        return { ...plot };
      } else {
        return plot;
      }
    });
    setplotData(updatedPlot);
  };

  const handlePlotHeightInp = (e, index) => {
    const updatedPlot = plotData.map((plot, i) => {
      if (index == i) {
        const targetValue = e.target.value;
        const area = targetValue * plot?.dimension?.width;
        Object.assign(plot, {
          dimension: {
            ...plot?.dimension,
            height: targetValue
          },
          area: area,
          cost: area * plot?.areaCost + plot?.corner + plot?.other
        });
        return { ...plot };
      } else {
        return plot;
      }
    });
    setplotData(updatedPlot);
  };

  const handlePlotWidthInp = (e, index) => {
    const updatedPlot = plotData.map((plot, i) => {
      if (index == i) {
        const targetValue = e.target.value;
        const area = targetValue * plot?.dimension?.height;
        Object.assign(plot, {
          dimension: {
            ...plot?.dimension,
            width: targetValue
          },
          area: area,
          cost: area * plot?.areaCost + plot?.corner + plot?.other
        });
        console.log(plot, 'dhjgdjhfdg');
        return { ...plot };
      } else {
        return plot;
      }
    });
    setplotData(updatedPlot);
  };

  const handleRowValue = (e, index) => {

    let updatedCost = (+plotData[index]?.areaCost) + (+plotData[index]?.corner) + (+plotData[index]?.other);
    const updatePlot = plotData.map((pd, i) => index == i ? Object.assign(pd, { cost: updatedCost }) : pd);
    setplotData(updatePlot);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataValidPromise = new Promise((resolve, reject) => {
      const invalid = [];
      plotData.map((plot, index) => {
        if (plot.cost === undefined || plot.cost <= 0) {
          invalid.push(`Grand Total is required at ${++index} row.`);
        }
      });
      if (invalid.length !== 0) {
        invalid.forEach(message => {
          toast.error(message);
        });
      } else {
        resolve();
      }
    });
    dataValidPromise.then(() => {
      toast
        .promise(
          httpService
            .post(`/project/${projectId}/subPlots`, { subPlots: plotData })
            .catch(() => {
              toast.error('Something went wrong');
            }),
          {
            error: 'Something went wrong',
            success: 'Plot deatils updated successfully',
            pending: 'Updating Plot Deatils'
          }
        )
        .then(() => {
          fetchProjectDetails();
          document.querySelectorAll('.close')?.forEach((e) => e.click());
        });
    });

  };

  return (
    <div id='add_plots' className='modal custom-modal fade' role='dialog'>
      <div
        className='modal-dialog modal-dialog-centered modal-xl'
        role='document'
        style={{
          maxWidth: '90%'
        }}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Add {projectType}s</h5>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              aria-label='Close'
            >
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='modal-body'>
            <form
              onSubmit={handleSubmit}
            >
              <div className='row'>
                <div className='col-md-12 col-sm-12'>
                  <div className='table-responsive'>
                    <table className='table table-hover table-white'>
                      <thead>
                      <tr className='text-center'>
                        <td>Name <span className='text-danger'>*</span></td>
                        <td colSpan={2}>Dimension <span className='text-danger'>*</span></td>
                        <td>Area <span className='text-danger'>*</span></td>
                        <td>Area Cost <span className='text-danger'>*</span></td>
                        <td>Corner Cost</td>
                        <td>Other Cost</td>
                        <td>Grand Total <span className='text-danger'>*</span></td>
                        <td>Facing</td>
                        <td>Description</td>
                        <td>Remove</td>
                      </tr>
                      </thead>
                      <tbody>
                      {plotData.map((plot, index) => (
                        <tr>
                          <td style={{ width: '120px' }}>
                            <input type='text' name='name' className='form-control'
                                   value={plot.name}
                                   onChange={(e) => handlePlotData(e, index)}
                                   required
                            />
                          </td>
                          <td style={{ width: '130px' }}>
                            <input
                              onWheel={e => e.currentTarget.blur()}
                              placeholder={'Length'}
                              type='number'
                              name='dimension.height'
                              className='form-control'
                              value={plot?.dimension?.height}
                              onChange={(e) => handlePlotHeightInp(e, index)}
                              required
                            />
                          </td>

                          <td style={{ width: '130px' }}>
                            <input
                              onWheel={e => e.currentTarget.blur()}
                              placeholder={'Width'}
                              type='number'
                              name='dimension.width'
                              className='form-control'
                              value={plot?.dimension?.width}
                              onChange={(e) => handlePlotWidthInp(e, index)}
                              required
                            />
                          </td>

                          <td style={{ width: '130px' }}>
                            <input
                              readOnly
                              type='number'
                              name='area'
                              className='form-control'
                              value={plot?.area}
                              // onChange={(e) => handlePlotData(e, index)}
                              required
                            />
                          </td>

                          <td style={{ width: '130px' }}>
                            <input
                              type='number'
                              name='areaCost'
                              className='form-control'
                              value={plot.areaCost}
                              onChange={(e) => {
                                handlePlotData(e, index);
                              }}
                              required
                            />
                          </td>

                          <td>
                            <input
                              required
                              type='number'
                              name='corner'
                              className='form-control'
                              value={plot.corner}
                              onChange={(e) => {
                                handlePlotData(e, index);
                              }}
                            />
                          </td>

                          <td>
                            <input
                              required
                              type='number'
                              name='other'
                              className='form-control'
                              value={plot.other}
                              onChange={(e) => {
                                handlePlotData(e, index);
                              }}
                            />
                          </td>

                          <td style={{ width: '120px' }}>
                            <input
                              readOnly
                              type='number'
                              name='cost'
                              className='form-control'
                              value={plot?.cost}
                              required
                            />
                          </td>

                          <td style={{ width: '110px' }}>
                            <select name='facing' className='custom-select'
                                    value={plot?.facing}
                                    onChange={(e) => handlePlotData(e, index)}
                            >
                              <option value=''>Select</option>
                              <option value='North'>North</option>
                              <option value='South'>South</option>
                              <option value='Center'>Center</option>
                              <option value='East'>East</option>
                              <option value='West'>West</option>
                            </select>
                          </td>

                          <td>
                            <input type='text' name='description' className='form-control'
                                   value={plot.description}
                                   onChange={(e) => handlePlotData(e, index)}
                            />
                          </td>

                          <td className='text-center'>
                            {index !== 0 &&
                              <DeleteOutline onClick={(e) => removePlotField(e, index)} />
                            }
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                    <div className='ml-3 btn btn-primary' onClick={addPlotField}><Add /> Add another {projectType}</div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <button className='btn btn-primary m-2' type='submit'>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlotTable;