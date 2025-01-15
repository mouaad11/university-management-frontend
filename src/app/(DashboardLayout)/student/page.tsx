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
  Box
} from '@mui/material';
import { apiService } from '../../../services/api';
import type { Schedule, Student } from '../../../types';
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Importer le composant ProtectedRoute

export default function StudentDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);

  const studentId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // D'abord, récupérer les informations de l'étudiant pour obtenir sa classe
        const studentResponse = await apiService.getStudentById(studentId);
        setStudentInfo(studentResponse.data);
        
        // Ensuite, récupérer tous les emplois du temps et filtrer par la classe de l'étudiant
        const schedulesResponse = await apiService.getAllSchedules();
        const classSchedules = schedulesResponse.data.filter(
          schedule => schedule.classe?.id === studentResponse.data.classe.id
        );
        setSchedules(classSchedules);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    fetchData();
  }, [studentId]);

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
          {/* Carte d'Informations de l'Étudiant */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Informations de la Classe</Typography>
                <Typography variant="body1">
                  Classe: {studentInfo?.classe.name}
                </Typography>
                <Typography variant="body1">
                  Département: {studentInfo?.classe.department}
                </Typography>
                <Typography variant="body1">
                  Année Académique: {studentInfo?.classe.academicYear}
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
                      <TableCell>Professeur</TableCell>
                      <TableCell>Salle</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupSchedulesByDay(schedules).map(({ day, schedules }) => (
                      <React.Fragment key={day}>
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {day}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {schedules.map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell>{`${schedule.startTime} - ${schedule.endTime}`}</TableCell>
                            <TableCell>{schedule.subject}</TableCell>
                            <TableCell>
                              {`${schedule.professor?.firstName} ${schedule.professor?.lastName}`}
                            </TableCell>
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
      </Container>
    </ProtectedRoute>
  );
}