import { gql } from '@apollo/client';

// 상품 목록 조회 - deliveryConditionType 제거 (일부 상품에서 null 반환)
export const GET_PRODUCTS = gql`
  query GetProducts($limit: Int = 20, $page: Int = 1) {
    products(limit: $limit, page: $page) {
      products {
        productNo
        productName
        brandName
        salePrice
        immediateDiscountAmt
        immediateDiscountUnitType
        listImageUrls
        imageUrls
        reviewRating
        totalReviewCount
        isSoldOut
        likeCount
        saleCnt
        saleStatusType
      }
      meta {
        totalCount
        page
        limit
        totalPage
      }
    }
  }
`;

// Product 타입 정의
export interface Product {
    productNo: number;
    productName: string;
    brandName: string;
    salePrice: number;
    immediateDiscountAmt: number;
    immediateDiscountUnitType: string;
    listImageUrls: string[];
    imageUrls: string[];
    reviewRating: number;
    totalReviewCount: number;
    isSoldOut: boolean;
    likeCount: number;
    saleCnt: number;
    saleStatusType: string;
}

export interface ProductListMeta {
    totalCount: number;
    page: number;
    limit: number;
    totalPage: number;
}

export interface ProductListResponse {
    products: Product[];
    meta: ProductListMeta;
}

export interface GetProductsData {
    products: ProductListResponse;
}

export interface GetProductsVariables {
    limit?: number;
    page?: number;
}
