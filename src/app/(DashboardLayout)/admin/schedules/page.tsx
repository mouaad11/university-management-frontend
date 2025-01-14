"use client";
import { Grid } from '@mui/material';
import SchedulesTable from '../../components/dashboard/SchedulesTable';
import type { Schedule } from '../../../../types';
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component
import apiService from '@/services/api';
import { useState, useEffect } from 'react'; // Import useEffect

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch schedules data when the component mounts
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await apiService.getAllSchedules(); // Assuming you have a method to fetch schedules
        setSchedules(response.data); // Update the state with the fetched data
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term.trim().toLowerCase()); // Normalize search term
  };

// Handler for editing a schedule
const handleEditSchedule = async (id: number, updatedData: any) => {
    try {
      const response = await apiService.updateSchedule(id, updatedData);
      setSchedules(schedules.map(schedule => 
        schedule.id === id ? response.data : schedule
      ));
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };
  
  // Handler for deleting a schedule
  const handleDeleteSchedule = async (id: number) => {
    try {
      await apiService.deleteSchedule(id);
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  return (
    <ProtectedRoute>
        <Grid item xs={12}>
        <SchedulesTable
            schedules={schedules}
            sortField={sortField}
            sortOrder={sortOrder}
            searchTerm={searchTerm}
            onSort={handleSort}
            onSearch={handleSearch}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
        />
        </Grid>
    </ProtectedRoute>
  );
};

export default SchedulesPage;