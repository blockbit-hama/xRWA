import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');

    if (!rpcUrl || !privateKey) {
      this.logger.warn('Blockchain configuration not found, using mock mode');
      return;
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async getContractAddresses(): Promise<{
    trustService: string;
    registryService: string;
    complianceService: string;
    dsToken: string;
  }> {
    // In a real implementation, these would be stored in the database
    // or retrieved from a configuration service
    return {
      trustService: this.configService.get<string>('TRUST_SERVICE_ADDRESS'),
      registryService: this.configService.get<string>('REGISTRY_SERVICE_ADDRESS'),
      complianceService: this.configService.get<string>('COMPLIANCE_SERVICE_ADDRESS'),
      dsToken: this.configService.get<string>('DS_TOKEN_ADDRESS'),
    };
  }

  async registerInvestor(
    investorId: string,
    collisionHash: string,
  ): Promise<string> {
    try {
      const addresses = await this.getContractAddresses();
      const registryContract = new ethers.Contract(
        addresses.registryService,
        this.getRegistryABI(),
        this.wallet,
      );

      const tx = await registryContract.registerInvestor(investorId, collisionHash);
      await tx.wait();
      
      this.logger.log(`Investor ${investorId} registered on blockchain`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to register investor ${investorId}:`, error);
      throw error;
    }
  }

  async addWalletToInvestor(
    investorId: string,
    walletAddress: string,
  ): Promise<string> {
    try {
      const addresses = await this.getContractAddresses();
      const registryContract = new ethers.Contract(
        addresses.registryService,
        this.getRegistryABI(),
        this.wallet,
      );

      const tx = await registryContract.addWallet(walletAddress, investorId);
      await tx.wait();
      
      this.logger.log(`Wallet ${walletAddress} added to investor ${investorId}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to add wallet ${walletAddress} to investor ${investorId}:`, error);
      throw error;
    }
  }

  async setInvestorCountry(
    investorId: string,
    country: string,
  ): Promise<string> {
    try {
      const addresses = await this.getContractAddresses();
      const registryContract = new ethers.Contract(
        addresses.registryService,
        this.getRegistryABI(),
        this.wallet,
      );

      const tx = await registryContract.setCountry(investorId, country);
      await tx.wait();
      
      this.logger.log(`Country ${country} set for investor ${investorId}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to set country for investor ${investorId}:`, error);
      throw error;
    }
  }

  async setInvestorAttribute(
    investorId: string,
    attrId: number,
    value: number,
    expiry: number,
    proofHash: string,
  ): Promise<string> {
    try {
      const addresses = await this.getContractAddresses();
      const registryContract = new ethers.Contract(
        addresses.registryService,
        this.getRegistryABI(),
        this.wallet,
      );

      const tx = await registryContract.setAttribute(
        investorId,
        attrId,
        value,
        expiry,
        proofHash,
      );
      await tx.wait();
      
      this.logger.log(`Attribute ${attrId} set for investor ${investorId}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to set attribute for investor ${investorId}:`, error);
      throw error;
    }
  }

  async issueTokens(
    tokenAddress: string,
    to: string,
    amount: string,
    lockAmount?: string,
    lockPeriod?: number,
    reason?: string,
  ): Promise<string> {
    try {
      const dsTokenContract = new ethers.Contract(
        tokenAddress,
        this.getDSTokenABI(),
        this.wallet,
      );

      let tx;
      if (lockAmount && lockPeriod && reason) {
        const releaseTime = Math.floor(Date.now() / 1000) + lockPeriod * 24 * 60 * 60;
        tx = await dsTokenContract.issueTokenWithLocking(
          to,
          ethers.parseEther(amount),
          ethers.parseEther(lockAmount),
          reason,
          releaseTime,
        );
      } else {
        tx = await dsTokenContract.issueTokens(to, ethers.parseEther(amount));
      }

      await tx.wait();
      
      this.logger.log(`Tokens issued to ${to}: ${amount}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to issue tokens to ${to}:`, error);
      throw error;
    }
  }

  async burnTokens(
    tokenAddress: string,
    from: string,
    amount: string,
    reason: string,
  ): Promise<string> {
    try {
      const dsTokenContract = new ethers.Contract(
        tokenAddress,
        this.getDSTokenABI(),
        this.wallet,
      );

      const tx = await dsTokenContract.burn(from, ethers.parseEther(amount), reason);
      await tx.wait();
      
      this.logger.log(`Tokens burned from ${from}: ${amount}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to burn tokens from ${from}:`, error);
      throw error;
    }
  }

  async seizeTokens(
    tokenAddress: string,
    from: string,
    to: string,
    amount: string,
    reason: string,
  ): Promise<string> {
    try {
      const dsTokenContract = new ethers.Contract(
        tokenAddress,
        this.getDSTokenABI(),
        this.wallet,
      );

      const tx = await dsTokenContract.seize(from, to, ethers.parseEther(amount), reason);
      await tx.wait();
      
      this.logger.log(`Tokens seized from ${from} to ${to}: ${amount}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to seize tokens from ${from} to ${to}:`, error);
      throw error;
    }
  }

  async pauseToken(tokenAddress: string): Promise<string> {
    try {
      const dsTokenContract = new ethers.Contract(
        tokenAddress,
        this.getDSTokenABI(),
        this.wallet,
      );

      const tx = await dsTokenContract.pause();
      await tx.wait();
      
      this.logger.log(`Token ${tokenAddress} paused`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to pause token ${tokenAddress}:`, error);
      throw error;
    }
  }

  async unpauseToken(tokenAddress: string): Promise<string> {
    try {
      const dsTokenContract = new ethers.Contract(
        tokenAddress,
        this.getDSTokenABI(),
        this.wallet,
      );

      const tx = await dsTokenContract.unpause();
      await tx.wait();
      
      this.logger.log(`Token ${tokenAddress} unpaused`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to unpause token ${tokenAddress}:`, error);
      throw error;
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      const dsTokenContract = new ethers.Contract(
        tokenAddress,
        this.getDSTokenABI(),
        this.provider,
      );

      const balance = await dsTokenContract.balanceOf(walletAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(`Failed to get balance for ${walletAddress}:`, error);
      throw error;
    }
  }

  private getRegistryABI(): any[] {
    return [
      'function registerInvestor(string investorId, bytes32 collisionHash) external',
      'function addWallet(address wallet, string investorId) external',
      'function setCountry(string investorId, string country) external',
      'function setAttribute(string investorId, uint256 attrId, uint256 value, uint256 expiry, bytes32 proofHash) external',
    ];
  }

  private getDSTokenABI(): any[] {
    return [
      'function issueTokens(address to, uint256 value) external returns (bool)',
      'function issueTokenWithLocking(address to, uint256 value, uint256 valueLocked, string reason, uint64 releaseTime) external returns (bool)',
      'function burn(address who, uint256 value, string reason) external returns (bool)',
      'function seize(address from, address to, uint256 value, string reason) external returns (bool)',
      'function pause() external',
      'function unpause() external',
      'function balanceOf(address account) external view returns (uint256)',
    ];
  }
}