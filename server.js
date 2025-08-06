const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();
const port = 3000;

// ===================================================
// ★★★ 必ずご自身の情報に書き換えてください ★★★
// ===================================================
// 1. スプレッドシートのID
//    (シートのURL .../spreadsheets/d/【この部分がID】/edit)
const SPREADSHEET_ID = '1nS-AeyJDZ0CI8axYLEfkhgBiyUOsbM69eZjbwJwRLSU';

// 2. 認証情報ファイル
//    (GCPからダウンロードしたJSONファイルの名前)
const CREDENTIALS_FILE = './google-credentials.json.json'; 
// ===================================================

// 認証情報を使ってGoogleサービスにアクセス
const creds = require(CREDENTIALS_FILE);
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
    await doc.loadInfo(); // スプレッドシートの情報を読み込む
    const sheet = doc.sheetsByIndex[0]; // 最初のシートを選択

    const surveyData = req.body;
    
    // 新しい行を追加 (キーをスプレッドシートのヘッダーと一致させる)
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

app.listen(port, () => {
  console.log(`サーバーがポート${port}で起動しました。`);
});
