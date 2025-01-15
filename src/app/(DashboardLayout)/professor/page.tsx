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
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Importer le composant ProtectedRoute

export default function ProfessorDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [professor, setProfessor] = useState<Professor | undefined>(undefined);
  const [classes, setClasses] = useState<Classe[]>([]); // Nouvel état pour les classes
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>(''); // Nouvel état pour la classe sélectionnée
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
          apiService.getAllClasses() // Récupérer toutes les classes
        ]);
        setSchedules(schedulesData.data);
        setAvailableRooms(roomsData.data);
        setProfessor(professorData.data);
        setClasses(classesData.data); // Définir les classes
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    fetchData();
  }, [professorId]);

  const handleRequestRoom = async () => {
    try {
      const request: Partial<RoomRequest> = {
        room: availableRooms.find(room => room.id === Number(selectedRoom)),
        classe: classes.find(classe => classe.id === Number(selectedClass)), // Ajouter la classe sélectionnée
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
      console.error('Erreur lors de la création de la demande:', error);
    }
  };

  const groupSchedulesByDay = (schedules: Schedule[]) => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return days.map(day => ({
      day,
      schedules: schedules.filter(schedule => schedule.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    }));
  };

  return (
    <ProtectedRoute> {/* Encapsuler tout le tableau de bord avec ProtectedRoute */}
      <Container maxWidth="lg" className="mt-4">
        <Grid container spacing={4}>
          {/* Carte d'Informations du Professeur */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Informations du Professeur</Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setOpenRequestDialog(true)}
                  >
                    Demander une Salle
                  </Button>
                </Box>
                <Typography variant="body1">
                  Nom: {`${professor?.firstName} ${professor?.lastName}`}
                </Typography>
                <Typography variant="body1">
                  Département: {professor?.department}
                </Typography>
                <Typography variant="body1">
                  Email: {professor?.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Emploi du Temps Hebdomadaire */}
<Grid item xs={12}>
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>Emploi du Temps Hebdomadaire</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Heure</TableCell>
            <TableCell>Matière</TableCell>
            <TableCell>Salle</TableCell>
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
  <DialogTitle>Demander une Salle</DialogTitle>
  <DialogContent>
    {/* Sélection de la Salle */}
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Salle</InputLabel>
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

    {/* Sélection du Nom de la Classe */}
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Nom de la Classe</InputLabel>
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

    {/* Sélection du Jour de la Semaine */}
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Jour de la Semaine</InputLabel>
      <Select
        value={requestDetails.dayOfWeek}
        onChange={(e) => setRequestDetails({...requestDetails, dayOfWeek: e.target.value})}
      >
        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
          <MenuItem key={day} value={day}>
            {day}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Heure de Début */}
    <TextField
      fullWidth
      label="Heure de Début"
      type="time"
      value={requestDetails.startTime}
      onChange={(e) => setRequestDetails({...requestDetails, startTime: e.target.value})}
      sx={{ mt: 2 }}
      InputLabelProps={{ shrink: true }}
    />

    {/* Heure de Fin */}
    <TextField
      fullWidth
      label="Heure de Fin"
      type="time"
      value={requestDetails.endTime}
      onChange={(e) => setRequestDetails({...requestDetails, endTime: e.target.value})}
      sx={{ mt: 2 }}
      InputLabelProps={{ shrink: true }}
    />

    {/* Matière */}
    <TextField
      fullWidth
      label="Matière"
      value={requestDetails.subject}
      onChange={(e) => setRequestDetails({...requestDetails, subject: e.target.value})}
      sx={{ mt: 2 }}
    />

    {/* Sélection du Type */}
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Type</InputLabel>
      <Select
        value={requestDetails.type}
        onChange={(e) => setRequestDetails({...requestDetails, type: e.target.value})}
      >
        <MenuItem value="COURSE">Cours</MenuItem>
        <MenuItem value="TD">TD</MenuItem>
        <MenuItem value="TP">TP</MenuItem>
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenRequestDialog(false)}>Annuler</Button>
    <Button onClick={handleRequestRoom} variant="contained">Soumettre la Demande</Button>
  </DialogActions>
</Dialog>
</Container>
</ProtectedRoute>
);
}