var express = require('express');
var logger = require('./../config/winston')(__filename)
const helper = require('./helpers/text.handler');
var lineRouter = require('./line/bot.route');
//Mysql
var mysqldb = require('./../mysql-client');

var router = express.Router();

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => {
  logger.info('health check');
  res.send('OK')
}
);

// mount bot routes at /bot
router.use('/v1/bot', lineRouter);

/**
 * Promotion API
 * {
 *  promotion: "<FREE_FRENCH>"
 *  userToken: "<>"
 * }
 */

router.post('/v1/promotion/request', (req, res) => {
  let jsonBody = req.body;
  if (!helper.isNullEmptry(jsonBody.promotion) && !helper.isNullEmptry(jsonBody.userToken)) {
    mysqldb((err, connection) => {
      if (err) {
        logger.info('[CONNECTION_DATABASE_ERROR] ' + err)
        res.status(200).json({
          error: 'API_DATABASE_ERROR'
        });
        connection.release();
      } else {
        connection.query('SELECT * FROM vouchers WHERE usedFlag is null and promotion = ? ORDER BY RAND() LIMIT 1 ', [jsonBody.promotion], function (error, results, fields) {
          if (error) {
            logger.info('[VOUCHER_RANDOM_ERROR]  ' + error);
            res.status(200).json({
              error: 'API_DATA_NOT_FOUND'
            });
            connection.release();
          } else {
            logger.info('[VOUCHER_RANDOM] ' + results[0].code);
            let voucher = results[0].code;
            let usedVoucher = [
              'Y',
              jsonBody.userToken,
              moment().format('YYYY-MM-DD HH:mm:ss'),
              jsonBody.promotion,
              voucher,
            ]
            connection.query('UPDATE vouchers SET usedFlag = ? ,userToken = ? ,usedDate = ? ' +
              'where promotion = ? and code = ? ', usedVoucher, function (error, results, fields) {
                if (error) {
                  logger.info('[UPDATE_VOUCHER_ERROR] ' + error)
                  res.status(200).json({
                    error: 'API_DATA_NOT_FOUND'
                  });
                  connection.release();
                } else {
                  let resultVoucher = {
                    code: voucher
                  }
                  res.status(200).json(resultVoucher);
                  connection.release();
                }
              })
          }
        });
      }
    })
  } else {
    res.status(200).json({
      error: 'API_REQUEST_INVALID'
    })

  }
})

router.post('/v1/promotion/acquired', (req, res) => {
  let jsonBody = req.body;
  if (!helper.isNullEmptry(jsonBody.promotion) && !helper.isNullEmptry(jsonBody.userToken)) {
    mysqldb((err, connection) => {
      if (err) {
        logger.info('[CONNECTION_DATABASE_ERROR] ' + err);
        res.status(200).json({
          error: 'API_DATABASE_ERROR'
        });
        connection.release();
      } else {
        connection.query('SELECT * FROM vouchers WHERE usedFlag is not null and userToken = ? and promotion = ? LIMIT 1 ', [jsonBody.userToken, jsonBody.promotion], function (error, results, fields) {
          if (error) {
            logger.info('[VOUCHER_ACQUIRED_ERROR]  ' + error)
            res.status(200).json({
              error: 'API_DATA_NOT_FOUND'
            });
            connection.release();
          } else {
            if (results.length > 0) {
              logger.info('[VOUCHER_ACQUIRED] ' + results[0].code);
              let usedVoucher = {
                promotion: results[0].promotion,
                code: results[0].code,
                userToken: userId,
                usedFlag: 'Y',
                usedDate: moment(results[0].usedDate).format('YYYY-MM-DD HH:mm:ss')
              }
              res.status(200).json(usedVoucher);
            } else {
              let notFoundVoucher = {
                promotion: results[0].promotion,
                code: ''
              }
              res.status(200).json(notFoundVoucher);
            }
            connection.release();
          }
          //connection.release();
        });
      }
    })
  } else {
    res.status(200).json({
      error: 'API_REQUEST_INVALID'
    })
  }
})

module.exports = router;
