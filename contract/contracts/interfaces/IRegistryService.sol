// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IRegistryService
 * @dev 투자자 정보 및 지갑 매핑 관리 서비스 인터페이스
 */
interface IRegistryService {
    
    /**
     * @dev 투자자 등록
     * @param investorId 투자자 ID
     * @param collisionHash 중복 방지 해시
     */
    function registerInvestor(string calldata investorId, bytes32 collisionHash) external;
    
    /**
     * @dev 지갑 주소를 투자자에 연결
     * @param wallet 지갑 주소
     * @param investorId 투자자 ID
     */
    function addWallet(address wallet, string calldata investorId) external;
    
    /**
     * @dev 투자자의 국가 설정
     * @param investorId 투자자 ID
     * @param country 국가 코드
     */
    function setCountry(string calldata investorId, string calldata country) external;
    
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
    ) external;
    
    /**
     * @dev 투자자의 모든 지갑 주소 조회
     * @param investorId 투자자 ID
     * @return 지갑 주소 배열
     */
    function walletsOf(string calldata investorId) external view returns (address[] memory);
    
    /**
     * @dev 지갑 주소의 투자자 ID 조회
     * @param wallet 지갑 주소
     * @return 투자자 ID
     */
    function investorOf(address wallet) external view returns (string memory);
    
    /**
     * @dev 투자자 속성 조회
     * @param investorId 투자자 ID
     * @param attrId 속성 ID
     * @return value 속성 값
     * @return expiry 만료일
     * @return proofHash 증빙 해시
     */
    function getAttribute(string calldata investorId, uint256 attrId) 
        external view returns (uint256 value, uint256 expiry, bytes32 proofHash);
    
    /**
     * @dev 투자자 존재 여부 확인
     * @param investorId 투자자 ID
     * @return 존재 여부
     */
    function investorExists(string calldata investorId) external view returns (bool);
    
    /**
     * @dev 지갑이 등록되어 있는지 확인
     * @param wallet 지갑 주소
     * @return 등록 여부
     */
    function isWalletRegistered(address wallet) external view returns (bool);
    
    /**
     * @dev 속성이 유효한지 확인 (만료일 체크 포함)
     * @param investorId 투자자 ID
     * @param attrId 속성 ID
     * @return 유효 여부
     */
    function isAttributeValid(string calldata investorId, uint256 attrId) external view returns (bool);
    
    /**
     * @dev 투자자 국가 조회
     * @param investorId 투자자 ID
     * @return 국가 코드
     */
    function getCountry(string calldata investorId) external view returns (string memory);
    
    /**
     * @dev 투자자 수 조회
     * @return 등록된 투자자 수
     */
    function investorCount() external view returns (uint256);
    
    /**
     * @dev 투자자 등록 이벤트
     */
    event InvestorRegistered(string indexed investorId, bytes32 collisionHash);
    
    /**
     * @dev 지갑 연결 이벤트
     */
    event WalletAdded(address indexed wallet, string indexed investorId);
    
    /**
     * @dev 국가 설정 이벤트
     */
    event CountrySet(string indexed investorId, string country);
    
    /**
     * @dev 속성 설정 이벤트
     */
    event AttributeSet(string indexed investorId, uint256 attrId, uint256 value, uint256 expiry, bytes32 proofHash);
}