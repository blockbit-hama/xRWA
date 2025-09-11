import { expect } from "chai";
import { ethers } from "hardhat";
import { DSToken, TrustService, RegistryService, ComplianceService } from "../typechain-types";

describe("DS Token System", function () {
  let dsToken: DSToken;
  let trustService: TrustService;
  let registryService: RegistryService;
  let complianceService: ComplianceService;
  let owner: any;
  let issuer: any;
  let investor1: any;
  let investor2: any;

  beforeEach(async function () {
    [owner, issuer, investor1, investor2] = await ethers.getSigners();

    // TrustService 배포
    const TrustService = await ethers.getContractFactory("TrustService");
    trustService = await TrustService.deploy(owner.address);

    // RegistryService 배포
    const RegistryService = await ethers.getContractFactory("RegistryService");
    registryService = await RegistryService.deploy(owner.address);

    // ComplianceService 배포
    const ComplianceService = await ethers.getContractFactory("ComplianceService");
    complianceService = await ComplianceService.deploy(
      owner.address,
      await registryService.getAddress(),
      await trustService.getAddress()
    );

    // DSToken 배포
    const DSToken = await ethers.getContractFactory("DSToken");
    dsToken = await DSToken.deploy(
      "Real World Asset Token",
      "RWA",
      18,
      await trustService.getAddress(),
      await registryService.getAddress(),
      await complianceService.getAddress()
    );

    // 초기 설정
    await trustService.setRole(issuer.address, 2); // ROLE_ISSUER
    await complianceService.setCountryCompliance("KR", true);
    await complianceService.setCountryCompliance("US", true);
  });

  describe("TrustService", function () {
    it("Should set and get roles correctly", async function () {
      await trustService.setRole(investor1.address, 1); // ROLE_MASTER
      expect(await trustService.roleOf(investor1.address)).to.equal(1);
    });

    it("Should emit RoleChanged event", async function () {
      await expect(trustService.setRole(investor1.address, 2))
        .to.emit(trustService, "RoleChanged")
        .withArgs(investor1.address, 0, 2);
    });

    it("Should check minimum role correctly", async function () {
      await trustService.setRole(investor1.address, 2); // ROLE_ISSUER
      expect(await trustService.hasMinimumRole(investor1.address, 2)).to.be.true;
      expect(await trustService.hasMinimumRole(investor1.address, 1)).to.be.false;
    });
  });

  describe("RegistryService", function () {
    it("Should register investor correctly", async function () {
      const investorId = "INV001";
      const collisionHash = ethers.keccak256(ethers.toUtf8Bytes(investorId));
      
      await registryService.registerInvestor(investorId, collisionHash);
      expect(await registryService.investorExists(investorId)).to.be.true;
    });

    it("Should add wallet to investor", async function () {
      const investorId = "INV001";
      const collisionHash = ethers.keccak256(ethers.toUtf8Bytes(investorId));
      
      await registryService.registerInvestor(investorId, collisionHash);
      await registryService.addWallet(investor1.address, investorId);
      
      expect(await registryService.investorOf(investor1.address)).to.equal(investorId);
    });

    it("Should set investor attributes", async function () {
      const investorId = "INV001";
      const collisionHash = ethers.keccak256(ethers.toUtf8Bytes(investorId));
      
      await registryService.registerInvestor(investorId, collisionHash);
      await registryService.setAttribute(investorId, 1, 1, 0, ethers.keccak256(ethers.toUtf8Bytes("kyc-proof")));
      
      const [value, expiry, proofHash] = await registryService.getAttribute(investorId, 1);
      expect(value).to.equal(1); // VALUE_APPROVED
    });
  });

  describe("ComplianceService", function () {
    beforeEach(async function () {
      // 투자자 등록 및 설정
      const investorId1 = "INV001";
      const investorId2 = "INV002";
      const collisionHash1 = ethers.keccak256(ethers.toUtf8Bytes(investorId1));
      const collisionHash2 = ethers.keccak256(ethers.toUtf8Bytes(investorId2));
      
      await registryService.registerInvestor(investorId1, collisionHash1);
      await registryService.registerInvestor(investorId2, collisionHash2);
      
      await registryService.addWallet(investor1.address, investorId1);
      await registryService.addWallet(investor2.address, investorId2);
      
      await registryService.setCountry(investorId1, "KR");
      await registryService.setCountry(investorId2, "US");
      
      await registryService.setAttribute(investorId1, 1, 1, 0, ethers.keccak256(ethers.toUtf8Bytes("kyc-proof")));
      await registryService.setAttribute(investorId2, 1, 1, 0, ethers.keccak256(ethers.toUtf8Bytes("kyc-proof")));
    });

    it("Should validate issuance correctly", async function () {
      const [ok, reason] = await complianceService.preIssuanceCheck(investor1.address, ethers.parseEther("1000"));
      expect(ok).to.be.true;
    });

    it("Should reject issuance for unregistered wallet", async function () {
      const [ok, reason] = await complianceService.preIssuanceCheck(owner.address, ethers.parseEther("1000"));
      expect(ok).to.be.false;
      expect(reason).to.include("not in whitelist");
    });

    it("Should validate transfer correctly", async function () {
      const [ok, reason] = await complianceService.preTransferCheck(
        investor1.address,
        investor2.address,
        ethers.parseEther("100")
      );
      expect(ok).to.be.true;
    });
  });

  describe("DSToken", function () {
    beforeEach(async function () {
      // 투자자 등록 및 설정
      const investorId1 = "INV001";
      const investorId2 = "INV002";
      const collisionHash1 = ethers.keccak256(ethers.toUtf8Bytes(investorId1));
      const collisionHash2 = ethers.keccak256(ethers.toUtf8Bytes(investorId2));
      
      await registryService.registerInvestor(investorId1, collisionHash1);
      await registryService.registerInvestor(investorId2, collisionHash2);
      
      await registryService.addWallet(investor1.address, investorId1);
      await registryService.addWallet(investor2.address, investorId2);
      
      await registryService.setCountry(investorId1, "KR");
      await registryService.setCountry(investorId2, "US");
      
      await registryService.setAttribute(investorId1, 1, 1, 0, ethers.keccak256(ethers.toUtf8Bytes("kyc-proof")));
      await registryService.setAttribute(investorId2, 1, 1, 0, ethers.keccak256(ethers.toUtf8Bytes("kyc-proof")));
    });

    it("Should issue tokens correctly", async function () {
      const amount = ethers.parseEther("1000");
      
      await expect(dsToken.connect(issuer).issueTokens(investor1.address, amount))
        .to.emit(dsToken, "Issued")
        .withArgs(investor1.address, amount);
      
      expect(await dsToken.balanceOf(investor1.address)).to.equal(amount);
      expect(await dsToken.totalIssued()).to.equal(amount);
    });

    it("Should issue tokens with locking", async function () {
      const amount = ethers.parseEther("1000");
      const lockedAmount = ethers.parseEther("500");
      const releaseTime = Math.floor(Date.now() / 1000) + 86400; // 24시간 후
      
      await expect(dsToken.connect(issuer).issueTokenWithLocking(
        investor1.address,
        amount,
        lockedAmount,
        "Vesting period",
        releaseTime
      ))
        .to.emit(dsToken, "IssuedWithLock")
        .withArgs(investor1.address, amount, lockedAmount, releaseTime, "Vesting period");
      
      expect(await dsToken.balanceOf(investor1.address)).to.equal(amount);
      
      const [locked, releaseTimeResult, reason] = await dsToken.getLockInfo(investor1.address);
      expect(locked).to.equal(lockedAmount);
      expect(releaseTimeResult).to.equal(releaseTime);
    });

    it("Should prevent transfer of locked tokens", async function () {
      const amount = ethers.parseEther("1000");
      const lockedAmount = ethers.parseEther("500");
      const releaseTime = Math.floor(Date.now() / 1000) + 86400;
      
      await dsToken.connect(issuer).issueTokenWithLocking(
        investor1.address,
        amount,
        lockedAmount,
        "Vesting period",
        releaseTime
      );
      
      // 락된 금액보다 많은 전송 시도
      await expect(
        dsToken.connect(investor1).transfer(investor2.address, ethers.parseEther("600"))
      ).to.be.revertedWith("Locked balance");
      
      // 락되지 않은 금액 전송은 성공
      await expect(
        dsToken.connect(investor1).transfer(investor2.address, ethers.parseEther("400"))
      ).to.not.be.reverted;
    });

    it("Should burn tokens correctly", async function () {
      const amount = ethers.parseEther("1000");
      
      await dsToken.connect(issuer).issueTokens(investor1.address, amount);
      
      await expect(dsToken.connect(issuer).burn(investor1.address, ethers.parseEther("100"), "Token burn"))
        .to.emit(dsToken, "Burned")
        .withArgs(investor1.address, ethers.parseEther("100"), "Token burn");
      
      expect(await dsToken.balanceOf(investor1.address)).to.equal(ethers.parseEther("900"));
    });

    it("Should seize tokens correctly", async function () {
      const amount = ethers.parseEther("1000");
      
      await dsToken.connect(issuer).issueTokens(investor1.address, amount);
      
      await expect(dsToken.connect(issuer).seize(
        investor1.address,
        investor2.address,
        ethers.parseEther("100"),
        "Token seizure"
      ))
        .to.emit(dsToken, "Seized")
        .withArgs(investor1.address, investor2.address, ethers.parseEther("100"), "Token seizure");
      
      expect(await dsToken.balanceOf(investor1.address)).to.equal(ethers.parseEther("900"));
      expect(await dsToken.balanceOf(investor2.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should pause and unpause correctly", async function () {
      const amount = ethers.parseEther("1000");
      
      await dsToken.connect(issuer).issueTokens(investor1.address, amount);
      
      await dsToken.connect(issuer).pause();
      
      await expect(
        dsToken.connect(investor1).transfer(investor2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Transfers paused");
      
      await dsToken.connect(issuer).unpause();
      
      await expect(
        dsToken.connect(investor1).transfer(investor2.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });

    it("Should track holders correctly", async function () {
      const amount = ethers.parseEther("1000");
      
      await dsToken.connect(issuer).issueTokens(investor1.address, amount);
      expect(await dsToken.walletCount()).to.equal(1);
      expect(await dsToken.getWalletAt(0)).to.equal(investor1.address);
      
      await dsToken.connect(issuer).issueTokens(investor2.address, amount);
      expect(await dsToken.walletCount()).to.equal(2);
      
      // 잔액을 0으로 만들면 보유자 목록에서 제거
      await dsToken.connect(investor1).transfer(investor2.address, amount);
      expect(await dsToken.walletCount()).to.equal(1);
      expect(await dsToken.getWalletAt(0)).to.equal(investor2.address);
    });

    it("Should calculate spendable balance correctly", async function () {
      const amount = ethers.parseEther("1000");
      const lockedAmount = ethers.parseEther("300");
      const releaseTime = Math.floor(Date.now() / 1000) + 86400;
      
      await dsToken.connect(issuer).issueTokenWithLocking(
        investor1.address,
        amount,
        lockedAmount,
        "Vesting period",
        releaseTime
      );
      
      const spendable = await dsToken.spendableBalance(investor1.address);
      expect(spendable).to.equal(ethers.parseEther("700"));
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full investment flow", async function () {
      // 1. 투자자 등록
      const investorId = "INV001";
      const collisionHash = ethers.keccak256(ethers.toUtf8Bytes(investorId));
      
      await registryService.registerInvestor(investorId, collisionHash);
      await registryService.addWallet(investor1.address, investorId);
      await registryService.setCountry(investorId, "KR");
      await registryService.setAttribute(investorId, 1, 1, 0, ethers.keccak256(ethers.toUtf8Bytes("kyc-proof")));
      
      // 2. 토큰 발행
      const amount = ethers.parseEther("1000");
      await dsToken.connect(issuer).issueTokens(investor1.address, amount);
      
      // 3. 토큰 전송
      const transferAmount = ethers.parseEther("100");
      await dsToken.connect(investor1).transfer(investor2.address, transferAmount);
      
      // 4. 결과 확인
      expect(await dsToken.balanceOf(investor1.address)).to.equal(ethers.parseEther("900"));
      expect(await dsToken.totalIssued()).to.equal(amount);
    });
  });
});