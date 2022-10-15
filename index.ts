import express from "express";
import bodyParser from "body-parser";
import Router from "./router";

const app = express()
const port = 3000 || process.env.PORT

app.use(bodyParser.json());
app.use(Router);

const server = app.listen(port, () => {
    console.log(`⚡️ Listening at :${port}`)
});

export default server;