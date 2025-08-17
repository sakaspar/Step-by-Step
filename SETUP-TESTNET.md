# 🚀 Aurora Testnet Setup Guide

This guide will help you set up and run the DEX arbitrage bot on Aurora testnet with real data.

## 📋 Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** project set up
3. **Private key** in your `.env` file
4. **MetaMask** or similar wallet

## 🔑 Step 1: Get Testnet NEAR Tokens

1. Visit the [Aurora Faucet](https://aurora.dev/faucet)
2. Connect your wallet
3. Request testnet NEAR tokens (you'll get ~10 NEAR)
4. Wait for confirmation

## ⚙️ Step 2: Deploy Contracts to Testnet

```bash
# Deploy all contracts to Aurora testnet
npx hardhat run --network aurora_testnet scripts/deploy-testnet.js
```

**Important:** Save the deployed contract addresses from the output!

## 🔧 Step 3: Update Trading Script

After deployment, update `scripts/trade-testnet.js` with your deployed addresses:

```javascript
const ARB_ADDRESS = "YOUR_ACTUAL_ARB_ADDRESS";
const INSTA_ARB_ADDRESS = "YOUR_ACTUAL_INSTA_ARB_ADDRESS";
```

## 💰 Step 4: Fund Your Contracts

Your contracts need tokens to trade with. You can:

1. **Transfer tokens manually** from your wallet to the contract addresses
2. **Use Aurora testnet faucets** for USDC, USDT, etc.
3. **Swap NEAR for tokens** on Trisolaris or WannaSwap testnet

## 🚀 Step 5: Run the Trading Bot

```bash
# Start scanning for arbitrage opportunities
npx hardhat run --network aurora_testnet scripts/trade-testnet.js
```

## 📊 Understanding the Output

The bot will:
- ✅ Check your contract setup
- 💰 Display token balances
- 🔍 Scan all router/token combinations
- 📈 Show profitable opportunities
- 💡 Provide execution instructions

## 🛠️ Troubleshooting

### "Insufficient balance" error
- Get more testnet NEAR from the faucet
- Check your `.env` file has the correct private key

### "Contracts not configured" error
- Run the deployment script first
- Check contract addresses are correct

### "No profitable opportunities" message
- This is normal on testnet
- Try different token amounts
- Wait for market conditions to change

## 🔄 Continuous Monitoring

For production use, you can:

1. **Set up a cron job** to run the script every few minutes
2. **Add Telegram/Discord notifications** for profitable opportunities
3. **Implement automatic trade execution** when profit thresholds are met

## 📚 Additional Resources

- [Aurora Testnet Explorer](https://testnet.aurorascan.dev/)
- [Trisolaris Testnet](https://testnet.trisolaris.io/)
- [WannaSwap Testnet](https://testnet.wannaswap.finance/)
- [Aurora Documentation](https://doc.aurora.dev/)

## ⚠️ Important Notes

- **Testnet tokens have no real value**
- **Gas fees are minimal on testnet**
- **Perfect for testing and development**
- **Real arbitrage opportunities may be limited**

## 🎯 Next Steps

1. Deploy to testnet
2. Test with small amounts
3. Monitor performance
4. Optimize parameters
5. Deploy to mainnet (when ready)

---

**Happy arbitraging! 🎉**
