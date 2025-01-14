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
  Box,
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
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component

export default function ProfessorDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [professor, setProfessor] = useState<Professor | undefined>(undefined);
  const [classes, setClasses] = useState<Classe[]>([]); // New state for classes
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>(''); // New state for selected class
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
        const [schedulesData, roomsData, professorData, classesData] = await Promise.all([
          apiService.getProfessorSchedules(professorId),
          apiService.getAvailableRooms(),
          apiService.getProfessorById(professorId),
          apiService.getAllClasses() // Fetch all classes
        ]);
        setSchedules(schedulesData.data);
        setAvailableRooms(roomsData.data);
        setProfessor(professorData.data);
        setClasses(classesData.data); // Set classes
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
        classe: classes.find(classe => classe.id === Number(selectedClass)), // Add selected class
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

  const groupSchedulesByDay = (schedules: Schedule[]) => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days.map(day => ({
      day,
      schedules: schedules.filter(schedule => schedule.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    }));
  };

  return (
    <ProtectedRoute> {/* Wrap the entire dashboard with ProtectedRoute */}
      <Container maxWidth="lg" className="mt-4">
        <Grid container spacing={4}>
          {/* Professor Info Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Professor Information</Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setOpenRequestDialog(true)}
                  >
                    Request Room
                  </Button>
                </Box>
                <Typography variant="body1">
                  Name: {`${professor?.firstName} ${professor?.lastName}`}
                </Typography>
                <Typography variant="body1">
                  Department: {professor?.department}
                </Typography>
                <Typography variant="body1">
                  Email: {professor?.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Schedule */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Weekly Schedule</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupSchedulesByDay(schedules).map(({ day, schedules }) => (
                      <React.Fragment key={day}>
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {day}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {schedules.map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell>{`${schedule.startTime} - ${schedule.endTime}`}</TableCell>
                            <TableCell>{schedule.subject}</TableCell>
                            <TableCell>{`${schedule.room.roomNumber} (${schedule.room.building})`}</TableCell>
                            <TableCell>{schedule.type}</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
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
            {/* Room Select */}
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

            {/* Class Name Select */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Class Name</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Day of Week Select */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={requestDetails.dayOfWeek}
                onChange={(e) => setRequestDetails({...requestDetails, dayOfWeek: e.target.value})}
              >
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Start Time */}
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={requestDetails.startTime}
              onChange={(e) => setRequestDetails({...requestDetails, startTime: e.target.value})}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            {/* End Time */}
            <TextField
              fullWidth
              label="End Time"
              type="time"
              value={requestDetails.endTime}
              onChange={(e) => setRequestDetails({...requestDetails, endTime: e.target.value})}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Subject */}
            <TextField
              fullWidth
              label="Subject"
              value={requestDetails.subject}
              onChange={(e) => setRequestDetails({...requestDetails, subject: e.target.value})}
              sx={{ mt: 2 }}
            />

            {/* Type Select */}
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