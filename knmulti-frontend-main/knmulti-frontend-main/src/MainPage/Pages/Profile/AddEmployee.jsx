import { Add, Delete, Save } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// import { Avatar_02 } from '../../../Entryfile/imagepath';
import { getEmployee, updateEmployee } from '../../../lib/api';
import httpService from '../../../lib/httpService';
import { Blood, MARITAL_STATUS } from '../../../model/shared/maritalStates';
import FileUploadService from './FileUploadService';
// import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import DatePicker from 'react-date-picker';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';
// import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Form from 'react-bootstrap/Form';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Space } from 'antd';
import { useSelector } from 'react-redux';
const AddEmployee = () => {
  const authentication = useSelector((state) => state.authentication.value);
  const { isAdmin, isHR, isHRManager } = useSelector(
    (val) => val.authentication
  );
  // const [doj, Setdoj] = useState(new Date('05/01/2023'));
  const [employeeType, setEmployeeType] = useState([]);
  const { id } = useParams();
  const history = useHistory();
  const [isChecked, setIsChecked] = useState(false);

  const [roles, setRoles] = useState([]);
  const [locs, setLocs] = useState([]);
  const [depts, setDepts] = useState([]);
  const [UploadImageSet, setUploadImageSet] = useState();
  const [currentFile, setcurrentFile] = useState('');
  const [Expresume, setExpresume] = useState('');
  const [ctc, setCtc] = useState();
  // const [mctc, setmCtc] = useState();
  const [basicmctc, setBasicmCtc] = useState('');
  const [basicprce, setbasicprce] = useState(50);
  const [Houseprce, setHouseper] = useState(50);
  const [travelpercent, setTravelpercent] = useState(20);
  const [travelCtc, setTravelCtc] = useState('');
  const [travelCtcMonth, setTravelCtcMonth] = useState('');

  const [dearnessPercent, setDearnessPercent] = useState(20);
  const [dearnessCtc, setDearnessCtc] = useState('');
  const [dearnessCtcMonth, setDearnessCtcMonth] = useState('');

  const [medicalpercent, setMedicalpercent] = useState(10);
  const [medicalCtc, setMedicalCtc] = useState('');
  const [medicalCtcMonth, setMedicalCtcMonth] = useState('');
  const [basicctc, setBasicCtc] = useState('');
  const [HouseCtc, setHouseCtc] = useState('');
  const [HousemCtc, setHousemCtc] = useState('');

  // basic info

  const basicInfoObj = {
    firstName: '',
    middleName: '',
    blood: '',
    bankname: '',
    employmentType: '',
    lastName: '',
    email: '',
    dob: '',
    gender: '',
    mobileNo: '',
    salary: '',
    jobRole: '',
    totalLeaves: '',
    employeeType: '',
    workLocation: '',
    department: '',
    password: '',
    cnfPassword: '',
  };

  const [basicInfo, setBasicInfo] = useState(basicInfoObj);
  const [doj, Setdoj] = useState('');
  const [dob, Setdob] = useState('');

  const handleBasicInfo = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };
  const handleBasicInfoJoinDate = (e) => {
    setBasicInfo({ ...basicInfo, joinDate: e });
  };
  const fetchRoles = async () => {
    const roles = await httpService.get('/role');
    const locs = await httpService.get('/location');
    const depts = await httpService.get('/department');
    const employeeTypes001 = await httpService.get('/employee-type');
    setRoles(roles?.data);
    setLocs(locs?.data);
    setDepts(depts?.data);
    setEmployeeType(employeeTypes001?.data);
  };

  // other Details
  const otherDetailsObj = {
    passportNo: '',
    pfno: '',
    esino: '',
    passportExp: '',
    phoneNo: '',
    nationality: '',
    religion: '',
    maritalStatus: '',
    employmentOfSpouse: '',
    numberOfChildren: 0,
  };

  const [otherDetails, setOtherDetails] = useState(otherDetailsObj);

  const handleotherDetails = (e) => {
    setOtherDetails({ ...otherDetails, [e.target.name]: e.target.value });
  };

  // Bank details
  const bankDetailsObj = {
    bankdetails1: '',

    accountHoldersName: '',
    accountNumber: '',
    bankname: '',
    IFSC: '',
    upi: '',
  };

  const [bankDetails, setBankDetails] = useState(bankDetailsObj);

  // const handlebankDetails = (e) => {
  //   console.log('sas', e);
  //   setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  // };

  // Address
  const addressObj = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  };

  const [currentAddress, setCurrentAddress] = useState(addressObj);
  const [permanentAddress, setPermanentAddress] = useState(addressObj);

  const handleCurrentAddress = (e) => {
    setCurrentAddress({ ...currentAddress, [e.target.name]: e.target.value });
  };
  const handlePermanentAddress = (e) => {
    setCurrentAddress({ ...currentAddress, [e.target.name]: e.target.value });
  };

  const handleAddress = (e) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to ',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsChecked(!isChecked);
        if (isChecked === false) {
          setPermanentAddress({
            ...currentAddress,
          });
        } else {
          setPermanentAddress(addressObj);
        }
      } else {
        setIsChecked(false);
      }
    });
  };

  const { state } = useLocation();

  useEffect(() => {
    setIsChecked(false);
  }, []);

  //salary

  //Bank
  const bankDetailsObj11 = {
    bankdetails1: '',
    accountHoldersName: '',
    accountNumber: '',
    bankname: '',
    IFSC: '',
    upi: '',
    branch: '',
  };
  const bankDetailsObj111 = {
    bankdetails1: '',
    accountHoldersName: '',
    accountNumber: '',
    bankname: '',
    IFSC: '',
    upi: '',
    branch: '',
  };
  const [expIndex, setExpIndex] = useState();
  const [contactIndex, setcontactIndex] = useState();
  const [contacteditIndex, setContacteditIndex] = useState();

  const [bankeditIndex, setbankeditIndex] = useState();
  const [BankIndex, setBankIndex] = useState();

  const [expeditIndex, setExpeditIndex] = useState();
  const [edueditIndex, setEdueditIndex] = useState();
  const [educationIndex, setEducationIndex] = useState();
  const [educationLenght, setEducationLenght] = useState();

  const [lenghtbankDetail, setlenghtbankDetail] = useState();

  const handleBankDetails = (e, index) => {
    const updateBankD = bankDetail.map((bank1, i) => {
      if (index == i) {
        const uped = { ...bank1, [e.target.name]: e.target.value };
        return uped;
      } else {
        return bank1;
      }
    });

    setBankDetail([...updateBankD]);
  };

  const handleBankEdit = (e, index) => {
    const updateBankD = bankDetail.map((bank1, i) => {
      if (index == i) {
        const uped = { ...bank1, [e.target.name]: e.target.value };
        return uped;
      } else {
        return bank1;
      }
    });
    setbankDetailedit([...updateBankD]);
    setBankDetail([...updateBankD]);
  };

  const handleAnotherSetBank = () => {
    setBankIndex(476);
    setAddbankDetail(bankDetail.length);
    setBankDetail([...bankDetail, bankDetailsObj11]);
  };

  const handleEDitSetBank = (bank, index) => {
    setBankIndex(474);
    setbankeditIndex(index);
    // setbankDetailedit([bank]);
  };
  const [Statutaryedit, setStatutaryedit] = useState([]);

  const handleStatutary = () => {
    setStatutaryedit(555);
  };

  const handleCancelStatutary = () => {
    setStatutaryedit(585);
  };

  const handleRemoveBank = (e, index) => {
    const upedu = bankDetail.filter((edu, i) => index != i);
    setBankDetail(upedu);
  };
  // education
  const eductionTemplate = {
    qualification: '',
    instution: '',
    startDate: '',
    endDate: '',
    university: '',
    specialization: '',
    score: 0,
    gradingSystem: '',
  };

  // const [education, setEducation] = useState([eductionTemplate]);
  //
  const [education, setEducation] = useState([]);
  const [AddEducationDetail, setAddEducationDetail] = useState();
  // ///
  const [bankDetail, setBankDetail] = useState();
  const [AddbankDetail, setAddbankDetail] = useState();

  const addBankField = () => {
    setbankeditIndex(474);
    setAddbankDetail(bankDetail.length);
    setbankeditIndex(bankDetail.length);
    setBankDetail([...bankDetail, bankDetailsObj11]);
  };

  const removeBankField = (e, index) => {
    const updatedBank = bankDetail.filter((pct, i) => index !== i);
    setBankDetail(updatedBank);
  };

  const handleBank = (e, index) => {
    const updatedBank = bankDetail.map((pct, i) =>
      index == i ? Object.assign(pct, { [e.target.name]: e.target.value }) : pct
    );
    setBankDetail(updatedBank);
  };
  // ////
  // const [bankDetailedit, setbankDetailedit] = useState([]);
  const addEducationField = () => {
    setEducationIndex(474);
    setAddEducationDetail(education.length);
    setEdueditIndex(education.length);
    setEducation([...education, eductionTemplate]);
  };

  const removeEducationField = (e, index) => {
    const updatedEducation = education.filter((pct, i) => index !== i);
    setEducation(updatedEducation);
  };

  const handleEducation = (e, index) => {
    const updatedEducation = education.map((pct, i) =>
      index == i ? Object.assign(pct, { [e.target.name]: e.target.value }) : pct
    );
    setEducation(updatedEducation);
  };
  //
  const handleEDitEducation = (index) => {
    setEducationIndex(474);
    setEdueditIndex(index);
  };
  const handleEDitExperience = (index) => {
    setExpIndex(474);
    setExpeditIndex(index);
  };

  const handleEDitContact = (index) => {
    setcontactIndex(474);
    setContacteditIndex(index);
  };

  const handleEDitBank = (index) => {
    setBankIndex(474);
    setbankeditIndex(index);
  };
  const handleCancelContact = (index) => {
    setcontactIndex(476);
  };

  const handleEducationDetails = (e, index) => {
    const updateEdu = education.map((edu, i) => {
      if (index == i) {
        const uped = { ...edu, [e.target.name]: e.target.value };
        return uped;
      } else {
        return edu;
      }
    });
    setEducation([...updateEdu]);
  };
  const handleEducationDetails1 = (e, index) => {
    const updateEdu = education.map((edu, i) => {
      if (index == i) {
        const uped = { ...edu, startDate: e };
        return uped;
      } else {
        return edu;
      }
    });
    setEducation([...updateEdu]);
  };

  const handleEducationDetailsendDate = (e, index) => {
    const updateEdu = education.map((edu, i) => {
      if (index == i) {
        const uped = { ...edu, endDate: e };
        return uped;
      } else {
        return edu;
      }
    });

    setEducation([...updateEdu]);
  };

  const [educationAdd, seteducationAdd] = useState();
  const handleAnotherSet = () => {
    seteducationAdd(education.length);
    setEducationIndex(476);
    setEducation([...education, eductionTemplate]);
  };

  // console.log(educationAdd, 'educationLenght')

  const handleRemoveQualification = (e, index) => {
    // if (index == 0) {
    //   const upedu = education.filter((edu, i) => index != i);
    //   setEducation(upedu);
    // }
    const upedu = education.filter((edu, i) => index != i);
    setEducation(upedu);
  };
  // console.log(bankDetailedit, 'bankDetaileditbankDetailedit')
  // experience
  const experienceTemplate = {
    startDate: '',
    endDate: '',
    company: '',
    designation: '',
    responsibilities: '',
  };

  // //////
  const [experience, setExperience] = useState([]);
  const [AddExperienceDetail, setAddExperienceDetail] = useState();

  const addExperienceField = () => {
    setExpIndex(474);
    setAddExperienceDetail(experience.length);
    setExpeditIndex(experience.length);
    setExperience([...experience, experienceTemplate]);
  };

  const removeExperienceField = (e, index) => {
    const updatedExperience = personContact.filter((pct, i) => index !== i);
    setExperience(updatedExperience);
  };

  const handleExperience = (e, index) => {
    const updatedExperience = experience.map((pct, i) =>
      index == i ? Object.assign(pct, { [e.target.name]: e.target.value }) : pct
    );
    setExperience(updatedExperience);
  };

  const handleExpDetails = (e, index) => {
    const updateExp = experience.map((exp, i) => {
      if (index == i) {
        const upexp = { ...exp, [e.target.name]: e.target.value };
        return upexp;
      } else {
        return exp;
      }
    });
    setExperience([...updateExp]);
  };

  const handleExpStartDate = (e, index) => {
    const updateExp = experience.map((exp, i) => {
      if (index == i) {
        const upexp = { ...exp, startDate: e };
        return upexp;
      } else {
        return exp;
      }
    });
    setExperience([...updateExp]);
  };

  const handleExpEndDate = (e, index) => {
    const updateExp = experience.map((exp, i) => {
      if (index == i) {
        const upexp = { ...exp, endDate: e };
        return upexp;
      } else {
        return exp;
      }
    });
    setExperience([...updateExp]);
  };
  // const [expnAdd, setExpAdd] = useState();

  // const handleAnotherExp = () => {
  //   setExpIndex(476);
  //   setExpAdd(experience.length);
  //   setExperience([...experience, experienceTemplate]);
  // };

  // const handleRemove = (e, index) => {
  //   // if (index != 0) {
  //   //   const upepx = experience.filter((exp, i) => index != i);
  //   //   setExperience(upepx);
  //   // }
  //   const upepx = experience.filter((exp, i) => index != i);
  //   setExperience(upepx);
  // };

  // certificate
  const certificateTemplate = {
    title: '',
    cerificateFile: '',
    remark: '',
  };

  const [certificate, setCertificate] = useState([certificateTemplate]);

  const addCertificateField = () => {
    setCertificate([...certificate, certificateTemplate]);
  };

  const removeCertificateField = (e, index) => {
    if (index !== 0) {
      const updatedCertificate = certificate.filter((cert, i) => index !== i);
      setCertificate(updatedCertificate);
    }
  };

  // contacts
  const personContactTemplate = {
    name: '',
    relationship: '',
    phone: '',
  };
  const [personContact, setPersonContact] = useState([]);
  const [AddContactDetail, setAddContactDetail] = useState();

  const addPersonContactField = () => {
    setcontactIndex(474);
    setAddContactDetail(personContact.length);
    setContacteditIndex(personContact.length);
    setPersonContact([...personContact, personContactTemplate]);
  };

  const removePersonContactField = (e, index) => {
    // if (index !== 0) {
    //   const updatedPersonContact = personContact.filter(
    //     (pct, i) => index !== i
    //   );
    //   setPersonContact(updatedPersonContact);
    // }
    const updatedPersonContact = personContact.filter((pct, i) => index !== i);
    setPersonContact(updatedPersonContact);
  };

  const handlePersonContact = (e, index) => {
    const updatedPersonContact = personContact.map((pct, i) =>
      index == i ? Object.assign(pct, { [e.target.name]: e.target.value }) : pct
    );
    setPersonContact(updatedPersonContact);
  };

  const toInputUppercase = (e) => {
    e.target.value = ('' + e.target.value).toUpperCase();
  };

  const toCapitalize = (e) => {
    e.target.value =
      e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
  };
  function convert(str) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join('-');
  }

  const [total_months, settotal_months] = useState();
  const [total_ctc, settotal_ctc] = useState();

  useEffect(() => {
    const basicCtc_calu = (ctc * basicprce) / 100;
    const Housectccalcu = (basicCtc_calu * Houseprce) / 100;
    const travelpercentcal = (basicCtc_calu * travelpercent) / 100;
    const dearnessprcal = (basicCtc_calu * dearnessPercent) / 100;
    const medicalPerCal = (basicCtc_calu * medicalpercent) / 100;
    const basic = ctc / 2;
    const month = ctc / 12;
    const basicM = (month * basicprce) / 100;

    setBasicmCtc(basicM);
    setBasicCtc(basicCtc_calu);
    setHouseCtc(Housectccalcu);
    const house_month_calculate = (basicmctc * Houseprce) / 100;
    setHousemCtc(house_month_calculate);

    setTravelCtc(travelpercentcal);
    const travel_month_calculate = (basicmctc * travelpercent) / 100;
    setTravelCtcMonth(travel_month_calculate);

    setDearnessCtc(dearnessprcal);
    const dearnessprcal_month_cal = (basicmctc * dearnessPercent) / 100;
    setDearnessCtcMonth(dearnessprcal_month_cal);

    setMedicalCtc(medicalPerCal);
    const cal_medical_percent = (basicmctc * medicalpercent) / 100;
    setMedicalCtcMonth(cal_medical_percent);

    let final11 = Math.round(basicctc) + Math.round(HouseCtc);
    let final = ctc - final11;
    let final_month = Math.round(basicmctc) + Math.round(HousemCtc);
    let finalm = month - final_month;
    // console.log(final_month, fixedM_calc, finalm, 'final_month')

    settotal_months(
      Math.round(travelCtcMonth) +
        Math.round(medicalCtcMonth) +
        Math.round(dearnessCtcMonth) +
        Math.round(HousemCtc) +
        Math.round(basicmctc)
    );
    settotal_ctc(travelCtc + dearnessCtc + medicalCtc + HouseCtc + basicctc);
  });

  useEffect(async () => {
    const res = await getEmployee(id);
    setBasicInfo({
      employmentType: res?.employmentType,
      firstName: res?.firstName,
      blood: res?.blood,
      joinDate: res?.joinDate,
      middleName: res?.middleName,
      lastName: res?.lastName,
      email: res?.email,
      gender: res?.gender,
      mobileNo: res?.mobileNo,
      salary: res?.salary,
      userName: res?.userName,
      jobRole: res?.jobRole?._id,
      totalLeaves: res?.totalLeaves,
      employeeType: res?.employeeType,
      workLocation: res?.workLocation?._id,
      department: res?.department?._id,
    });

    setIsChecked(res?.addressChecked || false);
    // console.log(date.setDate(date.getDate() + 1), 'aaaaaaasas');
    Setdob(res?.dob);
    // Setdoj(new Date(moment(res?.joinDate.split('T')[0]).format("YYYY/MM/DD")))

    Setdoj(res?.joinDate);
    setCtc(res?.SALARYCOMPONENTS?.anualctc);
    // setmCtc(res?.SALARYCOMPONENTS?.montlyctc)
    setcurrentFile(res?.fileInfoPic);
    setExpresume(res?.resumeExp);
    setOtherDetails(res?.personalInformation);
    // setBankDetails(res?.bankDetails);
    setBankDetail(res?.bankDetails);

    setCurrentAddress(res?.currentAddress);
    setPermanentAddress(res?.permanentAddress);
    // setEducation(res?.education);
    // setExperience(res?.previousExperience);

    setPersonContact(res?.familyInformation || [personContactTemplate]);

    setHouseper(res?.SALARYCOMPONENTS?.housepercent || 50);
    setbasicprce(res?.SALARYCOMPONENTS?.basicpercent || 50);

    const updateExp1 = res?.previousExperience.map((data, i) => {
      const upexp = {
        ...data,
        startDate: new Date(data?.startDate),
        endDate: new Date(data?.endDate),
        company: data?.company,
        designation: data?.designation,
        responsibilities: data?.responsibilities,
      };

      return upexp;
    });
    setExperience([...updateExp1]);
    const updateEduca = res?.education.map((data, i) => {
      const upedu = {
        ...data,
        startDate: new Date(data?.startDate),
        endDate: new Date(data?.endDate),
        qualification: data?.qualification,
        instution: data?.instution,
        // university: data?.university,
        // specialization: data?.specialization,
        // score: data?.score,
        // gradingSystem: data?.gradingSystem,
      };
      return upedu;
    });
    setEducation(updateEduca);

    setEducationLenght(education?.length);
    setlenghtbankDetail(bankDetail?.length);
    fetchRoles();
  }, []);
  // console.log("--------------------------------", basicInfo)

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    })
      .then(async (result) => {
        if (result.isConfirmed) {
          if (basicInfo?.password !== basicInfo?.cnfPassword) {
            toast.error('Password and Confirm Password does not match');
            return;
          }

          if (!basicInfo?.firstName.trim()) {
            toast.error('Enter first-Name');
            return;
          }
          if (!basicInfo?.lastName.trim()) {
            toast.error('Enter Last Name');
            return;
          }
          if (!basicInfo?.lastName.trim()) {
            toast.error('Enter lastName');
            return;
          }
          if (!basicInfo?.mobileNo) {
            toast.error('Enter mobileNo');
            return;
          }
          if (!basicInfo?.email) {
            toast.error('Enter email');
            return;
          }
          if (!basicInfo?.gender) {
            toast.error('Enter gender');
            return;
          }
          if (!basicInfo?.jobRole) {
            toast.error('Enter job Role');
            return;
          }
          if (!basicInfo?.mobileNo) {
            toast.error('Enter mobile Number');
            return;
          }
          if (basicInfo?.mobileNo.length >= 11) {
            toast.error('Mobile Number Must be 10');
            return;
          }
          if (
            !basicInfo?.workLocation ||
            basicInfo?.workLocation === 'Please Select Location'
          ) {
            toast.error('Enter work Location');
            return;
          }
          if (!basicInfo?.employeeType) {
            toast.error('Enter employee Type');
            return;
          }
          const SALARYCOMPONENTS = {
            anualctc: +ctc,
            travelpercent,
            dearnessPercent,
            medicalpercent,
            basicpercent: basicprce,
            housepercent: Houseprce,
            montlyctc: basicmctc,
            DA: dearnessCtcMonth,
            MA: medicalCtcMonth,
            TA: travelCtcMonth,
            M_HRA: HousemCtc,
          };
          let ExperienceResume = [];
          if (Expresume.length) {
            ExperienceResume = await FileUploadService.upload(Expresume);
          }
          const employeeDetails = {
            ...basicInfo,
            SALARYCOMPONENTS: SALARYCOMPONENTS,
            resumeExp: ExperienceResume?.data,
            fileInfoPic: UploadImageSet?.data,
            personalInformation: otherDetails,
            // bankDetails,
            addressChecked: isChecked,
            bankDetails: bankDetail,
            dob: dob,
            // joinDate: doj,
            currentAddress,
            permanentAddress,
            education,
            familyInformation: personContact,
            // previousExperience: experience,
            // emergencyContact: personContact,
          };

          toast
            .promise(
              updateEmployee(id, employeeDetails),
              // history.goBack();
              {
                error: 'Failed to Updating Employee Details',
                success: 'Employee Updated successfully',
                pending: 'Updating Employee Details ...',
              }
            )
            .then((res) => {
              dispatch(
                createNotify({
                  notifyHead: `Purchase Order ${res?.data?.purchaseOrderNo}`,
                  notifyBody: `Purchase Order ${res?.data?.purchaseOrderNo} got created`,
                  createdBy: empId,
                })
              );
              history.goBack();
            });
          updateEmployee(id, employeeDetails).then((res) => {
            history.goBack();
          });
        }
      })
      .catch((err) => {
        console.log(err.response);
      });
  };
  const handleSaveEXP = (exp, index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const employeeDetails = {
          ...basicInfo,
          previousExperience: experience,
        };
        updateEmployee(id, employeeDetails).then((res) => {
          setExpIndex(475);
          toast.success('Experience Data is Saved');
          // history.goBack();
        });
      }
    });
  };
  const handleSaveContact = (contact, index) => {
    if (!contact.name) {
      return toast.error(`Please enter name at ${++index}th row`);
    } else if (!contact.relationship) {
      return toast.error(`Please enter relationship at ${++index}th row`);
    } else if (
      !contact.phone ||
      !RegExp('[6-9][0-9]{9}').test(contact?.phone)
    ) {
      return toast.error(
        `Phone at ${++index}th row must not be empty and should starts with 6-9 and remaining 9 digit with 0-9`
      );
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const employeeDetails = {
          ...basicInfo,
          // education,
          familyInformation: personContact,
        };
        updateEmployee(id, employeeDetails).then((res) => {
          setcontactIndex(475);
          toast.success('Contact Data is Save');
          // history.goBack();
        });
      }
    });
  };
  const handleSaveEducation = (education, index) => {
    if (!education.qualification) {
      return toast.error(`Please enter qualification at ${++index}th row`);
    } else if (!education.instution) {
      return toast.error(`Please enter instution at ${++index}th row`);
    } else if (!education.university) {
      return toast.error(`Please enter instution at ${++index}th row`);
    } else if (!education.gradingSystem) {
      return toast.error(`Please enter grading system at ${++index}th row`);
    } else if (!education.specialization) {
      return toast.error(`Please enter specialization at ${++index}th row`);
    } else if (!education.score) {
      return toast.error(`Please enter score at ${++index}th row`);
    }

    // console.log('save');
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const employeeDetails = {
          ...basicInfo,
          education,
        };
        updateEmployee(id, employeeDetails).then((res) => {
          setEducationIndex(475);
          toast.success('Education Data is Saved');
          // history.goBack();
        });
      }
    });
  };

  const handleEduStartDate = (e, index) => {
    const updateEdu = education.map((exp, i) => {
      if (index == i) {
        const upexp = { ...exp, startDate: e };
        return upexp;
      } else {
        return exp;
      }
    });
    setEducation([...updateEdu]);
  };

  const handleEduEndDate = (e, index) => {
    const updateEdu = education.map((exp, i) => {
      if (index == i) {
        const upexp = { ...exp, endDate: e };
        return upexp;
      } else {
        return exp;
      }
    });
    setEducation([...updateEdu]);
  };

  const handleCancelEducation = () => {
    setEdueditIndex(475);
  };
  const handleCancelBank = () => {
    setBankIndex(475);
  };

  const handleCancelEXP = () => {
    setExpIndex(475);
  };
  // console.log('1111sasaAfter', bankeditIndex);
  const handleSaveBank = () => {
    // console.log('save');
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const employeeDetails = {
          ...basicInfo,
          bankDetails: bankDetail,
        };
        updateEmployee(id, employeeDetails).then((res) => {
          setBankIndex(475);
          toast.success('bank Data is Save1');
          // history.goBack();
        });
      }
    });
  };
  const handleSaveStatutory = (e) => {
    // console.log('save');
    e.preventDefault();

    Swal.fire({
      title: 'Are you sure?',
      text: '  sure you want to save these details?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const employeeDetails = {
          ...basicInfo,
          personalInformation: otherDetails,
        };
        updateEmployee(id, employeeDetails).then((res) => {
          setStatutaryedit(585);
          toast.success('Statutary Data is Save');
          // history.goBack();
        });
      }
    });
  };
  const UploadImage = async () => {
    if (currentFile?.name) {
      const filedata = await FileUploadService.upload(currentFile);
      setUploadImageSet(filedata);
      toast.success('image uploaded successfully');
    } else {
      setUploadImageSet(currentFile);
    }
  };

  // console.log(basicInfo?.employmentType, 'basicInfo?.employmentType')

  let stateArr = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttarakhand',
    'Uttar Pradesh',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli',
    'Daman and Diu',
    'Delhi',
    'Lakshadweep',
    'Puducherry',
  ];
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Edit Employee</title>
        <meta name="description" content="Edit employee" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Edit Employee</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/app/employee/employees-list">Employees</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={`/app/profile/employee-profile/${id}`}>
                    {basicInfo?.firstName}
                  </Link>
                </li>
                <li className="breadcrumb-item">Edit employee</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <form onSubmit={handleSubmit}>
              {/* <div className="row">
                <div className="col-md-12">
                  <div className="profile-img-wrap edit-img">
                    <img
                      className="inline-block"
                      src={Avatar_02}
                      alt="user"
                    />
                    <div className="fileupload btn">
                      <span className="btn-text">edit</span>
                      <input className="upload" type="file" />
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      required
                      name="firstName"
                      type="text"
                      className="form-control"
                      value={basicInfo?.firstName}
                      onChange={handleBasicInfo}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Middle Name</label>
                    <input
                      name="middleName"
                      type="text"
                      className="form-control"
                      value={basicInfo?.middleName}
                      onChange={handleBasicInfo}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      // required
                      name="lastName"
                      type="text"
                      className="form-control"
                      value={basicInfo?.lastName}
                      onChange={handleBasicInfo}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      value={basicInfo?.email}
                      onChange={handleBasicInfo}
                    />
                  </div>
                </div>

                {/* {basicInfo?.dob} */}

                <div className="col-md-3">
                  <div className="form-group">
                    <label>Date of Joining</label>
                    <div>
                      <DatePicker
                        className="form-control"
                        value={
                          basicInfo.joinDate && new Date(basicInfo.joinDate)
                        }
                        onChange={handleBasicInfoJoinDate}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    {/* {basicInfo?.dob?.split('T')[0]} */}

                    <div>
                      <DatePicker
                        className="form-control"
                        // style={{ border: 'none', backgroundColor: 'red' }}
                        type="date"
                        style={{ backgroundColor: 'red' }}
                        // value={dob}
                        maxDate={
                          new Date(new Date() - 18 * 365 * 24 * 60 * 60 * 1000)
                        }
                        value={basicInfo.dob && new Date(basicInfo.dob)}
                        onChange={(e) => {
                          setBasicInfo({
                            ...basicInfo,
                            dob: e,
                          });
                        }}
                      />
                    </div>
                    {/* {age <= 18 ? (
                      <span className="text-danger">Age Must be 18</span>
                    ) : (
                      ''
                    )} */}
                  </div>
                </div>
                {/* <div className="col-md-3">
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      // style={{ backgroundColor: "red" }}
                      className="form-control"
                      value={age}
                      onChange={handleBasicInfo}
                      disabled
                    />
                  </div>
                </div> */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Gender <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      name="gender"
                      value={basicInfo?.gender}
                      onChange={handleBasicInfo}
                    >
                      <option value="">Please Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHERS">Others</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Employee ID</label>

                    <input
                      type="number"
                      className="form-control"
                      value={id}
                      onChange={handleBasicInfo}
                      disabled
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      className="custom-select"
                      required
                      name="department"
                      value={basicInfo?.department}
                      onChange={handleBasicInfo}
                    >
                      <option> --Please Select Department-- </option>
                      {depts?.map((dept, index) => (
                        <option key={index} value={dept?._id}>
                          {dept?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Job Role
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      required
                      name="jobRole"
                      value={basicInfo?.jobRole}
                      onChange={handleBasicInfo}
                    >
                      <option value=""> --- Please Select job role --- </option>
                      {roles
                        ?.filter(
                          (e) => e.department?._id == basicInfo.department
                        )
                        .map((r, index) => (
                          <option key={index} value={r?._id}>
                            {r?.name} - {r?.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Employee Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      name="employeeType"
                      value={basicInfo?.employeeType?._id}
                      onChange={handleBasicInfo}
                    >
                      <option value="">
                        {basicInfo?.employeeType?.employeeTypeName || 'Select'}
                      </option>
                      {employeeType?.map((r, index) => (
                        <option key={index} value={r?._id}>
                          {r.employeeTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Work Location <span className="text-danger">*</span>
                    </label>
                    <select
                      className="custom-select"
                      name="workLocation"
                      value={basicInfo?.workLocation}
                      onChange={handleBasicInfo}
                    >
                      <option value={'Please Select Location'}>
                        Please Select Location
                      </option>
                      {locs?.map((loc, index) => (
                        <option key={index} value={loc?._id}>
                          {loc?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      name="mobileNo"
                      type="tel"
                      className="form-control"
                      value={basicInfo?.mobileNo}
                      onChange={handleBasicInfo}
                      // maxLength={10}
                      required
                      minLength={9}
                    />
                  </div>
                  {basicInfo?.mobileNo.length >= 11 ? (
                    <span className="text-danger">
                      Phone Number Must be 10
                      <br></br>
                    </span>
                  ) : (
                    ''
                  )}
                  <br></br>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>Religion</label>
                    <div>
                      <input
                        className="form-control"
                        type="text"
                        name="religion"
                        value={otherDetails?.religion}
                        onChange={handleotherDetails}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Marital Status</label>
                    <select
                      className="custom-select"
                      name="maritalStatus"
                      value={otherDetails?.maritalStatus}
                      onChange={handleotherDetails}
                    >
                      <option value={''}>Select Status</option>
                      {MARITAL_STATUS.map((m, index) => (
                        <option key={index} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group" role="button">
                    <label>Employment Type</label>
                    <select
                      className="custom-select"
                      role="button"
                      // value={basicInfo?.department}
                      onChange={handleBasicInfo}
                      name="employmentType"
                      value={basicInfo?.employmentType}
                      // onChange={(e) => {
                      //   setEmployeeToAdd({
                      //     ...employeeToAdd,
                      //     employmentType: e.target.value,
                      //   });
                      // }}
                    >
                      <option value={''}>Please Select Employment Type</option>
                      <option>Full Time</option>
                      <option>Part Time</option>
                      <option>Contractual</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>Blood Group</label>

                    <select
                      className="custom-select"
                      name="blood"
                      value={basicInfo?.blood}
                      // value={otherDetails?.maritalStatus}
                      onChange={handleBasicInfo}
                    >
                      <option>Select Status</option>
                      {Blood.map((m, index) => (
                        <option key={index} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Number of Kids</label>
                    <input
                      disabled={
                        otherDetails?.maritalStatus === '' ||
                        otherDetails?.maritalStatus === MARITAL_STATUS[0]
                      }
                      className="form-control"
                      type="number"
                      name="numberOfChildren"
                      value={otherDetails?.numberOfChildren}
                      onChange={handleotherDetails}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Employment of Spouse</label>
                    <input
                      disabled={
                        otherDetails?.maritalStatus === '' ||
                        otherDetails?.maritalStatus === MARITAL_STATUS[0]
                      }
                      className="form-control"
                      type="text"
                      name="employmentOfSpouse"
                      value={otherDetails?.employmentOfSpouse}
                      onChange={handleotherDetails}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Upload your Pic</label>
                    <div className="custom-file">
                      <input
                        name="resumeFile"
                        type="file"
                        className="custom-file-input"
                        id="cv_upload"
                        value={currentFile?.fileName}
                        onChange={(e) => setcurrentFile(e.target.files[0])}
                      />
                      <label
                        className="custom-file-label"
                        htmlFor="cv_upload"
                        value={currentFile?.fileName}
                      >
                        {currentFile[0]?.fileName ||
                        currentFile?.name ||
                        currentFile[0]?.fileName ? (
                          <span className="">
                            {currentFile?.name} {currentFile[0]?.fileName}{' '}
                            {currentFile?.fileName}{' '}
                          </span>
                        ) : (
                          'Choose file'
                        )}

                        {currentFile[0]?.fileName
                          ? currentFile[0]?.fileName
                          : 'Choose file'}
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-info"
                    //  onClick={UploadImage()}
                    onClick={() => UploadImage()}
                  >
                    Upload
                  </button>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      className="form-control"
                      type="text"
                      name="password"
                      value={basicInfo?.password}
                      onChange={handleBasicInfo}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      className="form-control"
                      type="text"
                      name="password"
                      value={basicInfo?.cnfPassword}
                      onChange={(e) => {
                        setBasicInfo({
                          ...basicInfo,
                          cnfPassword: e.target.value,
                        });
                      }}
                      // onChange={handleBasicInfo}
                    />
                  </div>
                </div>
              </div>

              {/* Tabs  */}
              <div className="">
                <div className="card card-no-hover tab-box">
                  <div className="row user-tabs">
                    <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                      <ul className="nav nav-tabs nav-tabs-bottom">
                        {isAdmin || isHR || isHRManager ? (
                          <li className="nav-item">
                            <a
                              href="#emp_salary"
                              data-toggle="tab"
                              className="nav-link active"
                              // className={showTrx ? "nav-link active" : "nav-link" }
                            >
                              Salary Components
                            </a>
                          </li>
                        ) : null}
                        <li className="nav-item">
                          <a
                            href="#emp_other_details"
                            data-toggle="tab"
                            className="nav-link"
                            // onClick={(e) => setShowTrx(!showTrx)}
                          >
                            {/* STATUTARY DETAIILS */}
                            Statutary Details
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#emp_bank"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Bank Details
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#emp_address"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            {/* CONTACT ADDRESS */}
                            Contact Address
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#emp_edu"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Education
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="#emp_exp"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Experience
                          </a>
                        </li>
                        {/* <li className="nav-item">
                          <a
                            href="#emp_cert"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Certificates
                          </a>
                        </li> */}
                        <li className="nav-item">
                          <a
                            href="#emp_contact"
                            data-toggle="tab"
                            className="nav-link"
                            // className={showTrx ? "nav-link active" : "nav-link" }
                          >
                            Contacts
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  minHeight: '65vh',
                  maxHeight: '65vh',
                  overflowY: 'auto',
                }}
                className="card p-4 tab-content"
              >
                {/* Others Details  */}
                <div className="tab-pane fade show" id="emp_other_details">
                  <div className="">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="col-form-label">PAN:</label>
                          <input
                            required
                            readOnly={!(Statutaryedit === 555)}
                            className="form-control"
                            type="text"
                            name="pan"
                            pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}"
                            title="Please enter valid Pan number. E.g. AAAAA1234A"
                            value={otherDetails?.pan}
                            placeholder="PAN"
                            onInput={toCapitalize}
                            onChange={handleotherDetails}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="col-form-label">Passport No:</label>
                          <input
                            required
                            readOnly={!(Statutaryedit === 555)}
                            className="form-control"
                            type="text"
                            maxLength={10}
                            pattern="[a-zA-Z]{1}[0-9]{7}"
                            // pattern="[a-zA-Z]{2}[0-9]{5}[a-zA-Z]{1}"
                            title="Please enter valid Passport number. E.g. A2190457"
                            name="passportNo"
                            value={otherDetails?.passportNo}
                            placeholder="Passport No"
                            onChange={handleotherDetails}
                            onInput={toCapitalize}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="col-form-label">PF Number:</label>
                          <input
                            required
                            readOnly={!(Statutaryedit === 555)}
                            type="text"
                            maxLength={10}
                            pattern="[0-9]{7}"
                            title="Please enter valid Pf number. E.g. 0543211"
                            className="form-control"
                            name="pfno"
                            placeholder="PF Number"
                            onChange={handleotherDetails}
                            value={otherDetails?.pfno}
                            onInput={toCapitalize}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="col-form-label">ESI Number:</label>
                          <input
                            required
                            readOnly={!(Statutaryedit === 555)}
                            className="form-control"
                            pattern="[0-9]{17}"
                            placeholder="ESI Number"
                            onChange={handleotherDetails}
                            title="Please enter valid ESI Number. E.g. 99558565759955664"
                            name="esino"
                            maxLength={17}
                            type="tel"
                            value={otherDetails?.esino}
                            // onChange={(e) => handlePersonContact(e, index)}
                            onInput={toCapitalize}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-3 d-flex">
                        {Statutaryedit === 555 ? (
                          <Space size={'small'}>
                            <div
                              className="btn btn-primary "
                              onClick={(e) => handleSaveStatutory(e)}
                            >
                              <Save /> Save
                            </div>
                            <button
                              className="btn btn-secondary"
                              // onClick={(e) =>
                              //   removePersonContactField(e, index)
                              // }
                              onClick={(e) => handleCancelStatutary()}
                            >
                              <CancelIcon /> Cancel
                            </button>
                          </Space>
                        ) : (
                          <Space size={'small'}>
                            <div
                              className="btn btn-info"
                              // onClick={() => handleEDitContact(index)}
                              onClick={() => handleStatutary()}
                            >
                              <EditIcon /> Edit
                            </div>
                          </Space>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SALARY COMPONENTS */}
                <div className="tab-pane fade show active" id="emp_salary">
                  <div className="row">
                    <div className="col-md-4">
                      <label>
                        Annual CTC <span className="text-danger">*</span>{' '}
                      </label>
                    </div>
                    <div className="col-md-4">
                      <div className="row">
                        <div
                          className="col-md-2"
                          style={{ marginTop: '10px', marginRight: '-10px' }}
                        >
                          <span
                            className="input-group-addon"
                            style={{ width: '400px' }}
                          >
                            ₹
                          </span>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <input
                              type="text"
                              name="year_ctc"
                              value={ctc}
                              className="form-control"
                              onChange={(e) => setCtc(e.target.value)}
                              Edit
                              required
                              Employee // value={SALARYCOMPONENTS?.anualctc}
                            />
                          </div>
                        </div>
                        <div className="col-md-4" style={{ marginTop: '10px' }}>
                          per year
                        </div>
                      </div>
                    </div>
                    {/* <div className="col-md-4">
                      <div className="form-group">
                        <label>MONTHLY CTC</label>
                        <input
                          type="number"
                          name="monthly_ctc"
                          className="form-control"
                          // onChange={(e) => setmCtc(e.target.value)}
                          // value={mctc}
                        // value={bankDetails?.accountNumber}
                        />
                      </div>
                    </div> */}
                  </div>
                  <div className="row">
                    <div className="col-md-3" style={{ marginTop: '10px' }}>
                      Salary Components
                    </div>
                    <div className="col-md-3" style={{ marginTop: '10px' }}>
                      Calculation Type
                    </div>
                    <div className="col-md-3" style={{ marginTop: '10px' }}>
                      Monthly Amount
                    </div>
                    <div className="col-md-3" style={{ marginTop: '10px' }}>
                      Annual Amount
                    </div>
                  </div>
                  <hr></hr>

                  <div className="row">
                    <div className="col-md-3">
                      <p>Basic</p>
                    </div>
                    <div className="col-md-3">
                      <div className="row">
                        <div className="col-md-6">
                          <input
                            type="number"
                            className="form-control"
                            value={basicprce}
                            onChange={(e) => setbasicprce(e.target.value)}
                          />
                        </div>
                        <div
                          className="col-md-6"
                          style={{ marginLeft: '117px', marginTop: '-34px' }}
                        >
                          <span
                            className="input-group-addon"
                            style={{ width: '40px' }}
                          >
                            % of CTC
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(basicmctc) || 0}</p>
                    </div>
                    <div className="col-md-2">
                      <p>{Math.round(basicctc) || 0}</p>
                    </div>
                  </div>
                  <br></br>
                  <div className="row">
                    <div className="col-md-3">
                      <p>House Rent Allowance</p>
                    </div>
                    <div className="col-md-3">
                      <div className="row">
                        <div className="col-md-6">
                          <input
                            type="number"
                            className="form-control"
                            value={Houseprce}
                            // value={basicInfo.name}
                            onChange={(e) => setHouseper(e.target.value)}
                          />
                        </div>
                        <div
                          className="col-md-6"
                          style={{ marginLeft: '120px', marginTop: '-34px' }}
                        >
                          <span
                            className="input-group-addon"
                            style={{ width: '40px' }}
                          >
                            {' '}
                            % &nbsp; Basic
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(HousemCtc) || 0}</p>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(HouseCtc) || 0}</p>
                    </div>
                  </div>
                  <br></br>
                  <div className="row">
                    <div className="col-md-3">
                      <p>Travel Allowance</p>
                    </div>
                    <div className="col-md-3">
                      <div className="row">
                        <div className="col-md-6">
                          <input
                            type="number"
                            className="form-control"
                            value={travelpercent}
                            onChange={(e) => setTravelpercent(e.target.value)}
                          />
                        </div>
                        <div
                          className="col-md-6"
                          style={{ marginLeft: '120px', marginTop: '-34px' }}
                        >
                          <span
                            className="input-group-addon"
                            style={{ width: '40px' }}
                          >
                            {' '}
                            % &nbsp; Basic
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(travelCtcMonth) || 0}</p>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(travelCtc) || 0}</p>
                    </div>
                  </div>
                  <br></br>
                  <div className="row">
                    <div className="col-md-3">
                      <p>Dearness Allowance</p>
                    </div>
                    <div className="col-md-3">
                      <div className="row">
                        <div className="col-md-6">
                          <input
                            type="number"
                            className="form-control"
                            value={dearnessPercent}
                            onChange={(e) => setDearnessPercent(e.target.value)}
                          />
                        </div>
                        <div
                          className="col-md-6"
                          style={{ marginLeft: '120px', marginTop: '-34px' }}
                        >
                          <span
                            className="input-group-addon"
                            style={{ width: '40px' }}
                          >
                            {' '}
                            % &nbsp; Basic
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(dearnessCtcMonth) || 0}</p>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(dearnessCtc) || 0}</p>
                    </div>
                  </div>
                  <br></br>
                  <div className="row">
                    <div className="col-md-3">
                      <p>Medical Allowance</p>
                    </div>
                    <div className="col-md-3">
                      <div className="row">
                        <div className="col-md-6">
                          <input
                            type="number"
                            className="form-control"
                            value={medicalpercent}
                            onChange={(e) => setMedicalpercent(e.target.value)}
                          />
                        </div>
                        <div
                          className="col-md-6"
                          style={{ marginLeft: '120px', marginTop: '-34px' }}
                        >
                          <span
                            className="input-group-addon"
                            style={{ width: '40px' }}
                          >
                            {' '}
                            % &nbsp; Basic
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(medicalCtcMonth) || 0}</p>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(medicalCtc) || 0}</p>
                    </div>
                  </div>
                  <br></br>
                  {/* <div className="row">
                    <div className="col-md-3">
                      <p>Conveyance Allowance</p>
                    </div>
                    <div className="col-md-3">Fixed Amount</div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        // name="monthly_ctc"
                        className="form-control"
                        onChange={(e) => setConveyanceM(e.target.value)}
                        value={ConveyanceM}
                      /> */}
                  {/* <p>{ConveyanceM || 0}</p> */}
                  {/* <p>{ConveyanceCTC || 0}</p> */}
                  {/* </div>
                    <div className="col-md-3">
                      <p>{ConveyanceCTC || 0}</p>
                    </div>
                  </div> */}
                  <br></br>
                  {/* <div className="row">
                    <div className="col-md-3">
                      <p>Fixed Allowance</p>
                    </div>
                    <div className="col-md-3">Fixed Amount</div>
                    <div className="col-md-3">
                      <p>{Math.round(fixedMCtc) || 0}</p>
                    </div>
                    <div className="col-md-3">
                      <p>{Math.round(fixedCtc) || 0}</p>
                    </div>
                  </div> */}

                  <br></br>
                  <div className="row">
                    <div className="col-md-3">
                      <h3>Cost to Company</h3>
                    </div>
                    <div className="col-md-3"></div>
                    <div className="col-md-3">₹ {total_months}</div>
                    <div className="col-md-3">₹ {total_ctc}</div>
                  </div>

                  <br />
                  {ctc > 0 ? (
                    ''
                  ) : (
                    <div className="row borderdesign">
                      <div className="col-md-1">
                        <div className=" errorborder">
                          <div
                            style={{
                              backgroundColor: '#fef2f2',
                              padding: '7px',
                            }}
                          >
                            <ErrorOutlineIcon></ErrorOutlineIcon>
                          </div>
                        </div>
                        {/* <h3>Fixed Cases</h3> */}
                      </div>
                      <div className="col-md-5 ">
                        <h4>System Calculated Components' Total</h4>
                        <span>
                          Amount must be greater than zero.
                          {/* Adjust the CTC or any of the component's amount */}
                        </span>
                      </div>
                      {/* <div className='col-md-3'></div> */}
                      <div style={{ color: 'red' }} className="col-md-3">
                        ₹ {0}
                      </div>
                      <div style={{ color: 'red' }} className="col-md-3">
                        ₹ {0}
                      </div>
                    </div>
                  )}

                  {/*fixedCtc > 0 ? "system" :
                    <div className='row borderdesign'>
                      {/* <div className=' errorborder'>
                        <div style={{ backgroundColor: '#fef2f2', padding: '7px' }}>
                          <ErrorOutlineIcon></ErrorOutlineIcon>
                        </div>
                      </div> 
                      <div className=''>
                        <div className='col-md-5 '>
                          <h4>System Calculated Components' Total</h4>
                          {/* <span>Amount must be greater than zero. */}
                  {/* Adjust the CTC or any of the component's amount */}
                  {/* </span> 
                        </div>
                        {/* <div className='col-md-3'></div> 
                        <div className='col-md-3'>₹ {total_months}</div>
                        <div className='col-md-3'>₹ {total_ctc}</div>
                      </div>
                    </div>*/}
                </div>

                {/* Bank Deatails  */}

                <div className="tab-pane fade show" id="emp_bank">
                  {bankDetail?.map((p, index) => (
                    <div key={index}>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">Bank Name:</label>
                            <input
                              required
                              readOnly={
                                !(bankeditIndex === index && BankIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              name="bankname"
                              value={p?.bankname}
                              onChange={(e) => handleBank(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Account Number:
                            </label>
                            <input
                              required
                              readOnly={
                                !(bankeditIndex === index && BankIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              pattern="[0-9]{11}"
                              maxLength={11}
                              title="Please enter valid Account Code. E.g. 52520065104"
                              name="accountNumber"
                              value={p?.accountNumber}
                              onChange={(e) => handleBank(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Account Holder:
                            </label>
                            <input
                              required
                              readOnly={
                                !(bankeditIndex === index && BankIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              name="accountHoldersName"
                              value={p?.accountHoldersName}
                              onChange={(e) => handleBank(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">Branch:</label>
                            <input
                              required
                              readOnly={
                                !(bankeditIndex === index && BankIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              name="branch"
                              value={p?.branch}
                              onChange={(e) => handleBank(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">IFSC:</label>
                            <input
                              required
                              readOnly={
                                !(bankeditIndex === index && BankIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              maxLength={11}
                              pattern="[a-zA-Z]{4}[0-9]{7}"
                              // pattern="[a-zA-Z]{2}[0-9]{5}[a-zA-Z]{1}"
                              title="Please enter valid IFSC Code. E.g. ABHY0065104"
                              name="IFSC"
                              value={p?.IFSC}
                              onChange={(e) => handleBank(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">UPI ID:</label>
                            <input
                              required
                              readOnly={
                                !(bankeditIndex === index && BankIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              name="upi"
                              value={p?.upi}
                              onChange={(e) => handleBank(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>

                        <div className="col-md-3 d-flex">
                          {bankeditIndex === index && BankIndex === 474 ? (
                            <Space size={'small'}>
                              <div
                                className="btn btn-primary "
                                onClick={(e) => handleSaveBank(p, index)}
                              >
                                <Save /> Save
                              </div>
                              <button
                                className="btn btn-secondary"
                                onClick={(e) => removeBankField(e, index)}
                              >
                                <Delete /> Delete
                              </button>
                            </Space>
                          ) : (
                            <Space size={'small'}>
                              <div
                                className="btn btn-info"
                                onClick={() => handleEDitBank(index)}
                              >
                                <EditIcon /> Edit
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => removeBankField(e, index)}
                              >
                                <Delete /> Delete
                              </button>
                            </Space>
                          )}
                        </div>
                      </div>

                      <hr />

                      <br />
                    </div>
                  ))}
                  <div className="row">
                    <div className="col-md-12 col-sm-12">
                      <div className="btn btn-primary" onClick={addBankField}>
                        + Add Bank
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address  */}

                <div className="tab-pane fade show" id="emp_address">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          Present Address
                        </label>
                        <textarea
                          className="form-control"
                          cols="10"
                          rows="2"
                          placeholder="House No, Street"
                          name="addressLine1"
                          value={currentAddress?.addressLine1}
                          onChange={handleCurrentAddress}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={currentAddress?.city}
                          onChange={handleCurrentAddress}
                          onInput={toCapitalize}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">State</label>
                        <select
                          style={{ height: '44px' }}
                          className="custom-select"
                          name="state"
                          value={currentAddress?.state}
                          onChange={handleCurrentAddress}
                        >
                          <option value=""></option>
                          {stateArr.map((a) => (
                            <option value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">Pincode</label>
                        <input
                          type="tel"
                          maxLength={6}
                          className="form-control"
                          name="postalCode"
                          value={currentAddress?.postalCode}
                          onChange={handleCurrentAddress}
                        />
                      </div>
                    </div>
                  </div>
                  {/* {isChecked} */}
                  {['checkbox'].map((type) => (
                    <div
                      //  key={`default-${type}`}
                      className="col-mb-3"
                    >
                      <Form.Check
                        onChange={handleAddress}
                        checked={isChecked}
                        type={'checkbox'}
                        id={`default-checkbox`}
                        label={`Same as Present `}
                      />
                    </div>
                  ))}

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          {' '}
                          Permanent Address
                        </label>
                        <textarea
                          className="form-control"
                          cols="10"
                          rows="2"
                          placeholder="House No, Street"
                          name="addressLine1"
                          value={permanentAddress?.addressLine1}
                          onChange={handlePermanentAddress}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={permanentAddress?.city}
                          onChange={handlePermanentAddress}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">State</label>
                        <select
                          style={{ height: '44px' }}
                          className="custom-select"
                          name="state"
                          value={permanentAddress?.state}
                          onChange={handlePermanentAddress}
                        >
                          <option value=""></option>
                          {stateArr.map((a) => (
                            <option value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="col-form-label">Pincode</label>
                        <input
                          type="tel"
                          maxLength={6}
                          className="form-control"
                          name="postalCode"
                          value={permanentAddress?.postalCode}
                          onChange={handlePermanentAddress}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">Local Contact</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="localcontact"
                          value={basicInfo?.localcontact}
                          maxLength={10}
                          onChange={(e) => {
                            setBasicInfo({
                              ...basicInfo,
                              localContact: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          {' '}
                          Emergency Contact
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="emergencyContact"
                          maxLength={10}
                          value={basicInfo?.emergencyContact}
                          onChange={(e) => {
                            setBasicInfo({
                              ...basicInfo,
                              emergencyContact: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tab-pane fade show" id="emp_edu">
                  {education?.map((p, index) => (
                    <div key={index}>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Qualification:
                            </label>
                            <input
                              required
                              readOnly={
                                !(
                                  edueditIndex === index &&
                                  educationIndex === 474
                                )
                              }
                              className="form-control"
                              type="text"
                              name="qualification"
                              value={p?.qualification}
                              onChange={(e) => handleEducation(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">Instution:</label>
                            <input
                              required
                              readOnly={
                                !(
                                  edueditIndex === index &&
                                  educationIndex === 474
                                )
                              }
                              className="form-control"
                              type="text"
                              name="instution"
                              value={p?.instution}
                              onChange={(e) => handleEducation(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              University:
                            </label>
                            <input
                              required
                              readOnly={
                                !(
                                  edueditIndex === index &&
                                  educationIndex === 474
                                )
                              }
                              className="form-control"
                              type="text"
                              name="university"
                              value={p?.university}
                              onChange={(e) => handleEducation(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Grading System:
                            </label>
                            <input
                              required
                              readOnly={
                                !(
                                  edueditIndex === index &&
                                  educationIndex === 474
                                )
                              }
                              className="form-control"
                              name="gradingSystem"
                              type="text"
                              value={p?.gradingSystem}
                              onChange={(e) => handleEducation(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Specialization:
                            </label>
                            <input
                              required
                              readOnly={
                                !(
                                  edueditIndex === index &&
                                  educationIndex === 474
                                )
                              }
                              className="form-control"
                              type="text"
                              name="specialization"
                              value={p?.specialization}
                              onChange={(e) => handleEducation(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">Score:</label>
                            <input
                              required
                              readOnly={
                                !(
                                  edueditIndex === index &&
                                  educationIndex === 474
                                )
                              }
                              className="form-control"
                              type="number"
                              name="score"
                              value={p?.score}
                              onChange={(e) => handleEducation(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Start Date <span className="text-danger">*</span>
                            </label>
                            <DatePicker
                              poppername="startDate"
                              disabled={edueditIndex !== index}
                              className="form-control"
                              value={p?.startDate}
                              onChange={(e) => handleEduStartDate(e, index)}
                            />
                            {/* </div> */}
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              End Date <span className="text-danger">*</span>
                            </label>
                            <DatePicker
                              poppername="endDate"
                              disabled={edueditIndex !== index}
                              className="form-control"
                              value={p?.endDate}
                              onChange={(e) => handleEduEndDate(e, index)}
                            />
                          </div>
                        </div>

                        <div className="col-md-3 d-flex">
                          {edueditIndex === index && educationIndex === 474 ? (
                            <Space size={'small'}>
                              <div
                                className="btn btn-primary "
                                onClick={(e) => handleSaveEducation(p, index)}
                              >
                                <Save /> Save
                              </div>
                              <button
                                className="btn btn-secondary"
                                onClick={(e) => removeEducationField(e, index)}
                              >
                                <Delete /> Delete
                              </button>
                            </Space>
                          ) : (
                            <Space size={'small'}>
                              <div
                                className="btn btn-info"
                                onClick={() => handleEDitEducation(index)}
                              >
                                <EditIcon /> Edit
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => removeEducationField(e, index)}
                              >
                                <Delete /> Delete
                              </button>
                            </Space>
                          )}
                        </div>
                      </div>
                      <hr />

                      <br />
                    </div>
                  ))}
                  <div className="row">
                    <div className="col-md-12 col-sm-12">
                      <div
                        className="btn btn-primary"
                        onClick={addEducationField}
                      >
                        + Add Education
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tab-pane fade show" id="emp_exp">
                  {experience?.map((p, index) => (
                    <div key={index}>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">Company:</label>
                            <input
                              required
                              readOnly={
                                !(expeditIndex === index && expIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              name="company"
                              value={p?.company}
                              onChange={(e) => handleExpDetails(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Destination:
                            </label>
                            <input
                              required
                              readOnly={
                                !(expeditIndex === index && expIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              name="designation"
                              value={p?.designation}
                              onChange={(e) => handleExpDetails(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Start Date <span className="text-danger">*</span>
                            </label>
                            <DatePicker
                              // poppername="endDate"
                              disabled={expeditIndex !== index}
                              className="form-control"
                              // style={{ border: 'none', backgroundColor: 'red' }}
                              value={p?.startDate}
                              onChange={(e) => handleExpStartDate(e, index)}
                              // onChange={(e) => handleExpEdit(e, index)}
                            />
                            {/* </div> */}
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              End Date <span className="text-danger">*</span>
                            </label>
                            <DatePicker
                              // poppername="endDate"
                              disabled={expeditIndex !== index}
                              className="form-control"
                              // style={{ border: 'none', backgroundColor: 'red' }}
                              value={p?.endDate}
                              // onChange={(e) => handleExpEdit(e, index)}
                              onChange={(e) => handleExpEndDate(e, index)}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="col-form-label">
                              Responsibilities:
                            </label>
                            <textarea
                              style={{ height: '100px' }}
                              required
                              readOnly={
                                !(expeditIndex === index && expIndex === 474)
                              }
                              className="form-control"
                              type="text"
                              name="relationship"
                              value={p?.responsibilities}
                              onChange={(e) => handleExpDetails(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>

                        <div className="col-md-3 d-flex">
                          {expeditIndex === index && expIndex === 474 ? (
                            <Space size={'small'}>
                              <div
                                className="btn btn-primary "
                                onClick={(e) => handleSaveEXP(p, index)}
                              >
                                <Save /> Save
                              </div>
                              <button
                                className="btn btn-secondary"
                                onClick={(e) => removeExperienceField(e, index)}
                              >
                                <Delete /> Delete
                              </button>
                            </Space>
                          ) : (
                            <Space size={'small'}>
                              <div
                                className="btn btn-info"
                                onClick={() => handleEDitExperience(index)}
                              >
                                <EditIcon /> Edit
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => removeExperienceField(e, index)}
                              >
                                <Delete /> Delete
                              </button>
                            </Space>
                          )}
                        </div>
                      </div>
                      <hr />

                      <br />
                    </div>
                  ))}
                  <div className="row">
                    <div className="col-md-12 col-sm-12">
                      <div
                        className="btn btn-primary"
                        onClick={addExperienceField}
                      >
                        + Add Experience
                      </div>
                    </div>
                  </div>
                  {/* {experience?.map((exp, index) => (
                    <div key={index}>
                      <div className="row">
                        <div className="col-md-4">Company : {exp?.company}</div>
                        <div className="col-md-4">
                          Designation: {exp?.designation}
                        </div>
                        <div className="col-md-3">
                          Responsibilities : {exp?.responsibilities}
                        </div>
                        <div
                          className="col-md-1"
                          // className='float-right'
                        >
                          <div
                            className="btn btn-info float-right"
                            onClick={() => handleEDitEXper(index)}
                          >
                            <EditIcon />
                          </div>
                        </div>
                      </div>

                      <br></br>
                      <div className="row">
                        <div className="col-md-4">
                          Start Date :-
                          {convert(exp?.startDate)}
                        </div>
                        <div className="col-md-4">
                          End Date :- {convert(exp?.endDate)}
                         
                        </div>
                        <div
                          className="col-md-3"
                          // className='float-right'
                        ></div>
                        <div
                          className="col-md-1"
                          // className='float-right'
                        >
                        
                          <div
                            className="btn btn-primary float-right"
                            onClick={(e) => handleRemove(e, index)}
                          >
                            <Delete />
                          </div>
                        </div>
                      </div>
                      <hr></hr>
                      <br />
                    </div>
                  ))}

                  {expIndex == 474 &&
                    experience?.map((exp, index) => (
                      <div key={index}>
                        {expeditIndex === index ? (
                          <>
                            <div className="row">
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    Company
                              
                                  </label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="company"
                                    value={exp?.company}
                                    onChange={(e) => handleExpDetails(e, index)}
                                    // onInput={toInputUppercase}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    Designation
                                  
                                  </label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="designation"
                                    value={exp?.designation}
                                    onChange={(e) => handleExpDetails(e, index)}
                                    // onInput={toInputUppercase}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    Responsibilities{' '}
                                    
                                  </label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="responsibilities"
                                    value={exp?.responsibilities}
                                    onChange={(e) => handleExpDetails(e, index)}
                                    // onInput={toInputUppercase}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    Start Date
                                  </label>
                                  <DatePicker
                                    // poppername="endDate"
                                    className="form-control"
                                    // style={{ border: 'none', backgroundColor: 'red' }}
                                    value={exp?.startDate}
                                    onChange={(e) =>
                                      handleExpStartDate(e, index)
                                    }
                                  />

                               
                                </div>
                              </div>

                          
                            </div>
                            <div className="row">
                              <div className="col-md-2">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    End Date
                                  </label>
                                  <DatePicker
                                    // poppername="endDate"
                                    className="form-control"
                                    // style={{ border: 'none', backgroundColor: 'red' }}
                                    value={exp?.endDate}
                                    onChange={(e) => handleExpEndDate(e, index)}
                                  />
                                </div>
                              </div>
                           
                              <div className="col-md-3"></div>
                              <div className="col-md-3"></div>

                              <div
                                className="col-md-3"
                                style={{ marginLeft: '95px' }}
                              >
                                <br></br>

                                <div
                                  style={{ marginTop: '15px' }}
                                  className="btn btn-primary float-center"
                                  onClick={(e) => handleSaveEXP()}
                                >
                                  Save
                                </div>
                                <div
                                  style={{
                                    marginTop: '15px',
                                    marginLeft: '11px',
                                  }}
                                  className="btn btn-primary float-center"
                                  onClick={(e) => handleCancelEXP()}
                                >
                                  Cancel
                                </div>
                              </div>
                              <hr />
                            </div>
                          </>
                        ) : (
                          ''
                        )}
                      </div>
                    ))}

                  {expIndex === 476 &&
                    experience?.map((exp, index) => (
                      <div key={index}>
                        {expnAdd === index ? (
                          <>
                            <div className="row">
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    Company
                                   
                                  </label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="company"
                                    value={exp?.company}
                                    onChange={(e) => handleExpDetails(e, index)}
                                    // onInput={toInputUppercase}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    Designation
                                   
                                  </label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="designation"
                                    value={exp?.designation}
                                    onChange={(e) => handleExpDetails(e, index)}
                                    // onInput={toInputUppercase}
                                  />
                                </div>
                              </div>

                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    Start Date
                                  </label>
                                  {/* <DatePicker
                                    // poppername="endDate"
                                    className="form-control"
                                    // style={{ border: 'none', backgroundColor: 'red' }}
                                    value={exp?.startDate}
                                    onChange={(e) =>
                                      handleExpStartDate(e, index)
                                    }
                                  /> 

                                  <input
                                    type="date"
                                    name="startDate"
                                    value={exp?.startDate?.split('T')[0]}
                                    className="form-control"
                                    onChange={(e) => handleExpDetails(e, index)}
                                  />
                                </div>
                              </div>

                              {/* {Expresume?.fileName} 
                            </div>
                            <div className="row">
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    End Date
                                  </label>
                                  <DatePicker
                                    // poppername="endDate"
                                    className="form-control"
                                    // style={{ border: 'none', backgroundColor: 'red' }}
                                    value={exp?.endDate}
                                    maxDate={new Date()}
                                    onChange={(e) => handleExpEndDate(e, index)}
                                  />
                                </div>
                              </div>

                              <div className="col-md-3">
                                <div className="form-group">
                                  <label className="col-form-label">
                                    Responsibilities{' '}
                                   
                                  </label>
                                  <textarea
                                    className="form-control"
                                    type="text"
                                    name="responsibilities"
                                    value={exp?.responsibilities}
                                    onChange={(e) => handleExpDetails(e, index)}
                                    // onInput={toInputUppercase}
                                  />
                                </div>
                              </div>
                              
                              <div className="col-md-1">
                                <div className="form-group text-center">
                                  <div
                                    style={{ marginTop: '35px' }}
                                    className="btn btn-primary float-center"
                                    onClick={(e) => handleSaveEXP()}
                                  >
                                    Save
                                  </div>
                                 
                                </div>
                              </div>
                              <div className="col-md-1">
                                <div className="form-group text-center">
                                  <div
                                    style={{ marginTop: '29px' }}
                                    className="btn btn-primary float-right"
                                    onClick={(e) => handleRemove(e, index)}
                                  >
                                    <Delete />
                                  </div>

                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          ''
                        )}
                      </div>
                    ))}

                  <div className="btn btn-primary" onClick={handleAnotherExp}>
                    <Add /> Add Experience
                  </div> */}
                </div>

                <div className="tab-pane fade show" id="emp_cert">
                  {certificate?.map((c, index) => (
                    <div key={index} className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="col-form-label">
                            Certificate Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            className="form-control"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="col-form-label">
                            Certificate File
                          </label>
                          <input
                            type="file"
                            name="cerificateFile"
                            className="form-control"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="col-form-label">Remark</label>
                          <textarea
                            className="form-control"
                            cols="10"
                            rows="1"
                            placeholder="Add Remark about Certificate"
                            name="remark"
                          ></textarea>
                        </div>
                      </div>
                      <div className="col-md-1">
                        <div className="form-group text-center">
                          <label className="col-form-label">Remove</label>
                          <Delete
                            onClick={(e) => removeCertificateField(e, index)}
                          />
                        </div>
                      </div>
                      <hr />
                    </div>
                  ))}

                  <div
                    className="btn btn-primary"
                    onClick={addCertificateField}
                  >
                    <Add /> Add Certificate
                  </div>
                </div>

                {/* Contact Details  */}

                <div className="tab-pane fade show" id="emp_contact">
                  {personContact?.map((p, index) => (
                    <div key={index}>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">Name:</label>
                            <input
                              required
                              readOnly={
                                !(
                                  contacteditIndex === index &&
                                  contactIndex === 474
                                )
                              }
                              className="form-control"
                              type="text"
                              name="name"
                              value={p?.name}
                              onChange={(e) => handlePersonContact(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">
                              Relationship:
                            </label>
                            <input
                              required
                              readOnly={
                                !(
                                  contacteditIndex === index &&
                                  contactIndex === 474
                                )
                              }
                              className="form-control"
                              type="text"
                              name="relationship"
                              value={p?.relationship}
                              onChange={(e) => handlePersonContact(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="col-form-label">Phone:</label>
                            <input
                              required
                              readOnly={
                                !(
                                  contacteditIndex === index &&
                                  contactIndex === 474
                                )
                              }
                              className="form-control"
                              type="text"
                              name="phone"
                              maxLength={10}
                              value={p?.phone}
                              pattern="[6-9]{1}[0-9]{9}"
                              title="Phone number with 6-9 and remaing 9 digit with 0-9"
                              onChange={(e) => handlePersonContact(e, index)}
                              onInput={toCapitalize}
                            />
                          </div>
                        </div>
                        <div className="col-md-3 d-flex">
                          {contacteditIndex === index &&
                          contactIndex === 474 ? (
                            <Space size={'small'}>
                              <div
                                className="btn btn-primary "
                                onClick={(e) => handleSaveContact(p, index)}
                              >
                                <Save /> Save
                              </div>
                              <button
                                className="btn btn-secondary"
                                onClick={(e) =>
                                  removePersonContactField(e, index)
                                }
                              >
                                <Delete /> Delete
                              </button>
                            </Space>
                          ) : (
                            <Space size={'small'}>
                              <div
                                className="btn btn-info"
                                onClick={() => handleEDitContact(index)}
                              >
                                <EditIcon /> Edit
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) =>
                                  removePersonContactField(e, index)
                                }
                              >
                                <Delete /> Delete
                              </button>
                            </Space>
                          )}
                        </div>
                      </div>
                      <hr />
                      {/*<div key={index} className="row">
                        {contacteditIndex === index && contactIndex === 474 ? (
                          <>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="col-form-label">Name:</label>
                                <input
                                  className="form-control"
                                  type="text"
                                  name="name"
                                  value={p?.name}
                                  onChange={(e) =>
                                    handlePersonContact(e, index)
                                  }
                                  onInput={toCapitalize}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="col-form-label">
                                  Relationship:
                                </label>
                                <input
                                  className="form-control"
                                  type="text"
                                  name="relationship"
                                  value={p?.relationship}
                                  onChange={(e) =>
                                    handlePersonContact(e, index)
                                  }
                                  onInput={toCapitalize}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="col-form-label">Phone:</label>
                                <input
                                  className="form-control"
                                  type="text"
                                  name="phone"
                                  value={p?.phone}
                                  onChange={(e) =>
                                    handlePersonContact(e, index)
                                  }
                                  onInput={toCapitalize}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div
                                style={{ marginTop: '35px' }}
                                className="btn btn-primary float-center"
                                onClick={(e) => handleSaveContact()}
                              >
                                Save
                              </div>
                              <div
                                style={{
                                  marginTop: '35px',
                                  marginLeft: '11px',
                                }}
                                className="btn btn-primary float-center"
                                onClick={(e) => handleCancelContact()}
                              >
                                Cancel
                              </div>
                            </div>
                          </>
                        ) : (
                          ''
                        )}
                      </div>*/}
                      <br />
                    </div>
                  ))}
                  <div className="row">
                    <div className="col-md-12 col-sm-12">
                      <div
                        className="btn btn-primary"
                        onClick={addPersonContactField}
                      >
                        + Add Contacts
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="submit-section">
                <button className="btn btn-primary submit-btn" type="submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
