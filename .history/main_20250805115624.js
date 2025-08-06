// ✅ 毎日アクセス時にスタンプをリセット（日付チェック）
const today = new Date().toLocaleDateString();
const lastVisit = localStorage.getItem("lastVisitDate");

if (lastVisit !== today) {
  localStorage.removeItem("stampedHouses"); // 前日のスタンプ削除
  localStorage.setItem("lastVisitDate", today); // 今日の記録
  location.reload(); // 表示もリセット
}

// ✅ モデルハウス一覧（16件）
const houses = [
  { id: "A", keyword: "あい", x: 535, y: 500 },
  { id: "B", keyword: "うえ", x: 535, y: 420 },
  { id: "C", keyword: "おか", x: 535, y: 340 },
  { id: "D", keyword: "きく", x: 535, y: 260 },
  { id: "E", keyword: "けこ", x: 535, y: 180 },
  { id: "F", keyword: "さし", x: 535, y: 100 },
  { id: "G", keyword: "すせ", x: 535, y: 20 },
  { id: "H", keyword: "そた", x: 280, y: 500 },
  { id: "I", keyword: "ちつ", x: 200, y: 100 },
  { id: "J", keyword: "てと", x: 280, y: 100 },
  { id: "K", keyword: "なに", x: 280, y: 20 },
  { id: "L", keyword: "ぬね", x: 200, y: 500 },
  { id: "M", keyword: "のは", x: 120, y: 500 },
  { id: "N", keyword: "ひふ", x: 40, y: 500 },
  { id: "O", keyword: "へほ", x: 40, y: 100 },
  { id: "P", keyword: "まみ", x: 120, y: 100 }
];

// ✅ マップにモデルハウスを表示
const map = document.getElementById("map");

houses.forEach((house) => {
  const div = document.createElement("div");
  div.className = "house";
  div.id = house.id;
  div.innerText = `モデル ${house.id}`;
  div.style.left = house.x + "px";
  div.style.top = house.y + "px";
  map.appendChild(div);
});

// ✅ スタンプ入力処理
const input = document.getElementById("stampInput");
const button = document.getElementById("submitStamp");

button.addEventListener("click", () => {
  const value = input.value.trim().toLowerCase();

  houses.forEach((house) => {
    const element = document.getElementById(house.id);
    if (value === house.keyword) {
      element.classList.add("stamped");
    }
  });

  // ✅ スタンプ状態を保存（ローカルストレージ）
  const stampedIds = houses
    .filter((h) => document.getElementById(h.id).classList.contains("stamped"))
    .map((h) => h.id);

  localStorage.setItem("stampedHouses", JSON.stringify(stampedIds));

  // ✅ 完成チェック
  checkCompletion();

  input.value = "";
});

// ✅ ページ読み込み時：保存されたスタンプを復元
window.addEventListener("DOMContentLoaded", () => {
  const savedStamps = JSON.parse(localStorage.getItem("stampedHouses") || "[]");

  savedStamps.forEach((id) => {
    const house = document.getElementById(id);
    if (house) {
      house.classList.add("stamped");
    }
  });

  checkCompletion(); // 復元時にもチェック
});

// ✅ 16件揃ったか判定して "COMPLETE!" を表示
function checkCompletion() {
  const stamped = JSON.parse(localStorage.getItem("stampedHouses") || "[]");
  if (stamped.length === 16) {
    const message = document.getElementById("complete-message");
    if (message) {
      message.style.display = "block";
    }
  }
}
