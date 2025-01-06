'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box
} from '@mui/material';
import { apiService } from '../../../services/api';
import type { Room, RoomRequest, Schedule } from '../../../types';

export default function AdminDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RoomRequest[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, requestsData, schedulesData] = await Promise.all([
          apiService.getAllRooms(),
          apiService.getPendingRequests(),
          apiService.getAllSchedules()
        ]);
        setRooms(roomsData.data);
        setPendingRequests(requestsData.data);
        setSchedules(schedulesData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleApproveRequest = async (id: number) => {
    try {
      await apiService.approveRoomRequest(id);
      setPendingRequests(pendingRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      await apiService.rejectRoomRequest(id);
      setPendingRequests(pendingRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <Container maxWidth="lg" className="mt-4">
      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Rooms</Typography>
              <Typography variant="h3">{rooms.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Requests</Typography>
              <Typography variant="h3">{pendingRequests.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Schedules</Typography>
              <Typography variant="h3">{schedules.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Requests Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending Room Requests</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Professor</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{`${request.professor.firstName} ${request.professor.lastName}`}</TableCell>
                      <TableCell>{request.room.roomNumber}</TableCell>
                      <TableCell>{request.dayOfWeek}</TableCell>
                      <TableCell>{`${request.startTime} - ${request.endTime}`}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}