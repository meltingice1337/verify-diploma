
/**
 * 
 * @param {string} address 
 * @returns {object[]}
 */
const getUTXOQuery = (address, height) => {
    return [
        { $unwind: '$transactions' },
        {
            $match: {
                $expr: {
                    $cond: [
                        { $in: ["0000000000000000000000000000000000000000000000000000000000000000", "$transactions.ins.hash"] },
                        { $lt: ["$height", height - 100] },
                        true
                    ]
                },
                'transactions.outs.script': `76a914${address}88ac`
            }
        },
        {
            $lookup: {
                from: 'blocks',
                localField: 'transactions.hash',
                foreignField: 'transactions.ins.hash',
                as: 'prevTxLink'
            }
        }, { $match: { 'prevTxLink.0': { $exists: false } } },
        { $replaceRoot: { newRoot: '$transactions' } }
    ]
}

/**
 * 
 * @param {string} address 
 * @returns {object[]}
 */
const getTXByPartialScriptQuery = (partialScript, inputPK) => {
    return [
        { $unwind: '$transactions' },
        {
            $match: {
                'transactions.outs.script': { $regex: new RegExp(`^6a.{2}${partialScript}`) },
                'transactions.ins.script': { $regex: new RegExp(`${inputPK}$`) }
            }
        },
        { $sort: { height: 1 } },
        {
            $addFields: {
                'transactions.blockHeight': '$height',
                'transactions.blockTime': '$timestamp'
            }
        },
        { $replaceRoot: { newRoot: '$transactions' } }
    ]
}

module.exports = {
    getUTXOQuery,
    getTXByPartialScriptQuery
}
