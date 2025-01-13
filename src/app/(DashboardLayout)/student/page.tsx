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
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component


export default function StudentDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);

  const studentId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get student info to get their class
        const studentResponse = await apiService.getStudentById(studentId);
        setStudentInfo(studentResponse.data);
        
        // Then get all schedules and filter by student's class
        const schedulesResponse = await apiService.getAllSchedules();
        const classSchedules = schedulesResponse.data.filter(
          schedule => schedule.classe?.id === studentResponse.data.classe.id
        );
        setSchedules(classSchedules);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [studentId]);

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
        {/* Student Info Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Class Information</Typography>
              <Typography variant="body1">
                Class: {studentInfo?.classe.name}
              </Typography>
              <Typography variant="body1">
                Department: {studentInfo?.classe.department}
              </Typography>
              <Typography variant="body1">
                Academic Year: {studentInfo?.classe.academicYear}
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
                    <TableCell>Professor</TableCell>
                    <TableCell>Room</TableCell>
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