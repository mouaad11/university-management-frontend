// services/api.ts
import axios from 'axios';
import { Schedule, Room, RoomRequest, Professor, Classe, Student } from '../types';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Schedules
  getAllSchedules: () => api.get<Schedule[]>('/schedules'),
  getScheduleById: (id: number) => api.get<Schedule>(`/schedules/${id}`),
  createSchedule: (schedule: Schedule) => api.post<Schedule>('/schedules', schedule),
  updateSchedule: (id: number, schedule: Schedule) => api.put<Schedule>(`/schedules/${id}`, schedule),
  deleteSchedule: (id: number) => api.delete(`/schedules/${id}`),
  getAvailableRooms: () => api.get<Room[]>('/schedules/available-rooms'),
  getWeeklySchedule: (roomId: number) => api.get(`/schedules/weekly-schedule/${roomId}`),

  // Rooms
  getAllRooms: () => api.get<Room[]>('/rooms'),
  getRoomById: (id: number) => api.get<Room>(`/rooms/${id}`),
  createRoom: (room: Room) => api.post<Room>('/rooms', room),
  updateRoom: (id: number, room: Room) => api.put<Room>(`/rooms/${id}`, room),
  deleteRoom: (id: number) => api.delete(`/rooms/${id}`),

  // Room Requests
  createRoomRequest: (request: RoomRequest) => api.post<RoomRequest>('/room-requests', request),
  getPendingRequests: () => api.get<RoomRequest[]>('/room-requests/pending'),
  approveRoomRequest: (id: number) => api.put<RoomRequest>(`/room-requests/approve/${id}`),
  rejectRoomRequest: (id: number) => api.delete(`/room-requests/reject/${id}`),

  // Professors
  getAllProfessors: () => api.get<Professor[]>('/professors'),
  getProfessorById: (id: number) => api.get<Professor>(`/professors/${id}`),
  getProfessorsByDepartment: (department: string) => api.get<Professor[]>(`/professors/department/${department}`),
  getProfessorSchedules: (id: number) => api.get<Schedule[]>(`/professors/${id}/schedules`),

  // Classes
  getAllClasses: () => api.get<Classe[]>('/classes'),
  getClassById: (id: number) => api.get<Classe>(`/classes/${id}`),
  createClass: (classe: Classe) => api.post<Classe>('/classes', classe),
  updateClass: (id: number, classe: Classe) => api.put<Classe>(`/classes/${id}`, classe),
  deleteClass: (id: number) => api.delete(`/classes/${id}`),

  //Students
  getStudentById: (id: number) => api.get<Student>(`/students/${id}`)
};

export default apiService;