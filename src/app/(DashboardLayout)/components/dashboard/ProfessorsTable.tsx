import React from 'react';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';
import { sortData, searchData } from './SortAndSearchUtils';

interface ProfessorsTableProps {
  professors: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
  onSort: (field: string) => void;
  onSearch: (term: string) => void;
  onEdit: (id: number, updatedData: any) => void;
  onDelete: (id: number) => void;
}

const ProfessorsTable: React.FC<ProfessorsTableProps> = ({ professors, sortField, sortOrder, searchTerm, onSort, onSearch, onEdit, onDelete }) => {
  const sortedProfessors = sortData(professors, sortField, sortOrder);
  const filteredProfessors = searchData(sortedProfessors, searchTerm, ['firstName', 'lastName', 'email', 'department']);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Professeurs</Typography>
        <TextField
          label="Rechercher des Professeurs"
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
              <TableCell onClick={() => onSort('department')}>Département</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProfessors.map((professor) => (
              <TableRow key={professor.id}>
                <TableCell>{professor.firstName}</TableCell>
                <TableCell>{professor.lastName}</TableCell>
                <TableCell>{professor.email}</TableCell>
                <TableCell>{professor.department}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small">Modifier</Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => onDelete(professor.id)} // Passer l'ID du professeur pour la suppression
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

export default ProfessorsTable;