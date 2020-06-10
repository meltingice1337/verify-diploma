import { Transaction, Block, script } from '@bitcoin-dot-com/bitcoincashjs2-lib';
import { Db } from 'mongodb';

/**
 * 
 * @param {Db} mongoDb 
 * @param {number} blockHeight 
 */
const processTransaction = (mongoDb, blockHeight) =>

    /**
     * @param {Transaction} tx
     */
    async (tx) => {
        const spentTxs = tx.ins
            .filter(i => script.classifyInput(i.script) === script.types.P2PKH)
            .map(i => ({ txid: i.hash.toString('hex').match(/.{2}/g).reverse().join(""), vout: i.index }))

        for (let spentTx of spentTxs) {
            await mongoDb.collection('utxos').findOneAndDelete({ txid: spentTx.txid, vout: spentTx.vout });
        }

        const utxos = tx
            .outs
            .map((out, index) => ({ value: out, index }))
            .filter(out => script.classifyOutput(out.value.script) === script.types.P2PKH)
            .map((out, index) => ({
                address: script.decompile(out.value.script)[2].toString('hex'),
                txid: tx.getId(),
                vout: out.index,
                satoshis: out.value.value,
                height: blockHeight,
                coinbase: tx.isCoinbase()
            }));

        if (utxos.length > 0) {
            mongoDb.collection('utxos').insertMany(utxos);
        }
    }

const processBlock = (mongoDb) =>
    async (rawBlock) => {
        const block = Block.fromHex(rawBlock);
        const blkPrevHash = block.prevHash.toString('hex');
        const blkMerkleRoot = block.merkleRoot.toString('hex');
        const txs = block.transactions.map(tx => ({
            ...tx,
            outs: tx.outs.map(o => ({ ...o, script: o.script.toString('hex') })),
            ins: tx.ins.map(i => ({ ...i, script: i.script.toString('hex'), hash: i.hash.toString('hex') })),
            id: tx.getId(),
            hash: tx.getHash().toString('hex')
        }));

        const height = await getBlockchainHeight(mongoDb)() + 1;

        block.transactions.forEach(processTransaction(mongoDb, height));

        return {
            ...block,
            merkleRoot: blkMerkleRoot,
            prevHash: blkPrevHash,
            transactions: txs,
            hash: block.getHash().toString('hex'),
            id: block.getId(),
            height
        };
    }


const getBlockchainHeight = (mongoDB) =>
    async () => (await (await mongoDB.collection('blocks')).countDocuments());

module.exports = (mongoDb) => ({
    processBlock: processBlock(mongoDb),
    getBlockchainHeight: getBlockchainHeight(mongoDb)
})
