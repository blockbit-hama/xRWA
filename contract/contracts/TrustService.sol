// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/ITrustService.sol";
import "./libraries/Constants.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TrustService
 * @dev 역할 및 권한 관리 서비스
 * DS 프로토콜의 Trust 서비스 구현
 */
contract TrustService is ITrustService, Ownable, ReentrancyGuard {
    // 주소별 역할 매핑
    mapping(address => uint256) private _roles;
    
    // 역할별 주소 목록 (감사용)
    mapping(uint256 => address[]) private _roleMembers;
    mapping(uint256 => mapping(address => bool)) private _hasRole;
    
    // 역할 변경 권한 관리
    mapping(address => bool) private _roleManagers;
    
    constructor(address initialOwner) Ownable(initialOwner) {
        // 초기 소유자에게 MASTER 역할 부여
        _setRole(initialOwner, Constants.ROLE_MASTER);
        _roleManagers[initialOwner] = true;
    }
    
    /**
     * @dev 역할 관리자 권한 설정
     * @param manager 관리자 주소
     * @param enabled 활성화 여부
     */
    function setRoleManager(address manager, bool enabled) external onlyOwner {
        _roleManagers[manager] = enabled;
        emit RoleChanged(manager, enabled ? Constants.ROLE_NONE : Constants.ROLE_MASTER, enabled ? Constants.ROLE_MASTER : Constants.ROLE_NONE);
    }
    
    /**
     * @dev 주소의 역할을 설정
     * @param addr 설정할 주소
     * @param role 부여할 역할
     */
    function setRole(address addr, uint256 role) external override nonReentrant {
        require(
            msg.sender == owner() || _roleManagers[msg.sender],
            "Not authorized to set roles"
        );
        require(addr != address(0), "Zero address not allowed");
        
        uint256 oldRole = _roles[addr];
        _setRole(addr, role);
        
        emit RoleChanged(addr, oldRole, role);
    }
    
    /**
     * @dev 주소의 역할을 조회
     * @param addr 조회할 주소
     * @return 역할 값
     */
    function roleOf(address addr) external view override returns (uint256) {
        return _roles[addr];
    }
    
    /**
     * @dev 역할별 멤버 수 조회
     * @param role 조회할 역할
     * @return 멤버 수
     */
    function roleMemberCount(uint256 role) external view returns (uint256) {
        return _roleMembers[role].length;
    }
    
    /**
     * @dev 역할별 멤버 조회
     * @param role 조회할 역할
     * @param index 멤버 인덱스
     * @return 멤버 주소
     */
    function roleMemberAt(uint256 role, uint256 index) external view returns (address) {
        require(index < _roleMembers[role].length, "Index out of bounds");
        return _roleMembers[role][index];
    }
    
    /**
     * @dev 주소가 특정 역할을 가지고 있는지 확인
     * @param addr 확인할 주소
     * @param role 확인할 역할
     * @return 역할 보유 여부
     */
    function hasRole(address addr, uint256 role) external view returns (bool) {
        return _roles[addr] == role;
    }
    
    /**
     * @dev 주소가 특정 역할 이상의 권한을 가지고 있는지 확인
     * @param addr 확인할 주소
     * @param minRole 최소 요구 역할
     * @return 권한 보유 여부
     */
    function hasMinimumRole(address addr, uint256 minRole) external view returns (bool) {
        uint256 userRole = _roles[addr];
        
        // MASTER는 모든 권한을 가짐
        if (userRole == Constants.ROLE_MASTER) return true;
        
        // 역할별 권한 확인
        if (minRole == Constants.ROLE_MASTER) return userRole == Constants.ROLE_MASTER;
        if (minRole == Constants.ROLE_ISSUER) return userRole == Constants.ROLE_MASTER || userRole == Constants.ROLE_ISSUER;
        if (minRole == Constants.ROLE_EXCHANGE) return userRole == Constants.ROLE_MASTER || userRole == Constants.ROLE_EXCHANGE;
        
        return false;
    }
    
    /**
     * @dev 내부 역할 설정 함수
     * @param addr 설정할 주소
     * @param role 부여할 역할
     */
    function _setRole(address addr, uint256 role) internal {
        uint256 oldRole = _roles[addr];
        
        // 기존 역할에서 제거
        if (oldRole != Constants.ROLE_NONE) {
            _removeFromRole(addr, oldRole);
        }
        
        // 새 역할 설정
        _roles[addr] = role;
        
        // 새 역할에 추가
        if (role != Constants.ROLE_NONE) {
            _addToRole(addr, role);
        }
    }
    
    /**
     * @dev 역할에서 주소 제거
     * @param addr 제거할 주소
     * @param role 역할
     */
    function _removeFromRole(address addr, uint256 role) internal {
        if (_hasRole[role][addr]) {
            _hasRole[role][addr] = false;
            
            // 배열에서 제거 (마지막 요소와 교체 후 팝)
            address[] storage members = _roleMembers[role];
            for (uint256 i = 0; i < members.length; i++) {
                if (members[i] == addr) {
                    if (i != members.length - 1) {
                        members[i] = members[members.length - 1];
                    }
                    members.pop();
                    break;
                }
            }
        }
    }
    
    /**
     * @dev 역할에 주소 추가
     * @param addr 추가할 주소
     * @param role 역할
     */
    function _addToRole(address addr, uint256 role) internal {
        if (!_hasRole[role][addr]) {
            _hasRole[role][addr] = true;
            _roleMembers[role].push(addr);
        }
    }
    
    /**
     * @dev 역할 관리자 여부 확인
     * @param addr 확인할 주소
     * @return 역할 관리자 여부
     */
    function isRoleManager(address addr) external view returns (bool) {
        return _roleManagers[addr];
    }
}