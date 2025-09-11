import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

// StableCoin 컨트랙트 ABI (간소화된 버전)
const STABLE_COIN_ABI = [
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function toggleMinting() external",
  "function toggleBurning() external",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function mintingEnabled() external view returns (bool)",
  "function burningEnabled() external view returns (bool)",
  "function setKYCVerified(address account, bool verified) external",
  "function setFrozen(address account, bool frozen) external"
];

// StableCoinFactory 컨트랙트 ABI (간소화된 버전)
const FACTORY_ABI = [
  "function createStableCoin(string memory name, string memory symbol, uint8 decimals, uint256 maxSupply) external returns (address)",
  "function getStableCoinCount() external view returns (uint256)",
  "function getStableCoinInfo(uint256 index) external view returns (tuple(address tokenAddress, string name, string symbol, uint8 decimals, uint256 maxSupply, address issuer, uint256 createdAt, bool active))",
  "function getStableCoinBySymbol(string memory symbol) external view returns (address)"
];

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private factoryContract: ethers.Contract;
  private factoryAddress: string;

  constructor() {
    // 환경변수에서 설정 가져오기
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    this.factoryAddress = process.env.FACTORY_CONTRACT_ADDRESS || '';
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Factory 컨트랙트 인스턴스 생성
    if (this.factoryAddress) {
      this.factoryContract = new ethers.Contract(this.factoryAddress, FACTORY_ABI, this.wallet);
    }
  }

  async deployStableCoin(params: {
    name: string;
    symbol: string;
    decimals: number;
    maxSupply: string;
  }): Promise<string> {
    try {
      if (!this.factoryContract) {
        this.logger.warn('Factory contract not deployed, using mock address');
        const randomAddress = ethers.Wallet.createRandom().address;
        this.logger.log(`Mock deployment: ${params.name} (${params.symbol}) -> ${randomAddress}`);
        return randomAddress;
      }

      this.logger.log(`Deploying StableCoin: ${params.name} (${params.symbol})`);
      
      const tx = await this.factoryContract.createStableCoin(
        params.name,
        params.symbol,
        params.decimals,
        params.maxSupply
      );
      
      const receipt = await tx.wait();
      this.logger.log(`StableCoin deployed successfully: ${receipt.hash}`);
      
      // 이벤트에서 컨트랙트 주소 추출
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.factoryContract.interface.parseLog(log);
          return parsed?.name === 'StableCoinCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.factoryContract.interface.parseLog(event);
        return parsed?.args.tokenAddress;
      }
      
      throw new Error('Failed to extract contract address from deployment event');
    } catch (error) {
      this.logger.error(`Failed to deploy StableCoin: ${error.message}`);
      throw error;
    }
  }

  async mintToken(contractAddress: string, to: string, amount: string): Promise<any> {
    try {
      this.logger.log(`Minting ${amount} tokens to ${to} on contract ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, STABLE_COIN_ABI, this.wallet);
      const tx = await contract.mint(to, amount);
      const receipt = await tx.wait();
      
      this.logger.log(`Minting successful: ${receipt.hash}`);
      return {
        transactionHash: receipt.hash,
        success: true,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to mint tokens: ${error.message}`);
      throw error;
    }
  }

  async burnToken(contractAddress: string, from: string, amount: string): Promise<any> {
    try {
      this.logger.log(`Burning ${amount} tokens from ${from} on contract ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, STABLE_COIN_ABI, this.wallet);
      const tx = await contract.burn(amount);
      const receipt = await tx.wait();
      
      this.logger.log(`Burning successful: ${receipt.hash}`);
      return {
        transactionHash: receipt.hash,
        success: true,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to burn tokens: ${error.message}`);
      throw error;
    }
  }

  async toggleMinting(contractAddress: string): Promise<any> {
    try {
      this.logger.log(`Toggling minting on contract ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, STABLE_COIN_ABI, this.wallet);
      const tx = await contract.toggleMinting();
      const receipt = await tx.wait();
      
      this.logger.log(`Minting toggle successful: ${receipt.hash}`);
      return {
        transactionHash: receipt.hash,
        success: true,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to toggle minting: ${error.message}`);
      throw error;
    }
  }

  async toggleBurning(contractAddress: string): Promise<any> {
    try {
      this.logger.log(`Toggling burning on contract ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, STABLE_COIN_ABI, this.wallet);
      const tx = await contract.toggleBurning();
      const receipt = await tx.wait();
      
      this.logger.log(`Burning toggle successful: ${receipt.hash}`);
      return {
        transactionHash: receipt.hash,
        success: true,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to toggle burning: ${error.message}`);
      throw error;
    }
  }

  async getBalance(contractAddress: string, address: string): Promise<string> {
    try {
      this.logger.log(`Getting balance for ${address} on contract ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, STABLE_COIN_ABI, this.provider);
      const balance = await contract.balanceOf(address);
      
      return balance.toString();
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`);
      throw error;
    }
  }

  async getTotalSupply(contractAddress: string): Promise<string> {
    try {
      this.logger.log(`Getting total supply for contract ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, STABLE_COIN_ABI, this.provider);
      const totalSupply = await contract.totalSupply();
      
      return totalSupply.toString();
    } catch (error) {
      this.logger.error(`Failed to get total supply: ${error.message}`);
      throw error;
    }
  }

  async setKYCVerified(contractAddress: string, account: string, verified: boolean): Promise<any> {
    try {
      this.logger.log(`Setting KYC status for ${account} to ${verified} on contract ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, STABLE_COIN_ABI, this.wallet);
      const tx = await contract.setKYCVerified(account, verified);
      const receipt = await tx.wait();
      
      this.logger.log(`KYC status update successful: ${receipt.hash}`);
      return {
        transactionHash: receipt.hash,
        success: true,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to set KYC status: ${error.message}`);
      throw error;
    }
  }

  async setFrozen(contractAddress: string, account: string, frozen: boolean): Promise<any> {
    try {
      this.logger.log(`Setting frozen status for ${account} to ${frozen} on contract ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, STABLE_COIN_ABI, this.wallet);
      const tx = await contract.setFrozen(account, frozen);
      const receipt = await tx.wait();
      
      this.logger.log(`Frozen status update successful: ${receipt.hash}`);
      return {
        transactionHash: receipt.hash,
        success: true,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to set frozen status: ${error.message}`);
      throw error;
    }
  }
}