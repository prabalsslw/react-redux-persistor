import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/reducers/auth/authSlice'; // adjust the path if needed
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());           // Clear auth state
    navigate('/login');           // Redirect to login page
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
