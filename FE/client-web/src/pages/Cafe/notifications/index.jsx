import { useEffect, useState } from 'react';
import { Box, Paper, Table, TableContainer, TableBody, TableRow, TableHead, TableCell, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const CafeNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    retrieve_notifications();

    const new_interval = setInterval(() => {
      retrieve_notifications();
    }, 15000)

    return () => {
      clearInterval(new_interval);
    }
  }, []);

  async function retrieve_notifications() {
    let username = JSON.parse(localStorage.getItem('user_data'));
    console.log(username);

    const data = await fetch(`https://ims-be-j66p.onrender.com/retrieve_notifications/${username}`);
    // const data = await fetch('https://ims-be-j66p.onrender.com/all_transactions');
    const response = await data.json();

    const processed_data = await fetch(`https://ims-be-j66p.onrender.com/set_notifs_as_seen/${username}`);
    const processed_response = await processed_data.json();
    
    setNotifications(response.notifications);
  }

  function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return (
    <Box>
        <Typography variant='h5'>Notifications</Typography>

        <TableContainer component={Paper} id='notifications-table'>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
                <TableRow id='header-row'>
                    <TableCell align="left" className='table-header' sx={{ width: '30%' }}>Date</TableCell>
                    <TableCell align="left" className='table-header' sx={{ width: '70%' }}>Message</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                        <TableCell component="th" align="left">{formatDateTime(notification.date)}</TableCell>
                        <TableCell align="left">{notification.text}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
    </Box>
  );
};

export default CafeNotifications;
