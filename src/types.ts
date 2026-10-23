export type SubCategoryType =
  | 'casual_leave'
  | 'medical_leave'
  | 'maternity_leave'
  | 'joining_letter'
  | 'prl_pension'
  | 'passport_noc'
  | 'ex_bangladesh'
  | 'earned_leave'
  | 'student_absence_leave'
  | 'student_advance_leave'
  | 'student_fee_waiver'
  | 'student_poor_fund'
  | 'student_tc'
  | 'student_testimonial'
  | 'student_readmission'
  | string;

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'date';
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  helperText?: string;
  required?: boolean;
}

export interface FormatTemplate {
  id: SubCategoryType;
  title: string;
  shortTitle: string;
  category: 'employee' | 'student';
  description: string;
  badge: string;
  iconName: string;
  defaultRecipient: string;
  defaultThrough?: string;
  defaultSubject: string;
  recipientOptions?: string[];
  designationOptions?: string[];
  throughOptions?: string[];
  joiningTypeOptions?: string[];
  fields: FieldDefinition[];
}

export interface ApplicationFormData {
  date: string;
  recipient: string;
  customRecipient?: string;
  organization?: string;
  through?: string;
  subject: string;
  salutation: string;
  applicantName: string;
  designation: string;
  customDesignation?: string;
  workplace: string;
  upazilaOrArea?: string;
  district?: string;
  mobile?: string;

  leaveStartDate?: string;
  leaveEndDate?: string;
  totalDays?: string;
  leaveReason?: string;

  joiningType?: string;
  joiningTimeSession?: string;
  previousLeaveOrderNo?: string;
  joiningDate?: string;

  studentClass?: string;
  rollNumber?: string;
  fatherOrGuardianName?: string;
  familyMonthlyIncome?: string;
  gpaOrLastExamResult?: string;
  tcReason?: string;
  newSchoolName?: string;
  passingYear?: string;

  attachments?: string;
  customBodyText?: string;
  [key: string]: any;
}

export interface SavedApplication {
  id: string;
  formatId: SubCategoryType;
  formatTitle: string;
  category: 'employee' | 'student';
  applicantName: string;
  workplace: string;
  subject: string;
  data: ApplicationFormData;
  savedAt: string;
}

export type DashboardTheme = 'executive' | 'cyber' | 'navy' | 'ivory';
