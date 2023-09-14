```bash
npx hardhat deploy --network [network]

npx hardhat verify --network [network] [token_address] WorldToken WORLD
npx hardhat verify --network [network] [vesting_address] [token_address]

# añadimos un vesting
npx hardhat scheludeVesting --contratovesting [vesting_address] --wallet [address] --amount 100000 --starttime "$(date -u -v+1M +"%Y-%m-%dT%H:%M:%S.000Z")" --duration 1 --percenttostart 20 --cliff "$(date -u -v+1M +"%Y-%m-%dT%H:%M:%S.000Z")" --network [network]

# reclamamos tokens
npx hardhat releaseVesting --contratovesting [vesting_address] --wallet [address] --token [token_address] --network [network]

# mostramos vesting
npx hardhat printVesting --contratovesting [vesting_address] --wallet [address] --network [network]

# bloqueamos un vesting
npx hardhat blockVesting --contratovesting [vesting_address] --wallet [address] --num 1 --network [network] 

# desbloqueamos un vesting
npx hardhat unblockVesting --contratovesting [vesting_address] --wallet [address] --num 1 --network [network] 
```
