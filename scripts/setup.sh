#!/bin/bash

# xStables 프로젝트 설정 스크립트

echo "🚀 xStables 프로젝트 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Node.js 버전 확인
print_step "Node.js 버전 확인 중..."
if ! command -v node &> /dev/null; then
    print_error "Node.js가 설치되어 있지 않습니다. Node.js 18 이상을 설치해주세요."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 이상이 필요합니다. 현재 버전: $(node -v)"
    exit 1
fi

print_step "Node.js 버전: $(node -v)"

# Docker 확인
print_step "Docker 확인 중..."
if ! command -v docker &> /dev/null; then
    print_warning "Docker가 설치되어 있지 않습니다. Docker를 설치하면 전체 스택을 쉽게 실행할 수 있습니다."
fi

# PostgreSQL 확인
print_step "PostgreSQL 확인 중..."
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL이 설치되어 있지 않습니다. Docker를 사용하거나 PostgreSQL을 설치해주세요."
fi

# 백엔드 설정
print_step "백엔드 의존성 설치 중..."
cd back
if [ ! -f "package.json" ]; then
    print_error "백엔드 package.json을 찾을 수 없습니다."
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "백엔드 의존성 설치에 실패했습니다."
    exit 1
fi

# 환경 변수 파일 생성
if [ ! -f ".env" ]; then
    print_step "백엔드 환경 변수 파일 생성 중..."
    cp .env.example .env
    print_warning ".env 파일을 편집하여 데이터베이스 설정을 확인해주세요."
fi

cd ..

# 프론트엔드 설정
print_step "프론트엔드 의존성 설치 중..."
cd front
if [ ! -f "package.json" ]; then
    print_error "프론트엔드 package.json을 찾을 수 없습니다."
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "프론트엔드 의존성 설치에 실패했습니다."
    exit 1
fi

cd ..

# 스마트 컨트랙트 설정
print_step "스마트 컨트랙트 의존성 설치 중..."
cd contract
if [ ! -f "package.json" ]; then
    print_error "스마트 컨트랙트 package.json을 찾을 수 없습니다."
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "스마트 컨트랙트 의존성 설치에 실패했습니다."
    exit 1
fi

# 컨트랙트 컴파일
print_step "스마트 컨트랙트 컴파일 중..."
npm run compile
if [ $? -ne 0 ]; then
    print_error "스마트 컨트랙트 컴파일에 실패했습니다."
    exit 1
fi

cd ..

print_step "설정이 완료되었습니다! 🎉"
echo ""
echo "다음 단계:"
echo "1. PostgreSQL 데이터베이스를 설정하세요"
echo "2. 백엔드 환경 변수를 확인하세요 (back/.env)"
echo "3. 다음 명령어로 서비스를 시작하세요:"
echo ""
echo "   # 개발 모드로 실행:"
echo "   npm run dev:all"
echo ""
echo "   # Docker로 실행:"
echo "   docker-compose up -d"
echo ""
echo "   # 개별 실행:"
echo "   # 백엔드: cd back && npm run start:dev"
echo "   # 프론트엔드: cd front && npm run dev"
echo "   # 블록체인: cd contract && npm run node"