import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  DateCalendar,
  LocalizationProvider,
  PickersDay
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { format } from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Calendar = ({ scheduleData, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 日付にイベントがあるかチェック
  const hasEvent = (date) => {
    return scheduleData.some(event => 
      format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // カスタムデイコンポーネント
  const renderDay = (day, selectedDays, pickersDayProps) => {
    const isSelected = hasEvent(day);
    
    return (
      <PickersDay
        {...pickersDayProps}
        selected={isSelected}
        sx={{
          ...(isSelected && {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }),
        }}
      />
    );
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {format(selectedDate, 'yyyy年 MMMM', { locale: ja })}
        </Typography>
        <IconButton 
          size="small"
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setSelectedDate(newDate);
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton 
          size="small"
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setSelectedDate(newDate);
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
      
      <DateCalendar
        value={selectedDate}
        onChange={(newDate) => {
          setSelectedDate(newDate);
          onDateSelect(newDate);
        }}
        renderDay={renderDay}
        sx={{
          width: '100%',
          '& .MuiPickersCalendarHeader-root': {
            display: 'none',
          },
        }}
      />
    </Paper>
  );
};

export default Calendar; 