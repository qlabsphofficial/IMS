import  { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, IconButton } from "@mui/material";
import {ArrowDownward, ArrowUpward} from '@mui/icons-material';
import './styles.css';


const CafeAnalysis = () => {
    const [spoilageData, setSpoilageData] = useState([]);
    const [critStock, setCritStock] = useState([]);
    const [sortOrder, setSortOrder] = useState({ column: '', direction: 'asc' });

    useEffect(() => {
        retrieveCafeCritical();
        retrieveSpoilageReports();
    }, []);

    async function search(searched_item){
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({
                'search': searched_item
            })
        }

        // const data = await fetch('http://127.0.0.1:8000/search_spoilage_reports', requestOptions);
        const data = await fetch('https://ims-be-j66p.onrender.com/search_spoilage_reports', requestOptions);
        const response = await data.json();
        
        setSpoilageData(response.reports);
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

    async function retrieveSpoilageReports(){
        //  const data = await fetch('http://127.0.0.1:8000/retrieve_spoilage_reports');
        const data = await fetch('https://ims-be-j66p.onrender.com/retrieve_spoilage_reports');
        const response = await data.json();
        
        console.log(response.spoilage_reports);
        setSpoilageData(response.spoilage_reports);
    }


    async function retrieveCafeCritical(){
        //  const data = await fetch('http://127.0.0.1:8000/retrieve_cafe_critical');
        const data = await fetch('https://ims-be-j66p.onrender.com/retrieve_cafe_critical');
        const response = await data.json();
        
        setCritStock(response.items);
    }
    const sortCritStock = (column) => {
        let direction = 'asc';
        if (sortOrder.column === column && sortOrder.direction === 'asc') {
            direction = 'desc';
        }
        setSortOrder({ column, direction });
    
        const sortedData = [...critStock].sort((a, b) => {
            if (column === 'category') {
                return sortOrder.direction === 'asc' ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
            } else if (column === 'cafe_stock') {
                if (a.um === b.um) {
                    return sortOrder.direction === 'asc' ? a.cafe_stock - b.cafe_stock : b.cafe_stock - a.cafe_stock;
                } else {
                    return sortOrder.direction === 'asc' ? a.um.localeCompare(b.um) : b.um.localeCompare(a.um);
                }
            }
            return 0;
        });
        setCritStock(sortedData);
    };
    

    return (
        <Box>
            <Typography variant='h5'>Stock Analysis</Typography>
            <Typography variant='body1' sx={{paddingBottom: "2rem"}}>A summative report on Critical Stocks and Spoilage.</Typography>

            <Typography variant='h6'>Items with Critical Stock</Typography>
            <TableContainer component={Paper} id='spoilage-table'>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow id='header-row'>
                        <TableCell align="center" className='table-header'>Item Name</TableCell>
                        <TableCell align="center" className='table-header'>
                            Category
                            <IconButton onClick={() => sortCritStock('category')}>
                                {sortOrder.column === 'category' && sortOrder.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                            </IconButton>
                        </TableCell>
                        <TableCell align="center" className='table-header'>
                            Amount Left
                            <IconButton onClick={() => sortCritStock('cafe_stock')}>
                                {sortOrder.column === 'cafe_stock' && sortOrder.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                            </IconButton>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {critStock.map((stock) => (
                        <TableRow key={stock.id}>
                            <TableCell component="th" scope="row" align='center'>
                                {stock.item_name}
                            </TableCell>
                            <TableCell align="center">{stock.category}</TableCell>
                            <TableCell align="center">{stock.cafe_stock}{stock.um}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
            
            <Typography variant='h6' sx={{ marginTop: '3%' }}>Spoilage Reports</Typography>
            <TableContainer component={Paper} id='spoilage-table'>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow id='header-row'>
                        <TableCell align="center" className='table-header'>Item Name</TableCell>
                        <TableCell align="center" className='table-header'>Category</TableCell>
                        <TableCell align="center" className='table-header'>Spoiled Amount</TableCell>
                        <TableCell align="center" className='table-header'>Incident Reporter</TableCell>
                        <TableCell align="center" className='table-header'>Date Reported</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {spoilageData.map((spoilage) => (
                        <TableRow key={spoilage.id}>
                            <TableCell component="th" scope="row">
                                {spoilage.item.item_name}
                            </TableCell>
                            <TableCell align="center">{spoilage.item.category}</TableCell>
                            <TableCell align="center">{spoilage.spoil_amount}{spoilage.item.um}</TableCell>
                            <TableCell align="center">{spoilage.report_creator}</TableCell>
                            <TableCell align="center">{formatDateTime(spoilage.date_created)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default CafeAnalysis;
