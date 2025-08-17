# 🚀 Using Mainnet Config on Testnet - Complete Setup

This guide shows you how to use the mainnet config structure on Aurora testnet for full functionality.

## 🎯 **What We've Set Up:**

1. **✅ Mainnet Config Structure** - All routes, tokens, routers
2. **✅ Testnet Network** - Aurora testnet for testing
3. **✅ Fallback System** - Uses testnet config if available, falls back to mainnet
4. **✅ Full Functionality** - All 171 routes, all tokens, all routers

## 🔧 **How It Works:**

### **Network Detection:**
- **`aurora_testnet`** → Tries `aurora-testnet.json`, falls back to `aurora.json`
- **`aurora`** → Uses `aurora.json` (mainnet)
- **`fantom`** → Uses `fantom.json`

### **Config Structure:**
Both configs have the same structure:
- **171 arbitrage routes** (from mainnet)
- **All token addresses** (USDC, USDT, WNEAR, AURORA, etc.)
- **All router addresses** (Trisolaris, WannaSwap, AuroraSwap)
- **All base assets** (WETH, WNEAR, USDT, etc.)

## 🚀 **Usage:**

### **1. Deploy Contracts:**
```bash
npx hardhat run --network aurora_testnet scripts/deploy-testnet.js
```

### **2. Update Config:**
After deployment, update `config/aurora-testnet.json`:
```json
{
  "arbContract": "YOUR_DEPLOYED_ARB_ADDRESS",
  "minBasisPointsPerTrade": 0,
  // ... rest stays the same
}
```

### **3. Run Trading Bot:**
```bash
npx hardhat run --network aurora_testnet scripts/trade.js
```

## 🎉 **Benefits:**

- ✅ **Full functionality** - All 171 routes available
- ✅ **Real DEX data** - Actual testnet liquidity pools
- ✅ **Complete token set** - All major tokens included
- ✅ **Production structure** - Same as mainnet
- ✅ **Safe testing** - No real money involved

## 🔍 **What You Get:**

- **171 arbitrage routes** to test
- **6 base assets** (WETH, WNEAR, USDT, AURORA, etc.)
- **6 major tokens** (USDC, USDT, WNEAR, AURORA, WETH, DAI)
- **3 DEX routers** (Trisolaris, WannaSwap, AuroraSwap)
- **Real market data** from Aurora testnet

## ⚠️ **Important Notes:**

- **Testnet config** overrides mainnet when available
- **Same structure** means same functionality
- **Real DEX protocols** on testnet
- **No mainnet costs** - safe testing environment

---

**Your repo is now fully functional with mainnet config structure on testnet! 🎉**
