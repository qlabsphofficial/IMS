import { SidenavData } from './SidenavData';
import { Avatar, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import "./styles.css";


function SideNav() {
  const navigate = useNavigate();
  const [newNotifsCount, setNewNotifsCount] = useState(0);

  function changePageContent(page){
    navigate(page);
  }

  async function retrieveNotifsCount(){
    let username = JSON.parse(localStorage.getItem('user_data'));
    console.log('Retrieving notifs count...');

    // const data = await fetch(`http://127.0.0.1:8000/retrieve_notifications/${username}`);
    const data = await fetch(`https://ims-be-j66p.onrender.com/retrieve_notifications/${username}`);
    const response = await data.json();
    console.log(response);
    setNewNotifsCount(response.new_notifs);
  }

  useEffect(() => {
    retrieveNotifsCount();

    const new_interval = setInterval(() => {
      retrieveNotifsCount();
    } , 15000)

    return () => {
      clearInterval(new_interval);
    }
  }, []);
  

  return (
    <div className='side-bar'>
        <Box id='system-profile'>
          <Typography variant="h5">Cafe Juan</Typography>

          <Box id='profile' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Avatar sx={{ width: 100, height: 100 }} src="https://github.com/tuungss123/IMS/blob/dev/cafe.jpg?raw=true" alt="Profile Picture" ></Avatar>
          </Box>
          <Typography variant='h6'>{JSON.parse(localStorage.getItem('user_data'))}</Typography>
        </Box>

        <ul className='side-bar-links'>
        {SidenavData.map(( val, key) => {
            return( 
                <li 
                  key={key} 
                  className='row'
                  id={window.location.pathname == val.link ? "active" : ""}
                  onClick={() => changePageContent(val.link)}
                >
                    <div id='icon'>{val.icon}</div>
                    <div id='title'>
                      {val.title === "Notifications" ? (
                        <>{val.title} <span id="notifs-count">{newNotifsCount}</span></>
                      ) : (
                        val.title
                      )}
                    </div>
                </li>
            )
        })}
        </ul>
    </div>
  )
}

export default SideNav;