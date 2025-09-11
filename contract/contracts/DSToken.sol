// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IComplianceService.sol";
import "./interfaces/ITrustService.sol";
import "./interfaces/IRegistryService.sol";
import "./libraries/Constants.sol";

/**
 * @title DSToken
 * @dev ERC-20 기반 증권형 토큰
 * DS 프로토콜의 DS Token 구현
 */
contract DSToken is ERC20, Pausable, ReentrancyGuard {
    // 외부 서비스 참조
    ITrustService public trust;
    IRegistryService public registry;
    IComplianceService public compliance;
    
    // 토큰 정보
    uint8 private immutable _decimals;
    uint256 public totalIssued; // 누적 발행량
    
    // 보유자 관리
    address[] private _holders;
    mapping(address => bool) private _isHolder;
    
    // 락킹 정보
    struct LockInfo {
        uint256 amountLocked;
        uint64 releaseTime;
        string reason;
    }
    mapping(address => LockInfo) private _locks;
    
    
    // 이벤트
    event Issued(address indexed to, uint256 value);
    event IssuedWithLock(address indexed to, uint256 minted, uint256 locked, uint64 releaseTime, string reason);
    event Burned(address indexed who, uint256 value, string reason);
    event Seized(address indexed from, address indexed to, uint256 value, string reason);
    event LockSet(address indexed to, uint256 amount, uint64 releaseTime, string reason);
    event LockReleased(address indexed to, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address _trust,
        address _registry,
        address _compliance
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        trust = ITrustService(_trust);
        registry = IRegistryService(_registry);
        compliance = IComplianceService(_compliance);
    }
    
    /**
     * @dev 토큰 소수점 자릿수 반환
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev 발행사/마스터 권한 확인
     */
    modifier onlyIssuerOrMaster() {
        uint256 role = trust.roleOf(msg.sender);
        require(role == Constants.ROLE_ISSUER || role == Constants.ROLE_MASTER, "Not issuer/master");
        _;
    }
    
    /**
     * @dev 전송 가능 여부 확인 (정지/락 체크)
     */
    modifier canTransfer(address from, address to, uint256 amount) {
        require(!paused(), "Transfers paused");
        
        // 락킹 확인
        LockInfo memory lock = _locks[from];
        if (lock.amountLocked > 0 && block.timestamp < lock.releaseTime) {
            uint256 spendable = balanceOf(from) - lock.amountLocked;
            require(amount <= spendable, "Locked balance");
        }
        
        // 컴플라이언스 검증
        (bool ok, string memory reason) = compliance.validateTransfer(from, to, amount);
        require(ok, reason);
        
        _;
    }
    
    /**
     * @dev 토큰 발행
     */
    function issueTokens(address to, uint256 value) external onlyIssuerOrMaster nonReentrant returns (bool) {
        // 사전 검증
        (bool preOk, ) = compliance.preIssuanceCheck(to, value);
        require(preOk, "Pre-issuance blocked");
        
        // 본 검증
        (bool ok, string memory reason) = compliance.validateIssuance(to, value);
        require(ok, reason);
        
        _mint(to, value);
        totalIssued += value;
        
        emit Issued(to, value);
        return true;
    }
    
    /**
     * @dev 락과 함께 토큰 발행
     */
    function issueTokenWithLocking(
        address to,
        uint256 value,
        uint256 valueLocked,
        string calldata reason,
        uint64 releaseTime
    ) external onlyIssuerOrMaster nonReentrant returns (bool) {
        // 기본 발행 검증
        (bool preOk, ) = compliance.preIssuanceCheck(to, value);
        require(preOk, "Pre-issuance blocked");
        
        (bool ok, string memory reasonStr) = compliance.validateIssuance(to, value);
        require(ok, reasonStr);
        
        _mint(to, value);
        totalIssued += value;
        
        // 락 설정
        if (valueLocked > 0) {
            require(valueLocked <= balanceOf(to), "Lock > balance");
            require(releaseTime > block.timestamp, "Invalid release time");
            
            _locks[to] = LockInfo({
                amountLocked: valueLocked,
                releaseTime: releaseTime,
                reason: reason
            });
            
            emit LockSet(to, valueLocked, releaseTime, reason);
        }
        
        emit IssuedWithLock(to, value, valueLocked, releaseTime, reason);
        return true;
    }
    
    /**
     * @dev 토큰 소각
     */
    function burn(address who, uint256 value, string calldata reason) external onlyIssuerOrMaster nonReentrant returns (bool) {
        (bool ok, string memory reasonStr) = compliance.validateBurn(who, value);
        require(ok, reasonStr);
        
        require(balanceOf(who) >= value, "Insufficient balance");
        
        _burn(who, value);
        emit Burned(who, value, reason);
        return true;
    }
    
    /**
     * @dev 강제 회수
     */
    function seize(address from, address to, uint256 value, string calldata reason) external onlyIssuerOrMaster nonReentrant returns (bool) {
        (bool ok, string memory reasonStr) = compliance.validateSeize(from, to, value);
        require(ok, reasonStr);
        
        require(to != address(0), "Zero to");
        require(balanceOf(from) >= value, "Insufficient balance");
        
        // 락 고려
        LockInfo memory lock = _locks[from];
        if (lock.amountLocked > 0 && block.timestamp < lock.releaseTime) {
            uint256 spendable = balanceOf(from) - lock.amountLocked;
            require(value <= spendable, "Locked balance");
        }
        
        _transfer(from, to, value);
        emit Seized(from, to, value, reason);
        return true;
    }
    
    /**
     * @dev 일시정지
     */
    function pause() external onlyIssuerOrMaster {
        _pause();
    }
    
    /**
     * @dev 재개
     */
    function unpause() external onlyIssuerOrMaster {
        _unpause();
    }
    
    /**
     * @dev 락 설정
     */
    function setLock(address to, uint256 amount, uint64 releaseTime, string calldata reason) external onlyIssuerOrMaster {
        require(to != address(0), "Zero address");
        require(amount <= balanceOf(to), "Lock > balance");
        require(releaseTime > block.timestamp, "Invalid release time");
        
        _locks[to] = LockInfo({
            amountLocked: amount,
            releaseTime: releaseTime,
            reason: reason
        });
        
        emit LockSet(to, amount, releaseTime, reason);
    }
    
    /**
     * @dev 락 해제
     */
    function releaseLock(address to) external onlyIssuerOrMaster {
        LockInfo storage lock = _locks[to];
        require(lock.amountLocked > 0, "No lock");
        require(block.timestamp >= lock.releaseTime, "Lock not expired");
        
        uint256 amount = lock.amountLocked;
        lock.amountLocked = 0;
        lock.releaseTime = 0;
        lock.reason = "";
        
        emit LockReleased(to, amount);
    }
    
    /**
     * @dev 전송 (컴플라이언스 검증 포함)
     */
    function transfer(address to, uint256 amount) public override canTransfer(msg.sender, to, amount) returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev 승인 전송 (컴플라이언스 검증 포함)
     */
    function transferFrom(address from, address to, uint256 amount) public override canTransfer(from, to, amount) returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev 보유자 수 조회
     */
    function walletCount() external view returns (uint256) {
        return _holders.length;
    }
    
    /**
     * @dev 보유자 주소 조회
     */
    function getWalletAt(uint256 index) external view returns (address) {
        require(index < _holders.length, "Index out of bounds");
        return _holders[index];
    }
    
    /**
     * @dev 투자자 중심 잔액 조회
     */
    function balanceOfInvestor(string calldata investorId) external view returns (uint256 total) {
        address[] memory wallets = registry.walletsOf(investorId);
        for (uint256 i = 0; i < wallets.length; i++) {
            total += balanceOf(wallets[i]);
        }
    }
    
    /**
     * @dev 사전 전송 체크
     */
    function preTransferCheck(address from, address to, uint256 value) external view returns (bool ok, string memory reason) {
        if (paused()) return (false, "Paused");
        
        LockInfo memory lock = _locks[from];
        if (lock.amountLocked > 0 && block.timestamp < lock.releaseTime) {
            uint256 spendable = balanceOf(from) - lock.amountLocked;
            if (value > spendable) return (false, "Locked balance");
        }
        
        return compliance.preTransferCheck(from, to, value);
    }
    
    /**
     * @dev 락 정보 조회
     */
    function getLockInfo(address addr) external view returns (uint256 amountLocked, uint64 releaseTime, string memory reason) {
        LockInfo memory lock = _locks[addr];
        return (lock.amountLocked, lock.releaseTime, lock.reason);
    }
    
    /**
     * @dev 사용 가능한 잔액 조회 (락 고려)
     */
    function spendableBalance(address addr) external view returns (uint256) {
        uint256 balance = balanceOf(addr);
        LockInfo memory lock = _locks[addr];
        
        if (lock.amountLocked > 0 && block.timestamp < lock.releaseTime) {
            return balance - lock.amountLocked;
        }
        
        return balance;
    }
    
    /**
     * @dev 외부 서비스 업데이트
     */
    function updateServices(address _trust, address _registry, address _compliance) external onlyIssuerOrMaster {
        trust = ITrustService(_trust);
        registry = IRegistryService(_registry);
        compliance = IComplianceService(_compliance);
    }
    
    /**
     * @dev 내부 전송 로직 (보유자 목록 관리 포함)
     */
    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        
        // 보유자 목록 동기화
        _syncHoldersOnDecrease(from);
        _syncHoldersOnIncrease(to);
    }
    
    /**
     * @dev 보유자 목록에서 제거
     */
    function _syncHoldersOnDecrease(address addr) internal {
        if (_isHolder[addr] && balanceOf(addr) == 0) {
            _isHolder[addr] = false;
            
            // 배열에서 제거
            uint256 len = _holders.length;
            for (uint256 i = 0; i < len; i++) {
                if (_holders[i] == addr) {
                    if (i != len - 1) {
                        _holders[i] = _holders[len - 1];
                    }
                    _holders.pop();
                    break;
                }
            }
        }
    }
    
    /**
     * @dev 보유자 목록에 추가
     */
    function _syncHoldersOnIncrease(address addr) internal {
        if (!_isHolder[addr] && balanceOf(addr) > 0) {
            _isHolder[addr] = true;
            _holders.push(addr);
        }
    }
}