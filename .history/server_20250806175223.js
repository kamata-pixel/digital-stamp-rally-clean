// 必要な部品を読み込む
const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Vercelの環境変数を読み込むために必要
require('dotenv').config();

const app = express();

// ===================================================
// ★ Vercelの環境変数から設定を読み込むように変更
// ===================================================
// Vercel上ではprocess.envから、ローカルでは .env ファイルから読み込む
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

let creds;
// Vercel上では環境変数のJSON文字列をパースして使う
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
} else {
  // ローカル環境では、.envファイルに書かれた秘密鍵を使う
  creds = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') // 改行文字を元に戻す
  };
}
// ===================================================

const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

app.use(cors());
app.use(express.json());

// '/api/submit' にPOSTリクエストが来たときの処理
app.post('/api/submit', async (req, res) => {
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

// ★★★ Vercelでは不要なため、app.listen()を削除 ★★★

// ★★★ VercelがこのファイルをAPIとして認識できるように追記 ★★★
module.exports = app;
