# xStables API 문서

## 📋 개요

xStables API는 RESTful 아키텍처를 기반으로 한 스테이블코인 발행 및 관리 서비스를 제공합니다.

**Base URL**: `http://localhost:3001/api`  
**API Version**: v1  
**Content-Type**: `application/json`

---

## 🔐 인증

### JWT 토큰 기반 인증

모든 보호된 엔드포인트는 JWT 토큰을 필요로 합니다.

```http
Authorization: Bearer <your-jwt-token>
```

---

## 👤 사용자 관리 API

### 회원가입

```http
POST /users
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "isIssuer": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isIssuer": false,
    "kycVerified": false,
    "createdAt": "2024-09-11T00:00:00.000Z"
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 로그인

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isIssuer": false,
    "kycVerified": false
  }
}
```

### 사용자 프로필 조회

```http
GET /auth/profile
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isIssuer": false,
    "kycVerified": false,
    "walletAddress": "0x...",
    "createdAt": "2024-09-11T00:00:00.000Z"
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 사용자 목록 조회

```http
GET /users
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isIssuer": false,
      "kycVerified": false,
      "createdAt": "2024-09-11T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

---

## 🪙 스테이블코인 관리 API

### 토큰 발행

```http
POST /stable-coins
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "USD Stable Coin",
  "symbol": "USDC",
  "decimals": 18,
  "maxSupply": "1000000000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "USD Stable Coin",
    "symbol": "USDC",
    "decimals": 18,
    "maxSupply": "1000000000000000000000000",
    "contractAddress": "0x...",
    "issuerId": "uuid",
    "isActive": true,
    "mintingEnabled": true,
    "burningEnabled": true,
    "createdAt": "2024-09-11T00:00:00.000Z"
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 모든 토큰 조회

```http
GET /stable-coins
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "USD Stable Coin",
      "symbol": "USDC",
      "decimals": 18,
      "maxSupply": "1000000000000000000000000",
      "contractAddress": "0x...",
      "issuer": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "isActive": true,
      "mintingEnabled": true,
      "burningEnabled": true,
      "createdAt": "2024-09-11T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 내가 발행한 토큰 조회

```http
GET /stable-coins/my
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "USD Stable Coin",
      "symbol": "USDC",
      "decimals": 18,
      "maxSupply": "1000000000000000000000000",
      "contractAddress": "0x...",
      "isActive": true,
      "mintingEnabled": true,
      "burningEnabled": true,
      "createdAt": "2024-09-11T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 특정 토큰 조회

```http
GET /stable-coins/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "USD Stable Coin",
    "symbol": "USDC",
    "decimals": 18,
    "maxSupply": "1000000000000000000000000",
    "contractAddress": "0x...",
    "issuer": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "isActive": true,
    "mintingEnabled": true,
    "burningEnabled": true,
    "createdAt": "2024-09-11T00:00:00.000Z"
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 토큰 민팅

```http
POST /stable-coins/:id/mint
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "to": "0x...",
  "amount": "1000000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "success": true
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 토큰 버닝

```http
POST /stable-coins/:id/burn
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": "1000000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "success": true
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 민팅 활성화/비활성화

```http
PATCH /stable-coins/:id/toggle-minting
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "USD Stable Coin",
    "symbol": "USDC",
    "mintingEnabled": false,
    "updatedAt": "2024-09-11T00:00:00.000Z"
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 버닝 활성화/비활성화

```http
PATCH /stable-coins/:id/toggle-burning
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "USD Stable Coin",
    "symbol": "USDC",
    "burningEnabled": false,
    "updatedAt": "2024-09-11T00:00:00.000Z"
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

---

## 🔍 블록체인 API

### 토큰 잔액 조회

```http
GET /blockchain/tokens/:contractAddress/balance/:address
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "balance": "1000000000000000000000",
    "symbol": "USDC",
    "decimals": 18
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 토큰 총 공급량 조회

```http
GET /blockchain/tokens/:contractAddress/total-supply
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSupply": "10000000000000000000000",
    "symbol": "USDC",
    "decimals": 18
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

### 네트워크 상태 조회

```http
GET /blockchain/network/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "network": "Local Network (Hardhat)",
    "blockNumber": 1234567,
    "gasPrice": "20000000000",
    "isConnected": true,
    "lastUpdate": "2024-09-11T00:00:00.000Z"
  },
  "timestamp": "2024-09-11T00:00:00.000Z"
}
```

---

## ❌ 에러 응답

### 일반적인 에러 응답 형식

```json
{
  "statusCode": 400,
  "timestamp": "2024-09-11T00:00:00.000Z",
  "path": "/api/stable-coins",
  "method": "POST",
  "message": "Validation failed"
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복) |
| 500 | 서버 오류 |

### 일반적인 에러 메시지

| 에러 | 설명 |
|------|------|
| `Validation failed` | 입력 데이터 검증 실패 |
| `Invalid credentials` | 잘못된 인증 정보 |
| `Not authorized to issue` | 토큰 발행 권한 없음 |
| `Token not found` | 토큰을 찾을 수 없음 |
| `User not found` | 사용자를 찾을 수 없음 |
| `Symbol already exists` | 토큰 심볼이 이미 존재 |
| `Exceeds max supply` | 최대 공급량 초과 |
| `Insufficient balance` | 잔액 부족 |
| `Sender not KYC verified` | 발신자 KYC 미인증 |
| `Recipient not KYC verified` | 수신자 KYC 미인증 |
| `Account is frozen` | 계정 동결됨 |

---

## 📝 요청/응답 예시

### 완전한 토큰 발행 플로우

1. **로그인**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "password123"}'
```

2. **토큰 발행**
```bash
curl -X POST http://localhost:3001/api/stable-coins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "USD Stable Coin",
    "symbol": "USDC",
    "decimals": 18,
    "maxSupply": "1000000000000000000000000"
  }'
```

3. **토큰 민팅**
```bash
curl -X POST http://localhost:3001/api/stable-coins/<token-id>/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "to": "0x...",
    "amount": "1000000000000000000000"
  }'
```

---

## 🔧 개발 도구

### Postman Collection

Postman을 사용하여 API를 테스트할 수 있습니다. 다음 링크에서 컬렉션을 다운로드하세요:

[Postman Collection Link]

### OpenAPI/Swagger

Swagger UI를 통해 API 문서를 확인할 수 있습니다:

```
http://localhost:3001/api/docs
```

---

## 📊 레이트 리미팅

API 사용량 제한:

- **일반 사용자**: 시간당 1000 요청
- **발행자**: 시간당 5000 요청
- **관리자**: 시간당 10000 요청

레이트 리미트 초과 시:
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "retryAfter": 3600
}
```

---

## 🔐 보안 고려사항

1. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS를 사용하세요.
2. **토큰 보안**: JWT 토큰을 안전하게 저장하고 전송하세요.
3. **입력 검증**: 모든 입력 데이터를 검증하세요.
4. **에러 정보**: 민감한 정보가 에러 메시지에 포함되지 않도록 주의하세요.

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024년 9월 11일  
**작성자**: xStables 개발팀