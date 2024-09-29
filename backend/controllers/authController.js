const DataModel = require("../models/userModels");
const { genJWTToken, compareHashPassword, verifyJWTToken, generateHashPassword } = require('../services/authService');


var allowed_for_slug = process.env.ALLOW_FILE_LIMIT;


exports.register = async function (req, res) {
    const { username, email, password } = req.body;


    try {
        const hashedPassword = await generateHashPassword(password);
        const newUser = new DataModel({
            username: username,
            password: hashedPassword,
            email: email,
        });
        const savedUser = await newUser.save();
        //Email
        const data = {
            username: username,
            password: hashedPassword,
            email: email,
        };


        const token = genJWTToken(data, 'register');


        res.status(200).json({ message: 'Successfully Registered ', success: true });


    } catch (e) {
        res.status(500).json({ message: 'An error occurred during registration ' + e, success: false });
    }
};


exports.login = async function (req, res) {
    const { email, password } = req.body;
    const user = await DataModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: 'Email or Password is wrong.', success: false });
    }
    try {
        const match = await compareHashPassword(password, user.password);
        // const token=jwt.sign({ _id: user._id },process.env.TOKEN_SECRET,{expiresIn:'10m'});
        const payload = {
            username: user.username,
            email: user.email,
            password: user.password,
        };
        const token = genJWTToken(payload);
        if (match) {
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000000000
            });
            user.password = undefined;
            res.status(200).json({ message: 'Successfully Logged Inn.', success: true, user: user });
        }
        else {
            res.status(400).json({ error: 'Email or Password is wrong.', success: false });
        }


    } catch (e) {
        res.status(500).json({ error: 'An error occurred during registration', success: false });
    }
};