import React from 'react';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';
import { sortData, searchData } from './SortAndSearchUtils';

interface RoomsTableProps {
  rooms: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
  onSort: (field: string) => void;
  onSearch: (term: string) => void;
  onEdit: (id: number, updatedData: any) => void;
  onDelete: (id: number) => void;
}

const RoomsTable: React.FC<RoomsTableProps> = ({ rooms, sortField, sortOrder, searchTerm, onSort, onSearch, onEdit, onDelete }) => {
  const sortedRooms = sortData(rooms, sortField, sortOrder);
  const filteredRooms = searchData(sortedRooms, searchTerm, ['roomNumber', 'building', 'type']);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Rooms</Typography>
        <TextField
          label="Search Rooms"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => onSort('roomNumber')}>Room Number</TableCell>
              <TableCell onClick={() => onSort('building')}>Building</TableCell>
              <TableCell onClick={() => onSort('type')}>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.roomNumber}</TableCell>
                <TableCell>{room.building}</TableCell>
                <TableCell>{room.type}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small">Edit</Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => onDelete(room.id)} // Pass student ID for deletion
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

export default RoomsTable;