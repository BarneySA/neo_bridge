var send_amount = 0.000001;

// Librerias necesarias
var neon = require('@cityofzion/neon-js');
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
    // Esto responde el siguiente formato:
    /*
        {
            "extra": null,
            "isDefault": false,
            "lock": false,
            "contract": {
                "script": "210390d4b763dbdfb84ba4712e2e676950fd8567b0831a6e6bcac7342e91aaa520cbac",
                "parameters": [
                    {
                        "name": "signature",
                        "type": "Signature"
                    }
                ],
                "deployed": false
            },
            "_privateKey": "25ec34762512b83dc3c0bea0b522c6e49a71e41773f25e25b500967bb055c9c5",
            "_publicKey": "0390d4b763dbdfb84ba4712e2e676950fd8567b0831a6e6bcac7342e91aaa520cb",
            "_scriptHash": "de9fc5849f913dc8c82cf4d4524446d44baf0dc4",
            "_address": "AZeWUvubh2HcqgKtmzbopmJVyoLThZSN89",
            "label": "AZeWUvubh2HcqgKtmzbopmJVyoLThZSN89"
        }
    */
    response.json(nwallet.accounts[0]);
});

app.get('/wallet/transfer/:from/:public_key/:for', function (request, response) {
    const intent = neon.api.makeIntent({ GAS: send_amount }, request.params.for);

    const config = {
        net: config_neon_network, 
        address: request.params.from,  
        privateKey: request.params.public_key,
        intents: intent
    }

    neon.api.sendAsset(config)
    .then(config => {
        console.log(config.response);
        return response.json(config);
    })
    .catch(config => {
        console.log(config);
        return response.json(config);
    });

});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

