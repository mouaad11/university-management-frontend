"use client";
import { Grid } from '@mui/material';
import RoomsTable from '../../components/dashboard/RoomsTable';
import type { Room } from '../../../../types';
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component
import apiService from '@/services/api';
import { useState, useEffect } from 'react'; // Import useEffect

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch rooms data when the component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiService.getAllRooms(); // Assuming you have a method to fetch rooms
        setRooms(response.data); // Update the state with the fetched data
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

// Handler for editing a room
const handleEditRoom = async (id: number, updatedData: any) => {
    try {
      const response = await apiService.updateRoom(id, updatedData);
      setRooms(rooms.map(room => 
        room.id === id ? response.data : room
      ));
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };
  
  // Handler for deleting a room
  const handleDeleteRoom = async (id: number) => {
    try {
      await apiService.deleteRoom(id);
      setRooms(rooms.filter(room => room.id !== id));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };
  

  return (
    <ProtectedRoute>
        <Grid item xs={12}>
        <RoomsTable
            rooms={rooms}
            sortField={sortField}
            sortOrder={sortOrder}
            searchTerm={searchTerm}
            onSort={handleSort}
            onSearch={handleSearch}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
        />
        </Grid>
    </ProtectedRoute>
  );
};

export default RoomsPage;