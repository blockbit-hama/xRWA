# xStables - 스테이블코인 발행 플랫폼

xStables는 DS 프로토콜을 참고하여 구현된 디지털 증권 토큰 발행 서비스입니다. 규제 준수를 위한 KYC/AML 검증과 함께 안전하고 투명한 스테이블코인을 발행할 수 있는 플랫폼을 제공합니다.

## 🏗️ 프로젝트 구조

```
xStables/
├── back/          # NestJS 백엔드 API
├── front/         # Next.js 프론트엔드
├── contract/       # Hardhat 스마트 컨트랙트
└── README.md
```

## 🚀 주요 기능

### DS 프로토콜 기반 구현
- **DS 토큰**: ERC-20 호환 스테이블코인으로 KYC/AML 검증 기능 포함
- **DS 앱**: 토큰 발행, 민팅, 버닝, 전송 제한 등 생애 주기 관리
- **DS 서비스**: 트러스트 서비스, 레지스트리 서비스, 컴플라이언스 서비스

### 핵심 기능
- ✅ 스테이블코인 발행 및 관리
- ✅ KYC/AML 검증 시스템
- ✅ 계정 동결/해제 기능
- ✅ 민팅/버닝 제어
- ✅ 블록체인 연동 (이더리움)
- ✅ 사용자 인증 및 권한 관리
- ✅ 실시간 토큰 상태 모니터링
- ✅ 대시보드 및 분석 기능
- ✅ 반응형 웹 디자인
- ✅ 에러 처리 및 로딩 상태 관리
- ✅ Docker 컨테이너화
- ✅ 자동화된 배포 스크립트

## 🛠️ 기술 스택

### Backend (NestJS)
- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Blockchain**: ethers.js

### Frontend (Next.js)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Hooks

### Smart Contracts
- **Framework**: Hardhat
- **Language**: Solidity ^0.8.19
- **Libraries**: OpenZeppelin Contracts
- **Network**: Ethereum (로컬/테스트넷)

## 📦 설치 및 실행

### 빠른 시작 (자동 설정)

```bash
# 프로젝트 클론 후
npm run setup
```

### 수동 설정

#### 1. 전체 프로젝트 설정

```bash
# 루트에서 모든 의존성 설치
npm run install:all

# 또는 개별적으로
npm install
cd back && npm install
cd ../front && npm install  
cd ../contract && npm install
```

#### 2. 백엔드 설정

```bash
cd back
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 및 기타 설정을 구성

# PostgreSQL 데이터베이스 생성
createdb xstables

# 개발 서버 실행
npm run start:dev
```

#### 3. 프론트엔드 설정

```bash
cd front
npm run dev
```

#### 4. 스마트 컨트랙트 설정

```bash
cd contract
npm run compile
npm run test
npm run node  # 로컬 네트워크 시작
```

### 개발 모드 실행

```bash
# 모든 서비스를 동시에 실행
npm run dev:all

# 또는 개별 실행
npm run dev:backend   # 백엔드만
npm run dev:frontend  # 프론트엔드만
npm run dev:contract  # 블록체인만
```

### Docker로 실행

```bash
# 모든 서비스를 Docker로 실행
npm run docker:up

# 로그 확인
npm run docker:logs

# 중지
npm run docker:down
```

## 🔧 환경 설정

### 백엔드 (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=xstables

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_PRIVATE_KEY=your-private-key

# Server
PORT=3001
NODE_ENV=development
```

## 📋 API 엔드포인트

### 인증
- `POST /auth/login` - 사용자 로그인
- `GET /auth/profile` - 사용자 프로필 조회

### 사용자 관리
- `GET /users` - 사용자 목록 조회
- `POST /users` - 사용자 생성
- `GET /users/:id` - 특정 사용자 조회
- `PATCH /users/:id` - 사용자 정보 수정

### 스테이블코인 관리
- `GET /stable-coins` - 모든 스테이블코인 조회
- `POST /stable-coins` - 스테이블코인 발행
- `GET /stable-coins/my` - 내가 발행한 스테이블코인 조회
- `GET /stable-coins/:id` - 특정 스테이블코인 조회
- `POST /stable-coins/:id/mint` - 토큰 민팅
- `POST /stable-coins/:id/burn` - 토큰 버닝
- `PATCH /stable-coins/:id/toggle-minting` - 민팅 활성화/비활성화
- `PATCH /stable-coins/:id/toggle-burning` - 버닝 활성화/비활성화

## 🔐 보안 기능

### KYC/AML 검증
- 발행자 및 투자자 KYC 검증 필수
- 검증되지 않은 계정의 토큰 전송 차단
- 계정 동결/해제 기능

### 토큰 제어
- 민팅/버닝 활성화/비활성화
- 최대 공급량 제한
- 소유자 권한 기반 관리

### 블록체인 보안
- OpenZeppelin의 검증된 컨트랙트 사용
- ReentrancyGuard로 재진입 공격 방지
- Pausable 기능으로 긴급 상황 대응

## 🧪 테스트

### 백엔드 테스트
```bash
cd back
npm run test
npm run test:e2e
```

### 스마트 컨트랙트 테스트
```bash
cd contract
npm run test
```

## 📚 DS 프로토콜 참고사항

이 프로젝트는 시큐리타이즈의 DS 프로토콜을 참고하여 구현되었습니다:

- **DS 토큰**: ERC-20 기반 증권형 토큰의 확장 기능
- **DS 앱**: 토큰 생애 주기 관리 애플리케이션
- **DS 서비스**: 트러스트, 레지스트리, 컴플라이언스 서비스

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

프로젝트에 대한 질문이나 지원이 필요한 경우 이슈를 생성해 주세요.

---

**xStables** - 안전하고 투명한 스테이블코인 발행 플랫폼# xRWA
