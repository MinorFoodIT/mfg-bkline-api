var logger = require('./config/winston')(__filename);
//QR code

const Client = require('@line/bot-sdk').Client;
const line_client = new Client({
    /** LINE **/
    channelAccessToken: 'u49wjznc3MSuYVUmVm/rJCZ1+Pw8wXB3wYCOx6WRG8u/4y07PQo7EV/iLZZjcmyNOgcI9nVH93IWb6mko4XUmpivrujzYYq4AGksna31vnttF+CJta9ca8vNLV/12k0WLTT+ePDyJTWxpnH0TzQNRgdB04t89/1O/w1cDnyilFU=',
    channelSecret: '34300572b2e42246caf84d439b2bc6aa'
});

async function sendQR(textToGen,replyToken) {
    const fs = require('fs');
    const qrcode = require('qrcode');

    logger.info('sendQR('+textToGen+')');
    logger.info('replyToken '+replyToken);
    //const res = await qrcode.toDataURL(String(textToGen));
    //const res = await qrcode.toFile(process.cwd()+ '/public/images/qr/'+textToGen+'.png',String(textToGen));
    // console.log(process.cwd());
    // console.log(__dirname);
    // console.log(__filename);
    let imageFileCreated = './public/'+textToGen+'.png';
    const res = await qrcode.toFile(imageFileCreated,String(textToGen));

    // fs.readdir(__dirname+'/public', (err, files) => {
    //   files.forEach(file => {
    //     console.log(file);
       
    //   });
    // });

    //logger.info(res);
    //fs.writeFileSync('./'+textToGen+'.png', `<img src="${res}">`);
    logger.info('Wrote file  ./public/'+textToGen+'.png');

    let content1 = {
        "type": "image",
        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/linecorp_code_withborder.png",
        "aspectRatio": "1:1",
        //"aspectMode": "cover",
        "size": "full"
      } 
    content1.url = 'https://ndev.1112delivery.com/'+textToGen+'.png';
      
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
      contentMessage.body.contents[0].contents.push(content1);
      console.log('[bubble] body =>');
      console.log(contentMessage.body);  

      let flexMessage = { 
            "type": "flex",
            "altText":'BurgerKingTH', 
            "contents": {
                        "type": "carousel",
                        "contents": []
                    } 
      };
      flexMessage.contents.contents.push(contentMessage);

    line_client.replyMessage(replyToken,flexMessage)
    .then( () => {
        //status 200 ok
        logger.info('[REPLY] QR CODE SUCCESS ');
        fs.unlink(imageFileCreated, (err) => {
            if (err) {
              logger.info('[Error] remove qr image file =>');
              console.error(err)
              return
            }
            //file removed
            logger.info('[Success] file removed');
          })
    })
    .catch((err) => {
        logger.info('[REPLY_ERROR] QR error =>');
        console.log(err);
    });

}

module.exports = sendQR;