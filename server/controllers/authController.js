const User = require('../models/User');
const Otp = require('../models/OTP');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generatetoken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

//Register User
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user', // Hardcoded to prevent frontend passing role
            isVerified: false
        });

        const otp = generateOTP();
        await Otp.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        res.status(201).json({
            message: 'OTP sent to email. Please verify.',
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//Login User
exports.loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
     
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({error: 'User not found, Please register first'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({error: 'Invalid credentials'});
        }

        if(!user.isVerified && user.role === 'user'){
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await Otp.deleteMany({ email, action: 'account_verification' }); // Clear old OTPs
            await Otp.create({ email, otp, action: 'account_verification' });
            await sendOTPEmail(email, otp, 'account_verification');
            return res.status(400).json({ 
                error: 'Account not verified. A new OTP has been sent to your email.'       
            });
        }
        res.json({
            message: 'Login successful',
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generatetoken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
    
      

//Verify OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const validOTP = await Otp.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        await Otp.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        res.json({
            message: 'Account verified successfully',
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generatetoken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};