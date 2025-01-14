import React from 'react';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';
import { sortData, searchData } from './SortAndSearchUtils';
import { Schedule } from '@/types';

interface SchedulesTableProps {
  schedules: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
  onSort: (field: string) => void;
  onSearch: (term: string) => void;
  onEdit: (id: number, updatedData: any) => void;
  onDelete: (id: number) => void;
}

const SchedulesTable: React.FC<SchedulesTableProps> = ({ schedules, sortField, sortOrder, searchTerm, onSort, onSearch, onEdit, onDelete }) => {
  const sortedSchedules: Schedule[] = sortData<Schedule>(schedules, sortField, sortOrder);
  const filteredSchedules = searchData(sortedSchedules, searchTerm, ['subject', 'dayOfWeek', 'startTime', 'endTime']);
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Schedules</Typography>
        <TextField
          label="Search Schedules"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => onSort('classe.name')}>Filière</TableCell>
              <TableCell onClick={() => onSort('professor.lastName')}>Professeur</TableCell>
              <TableCell onClick={() => onSort('subject')}>Subject</TableCell>
              <TableCell onClick={() => onSort('dayOfWeek')}>Day of Week</TableCell>
              <TableCell onClick={() => onSort('startTime')}>Start Time</TableCell>
              <TableCell onClick={() => onSort('endTime')}>End Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSchedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.classe?.name || 'N/A'}</TableCell>
                <TableCell>{schedule.professor?.lastName || 'N/A'}</TableCell>
                <TableCell>{schedule.subject}</TableCell>
                <TableCell>{schedule.dayOfWeek}</TableCell>
                <TableCell>{schedule.startTime}</TableCell>
                <TableCell>{schedule.endTime}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small">Edit</Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => onDelete(schedule.id)} // Pass student ID for deletion
                  >
                    Delete
                  </Button>           
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SchedulesTable;