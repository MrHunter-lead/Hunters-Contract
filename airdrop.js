const https = require("https");

const data = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "requestAirdrop",
  params: [
    "3nD6vntJ92yrhgKU1iEGKnN726ZoW66TxEQ8foHLehLd",
    1000000000
  ]
});

const options = {
  hostname: "devnet.helius-rpc.com",
  path: "/?api-key=2e3f1f9f-7866-4134-9233-1a3c3bba7c56",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => console.log(body));
});

req.write(data);
req.end();