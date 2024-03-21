import { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, IconButton } from "@mui/material";
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import './styles.css';

const CommissaryAnalyis = () => {
    const [critStock, setCritStock] = useState([]);
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortColumn, setSortColumn] = useState(null);

    useEffect(() => {
        retrieveCommissaryCritical();
    }, []);

 
    
    async function retrieveCommissaryCritical(){
        // const data = await fetch('http://127.0.0.1:8000/retrieve_commissary_critical');
        const data = await fetch('https://ims-be-j66p.onrender.com/retrieve_commissary_critical');
        const response = await data.json();
        
        setCritStock(response.items);
    }

    const handleSort = (column) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedData = critStock.sort((a, b) => {
        if (sortColumn === 'category') {
            return sortDirection === 'asc' ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
        } else if (sortColumn === 'um') {
            return sortDirection === 'asc' ? a.um.localeCompare(b.um) : b.um.localeCompare(a.um);
        } else if (sortColumn === 'commissary_stock') {
            
            const compareUM = a.um.localeCompare(b.um);
            if (compareUM !== 0) {
                return compareUM;
            } else {
                return sortDirection === 'asc' ? a.commissary_stock - b.commissary_stock : b.commissary_stock - a.commissary_stock;
            }
        } else {
            return 0;
        }
    });

    return (
        <Box>
            <Typography variant='h5'>Critical Stocks</Typography>
            <Typography variant='body1' sx={{paddingBottom: "2rem"}}>A summative report on Critical Stocks.</Typography>

            
            <Typography variant='h6'>Items with Critical Stock</Typography>
            <TableContainer component={Paper} id='spoilage-table'>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow id='header-row'>
                        <TableCell align="center" className='table-header'>Item Name</TableCell>
                        <TableCell align="center" className='table-header'>
                            Category
                            <IconButton size="small" onClick={() => handleSort('category')}>
                                {sortColumn === 'category' && sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                            </IconButton>
                        </TableCell>
                        <TableCell align="center" className='table-header'>
                            Current Stock
                            <IconButton size="small" onClick={() => handleSort('commissary_stock')}>
                                {sortColumn === 'commissary_stock' && sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                            </IconButton>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedData.map((stock) => (
                        <TableRow key={stock.id}>
                            <TableCell component="th" scope="row">
                                {stock.item_name}
                            </TableCell>
                            <TableCell align="center">{stock.category}</TableCell>
                            <TableCell align="center">{stock.commissary_stock} {stock.um}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>

        </Box>
    )
}

export default CommissaryAnalyis;
