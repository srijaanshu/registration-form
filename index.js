const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://127.0.0.1:27017/registration', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;
db.on('error', () => console.log("Error connecting to MongoDB"));
db.once('open', () => console.log("Connected to MongoDB"));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

const registrationSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    num: String,
    email: String,
    uname: String,
    password: String,
    cpassword: String
});

const Registration = mongoose.model('Registration', registrationSchema);

app.post("/signup", async (req, res) => {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var num = req.body.num;
    var email = req.body.email;
    var uname = req.body.uname;
    var password = req.body.password;
    var cpassword = req.body.cpassword;

    
    const saltRounds = 10;
    const saltRoundss = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const chashedPassword = await bcrypt.hash(cpassword,saltRoundss);
    const registrationData = new Registration({
        fname: fname,
        lname: lname,
        num: num,
        email: email,
        uname: uname,
        password: hashedPassword,
        cpassword: chashedPassword
    });

    try {
      
        const savedRegistration = await registrationData.save();
        console.log("Registration data saved:", savedRegistration);
        return res.redirect('successregister.html');
    } catch (error) {
        console.error("Error saving registration data:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post("/login", async (req, res) => {
    var uname = req.body.uname;
    var password = req.body.password;

    try {
    const user = await Registration.findOne({ uname: uname });

        if (user) {
          
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                console.log("Login successful");
                
                return res.send("Login successful");
            } else {
                console.log("Invalid password");
                return res.status(401).send("Invalid password");
            }
        } else {
            console.log("User not found");
            return res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/", (req, res) => {
    return res.redirect('register.html');
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
