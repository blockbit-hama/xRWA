'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface BlockchainStatus {
  network: string;
  blockNumber: number;
  gasPrice: string;
  isConnected: boolean;
  lastUpdate: string;
}

interface TokenInfo {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  totalSupply: string;
  balance: string;
}

export default function BlockchainPage() {
  const [status, setStatus] = useState<BlockchainStatus>({
    network: 'Local Network',
    blockNumber: 0,
    gasPrice: '0',
    isConnected: false,
    lastUpdate: new Date().toISOString(),
  });
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlockchainData();
    fetchTokenData();
  }, []);

  const fetchBlockchainData = async () => {
    try {
      // 실제 구현에서는 블록체인 네트워크에서 데이터를 가져옵니다
      // 여기서는 시뮬레이션 데이터를 사용합니다
      setTimeout(() => {
        setStatus({
          network: 'Local Network (Hardhat)',
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          gasPrice: '20000000000', // 20 Gwei
          isConnected: true,
          lastUpdate: new Date().toISOString(),
        });
      }, 1000);
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
    }
  };

  const fetchTokenData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const data = await apiClient.getMyStableCoins();
      // 각 토큰에 대한 블록체인 데이터 시뮬레이션
      const tokenInfos = data.map((token: any) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        contractAddress: token.contractAddress,
        totalSupply: '10000000000000000000000', // 시뮬레이션 데이터
        balance: '1000000000000000000000', // 시뮬레이션 데이터
      }));
      setTokens(tokenInfos);
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: string) => {
    return parseFloat(num).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">블록체인 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">블록체인 상태</h1>
              <p className="text-gray-600">네트워크 상태와 토큰 정보를 확인하세요</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
            >
              대시보드로 돌아가기
            </Link>
          </div>

          {/* Network Status */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">네트워크 상태</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">네트워크</p>
                <p className="font-medium text-gray-900">{status.network}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">연결 상태</p>
                <p className={`font-medium ${status.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {status.isConnected ? '연결됨' : '연결 안됨'}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">현재 블록</p>
                <p className="font-medium text-gray-900">{status.blockNumber.toLocaleString()}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">가스 가격</p>
                <p className="font-medium text-gray-900">{parseInt(status.gasPrice) / 1e9} Gwei</p>
              </div>
            </div>
          </div>

          {/* Token Contracts */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">토큰 컨트랙트 정보</h2>
            
            {tokens.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">발행된 토큰이 없습니다</h3>
                <p className="text-gray-600 mb-6">첫 번째 스테이블코인을 발행해보세요.</p>
                <Link
                  href="/create-token"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                >
                  토큰 발행하기
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {tokens.map((token) => (
                  <div key={token.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{token.name}</h3>
                        <p className="text-gray-600">심볼: {token.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">컨트랙트 주소</p>
                        <p className="font-mono text-sm text-gray-900">{formatAddress(token.contractAddress)}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">총 공급량</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatNumber(token.totalSupply)} {token.symbol}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">현재 잔액</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatNumber(token.balance)} {token.symbol}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            컨트랙트 보기
                          </button>
                          <button className="text-green-600 hover:text-green-800 font-medium text-sm">
                            거래 내역
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          마지막 업데이트: {new Date(status.lastUpdate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}