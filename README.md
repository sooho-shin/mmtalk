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
- 상품 그리드 뷰
- 무한 스크롤 (IntersectionObserver)
- 스크롤 위치 복원 (sessionStorage)
- SSR 초기 데이터 로딩

### 2. 상품 상세 페이지
- 상품 정보 표시
- 옵션 선택 바텀시트
- 다양한 옵션 타입 지원

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
      hostname: 'mmtalk.cdn-nhncommerce.com',
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

#### 3. 이미지 캐싱의 장점

- ✅ **자동 최적화**: WebP 등 최신 포맷으로 자동 변환
- ✅ **브라우저 캐싱**: 이미지 재방문 시 캐시에서 로드
- ✅ **Lazy Loading**: 화면에 보이는 이미지만 로드
- ✅ **Priority Loading**: 중요 이미지 우선 로드
- ✅ **반응형 크기**: `sizes` 속성으로 뷰포트에 맞는 크기 제공

---

## 🔄 SSR (서버 사이드 렌더링)

### 데이터 페칭 전략

| 페이지 | 초기 데이터 | 추가 데이터 |
|-------|-----------|-----------|
| 메인 (상품 목록) | SSR (GraphQL) | Apollo Client (무한 스크롤) |
| 상품 상세 | SSR (GraphQL) | Apollo Client (옵션 데이터) |

### 구현 방식

```
app/page.tsx (서버 컴포넌트)
    ↓ SSR fetch (GraphQL)
app/HomeClient.tsx (클라이언트 컴포넌트)
    ↓ props로 initialProducts 전달
    ↓ Apollo useQuery로 추가 페이지 로드
```

---

## 🎯 상품 옵션 선택 로직

상품 옵션은 API 응답의 `type` 필드에 따라 다르게 처리됩니다.

### 옵션 타입별 처리

#### 1. `COMBINATION` + 2단계 옵션 (Size → Color)

- **구조**: `multiLevelOptions[].value` = Size, `multiLevelOptions[].children[].value` = Color
- **동작**: 
  - 첫 번째 드롭다운: Size 선택
  - 두 번째 드롭다운: Color 선택
  - **둘 다 선택해야** 옵션 리스트에 추가

```json
{
  "type": "COMBINATION",
  "multiLevelOptions": [
    {
      "value": "M",
      "children": [
        { "optionNo": 1, "value": "Black", "buyPrice": 33000 },
        { "optionNo": 2, "value": "White", "buyPrice": 33000 }
      ]
    }
  ]
}
```

#### 2. `COMBINATION` + 1단계 옵션 (Size만)

- **구조**: `multiLevelOptions[].value` = 옵션명, `children = null`
- **동작**:
  - 첫 번째 드롭다운만 표시
  - **선택 즉시** 옵션 리스트에 추가
  - 가격 정보는 `flatOptions`에서 조회

```json
{
  "type": "COMBINATION",
  "multiLevelOptions": [
    { "value": "핏유어코어(블랙)_M", "children": null },
    { "value": "핏유어코어(블랙)_L", "children": null }
  ],
  "flatOptions": [
    { "optionNo": 1, "value": "핏유어코어(블랙)_M", "buyPrice": 33000, "addPrice": 0 }
  ]
}
```

#### 3. `REQUIRED` 타입 (필수옵션 + 선택옵션)

- **구조**: `multiLevelOptions[0].isRequiredOption = true` (필수), `multiLevelOptions[1].isRequiredOption = false` (선택)
- **동작**:
  - 첫 번째 드롭다운: 필수옵션 (선택 즉시 추가)
  - 두 번째 드롭다운: 선택옵션
  - **필수옵션 미선택 시** 선택옵션 드롭다운 비활성화
    - 문구: "필수옵션 선택 시 구매 가능합니다"
    - 배경색: 회색
    - 클릭 불가

```json
{
  "type": "REQUIRED",
  "multiLevelOptions": [
    {
      "isRequiredOption": true,
      "children": [{ "optionNo": 1, "value": "산후복대 L" }]
    },
    {
      "isRequiredOption": false,
      "children": [{ "optionNo": 2, "value": "맘바디 여성청결제", "addPrice": -9000 }]
    }
  ]
}
```

### 추가 가격 (addPrice) 표시

옵션에 추가 가격이 있는 경우 괄호 안에 표시됩니다:

- 양수: `산후복대 L (+1,000원)`
- 음수: `맘바디 여성청결제 (-9,000원)`
- 0원: 표시하지 않음

### 옵션 처리 흐름도

```
API 응답 수신
    ↓
optionType 확인 (COMBINATION / REQUIRED)
    ↓
hasChildren 확인 (2단계 / 1단계)
    ↓
┌─────────────────────────────────────────┐
│ COMBINATION + hasChildren               │
│   → Size 선택 → Color 선택 → 추가       │
├─────────────────────────────────────────┤
│ COMBINATION + !hasChildren              │
│   → 옵션 선택 → 즉시 추가               │
├─────────────────────────────────────────┤
│ REQUIRED                                │
│   → 필수옵션 선택 → 선택옵션 활성화     │
│   → 각각 선택 시 즉시 추가              │
└─────────────────────────────────────────┘
```

---

## 📁 프로젝트 구조

```
mmtalk/
├── app/
│   ├── (components)/
│   │   ├── layout/Header/
│   │   └── product/
│   │       ├── ProductCard/
│   │       └── ProductGrid/
│   ├── (lib)/
│   │   ├── apollo-provider.tsx
│   │   └── apollo-client.ts
│   ├── products/[id]/
│   │   ├── page.tsx              # 서버 컴포넌트 (SSR)
│   │   ├── ProductDetailClient.tsx # 클라이언트 컴포넌트
│   │   └── page.module.scss
│   ├── page.tsx                  # 메인 페이지 (서버 컴포넌트)
│   ├── HomeClient.tsx            # 메인 클라이언트 컴포넌트
│   └── globals.scss
├── graphql/
│   └── queries/
│       ├── getProducts.ts
│       ├── getProduct.ts
│       └── getProductOption.ts
├── public/
│   └── images/                   # 아이콘 SVG 파일
├── styles/
│   ├── _variables.scss
│   └── _mixins.scss
└── next.config.mjs               # 이미지 도메인 설정
```

---

## 🛠️ 기술 스택

- **Next.js 14**: App Router, SSR, 이미지 최적화
- **React 18**: 클라이언트 컴포넌트
- **TypeScript**: 타입 안전성
- **Apollo Client**: GraphQL 클라이언트, 캐싱
- **GraphQL**: API 쿼리
- **SCSS Modules**: 컴포넌트별 스타일링
- **Framer Motion**: 애니메이션

---

## 📝 API 정보

| 용도 | 엔드포인트 | 인증 |
|-----|-----------|-----|
| GraphQL | `https://assignment.mobile.mmtalk.kr/graphql` | Bearer Token |
| REST (SSR) | `https://assignment.mobile.mmtalk.kr/api/shopping/products` | Bearer Token |

인증 토큰: `Bearer 2G8QgQ5RCM`
