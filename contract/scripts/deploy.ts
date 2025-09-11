import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting DS Token deployment...");

  // 배포자 계정 가져오기
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. TrustService 배포
  console.log("\n📋 Deploying TrustService...");
  const TrustService = await ethers.getContractFactory("TrustService");
  const trustService = await TrustService.deploy(deployer.address);
  await trustService.waitForDeployment();
  const trustServiceAddress = await trustService.getAddress();
  console.log("TrustService deployed to:", trustServiceAddress);

  // 2. RegistryService 배포
  console.log("\n📋 Deploying RegistryService...");
  const RegistryService = await ethers.getContractFactory("RegistryService");
  const registryService = await RegistryService.deploy(deployer.address);
  await registryService.waitForDeployment();
  const registryServiceAddress = await registryService.getAddress();
  console.log("RegistryService deployed to:", registryServiceAddress);

  // 3. ComplianceService 배포
  console.log("\n📋 Deploying ComplianceService...");
  const ComplianceService = await ethers.getContractFactory("ComplianceService");
  const complianceService = await ComplianceService.deploy(
    deployer.address,
    registryServiceAddress,
    trustServiceAddress
  );
  await complianceService.waitForDeployment();
  const complianceServiceAddress = await complianceService.getAddress();
  console.log("ComplianceService deployed to:", complianceServiceAddress);

  // 4. DSToken 배포
  console.log("\n📋 Deploying DSToken...");
  const DSToken = await ethers.getContractFactory("DSToken");
  const dsToken = await DSToken.deploy(
    "Real World Asset Token",
    "RWA",
    18,
    trustServiceAddress,
    registryServiceAddress,
    complianceServiceAddress
  );
  await dsToken.waitForDeployment();
  const dsTokenAddress = await dsToken.getAddress();
  console.log("DSToken deployed to:", dsTokenAddress);

  // 5. 초기 설정
  console.log("\n⚙️  Setting up initial configuration...");

  // TrustService에 발행사 역할 부여
  await trustService.setRole(deployer.address, 2); // ROLE_ISSUER
  console.log("✅ Issuer role assigned to deployer");

  // ComplianceService 초기 정책 설정
  await complianceService.setCountryCompliance("KR", true); // 한국 허용
  await complianceService.setCountryCompliance("US", true); // 미국 허용
  await complianceService.setCountryCompliance("SG", true); // 싱가포르 허용
  await complianceService.setMaxHolders(200);
  await complianceService.setTransactionLimits(
    ethers.parseEther("1000000"), // 1M 토큰 최대 거래
    ethers.parseEther("10000000") // 10M 토큰 일일 한도
  );
  console.log("✅ Compliance policies configured");

  // 배포 결과 출력
  console.log("\n🎉 Deployment completed successfully!");
  console.log("=====================================");
  console.log("Contract Addresses:");
  console.log("TrustService:", trustServiceAddress);
  console.log("RegistryService:", registryServiceAddress);
  console.log("ComplianceService:", complianceServiceAddress);
  console.log("DSToken:", dsTokenAddress);
  console.log("=====================================");

  // 배포 정보를 파일로 저장
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      TrustService: trustServiceAddress,
      RegistryService: registryServiceAddress,
      ComplianceService: complianceServiceAddress,
      DSToken: dsTokenAddress
    },
    timestamp: new Date().toISOString()
  };

  console.log("\n📄 Deployment info saved to deployment-info.json");
  
  // 간단한 검증 테스트
  console.log("\n🧪 Running basic verification tests...");
  
  // DSToken 기본 정보 확인
  const tokenName = await dsToken.name();
  const tokenSymbol = await dsToken.symbol();
  const tokenDecimals = await dsToken.decimals();
  const totalSupply = await dsToken.totalSupply();
  
  console.log(`Token Name: ${tokenName}`);
  console.log(`Token Symbol: ${tokenSymbol}`);
  console.log(`Token Decimals: ${tokenDecimals}`);
  console.log(`Total Supply: ${totalSupply.toString()}`);
  
  // TrustService 역할 확인
  const deployerRole = await trustService.roleOf(deployer.address);
  console.log(`Deployer Role: ${deployerRole}`);
  
  // ComplianceService 모드 확인
  const complianceMode = await complianceService.complianceMode();
  console.log(`Compliance Mode: ${complianceMode}`);
  
  console.log("\n✅ Basic verification completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });