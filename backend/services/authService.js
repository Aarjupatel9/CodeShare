const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



exports.genJWTToken = (payload, type = null) => {
    try {
        const token = jwt.sign(
            payload,
            process.env.JWT_SEC,
            {
                expiresIn: type ? process.env.JWT_EXP_VERIFICATION_EMAIL : process.env.JWT_EXP
            });


        return token;
    } catch (error) {
        console.log(error);
        throw new Error("Error generating JWT token");
    }


}


exports.verifyJWTToken = (token) => {
    try {
        const payload = jwt.verify(token, JWT_SEC);
        return payload;
    } catch (error) {
        throw error;
    }
}


exports.generateHashPassword = async (password) => {


    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);


    return hash;
}



exports.compareHashPassword = async (password, userPassword) => {


    const isMatch = await bcrypt.compare(password, userPassword);


    return isMatch;
}