const zmq = require("zeromq")
const bitbox = new (require('bitbox-sdk').BITBOX)();
const bitcoin = require('bitcoinjs-lib');
const { MongoClient, Db } = require('mongodb');
const express = require('express');
const cors = require('cors');

const { getUTXOQuery, getTXByPartialScriptQuery } = require('./queries');

/**
 * 
 * @param {Db} db 
 */
async function runZMQ(db) {
    const sock = new zmq.Subscriber
    sock.connect("tcp://bch-node:3000")
    sock.subscribe("rawblock")
    sock.subscribe("rawtx")
    console.log("Subscriber connected to port 3000")

    for await (const [topic, msg] of sock) {
        const topicStr = topic.toString();
        console.log({ topicStr })
        if (topicStr === 'rawblock') {
            const rawBlock = msg.toString('hex');
            const block = bitcoin.Block.fromHex(rawBlock);
            const blkPrevHash = block.prevHash.toString('hex');
            const blkMerkleRoot = block.merkleRoot.toString('hex');
            const tx = block.transactions.map(t => {
                const tx = new bitcoin.Transaction(t.toHex())
                return {
                    ...t,
                    outs: t.outs.map(o => ({ ...o, script: o.script.toString('hex') })),
                    ins: t.ins.map(i => ({ ...i, script: i.script.toString('hex'), hash: i.hash.toString('hex') })),
                    hash: t.getHash(),
                    id: t.getId(),
                    hash: t.getHash().toString('hex')
                }
            })
            const height = (await (await db.collection('blocks')).countDocuments() + 1);
            (await db.createCollection('blocks')).insertOne({
                ...block,
                merkleRoot: blkMerkleRoot,
                prevHash: blkPrevHash,
                transactions: tx,
                hash: block.getHash().toString('hex'),
                id: block.getId(),
                height
            });
        } else if (topicStr === 'rawtx') {
            const rawTx = msg.toString('hex');
            console.log({ rawTx })
            const tx = bitcoin.Transaction.fromHex(rawTx);
            console.log(tx.getId())
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
        const utxos = await db.collection('blocks').aggregate(getUTXOQuery(addressBuffer)).toArray();
        const satoshis = utxos.reduce((acc, utxo) => acc + utxo.outs.find(o => o.script.includes(addressBuffer)).value, 0);
        const balance = bitbox.BitcoinCash.toBitcoinCash(satoshis);
        res.json({ balance, satoshis });
    });

    app.get('/address/:addr/utxos', async (req, res) => {
        const addressBuffer = bitcoin.address.fromBase58Check(req.params.addr).hash.toString('hex');
        const utxos = await db.collection('blocks').aggregate(getUTXOQuery(addressBuffer)).toArray();
        const mappedUtxos = utxos.map(utxo => {
            const outIndex = utxo.outs.findIndex(o => o.script.includes(addressBuffer));
            const outSatoshis = utxo.outs[outIndex].value;
            return {
                txid: utxo.id,
                vout: outIndex,
                satoshis: outSatoshis
            }
        });
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

    app.listen(port, () => {
        console.log(`Processor web server started listening on port ${port}`);
    });
}

/**
 * 
 * @param {Db} mongoClient 
 */
async function bootstrap(db) {
    runZMQ(db);
    runExpress(db);
}

connectDb();
