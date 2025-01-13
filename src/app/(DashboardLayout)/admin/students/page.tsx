"use client";
import { Grid } from '@mui/material';
import StudentsTable from '../../components/dashboard/StudentsTable';
import type { Student } from '../../../../types';
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component
import apiService from '@/services/api';
import { useState, useEffect } from 'react'; // Import useEffect

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch students data when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await apiService.getAllStudents(); // Assuming you have a method to fetch students
        setStudents(response.data); // Update the state with the fetched data
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handler for editing a student
  const handleEditStudent = async (id: number, updatedData: any) => {
    try {
      const response = await apiService.updateStudent(id, updatedData);
      setStudents(students.map(student =>
        student.id === id ? response.data : student
      ));
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  // Handler for deleting a student
  const handleDeleteStudent = async (id: number) => {
    try {
      await apiService.deleteStudent(id);
      setStudents(students.filter(student => student.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Grid item xs={12}>
        <StudentsTable
          students={students}
          sortField={sortField}
          sortOrder={sortOrder}
          searchTerm={searchTerm}
          onSort={handleSort}
          onSearch={handleSearch}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
        />
      </Grid>
    </ProtectedRoute>
  );
};

export default StudentsPage;