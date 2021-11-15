const express = require('express');
var app = express();
const redisCli = require('redis');
const client = redisCli.createClient();
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect().then(()=>console.log('connected to redis!'));

// serve static files from public directory
app.use(express.static("public"));

// Get values for holy grail layout
function data() {
	return client.get('header').
		then((header) => client.get('left').
			then((left) => client.get('article').
				then((article) => client.get('right').
					then((right) => client.get('footer').
						then((footer) =>
							({ header:header||0, left:left||0, article:article||0, right:right||0, footer:footer||0 }))))))
}

// plus
app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value || 0);
  client.get(key).then((cur)=>client.set(key, (Number(cur)+value).toString()));
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
