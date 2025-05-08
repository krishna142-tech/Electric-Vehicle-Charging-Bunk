import { FC } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EvStation as EvStationIcon,
  BookOnline as BookOnlineIcon,
  AccountCircle,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { text: 'Manage Stations', path: '/admin/stations', icon: <EvStationIcon /> },
  { text: 'Bookings', path: '/admin/bookings', icon: <BookOnlineIcon /> },
]; 