var send_amount = 0.000001;

// Librerias necesarias
var neon = require('@cityofzion/neon-js');
var Neon = neon.default;

var express = require('express');
var app = express();
var mysql = require('mysql');

// Configs
var config_neon_network = 'MainNet';

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to mysql!");
});

app.get('/wallet/balance/:address', function (request, response) {
    const balance = neon.api.getBalanceFrom({
        net: config_neon_network,
        address: request.params.address
    }, neon.api.neonDB);

    balance.then(function (r) {
        // console.log(r.balance.assets);
        response.json(r.balance.assets);
    });
});

app.get('/wallet/create', function (request, response) {
    const nwallet = new neon.wallet.Wallet({name: 'SBBWALLET'});
    nwallet.addAccount();
    response.json(nwallet.accounts[0]);
});

app.get('/wallet/transfer/:from/:public_key/:for/:amount/:currency', function (request, response) {
   
    var tconfig = null;
    
    if (request.params.currency=='NEO') {
        tconfig = { NEO: request.params.amount };
    } else {
        tconfig = { GAS: request.params.amount };
    }

    const intent = neon.api.makeIntent(tconfig, request.params.for);

    const config = {
        net: config_neon_network,
        address: request.params.from,
        privateKey: request.params.public_key,
        intents: intent
    }

    neon.api.sendAsset(config)
    .then(config => {
        return response.json(config);
    })
    .catch(config => {
        return response.json(config);
    });
    

});

// app.get('/contract/open', function (request, response) {

//     const props = {
//         scriptHash: '5b7074e873973a6ed3708862f219a6fbf4d1c411', // Scripthash for the contract
//         operation: 'balanceOf', // name of operation to perform.
//         args: [neon.u.reverseHex('cef0c0fdcfe7838eff6ff104f9cdec2922297537')] // any optional arguments to pass in. If null, use empty array.
//     };

//     const script = neon.sc.createScript(props);

//     neon.rpc.Query.invokeScript(script)
//     .execute('http://seed3.neo.org:20332')
//     .then(res => {
//         response.json(res);
//     });
        
// });

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

