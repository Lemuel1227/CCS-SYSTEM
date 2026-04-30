import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import './AcademicTracker.css';

const AcademicTracker = () => {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [coursesRes, gradesRes] = await Promise.all([
          axios.get('/api/courses'),
          axios.get('/api/grades/me')
        ]);

        setCourses(coursesRes.data || []);
        setGrades(gradesRes.data || []);
      } catch (err) {
        console.error('Failed to load academic data:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to load academic data.');
        setCourses([]);
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getGradeForCourse = (courseId) => {
    const gradeRecord = grades.find(g => g.course?._id === courseId);
    if (!gradeRecord) return { grade: '-', status: '-' };
    return { grade: gradeRecord.grade, status: gradeRecord.status };
  };

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
              const gradeInfo = getGradeForCourse(course._id);
              
              return (
                <tr key={course._id}>
                  <td>{course.code}</td>
                  <td>{course.desc}</td>
                  <td>{course.units}</td>
                  <td>{course.prereq}</td>
                  <td>{gradeInfo.grade}</td>
                  <td>
                    <span className={`at-status-badge ${gradeInfo.status === 'PASSED' ? 'passed' : gradeInfo.status === 'FAILED' ? 'failed' : ''}`}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <BookOpen size={32} color="var(--primary-color)" />
        <h2 className="page-title" style={{ margin: 0, paddingBottom: 0, borderBottom: 'none' }}>Academic Progress Tracker</h2>
      </div>

      {errorMessage && (
        <div style={{ color: '#dc2626', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '16px' }}>
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading academic progress...
        </div>
      ) : (
        <>
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
              {renderCourseTable(2, 1)}
              {renderCourseTable(2, 2)}
              {renderCourseTable(3, 1)}
              {renderCourseTable(3, 2)}
              {renderCourseTable(4, 1)}
              {renderCourseTable(4, 2)}
            </>
          )}
        </>
      )}

    </div>
  );
};

export default AcademicTracker;