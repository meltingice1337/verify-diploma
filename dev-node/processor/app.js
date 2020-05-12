const zmq = require("zeromq")
var bitcoin = require('bitcoinjs-lib');

async function run() {
    const sock = new zmq.Subscriber

    sock.connect("tcp://127.0.0.1:3000")
    sock.subscribe("rawblock")
    console.log("Subscriber connected to port 3000")

    for await (const [topic, msg] of sock) {
        var rawTx = msg.toString('hex');
        var tx = bitcoin.Block.fromHex(rawTx);
        console.log({ tx })
        console.log("received a message related to:", topic, "containing message:", msg)
    }
}

run()