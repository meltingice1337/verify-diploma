const zmq = require("zeromq")
const bitbox = new (require('bitbox-sdk').BITBOX)();
const bitcoin = require('bitcoinjs-lib');
const { MongoClient, Db } = require('mongodb');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const { getUTXOQuery, getTXByPartialScriptQuery } = require('./queries');

/**
 * 
 */
let block = null;

/**
 * 
 * @param {Db} db 
 */
async function runZMQ(db) {
    const sock = new zmq.Subscriber
    sock.connect(process.env.ZEROMQ_URL)
    sock.subscribe("rawblock")
    console.log(`Subscriber connected to ${process.env.ZEROMQ_URL}`)

    for await (const [topic, msg] of sock) {
        const topicStr = topic.toString();
        console.log({ topicStr })
        if (topicStr === 'rawblock') {
            const rawBlock = msg.toString('hex');
            const processedBlock = await block.processBlock(rawBlock);
            // console.log('new block inc', { processedBlock });
            db.collection('blocks').insertOne(processedBlock);
        }
    }
}


async function connectDb() {
    const uri = "mongodb://mongo:27017/db";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        if (err) {
            console.error(err);
            return;
        }
        bootstrap(client.db('db'));
    });
}


/**
 * 
 * @param {Db} mongoClient 
 */
async function runExpress(db) {
    const app = express();
    app.use(cors());
    const port = 44523;

    app.get('/address/:addr/balance', async (req, res) => {
        const addressBuffer = bitcoin.address.fromBase58Check(req.params.addr).hash.toString('hex');
        const height = await block.getBlockchainHeight();
        const utxos = await db.collection('utxos').aggregate(getUTXOQuery(addressBuffer, height)).toArray();
        const satoshis = utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0);
        const balance = bitbox.BitcoinCash.toBitcoinCash(satoshis);
        res.json({ balance, satoshis });
    });

    app.get('/address/:addr/utxos', async (req, res) => {
        const addressBuffer = bitcoin.address.fromBase58Check(req.params.addr).hash.toString('hex');
        const height = await block.getBlockchainHeight();
        const utxos = await db.collection('utxos').aggregate(getUTXOQuery(addressBuffer, height)).toArray();
        const mappedUtxos = utxos.map(utxo => ({ ...utxo, confirmations: height - utxo.height + 1 }));
        res.json({ utxos: mappedUtxos });
    });

    app.get('/transactions/opreturn/:partScript/:inputPK', async (req, res) => {
        if (!req.params.inputPK || !req.params.partScript) {
            return [];
        }

        const bestBlockHeight = await (await db.collection('blocks')).countDocuments();
        const txs = await db.collection('blocks').aggregate(getTXByPartialScriptQuery(req.params.partScript, req.params.inputPK)).toArray();
        res.json(txs.map(tx => ({ ...tx, confirmations: bestBlockHeight - tx.blockHeight + 1 })));
    });

    app.post('/rawtransactions/sendRawTransaction/:txHex', async (req, res) => {
        if (!req.params.txHex) {
            return res.status(400).json({ error: 'No tx hash' });
        }

        console.log(process.env.RPC_USERNAME, process.env.RPC_PASSWORD, req.params.txHex, process.env.RPC_BASEURL)

        let BCHNodeRPC = axios.create({
            baseURL: process.env.RPC_BASEURL
        });

        try {
            const response = await BCHNodeRPC({
                method: 'POST',
                auth: {
                    username: process.env.RPC_USERNAME,
                    password: process.env.RPC_PASSWORD
                },
                data: {
                    jsonrpc: "1.0",
                    id: "sendrawtransaction",
                    method: "sendrawtransaction",
                    params: [
                        req.params.txHex
                    ]
                }
            })
            return res.json(response.data.result);
        } catch (e) {
            return res.status(500).json(e.response.data);
        }
    });

    app.listen(port, () => {
        console.log(`Processor web server started listening on port ${port}`);
    });
}

/**
 * 
 * @param {Db} mongoClient 
 */
async function bootstrap(db) {
    block = require('./block')(db);
    runZMQ(db);
    runExpress(db);
}

connectDb();
