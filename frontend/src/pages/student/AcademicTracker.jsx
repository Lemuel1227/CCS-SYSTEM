import React, { useState } from 'react';
import './AcademicTracker.css';

const MOCK_GRADES = {
  'CCS101': { grade: '1.50', status: 'PASSED' },
  'CCS102': { grade: '2.50', status: 'PASSED' },
  'ETH101': { grade: '1.75', status: 'PASSED' },
  'MAT101': { grade: '2.00', status: 'PASSED' },
  'NSTP1': { grade: 'PASSED', status: 'PASSED' },
  'PED101': { grade: '1.25', status: 'PASSED' },
  'PSY100': { grade: '1.25', status: 'PASSED' },
  
  'CCS103': { grade: '1.25', status: 'PASSED' },
  'CCS104': { grade: '2.00', status: 'PASSED' },
  'CCS105': { grade: '1.25', status: 'PASSED' },
  'CCS106': { grade: '1.75', status: 'PASSED' },
  'COM101': { grade: '1.50', status: 'PASSED' },
  'GAD101': { grade: '1.25', status: 'PASSED' },
  'NSTP2': { grade: 'PASSED', status: 'PASSED' },
  'PED102': { grade: '1.00', status: 'PASSED' },
};

const DEFAULT_COURSES = [
  { id: '1', code: 'CCS101', desc: 'Introduction to Computing', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '2', code: 'CCS102', desc: 'Computer Programming 1', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '3', code: 'ETH101', desc: 'Ethics', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '4', code: 'MAT101', desc: 'Mathematics in the Modern World', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '5', code: 'NSTP1', desc: 'National Service Training Program 1', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '6', code: 'PED101', desc: 'Physical Education 1', units: 2, prereq: '--', year: 1, sem: 1 },
  { id: '7', code: 'PSY100', desc: 'Understanding the Self', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '8', code: 'CCS103', desc: 'Computer Programming 2', units: 3, prereq: 'CCS102', year: 1, sem: 2 },
  { id: '9', code: 'CCS104', desc: 'Discrete Structures 1', units: 3, prereq: 'MAT101', year: 1, sem: 2 },
  { id: '10', code: 'CCS105', desc: 'Human Computer Interaction 1', units: 3, prereq: 'CCS101', year: 1, sem: 2 },
  { id: '11', code: 'CCS106', desc: 'Social and Professional Issues', units: 3, prereq: 'ETH101', year: 1, sem: 2 },
  { id: '12', code: 'COM101', desc: 'Purposive Communication', units: 3, prereq: '--', year: 1, sem: 2 },
  { id: '13', code: 'GAD101', desc: 'Gender and Development', units: 3, prereq: '--', year: 1, sem: 2 },
  { id: '14', code: 'NSTP2', desc: 'National Service Training Program 2', units: 3, prereq: 'NSTP1', year: 1, sem: 2 },
  { id: '15', code: 'PED102', desc: 'Physical Education 2', units: 2, prereq: 'PED101', year: 1, sem: 2 }
];

const AcademicTracker = () => {
  const [courses] = useState(() => {
    try {
      const storedCourses = localStorage.getItem('ccs_courses');
      if (storedCourses) {
        return JSON.parse(storedCourses);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COURSES;
  });

  // Compute Year & Semester Groupings
  const getCoursesForTerm = (year, sem) => {
    return courses.filter(c => c.year === year && c.sem === sem).sort((a,b) => a.code.localeCompare(b.code));
  };

  const renderCourseTable = (year, sem) => {
    const termCourses = getCoursesForTerm(year, sem);
    if (termCourses.length === 0) return null;

    const totalUnits = termCourses.reduce((sum, course) => sum + (Number(course.units) || 0), 0);
    const suffix = year === 1 ? 'st Year' : year === 2 ? 'nd Year' : year === 3 ? 'rd Year' : 'th Year';
    const semName = sem === 1 ? '1st Semester' : sem === 2 ? '2nd Semester' : 'Summer';

    return (
      <div className="at-card" key={`y${year}-s${sem}`}>
        <div className="at-card-header">
          <span className="at-year-label">{year}{suffix}</span>
          <span className="at-sem-label">{semName}</span>
        </div>
        <table className="at-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Description</th>
              <th>Units</th>
              <th>Prerequisites</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {termCourses.map(course => {
              const gradeInfo = MOCK_GRADES[course.code] || { grade: '-', status: '-' };
              
              return (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.desc}</td>
                  <td>{course.units}</td>
                  <td>{course.prereq}</td>
                  <td>{gradeInfo.grade}</td>
                  <td>
                    <span className={`at-status-badge ${gradeInfo.status === 'PASSED' ? 'passed' : ''}`}>
                      {gradeInfo.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" className="text-right fw-bold">Total No. of Units</td>
              <td className="fw-bold">{totalUnits}</td>
              <td colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="academic-tracker-container">
      <h2 className="page-title">Academic Progress Tracker</h2>

      {/* Retention History Section */}
      <div className="at-card mb-40">
        <div className="at-card-header">
          <span>Retention History</span>
          <button className="btn-guidelines">View Guidelines</button>
        </div>
        <table className="at-table retention-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Warnings</th>
              <th>Status</th>
              <th>Requirement</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Hardcoded history based on mock image */}
            {[
              "1st Semester A.Y. 2022-2023",
              "2nd Semester A.Y. 2022-2023",
              "1st Semester A.Y. 2023-2024",
              "2nd Semester A.Y. 2023-2024",
              "1st Semester A.Y. 2024-2025",
              "2nd Semester A.Y. 2024-2025",
              "1st Semester A.Y. 2025-2026",
            ].map((semStr, idx) => (
              <tr key={idx}>
                <td>{semStr}</td>
                <td>None</td>
                <td>With Good Standing</td>
                <td>None</td>
                <td><button className="btn-none">None</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {courses.length === 0 ? (
        <div className="empty-message">No courses have been configured yet. Please check back later.</div>
      ) : (
        <>
          {renderCourseTable(1, 1)}
          {renderCourseTable(1, 2)}
        </>
      )}

    </div>
  );
};

export default AcademicTracker;