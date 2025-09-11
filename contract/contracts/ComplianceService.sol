// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IComplianceService.sol";
import "./interfaces/IRegistryService.sol";
import "./interfaces/ITrustService.sol";
import "./libraries/Constants.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ComplianceService
 * @dev 규제 검증 서비스
 * DS 프로토콜의 Compliance 서비스 구현
 */
contract ComplianceService is IComplianceService, Ownable, ReentrancyGuard {
    // 외부 서비스 참조
    IRegistryService public registry;
    ITrustService public trust;
    
    // 컴플라이언스 모드
    uint256 public complianceMode; // 0: 화이트리스트, 1: 규제형
    
    // 국가별 허용 정책
    mapping(string => bool) public countryCompliance;
    
    // 보유자 수 상한
    uint256 public maxHolders = 200;
    
    // 거래 한도
    uint256 public maxTransactionAmount = 1000000 * 10**18; // 1M 토큰
    uint256 public dailyTransactionLimit = 10000000 * 10**18; // 10M 토큰
    
    // 일일 거래량 추적
    mapping(address => mapping(uint256 => uint256)) public dailyTransactionVolume; // address -> date -> volume
    
    // 블랙리스트
    mapping(address => bool) public blacklistedAddresses;
    
    // 쿨다운 기간 (초)
    uint256 public cooldownPeriod = 86400; // 24시간
    
    // 마지막 거래 시간 추적
    mapping(address => uint256) public lastTransactionTime;
    
    constructor(
        address initialOwner,
        address _registry,
        address _trust
    ) Ownable(initialOwner) {
        registry = IRegistryService(_registry);
        trust = ITrustService(_trust);
        complianceMode = Constants.COMPLIANCE_MODE_REGULATORY; // 기본값: 규제형 모드
    }
    
    /**
     * @dev 발행 사전 검증 (뷰 함수)
     */
    function preIssuanceCheck(address to, uint256 value) external view override returns (bool ok, string memory reason) {
        return _validateIssuanceInternal(to, value);
    }
    
    /**
     * @dev 전송 사전 검증 (뷰 함수)
     */
    function preTransferCheck(address from, address to, uint256 value) external view override returns (bool ok, string memory reason) {
        return _validateTransferInternal(from, to, value);
    }
    
    /**
     * @dev 발행 검증 (트랜잭션 경로)
     */
    function validateIssuance(address to, uint256 value) external override returns (bool ok, string memory reason) {
        return _validateIssuanceInternal(to, value);
    }
    
    /**
     * @dev 전송 검증 (트랜잭션 경로)
     */
    function validateTransfer(address from, address to, uint256 value) external override returns (bool ok, string memory reason) {
        (bool valid, string memory reasonStr) = _validateTransferInternal(from, to, value);
        
        if (valid) {
            // 거래량 추적 업데이트
            _updateTransactionVolume(from, to, value);
        }
        
        return (valid, reasonStr);
    }
    
    /**
     * @dev 소각 검증 (트랜잭션 경로)
     */
    function validateBurn(address who, uint256 value) external override returns (bool ok, string memory reason) {
        // 소각은 발행사/마스터만 가능
        uint256 role = trust.roleOf(msg.sender);
        if (role != 2 && role != 1) { // ROLE_ISSUER = 2, ROLE_MASTER = 1
            return (false, "Not authorized to burn");
        }
        
        // 기본 검증
        if (value == 0) {
            return (false, "Cannot burn zero amount");
        }
        
        return (true, "");
    }
    
    /**
     * @dev 강제 회수 검증 (트랜잭션 경로)
     */
    function validateSeize(address from, address to, uint256 value) external override returns (bool ok, string memory reason) {
        // 강제 회수는 발행사/마스터만 가능
        uint256 role = trust.roleOf(msg.sender);
        if (role != 2 && role != 1) { // ROLE_ISSUER = 2, ROLE_MASTER = 1
            return (false, "Not authorized to seize");
        }
        
        // 기본 검증
        if (value == 0) {
            return (false, "Cannot seize zero amount");
        }
        
        if (from == address(0) || to == address(0)) {
            return (false, "Invalid addresses");
        }
        
        return (true, "");
    }
    
    /**
     * @dev 국가 컴플라이언스 정책 설정
     */
    function setCountryCompliance(string calldata country, bool allowed) external override onlyOwner {
        countryCompliance[country] = allowed;
        emit PolicyChanged("country_compliance", abi.encode(country, allowed));
    }
    
    /**
     * @dev 보유자 수 상한 설정
     */
    function setMaxHolders(uint256 _maxHolders) external override onlyOwner {
        maxHolders = _maxHolders;
        emit PolicyChanged("max_holders", abi.encode(_maxHolders));
    }
    
    /**
     * @dev 검증 모드 설정
     */
    function setComplianceMode(uint256 mode) external override onlyOwner {
        require(mode <= 1, "Invalid compliance mode");
        complianceMode = mode;
        emit PolicyChanged("compliance_mode", abi.encode(mode));
    }
    
    /**
     * @dev 거래 한도 설정
     */
    function setTransactionLimits(uint256 _maxTransactionAmount, uint256 _dailyTransactionLimit) external onlyOwner {
        maxTransactionAmount = _maxTransactionAmount;
        dailyTransactionLimit = _dailyTransactionLimit;
        emit PolicyChanged("transaction_limits", abi.encode(_maxTransactionAmount, _dailyTransactionLimit));
    }
    
    /**
     * @dev 쿨다운 기간 설정
     */
    function setCooldownPeriod(uint256 _cooldownPeriod) external onlyOwner {
        cooldownPeriod = _cooldownPeriod;
        emit PolicyChanged("cooldown_period", abi.encode(_cooldownPeriod));
    }
    
    /**
     * @dev 주소 블랙리스트 설정
     */
    function setBlacklistedAddress(address addr, bool blacklisted) external onlyOwner {
        blacklistedAddresses[addr] = blacklisted;
        emit PolicyChanged("blacklist", abi.encode(addr, blacklisted));
    }
    
    /**
     * @dev 외부 서비스 주소 업데이트
     */
    function updateServices(address _registry, address _trust) external onlyOwner {
        registry = IRegistryService(_registry);
        trust = ITrustService(_trust);
        emit PolicyChanged("services_updated", abi.encode(_registry, _trust));
    }
    
    /**
     * @dev 내부 발행 검증 로직
     */
    function _validateIssuanceInternal(address to, uint256 value) internal view returns (bool ok, string memory reason) {
        // 기본 검증
        if (to == address(0)) {
            return (false, "Cannot issue to zero address");
        }
        
        if (value == 0) {
            return (false, "Cannot issue zero amount");
        }
        
        // 블랙리스트 체크
        if (blacklistedAddresses[to]) {
            return (false, "Recipient is blacklisted");
        }
        
        // 화이트리스트 모드
        if (complianceMode == Constants.COMPLIANCE_MODE_WHITELIST) {
            if (!registry.isWalletRegistered(to)) {
                return (false, "Recipient not in whitelist");
            }
            
            // 투자자 속성 검증
            string memory investorId = registry.investorOf(to);
            if (!registry.isAttributeValid(investorId, Constants.ATTR_KYC)) {
                return (false, "Recipient KYC not valid");
            }
        }
        
        // 규제형 모드
        if (complianceMode == Constants.COMPLIANCE_MODE_REGULATORY) {
            // 국가 제한 체크
            string memory investorId = registry.investorOf(to);
            string memory country = registry.getCountry(investorId);
            
            if (bytes(country).length > 0 && !countryCompliance[country]) {
                return (false, "Country not allowed");
            }
            
            // 적격 투자자 체크
            if (!registry.isAttributeValid(investorId, Constants.ATTR_ACCREDITED)) {
                return (false, "Recipient not accredited investor");
            }
        }
        
        return (true, "");
    }
    
    /**
     * @dev 내부 전송 검증 로직
     */
    function _validateTransferInternal(address from, address to, uint256 value) internal view returns (bool ok, string memory reason) {
        // 기본 검증
        if (from == address(0) || to == address(0)) {
            return (false, "Invalid addresses");
        }
        
        if (value == 0) {
            return (false, "Cannot transfer zero amount");
        }
        
        // 블랙리스트 체크
        if (blacklistedAddresses[from] || blacklistedAddresses[to]) {
            return (false, "Address is blacklisted");
        }
        
        // 거래 한도 체크
        if (value > maxTransactionAmount) {
            return (false, "Transaction amount exceeds limit");
        }
        
        // 쿨다운 체크
        if (block.timestamp - lastTransactionTime[from] < cooldownPeriod) {
            return (false, "Cooldown period not expired");
        }
        
        // 화이트리스트 모드
        if (complianceMode == Constants.COMPLIANCE_MODE_WHITELIST) {
            if (!registry.isWalletRegistered(from) || !registry.isWalletRegistered(to)) {
                return (false, "Address not in whitelist");
            }
            
            // 송신인 KYC 검증
            string memory fromInvestorId = registry.investorOf(from);
            if (!registry.isAttributeValid(fromInvestorId, Constants.ATTR_KYC)) {
                return (false, "Sender KYC not valid");
            }
            
            // 수신인 KYC 검증
            string memory toInvestorId = registry.investorOf(to);
            if (!registry.isAttributeValid(toInvestorId, Constants.ATTR_KYC)) {
                return (false, "Recipient KYC not valid");
            }
        }
        
        // 규제형 모드
        if (complianceMode == Constants.COMPLIANCE_MODE_REGULATORY) {
            // 국가 제한 체크
            string memory fromInvestorId = registry.investorOf(from);
            string memory toInvestorId = registry.investorOf(to);
            
            string memory fromCountry = registry.getCountry(fromInvestorId);
            string memory toCountry = registry.getCountry(toInvestorId);
            
            if (bytes(fromCountry).length > 0 && !countryCompliance[fromCountry]) {
                return (false, "Sender country not allowed");
            }
            
            if (bytes(toCountry).length > 0 && !countryCompliance[toCountry]) {
                return (false, "Recipient country not allowed");
            }
        }
        
        return (true, "");
    }
    
    /**
     * @dev 거래량 추적 업데이트
     */
    function _updateTransactionVolume(address from, address to, uint256 value) internal {
        uint256 today = block.timestamp / 86400; // 일 단위로 변환
        
        // 송신인 일일 거래량 업데이트
        dailyTransactionVolume[from][today] += value;
        
        // 일일 한도 체크
        if (dailyTransactionVolume[from][today] > dailyTransactionLimit) {
            emit ComplianceViolation("Daily transaction limit exceeded", from, to, value);
        }
        
        // 마지막 거래 시간 업데이트
        lastTransactionTime[from] = block.timestamp;
    }
    
    /**
     * @dev 일일 거래량 조회
     */
    function getDailyTransactionVolume(address addr, uint256 date) external view returns (uint256) {
        return dailyTransactionVolume[addr][date];
    }
    
    /**
     * @dev 주소의 쿨다운 상태 조회
     */
    function getCooldownStatus(address addr) external view returns (bool canTransact, uint256 remainingTime) {
        uint256 timeSinceLastTransaction = block.timestamp - lastTransactionTime[addr];
        
        if (timeSinceLastTransaction >= cooldownPeriod) {
            return (true, 0);
        }
        
        return (false, cooldownPeriod - timeSinceLastTransaction);
    }
}