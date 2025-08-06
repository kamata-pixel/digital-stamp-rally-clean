const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

require('dotenv').config();

const app = express();

// ===================================================
// ★ 環境変数の読み込みとチェックを強化
// ===================================================
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const GOOGLE_CREDENTIALS_JSON_STRING = process.env.GOOGLE_CREDENTIALS_JSON;

// 起動時に環境変数が設定されているかチェック
if (!SPREADSHEET_ID || !GOOGLE_CREDENTIALS_JSON_STRING) {
  console.error('エラー: 必要な環境変数 (SPREADSHEET_ID, GOOGLE_CREDENTIALS_JSON) が設定されていません。');
  // Vercelではここで終了しても良いが、リクエスト時にエラーを返すようにする
}

let creds;
try {
  creds = JSON.parse(GOOGLE_CREDENTIALS_JSON_STRING);
} catch (e) {
  console.error('エラー: GOOGLE_CREDENTIALS_JSON の内容が正しいJSON形式ではありません。', e);
}
// ===================================================

const serviceAccountAuth = new JWT({
  email: creds ? creds.client_email : '',
  key: creds ? creds.private_key.replace(/\\n/g, '\n') : '',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

app.use(cors());
app.use(express.json());

app.post('/api/submit', async (req, res) => {
  // リクエストごとに環境変数を再チェック
  if (!SPREADSHEET_ID || !creds) {
    console.error('サーバー設定エラー: 環境変数が正しく読み込めていません。');
    return res.status(500).json({ message: 'サーバーの設定に問題があります。' });
  }

  console.log('サーバーがデータを受け取りました！');
  console.log(req.body);

  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const surveyData = req.body;
    
    await sheet.addRow({
      "一番気に入ったモデルハウス": surveyData.favoriteHouse,
      "印象に残ったもの": Array.isArray(surveyData.impressivePoints) ? surveyData.impressivePoints.join(', ') : surveyData.impressivePoints,
      "対応の良かった担当者": surveyData.goodStaff,
      "送信日時": surveyData.submittedAt,
    });

    console.log('スプレッドシートへの書き込みが成功しました。');
    res.status(200).json({ message: 'データを受け取り、記録しました。' });

  } catch (error) {
    console.error('スプレッドシートへの書き込み中にエラーが発生しました:', error);
    res.status(500).json({ message: 'サーバー内部でエラーが発生しました。' });
  }
});

module.exports = app;
