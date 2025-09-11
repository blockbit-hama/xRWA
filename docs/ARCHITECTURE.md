# RWA 서비스 아키텍처 문서

## 개요

본 문서는 DS Token을 기반으로 한 RWA(Real World Asset) 서비스의 전체 아키텍처를 설명합니다. 시스템은 발행사와 투자자 관점에서 각각의 흐름을 가로축 레이어(Frontend, Backend, Contract, Bank, 국가기관)로 구성하여 상세히 다룹니다.

## 시스템 구성 요소

### 핵심 컴포넌트

1. **DSToken**: ERC-20 기반 증권형 토큰 (규제 훅 및 관리 기능 포함)
2. **ComplianceService**: 규제 검증 서비스
3. **TrustService**: 역할/권한 관리 서비스  
4. **RegistryService**: 투자자 정보 및 지갑 매핑 관리
5. **Backend Services**: 비즈니스 로직 및 오프체인 처리
6. **Frontend Applications**: 사용자 인터페이스

### 레이어 구조

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   Frontend      │    Backend      │    Contract     │      Bank       │    국가기관      │
│                 │                 │                 │                 │                 │
│ - 발행사 대시보드  │ - API 서버      │ - DSToken       │ - FIAT 입출금   │ - 규제 감독     │
│ - 투자자 포털    │ - 백오피스      │ - Compliance    │ - 정산 시스템   │ - KYC 검증      │
│ - 모바일 앱      │ - 웹훅 처리      │ - Trust         │ - 웹훅/API     │ - 보고서 수집   │
│                 │ - 이벤트 처리    │ - Registry      │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

## 발행사 관점 시스템 흐름

### 1. 토큰 발행 준비 단계

```mermaid
flowchart LR
    subgraph "Frontend"
        A1[발행사 대시보드]
        A2[투자자 등록 UI]
        A3[발행 관리 UI]
    end
    
    subgraph "Backend"
        B1[투자자 관리 API]
        B2[KYC 처리 서비스]
        B3[발행 승인 서비스]
    end
    
    subgraph "Contract"
        C1[Registry Contract]
        C2[Trust Contract]
        C3[Compliance Contract]
    end
    
    subgraph "Bank"
        D1[입금 확인 시스템]
        D2[정산 웹훅]
    end
    
    subgraph "국가기관"
        E1[KYC 검증 시스템]
        E2[규제 보고 시스템]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    
    B1 --> C1
    B2 --> E1
    B3 --> C2
    
    D1 --> B3
    D2 --> B3
    
    E1 --> B2
    E2 --> B3
```

### 2. 투자자 온보딩 프로세스

```mermaid
sequenceDiagram
    participant Issuer as 발행사(Frontend)
    participant Backend as 백엔드 서비스
    participant Registry as Registry Contract
    participant Compliance as Compliance Contract
    participant KYC as KYC 검증기관
    participant Bank as 은행 시스템
    
    Note over Issuer,Bank: 투자자 등록 및 KYC 프로세스
    
    Issuer->>Backend: 투자자 정보 등록 요청
    Backend->>KYC: KYC 검증 요청
    KYC-->>Backend: KYC 결과 반환
    Backend->>Registry: registerInvestor(investorId, hash)
    Registry-->>Backend: 등록 완료 이벤트
    Backend->>Registry: addWallet(walletAddress, investorId)
    Registry-->>Backend: 지갑 연결 완료
    Backend->>Registry: setCountry(investorId, countryCode)
    Registry-->>Backend: 국가 정보 설정 완료
    Backend->>Registry: setAttribute(investorId, KYC, approved, expiry, proofHash)
    Registry-->>Backend: KYC 속성 설정 완료
    
    Note over Issuer,Bank: 자금 입금 및 정산 확인
    
    Issuer->>Bank: 투자자 계좌로 입금 안내
    Bank-->>Backend: 입금 확인 웹훅
    Backend->>Compliance: validateIssuance(to, amount) 사전 체크
    Compliance-->>Backend: 검증 결과 반환
```

### 3. 토큰 발행 프로세스

```mermaid
sequenceDiagram
    participant Issuer as 발행사(Frontend)
    participant Backend as 백엔드 서비스
    participant Token as DSToken Contract
    participant Compliance as Compliance Contract
    participant Registry as Registry Contract
    participant Bank as 은행 시스템
    
    Note over Issuer,Bank: 토큰 발행 프로세스
    
    Issuer->>Backend: 토큰 발행 요청
    Backend->>Bank: 자금 정산 상태 확인
    Bank-->>Backend: 정산 완료 확인
    Backend->>Registry: 투자자 상태 업데이트 (funded)
    Registry-->>Backend: 상태 업데이트 완료
    Backend->>Compliance: validateIssuance(to, amount) 최종 검증
    Compliance->>Registry: 투자자 속성 조회
    Registry-->>Compliance: 투자자 정보 반환
    Compliance-->>Backend: 검증 승인
    Backend->>Token: issueTokens(to, amount) 또는 issueTokenWithLocking(...)
    Token->>Compliance: validateIssuance(to, amount) 재검증
    Compliance-->>Token: 검증 승인
    Token->>Token: 토큰 민팅 실행
    Token-->>Backend: Issued/IssuedWithLock 이벤트
    Backend-->>Issuer: 발행 완료 알림
```

---

## 투자자 관점 시스템 흐름

### 1. 투자자 등록 및 인증

```mermaid
flowchart LR
    subgraph "Frontend"
        A1[투자자 포털]
        A2[KYC 신청 UI]
        A3[지갑 연결 UI]
    end
    
    subgraph "Backend"
        B1[사용자 인증 API]
        B2[KYC 처리 서비스]
        B3[지갑 관리 서비스]
    end
    
    subgraph "Contract"
        C1[Registry Contract]
        C2[Compliance Contract]
    end
    
    subgraph "Bank"
        D1[계좌 인증 시스템]
    end
    
    subgraph "국가기관"
        E1[KYC 검증 시스템]
        E2[신원 확인 시스템]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    
    B1 --> C1
    B2 --> E1
    B3 --> C1
    
    D1 --> B1
    E1 --> B2
    E2 --> B2
```

### 2. 투자 프로세스

```mermaid
sequenceDiagram
    participant Investor as 투자자(Frontend)
    participant Backend as 백엔드 서비스
    participant Registry as Registry Contract
    participant Compliance as Compliance Contract
    participant Bank as 은행 시스템
    participant Token as DSToken Contract
    
    Note over Investor,Token: 투자 신청 및 처리 프로세스
    
    Investor->>Backend: 투자 신청
    Backend->>Registry: 투자자 자격 확인
    Registry-->>Backend: 투자자 정보 반환
    Backend->>Compliance: 투자 자격 사전 검증
    Compliance-->>Backend: 검증 결과 반환
    Backend-->>Investor: 투자 승인 및 계좌 정보 제공
    
    Note over Investor,Token: 자금 입금 및 토큰 발행
    
    Investor->>Bank: 자금 입금
    Bank-->>Backend: 입금 확인 웹훅
    Backend->>Compliance: validateIssuance(to, amount) 검증
    Compliance-->>Backend: 검증 승인
    Backend->>Token: issueTokens(to, amount)
    Token-->>Backend: 발행 완료 이벤트
    Backend-->>Investor: 토큰 발행 완료 알림
```

### 3. 토큰 전송 프로세스

```mermaid
sequenceDiagram
    participant Investor as 투자자(Frontend)
    participant Backend as 백엔드 서비스
    participant Token as DSToken Contract
    participant Compliance as Compliance Contract
    participant Registry as Registry Contract
    
    Note over Investor,Registry: 토큰 전송 프로세스
    
    Investor->>Backend: 토큰 전송 요청
    Backend->>Token: preTransferCheck(from, to, amount)
    Token->>Compliance: preTransferCheck(from, to, amount)
    Compliance->>Registry: 송수신자 속성 조회
    Registry-->>Compliance: 투자자 정보 반환
    Compliance-->>Token: 사전 검증 결과
    Token-->>Backend: 전송 가능 여부 반환
    Backend-->>Investor: 전송 가능 여부 및 이유 표시
    
    alt 전송 가능한 경우
        Investor->>Backend: 전송 실행 요청
        Backend->>Token: transfer(to, amount)
        Token->>Compliance: validateTransfer(from, to, amount)
        Compliance-->>Token: 검증 승인
        Token->>Token: 토큰 전송 실행
        Token-->>Backend: Transfer 이벤트
        Backend-->>Investor: 전송 완료 알림
    else 전송 불가능한 경우
        Backend-->>Investor: 전송 불가 사유 안내
    end
```

---

## 레이어별 상세 아키텍처

### Frontend Layer

```mermaid
graph TB
    subgraph "Frontend Applications"
        A1[발행사 대시보드]
        A2[투자자 포털]
        A3[모바일 앱]
        A4[관리자 콘솔]
    end
    
    subgraph "Frontend Services"
        B1[Web3 Provider]
        B2[API Client]
        B3[State Management]
        B4[UI Components]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B2
    A4 --> B2
    
    B1 --> B3
    B2 --> B3
    B3 --> B4
```

**주요 기능:**
- 발행사: 투자자 관리, 토큰 발행, 규제 보고
- 투자자: 투자 신청, 포트폴리오 조회, 토큰 전송
- 관리자: 시스템 모니터링, 규제 정책 관리

### Backend Layer

```mermaid
graph TB
    subgraph "API Gateway"
        C1[인증/인가]
        C2[요청 라우팅]
        C3[Rate Limiting]
    end
    
    subgraph "Core Services"
        D1[투자자 관리 서비스]
        D2[토큰 발행 서비스]
        D3[정산 서비스]
        D4[규제 서비스]
        D5[이벤트 처리 서비스]
    end
    
    subgraph "External Integrations"
        E1[은행 API 연동]
        E2[KYC 서비스 연동]
        E3[블록체인 모니터링]
        E4[알림 서비스]
    end
    
    C1 --> D1
    C2 --> D2
    C3 --> D3
    
    D1 --> E2
    D2 --> E1
    D3 --> E1
    D4 --> E2
    D5 --> E3
```

**주요 기능:**
- API 서버: RESTful API 제공
- 백오피스: 비즈니스 로직 처리
- 웹훅 처리: 외부 시스템 연동
- 이벤트 처리: 블록체인 이벤트 모니터링

### Contract Layer

```mermaid
graph TB
    subgraph "Core Contracts"
        F1[DSToken]
        F2[ComplianceService]
        F3[TrustService]
        F4[RegistryService]
    end
    
    subgraph "Supporting Contracts"
        G1[Proxy Contracts]
        G2[Upgrade Contracts]
        G3[Multisig Contracts]
    end
    
    subgraph "Contract Interactions"
        H1[Event Emission]
        H2[State Management]
        H3[Access Control]
    end
    
    F1 --> F2
    F1 --> F3
    F1 --> F4
    
    F2 --> G1
    F3 --> G2
    F4 --> G3
    
    F1 --> H1
    F2 --> H2
    F3 --> H3
```

**주요 기능:**
- DSToken: ERC-20 기반 증권형 토큰
- ComplianceService: 규제 검증 로직
- TrustService: 역할 및 권한 관리
- RegistryService: 투자자 정보 관리

### Bank Layer

```mermaid
graph TB
    subgraph "Banking Systems"
        I1[FIAT 입출금 시스템]
        I2[정산 시스템]
        I3[계좌 관리 시스템]
    end
    
    subgraph "Integration APIs"
        J1[SWIFT API]
        J2[ACH API]
        J3[Webhook API]
    end
    
    subgraph "Compliance & Reporting"
        K1[AML 모니터링]
        K2[거래 보고]
        K3[감사 로그]
    end
    
    I1 --> J1
    I2 --> J2
    I3 --> J3
    
    I1 --> K1
    I2 --> K2
    I3 --> K3
```

**주요 기능:**
- FIAT 입출금 처리
- 실시간 정산 확인
- 웹훅을 통한 입금 알림
- AML 및 규제 보고

### 국가기관 Layer

```mermaid
graph TB
    subgraph "Regulatory Bodies"
        L1[금융감독원]
        L2[세무서]
        L3[법무부]
    end
    
    subgraph "Verification Services"
        M1[KYC 검증 시스템]
        M2[신원 확인 시스템]
        M3[자격 검증 시스템]
    end
    
    subgraph "Reporting Systems"
        N1[규제 보고 시스템]
        N2[감사 시스템]
        N3[모니터링 시스템]
    end
    
    L1 --> M1
    L2 --> M2
    L3 --> M3
    
    M1 --> N1
    M2 --> N2
    M3 --> N3
```

**주요 기능:**
- KYC/AML 검증
- 투자자 자격 확인
- 규제 보고서 수집
- 시스템 감사 및 모니터링

---

## 데이터 흐름 및 보안

### 데이터 흐름도

```mermaid
flowchart LR
    subgraph "Data Sources"
        O1[투자자 정보]
        O2[거래 데이터]
        O3[규제 데이터]
    end
    
    subgraph "Processing Layer"
        P1[데이터 검증]
        P2[데이터 변환]
        P3[데이터 저장]
    end
    
    subgraph "Storage Layer"
        Q1[온체인 저장]
        Q2[오프체인 저장]
        Q3[백업 시스템]
    end
    
    O1 --> P1
    O2 --> P2
    O3 --> P3
    
    P1 --> Q1
    P2 --> Q2
    P3 --> Q3
```

### 보안 아키텍처

```mermaid
graph TB
    subgraph "Security Layers"
        R1[네트워크 보안]
        R2[애플리케이션 보안]
        R3[데이터 보안]
        R4[인프라 보안]
    end
    
    subgraph "Security Controls"
        S1[멀티팩터 인증]
        S2[암호화]
        S3[접근 제어]
        S4[감사 로깅]
    end
    
    subgraph "Compliance"
        T1[GDPR 준수]
        T2[PCI DSS]
        T3[SOX 준수]
        T4[금융 규제]
    end
    
    R1 --> S1
    R2 --> S2
    R3 --> S3
    R4 --> S4
    
    S1 --> T1
    S2 --> T2
    S3 --> T3
    S4 --> T4
```

---

## 시스템 통합 및 확장성

### 마이크로서비스 아키텍처

```mermaid
graph TB
    subgraph "Service Mesh"
        U1[API Gateway]
        U2[Service Discovery]
        U3[Load Balancer]
        U4[Circuit Breaker]
    end
    
    subgraph "Core Services"
        V1[투자자 서비스]
        V2[토큰 서비스]
        V3[정산 서비스]
        V4[규제 서비스]
    end
    
    subgraph "Infrastructure"
        W1[Container Orchestration]
        W2[Service Monitoring]
        W3[Log Aggregation]
        W4[Distributed Tracing]
    end
    
    U1 --> V1
    U2 --> V2
    U3 --> V3
    U4 --> V4
    
    V1 --> W1
    V2 --> W2
    V3 --> W3
    V4 --> W4
```

### 확장성 고려사항

1. **수평적 확장**: 마이크로서비스 기반 아키텍처로 독립적 스케일링
2. **데이터베이스 분할**: 투자자별, 지역별 샤딩
3. **캐싱 전략**: Redis를 활용한 고성능 데이터 캐싱
4. **비동기 처리**: 메시지 큐를 통한 이벤트 기반 아키텍처
5. **CDN 활용**: 정적 자원의 글로벌 배포

---

## 모니터링 및 운영

### 모니터링 아키텍처

```mermaid
graph TB
    subgraph "Application Monitoring"
        X1[성능 모니터링]
        X2[에러 추적]
        X3[사용자 행동 분석]
    end
    
    subgraph "Infrastructure Monitoring"
        Y1[서버 모니터링]
        Y2[네트워크 모니터링]
        Y3[데이터베이스 모니터링]
    end
    
    subgraph "Business Monitoring"
        Z1[거래 모니터링]
        Z2[규제 준수 모니터링]
        Z3[보안 모니터링]
    end
    
    X1 --> Y1
    X2 --> Y2
    X3 --> Y3
    
    Y1 --> Z1
    Y2 --> Z2
    Y3 --> Z3
```

### 알림 및 대응 체계

1. **실시간 알림**: 중요 이벤트 발생 시 즉시 알림
2. **자동 복구**: 장애 발생 시 자동 복구 메커니즘
3. **백업 및 복구**: 정기적 백업 및 재해 복구 계획
4. **성능 최적화**: 지속적인 성능 모니터링 및 최적화

---

## 결론

본 아키텍처 문서는 DS Token 기반 RWA 서비스의 전체적인 구조와 각 레이어별 상세 기능을 발행사와 투자자 관점에서 설명했습니다. 

**핵심 특징:**
- **규제 준수**: ComplianceService를 통한 실시간 규제 검증
- **투명성**: 블록체인 기반의 투명한 거래 기록
- **확장성**: 마이크로서비스 기반의 확장 가능한 아키텍처
- **보안**: 다층 보안 체계를 통한 안전한 자산 관리
- **통합성**: 다양한 외부 시스템과의 원활한 연동

이 아키텍처는 금융 규제를 준수하면서도 효율적이고 안전한 RWA 서비스를 제공할 수 있도록 설계되었습니다.