const zmq = require("zeromq")
var bitcoin = require('bitcoinjs-lib');
const MongoClient = require('mongodb').MongoClient;

async function run() {
    const sock = new zmq.Subscriber

    sock.connect("tcp://bch-node:3000")
    sock.subscribe("rawblock")
    console.log("Subscriber connected to port 3000")

    for await (const [topic, msg] of sock) {
        var rawTx = msg.toString('hex');
        var tx = bitcoin.Block.fromHex(rawTx);
        console.log({ tx })
        console.log("received a message related to:", topic, "containing message:", msg)
    }
}


async function connectDb() {
    const uri = "mongodb://mongo:27017/db";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        console.error({ err });
    });
}

connectDb();
run()