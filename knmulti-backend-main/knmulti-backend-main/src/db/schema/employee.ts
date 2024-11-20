import { Document, Schema, Types } from "mongoose";
import { GENDER, USER_AUTHORITIES, USER_TYPE } from "../../constants";
import { Employee } from "../../models/employee";

interface Address {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PreviousExperience {
  startDate: Date;
  endDate: Date;
  company: string;
  designation: string;
  responsibilities: string;
}

interface BankDetails {
  bankdetails1: String;
  bankname: String;
  branch: String;
  accountHoldersName: String;
  accountNumber: String;
  IFSC: String;
  upi: String;
  pan: String;
  aadhar: String;
}

interface Education {
  qualification: string;
  instution: string;
  startDate: Date;
  endDate: Date;
  university: string;
  specialization: string;
  score: Number;
  gradingSystem: string;
}

interface otherContacts {
  name: String;
  relationship: String;
  phone: String;
}

interface EmployeeActivity {
  activityType: string;
  dateTime: Date;
  description: string;
  link: string;
}

interface SALARYCOMPONENTS {
  anualctc: number;
  travelpercent: number;
  dearnessPercent: number;
  medicalpercent: number;
  basicpercent: number;
  housepercent: number;
  montlyctc: number;
  DA: number;
  MA: number;
  TA: number;
  M_HRA: number;
}

interface PersonalInformation {
  passportNo: string;
  pan: string;
  pfno: string;
  esino: string;
  passportExp: Date;
  phoneNo: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  employmentOfSpouse: string;
  numberOfChildren: number;
}

interface IEmployee extends Document {
  id: Number;
  userName: string;
  addressChecked: string;
  blood: string;
  password: string;
  email: string;
  firstName: string;
  // employmentType:string;
  middleName: string;
  lastName: string;
  name: string;
  gender: GENDER;
  currentAddress: Address;
  permanentAddress: Address;
  localContact: string;
  mobileNo: string;
  totalLeaves: string;
  employeeType: { type: Types.ObjectId; ref: string };
  employmentType: string;
  dob: Date;
  previousExperience: PreviousExperience[];
  education: Education[];
  bankDetails: BankDetails[];
  userAuthorites: USER_AUTHORITIES[];
  managerUserId: Number;
  department: Types.ObjectId;
  active: Boolean;
  joinDate: Date;
  workLocation: Types.ObjectId;
  jobRole: Types.ObjectId;
  activities: EmployeeActivity[];
  userType: USER_TYPE;
  acceptedTimesheets: Types.ObjectId[];
  salary: Number;
  SALARYCOMPONENTS: SALARYCOMPONENTS;
  personalInformation: PersonalInformation;
  emergencyContact: string;
  familyInformation: otherContacts;
  ticketsAssigned: [Types.ObjectId];
  certFile: {
    fileName: string;
    filePath: string;
  }[];

  fileInfos: {
    fileName: string;
    filePath: string;
  }[];
  resumeExp: {
    fileName: string;
    filePath: string;
  }[];

  fileInfoPic: {
    fileName: string;
    filePath: string;
  }[];
  profile_url?: {
    fileName: string;
    filePath: string;
  };
  // dailyFieldReport: DailyFieldReport[];
}

// interface DailyFieldReport {
//   date: Date;
//   taskDone: Number;
//   leadInfo: LeadInfo[];
// }

// interface LeadInfo {
//   name: Types.ObjectId;
//   contactNo: Number;
//   callNo: Number;
//   releventPoint: string;
//   nextAppoinment: string;
// }

const employeeSchema = new Schema<IEmployee>(
  {
    _id: Number,
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    email: {
      type: String,
      unique: true,
    },
    blood: String,
    addressChecked: Boolean,
    firstName: String,
    middleName: String,
    lastName: String,
    name: String,
    gender: {
      type: String,
      enum: Object.values(GENDER),
    },
    userType: {
      type: String,
      enum: Object.values(USER_TYPE),
    },
    acceptedTimesheets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Timesheet",
      },
    ],
    currentAddress: {
      type: {
        addressLine1: {
          type: String,
          required: true,
        },
        addressLine2: {
          type: String,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
        },
        country: {
          type: String,
        },
      },
    },
    permanentAddress: {
      type: {
        addressLine1: {
          type: String,
          required: true,
        },
        addressLine2: {
          type: String,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
        },
        country: {
          type: String,
        },
      },
    },
    ticketsAssigned: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
    personalInformation: {
      passportNo: String,
      pan: String,
      pfno: String,
      esino: String,
      passportExp: Date,
      phoneNo: String,
      nationality: String,
      religion: String,
      maritalStatus: String,
      employmentOfSpouse: String,
      numberOfChildren: Number,
    },
    SALARYCOMPONENTS: {
      anualctc: Number,
      travelpercent: Number,
      dearnessPercent: Number,
      medicalpercent: Number,
      basicpercent: Number,
      housepercent: Number,
      montlyctc: Number,
      DA: Number,
      MA: Number,
      TA: Number,
      M_HRA: Number,
    },
    mobileNo: String,
    totalLeaves: String,
    employeeType: { type: Schema.Types.ObjectId, ref: "EmployeeType" },
    dob: Date,
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    previousExperience: [
      {
        startDate: Date,
        endDate: Date,
        company: String,
        designation: String,
        responsibilities: String,
      },
    ],
    bankDetails: [
      {
        bankdetails1: String,
        bankname: String,
        branch: String,
        accountHoldersName: String,
        IFSC: String,
        specialization: String,
        accountNumber: Number,
        upi: String,
      },
    ],
    education: [
      {
        qualification: String,
        instution: String,
        startDate: Date,
        endDate: Date,
        university: String,
        specialization: String,
        score: Number,
        gradingSystem: String,
      },
    ],
    emergencyContact: String,
    familyInformation: [
      {
        name: String,
        relationship: String,
        phone: String,
      },
    ],
    userAuthorites: [
      {
        type: String,
        enum: Object.values(USER_AUTHORITIES),
      },
    ],
    managerUserId: Number,
    active: Boolean,
    employmentType: String,
    joinDate: Date,
    workLocation: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    jobRole: {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
    activities: [
      {
        activityType: String,
        dateTime: Date,
        description: String,
        link: String,
      },
    ],

    salary: Number,
    certFile: [
      {
        fileName: String,
        filePath: String,
      },
    ],
    resumeExp: [
      {
        fileName: String,
        filePath: String,
      },
    ],
    fileInfos: [
      {
        fileName: String,
        filePath: String,
      },
    ],
    fileInfoPic: [
      {
        fileName: String,
        filePath: String,
      },
    ],
    profile_url: {
      fileName: String,
      filePath: String,
    },
    // dailyFieldReport: [
    //   {
    //     date: Date,
    //     // taskDone: Number,
    //     leadInfo: [
    //       {
    //         name: {
    //           type: Schema.Types.ObjectId,
    //           ref: "Customer",
    //         },
    //         contactNo: Number,
    //         callNo: Number,
    //         releventPoint: String,
    //         nextAppoinment: String,
    //       },
    //     ],
    //   },
    // ],
  },
  { _id: false, timestamps: true }
);

employeeSchema.pre("save", function (next) {
  if (this.isNew) {
    Employee.countDocuments({}, (err: any, count: any) => {
      if (err) return next(err);
      this._id = count + `${Math.ceil(Math.random() * 1000)}`;
      next();
    });
  } else next();
});

employeeSchema.pre("save", function (next) {
  this.name = `${this?.firstName} ${this?.lastName}`;
  next();
});

export { IEmployee, employeeSchema };
