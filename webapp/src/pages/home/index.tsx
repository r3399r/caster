const Home = () => {
  return (
    <div className="flex flex-col gap-4">
      <p>歡迎來到 PMP - Practice Make Perfect。</p>
      <p>
        這是一個幫助你練習各種題目的平台，提供免費的線上題庫，可以線上答題，題目清單顯示各題的答對率，讓你彈性選擇題目。答題後可以在答題記錄檢視自己的答題狀況。
      </p>
      <p>
        如果你喜歡這個平台，請多邀請你的戰友們加入使用！我們會定期檢視各類別的使用狀況，若答題足夠踴躍，我們會更頻繁地新增題目到該類別。題目到一定的數量之後，將會開啟「試卷模式」。其他功能也會陸續著手開發！
      </p>
      <p>
        如果有希望的新題目類別、題目類型、題目來源，或是希望有新的功能，請到{' '}
        <a
          className="text-blue-500 underline"
          target="_blank"
          href="https://www.facebook.com/profile.php?id=61560070388701"
        >
          FB粉絲專頁
        </a>{' '}
        私訊我們。如果你是老師，想要有私人類別整理自己的題庫，也請找我們諮詢！
      </p>
      <p>祝你練習愉快！</p>
    </div>
  );
};

export default Home;
