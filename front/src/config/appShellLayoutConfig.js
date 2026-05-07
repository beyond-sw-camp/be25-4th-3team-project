/**
 * 앱 기본 레이아웃에서 사용하는 고정 설정 모음입니다.
 *
 * - sidebarNav: 왼쪽 사이드바 메뉴 목록입니다.
 * - link 타입의 label은 AppShellHeader의 페이지 제목으로도 사용합니다.
 * - appFooterText: 앱 하단 footer에 표시할 문구입니다.
 */

export const sidebarNav = [
  { type: 'heading', label: '상품소싱', icon: 'sourcing', firstChildTo: '/app/sourcing/category' },
  { type: 'link', label: '카테고리 소싱', to: '/app/sourcing/category', parentLabel: '상품소싱' },
  {
    type: 'link',
    label: '소싱 사이트 연동 관리',
    to: '/app/sourcing/sites',
    parentLabel: '상품소싱',
  },
  {
    type: 'heading',
    label: '상품 관리',
    icon: 'products',
    firstChildTo: '/app/products/collected',
  },
  {
    type: 'link',
    label: '수집/등록 상품 관리',
    to: '/app/products/collected',
    parentLabel: '상품 관리',
  },
  { type: 'heading', label: '주문 관리', icon: 'orders', firstChildTo: '/app/orders/all' },
  { type: 'link', label: '전체 주문', to: '/app/orders/all', parentLabel: '주문 관리' },
  { type: 'link', label: '자동 주문 현황', to: '/app/orders/auto', parentLabel: '주문 관리' },
  { type: 'link', label: '취소/환불', to: '/app/orders/cancel-refund', parentLabel: '주문 관리' },
  { type: 'heading', label: '결제 관리', icon: 'payment', firstChildTo: '/app/payment/methods' },
  { type: 'link', label: '결제 수단 관리', to: '/app/payment/methods', parentLabel: '결제 관리' },
  { type: 'link', label: '결제 실패 내역', to: '/app/payment/failures', parentLabel: '결제 관리' },
  { type: 'heading', label: '수익 관리', icon: 'revenue', firstChildTo: '/app/revenue/monthly' },
  { type: 'link', label: '월별 수익', to: '/app/revenue/monthly', parentLabel: '수익 관리' },
  { type: 'link', label: '예상/실제 마진', to: '/app/revenue/margin', parentLabel: '수익 관리' },
  {
    type: 'heading',
    label: '설정',
    icon: 'settings',
    firstChildTo: '/app/settings/upload-markets',
  },
  {
    type: 'link',
    label: '상품 업로드/마켓 설정',
    to: '/app/settings/upload-markets',
    parentLabel: '설정',
  },
  {
    type: 'link',
    label: '제외/금지어 관리',
    to: '/app/settings/excluded-keywords',
    parentLabel: '설정',
  },
]

export const appFooterText =
  '개인 정보 처리 방침 | 사이트 이용 약관 | 쿠키 기본 설정 | © 2026, Autosource Web Services, All right reserved.'
