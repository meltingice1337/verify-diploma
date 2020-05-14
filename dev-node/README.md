## Helpful bitcoin-cli commands

- General command: 
    - docker exec -it vd-bch-node ./bitcoin-cli -rpcpassword=test -rpcuser=test method
- Best block: 
    - docker exec -it vd-bch-node ./bitcoin-cli -rpcpassword=test -rpcuser=test getblockcount 
- Send money to address: 
    - docker exec -it vd-bch-node ./bitcoin-cli -rpcpassword=test -rpcuser=test generatetoaddress 1 mtmDjwChPPvPR9qiJKjrncVug7yuWHC9nc
- Generate 100 blocks for usage of the bitcoin reward:  
    - docker exec -it vd-bch-node ./bitcoin-cli -rpcpassword=test -rpcuser=test generate 100
