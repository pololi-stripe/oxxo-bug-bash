# OXXO Bug Bash

## How to start

1. `yarn install`
2. update `.env` to assign values to `REACT_APP_STRIPE_SECRET_KEY` and `REACT_APP_STRIPE_PUBLIC_KEY`
3. In one tab: `yarn start`
4. In another tab: `ngrok http 3000 -host-header="localhost:3000"`
