/*
put that uncorfirmed user grid with the other three grid counters

I figured out that to create a schedule, the professor id is assigned
correctly, but we don't want a professor id num, we wanna pass the 
professor object, so use api call getprofbyid to actually feed formData
with the professor, and do the same with all objects that have
objects as attributes

add a list of students and schedules and so on ... with their Crud

when the admin tries to create a student or prof, you need to pass
the role aswell, because now the created user can't login because
they don't have a role
*/
'use client';
import React, { useState, useEffect } from 'react';
import {
  Chip,
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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { apiService } from '../../../services/api';
import type { Room, RoomRequest, Schedule, Student, Professor, Classe, User } from '../../../types';

// Form types for better type safety
type ScheduleForm = Omit<Schedule, 'id' | 'professor' | 'room' | 'classe'> & {
  professorId: number;
  roomId: number;
  classeId: number | null;
};

type StudentForm = Omit<Student, 'id' | 'classe'> & {
  classeId: number;
};

type ProfessorForm = Omit<Professor, 'id' | 'schedules'>;

type RoomForm = Omit<Room, 'id'>;

type ClasseForm = Omit<Classe, 'id'>;

type DialogFormType = 'schedule' | 'student' | 'professor' | 'room' | 'class';

const initialFormState = {
  schedule: {
    classeId: '' ,
    professorId: '',
    roomId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    subject: '',
    type: 'COURSE' as 'COURSE' | 'TD' | 'TP'
  },
  student: {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    studentId: '',
    classeId: ''
  },
  professor: {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    department: ''
  },
  room: {
    roomNumber: '',
    capacity: 0,
    building: '',
    type: '',
    isAvailable: true
  },
  class: {
    name: '',
    academicYear: '',
    department: ''
  }
};

export default function AdminDashboard() {
  // State management
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RoomRequest[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [unconfirmedUsers, setUnconfirmedUsers] = useState<User[]>([]);
  const [dialogType, setDialogType] = useState<DialogFormType>('schedule');
  const [formData, setFormData] = useState<any>(initialFormState.schedule);

  // Constants
  const timeslots = [
    { start: '08:30', end: '10:30' },
    { start: '10:30', end: '12:30' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' }
  ];

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, requestsData, schedulesData, studentsData, professorsData, classesData, usersData] = await Promise.all([
          apiService.getAllRooms(),
          apiService.getPendingRequests(),
          apiService.getAllSchedules(),
          apiService.getAllStudents(),
          apiService.getAllProfessors(),
          apiService.getAllClasses(),
          apiService.getAllUsers()
        ]);

        setRooms(roomsData.data);
        setPendingRequests(requestsData.data);
        setSchedules(schedulesData.data);
        setStudents(studentsData.data);
        setProfessors(professorsData.data);
        setClasses(classesData.data);
         // Filter only unconfirmed users
        setUnconfirmedUsers(usersData.data.filter(user => !user.isConfirmed));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleConfirmUser = async (userId: number) => {
    try {
      await apiService.confirmUserAccount(userId);
      // Remove the confirmed user from the list
      setUnconfirmedUsers(unconfirmedUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error confirming user:', error);
    }
  };
  const handleOpenDialog = (type: DialogFormType) => {
    setDialogType(type);
    setFormData(initialFormState[type]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormState[dialogType]);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
    { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'professorId' || name === 'roomId' || name === 'classeId') 
    ? Number(value) 
    : value;

  setFormData((prev: any) => ({
    ...prev,
    [name]: parsedValue
  }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields before submission
      if (dialogType === 'schedule') {
        if (!formData.professorId || !formData.roomId || !formData.dayOfWeek) {
          console.error('Required fields are missing');
          return;
        }
      }
  
      switch (dialogType) {
        case 'schedule':
          await apiService.createSchedule(formData);
          break;
        case 'student':
          await apiService.createStudent(formData);
          break;
        case 'professor':
          await apiService.createProfessor(formData);
          break;
        case 'room':
          await apiService.createRoom(formData);
          break;
        case 'class':
          await apiService.createClass(formData);
          break;
      }
      handleCloseDialog();
  
      // Refetch data
      const fetchData = async () => {
        const [roomsData, requestsData, schedulesData, studentsData, professorsData, classesData] = await Promise.all([
          apiService.getAllRooms(),
          apiService.getPendingRequests(),
          apiService.getAllSchedules(),
          apiService.getAllStudents(),
          apiService.getAllProfessors(),
          apiService.getAllClasses()
        ]);
        setRooms(roomsData.data);
        setPendingRequests(requestsData.data);
        setSchedules(schedulesData.data);
        setStudents(studentsData.data);
        setProfessors(professorsData.data);
        setClasses(classesData.data);
      };
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

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

  const getRequesterName = (request: RoomRequest) => {
    if (request.professor) {
      return `${request.professor.firstName} ${request.professor.lastName}`;
    }
    if (request.student) {
      return `${request.student.firstName} ${request.student.lastName}`;
    }
    return 'Unknown';
  };

  const isScheduleInSlot = (schedule: Schedule, day: string, timeslot: { start: string; end: string }) => {
    return (
      schedule.dayOfWeek.toLowerCase() === day.toLowerCase() &&
      schedule.startTime === timeslot.start &&
      schedule.endTime === timeslot.end
    );
  };

  // Render dialog content based on type
  const renderDialogContent = () => {
    switch (dialogType) {
      case 'schedule':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           <FormControl fullWidth>
  <InputLabel>Class</InputLabel>
  <Select
    name="classeId"
    value={formData.classeId}
    label="Class"
    onChange={handleFormChange}
  >
    {classes.map((classe) => (
      <MenuItem key={classe.id} value={classe.id}>
        {classe.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl fullWidth>
  <InputLabel>Professor</InputLabel>
  <Select
    name="professorId"
    value={formData.professorId}
    label="Professor"
    onChange={handleFormChange}
  >
    {professors.map((professor) => (
      <MenuItem key={professor.id} value={professor.id}>
        {`${professor.firstName} ${professor.lastName}`}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl fullWidth>
  <InputLabel>Room</InputLabel>
  <Select
    name="roomId"
    value={formData.roomId}
    label="Room"
    onChange={handleFormChange}
  >
    {rooms.map((room) => (
      <MenuItem key={room.id} value={room.id}>
        {room.roomNumber}
      </MenuItem>
    ))}
  </Select>
</FormControl>
            <FormControl fullWidth>
              <InputLabel>Day of Week</InputLabel>
              <Select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                label="Day of Week"
                onChange={handleFormChange}
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="startTime"
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
            <TextField
              name="endTime"
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
            <TextField
              name="subject"
              label="Subject"
              value={formData.subject}
              onChange={handleFormChange}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Type"
                onChange={handleFormChange}
              >
                <MenuItem value="COURSE">Course</MenuItem>
                <MenuItem value="TD">TD</MenuItem>
                <MenuItem value="TP">TP</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 'student':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="studentId"
              label="Student ID"
              value={formData.studentId}
              onChange={handleFormChange}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Class</InputLabel>
              <Select
                name="classeId"
                value={formData.classeId}
                label="Class"
                onChange={handleFormChange}
              >
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 'professor':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="department"
              label="Department"
              value={formData.department}
              onChange={handleFormChange}
              required
            />
          </Box>
        );

      case 'room':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="roomNumber"
              label="Room Number"
              value={formData.roomNumber}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="capacity"
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="building"
              label="Building"
              value={formData.building}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="type"
              label="Type"
              value={formData.type}
              onChange={handleFormChange}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Availability</InputLabel>
              <Select
                name="isAvailable"
                value={formData.isAvailable}
                label="Availability"
                onChange={handleFormChange}
              >
                <MenuItem>Available</MenuItem>
                <MenuItem>Unavailable</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 'class':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="academicYear"
              label="Academic Year"
              value={formData.academicYear}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="department"
              label="Department"
              value={formData.department}
              onChange={handleFormChange}
              required
            />
          </Box>
        );
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

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => handleOpenDialog('schedule')}>
              Add Schedule
            </Button>
            <Button variant="contained" onClick={() => handleOpenDialog('student')}>
              Add Student
            </Button>
            <Button variant="contained" onClick={() => handleOpenDialog('professor')}>
              Add Professor
            </Button>
            <Button variant="contained" onClick={() => handleOpenDialog('room')}>
              Add Room
            </Button>
            <Button variant="contained" onClick={() => handleOpenDialog('class')}>
              Add Class
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Unconfirmed Users</Typography>
              <Typography variant="h3">{unconfirmedUsers.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Unconfirmed Users Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Unconfirmed Users</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unconfirmedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            'studentId' in user ? 'Student' : 
                            'department' in user ? 'Professor' : 'User'
                          }
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleConfirmUser(user.id)}
                        >
                          Confirm User
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Requests Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Room Requests
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Requester</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{getRequesterName(request)}</TableCell>
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

        {/* Timetable */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Room Timetable
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    {daysOfWeek.map((day) => (
                      <TableCell key={day}>{day}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeslots.map((timeslot) => (
                    <TableRow key={`${timeslot.start}-${timeslot.end}`}>
                      <TableCell>{`${timeslot.start} - ${timeslot.end}`}</TableCell>
                      {daysOfWeek.map((day) => (
                        <TableCell key={`${day}-${timeslot.start}-${timeslot.end}`}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {schedules
                              .filter((schedule) => isScheduleInSlot(schedule, day, timeslot))
                              .map((schedule) => (
                                <Chip
                                  key={schedule.id}
                                  label={`${schedule.room.roomNumber} - ${schedule.subject}`}
                                  color="primary"
                                  size="small"
                                />
                              ))}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for Adding Data */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {`Add ${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}`}
        </DialogTitle>
        <DialogContent>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}