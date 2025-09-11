'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function CreateTokenPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 18,
    maxSupply: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiClient.createStableCoin(formData);
      alert('스테이블코인이 성공적으로 발행되었습니다!');
      router.push('/manage-tokens');
    } catch (error) {
      console.error('Token creation error:', error);
      alert('토큰 발행에 실패했습니다. 입력 정보를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">스테이블코인 발행</h1>
              <p className="text-gray-600">새로운 스테이블코인을 발행하세요</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  토큰 이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: USD Stable Coin"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
                  토큰 심볼
                </label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: USDC"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="decimals" className="block text-sm font-medium text-gray-700 mb-2">
                  소수점 자릿수
                </label>
                <input
                  type="number"
                  id="decimals"
                  name="decimals"
                  value={formData.decimals}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="18"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="maxSupply" className="block text-sm font-medium text-gray-700 mb-2">
                  최대 공급량
                </label>
                <input
                  type="text"
                  id="maxSupply"
                  name="maxSupply"
                  value={formData.maxSupply}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 1000000000000000000000000"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  최대 공급량을 입력하세요 (wei 단위)
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                >
                  {isLoading ? '발행 중...' : '토큰 발행'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/manage-tokens')}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}