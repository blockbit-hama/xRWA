// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ITrustService
 * @dev 역할 및 권한 관리 서비스 인터페이스
 */
interface ITrustService {
    
    /**
     * @dev 주소의 역할을 설정
     * @param addr 설정할 주소
     * @param role 부여할 역할
     */
    function setRole(address addr, uint256 role) external;
    
    /**
     * @dev 주소의 역할을 조회
     * @param addr 조회할 주소
     * @return 역할 값
     */
    function roleOf(address addr) external view returns (uint256);
    
    /**
     * @dev 역할 변경 이벤트
     */
    event RoleChanged(address indexed addr, uint256 oldRole, uint256 newRole);
}