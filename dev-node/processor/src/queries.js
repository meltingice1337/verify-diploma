
/**
 * 
 * @param {string} address 
 * @returns {object[]}
 */
const getUTXOQuery = (address, height) => {
    return [
        {
            $match: {
                $expr: {
                    $cond: [
                        { $eq: ["$coinbase", true] },
                        { $lte: ["$height", height - 100] },
                        true
                    ]
                },
                'address': address
            }
        }
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
