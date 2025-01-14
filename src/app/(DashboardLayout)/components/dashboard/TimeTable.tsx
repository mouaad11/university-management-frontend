import React from 'react';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, Box, Chip, Grid } from '@mui/material';
import { Schedule } from '@/types';

const TimeTable = ({ schedules }: { schedules: Schedule[] }) => {
    // Step 1: Group schedules by day and timeslot
    const groupedSchedules: Record<string, Record<string, Schedule[]>> = {};

    schedules.forEach((schedule) => {
        const day = schedule.dayOfWeek;
        const timeslot = `${schedule.startTime} - ${schedule.endTime}`;

        if (!groupedSchedules[day]) {
            groupedSchedules[day] = {};
        }
        if (!groupedSchedules[day][timeslot]) {
            groupedSchedules[day][timeslot] = [];
        }

        groupedSchedules[day][timeslot].push(schedule);
    });

    // Step 2: Get all unique timeslots
    const allTimeslots = Array.from(
        new Set(schedules.map((s) => `${s.startTime} - ${s.endTime}`))
    ).sort();

    // Step 3: Get all unique days and sort them in the correct order
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const allDays = Object.keys(groupedSchedules).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    return (
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
                                {allDays.map((day) => (
                                    <TableCell key={day}>{day}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allTimeslots.map((timeslot) => (
                                <TableRow key={timeslot}>
                                    <TableCell>{timeslot}</TableCell>
                                    {allDays.map((day) => (
                                        <TableCell key={`${day}-${timeslot}`}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {groupedSchedules[day]?.[timeslot]?.map((schedule) => (
                                                    <Chip
                                                        key={schedule.id}
                                                        label={`${schedule.room.roomNumber} - ${schedule.classe?.name}`}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                )) || <Typography variant="body2" color="textSecondary">No classes</Typography>}
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
    );
};

export default TimeTable;