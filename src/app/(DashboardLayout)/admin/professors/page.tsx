"use client";
import { Grid } from '@mui/material';
import ProfessorsTable from '../../components/dashboard/ProfessorsTable';
import type { Professor } from '../../../../types';
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component
import apiService from '@/services/api';
import { useState, useEffect } from 'react'; // Import useEffect

const ProfessorsPage = () => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch professors data when the component mounts
  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await apiService.getAllProfessors(); // Assuming you have a method to fetch students
        setProfessors(response.data); // Update the state with the fetched data
      } catch (error) {
        console.error('Error fetching professors:', error);
      }
    };

    fetchProfessors();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handler for editing a professor
const handleEditProfessor = async (id: number, updatedData: any) => {
  try {
    const response = await apiService.updateProfessor(id, updatedData);
    setProfessors(professors.map(professor => 
      professor.id === id ? response.data : professor
    ));
  } catch (error) {
    console.error('Error updating professor:', error);
  }
};

// Handler for deleting a professor
const handleDeleteProfessor = async (id: number) => {
  try {
    await apiService.deleteProfessor(id);
    setProfessors(professors.filter(professor => professor.id !== id));
  } catch (error) {
    console.error('Error deleting professor:', error);
  }
};

  return (
    <ProtectedRoute>
<Grid item xs={12}>
<ProfessorsTable
    professors={professors}
    sortField={sortField}
    sortOrder={sortOrder}
    searchTerm={searchTerm}
    onSort={handleSort}
    onSearch={handleSearch}
    onEdit={handleEditProfessor}
    onDelete={handleDeleteProfessor}
  />
      </Grid>
    </ProtectedRoute>
  );
};

export default ProfessorsPage;


