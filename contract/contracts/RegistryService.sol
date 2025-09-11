// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IRegistryService.sol";
import "./libraries/Constants.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RegistryService
 * @dev 투자자 정보 및 지갑 매핑 관리 서비스
 * DS 프로토콜의 Registry 서비스 구현
 */
contract RegistryService is IRegistryService, Ownable, ReentrancyGuard {
    // 투자자 정보 구조체
    struct Investor {
        bool exists;
        bytes32 collisionHash;
        string country;
        mapping(uint256 => Attribute) attributes;
    }
    
    // 속성 정보 구조체
    struct Attribute {
        uint256 value;
        uint256 expiry;
        bytes32 proofHash;
        bool exists;
    }
    
    // 지갑 주소 -> 투자자 ID 매핑
    mapping(address => string) private _walletToInvestor;
    
    // 투자자 ID -> 투자자 정보 매핑
    mapping(string => Investor) private _investors;
    
    // 투자자 ID -> 지갑 주소 목록 매핑
    mapping(string => address[]) private _investorWallets;
    
    // 투자자 ID 중복 방지를 위한 해시 매핑
    mapping(bytes32 => bool) private _usedHashes;
    
    // 등록된 투자자 수
    uint256 private _investorCount;
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @dev 투자자 등록
     * @param investorId 투자자 ID
     * @param collisionHash 중복 방지 해시
     */
    function registerInvestor(string calldata investorId, bytes32 collisionHash) external override onlyOwner nonReentrant {
        require(bytes(investorId).length > 0, "Investor ID cannot be empty");
        require(!_investors[investorId].exists, "Investor already exists");
        require(!_usedHashes[collisionHash], "Hash already used");
        
        _investors[investorId].exists = true;
        _investors[investorId].collisionHash = collisionHash;
        _usedHashes[collisionHash] = true;
        _investorCount++;
        
        emit InvestorRegistered(investorId, collisionHash);
    }
    
    /**
     * @dev 지갑 주소를 투자자에 연결
     * @param wallet 지갑 주소
     * @param investorId 투자자 ID
     */
    function addWallet(address wallet, string calldata investorId) external override onlyOwner nonReentrant {
        require(wallet != address(0), "Wallet cannot be zero address");
        require(_investors[investorId].exists, "Investor does not exist");
        require(bytes(_walletToInvestor[wallet]).length == 0, "Wallet already registered");
        
        _walletToInvestor[wallet] = investorId;
        _investorWallets[investorId].push(wallet);
        
        emit WalletAdded(wallet, investorId);
    }
    
    /**
     * @dev 투자자의 국가 설정
     * @param investorId 투자자 ID
     * @param country 국가 코드
     */
    function setCountry(string calldata investorId, string calldata country) external override onlyOwner nonReentrant {
        require(_investors[investorId].exists, "Investor does not exist");
        require(bytes(country).length > 0, "Country cannot be empty");
        
        _investors[investorId].country = country;
        
        emit CountrySet(investorId, country);
    }
    
    /**
     * @dev 투자자 속성 설정
     * @param investorId 투자자 ID
     * @param attrId 속성 ID
     * @param value 속성 값
     * @param expiry 만료일
     * @param proofHash 증빙 해시
     */
    function setAttribute(
        string calldata investorId,
        uint256 attrId,
        uint256 value,
        uint256 expiry,
        bytes32 proofHash
    ) external override onlyOwner nonReentrant {
        require(_investors[investorId].exists, "Investor does not exist");
        require(attrId != Constants.ATTR_NONE, "Invalid attribute ID");
        require(value <= Constants.VALUE_REJECTED, "Invalid attribute value");
        
        _investors[investorId].attributes[attrId] = Attribute({
            value: value,
            expiry: expiry,
            proofHash: proofHash,
            exists: true
        });
        
        emit AttributeSet(investorId, attrId, value, expiry, proofHash);
    }
    
    /**
     * @dev 투자자의 모든 지갑 주소 조회
     * @param investorId 투자자 ID
     * @return 지갑 주소 배열
     */
    function walletsOf(string calldata investorId) external view override returns (address[] memory) {
        return _investorWallets[investorId];
    }
    
    /**
     * @dev 지갑 주소의 투자자 ID 조회
     * @param wallet 지갑 주소
     * @return 투자자 ID
     */
    function investorOf(address wallet) external view override returns (string memory) {
        return _walletToInvestor[wallet];
    }
    
    /**
     * @dev 투자자 속성 조회
     * @param investorId 투자자 ID
     * @param attrId 속성 ID
     * @return value 속성 값
     * @return expiry 만료일
     * @return proofHash 증빙 해시
     */
    function getAttribute(string calldata investorId, uint256 attrId) 
        external view override returns (uint256 value, uint256 expiry, bytes32 proofHash) {
        require(_investors[investorId].exists, "Investor does not exist");
        
        Attribute storage attr = _investors[investorId].attributes[attrId];
        if (attr.exists) {
            return (attr.value, attr.expiry, attr.proofHash);
        }
        
        return (Constants.VALUE_PENDING, 0, bytes32(0));
    }
    
    /**
     * @dev 투자자 존재 여부 확인
     * @param investorId 투자자 ID
     * @return 존재 여부
     */
    function investorExists(string calldata investorId) external view returns (bool) {
        return _investors[investorId].exists;
    }
    
    /**
     * @dev 투자자 국가 조회
     * @param investorId 투자자 ID
     * @return 국가 코드
     */
    function getCountry(string calldata investorId) external view returns (string memory) {
        require(_investors[investorId].exists, "Investor does not exist");
        return _investors[investorId].country;
    }
    
    /**
     * @dev 투자자 수 조회
     * @return 등록된 투자자 수
     */
    function investorCount() external view returns (uint256) {
        return _investorCount;
    }
    
    /**
     * @dev 지갑이 등록되어 있는지 확인
     * @param wallet 지갑 주소
     * @return 등록 여부
     */
    function isWalletRegistered(address wallet) external view returns (bool) {
        return bytes(_walletToInvestor[wallet]).length > 0;
    }
    
    /**
     * @dev 속성이 유효한지 확인 (만료일 체크 포함)
     * @param investorId 투자자 ID
     * @param attrId 속성 ID
     * @return 유효 여부
     */
    function isAttributeValid(string calldata investorId, uint256 attrId) external view returns (bool) {
        require(_investors[investorId].exists, "Investor does not exist");
        
        Attribute storage attr = _investors[investorId].attributes[attrId];
        if (!attr.exists) return false;
        
        // 만료일 체크
        if (attr.expiry > 0 && block.timestamp > attr.expiry) return false;
        
        return attr.value == Constants.VALUE_APPROVED;
    }
}