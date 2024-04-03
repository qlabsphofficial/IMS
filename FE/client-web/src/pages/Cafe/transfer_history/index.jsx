import { Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Modal, IconButton, Pagination, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MuiAlert from '@mui/material/Alert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import './styles.css';

const TransferHistoryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transferData, setTransferData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modId, setModId] = useState(0);
  const [modName, setModName] = useState('');
  const [modifyQty, setModifyQty] = useState(0);
  const [isModifyQtyValid, setIsModifyQtyValid] = useState(false);
  const [sortOrder, setSortOrder] = useState({
    field: '',
    ascending: true,
  });

  const [deleteConfirmationDialogVisible, setDeleteConfirmationDialogVisible] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');


  const [isDataRequestModalVisible, setIsDataRequestModalVisible] = useState(false);


  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');

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


  const showApprovalModal = (transactionId, action) => {
    setSelectedTransactionId(transactionId);
    setApprovalAction(action);
    setApprovalModalVisible(true);
  };
  
  const hideApprovalModal = () => {
    setSelectedTransactionId(null);
    setApprovalAction('');
    setApprovalModalVisible(false);
  };
  

  const handleApproval = async () => {
    if (approvalAction === 'Approve') {
      await handle_intern_request('Approved', selectedTransactionId);
    } else if (approvalAction === 'Reject') {
      await handle_intern_request('Rejected', selectedTransactionId);
    }
    hideApprovalModal();
  };
  
  
  const handleDenial = () => {
    hideApprovalModal();
  };
  

  useEffect(() => {
    setStartDate(getCurrentDate());
    setEndDate(getTomorrowDate());
    retrieveInventoryItems();
  }, []);

  useEffect(() => {
    setIsModifyQtyValid(!isNaN(modifyQty) && modifyQty >= 1);
  }, [modifyQty]);

  function setModalDetails(item_id, item_name) {
    setModId(item_id);
    setModName(item_name);
    setModalVisible(true);
  }

  async function retrieveInventoryItems() {
    const data = await fetch('https://ims-be-j66p.onrender.com/all_transactions');
    const response = await data.json();
  
    console.log(response.transactions);
  
    // Separate transactions by approval status
    const pendingTransactions = [];
    const approvedOrDeniedTransactions = [];
  
    response.transactions.forEach(transaction => {
      if (transaction.approval.toLowerCase() === 'pending') {
        pendingTransactions.push(transaction);
      } else {
        approvedOrDeniedTransactions.push(transaction);
      }
    });
  
    // Sort pending transactions by date_created in descending order
    pendingTransactions.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    
    // Sort approved and denied transactions together by date_created in descending order
    approvedOrDeniedTransactions.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
  
    // Combine sorted transactions
    const sortedData = [...pendingTransactions, ...approvedOrDeniedTransactions];
  
    setTransferData(sortedData);
    setCurrentPage(1);
  }
  
  
  async function deleteTransaction(transaction_id) {
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }

     const response = await fetch(`https://ims-be-j66p.onrender.com/delete_transaction/${transaction_id}`, requestOptions);
    //const response = await fetch(`https://ims-be-j66p.onrender.com/delete_transaction/${transaction_id}`, requestOptions);
    const data = await response.json();

    console.log(data.response);
  }

  async function modifyRequestedQty() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'transacted_amount': modifyQty
      })
    }

     const response = await fetch(`https://ims-be-j66p.onrender.com/update_transaction/${modId}`, requestOptions);
    //const response = await fetch(`https://ims-be-j66p.onrender.com/update_transaction/${modId}`, requestOptions);
    const data = await response.json();

    console.log(data.response);

    if (data.response === 'Transaction Updated') {
      setModalVisible(false);
      retrieveInventoryItems();
    }
  }

  const handleDeleteConfirmation = (transactionId) => {
    setModId(transactionId);
    setDeleteConfirmationDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    await deleteTransaction(modId);
    setDeleteConfirmationDialogVisible(false);
    setDeleteSuccessMessage('Item deleted successfully!');
    retrieveInventoryItems(); 
  };

  const handleSort = (field) => {
    const isAsc = sortOrder.field === field ? !sortOrder.ascending : true;
    setSortOrder({ field, ascending: isAsc });
  
    const sortedData = [...transferData];
  
    sortedData.sort((a, b) => {
      let aValue, bValue;
  
      switch (field) {
        case 'Category':
          aValue = a.transacted_item.category.toLowerCase();
          bValue = b.transacted_item.category.toLowerCase();
          break;
        case 'Quantity':
          aValue = `${a.transacted_amount}`;
          bValue = `${b.transacted_amount}`;
          break;
        case 'Approval Status':
          aValue = a.approval.toLowerCase();
          bValue = b.approval.toLowerCase();
          break;
        default:
          return 0;
      }
  
      return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  
    setTransferData(sortedData);
  };
  
   const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  

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

  async function handle_intern_request(action, transaction_id) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'action': action
      })
    }

    const data = await fetch(`https://ims-be-j66p.onrender.com/substitute_approval/${transaction_id}`, requestOptions);
    // const data = await fetch('https://ims-be-j66p.onrender.com/search_transfer_requests', requestOptions);
    const response = await data.json();
    retrieveInventoryItems();
  }

  function resetDataRequestModal() {
    setStartDate('');
    setEndDate('');
  }

  async function requestData(){
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

  async function requestSpoilageReportData(){
    try {
        const response = await fetch('https://ims-be-j66p.onrender.com/retrieve_spoilage_report_summary');
        //const response = await fetch('https://ims-be-j66p.onrender.com/retrieve_transaction_summary', requestOptions);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', `Spoilage Reports Data Request ${new Date()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

    } catch (error) {
        console.error('Error downloading file:', error);
    }
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
        <div className="search" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        
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
    <IconButton onClick={() => handleSort('Approval Status')}>
      {sortOrder.field === 'Approval Status' && sortOrder.ascending ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
    </IconButton>
  </div>
</TableCell>

    <TableCell align="center" className='table-header'>Options</TableCell>
  </TableRow>
</TableHead>


          <TableBody>
            {displayedData.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell component="th" align="center">{transfer.transacted_item.item_name}</TableCell>
                <TableCell align="center">{transfer.transacted_item.category}</TableCell>
                <TableCell align="center">{transfer.transacted_amount}{transfer.transacted_item.um}</TableCell>
                <TableCell align="center">{transfer.transactor}</TableCell>
                <TableCell align="center">{formatDateTime(transfer.date_created)}</TableCell>
                <TableCell align="center">{transfer.approval}</TableCell>

                {/* Cafe Substitute Admin Approval */}
                {transfer.approval === 'Pending' && transfer.admin_approval === false && JSON.parse(localStorage.getItem('user_data')) == 'Cafe' && transfer.transactor === 'Intern' && (
                  <TableCell align="center">
                    <CheckIcon onClick={() => showApprovalModal(transfer.id, 'Approve')} />
                    <CancelIcon onClick={() => showApprovalModal(transfer.id, 'Reject')} />

                  </TableCell>
                )}

                {/* Requestor Data Modification Exclusivity */}
                {transfer.approval === 'Pending' && JSON.parse(localStorage.getItem('user_data')) === transfer.transactor && (
                  <TableCell align="center">
                    <EditOutlinedIcon onClick={() => setModalDetails(transfer.id, transfer.transacted_item.item_name)} />
                    <DeleteOutlineOutlinedIcon onClick={() => handleDeleteConfirmation(transfer.id)} />
                  </TableCell>
                )}

                {transfer.approval !== 'Pending' && (
                  <TableCell align="center">-</TableCell>
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

      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        sx={{ bgcolor: 'background.Paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className='modal'>
          <Typography variant="h5" id="modal-title">Modify Transaction Quantity Request</Typography>
          <Typography variant="h6" id='item-title'>{modName}</Typography>
          <TextField
            label="Change amount"
            type='number'
            placeholder="0"
            id="modal-input-field"
            size='small'
            onChange={(qty) => setModifyQty(qty.target.value)}
          />
          <Box id='modal-buttons-container'>
            <Button variant='outlined' onClick={() => modifyRequestedQty()} disabled={!isModifyQtyValid}>Modify</Button>
            <Button variant='outlined' onClick={() => setModalVisible(false)}>Cancel</Button>
          </Box>
        </div>
      </Modal>
      <Dialog
        open={deleteConfirmationDialogVisible}
        onClose={() => setDeleteConfirmationDialogVisible(false)}
      >
        <DialogTitle sx={{backgroundColor: '#8F011B ', color: '#fff' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this transaction?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDelete()}>Yes</Button>
          <Button onClick={() => setDeleteConfirmationDialogVisible(false)}>No</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(deleteSuccessMessage)}
        autoHideDuration={3000}
        onClose={() => setDeleteSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          {deleteSuccessMessage}
        </MuiAlert>
      </Snackbar>

      <Button variant='outlined' onClick={() => setIsDataRequestModalVisible(true)} sx={{ marginTop: '2%' }}>Generate Transaction Reports</Button>
      <Button variant='outlined' onClick={() => requestSpoilageReportData()} sx={{ marginTop: '2%', marginLeft: '3%' }}>Generate Spoilage Reports Summary</Button>

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
            <input type='date' value={startDate} onChange={(event) => setStartDate(event.target.value)}></input>

            <Typography variant="h6" id='item-title'>End Date:</Typography>
            <input type='date' value={endDate} onChange={(event) => setEndDate(event.target.value)}></input>
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

      <Dialog
        open={approvalModalVisible}
        onClose={hideApprovalModal}
      >
        <DialogTitle id="dialog-title" style={{ backgroundColor: approvalAction === 'Approve' ? '#75975e' : '#8F011B', color: 'white' }}>
          {`Are you sure you want to ${approvalAction.toLowerCase()} this request?`}
        </DialogTitle>

        <DialogActions>
          <Button onClick={handleApproval}>Yes</Button>
          <Button onClick={handleDenial}>No</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransferHistoryPage;