// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StableCoin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StableCoinFactory
 * @dev 스테이블코인 발행을 관리하는 팩토리 컨트랙트
 * DS 프로토콜의 DS 앱 개념을 참고하여 구현
 */
contract StableCoinFactory is Ownable, ReentrancyGuard {
    // 발행된 스테이블코인 정보
    struct StableCoinInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint8 decimals;
        uint256 maxSupply;
        address issuer;
        uint256 createdAt;
        bool active;
    }
    
    // 발행된 토큰들
    StableCoinInfo[] public stableCoins;
    mapping(string => address) public symbolToAddress;
    mapping(address => bool) public authorizedIssuers;
    
    // 이벤트
    event StableCoinCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        address indexed issuer
    );
    event IssuerAuthorized(address indexed issuer, bool authorized);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @dev 발행자 권한 설정
     */
    function setAuthorizedIssuer(address issuer, bool authorized) external onlyOwner {
        authorizedIssuers[issuer] = authorized;
        emit IssuerAuthorized(issuer, authorized);
    }
    
    /**
     * @dev 새로운 스테이블코인 발행
     */
    function createStableCoin(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 maxSupply
    ) external nonReentrant returns (address) {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue");
        require(symbolToAddress[symbol] == address(0), "Symbol already exists");
        require(maxSupply > 0, "Max supply must be greater than 0");
        
        // 새로운 스테이블코인 컨트랙트 배포
        StableCoin newToken = new StableCoin(
            name,
            symbol,
            decimals,
            maxSupply,
            msg.sender
        );
        
        address tokenAddress = address(newToken);
        
        // 정보 저장
        StableCoinInfo memory tokenInfo = StableCoinInfo({
            tokenAddress: tokenAddress,
            name: name,
            symbol: symbol,
            decimals: decimals,
            maxSupply: maxSupply,
            issuer: msg.sender,
            createdAt: block.timestamp,
            active: true
        });
        
        stableCoins.push(tokenInfo);
        symbolToAddress[symbol] = tokenAddress;
        
        emit StableCoinCreated(tokenAddress, name, symbol, msg.sender);
        
        return tokenAddress;
    }
    
    /**
     * @dev 발행된 스테이블코인 개수 반환
     */
    function getStableCoinCount() external view returns (uint256) {
        return stableCoins.length;
    }
    
    /**
     * @dev 특정 인덱스의 스테이블코인 정보 반환
     */
    function getStableCoinInfo(uint256 index) external view returns (StableCoinInfo memory) {
        require(index < stableCoins.length, "Index out of bounds");
        return stableCoins[index];
    }
    
    /**
     * @dev 심볼로 스테이블코인 주소 조회
     */
    function getStableCoinBySymbol(string memory symbol) external view returns (address) {
        return symbolToAddress[symbol];
    }
    
    /**
     * @dev 발행자가 발행한 스테이블코인 목록 반환
     */
    function getStableCoinsByIssuer(address issuer) external view returns (address[] memory) {
        uint256 count = 0;
        
        // 발행자가 발행한 토큰 개수 계산
        for (uint256 i = 0; i < stableCoins.length; i++) {
            if (stableCoins[i].issuer == issuer && stableCoins[i].active) {
                count++;
            }
        }
        
        // 결과 배열 생성
        address[] memory tokens = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < stableCoins.length; i++) {
            if (stableCoins[i].issuer == issuer && stableCoins[i].active) {
                tokens[index] = stableCoins[i].tokenAddress;
                index++;
            }
        }
        
        return tokens;
    }
}