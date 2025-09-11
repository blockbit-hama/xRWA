import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            xStables
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            디지털 증권 토큰 발행 플랫폼 - DS 프로토콜 기반 스테이블코인 발행 서비스
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">스테이블코인 발행</h3>
              <p className="text-gray-600 mb-4">규제 준수를 위한 KYC/AML 검증과 함께 안전한 스테이블코인을 발행하세요.</p>
              <Link href="/create-token" className="text-blue-600 hover:text-blue-800 font-medium">
                발행하기 →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">토큰 관리</h3>
              <p className="text-gray-600 mb-4">발행한 토큰의 민팅, 버닝, 전송 제한 등을 실시간으로 관리할 수 있습니다.</p>
              <Link href="/manage-tokens" className="text-green-600 hover:text-green-800 font-medium">
                관리하기 →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">블록체인 연동</h3>
              <p className="text-gray-600 mb-4">이더리움 네트워크와 완전히 연동되어 투명하고 안전한 거래를 보장합니다.</p>
              <Link href="/blockchain" className="text-purple-600 hover:text-purple-800 font-medium">
                확인하기 →
              </Link>
            </div>
          </div>
          
          <div className="mt-16">
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}