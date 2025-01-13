import React from 'react';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';
import { sortData, searchData } from './SortAndSearchUtils';

interface StudentsTableProps {
  students: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
  onSort: (field: string) => void;
  onSearch: (term: string) => void;
  onEdit: (id: number, updatedData: any) => void;
  onDelete: (id: number) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  sortField,
  sortOrder,
  searchTerm,
  onSort,
  onSearch,
  onEdit,
  onDelete,
}) => {
  const sortedStudents = sortData(students, sortField, sortOrder);
  const filteredStudents = searchData(sortedStudents, searchTerm, ['firstName', 'lastName', 'email', 'studentId']);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Students</Typography>
        <TextField
          label="Search Students"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => onSort('firstName')}>First Name</TableCell>
              <TableCell onClick={() => onSort('lastName')}>Last Name</TableCell>
              <TableCell onClick={() => onSort('email')}>Email</TableCell>
              <TableCell onClick={() => onSort('studentId')}>Student ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onEdit(student.id, student)} // Pass student data for editing
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => onDelete(student.id)} // Pass student ID for deletion
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

export default StudentsTable;