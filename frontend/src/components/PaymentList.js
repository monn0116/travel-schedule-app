import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Divider,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const PaymentList = ({ scheduleData, onEdit, onDelete, onAdd }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState(null);
  const [formData, setFormData] = React.useState({
    eventName: '',
    amount: '',
  });

  const handleOpenDialog = (payment = null) => {
    if (payment) {
      setFormData({
        eventName: payment.eventName,
        amount: payment.amount,
      });
      setSelectedPayment(payment);
    } else {
      setFormData({
        eventName: '',
        amount: '',
      });
      setSelectedPayment(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleSubmit = () => {
    if (selectedPayment) {
      onEdit({ ...selectedPayment, ...formData });
    } else {
      onAdd(formData);
    }
    handleCloseDialog();
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">支払い一覧</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          支払いを追加
        </Button>
      </Box>
      <List>
        {scheduleData.map((payment, index) => (
          <React.Fragment key={index}>
            <ListItem
              sx={{
                py: 2,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {payment.eventName}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    一人あたり: ¥{Number(payment.amount).toLocaleString()}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="edit"
                  onClick={() => handleOpenDialog(payment)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onDelete(payment)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < scheduleData.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedPayment ? '支払いを編集' : '支払いを追加'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="イベント名"
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="金額（一人あたり）"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              type="number"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.eventName || !formData.amount}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PaymentList; 