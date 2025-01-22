require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
require("url")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

const urls = [];
let count = 0;

app.post('/api/shorturl', (req, res) => {
  let url;
  try{
    url = new URL(req.body.url);
  }
  catch(e) {
    res.json({ error: 'invalid url' });
    return;
  }
  if(url.protocol !== 'http:' && url.protocol !== 'https:') {
    res.json({ error: 'invalid url' });
    return;
  }
  const validUrl = url.hostname;
  dns.lookup(validUrl, (err, address, family) => {
    if (err) {
      res.json({ error: 'invalid url' })
    }
    else {
      if (!urls.includes(req.body.url)) {
        urls.push(req.body.url);
        count++;
        console.log(urls, count);
      }
      res.json({
        original_url: req.body.url,
        short_url: urls.indexOf(req.body.url) + 1
      });
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  if(req.params.id > count) {
    res.json({ error: 'No short URL found for the given input' });
  }
  else{
    const externarlUrl = urls[req.params.id - 1];
    res.redirect(externarlUrl);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});