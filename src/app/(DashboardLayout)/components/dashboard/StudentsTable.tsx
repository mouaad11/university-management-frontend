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
        <Typography variant="h6" gutterBottom>Étudiants</Typography>
        <TextField
          label="Rechercher des Étudiants"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => onSort('firstName')}>Prénom</TableCell>
              <TableCell onClick={() => onSort('lastName')}>Nom</TableCell>
              <TableCell onClick={() => onSort('email')}>Email</TableCell>
              <TableCell onClick={() => onSort('studentId')}>Identifiant Étudiant</TableCell>
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
                    onClick={() => onEdit(student.id, student)} // Passer les données de l'étudiant pour modification
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => onDelete(student.id)} // Passer l'ID de l'étudiant pour suppression
                  >
                    Supprimer
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