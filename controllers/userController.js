
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const Chat = require('../models/chatModel');

const registerLoad = async(req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
    }
}

const register = async(req, res) => {
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: 'images/' + req.file.filename,
            password: passwordHash
        });
        await user.save();

        res.render('register', { message: 'Registration done Successfully!' });
    } catch (error) {
        console.log(error.message);
    }
}


const loadLogin = async(req,res) =>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const login = async(req,res) =>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
        if (userData) {
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if (passwordMatch) {
                req.session.user = userData;  //storing the userData in a session
                res.redirect('/dashboard');
            } else {
                res.render('login',{message:'Email and Password are Incorrect!'})
            }
        } else {
            res.render('login',{message:'Email and Password are Incorrect!'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async(req,res) =>{
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req,res) =>{
    try {
        var users = await User.find({_id:{$nin:[req.session.user._id]}});  //excluding the loggedin user show rest users
        res.render('dashboard',{user:req.session.user,users:users});
    } catch (error) {
        console.log(error.message);
    }
}

const saveChat = async (req, res) => {
    try {
        var chat = new Chat({
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message,
        });
        var newChat = await chat.save();
        res.status(200).send({ success: true, msg: 'Chat inserted', data: newChat }); // when the data is inserted into the database, the message is sent as a response
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};



module.exports = {
    registerLoad,
    register,
    loadLogin,
    login,
    logout,
    loadDashboard,
    saveChat

}
