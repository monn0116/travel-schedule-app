const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config({ path: './text.env' });

const app = express();

// CORSの設定を更新
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Google Spreadsheet APIの認証設定
const auth = new google.auth.GoogleAuth({
  keyFile: './alpine-beacon-460203-h4-4edeb1dbcdb6.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// スプレッドシートのヘッダー行を設定
const HEADERS = [
  '日付',
  '時間',
  'イベント名',
  '場所',
  'メモ'
];

// スプレッドシートの初期化
async function initializeSpreadsheet() {
  try {
    // ヘッダー行の設定
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A1:E1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [HEADERS],
      },
    });

    // ヘッダー行の書式設定
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.8,
                    green: 0.8,
                    blue: 0.8,
                  },
                  textFormat: {
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });

    console.log('Spreadsheet initialized successfully');
  } catch (error) {
    console.error('Error initializing spreadsheet:', error);
  }
}

// スプレッドシートからデータを取得するエンドポイント
app.get('/api/schedule', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A2:E', // ヘッダー行を除いたデータを取得
    });

    // データを整形
    const scheduleData = response.data.values?.map((row, index) => ({
      id: index + 1, // 行インデックスをIDとして使用
      date: row[0] || '',
      time: row[1] || '',
      eventName: row[2] || '',
      location: row[3] || '',
      memo: row[4] || ''
    })) || [];

    res.json(scheduleData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data from spreadsheet' });
  }
});

// スプレッドシートにデータを書き込むエンドポイント
app.post('/api/schedule', async (req, res) => {
  try {
    const { date, time, eventName, location, memo } = req.body;
    
    // データのバリデーション
    if (!date || !eventName) {
      return res.status(400).json({ error: '日付とイベント名は必須です' });
    }

    const values = [[
      date,
      time || '',
      eventName,
      location || '',
      memo || ''
    ]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A2:E',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    });

    // 追加した行のインデックスを取得
    const rowIndex = response.data.updates.updatedRange.split('!')[1].split(':')[0].replace('A', '') - 2;

    res.json({ 
      message: 'Data added successfully',
      id: rowIndex
    });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update spreadsheet' });
  }
});

// スケジュールを更新するエンドポイント
app.put('/api/schedule/:rowIndex', async (req, res) => {
  try {
    const { rowIndex } = req.params;
    const { date, time, eventName, location, memo } = req.body;

    const values = [[
      date,
      time || '',
      eventName,
      location || '',
      memo || ''
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Sheet1!A${parseInt(rowIndex) + 2}:E${parseInt(rowIndex) + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    });

    res.json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update spreadsheet' });
  }
});

// スケジュールを削除するエンドポイント
app.delete('/api/schedule/:rowIndex', async (req, res) => {
  try {
    const { rowIndex } = req.params;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: parseInt(rowIndex) + 1,
                endIndex: parseInt(rowIndex) + 2,
              },
            },
          },
        ],
      },
    });

    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ error: 'Failed to delete data from spreadsheet' });
  }
});

// すべてのスケジュールをクリアするエンドポイント
app.delete('/api/schedule', async (req, res) => {
  try {
    // ヘッダー行を除くすべてのデータをクリア
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A2:E',
    });

    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear spreadsheet data' });
  }
});

// 支払い情報の取得
app.get('/api/payments', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Payments!A2:C',
    });

    const rows = response.data.values || [];
    const payments = rows.map((row, index) => ({
      id: index + 1,
      eventName: row[0] || '',
      amount: parseInt(row[1]) || 0,
      notes: row[2] || ''
    }));

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// 支払い情報の追加
app.post('/api/payments', async (req, res) => {
  try {
    const { eventName, amount, notes } = req.body;
    const values = [[eventName, amount, notes]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Payments!A:C',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    res.status(201).json({ message: 'Payment added successfully' });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

// 支払い情報の更新
app.put('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, amount, notes } = req.body;
    const rowIndex = parseInt(id);
    const range = `Payments!A${rowIndex + 1}:C${rowIndex + 1}`;
    const values = [[eventName, amount, notes]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// 支払い情報の削除
app.delete('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rowIndex = parseInt(id);
    const range = `Payments!A${rowIndex + 1}:C${rowIndex + 1}`;

    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range,
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // サーバー起動時にスプレッドシートを初期化
  await initializeSpreadsheet();
}); 