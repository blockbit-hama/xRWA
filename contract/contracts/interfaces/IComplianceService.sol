// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IComplianceService
 * @dev 규제 검증 서비스 인터페이스
 */
interface IComplianceService {
    /**
     * @dev 발행 사전 검증 (뷰 함수)
     * @param to 수취인 주소
     * @param value 발행 수량
     * @return ok 검증 통과 여부
     * @return reason 실패 사유
     */
    function preIssuanceCheck(address to, uint256 value) external view returns (bool ok, string memory reason);
    
    /**
     * @dev 전송 사전 검증 (뷰 함수)
     * @param from 송신인 주소
     * @param to 수취인 주소
     * @param value 전송 수량
     * @return ok 검증 통과 여부
     * @return reason 실패 사유
     */
    function preTransferCheck(address from, address to, uint256 value) external view returns (bool ok, string memory reason);
    
    /**
     * @dev 발행 검증 (트랜잭션 경로)
     * @param to 수취인 주소
     * @param value 발행 수량
     * @return ok 검증 통과 여부
     * @return reason 실패 사유
     */
    function validateIssuance(address to, uint256 value) external returns (bool ok, string memory reason);
    
    /**
     * @dev 전송 검증 (트랜잭션 경로)
     * @param from 송신인 주소
     * @param to 수취인 주소
     * @param value 전송 수량
     * @return ok 검증 통과 여부
     * @return reason 실패 사유
     */
    function validateTransfer(address from, address to, uint256 value) external returns (bool ok, string memory reason);
    
    /**
     * @dev 소각 검증 (트랜잭션 경로)
     * @param who 소각 대상 주소
     * @param value 소각 수량
     * @return ok 검증 통과 여부
     * @return reason 실패 사유
     */
    function validateBurn(address who, uint256 value) external returns (bool ok, string memory reason);
    
    /**
     * @dev 강제 회수 검증 (트랜잭션 경로)
     * @param from 회수 대상 주소
     * @param to 회수 수취인 주소
     * @param value 회수 수량
     * @return ok 검증 통과 여부
     * @return reason 실패 사유
     */
    function validateSeize(address from, address to, uint256 value) external returns (bool ok, string memory reason);
    
    /**
     * @dev 국가 컴플라이언스 정책 설정
     * @param country 국가 코드
     * @param allowed 허용 여부
     */
    function setCountryCompliance(string calldata country, bool allowed) external;
    
    /**
     * @dev 보유자 수 상한 설정
     * @param maxHolders 최대 보유자 수
     */
    function setMaxHolders(uint256 maxHolders) external;
    
    /**
     * @dev 검증 모드 설정
     * @param mode 검증 모드 (0: 화이트리스트, 1: 규제형)
     */
    function setComplianceMode(uint256 mode) external;
    
    /**
     * @dev 검증 실패 이벤트
     */
    event ComplianceViolation(string reason, address indexed from, address indexed to, uint256 value);
    
    /**
     * @dev 정책 변경 이벤트
     */
    event PolicyChanged(string policy, bytes data);
}