"use strict";
const express = require("express");
const path = require("path");
const compression = require("compression");
const bodyParser = require("body-parser");
const YouTubeJS = require("youtubei.js");
const serverYt = require("./server/youtube.js");
const cors = require('cors');
const cookieParser = require('cookie-parser');

let app = express();
let client;

app.use(compression());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set("trust proxy", 1);
app.use(cookieParser());

// ログインチェック
app.use((req, res, next) => {
    if (req.cookies.loginok !== 'ok' && !req.path.includes('login') && !req.path.includes('back')) {
        return res.redirect('/login');
    } else {
        next();
    }
});

// ホーム
app.get('/', (req, res) => {
  if (req.query.r === 'y') {
    res.render("home/index");
  } else {
    res.redirect('/wkt');
  }
});

// アプリ一覧
app.get('/app', (req, res) => {
  res.render("app/list");
});

// ルート読み込み
app.use("/wkt", require("./routes/wakametube"));
app.use("/game", require("./routes/game"));
app.use("/tools", require("./routes/tools"));
app.use("/pp", require("./routes/proxy"));
app.use("/wakams", require("./routes/music"));
app.use("/blog", require("./routes/blog"));

// ログイン
app.get('/login', (req, res) => {
    res.render('home/login');
});

// GET /watch（既存）
app.get('/watch', (req, res) => {
  const videoId = req.query.v;
  if (videoId) {
    res.redirect(`/wkt/watch/${videoId}`);
  } else {
    res.redirect(`/wkt/trend`);
  }
});

// ★★★ POST /watch（動画IDを履歴に残さない） ★★★
app.post('/watch', (req, res) => {
  const videoId = req.body.id;
  if (!videoId) return res.status(400).send("動画IDがありません");

  res.redirect(`/wkt/watch/${videoId}`);
});

// ★★★ POST /search（検索ワードを履歴に残さない） ★★★
// ★★★ GET にリダイレクトしないように修正 ★★★
app.post('/search', async (req, res) => {
  const q = req.body.q;
  if (!q) return res.status(400).send("検索ワードがありません");

  // wakametube.js の POST /s を直接呼び出す
  req.body.q = q;
  req.url = "/wkt/s";
  app._router.handle(req, res);
});

// チャンネル
app.get('/channel/:id', (req, res) => {
  const id = req.params.id;
  res.redirect(`/wkt/c/${id}`);
});
app.get('/channel/:id/join', (req, res) => {
  const id = req.params.id;
  res.redirect(`/wkt/c/${id}`);
});

// ハッシュタグ
app.get('/hashtag/:des', (req, res) => {
  const des = req.params.des;
  res.redirect(`/wkt/s?q=${des}`);
});

// サンドボックス
app.use("/sandbox", require("./routes/sandbox"));

// 404
app.use((req, res) => {
  res.status(404).render("error.ejs", {
    title: "404 Not found",
    content: "そのページは存在しません。",
  });
});

app.on("error", console.error);

// YouTube API 初期化
async function initInnerTube() {
  try {
    client = await YouTubeJS.Innertube.create({ lang: "ja", location: "JP"});
    serverYt.setClient(client);
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log(process.pid, "Ready.", listener.address().port);
    });
  } catch (e) {
    console.error(e);
    setTimeout(initInnerTube, 10000);
  }
}

process.on("unhandledRejection", console.error);
initInnerTube();
