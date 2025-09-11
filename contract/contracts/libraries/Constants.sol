// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Constants
 * @dev 시스템 전반에서 사용되는 상수 정의
 */
library Constants {
    // TrustService 역할 상수
    uint256 constant ROLE_NONE = 0;
    uint256 constant ROLE_MASTER = 1;
    uint256 constant ROLE_ISSUER = 2;
    uint256 constant ROLE_EXCHANGE = 4;
    
    // RegistryService 속성 상수
    uint256 constant ATTR_NONE = 0;
    uint256 constant ATTR_KYC = 1;
    uint256 constant ATTR_ACCREDITED = 2;
    uint256 constant ATTR_QUALIFIED = 4;
    uint256 constant ATTR_PROFESSIONAL = 8;
    
    // 속성 값 상수
    uint256 constant VALUE_PENDING = 0;
    uint256 constant VALUE_APPROVED = 1;
    uint256 constant VALUE_REJECTED = 2;
    
    // 컴플라이언스 모드
    uint256 constant COMPLIANCE_MODE_WHITELIST = 0;
    uint256 constant COMPLIANCE_MODE_REGULATORY = 1;
}