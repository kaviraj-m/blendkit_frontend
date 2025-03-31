import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gym from './pages/Dashboard/GymPages/Gym';
import GymSchedule from './pages/Dashboard/GymPages/GymSchedule';
import Equipment from './pages/Dashboard/GymPages/Equipment';
import WorkoutPosts from './pages/Dashboard/GymPages/WorkoutPosts';
import GymAttendance from './pages/Dashboard/GymPages/GymAttendance';
import DashboardHome from './pages/Dashboard/DashboardHome';
import Profile from './pages/Dashboard/Profile';
import Users from './pages/Dashboard/Users';
import Error404 from './pages/Error404';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard layout wrapper */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<Users />} />
            
            {/* Gym routes */}
            <Route path="gym" element={<Gym />} />
            <Route path="gym/schedule" element={<GymSchedule />} />
            <Route path="gym/equipment" element={<Equipment />} />
            <Route path="gym/workout-posts" element={<WorkoutPosts />} />
            <Route path="gym/attendance" element={<GymAttendance />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;