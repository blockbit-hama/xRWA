// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RWA Token
 * @dev ERC20 기반 자산토큰화 컨트랙트
 * DS 프로토콜의 DS 토큰 개념을 참고하여 구현
 */
contract StableCoin is ERC20, Ownable, Pausable, ReentrancyGuard {
    // 자산토큰 정보
    string private _symbol;
    uint8 private _decimals;
    uint256 private _maxSupply;
    
    // 발행 관련 상태
    bool public mintingEnabled = true;
    bool public burningEnabled = true;
    
    // KYC/AML 관련 주소 관리
    mapping(address => bool) public kycVerified;
    mapping(address => bool) public frozen;
    
    // 이벤트
    event MintingToggled(bool enabled);
    event BurningToggled(bool enabled);
    event KYCVerified(address indexed account, bool verified);
    event AccountFrozen(address indexed account, bool frozen);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 maxSupply_,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _symbol = symbol;
        _decimals = decimals_;
        _maxSupply = maxSupply_;
    }
    
    /**
     * @dev 토큰 심볼 반환
     */
    function symbol() public view override returns (string memory) {
        return _symbol;
    }
    
    /**
     * @dev 토큰 소수점 자릿수 반환
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev 최대 공급량 반환
     */
    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }
    
    /**
     * @dev 민팅 활성화/비활성화
     */
    function toggleMinting() external onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }
    
    /**
     * @dev 버닝 활성화/비활성화
     */
    function toggleBurning() external onlyOwner {
        burningEnabled = !burningEnabled;
        emit BurningToggled(burningEnabled);
    }
    
    /**
     * @dev KYC 인증 상태 설정
     */
    function setKYCVerified(address account, bool verified) external onlyOwner {
        kycVerified[account] = verified;
        emit KYCVerified(account, verified);
    }
    
    /**
     * @dev 계정 동결/해제
     */
    function setFrozen(address account, bool frozen_) external onlyOwner {
        frozen[account] = frozen_;
        emit AccountFrozen(account, frozen_);
    }
    
    /**
     * @dev 토큰 발행 (민팅)
     */
    function mint(address to, uint256 amount) external onlyOwner nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= _maxSupply, "Exceeds max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev 토큰 소각 (버닝)
     */
    function burn(uint256 amount) external nonReentrant {
        require(burningEnabled, "Burning is disabled");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev 전송 전 검증 (KYC, 동결 상태 확인)
     */
    function _update(address from, address to, uint256 value) internal override {
        // 발행/소각이 아닌 전송의 경우에만 KYC 검증
        if (from != address(0) && to != address(0)) {
            require(kycVerified[from], "Sender not KYC verified");
            require(kycVerified[to], "Recipient not KYC verified");
            require(!frozen[from], "Sender account is frozen");
            require(!frozen[to], "Recipient account is frozen");
        }
        
        super._update(from, to, value);
    }
    
    /**
     * @dev 컨트랙트 일시정지
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 컨트랙트 재개
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}