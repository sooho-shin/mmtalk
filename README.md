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

공통 컴포넌트는 `app/(components)/common/` 디렉토리에서 관리됩니다.

### 왜 공통 컴포넌트로 분리했나요?

| 컴포넌트 | 분리 이유 |
|---------|----------|
| **Badge** | 무료배송, 쿠폰할인 등 다양한 배지가 여러 곳에서 사용됨 |
| **Rating** | 별점/리뷰/찜수가 상품 카드, 상세 페이지에서 중복 |
| **Price** | 할인율+가격 표시가 상품 카드, 상세 페이지에서 동일 패턴 |
| **Dropdown** | 옵션 선택 드롭다운이 확장될 가능성 높음 |
| **Button** | 버튼 스타일 통일 및 일관성 유지 |

### 사용 방법

```tsx
import { Badge, Rating, Price, Dropdown, Button } from '@/app/(components)/common';

// Badge
<Badge variant="delivery">무료배송</Badge>
<Badge variant="coupon">쿠폰할인</Badge>

// Rating
<Rating rating={4.8} reviewCount={1234} likeCount={567} />
<Rating rating={4.8} reviewCount={86} showReviewLabel /> // 상세 페이지용

// Price
<Price price={34000} discount={34} size="sm" />
<Price price={104000} originalPrice={240000} discount={38} size="lg" showUnit />

// Dropdown
<Dropdown
    options={[{ value: 'M', label: 'M' }]}
    value={selectedSize}
    placeholder="사이즈 선택"
    isOpen={isOpen}
    onToggle={() => setIsOpen(!isOpen)}
    onSelect={(opt) => setSelectedSize(opt.value)}
/>

// Button
<Button variant="primary" size="lg" fullWidth>바로 구매하기</Button>
```

### 컴포넌트 상세

#### Badge
| Prop | 타입 | 기본값 | 설명 |
|------|-----|-------|------|
| `children` | `ReactNode` | - | 배지 텍스트 |
| `variant` | `'delivery' \| 'coupon' \| 'default'` | `'default'` | 배지 스타일 |

#### Rating
| Prop | 타입 | 기본값 | 설명 |
|------|-----|-------|------|
| `rating` | `number` | - | 별점 점수 |
| `reviewCount` | `number` | - | 리뷰 개수 |
| `likeCount` | `number` | - | 찜 개수 |
| `showReviewLabel` | `boolean` | `false` | "리뷰 N개" 형식 표시 |

#### Price
| Prop | 타입 | 기본값 | 설명 |
|------|-----|-------|------|
| `price` | `number` | - | 현재 가격 |
| `originalPrice` | `number` | - | 원가 (취소선) |
| `discount` | `number` | - | 할인율 (%) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `showUnit` | `boolean` | `false` | "원" 표시 여부 |

#### Dropdown
| Prop | 타입 | 기본값 | 설명 |
|------|-----|-------|------|
| `options` | `DropdownOption[]` | - | 옵션 목록 |
| `value` | `string \| null` | - | 선택된 값 |
| `placeholder` | `string` | `'옵션을 선택하세요'` | 플레이스홀더 |
| `isOpen` | `boolean` | - | 열림 상태 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `onToggle` | `() => void` | - | 토글 핸들러 |
| `onSelect` | `(option) => void` | - | 선택 핸들러 |

#### Button
| Prop | 타입 | 기본값 | 설명 |
|------|-----|-------|------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | 버튼 스타일 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |

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
│   │   ├── common/               # 🆕 공통 컴포넌트
│   │   │   ├── Badge/            # 배지 (무료배송, 쿠폰할인)
│   │   │   ├── Rating/           # 별점/리뷰/찜수
│   │   │   ├── Price/            # 가격 표시
│   │   │   ├── Dropdown/         # 드롭다운
│   │   │   ├── Button/           # 버튼
│   │   │   └── index.ts          # 통합 export
│   │   ├── layout/Header/        # 공통 헤더
│   │   └── product/
│   │       ├── ProductCard/      # 상품 카드
│   │       └── ProductGrid/      # 상품 그리드
│   ├── (lib)/
│   │   ├── apollo-provider.tsx   # Apollo Provider
│   │   └── apollo-client.ts      # Apollo Client 설정
│   ├── products/[id]/
│   │   ├── page.tsx               # 서버 컴포넌트 (SSR)
│   │   ├── ProductDetailClient.tsx
│   │   └── page.module.scss
│   ├── page.tsx                   # 메인 페이지
│   ├── HomeClient.tsx
│   └── globals.scss
├── graphql/
│   └── queries/
├── public/
│   └── images/
├── stores/
│   └── cartStore.ts              # Zustand 장바구니
├── styles/
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── _reset.scss
└── next.config.mjs
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

