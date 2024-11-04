const express = require("express");
const path = require('path')
const { connectToMongoDB } = require("./connect")
const cookieParser = require('cookie-parser')
const { restrictToLoggedinUserOnly, checkAuth } = require('./middleware/auth')

const URL = require('./models/url');
const app = express();

const { timeStamp } = require("console");
const PORT = 8002;

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user')

connectToMongoDB('mongodb://localhost:27017/short-url').then(() =>  
    console.log("Mongodb connected")
);

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"));

app.use(express.json());

// app.get('/test', async (req, res) => {
//     const allUrls = await URL.find({});
//     return res.render('home', {
//         urls: allUrls,
//     })
// });
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());

app.use("/url",restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);

app.get("/url/:shortId", async (req ,res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push: {
                visitHistory: {
                    timeStamp: Date.now(),
                },
            },
        }
    );
})


app.listen(PORT, () => console.log(`server started at PORT:${PORT}`));