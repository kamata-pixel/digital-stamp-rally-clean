// ===================================================
// グローバル変数と初期設定
// ===================================================
// ★ 座標をピクセルからパーセントに変換
const houses = [
  { id: "A", keyword: "あ", x: 89.17, y: 83.33 },
  { id: "B", keyword: "あ", x: 89.17, y: 70 },
  { id: "C", keyword: "あ", x: 89.17, y: 56.67 },
  { id: "D", keyword: "あ", x: 89.17, y: 43.33 },
  { id: "E", keyword: "あ", x: 89.17, y: 30 },
  { id: "F", keyword: "あ", x: 89.17, y: 16.67 },
  { id: "G", keyword: "あ", x: 89.17, y: 3.33 },
  { id: "H", keyword: "あ", x: 46.67, y: 83.33 },
  { id: "I", keyword: "あ", x: 33.33, y: 16.67 },
  { id: "J", keyword: "あ", x: 46.67, y: 16.67 },
  { id: "K", keyword: "あ", x: 46.67, y: 3.33 },
  { id: "L", keyword: "あ", x: 33.33, y: 83.33 },
  { id: "M", keyword: "あ", x: 20,    y: 83.33 },
  { id: "N", keyword: "あ", x: 6.67,  y: 83.33 },
  { id: "O", keyword: "あ", x: 6.67,  y: 16.67 },
  { id: "P", keyword: "あ", x: 20,    y: 16.67 }
];

// HTML要素の取得
const map = document.getElementById("map");
const input = document.getElementById("stampInput");
const button = document.getElementById("submitStamp");
const surveyContainer = document.getElementById("survey-container");
const surveyForm = document.getElementById("actual-form");
const thanksMessage = document.getElementById("thanks-message");

// ===================================================
// 関数定義
// ===================================================

/**
 * スタンプが16件揃ったか判定し、アンケートフォームを表示する
 */
function checkCompletion() {
  const stamped = JSON.parse(localStorage.getItem("stampedHouses") || "[]");
  if (stamped.length === houses.length) {
    surveyContainer.style.display = "flex";
  }
}

/**
 * スタンプの状態をローカルストレージに保存する
 */
function saveStamps() {
  const stampedIds = houses
    .filter((h) => document.getElementById(h.id).classList.contains("stamped"))
    .map((h) => h.id);
  localStorage.setItem("stampedHouses", JSON.stringify(stampedIds));
}

/**
 * ページ読み込み時に保存されたスタンプを復元する
 */
function loadStamps() {
  const savedStamps = JSON.parse(localStorage.getItem("stampedHouses") || "[]");
  savedStamps.forEach((id) => {
    const house = document.getElementById(id);
    if (house) {
      house.classList.add("stamped");
    }
  });
  checkCompletion();
}

/**
 * 毎日アクセス時にスタンプをリセットする
 */
function resetStampsDaily() {
  const today = new Date().toLocaleDateString();
  const lastVisit = localStorage.getItem("lastVisitDate");
  if (lastVisit !== today) {
    localStorage.removeItem("stampedHouses");
    localStorage.setItem("lastVisitDate", today);
  }
}

// ===================================================
// イベントリスナーの設定
// ===================================================

// ページが読み込まれたときの処理
window.addEventListener("DOMContentLoaded", () => {
  resetStampsDaily();

  // マップにモデルハウスを配置
  houses.forEach((house) => {
    const div = document.createElement("div");
    const span = document.createElement("span"); // ★ テキスト表示用のspanを追加
    div.className = "house";
    div.id = house.id;
    span.innerText = `モデル ${house.id}`;
    
    // ★ 単位を "px" から "%" に変更
    div.style.left = house.x + "%";
    div.style.top = house.y + "%";

    div.appendChild(span); // ★ divの中にspanを入れる
    map.appendChild(div);
  });

  loadStamps();
});

// 「スタンプする」ボタンがクリックされたときの処理
button.addEventListener("click", () => {
  const value = input.value.trim().toLowerCase();
  let found = false;
  houses.forEach((house) => {
    if (value === house.keyword) {
      document.getElementById(house.id).classList.add("stamped");
      found = true;
    }
  });

  if(found){
    saveStamps();
    checkCompletion();
    input.value = "";
  } else {
    alert("キーワードが違います。");
    input.value = "";
  }
});

// アンケートフォームが送信されたときの処理
surveyForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // フォームの通常の送信をキャンセル

  // フォームからデータを収集
  const q1 = document.getElementById("favoriteHouse").value;
  const q2_checkboxes = document.querySelectorAll('input[name="q2"]:checked');
  const q2 = Array.from(q2_checkboxes).map(cb => cb.value);
  const q3 = document.getElementById("goodStaff").value;

  const surveyData = {
    favoriteHouse: q1,
    impressivePoints: q2,
    goodStaff: q3,
    submittedAt: new Date().toISOString() // 送信日時も記録
  };

  // ★★★ ここがフロントエンドとバックエンドの連携部分！ ★★★
  try {
    const response = await fetch('http://localhost:3000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData),
    });

    if (response.ok) {
      surveyContainer.style.display = "none";
      thanksMessage.style.display = "block";
      setTimeout(() => {
        thanksMessage.style.display = "none";
      }, 2000);
    } else {
      alert('送信に失敗しました。もう一度お試しください。');
    }
  } catch (error) {
    console.error('送信エラー:', error);
    alert('サーバーとの通信に失敗しました。');
  }
});
