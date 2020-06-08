var logger = require('./../../config/winston')(__filename)
var tag = require('./../../config/tag');
var _ = require('lodash')
const moment = require('moment');
//Mysql
var mysqldb = require('./../../mysql-client');
//QR code
const fs = require('fs');
const qrcode = require('qrcode');

var config = require('./../../config/line.config');
const Client = require('@line/bot-sdk').Client;
const line_client = new Client(config);

var {middleware ,handlePreErr ,line_replyMessage ,line_pushMessage} = require('./../helpers/line.handler')
var joinmessage = require('../../config/flex/joinmessage');
var settingmessage = require('../../config/flex/reply_site_setting');

function setGroupObj(req){
    groupObj = req.body.events[0].source
    groupObj.storeId = ''
    groupObj.storeName = ''
    return groupObj;
}

function checkPrefix(prefix){
    var found = msgText.match(prefix)
    return found;
}


async function sendQR(textToGen,replyToken) {
    logger.info('sendQR('+textToGen+')');
    //const res = await qrcode.toDataURL(String(textToGen));
    const res = await qrcode.toFile('./public/images/qr/'+textToGen+'.png',String(textToGen));
    
    //logger.info(res);
    //fs.writeFileSync('./'+textToGen+'.png', `<img src="${res}">`);
    logger.info('Wrote to ./'+textToGen+'.png');

    let content1 = {
        "type": "image",
        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/linecorp_code_withborder.png",
        "aspectMode": "cover",
        "size": "xl"
      } 
    content1.url = 'https://ndev.1112delivery.com/images/qr/'+textToGen+'.png';
      
    let contentMessage = {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "spacing": "md",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "margin": "xxl",
              "contents": [
                {
                  "type": "spacer"
                }
              ]
            }
          ]
        }
      }
      contentMessage.body.contents.push(content1);
    
      let flexMessage = { 
        "type": "flex",
        "altText":'1112Delivery', 
        "contents": {
                        "type": "carousel",
                        "contents": []
                    } 
      };
      flexMessage.contents.contents.push(contentMessage);

    logger.info(flexMessage);  
    line_client.pushMessage(replyToken,flexMessage)
    .then( () => {
        //status 200 ok
        logger.info('send qr complete');
    })
    .catch((err) => {
        logger.info('send qr error =>');
        logger.info(err);
    });
}

/**
 * Line webhook ,action from line account
 * @param err
 * @param req
 * @param res
 * @param next
 */

async function webhook(req,res){
    if(req.body.events[0].type == 'join'){
        groupId = req.body.events[0].source.groupId;
        logger.info(tag.webhook+'groupId '+groupId+' join event')
        line_replyMessage(req.body.events[0].replyToken ,{ type: 'flex',altText:'Group Join', contents: joinmessage });
    }else if(req.body.events[0].type == 'leave'){
        groupId = req.body.events[0].source.groupId;
        try {
            logger.info(tag.webhook+'groupId '+groupId+' leave event')
        }catch(e){}
        // }else if(req.body.events[0].type == 'message'){
        //     if( req.body.events[0].message.type == 'text') {
        //         groupId = req.body.events[0].source.groupId
        //         msgText = req.body.events[0].message.text
        //         logger.info(msgText);
        //         if(checkPrefix('^(@store=|@site=)')){   
        //         }else if(checkPrefix('^(@name=)')){
        //         }else if(checkPrefix('^(@report=)')){ 
        //         }
        //     }
    }else if(req.body.events[0].type == 'postback'){
        let replyToken = req.body.events[0].replyToken;
        let userId = req.body.events[0].source.userId;
        let postTimestamp = req.body.events[0].timestamp;
        let postback = req.body.events[0].postback;
        let data = postback.data;  //postback.params.datetime
        mysqldb((err,connection) => {
            if(err){
                logger.info('[CONNECTION_DATABASE_ERROR] '+err)
            }else{
                connection.query('SELECT * FROM vouchers WHERE usedFlag is null LIMIT 1 FOR UPDATE',[], function (error, results, fields){
                    if (error) {
                        logger.info('[SELECT_VOUCHER_ERROR] error '+error)
                    }else{
                        logger.info('[CODE] '+results[0].code);
                        let usedVoucher = {
                            usedFlag: 'Y',
                            usedToken: userId,
                            usedDate: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        connection.query('UPDATE vouchers SET ?',usedVoucher,function (error, results, fields){
                            if (error) {
                                logger.info('[UPDATE_VOUCHER_ERROR] '+error)
                            }else{
                                sendQR(results[0].code).catch(error => logger.info(error.stack));
                            }
                            connection.release();
                            logger.info('[CONNECTION_VOUCHER_RELEASE] ')
                        })
                    }
                    //connection.release();
                });
            }
        })
    }
    //next(req,res)
    console.log(req.body.events);
    res.status(200).json(req.body.events) // req.body will be webhook event object
}

module.exports = { webhook ,middleware ,handlePreErr};