const config = require('./config');
let uniquID = require('generate-unique-id');
let jwt = require("jsonwebtoken");
var buffer = require('buffer/').Buffer;
let LiqPay = require('./liqpay/liqpay');
const { private_liqpay, pulic_liqpay } = require('./config');
var liqpay = new LiqPay(config.pulic_liqpay, config.private_liqpay);

let str = '{"signature":"Sx0nDasNSIPy7+OcwnOS6o41As4=","data":"eyJwYXltZW50X2lkIjoyMzU0MTk1ODYxLCJhY3Rpb24iOiJwYXkiLCJzdGF0dXMiOiJzdWNjZXNzIiwidmVyc2lvbiI6MywidHlwZSI6ImJ1eSIsInBheXR5cGUiOiJjYXJkIiwicHVibGljX2tleSI6InNhbmRib3hfaTg0NDIwMjIyMzMxIiwiYWNxX2lkIjo0MTQ5NjMsIm9yZGVyX2lkIjoieWN2NTlmYTFjazNlMHJjdjEyY24iLCJsaXFwYXlfb3JkZXJfaWQiOiJUSUFWNjVDOTE2OTI0OTE0NDc5NzQ3MjIiLCJkZXNjcmlwdGlvbiI6ImRlc2NyaXB0aW9uIHRleHQiLCJzZW5kZXJfY2FyZF9tYXNrMiI6IjQyNDI0Mio0MiIsInNlbmRlcl9jYXJkX2JhbmsiOiJUZXN0Iiwic2VuZGVyX2NhcmRfdHlwZSI6InZpc2EiLCJzZW5kZXJfY2FyZF9jb3VudHJ5Ijo4MDQsImlwIjoiMTQxLjEzOC4xMjUuMTM4IiwiYW1vdW50IjoxLjAsImN1cnJlbmN5IjoiVUFIIiwic2VuZGVyX2NvbW1pc3Npb24iOjAuMCwicmVjZWl2ZXJfY29tbWlzc2lvbiI6MC4wMiwiYWdlbnRfY29tbWlzc2lvbiI6MC4wLCJhbW91bnRfZGViaXQiOjEuMCwiYW1vdW50X2NyZWRpdCI6MS4wLCJjb21taXNzaW9uX2RlYml0IjowLjAsImNvbW1pc3Npb25fY3JlZGl0IjowLjAyLCJjdXJyZW5jeV9kZWJpdCI6IlVBSCIsImN1cnJlbmN5X2NyZWRpdCI6IlVBSCIsInNlbmRlcl9ib251cyI6MC4wLCJhbW91bnRfYm9udXMiOjAuMCwibXBpX2VjaSI6IjciLCJpc18zZHMiOmZhbHNlLCJsYW5ndWFnZSI6InVrIiwiY3JlYXRlX2RhdGUiOjE2OTI0OTE0NDc5NzcsImVuZF9kYXRlIjoxNjkyNDkxNDQ4MDQ4LCJ0cmFuc2FjdGlvbl9pZCI6MjM1NDE5NTg2MX0="}'

let body = JSON.parse(str)

console.log(body)

console.log('////////////////////////');
if(toString(liqpay.str_to_sign(private_liqpay+body.data+pulic_liqpay))===toString(body.signature)){
  console.log('////////////////////////');
//   console.log(Buffer.from(body.data).toString('base64'))
console.log(JSON.parse(buffer.from(body.data, 'base64').toString('ascii')).status)
}else{
console.log('fail')
}