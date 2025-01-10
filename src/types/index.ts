// types/index.ts
export interface User {
    id: number;
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    isConfirmed:boolean;
  }
  
  export interface Student extends User {
    studentId: string;
    classe: Classe;
  }
  
  export interface Professor extends User {
    department: string;
    schedules: Schedule[];
  }
  
  export interface Classe {
    id: number;
    name: string;
    academicYear: string;
    department: string;
  }
  
  export interface Room {
    id: number;
    roomNumber: string;
    capacity: number;
    building: string;
    type: string;
    isAvailable: boolean;
  }
  
  export interface Schedule {
    id: number;
    classe: Classe | null;
    professor: Professor | null;
    room: Room;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    subject: string;
    type: 'COURSE' | 'TD' | 'TP';
  }
  
  export interface RoomRequest {
    id: number;
    room: Room;
    professor: Professor;
    student: Student;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    subject: string;
    type: string;
    approved: boolean;
  }