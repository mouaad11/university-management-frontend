'use client';
import React, { useState, useEffect } from 'react';
import { Box } from '@mui/system';
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { apiService } from '../../../services/api';
import type { Room, Schedule, RoomRequest, User, Student, Professor, Classe } from '../../../types';
/*
i need to fix json response (@JsonIgnoreProperties) in
professors/id/scedules and then focus
on the error why schedule.room.roomnumber is undefined

*/
export default function ProfessorDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [professor, setProfessor] = useState<Professor | undefined>(undefined);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [requestDetails, setRequestDetails] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    subject: '',
    type: ''
  });

  const professorId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesData, roomsData, professorData] = await Promise.all([
          apiService.getProfessorSchedules(professorId),
          apiService.getAvailableRooms(),
          apiService.getProfessorById(professorId)
        ]);
        setSchedules(schedulesData.data);
        setAvailableRooms(roomsData.data);
        setProfessor(professorData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [professorId]);

  const handleRequestRoom = async () => {
    try {
      const request: Partial<RoomRequest> = {
        room: availableRooms.find(room => room.id === Number(selectedRoom)),
        dayOfWeek: requestDetails.dayOfWeek,
        startTime: requestDetails.startTime,
        endTime: requestDetails.endTime,
        subject: requestDetails.subject,
        type: requestDetails.type,
        professor: professor
      };
      await apiService.createRoomRequest(request as RoomRequest);
      setOpenRequestDialog(false);
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  return (
    <ProtectedRoute> {/* Wrap the entire dashboard with ProtectedRoute */}

    <Container maxWidth="lg" className="mt-4">
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">My Schedule</Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setOpenRequestDialog(true)}
                >
                  Request Room
                </Button>
              </Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.dayOfWeek}</TableCell>
                      <TableCell>{`${schedule.startTime} - ${schedule.endTime}`}</TableCell>
                      <TableCell>{schedule.room.roomNumber}</TableCell>
                      <TableCell>{schedule.subject}</TableCell>
                      <TableCell>{schedule.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)}>
        <DialogTitle>Request Room</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Room</InputLabel>
            <Select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              {availableRooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {`${room.roomNumber} (${room.building})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Day of Week"
            value={requestDetails.dayOfWeek}
            onChange={(e) => setRequestDetails({...requestDetails, dayOfWeek: e.target.value})}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Start Time"
            type="time"
            value={requestDetails.startTime}
            onChange={(e) => setRequestDetails({...requestDetails, startTime: e.target.value})}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Time"
            type="time"
            value={requestDetails.endTime}
            onChange={(e) => setRequestDetails({...requestDetails, endTime: e.target.value})}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Subject"
            value={requestDetails.subject}
            onChange={(e) => setRequestDetails({...requestDetails, subject: e.target.value})}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={requestDetails.type}
              onChange={(e) => setRequestDetails({...requestDetails, type: e.target.value})}
            >
              <MenuItem value="COURSE">Course</MenuItem>
              <MenuItem value="TD">TD</MenuItem>
              <MenuItem value="TP">TP</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleRequestRoom} variant="contained">Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Container>
    </ProtectedRoute>

  );
}