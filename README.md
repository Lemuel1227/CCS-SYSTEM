MongoDB Atlas + Vercel Setup
________________________________________
1. Create a MongoDB Atlas database
• Create a cluster in Atlas.
• In Database Access, create a DB user.
• In Network Access, allow Vercel access (for quick setup you can use 0.0.0.0/0, then restrict later).

2. Get your Atlas connection string
• Use Drivers -> Node.js and copy the SRV URI.
• Format example:
	mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/ccs-system?retryWrites=true&w=majority&appName=<app-name>

3. Configure Vercel environment variables
• In Vercel project settings -> Environment Variables, add:
	MONGODB_URI = your full Atlas URI
• Add it for Production (and Preview/Development if needed).

4. Local development setup
• Copy backend/.env.example to backend/.env
• Set MONGODB_URI in backend/.env (Atlas URI or local URI)

5. Deploy
• Redeploy from Vercel dashboard after setting env vars.
• Confirm backend logs show: MongoDB Connected

________________________________________
SYSTEM STRUCTURE(Backend)
________________________________________
1.	Users (Base Authentication Table)
Users
•	User_ID (Primary Key)
•	Username (Unique)
•	Password_Hash (Encrypted)
•	Role (Admin / Faculty / Student)
•	Account_Status (Active / Inactive / Suspended)
•	Created_At
•	Updated_At
•	Last_Login
________________________________________
2.	Admin Module
Admin_Profile
•	Admin_ID (Primary Key)
•	User_ID (Foreign Key → Users.User_ID)
•	Full_Name
•	Position
•	Contact_Number
________________________________________
3.	Faculty Module
Faculty_Profile
•	Faculty_ID (Primary Key)
•	User_ID (Foreign Key → Users.User_ID)
•	Employee_ID_Number (Unique)
•	First_Name
•	Middle_Name
•	Last_Name
•	Gender
•	Department
•	Position / Designation
•	Profile_Image
•	Contact_Number
•	Email_Address
•	Created_At
•	Updated_At
________________________________________
STUDENT MODULE
________________________________________

4.	Student Module
Student_Profile
•	Student_ID (Primary Key)
•	User_ID (Foreign Key → Users.User_ID)
•	Student_Number (Unique)
•	First_Name
•	Middle_Name
•	Last_Name
•	Gender
•	Year_Level
•	Program
•	Academic_Track_ID (Foreign Key → Academic_Tracks_Table.Academic_Track_ID, Nullable)
•	Section_ID (Foreign Key → Sections.Section_ID, Nullable)
•	Academic_Status (Regular / Irregular)
•	Height (Required for sports/pageants filtering)
•	Weight (Optional)
•	Email_Address
•	Contact_Number
•	Emergency_Contact_Name
•	Emergency_Contact_Number
•	Emergency_Contact_Relation
•	Year_Graduated (Nullable)
•	Profile_Image
•	Created_At
•	Updated_At
________________________________________
5.	Student Achievements
Student_Achievements
•	Achievement_ID (Primary Key)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	Category (Academic Award / Competition / Certification / Other)
•	Title
•	Description (Optional details)
•	Date_Received
•	Attachment_File_Path (Optional)
•	Created_At
•	Updated_At
________________________________________
6.	Student Skills and Interests
Student_Skills
•	Skill_ID (Primary Key)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	Skill_Name
•	Skill_Level (Beginner / Intermediate / Advanced)
•	Created_At
Student_Interests
•	Interest_ID (Primary Key)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	Interests_Name
•	Is_Custom (Boolean)
•	Created_At
________________________________________
7.	Student Medical Records
Student_Medical_Records
•	Medical_Record_ID (Primary Key)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	Record_Type (Medical Certificate / Physical Exam / Vaccination / Lab Result / Others)
•	Title
•	Description
•	Medical_Issued_By
•	Medical_Issue_Date
•	Expiration_Date (Nullable)
•	Created_At
•	Updated_At
________________________________________
8.	Medical Record Files
Medical_Record_Files
•	File_ID (Primary Key)
•	Medical_Record_ID (Foreign Key → Student_Medical_Records.Medical_Record_ID)
•	File_Name
•	File_Path
•	File_Type
•	Uploaded_At
________________________________________
ACADEMIC MODULE
________________________________________
9.	Academic Tracks
Academic_Tracks_Table
•	Academic_Track_ID (Primary Key)
•	Track_Code (Nullable)
•	Track_Name
•	Department
•	Created_By (Foreign Key → Users.User_ID, NULL if system created)
•	Is_Irregular (Boolean)
•	Created_At
•	Updated_At
________________________________________
10.	Course List
Course
•	Course_ID (Primary Key)
•	Course_Code (Nullable)
•	Course_Name
•	Units
•	Description
•	Created_At
________________________________________
11.	Academic Track Courses
AcademicTrack_Courses
•	Academic_Track_ID (Foreign Key → Academic_Tracks_Table.Academic_Track_ID)
•	Course_ID (Foreign Key → Course.Course_ID)
•	Created_At
•	Updated_At
________________________________________
INSTRUCTION MODULE
________________________________________
12.	Syllabus
Syllabus
•	Syllabus_ID (Primary Key)
•	Course_ID (Foreign Key → Course.Course_ID)
•	SY_ID (Foreign Key → School_Year_Semester.SY_ID)
•	Faculty_ID (Foreign Key → Faculty_Profile.Faculty_ID)
•	Section_ID (Foreign Key → Sections.Section_ID, Nullable)
•	Course_Description
•	Learning_Outcomes
•	Grading_System
•	References / Textbooks
•	Status (Draft / Published)
•	Created_By (Foreign Key → Users.User_ID)
•	Created_At
•	Updated_At
________________________________________
13.	Syllabus Topics
Syllabus_Topics
•	Topic_ID (Primary Key)
•	Syllabus_ID (Foreign Key → Syllabus.Syllabus_ID)
•	Week_Number
•	Topic_Title
•	Topic_Description
•	Teaching_Method
•	Materials / Resources
•	Display_Order
•	Created_At
•	Updated_At
________________________________________
14.	Lesson Plans
Lesson_Plans
•	Lesson_ID (Primary Key)
•	Topic_ID (Foreign Key → Syllabus_Topics.Topic_ID)
•	Faculty_ID (Foreign Key → Faculty_Profile.Faculty_ID)
•	Lesson_Title
•	Objectives
•	Content / Body
•	Activities
•	Assessment
•	Duration_Minutes
•	Status (Draft / Published)
•	Created_At
•	Updated_At
________________________________________
15.	Lesson Materials
Lesson_Materials
•	Material_ID (Primary Key)
•	Lesson_ID (Foreign Key → Lesson_Plans.Lesson_ID, Nullable)
•	Topic_ID (Foreign Key → Syllabus_Topics.Topic_ID, Nullable)
•	Material_Title
•	Material_Type (PDF / Video / Link / Document / Image / Others)
•	Uploaded_By (Foreign Key → Users.User_ID)
•	Created_At
•	Updated_At
________________________________________
16.	Lesson Material Files
Lesson_Material_Files
•	File_ID (Primary Key)
•	Material_ID (Foreign Key → Lesson_Materials.Material_ID)
•	File_Name
•	File_Path
•	File_Type
•	File_Size
•	Uploaded_At
________________________________________
SCHEDULING MODULE
________________________________________
17.	School Year / Semester
School_Year_Semester
•	SY_ID (Primary Key)
•	School_Year (e.g. 2024–2025)
•	Semester (1st / 2nd / Summer)
•	Is_Current (Boolean)
•	Start_Date
•	End_Date
•	Created_At
________________________________________
18.	Rooms
Rooms
•	Room_ID (Primary Key)
•	Room_Name
•	Room_Code
•	Room_Type (Classroom / Laboratory / Gymnasium / Others)
•	Capacity
•	Building
•	Floor
•	Is_Available (Boolean)
•	Created_At
•	Updated_At
________________________________________
19.	Sections
Sections
•	Section_ID (Primary Key)
•	SY_ID (Foreign Key → School_Year_Semester.SY_ID)
•	Section_Name
•	Year_Level
•	Program
•	Academic_Track_ID (Foreign Key → Academic_Tracks_Table.Academic_Track_ID, Nullable)
•	Max_Students
•	Created_By (Foreign Key → Users.User_ID)
•	Created_At
•	Updated_At
________________________________________
20.	Class Schedule
Class_Schedule
•	Schedule_ID (Primary Key)
•	SY_ID (Foreign Key → School_Year_Semester.SY_ID)
•	Section_ID (Foreign Key → Sections.Section_ID)
•	Course_ID (Foreign Key → Course.Course_ID)
•	Faculty_ID (Foreign Key → Faculty_Profile.Faculty_ID)
•	Room_ID (Foreign Key → Rooms.Room_ID)
•	Day_Of_Week
•	Time_Start
•	Time_End
•	Schedule_Type (Lecture / Laboratory)
•	Created_By (Foreign Key → Users.User_ID)
•	Created_At
•	Updated_At
________________________________________
21.	Section Enrollment
Section_Enrollment
•	Enrollment_ID (Primary Key)
•	Section_ID (Foreign Key → Sections.Section_ID)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	SY_ID (Foreign Key → School_Year_Semester.SY_ID)
•	Enrollment_Status (Enrolled / Dropped / Transferred)
•	Enrolled_At
•	Updated_At
________________________________________
EVENT MANAGEMENT MODULE
________________________________________
22.	Events
Events
•	Event_ID (Primary Key)
•	Event_Name
•	Event_Type (Curricular / Extra-Curricular)
•	Description (Full details – What)
•	Objectives
•	Requirements
•	Venue_Name (Where)
•	Venue_Address
•	Event_Start_Date
•	Event_End_Date
•	Event_Start_Time
•	Event_End_Time
•	Duration_Minutes (Optional or auto-calculated)
•	Application_Deadline
•	Max_Participants (Nullable)
•	Medical_Record_Required (Boolean)
•	Status (Draft / Open / Closed / Ongoing / Completed / Cancelled)
•	Created_By (Foreign Key → Users.User_ID)
•	Created_At
•	Updated_At
________________________________________
23.	Event Applications (Approval Workflow)
Event_Applications
•	Application_ID (Primary Key)
•	Event_ID (Foreign Key → Events.Event_ID)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	Application_Date
•	Application_Status (Pending / Approved / Rejected / Cancelled)
•	Role (Contestant / Player / Organizer / Team Leader / Volunteer)
•	Reviewed_By (Foreign Key → Users.User_ID)
•	Review_Date
•	Remarks
________________________________________
24.	Event Participants (Final Approved List)
Event_Participants
•	Participant_ID (Primary Key)
•	Event_ID (Foreign Key → Events.Event_ID)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	Role (Contestant / Player / Organizer / Team Leader / Volunteer)
•	Added_By (Foreign Key → Users.User_ID)
•	Added_Method (Approved_Application / Direct_Add)
•	Result (Winner / 1st Runner-Up / 2nd Runner-Up / Participant / Ranked)
•	Rank_Position (Nullable – for numeric ranking)
•	Score (Nullable)
•	Remarks
•	Created_At
________________________________________
25.	Event Medical Records
Event_Medical_Records
•	Event_Medical_Record_ID (Primary Key)
•	Event_ID (Foreign Key → Events.Event_ID)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	Medical_Record_ID (Foreign Key → Student_Medical_Records.Medical_Record_ID)
•	Approval_Status (Pending / Approved / Rejected)
•	Reviewed_By (Foreign Key → Users.User_ID)
•	Review_Date
•	Remarks
•	Created_At
________________________________________
26.	Event Medical Questions
Event_Medical_Questions
•	Question_ID (Primary Key)
•	Event_ID (Foreign Key → Events.Event_ID)
•	Question_Text
•	Question_Type (Text / Yes_No / Number / File / Multiple_Choice)
•	Is_Required (Boolean)
•	Display_Order
•	Created_By (Foreign Key → Users.User_ID)
•	Created_At
________________________________________
27.	Event Medical Answers
Event_Medical_Answers
•	Answer_ID (Primary Key)
•	Event_Medical_Record_ID (Foreign Key → Event_Medical_Records.Event_Medical_Record_ID)
•	Question_ID (Foreign Key → Event_Medical_Questions.Question_ID)
•	Answer_Text (Nullable)
•	Answer_Number (Nullable)
•	Answer_Boolean (Nullable)
•	Answer_File_Path (Nullable)
•	Created_At
________________________________________
VIOLATION MANAGEMENT MODULE
________________________________________
28.	Violation Types
Violation_Types
•	Violation_Type_ID (Primary Key)
•	Violation_Name
•	Description
•	Category (Attendance / Uniform / Behavior / Other)
•	Created_At
________________________________________
29.	Student Violations
Student_Violations
•	Violation_Record_ID (Primary Key)
•	Student_ID (Foreign Key → Student_Profile.Student_ID)
•	Violation_Type_ID (Foreign Key → Violation_Types.Violation_Type_ID)
•	Offense_Level (1st / 2nd / 3rd / 4th)
•	Violation_Date
•	Violation_Time
•	Description (Optional additional details)
•	Concerned_Personnel (Faculty or staff name)
•	Disciplinary_Action
•	Remarks
•	Reported_By (Foreign Key → Users.User_ID)
•	Created_At
