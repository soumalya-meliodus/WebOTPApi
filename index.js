const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const https = require('https')
var cors = require('cors')
var bodyParser = require('body-parser')

const corsOpts = {
  origin: '*',

  /* methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ], */
};
app.use(cors(corsOpts));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
})

/* app.use(bodyParser({ extended: false })) */

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

/* helpers */
const generateOTP = () => {
  var digits = "0123456789";
  var otpLength = 4;
  var otp = "";
  for (let i = 1; i <= otpLength; i++) {
    var index = Math.floor(Math.random() * digits.length);
    otp = otp + digits[index];
  }
  return otp;
};

app.post('/', jsonParser, async (req, res) => {
  console.log('POST /')
  console.dir(req.body)
  try{
    let phone = req.body.phone;

    /* send OTP */
    let generateOTPVal = generateOTP()
    let apiEndpoint2FactorHost = '2factor.in'
    let apiEndpoint2FactorRequestURI = '/API/V1/[api_key]/SMS/+91[phone_no]/[custom_otp_val]'
    .replace("[api_key]", 'cd1c1e31-4371-11ea-9fa5-0200cd936042') //c7d53d63-c46a-11ea-9fa5-0200cd936042
    .replace("[phone_no]", phone)
    .replace("[custom_otp_val]", generateOTPVal);
    console.log(
      "apiEndpoint2FactorRequestURI : " + apiEndpoint2FactorRequestURI
    );
    const data = JSON.stringify({
      From: 'PAPRKN',
      To: phone,
      TemplateName: 'PAPRKN',
      VAR1: generateOTPVal
    })

    var options = {
      host: apiEndpoint2FactorHost,
      port: 443,
      path: apiEndpoint2FactorRequestURI,
      //method: "GET",
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };
    try {
      let rq = await https
        .request(options, function (r) {
          console.log("STATUS: " + r.statusCode);
          console.log("HEADERS: " + JSON.stringify(r.headers));
          r.setEncoding("utf8");

          var body = '';

          r.on("data", function (chunk) {
            console.log("BODY: " + chunk);
            body = body + chunk;
          });

          r.on('end',function(){
            console.log("Body :" + body);
            if (r.statusCode != 200) {
              //callback("Api call failed with response code " + r.statusCode);
              res.status(400).json({ status: false, msg: "Api call failed with response code " + r.statusCode });
            } else {
              //callback(null);
              /* res.status(200).json({
                status: true,
                msg: "OTP has been successfully sent to your mobile no.",
              }); */
            }
          });
        });
        //.write(data)
        //.end();

        rq.on('error', function (e) {
          //console.log("Error : " + e.message);
          //callback(e);
          res.status(400).json({ status: false, msg: e.message });
        });
      
        // write data to request body
        rq.write(data);
        rq.end();
    } catch (err) {
      //res.status(400).json({ err });
      console.log(err);
    } 

    /* response */
    res.status(200).json({
      status: true,
      msg: "OTP has been successfully sent to your mobile no.",
    }); 

    //res.writeHead(200, {'Content-Type': 'text/html'})
    //res.end('thanks')
  } catch (err) {
    res.status(400).json({ status: false, msg: err });
  }
});

app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('sms server is running');
}); 

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
});