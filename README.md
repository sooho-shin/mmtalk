# MMTalk Shopping App

MMTalk 프로젝트는 Next.js 14 (App Router), Apollo Client, GraphQL, SCSS를 사용하여 구축된 쇼핑 애플리케이션입니다.

## 🚀 시작하기

### 1. 의존성 설치

```bash
yarn install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정합니다:

```
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://assignment.mobile.mmtalk.kr/graphql
NEXT_PUBLIC_MMTALK_API_TOKEN=2G8QgQ5RCM
```

### 3. 개발 서버 실행

```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

---

## 📱 주요 기능

### 1. 상품 목록 페이지 (메인)
- 상품 그리드 뷰 (2열)
- 무한 스크롤 (IntersectionObserver + Apollo `useLazyQuery`)
- 스크롤 위치 복원 (sessionStorage)
- SSR 초기 데이터 로딩 (GraphQL)

### 2. 상품 카드 (ProductCard)
- **이미지**: 1:1 비율, 딤 오버레이, 좋아요 아이콘
- **정보 영역**: 브랜드명, 상품명 (2줄 말줄임), 할인율 + 가격
- **배지**: 무료배송, 쿠폰할인
- **별점/찜수**: 별점 그룹 + 찜수 그룹 (gap 8px)

### 3. 상품 상세 페이지
- **브랜드 섹션**: 링크 + 화살표 아이콘, border-bottom 구분선
- **상품 정보**: 상품명, 별점 + 리뷰 개수, 가격
- **바텀 버튼**: Safe Area 지원 (아이폰)
- 옵션 선택 바텀시트

### 4. 장바구니 (Zustand)
- **추후 확장을 위해** 장바구니 상태 관리 스토어 구현
- `localStorage` 영속화 (persist)
- 현재 UI는 미연결, 스토어만 준비됨

```tsx
// 사용 예시
import { useCartStore } from '@/stores/cartStore';

const { items, addItem, removeItem, getTotalCount } = useCartStore();
```

---

## 🎨 스타일 시스템

### CSS 구조

| 파일 | 역할 |
|-----|------|
| `styles/_variables.scss` | 색상, 폰트, 간격 등 디자인 토큰 |
| `styles/_mixins.scss` | 재사용 가능한 SCSS 믹스인 |
| `styles/_reset.scss` | 전역 CSS Reset (버튼, 인풋 등) |
| `app/globals.scss` | 전역 스타일, Reset 임포트 |

### 주요 색상 변수

```scss
$color-gray-500: #999;
$color-gray-600: #666565;
$color-gray-700: #484848;
$color-gray-800: #383838;
$color-mint: #4AC8C0;      // 버튼 색상
$color-red: #FF5553;       // 할인율
$color-purple-100: #FBF8FE; // 쿠폰 배지 배경
$color-purple-800: #A671D6; // 쿠폰 배지 텍스트
```

---

## 🖼️ 이미지 캐싱 (View Cache)

`next/image` 컴포넌트를 사용하여 이미지 최적화 및 캐싱을 구현했습니다.

### 적용된 내용

#### 1. Next.js 이미지 도메인 설정 (`next.config.mjs`)

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.cdn-nhncommerce.com', // 와일드카드로 모든 서브도메인 허용
      pathname: '/**',
    },
  ],
}
```

#### 2. 컴포넌트별 적용

| 컴포넌트 | 파일 | 적용 방식 |
|---------|------|----------|
| 상품 카드 | `ProductCard.tsx` | `<Image fill sizes="..." />` |
| 상품 상세 | `ProductDetailClient.tsx` | `<Image fill priority />` |

---

## 🔄 SSR (서버 사이드 렌더링)

### 데이터 페칭 전략

| 페이지 | 초기 데이터 | 추가 데이터 |
|-------|-----------|-----------| 
| 메인 (상품 목록) | SSR (GraphQL fetch) | Apollo `useLazyQuery` (무한 스크롤) |
| 상품 상세 | SSR (GraphQL fetch) | Apollo `useQuery` (옵션 데이터) |

### 구현 방식

```
app/page.tsx (서버 컴포넌트)
    ↓ SSR fetch (GraphQL POST)
    ↓ 첫 페이지 데이터 + 메타 정보
    ↓
app/HomeClient.tsx (클라이언트 컴포넌트)
    ↓ props로 initialProducts, initialMeta 전달
    ↓ 초기에는 /graphql 요청 없음 (SSR 데이터 사용)
    ↓ 스크롤 시 useLazyQuery로 추가 페이지 로드
```

---

## 🎯 상품 옵션 선택 로직

상품 옵션은 API 응답의 `type` 필드에 따라 다르게 처리됩니다.

### 옵션 타입별 처리

| 타입 | 설명 |
|-----|------|
| `COMBINATION` + 2단계 | Size → Color 순차 선택 |
| `COMBINATION` + 1단계 | 옵션 선택 즉시 추가 |
| `REQUIRED` | 필수옵션 + 선택옵션 |
| `DEFAULT` | 옵션 없음, 자동 선택 |

---

## 🧩 공통 컴포넌트

### Header 컴포넌트

| Prop | 값 | 설명 |
|------|---|------|
| `variant` | `'main'` | 메인 페이지: 타이틀, 메뉴, 검색, 장바구니 |
| `variant` | `'detail'` | 상세 페이지: 뒤로가기, 홈, 검색, 장바구니 |

```tsx
// 메인 페이지
<Header title="쇼핑" />

// 상세 페이지
<Header variant="detail" />
```

---

## 📁 프로젝트 구조

```
mmtalk/
├── app/
│   ├── (components)/
│   │   ├── layout/Header/       # 공통 헤더 (variant: main/detail)
│   │   └── product/
│   │       ├── ProductCard/     # 상품 카드 (이미지, 정보, 배지)
│   │       └── ProductGrid/     # 상품 그리드
│   ├── (lib)/
│   │   ├── apollo-provider.tsx  # Apollo Provider
│   │   └── apollo-client.ts     # Apollo Client 설정
│   ├── products/[id]/
│   │   ├── page.tsx              # 서버 컴포넌트 (SSR)
│   │   ├── ProductDetailClient.tsx # 클라이언트 컴포넌트
│   │   └── page.module.scss
│   ├── page.tsx                  # 메인 페이지 (서버 컴포넌트)
│   ├── HomeClient.tsx            # 메인 클라이언트 (useLazyQuery)
│   └── globals.scss
├── graphql/
│   └── queries/
│       ├── getProducts.ts        # 상품 목록 쿼리
│       ├── getProduct.ts         # 상품 상세 쿼리
│       └── getProductOption.ts   # 상품 옵션 쿼리
├── public/
│   └── images/                   # 아이콘 SVG 파일
│       ├── ic_star.svg           # 별점 아이콘
│       ├── ic_heart.svg          # 찜 아이콘
│       ├── ic_like.svg           # 좋아요 아이콘
│       ├── ic_arrow_down.svg     # 드롭다운 화살표
│       ├── ic_arrow_right.svg    # 오른쪽 화살표
│       └── ...
├── stores/
│   └── cartStore.ts              # 장바구니 상태 (Zustand + persist)
├── styles/
│   ├── _variables.scss           # SCSS 변수
│   ├── _mixins.scss              # SCSS 믹스인
│   └── _reset.scss               # 전역 CSS Reset
└── next.config.mjs               # Next.js 설정 (이미지 도메인)
```

---

## 🛠️ 기술 스택

- **Next.js 14**: App Router, SSR, 이미지 최적화
- **React 18**: 클라이언트 컴포넌트
- **TypeScript**: 타입 안전성
- **Apollo Client**: GraphQL 클라이언트 (`useLazyQuery`, 캐싱)
- **GraphQL**: API 쿼리
- **Zustand**: 경량 상태 관리 (장바구니, localStorage persist)
- **SCSS Modules**: 컴포넌트별 스타일링
- **Framer Motion**: 애니메이션

---

## ⚙️ 설정 파일

### next.config.mjs

```javascript
const nextConfig = {
  reactStrictMode: false, // 개발 시 중복 렌더링 방지
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'styles')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdn-nhncommerce.com', // 와일드카드
        pathname: '/**',
      },
    ],
  },
};
```

---

## 📝 API 정보

| 용도 | 엔드포인트 | 인증 |
|-----|-----------|-----|
| GraphQL | `https://assignment.mobile.mmtalk.kr/graphql` | Bearer Token |

인증 토큰: `Bearer 2G8QgQ5RCM`

