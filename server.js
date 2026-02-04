const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/watch", (req, res) => {
    const id = req.body.id;

    // wkm を動画ID付きで起動
    exec(`wkm ${id}`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
    });

    // ブラウザ側には履歴に残らないページを返す
    res.send("動画を再生中（履歴には残りません）");
});

app.listen(3000, () => console.log("server running"));
