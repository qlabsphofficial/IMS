import  { useState, useEffect } from "react";
import { Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Modal,Pagination, Select, MenuItem } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import './styles.css';

const CommissaryTransferHistoryPage = () => {
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTomorrowDate());
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const [transferData, setTransferData] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
 
  // eslint-disable-next-line no-unused-vars
  const [modalDate, setModalDate] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    isOpen: false,
    action: '',
    transactionId: null,
    
  });

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    filterByCategory(event.target.value);
  };
  const categories = ['Dry Ingredients', 'Proteins', 'Baking', 'Spices', 'Sauces and Condiments','Others (packagings)'];

  const filterByCategory = (category) => {
    if (category === 'All Categories') {
      
      retrieveInventoryItems();
    } else 
    {
      const filteredData = transferData.filter(transfer => transfer.transacted_item.category === category);
      setDisplayedData(filteredData); // Update displayed data instead of transferData
    }
  };
  

  

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  
  useEffect(() => {
    retrieveInventoryItems(); // Initial data fetch
  }, []);
  
  async function updateTable() {
    retrieveInventoryItems();
  }

  const [isDataRequestModalVisible, setIsDataRequestModalVisible] = useState(false);

  useEffect(() => {
    retrieveInventoryItems();
  }, []);


  function resetDataRequestModal() {
    setStartDate(getTodayDate());
    setEndDate(getTomorrowDate());
  }
  

  async function requestData(){ 
    if (!startDate || !endDate) {
      // Display an error message or handle the case where dates are not provided
      console.error('Please select both start and end dates.');
      return;
    }

    
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify({
            'start_date': startDate,
            'end_date': endDate
        })
    }

    try {
         const response = await fetch('https://ims-be-j66p.onrender.com/retrieve_transaction_summary', requestOptions);
        //const response = await fetch('https://ims-be-j66p.onrender.com/retrieve_transaction_summary', requestOptions);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', `Transaction Data Request ${new Date()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        
        setStartDate('');
        setEndDate('');
        setIsDataRequestModalVisible(false);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}


async function retrieveInventoryItems() {
  try {
    const data = await fetch('https://ims-be-j66p.onrender.com/all_transactions');
    const response = await data.json();
  
   
    const sortedData = response.transactions.sort((a, b) => {
     
      if (a.approval.toLowerCase() === 'pending' && b.approval.toLowerCase() !== 'pending') return -1;
      if (a.approval.toLowerCase() !== 'pending' && b.approval.toLowerCase() === 'pending') return 1;
      
      return new Date(b.date_created) - new Date(a.date_created);
    });
  
    setTransferData(sortedData);
  } catch (error) {
    console.error('Error retrieving transaction data:', error);
  }
  setCurrentPage(1)
}


  async function processTransaction(transaction_id, action) {
    setConfirmationData({
      isOpen: true,
      action,
      transactionId: transaction_id,
    });
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

  function confirmTransaction() {
    const { action, transactionId } = confirmationData;
    setIsModalVisible(true);
    executeTransaction(action, transactionId);
    setConfirmationData({
      isOpen: false,
      action: '',
      transactionId: null,
    });
  }

  function cancelConfirmation() {
    setConfirmationData({
      isOpen: false,
      action: '',
      transactionId: null,
    });
  }

  async function executeTransaction(action, transaction_id) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'id': transaction_id,
        'action': action,
      }),
    };

    const response = await fetch(`https://ims-be-j66p.onrender.com/process_transaction/${transaction_id}`, requestOptions);
    //const response = await fetch(`https://ims-be-j66p.onrender.com/process_transaction/${transaction_id}`, requestOptions);
    const data = await response.json();

    setModalDate(data.date_changed);
    setModalMessage(data.response);
    retrieveInventoryItems();
  }

  

  

  async function search(searched_item) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'search': searched_item
      })
    }

    const data = await fetch('https://ims-be-j66p.onrender.com/search_transfer_requests', requestOptions);
    //const data = await fetch('https://ims-be-j66p.onrender.com/search_transfer_requests', requestOptions);
    const response = await data.json();

    setTransferData(response.transactions);
  }


  //pagination
  const [displayedData, setDisplayedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage] = useState(10); 

  useEffect(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const slicedData = transferData.slice(startIndex, endIndex);
      setDisplayedData(slicedData);
  }, [currentPage, transferData, itemsPerPage]);    
  
  const handlePageChange = (event, value) => {
      setCurrentPage(value);
  };    
  return (
    <Box>
      <Typography variant="h5">Transfer Requests</Typography>
      <Typography variant='body1'>Listed below are all the transfer requests made within the system.</Typography>
      
      <div className="main" style={{ display: 'flex', justifyContent: 'space-between'}}>
      <div >
      <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="outlined"
          size="small"
          
          sx={{ marginRight: '1rem', marginBottom: '1rem', marginTop:'1rem' }}
        >
          <MenuItem value="All Categories">All Categories</MenuItem>
          {categories.map((category, index) => (
            <MenuItem key={index} value={category}>{category}</MenuItem>
          ))}
        </Select>

      </div>
      <div className="search" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={updateTable}
          sx={{ marginRight: '1rem', marginBottom: '1rem'}}
        >
          Update Table
        </Button>
        <TextField
          id="outlined-basic"
          variant="outlined"
          label="Search By Status"
          size="small"
          sx={{ marginRight: '1rem',marginBottom: '1rem' }}
          onChange={(search_item) => search(search_item.target.value)}
        />
      </div>

      </div>
      <TableContainer component={Paper} id='transfers-table'>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow id='header-row'>
              <TableCell align="center" className='table-header'>Requested Item</TableCell>
              <TableCell align="center" className='table-header'>
              Category
      
    
    </TableCell>
    <TableCell align="center" className='table-header'>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Quantity
          </div>
    </TableCell>
              <TableCell align="center" className='table-header'>Transactor</TableCell>
              <TableCell align="center" className='table-header'>Request Date</TableCell>
              <TableCell align="center" className='table-header'>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Approval Status
  </div>
</TableCell>
              <TableCell align="center" className='table-header'>Options</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedData.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell component="th" align="center">{transfer.transacted_item.item_name}</TableCell>
                <TableCell component="th" align="center">{transfer.transacted_item.category}</TableCell>
                <TableCell align="center">{transfer.transacted_amount}{transfer.transacted_item.um}</TableCell>
                <TableCell align="center">{transfer.transactor}</TableCell>
                <TableCell align="center">{formatDateTime(transfer.date_created)}</TableCell>
                <TableCell align="center">{transfer.approval}</TableCell>
                <TableCell align="center">
                  {transfer.approval === 'Pending' && transfer.transacted_amount <= transfer.transacted_item.commissary_stock && (
                    <>
                      <CheckIcon onClick={() => processTransaction(transfer.id, 'Approved')} />
                      <DoDisturbIcon onClick={() => processTransaction(transfer.id, 'Denied')} />
                    </>
                  )}
                  {transfer.approval === 'Pending' && transfer.transacted_amount > transfer.transacted_item.commissary_stock && (
                    <DoDisturbIcon onClick={() => processTransaction(transfer.id, 'Denied')} />
                  )}
                </TableCell>
                {transfer.approval !== 'Pending' && (
                  <TableCell align="center">
                    -
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                count={Math.ceil(transferData.length / itemsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
            />
            </Box>

      <Dialog
        open={confirmationData.isOpen}
        onClose={cancelConfirmation}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title" style={{ backgroundColor: confirmationData.action === 'Approved' ? '#75975e' : '#8F011B', color: 'white' }}>
          Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6">Are you sure you want this transaction to be {confirmationData.action.toLowerCase()}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={confirmTransaction}>Confirm</Button>
          <Button variant='outlined' onClick={cancelConfirmation}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}
        aria-labelledby="modal-title"
      >
        <DialogContent>
          <Typography variant="h5" id="modal-title">Message</Typography>
          <Typography variant="h6" id='item-title'>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={() => setIsModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Button variant='outlined' onClick={() => setIsDataRequestModalVisible(true)} sx={{ marginTop: '2%' }}>Generate Transaction Reports</Button>

            {/* <Pagination sx={{ marginTop: '2%' }} count={10} /> */}

            <Modal
                open={isDataRequestModalVisible}
                onClose={() => {
                  setIsDataRequestModalVisible(false);resetDataRequestModal()
                }}
                sx={{ bgcolor: 'background.Paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className='modal'>
                    <Typography variant="h5" id="modal-title">Generate Transaction Reports</Typography>

                    <Box id='date-pickers'>
                        <Typography variant="h6" id='item-title'>Start Date:</Typography>
                        <input type='date' onChange={(start_date) => setStartDate(start_date.target.value)} value={startDate}></input>

                        <Typography variant="h6" id='item-title'>End Date:</Typography>
                        <input type='date' onChange={(end_date) => setEndDate(end_date.target.value)} value={endDate}></input>
                    </Box>
                    
                    <Box id='modal-buttons-container'>
                    <Button
                        variant='outlined'
                        onClick={() => requestData()}
                        disabled={!startDate || !endDate} 
                      >
                        Proceed
                      </Button>
                      <Button
                        variant='outlined'
                        onClick={() =>{ setIsDataRequestModalVisible(false);resetDataRequestModal()}}
                      >
                        Cancel
                      </Button>
                    </Box>
                </div>
            </Modal>
    </Box>
  );
}

export default CommissaryTransferHistoryPage;