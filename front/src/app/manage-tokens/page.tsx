'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface StableCoin {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  maxSupply: string;
  contractAddress: string;
  isActive: boolean;
  mintingEnabled: boolean;
  burningEnabled: boolean;
  createdAt: string;
}

export default function ManageTokensPage() {
  const [tokens, setTokens] = useState<StableCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const data = await apiClient.getMyStableCoins();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMinting = async (tokenId: string) => {
    try {
      await apiClient.toggleMinting(tokenId);
      fetchTokens(); // 토큰 목록 새로고침
    } catch (error) {
      console.error('Error toggling minting:', error);
      alert('민팅 상태 변경에 실패했습니다.');
    }
  };

  const toggleBurning = async (tokenId: string) => {
    try {
      await apiClient.toggleBurning(tokenId);
      fetchTokens(); // 토큰 목록 새로고침
    } catch (error) {
      console.error('Error toggling burning:', error);
      alert('버닝 상태 변경에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">토큰 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">토큰 관리</h1>
              <p className="text-gray-600">발행한 스테이블코인을 관리하세요</p>
            </div>
            <Link
              href="/create-token"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
            >
              새 토큰 발행
            </Link>
          </div>
          
          {tokens.length === 0 ? (
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
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
            <div className="grid gap-6">
              {tokens.map((token) => (
                <div key={token.id} className="bg-white rounded-lg shadow-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{token.name}</h3>
                      <p className="text-gray-600">심볼: {token.symbol}</p>
                      <p className="text-sm text-gray-500">컨트랙트: {token.contractAddress}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        token.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {token.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">소수점 자릿수</p>
                      <p className="font-medium">{token.decimals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">최대 공급량</p>
                      <p className="font-medium">{token.maxSupply}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => toggleMinting(token.id)}
                      className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
                        token.mintingEnabled
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {token.mintingEnabled ? '민팅 비활성화' : '민팅 활성화'}
                    </button>
                    
                    <button
                      onClick={() => toggleBurning(token.id)}
                      className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
                        token.burningEnabled
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {token.burningEnabled ? '버닝 비활성화' : '버닝 활성화'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}