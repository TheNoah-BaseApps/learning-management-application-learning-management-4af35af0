CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text DEFAULT 'employee' NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  employee_id text NOT NULL UNIQUE,
  employee_name text NOT NULL,
  department text NOT NULL,
  designation text NOT NULL,
  date_of_joining date NOT NULL,
  contact_number text,
  email_address text NOT NULL,
  employment_type text NOT NULL,
  registration_status text DEFAULT 'Pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees (employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees (user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);

CREATE TABLE IF NOT EXISTS programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text,
  duration integer NOT NULL,
  status text DEFAULT 'Active' NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs (status);
CREATE INDEX IF NOT EXISTS idx_programs_created_by ON programs (created_by);

CREATE TABLE IF NOT EXISTS courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  course_id text NOT NULL UNIQUE,
  program_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  duration integer NOT NULL,
  content_url text,
  status text DEFAULT 'Active' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_courses_course_id ON courses (course_id);
CREATE INDEX IF NOT EXISTS idx_courses_program_id ON courses (program_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  enrollment_id text NOT NULL UNIQUE,
  employee_id uuid NOT NULL,
  course_id uuid NOT NULL,
  program_name text,
  enrollment_date date DEFAULT CURRENT_DATE NOT NULL,
  enrollment_status text DEFAULT 'Pending' NOT NULL,
  enrolled_by uuid NOT NULL,
  enrollment_type text NOT NULL,
  product_name text,
  comments text,
  completion_percentage decimal(5,2) DEFAULT 0.00 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrollment_id ON enrollments (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_employee_id ON enrollments (employee_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments (enrollment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_employee_course ON enrollments (employee_id, course_id);

CREATE TABLE IF NOT EXISTS assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  course_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  passing_score decimal(5,2) NOT NULL,
  total_points decimal(5,2) NOT NULL,
  duration_minutes integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assessments_course_id ON assessments (course_id);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  assessment_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  score decimal(5,2),
  status text DEFAULT 'In Progress' NOT NULL,
  attempted_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone
);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON assessment_attempts (assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_employee_id ON assessment_attempts (employee_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON assessment_attempts (status);

CREATE TABLE IF NOT EXISTS certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  employee_id uuid NOT NULL,
  course_id uuid NOT NULL,
  certificate_number text NOT NULL UNIQUE,
  issue_date date DEFAULT CURRENT_DATE NOT NULL,
  expiry_date date,
  status text DEFAULT 'Active' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_certifications_certificate_number ON certifications (certificate_number);
CREATE INDEX IF NOT EXISTS idx_certifications_employee_id ON certifications (employee_id);
CREATE INDEX IF NOT EXISTS idx_certifications_course_id ON certifications (course_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications (status);

CREATE TABLE IF NOT EXISTS learning_calendar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  course_id uuid NOT NULL,
  scheduled_date date NOT NULL,
  end_date date NOT NULL,
  max_participants integer,
  status text DEFAULT 'Scheduled' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_learning_calendar_course_id ON learning_calendar (course_id);
CREATE INDEX IF NOT EXISTS idx_learning_calendar_dates ON learning_calendar (scheduled_date, end_date);
CREATE INDEX IF NOT EXISTS idx_learning_calendar_status ON learning_calendar (status);

CREATE TABLE IF NOT EXISTS progress_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  enrollment_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  course_id uuid NOT NULL,
  progress_percentage decimal(5,2) DEFAULT 0.00 NOT NULL,
  last_accessed timestamp with time zone,
  completion_date date
);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_enrollment_id ON progress_tracking (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_employee_id ON progress_tracking (employee_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_course_id ON progress_tracking (course_id);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);