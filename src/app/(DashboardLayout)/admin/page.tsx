/*
when the admin tries to create a student or prof, you need to pass
the signup api not create..

make every crud table on its own page

fix edit crud on lists

translate
*/
'use client';
import React, { useState, useEffect } from 'react';
import StudentsTable from '../components/dashboard/StudentsTable';
import ProfessorsTable from '../components/dashboard/ProfessorsTable';
import SchedulesTable from '../components/dashboard/SchedulesTable';
import RoomsTable from '../components/dashboard/RoomsTable';
import TimeTable from '../components/dashboard/TimeTable';
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
  InputLabel,
  SelectChangeEvent,
  Snackbar,
  Alert
} from '@mui/material';
import { apiService } from '../../../services/api';
import type { Room, RoomRequest, Schedule, Student, Professor, Classe, User } from '../../../types';
import { isClassElement } from 'typescript';
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component
import Head from 'next/head';



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
    professor: null as Professor |null,
    room: null as Room |null,
    classe: null as Classe |null,
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
    classeId: '',
    classe: null as Classe |null
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
  // snackbar
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [snackbarDuration, setSnackbarDuration] = useState<number>(30000); // 30 seconds

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
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
  const [classeData, setSelectedClasse] = useState<Classe | undefined>(undefined);
  const [professorData, setSelectedProfessor] = useState<Professor | undefined>(undefined);

  //CRUD tables
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

 // timetable check overlap
 const checkForOverlap = (
  schedules: Schedule[],
  roomId: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string
) => {
  // Convert time strings to minutes for easier comparison
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  // Parse roomId to number for consistent comparison
  const roomIdNum = parseInt(roomId, 10);

  // Find conflicting schedules
  const conflictingSchedules = schedules.filter((schedule) => {
    // Ensure we're comparing numbers with numbers
    if (schedule.room.id === roomIdNum && schedule.dayOfWeek === dayOfWeek) {
      const existingStart = toMinutes(schedule.startTime);
      const existingEnd = toMinutes(schedule.endTime);

      // Check for overlap
      const hasOverlap = (
        (newStart >= existingStart && newStart < existingEnd) || // New schedule starts during existing schedule
        (newEnd > existingStart && newEnd <= existingEnd) || // New schedule ends during existing schedule
        (newStart <= existingStart && newEnd >= existingEnd) // New schedule completely overlaps existing schedule
      );

      /* Add debug logging
      console.log({
        newSchedule: { roomId: roomIdNum, start: newStart, end: newEnd },
        existingSchedule: { 
          roomId: schedule.room.id, 
          start: existingStart, 
          end: existingEnd 
        },
        hasOverlap
      });*/

      return hasOverlap;
    }
    return false;
  });

  if (conflictingSchedules.length > 0) {
    const conflictingTimes = conflictingSchedules
      .map(
        (s) =>
          `${s.dayOfWeek} ${s.startTime} - ${s.endTime} (${s.classe?.name || "No class"})`
      )
      .join(", ");

    return {
      isOverlap: true,
      conflictingSchedules,
      message: `Room is occupied at the selected time. Conflicting schedules: ${conflictingTimes}`,
    };
  }

  return { isOverlap: false, conflictingSchedules: [], message: "" };
};


  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  //crud handlers
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
        if (!formData.professorId || !formData.roomId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
          setSnackbarSeverity('error');
          setSnackbarMessage('All fields are required');
          setSnackbarOpen(true);
          return;
        }
  
        const { isOverlap, message } = checkForOverlap(
          schedules,
          formData.roomId,
          formData.dayOfWeek,
          formData.startTime,
          formData.endTime
        );
  
        if (isOverlap) {
          setSnackbarSeverity('error');
          setSnackbarMessage(message);
          setSnackbarOpen(true);
          setOpenDialog(false); // Close the dialog when there's an overlap
          return;
        }
      }
  
      // Proceed with form submission based on dialogType
      switch (dialogType) {
        case 'schedule':
          await apiService.createSchedule(formData);
          setSnackbarSeverity('success');
          setSnackbarMessage('Schedule created successfully');
          break;
          //rest of code 
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
    // console.log('Schedule:', schedule);
    // console.log('Database day :', schedule.dayOfWeek.toLowerCase(), 'frontend day: ', day.toLowerCase());
    // console.log('Database start time :', schedule.startTime, 'frontend start time: ', timeslot.start);
    // console.log('Database end time :',schedule.endTime , 'frontend end time: ', timeslot.end);

    //console.log('Timeslot:', timeslot);
    // console.log('Match:', schedule.dayOfWeek.toLowerCase() === day.toLowerCase() &&
      // schedule.startTime === timeslot.start &&
      // schedule.endTime === timeslot.end);
  
    return (
      schedule.dayOfWeek.toLowerCase() === day.toLowerCase() &&
      schedule.startTime === timeslot.start &&
      schedule.endTime === timeslot.end
    );
  };


  const fetchClassName = async (classeId: number) => {
    try {
      const response = await apiService.getClassById(classeId);
      setSelectedClasse(response.data); // Access the 'data' property to get the Classe object
    } catch (error) {
      console.error('Error fetching class:', error);
    }
  };

  const fetchProfessorName = async (professorId: number) => {
    try {
      const response = await apiService.getProfessorById(professorId);
      setSelectedProfessor(response.data); // Access the 'data' property to get the Classe object
    } catch (error) {
      console.error('Error fetching professor:', error);
    }
  };
  // Render dialog content based on type
  const renderDialogContent = () => {
    const handleProfessorChange = async (event: SelectChangeEvent) => {
      const selectedProfessorId = Number(event.target.value);
    
      // First, update the professorId in the form
      handleFormChange(event);
    
      try {
        // Fetch the complete professor object
        const professorResponse = await apiService.getProfessorById(selectedProfessorId);
        const professor = professorResponse.data;
    
        // Update the formData to include both professorId and professor object
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          professorId: selectedProfessorId,
          professor: professor
        }));
      } catch (error) {
        console.error('Error fetching professor details:', error);
        // Handle error appropriately
      }
    };
    const handleRoomChange = async (event: SelectChangeEvent) => {
      const selectedRoomId = Number(event.target.value);
    
      // First, update the professorId in the form
      handleFormChange(event);
    
      try {
        // Fetch the complete professor object
        const roomResponse = await apiService.getRoomById(selectedRoomId);
        const room = roomResponse.data;
    
        // Update the formData to include both professorId and professor object
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          roomId: selectedRoomId,
          room: room
        }));
      } catch (error) {
        console.error('Error fetching room details:', error);
        // Handle error appropriately
      }
    };
    const handleClasseChange = async (event: SelectChangeEvent) => {
      const selectedClasseId = Number(event.target.value);
    
      // First, update the professorId in the form
      handleFormChange(event);
    
      try {
        // Fetch the complete professor object
        const classeResponse = await apiService.getClassById(selectedClasseId);
        const classe = classeResponse.data;
    
        // Update the formData to include both professorId and professor object
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          classeId: selectedClasseId,
          classe: classe
        }));
      } catch (error) {
        console.error('Error fetching classe details:', error);
        // Handle error appropriately
      }
    };
  
    switch (dialogType) {
      case 'schedule':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Class Select */}
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                name="classeId"
                value={formData.classeId}
                label="Class"
                onChange={handleClasseChange} // Updated handler to fetch class object
              >
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            {/* Professor Select */}
            <FormControl fullWidth>
              <InputLabel>Professor</InputLabel>
              <Select
                name="professorId"
                value={formData.professorId}
                label="Professor"
                onChange={handleProfessorChange}
              >
                {professors.map((professor) => (
                  <MenuItem key={professor.id} value={professor.id}>
                    {`${professor.firstName} ${professor.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            {/* Room Select */}
            <FormControl fullWidth>
              <InputLabel>Room</InputLabel>
              <Select
                name="roomId"
                value={formData.roomId}
                label="Room"
                onChange={handleRoomChange}
              >
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.roomNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            {/* Day of Week Select */}
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
  
            {/* Start Time Input */}
            <TextField
              name="startTime"
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }} // 5 min intervals
            />
  
            {/* End Time Input */}
            <TextField
              name="endTime"
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }} // 5 min intervals
            />
  
            {/* Subject Input */}
            <TextField
              name="subject"
              label="Subject"
              value={formData.subject}
              onChange={handleFormChange}
            />
  
            {/* Type Select */}
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
                onChange={handleClasseChange}
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
    <ProtectedRoute> {/* Wrap the entire dashboard with ProtectedRoute */}
    <Head>
        <link rel="icon" href="@/app/favicon.ico" />
      </Head>
    <Container maxWidth="lg" className="mt-4">
      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Rooms</Typography>
              <Typography variant="h3">{rooms.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Requests</Typography>
              <Typography variant="h3">{pendingRequests.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Schedules</Typography>
              <Typography variant="h3">{schedules.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Unconfirmed Users</Typography>
              <Typography variant="h3">{unconfirmedUsers.length}</Typography>
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
      </Grid>
      <br></br>
        {/* Timetable */}
  <Grid item xs={12}>
    <TimeTable schedules={schedules} />
  </Grid>
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
    <Snackbar
  open={snackbarOpen}
  autoHideDuration={snackbarDuration}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // This makes it more visible
>
  <Alert 
    onClose={handleCloseSnackbar}
    severity={snackbarSeverity}
    variant="filled"
    elevation={6}
    sx={{ width: '100%' }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
    </ProtectedRoute>

  );
  
}