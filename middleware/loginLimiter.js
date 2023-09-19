const rateLimit = require('express-rate-limit')
const{logEvents} = require("./logger")

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, //1minute
    max:5,

    message:{message:'Tomany login attempts from this IP, please try again after a 60 second pause'},
    handler:(req,res,next,options) =>{
        logEvents(`Too many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders:true, // Return rate limit infor inthe RateLimit headers
    legacyHeaders:false, // Disable the x-ratelimit headers
})

module.exports = loginLimiter