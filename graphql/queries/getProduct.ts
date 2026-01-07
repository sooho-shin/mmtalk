import { gql } from '@apollo/client';

// 단일 상품 조회
export const GET_PRODUCT = gql`
  query GetProduct($productNo: Int!) {
    product(productNo: $productNo) {
      productNo
      productName
      brandName
      salePrice
      immediateDiscountAmt
      immediateDiscountUnitType
      additionDiscountAmt
      additionDiscountUnitType
      couponDiscountAmt
      maxCouponAmt
      imageUrls
      listImageUrls
      reviewRating
      totalReviewCount
      deliveryConditionType
      isSoldOut
      isLive
      liked
      likeCount
      saleCnt
      saleStatusType
      stockCnt
      mainStockCnt
      optionValues
      registerYmdt
      saleStartYmdt
      saleEndYmdt
      displayCategoryNos
      enableCoupons
      frontDisplayYn
      accumulationInfo {
        amount
        rewardRateOfMemberBenefit
        rewardRateOfProduct
      }
      hasCoupons {
        brand
        category
        event
        partner
        product
      }
    }
  }
`;

// Product 상세 타입 정의
export interface AccumulationInfo {
  amount: number;
  rewardRateOfMemberBenefit: number;
  rewardRateOfProduct: number;
}

export interface HasCoupons {
  brand: boolean;
  category: boolean;
  event: boolean;
  partner: boolean;
  product: boolean;
}

export interface ProductDetail {
  productNo: number;
  productName: string;
  brandName: string;
  salePrice: number;
  immediateDiscountAmt: number;
  immediateDiscountUnitType: string;
  additionDiscountAmt: number;
  additionDiscountUnitType: string;
  couponDiscountAmt: number;
  maxCouponAmt: number;
  imageUrls: string[];
  listImageUrls: string[];
  reviewRating: number;
  totalReviewCount: number;
  deliveryConditionType: string;
  isSoldOut: boolean;
  isLive: boolean;
  liked: boolean;
  likeCount: number;
  saleCnt: number;
  saleStatusType: string;
  stockCnt: number;
  mainStockCnt: number;
  optionValues: string;
  registerYmdt: string;
  saleStartYmdt: string;
  saleEndYmdt: string;
  displayCategoryNos: string;
  enableCoupons: boolean;
  frontDisplayYn: boolean;
  accumulationInfo: AccumulationInfo;
  hasCoupons: HasCoupons;
}

export interface GetProductData {
  product: ProductDetail;
}

export interface GetProductVariables {
  productNo: number;
}
