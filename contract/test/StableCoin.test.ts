import { expect } from "chai";
import { ethers } from "hardhat";

describe("StableCoin", function () {
  let stableCoin: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const StableCoin = await ethers.getContractFactory("StableCoin");
    stableCoin = await StableCoin.deploy(
      "USD Stable Coin",
      "USDC",
      18,
      ethers.parseEther("1000000"),
      owner.address
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await stableCoin.owner()).to.equal(owner.address);
    });

    it("Should set the right name and symbol", async function () {
      expect(await stableCoin.name()).to.equal("USD Stable Coin");
      expect(await stableCoin.symbol()).to.equal("USDC");
    });

    it("Should set the right decimals", async function () {
      expect(await stableCoin.decimals()).to.equal(18);
    });

    it("Should set the right max supply", async function () {
      expect(await stableCoin.maxSupply()).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await stableCoin.mint(addr1.address, mintAmount);
      
      expect(await stableCoin.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        stableCoin.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not mint more than max supply", async function () {
      const maxSupply = await stableCoin.maxSupply();
      const tooMuch = maxSupply + ethers.parseEther("1");
      
      await expect(
        stableCoin.mint(addr1.address, tooMuch)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // 먼저 토큰을 민팅
      await stableCoin.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Should allow token holder to burn tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      await stableCoin.connect(addr1).burn(burnAmount);
      
      expect(await stableCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
    });

    it("Should not burn more than balance", async function () {
      const burnAmount = ethers.parseEther("2000");
      
      await expect(
        stableCoin.connect(addr1).burn(burnAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("KYC and Freezing", function () {
    it("Should allow owner to set KYC status", async function () {
      await stableCoin.setKYCVerified(addr1.address, true);
      expect(await stableCoin.kycVerified(addr1.address)).to.be.true;
    });

    it("Should allow owner to freeze account", async function () {
      await stableCoin.setFrozen(addr1.address, true);
      expect(await stableCoin.frozen(addr1.address)).to.be.true;
    });

    it("Should prevent transfer from non-KYC account", async function () {
      await stableCoin.mint(addr1.address, ethers.parseEther("1000"));
      
      await expect(
        stableCoin.connect(addr1).transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Sender not KYC verified");
    });

    it("Should prevent transfer to non-KYC account", async function () {
      await stableCoin.mint(addr1.address, ethers.parseEther("1000"));
      await stableCoin.setKYCVerified(addr1.address, true);
      
      await expect(
        stableCoin.connect(addr1).transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Recipient not KYC verified");
    });

    it("Should prevent transfer from frozen account", async function () {
      await stableCoin.mint(addr1.address, ethers.parseEther("1000"));
      await stableCoin.setKYCVerified(addr1.address, true);
      await stableCoin.setKYCVerified(addr2.address, true);
      await stableCoin.setFrozen(addr1.address, true);
      
      await expect(
        stableCoin.connect(addr1).transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Sender account is frozen");
    });

    it("Should prevent transfer to frozen account", async function () {
      await stableCoin.mint(addr1.address, ethers.parseEther("1000"));
      await stableCoin.setKYCVerified(addr1.address, true);
      await stableCoin.setKYCVerified(addr2.address, true);
      await stableCoin.setFrozen(addr2.address, true);
      
      await expect(
        stableCoin.connect(addr1).transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Recipient account is frozen");
    });
  });

  describe("Pausing", function () {
    it("Should allow owner to pause contract", async function () {
      await stableCoin.pause();
      expect(await stableCoin.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      await stableCoin.pause();
      await stableCoin.unpause();
      expect(await stableCoin.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      await stableCoin.mint(addr1.address, ethers.parseEther("1000"));
      await stableCoin.setKYCVerified(addr1.address, true);
      await stableCoin.setKYCVerified(addr2.address, true);
      await stableCoin.pause();
      
      await expect(
        stableCoin.connect(addr1).transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Toggle Functions", function () {
    it("Should toggle minting", async function () {
      expect(await stableCoin.mintingEnabled()).to.be.true;
      await stableCoin.toggleMinting();
      expect(await stableCoin.mintingEnabled()).to.be.false;
      await stableCoin.toggleMinting();
      expect(await stableCoin.mintingEnabled()).to.be.true;
    });

    it("Should toggle burning", async function () {
      expect(await stableCoin.burningEnabled()).to.be.true;
      await stableCoin.toggleBurning();
      expect(await stableCoin.burningEnabled()).to.be.false;
      await stableCoin.toggleBurning();
      expect(await stableCoin.burningEnabled()).to.be.true;
    });

    it("Should not mint when minting is disabled", async function () {
      await stableCoin.toggleMinting();
      
      await expect(
        stableCoin.mint(addr1.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("Minting is disabled");
    });

    it("Should not burn when burning is disabled", async function () {
      await stableCoin.mint(addr1.address, ethers.parseEther("1000"));
      await stableCoin.toggleBurning();
      
      await expect(
        stableCoin.connect(addr1).burn(ethers.parseEther("100"))
      ).to.be.revertedWith("Burning is disabled");
    });
  });
});