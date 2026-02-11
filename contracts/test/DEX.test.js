const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX Tests", function () {
  let factory, router, tokenA, tokenB, pair;
  let owner, user1, user2;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const MAX_UINT256 = ethers.constants.MaxUint256;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Factory
    const DexFactory = await ethers.getContractFactory("DexFactory");
    factory = await DexFactory.deploy(owner.address);
    await factory.deployed();

    // Deploy Router
    const DexRouter = await ethers.getContractFactory("DexRouter");
    router = await DexRouter.deploy(factory.address);
    await router.deployed();

    // Deploy Tokens
    const Token = await ethers.getContractFactory("Token");
    tokenA = await Token.deploy("Token A", "TKNA", ethers.utils.parseEther("1000000"));
    await tokenA.deployed();

    tokenB = await Token.deploy("Token B", "TKNB", ethers.utils.parseEther("1000000"));
    await tokenB.deployed();

    // Transfer tokens to users
    await tokenA.transfer(user1.address, ethers.utils.parseEther("1000"));
    await tokenB.transfer(user1.address, ethers.utils.parseEther("1000"));

    // Create pair
    await factory.createPair(tokenA.address, tokenB.address);
    const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
    pair = await ethers.getContractAt("DexPair", pairAddress);
  });

  describe("Factory", function () {
    it("Should create a pair", async function () {
      const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
      expect(pairAddress).to.not.equal(ZERO_ADDRESS);
    });

    it("Should prevent duplicate pairs", async function () {
      await expect(
        factory.createPair(tokenA.address, tokenB.address)
      ).to.be.revertedWith("DexFactory: PAIR_EXISTS");
    });

    it("Should not allow identical addresses", async function () {
      await expect(
        factory.createPair(tokenA.address, tokenA.address)
      ).to.be.revertedWith("DexFactory: IDENTICAL_ADDRESSES");
    });
  });

  describe("Liquidity", function () {
    it("Should add liquidity", async function () {
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      // Approve tokens
      await tokenA.connect(user1).approve(router.address, MAX_UINT256);
      await tokenB.connect(user1).approve(router.address, MAX_UINT256);

      // Add liquidity
      const deadline = Math.floor(Date.now() / 1000) + 300;
      await router.connect(user1).addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        0,
        0,
        user1.address,
        deadline
      );

      const lpBalance = await pair.balanceOf(user1.address);
      expect(lpBalance).to.be.gt(0);
    });

    it("Should remove liquidity", async function () {
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      // Add liquidity
      await tokenA.connect(user1).approve(router.address, MAX_UINT256);
      await tokenB.connect(user1).approve(router.address, MAX_UINT256);

      const deadline = Math.floor(Date.now() / 1000) + 300;
      await router.connect(user1).addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        0,
        0,
        user1.address,
        deadline
      );

      const lpBalance = await pair.balanceOf(user1.address);

      // Remove liquidity
      await pair.connect(user1).approve(router.address, lpBalance);
      await router.connect(user1).removeLiquidity(
        tokenA.address,
        tokenB.address,
        lpBalance,
        0,
        0,
        user1.address,
        deadline
      );

      const newLpBalance = await pair.balanceOf(user1.address);
      expect(newLpBalance).to.equal(0);
    });
  });

  describe("Swaps", function () {
    beforeEach(async function () {
      // Add initial liquidity
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      await tokenA.connect(user1).approve(router.address, MAX_UINT256);
      await tokenB.connect(user1).approve(router.address, MAX_UINT256);

      const deadline = Math.floor(Date.now() / 1000) + 300;
      await router.connect(user1).addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        0,
        0,
        user1.address,
        deadline
      );
    });

    it("Should swap tokens", async function () {
      const amountIn = ethers.utils.parseEther("10");
      const path = [tokenA.address, tokenB.address];

      // Approve input token
      await tokenA.connect(user2).approve(router.address, MAX_UINT256);

      // Give user2 some tokenA
      await tokenA.transfer(user2.address, amountIn);

      const deadline = Math.floor(Date.now() / 1000) + 300;

      // Get expected output
      const amounts = await router.getAmountsOut(amountIn, path);
      const expectedOut = amounts[1];

      // Perform swap
      await router.connect(user2).swapExactTokensForTokens(
        amountIn,
        0,
        path,
        user2.address,
        deadline
      );

      const balanceOut = await tokenB.balanceOf(user2.address);
      expect(balanceOut).to.equal(expectedOut);
    });

    it("Should calculate amounts correctly", async function () {
      const amountIn = ethers.utils.parseEther("1");
      const path = [tokenA.address, tokenB.address];

      const amounts = await router.getAmountsOut(amountIn, path);
      expect(amounts[0]).to.equal(amountIn);
      expect(amounts[1]).to.be.gt(0);
      expect(amounts[1]).to.be.lt(amountIn); // Less due to 0.3% fee
    });
  });

  describe("Price", function () {
    it("Should calculate correct price", async function () {
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("200");

      // Add liquidity with different amounts
      await tokenA.connect(user1).approve(router.address, MAX_UINT256);
      await tokenB.connect(user1).approve(router.address, MAX_UINT256);

      const deadline = Math.floor(Date.now() / 1000) + 300;
      await router.connect(user1).addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        0,
        0,
        user1.address,
        deadline
      );

      const [reserveA, reserveB] = await router.getReserves(tokenA.address, tokenB.address);
      expect(reserveA).to.equal(amountA);
      expect(reserveB).to.equal(amountB);
    });
  });
});
