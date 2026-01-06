# MMTalk Project

MMTalk 프로젝트는 Next.js 14 (App Router), Apollo Client, GraphQL, SCSS를 사용하여 구축된 애플리케이션입니다.

## 🚀 시작하기

### 1. 의존성 설치

프로젝트 의존성을 설치합니다:

```bash
yarn install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정합니다:

```
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://assignment.mobile.mmtalk.kr/graphql
NEXT_PUBLIC_MMTALK_API_TOKEN=2G8QgQ5RCM
```

- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: GraphQL 서버의 엔드포인트 URL입니다.
- `NEXT_PUBLIC_MMTALK_API_TOKEN`: GraphQL 요청에 사용될 인증 Bearer 토큰입니다.

### 3. 개발 서버 실행

개발 서버를 시작합니다:

```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

프로젝트의 주요 디렉토리 및 파일 구조는 다음과 같습니다:

```
mmtalk/
├── app/                      # Next.js App Router (라우팅 및 페이지)
│   ├── (components)/         # 라우팅에 포함되지 않는 공용 UI 컴포넌트
│   │   ├── layout/           # 레이아웃 관련 컴포넌트 (예: Header)
│   │   └── ui/               # 범용 UI 컴포넌트 (예: Button)
│   ├── (lib)/                # 클라이언트 측 라이브러리 및 설정 (예: Apollo Client)
│   │   ├── apollo-provider.tsx # Apollo Client Provider
│   │   └── apollo-client.ts    # Apollo Client 인스턴스
│   ├── api/                  # Next.js API Routes (백엔드 로직)
│   ├── globals.scss          # 전역 스타일시트
│   ├── layout.tsx            # 루트 레이아웃 컴포넌트
│   └── page.tsx              # 메인 페이지 컴포넌트
├── graphql/                  # GraphQL 관련 파일
│   ├── queries/              # GraphQL 쿼리 정의
│   ├── mutations/            # GraphQL 뮤테이션 정의
│   └── fragments/            # GraphQL 프래그먼트 정의 (재사용 가능한 쿼리 조각)
├── public/                   # 정적 파일 (이미지, 폰트 등)
├── styles/                   # 전역 SCSS 스타일 정의
│   ├── _variables.scss       # SCSS 변수 파일
│   └── _mixins.scss          # SCSS 믹스인 파일
├── .env.local                # 로컬 환경 변수
├── next.config.mjs           # Next.js 설정 파일
├── package.json              # 프로젝트 의존성 및 스크립트
├── tsconfig.json             # TypeScript 설정 파일
└── yarn.lock                 # Yarn 잠금 파일
```

## 🛠️ 주요 기술 스택

-   **Next.js 14**: React 프레임워크 (App Router 사용)
-   **React**: UI 라이브러리
-   **TypeScript**: 정적 타입 언어
-   **Apollo Client**: GraphQL 클라이언트
-   **GraphQL**: API 쿼리 언어
-   **SCSS**: CSS 전처리기
