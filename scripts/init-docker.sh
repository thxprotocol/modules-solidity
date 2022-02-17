#!/bin/bash

WORKER_PID=''

handle_sig_term() {
    kill -TERM $WORKER_PID
    wait $WORKER_PID
}

trap 'handle_sig_term' TERM INT

I=0

# Deploy contracts in background
sh -c 'sleep 1 && npm run deploy' &

# Start Hardhat node
npx hardhat node & WORKER_PID=$!
wait $WORKER_PID
