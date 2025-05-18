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
  Link
} from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const ScheduleList = ({ scheduleData, onEdit, onDelete, onAdd }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState(null);
  const [formData, setFormData] = React.useState({
    date: '',
    time: '',
    eventName: '',
    location: '',
    memo: ''
  });

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setFormData({
        date: schedule.date,
        time: schedule.time,
        eventName: schedule.eventName,
        location: schedule.location,
        memo: schedule.memo
      });
      setSelectedSchedule(schedule);
    } else {
      setFormData({
        date: '',
        time: '',
        eventName: '',
        location: '',
        memo: ''
      });
      setSelectedSchedule(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSchedule(null);
  };

  const handleSubmit = () => {
    if (selectedSchedule) {
      onEdit({ ...selectedSchedule, ...formData });
    } else {
      onAdd(formData);
    }
    handleCloseDialog();
  };

  const getGoogleMapsUrl = (location) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
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
        <Typography variant="h6">旅行日程</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          予定を追加
        </Button>
      </Box>
      <List>
        {scheduleData.map((schedule, index) => (
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
                    {schedule.eventName}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(schedule.date), 'M月d日 (EEEE)', { locale: ja })}
                      {schedule.time && ` ${schedule.time}`}
                    </Typography>
                    {schedule.location && (
                      <Link
                        href={getGoogleMapsUrl(schedule.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {schedule.location}
                        <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                      </Link>
                    )}
                    {schedule.memo && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {schedule.memo}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                {/* 編集アイコンをコメントアウト */}
                {/*
                <IconButton 
                  edge="end" 
                  aria-label="edit"
                  onClick={() => handleOpenDialog(schedule)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                */}
                {/* 削除アイコンをコメントアウト */}
                {/*
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onDelete(schedule)}
                >
                  <DeleteIcon />
                </IconButton>
                */}
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
          {selectedSchedule ? '予定を編集' : '予定を追加'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="日付"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="時間"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="イベント名"
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="場所"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
            <TextField
              label="メモ"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.date || !formData.eventName}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ScheduleList; 