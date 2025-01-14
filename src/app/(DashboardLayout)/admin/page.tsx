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
      message: `La salle choisie est occupée pendant la période séléctionnée. les cours en conflit sont: ${conflictingTimes}`,
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
          setSnackbarMessage('Tous les champs sont obligatoires');
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
          setSnackbarMessage('Cours crée avec succès');
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
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleApproveRequest = async (id: number) => {
    try {
      await apiService.approveRoomRequest(id);
      setPendingRequests(pendingRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      await apiService.rejectRoomRequest(id);
      setPendingRequests(pendingRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    }
  };

  const getRequesterName = (request: RoomRequest) => {
    if (request.professor) {
      return `${request.professor.firstName} ${request.professor.lastName}`;
    }
    if (request.student) {
      return `${request.student.firstName} ${request.student.lastName}`;
    }
    return 'Inconnu';
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
  {/* Sélection de la Classe */}
<FormControl fullWidth>
  <InputLabel>Classe</InputLabel>
  <Select
    name="classeId"
    value={formData.classeId}
    label="Classe"
    onChange={handleClasseChange} // Gestionnaire mis à jour pour récupérer l'objet de la classe
  >
    {classes.map((classe) => (
      <MenuItem key={classe.id} value={classe.id}>
        {classe.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

{/* Sélection du Professeur */}
<FormControl fullWidth>
  <InputLabel>Professeur</InputLabel>
  <Select
    name="professorId"
    value={formData.professorId}
    label="Professeur"
    onChange={handleProfessorChange}
  >
    {professors.map((professor) => (
      <MenuItem key={professor.id} value={professor.id}>
        {`${professor.firstName} ${professor.lastName}`}
      </MenuItem>
    ))}
  </Select>
</FormControl>

{/* Sélection de la Salle */}
<FormControl fullWidth>
  <InputLabel>Salle</InputLabel>
  <Select
    name="roomId"
    value={formData.roomId}
    label="Salle"
    onChange={handleRoomChange}
  >
    {rooms.map((room) => (
      <MenuItem key={room.id} value={room.id}>
        {room.roomNumber}
      </MenuItem>
    ))}
  </Select>
</FormControl>

{/* Sélection du Jour de la Semaine */}
<FormControl fullWidth>
  <InputLabel>Jour de la Semaine</InputLabel>
  <Select
    name="dayOfWeek"
    value={formData.dayOfWeek}
    label="Jour de la Semaine"
    onChange={handleFormChange}
  >
    {daysOfWeek.map((day) => (
      <MenuItem key={day} value={day}>
        {day}
      </MenuItem>
    ))}
  </Select>
</FormControl>

{/* Heure de Début */}
<TextField
  name="startTime"
  label="Heure de Début"
  type="time"
  value={formData.startTime}
  onChange={handleFormChange}
  InputLabelProps={{ shrink: true }}
  inputProps={{ step: 300 }} // Intervalles de 5 minutes
/>

{/* Heure de Fin */}
<TextField
  name="endTime"
  label="Heure de Fin"
  type="time"
  value={formData.endTime}
  onChange={handleFormChange}
  InputLabelProps={{ shrink: true }}
  inputProps={{ step: 300 }} // Intervalles de 5 minutes
/>

{/* Matière */}
<TextField
  name="subject"
  label="Matière"
  value={formData.subject}
  onChange={handleFormChange}
/>

{/* Sélection du Type */}
<FormControl fullWidth>
  <InputLabel>Type</InputLabel>
  <Select
    name="type"
    value={formData.type}
    label="Type"
    onChange={handleFormChange}
  >
    <MenuItem value="COURSE">Cours</MenuItem>
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
    label="Nom d'utilisateur"
    value={formData.username}
    onChange={handleFormChange}
    required
  />
  <TextField
    name="password"
    label="Mot de passe"
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
    label="Prénom"
    value={formData.firstName}
    onChange={handleFormChange}
    required
  />
  <TextField
    name="lastName"
    label="Nom de famille"
    value={formData.lastName}
    onChange={handleFormChange}
    required
  />
  <TextField
    name="studentId"
    label="Identifiant Étudiant"
    value={formData.studentId}
    onChange={handleFormChange}
    required
  />
  <FormControl fullWidth required>
    <InputLabel>Classe</InputLabel>
    <Select
      name="classeId"
      value={formData.classeId}
      label="Classe"
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
    label="Nom d'utilisateur"
    value={formData.username}
    onChange={handleFormChange}
    required
  />
  <TextField
    name="password"
    label="Mot de passe"
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
  label="Prénom"
  value={formData.firstName}
  onChange={handleFormChange}
  required
/>
<TextField
  name="lastName"
  label="Nom de famille"
  value={formData.lastName}
  onChange={handleFormChange}
  required
/>
<TextField
  name="department"
  label="Département"
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
    label="Numéro de Salle"
    value={formData.roomNumber}
    onChange={handleFormChange}
    required
  />
  <TextField
    name="capacity"
    label="Capacité"
    type="number"
    value={formData.capacity}
    onChange={handleFormChange}
    required
  />
  <TextField
    name="building"
    label="Bâtiment"
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
    <InputLabel>Disponibilité</InputLabel>
    <Select
      name="isAvailable"
      value={formData.isAvailable}
      label="Disponibilité"
      onChange={handleFormChange}
    >
      <MenuItem>Disponible</MenuItem>
      <MenuItem>Indisponible</MenuItem>
    </Select>
  </FormControl>
</Box>
);

case 'class':
return (
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  <TextField
    name="name"
    label="Nom"
    value={formData.name}
    onChange={handleFormChange}
    required
  />
  <TextField
    name="academicYear"
    label="Année Académique"
    value={formData.academicYear}
    onChange={handleFormChange}
    required
  />
  <TextField
    name="department"
    label="Département"
    value={formData.department}
    onChange={handleFormChange}
    required
  />
</Box>
);
}
};

return (
<ProtectedRoute> {/* Encapsuler tout le tableau de bord avec ProtectedRoute */}
<Head>
    <link rel="icon" href="@/app/favicon.ico" />
  </Head>
<Container maxWidth="lg" className="mt-4">
  <Grid container spacing={4}>
    {/* Cartes de Résumé */}
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Total des Salles</Typography>
          <Typography variant="h3">{rooms.length}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Demandes en Attente</Typography>
          <Typography variant="h3">{pendingRequests.length}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Emplois du Temps Actifs</Typography>
          <Typography variant="h3">{schedules.length}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Comptes Non Confirmés</Typography>
          <Typography variant="h3">{unconfirmedUsers.length}</Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Boutons d'Action */}
    <Grid item xs={12}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => handleOpenDialog('schedule')}>
          Ajouter un Emploi du Temps
        </Button>
        <Button variant="contained" onClick={() => handleOpenDialog('student')}>
          Ajouter un Étudiant
        </Button>
        <Button variant="contained" onClick={() => handleOpenDialog('professor')}>
          Ajouter un Professeur
        </Button>
        <Button variant="contained" onClick={() => handleOpenDialog('room')}>
          Ajouter une Salle
        </Button>
        <Button variant="contained" onClick={() => handleOpenDialog('class')}>
          Ajouter une Classe
        </Button>
      </Box>
    </Grid>
    {/* Tableau des Utilisateurs Non Confirmés */}
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Utilisateurs Non Confirmés</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
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
                        'studentId' in user ? 'Étudiant' : 
                        'department' in user ? 'Professeur' : 'Utilisateur'
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
  Confirmer l'Utilisateur
</Button>
</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</CardContent>
</Card>
</Grid>

{/* Tableau des Demandes en Attente */}
<Grid item xs={12}>
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Demandes de Salle en Attente
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Demandeur</TableCell>
            <TableCell>Salle</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Heure</TableCell>
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
                    Approuver
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Rejeter
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
{/* Emploi du Temps */}
<Grid item xs={12}>
  <TimeTable schedules={schedules} />
</Grid>
{/* Boîte de Dialogue pour Ajouter des Données */}
<Dialog open={openDialog} onClose={handleCloseDialog}>
  <DialogTitle>
    {`Ajouter ${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}`}
  </DialogTitle>
  <DialogContent>
    {renderDialogContent()}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog}>Annuler</Button>
    <Button onClick={handleSubmit} variant="contained">
      Soumettre
    </Button>
  </DialogActions>
</Dialog>
</Container>
<Snackbar
  open={snackbarOpen}
  autoHideDuration={snackbarDuration}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Pour une meilleure visibilité
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