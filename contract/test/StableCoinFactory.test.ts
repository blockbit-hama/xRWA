import { expect } from "chai";
import { ethers } from "hardhat";

describe("StableCoinFactory", function () {
  let factory: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const StableCoinFactory = await ethers.getContractFactory("StableCoinFactory");
    factory = await StableCoinFactory.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should start with zero stable coins", async function () {
      expect(await factory.getStableCoinCount()).to.equal(0);
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize issuers", async function () {
      await factory.setAuthorizedIssuer(addr1.address, true);
      expect(await factory.authorizedIssuers(addr1.address)).to.be.true;
    });

    it("Should not allow non-owner to authorize issuers", async function () {
      await expect(
        factory.connect(addr1).setAuthorizedIssuer(addr2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Creating Stable Coins", function () {
    it("Should allow owner to create stable coin", async function () {
      const tx = await factory.createStableCoin(
        "USD Stable Coin",
        "USDC",
        18,
        ethers.parseEther("1000000")
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      expect(await factory.getStableCoinCount()).to.equal(1);
      
      const tokenInfo = await factory.getStableCoinInfo(0);
      expect(tokenInfo.name).to.equal("USD Stable Coin");
      expect(tokenInfo.symbol).to.equal("USDC");
      expect(tokenInfo.decimals).to.equal(18);
      expect(tokenInfo.maxSupply).to.equal(ethers.parseEther("1000000"));
      expect(tokenInfo.issuer).to.equal(owner.address);
      expect(tokenInfo.active).to.be.true;
    });

    it("Should allow authorized issuer to create stable coin", async function () {
      await factory.setAuthorizedIssuer(addr1.address, true);
      
      const tx = await factory.connect(addr1).createStableCoin(
        "EUR Stable Coin",
        "EURC",
        18,
        ethers.parseEther("500000")
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      expect(await factory.getStableCoinCount()).to.equal(1);
      
      const tokenInfo = await factory.getStableCoinInfo(0);
      expect(tokenInfo.name).to.equal("EUR Stable Coin");
      expect(tokenInfo.symbol).to.equal("EURC");
      expect(tokenInfo.issuer).to.equal(addr1.address);
    });

    it("Should not allow unauthorized issuer to create stable coin", async function () {
      await expect(
        factory.connect(addr1).createStableCoin(
          "USD Stable Coin",
          "USDC",
          18,
          ethers.parseEther("1000000")
        )
      ).to.be.revertedWith("Not authorized to issue");
    });

    it("Should not allow duplicate symbol", async function () {
      await factory.createStableCoin(
        "USD Stable Coin",
        "USDC",
        18,
        ethers.parseEther("1000000")
      );

      await expect(
        factory.createStableCoin(
          "Another USD Coin",
          "USDC",
          18,
          ethers.parseEther("1000000")
        )
      ).to.be.revertedWith("Symbol already exists");
    });

    it("Should not allow zero max supply", async function () {
      await expect(
        factory.createStableCoin(
          "USD Stable Coin",
          "USDC",
          18,
          0
        )
      ).to.be.revertedWith("Max supply must be greater than 0");
    });
  });

  describe("Querying Stable Coins", function () {
    beforeEach(async function () {
      await factory.createStableCoin(
        "USD Stable Coin",
        "USDC",
        18,
        ethers.parseEther("1000000")
      );
      
      await factory.createStableCoin(
        "EUR Stable Coin",
        "EURC",
        18,
        ethers.parseEther("500000")
      );
    });

    it("Should return correct stable coin count", async function () {
      expect(await factory.getStableCoinCount()).to.equal(2);
    });

    it("Should return correct stable coin info", async function () {
      const tokenInfo = await factory.getStableCoinInfo(0);
      expect(tokenInfo.name).to.equal("USD Stable Coin");
      expect(tokenInfo.symbol).to.equal("USDC");
    });

    it("Should return correct stable coin by symbol", async function () {
      const usdcAddress = await factory.getStableCoinBySymbol("USDC");
      const eurcAddress = await factory.getStableCoinBySymbol("EURC");
      
      expect(usdcAddress).to.not.equal(ethers.ZeroAddress);
      expect(eurcAddress).to.not.equal(ethers.ZeroAddress);
      expect(usdcAddress).to.not.equal(eurcAddress);
    });

    it("Should return zero address for non-existent symbol", async function () {
      const address = await factory.getStableCoinBySymbol("NONEXISTENT");
      expect(address).to.equal(ethers.ZeroAddress);
    });

    it("Should return stable coins by issuer", async function () {
      const ownerTokens = await factory.getStableCoinsByIssuer(owner.address);
      expect(ownerTokens.length).to.equal(2);
      
      await factory.setAuthorizedIssuer(addr1.address, true);
      await factory.connect(addr1).createStableCoin(
        "JPY Stable Coin",
        "JPYC",
        18,
        ethers.parseEther("10000000")
      );
      
      const addr1Tokens = await factory.getStableCoinsByIssuer(addr1.address);
      expect(addr1Tokens.length).to.equal(1);
    });
  });

  describe("Events", function () {
    it("Should emit StableCoinCreated event", async function () {
      await expect(
        factory.createStableCoin(
          "USD Stable Coin",
          "USDC",
          18,
          ethers.parseEther("1000000")
        )
      ).to.emit(factory, "StableCoinCreated")
        .withArgs(
          await factory.getStableCoinBySymbol("USDC"),
          "USD Stable Coin",
          "USDC",
          owner.address
        );
    });

    it("Should emit IssuerAuthorized event", async function () {
      await expect(
        factory.setAuthorizedIssuer(addr1.address, true)
      ).to.emit(factory, "IssuerAuthorized")
        .withArgs(addr1.address, true);
    });
  });
});