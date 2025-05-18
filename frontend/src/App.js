import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Box,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Fab,
  useMediaQuery,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ListIcon from '@mui/icons-material/List';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentIcon from '@mui/icons-material/Payment';
import Calendar from './components/Calendar';
import ScheduleList from './components/ScheduleList';
import ScheduleDialog from './components/ScheduleDialog';
import PaymentList from './components/PaymentList';

// カスタムテーマの設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 60,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          padding: '6px 0',
        },
      },
    },
  },
});

// APIのベースURLを環境変数から取得
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function App() {
  const [value, setValue] = useState(0);
  const [scheduleData, setScheduleData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // スケジュールデータの取得
  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/schedule`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setScheduleData(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSnackbar({
        open: true,
        message: 'スケジュールの取得に失敗しました',
        severity: 'error'
      });
    }
  };

  // 支払いデータの取得
  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPaymentData(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setSnackbar({
        open: true,
        message: '支払い情報の取得に失敗しました',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchPayments();
  }, []);

  // スケジュールの保存
  const handleSaveSchedule = async (schedule) => {
    try {
      const method = schedule.id ? 'PUT' : 'POST';
      const url = schedule.id 
        ? `${API_BASE_URL}/api/schedule/${schedule.id}`
        : `${API_BASE_URL}/api/schedule`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
      });

      if (!response.ok) throw new Error('Failed to save schedule');

      const result = await response.json();
      
      if (!schedule.id && result.id) {
        schedule.id = result.id;
      }

      await fetchSchedules();
      setSnackbar({
        open: true,
        message: 'スケジュールを保存しました',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      setSnackbar({
        open: true,
        message: 'スケジュールの保存に失敗しました',
        severity: 'error'
      });
    }
  };

  // スケジュールの削除
  const handleDeleteSchedule = async (schedule) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/schedule/${schedule.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete schedule');

      await fetchSchedules();
      setSnackbar({
        open: true,
        message: 'スケジュールを削除しました',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setSnackbar({
        open: true,
        message: 'スケジュールの削除に失敗しました',
        severity: 'error'
      });
    }
  };

  // すべてのスケジュールをクリア
  const handleClearAllSchedules = async () => {
    if (window.confirm('すべてのスケジュールを削除してもよろしいですか？')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/schedule`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to clear schedules');

        await fetchSchedules();
        setSnackbar({
          open: true,
          message: 'すべてのスケジュールを削除しました',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error clearing schedules:', error);
        setSnackbar({
          open: true,
          message: 'スケジュールの削除に失敗しました',
          severity: 'error'
        });
      }
    }
  };

  // スケジュールの編集
  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setDialogOpen(true);
  };

  // 新規スケジュールの追加
  const handleAddSchedule = () => {
    setSelectedSchedule(null);
    setDialogOpen(true);
  };

  // 支払いの追加
  const handleAddPayment = async (payment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });

      if (!response.ok) throw new Error('Failed to add payment');

      await fetchPayments();
      setSnackbar({
        open: true,
        message: '支払い情報を追加しました',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding payment:', error);
      setSnackbar({
        open: true,
        message: '支払い情報の追加に失敗しました',
        severity: 'error'
      });
    }
  };

  // 支払いの編集
  const handleEditPayment = async (payment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });

      if (!response.ok) throw new Error('Failed to update payment');

      await fetchPayments();
      setSnackbar({
        open: true,
        message: '支払い情報を更新しました',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      setSnackbar({
        open: true,
        message: '支払い情報の更新に失敗しました',
        severity: 'error'
      });
    }
  };

  // 支払いの削除
  const handleDeletePayment = async (payment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/${payment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete payment');

      await fetchPayments();
      setSnackbar({
        open: true,
        message: '支払い情報を削除しました',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      setSnackbar({
        open: true,
        message: '支払い情報の削除に失敗しました',
        severity: 'error'
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
        <CssBaseline />
        <Box sx={{ 
          pb: 7,
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}>
          <Container maxWidth="sm" sx={{ pt: 2 }}>
            {/* メインコンテンツエリア */}
            <Box sx={{ mb: 2 }}>
              {value === 0 && (
                <Box>
                  <ScheduleList 
                    scheduleData={scheduleData}
                    onEdit={handleEditSchedule}
                    onDelete={handleDeleteSchedule}
                    onAdd={handleSaveSchedule}
                  />
                </Box>
              )}
              {value === 1 && (
                <Box>
                  <PaymentList
                    scheduleData={paymentData}
                    onAdd={handleAddPayment}
                    onEdit={handleEditPayment}
                    onDelete={handleDeletePayment}
                  />
                </Box>
              )}
              {value === 2 && (
                <Box>
                  <h2>設定</h2>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearAllSchedules}
                    sx={{ mt: 2 }}
                  >
                    すべてのスケジュールを削除
                  </Button>
                </Box>
              )}
            </Box>

            {/* 新規追加ボタン */}
            <Fab 
              color="primary" 
              aria-label="add"
              onClick={handleAddSchedule}
              sx={{ 
                position: 'fixed',
                bottom: 76,
                right: 16,
                display: value === 0 ? 'flex' : 'none'
              }}
            >
              <AddIcon />
            </Fab>

            {/* スケジュールダイアログ */}
            <ScheduleDialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              onSave={handleSaveSchedule}
              schedule={selectedSchedule}
            />

            {/* スナックバー */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              <Alert 
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
                severity={snackbar.severity}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>

            {/* ボトムナビゲーション */}
            <Paper 
              sx={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0,
                borderTop: '1px solid rgba(0, 0, 0, 0.12)'
              }} 
              elevation={3}
            >
              <BottomNavigation
                value={value}
                onChange={(event, newValue) => {
                  setValue(newValue);
                }}
                showLabels
              >
                <BottomNavigationAction 
                  label="旅行日程" 
                  icon={<ListIcon />} 
                />
                <BottomNavigationAction 
                  label="支払い" 
                  icon={<PaymentIcon />} 
                />
                <BottomNavigationAction 
                  label="設定" 
                  icon={<SettingsIcon />} 
                />
              </BottomNavigation>
            </Paper>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
