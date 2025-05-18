import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  IconButton,
  InputAdornment
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';

const ScheduleDialog = ({ open, onClose, onSave, schedule = null }) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    time: '',
    eventName: '',
    location: '',
    memo: '',
    budget: '',
    reservationStatus: '',
    reservationInfo: ''
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        ...schedule,
        date: new Date(schedule.date)
      });
    } else {
      setFormData({
        date: new Date(),
        time: '',
        eventName: '',
        location: '',
        memo: '',
        budget: '',
        reservationStatus: '',
        reservationInfo: ''
      });
    }
  }, [schedule]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate
    });
  };

  const handleTimeChange = (newTime) => {
    setFormData({
      ...formData,
      time: newTime ? format(newTime, 'HH:mm') : ''
    });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {schedule ? 'スケジュールを編集' : '新規スケジュール'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DatePicker
            label="日付"
            value={formData.date}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true
              }
            }}
          />
          
          <TimePicker
            label="時間"
            value={formData.time ? new Date(`2000-01-01T${formData.time}`) : null}
            onChange={handleTimeChange}
            slotProps={{
              textField: {
                fullWidth: true
              }
            }}
          />

          <TextField
            label="イベント名"
            value={formData.eventName}
            onChange={handleChange('eventName')}
            fullWidth
            required
          />

          <TextField
            label="場所"
            value={formData.location}
            onChange={handleChange('location')}
            fullWidth
          />

          <TextField
            label="メモ"
            value={formData.memo}
            onChange={handleChange('memo')}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
            label="予算"
            value={formData.budget}
            onChange={handleChange('budget')}
            fullWidth
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">¥</InputAdornment>,
            }}
          />

          <TextField
            select
            label="予約状況"
            value={formData.reservationStatus}
            onChange={handleChange('reservationStatus')}
            fullWidth
          >
            <MenuItem value="">未設定</MenuItem>
            <MenuItem value="予約済">予約済</MenuItem>
            <MenuItem value="予約待ち">予約待ち</MenuItem>
            <MenuItem value="キャンセル">キャンセル</MenuItem>
          </TextField>

          <TextField
            label="予約番号/リンク"
            value={formData.reservationInfo}
            onChange={handleChange('reservationInfo')}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>キャンセル</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.eventName}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDialog; 