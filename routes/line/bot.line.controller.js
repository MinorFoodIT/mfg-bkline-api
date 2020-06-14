var logger = require('./../../config/winston')(__filename)
var tag = require('./../../config/tag');
var _ = require('lodash')
const moment = require('moment');
//Mysql
var mysqldb = require('./../../mysql-client');
//QR code
const fs = require('fs');
const qrcode = require('qrcode');
const sendQR = require('./../../qrCode');

var {middleware ,handlePreErr ,line_replyMessage ,line_pushMessage} = require('./../helpers/line.handler')
var joinmessage = require('../../config/flex/joinmessage');
var settingmessage = require('../../config/flex/reply_site_setting');


function checkPrefix(prefix){
    var found = msgText.match(prefix)
    return found;
}


/**
 * Line webhook ,action from line account
 * @param err
 * @param req
 * @param res
 * @param next
 */

async function webhook(req,res){
    console.log('[BOT_LINE_B] webhook received');
    console.log(req.body.events[0]);
    res.status(200).json(req.body.events)

    if(req.body.events[0].type == 'join'){
    }else if(req.body.events[0].type == 'leave'){
    }else if(req.body.events[0].type == 'message'){
        logger.info('[BOT_LINE_B] event.type = message');
            // if( req.body.events[0].message.type == 'text') {
            //     if(checkPrefix('^(@store=|@site=)')){
            //     }else if(checkPrefix('^(@name=)')){
            //     }else if(checkPrefix('^(@report=)')){
            //     }
            // }
    }else if(req.body.events[0].type == 'postback'){
        logger.info('[BOT_LINE_B] event.type = postback');

        let replyToken = req.body.events[0].replyToken;
        let userId = req.body.events[0].source.userId;
        let postTimestamp = req.body.events[0].timestamp;
        let postback = req.body.events[0].postback;
        let data = postback.data;  //postback.params.datetime
        //sendQR('BKG012345FF202012',replyToken).catch(error => logger.info(error.stack));
 
    }
    //next(req,res)
}

module.exports = { webhook ,middleware ,handlePreErr};