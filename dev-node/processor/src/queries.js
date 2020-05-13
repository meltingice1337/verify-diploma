
/**
 * 
 * @param {string} address 
 * @returns {object[]}
 */
const getUTXOQuery = (address) => {
    return [
        {
            $unwind: '$transactions'
        }, {
            $match: {
                'transactions.outs.script': `76a914${address}88ac`
            }
        }, {
            $lookup: {
                from: 'blocks',
                localField: 'transactions.hash',
                foreignField: 'transactions.ins.hash',
                as: 'prevTxLink'
            }
        }, {
            $match: {
                'prevTxLink.0': {
                    $exists: false
                }
            }
        }, {
            $replaceRoot: {
                newRoot: '$transactions'
            }
        }
    ]
}


module.exports = {
    getUTXOQuery: getUTXOQuery
}