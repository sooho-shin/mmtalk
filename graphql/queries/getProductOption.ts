import { gql } from '@apollo/client';

// 상품 옵션 조회
export const GET_PRODUCT_OPTION = gql`
  query GetProductOption($productNo: Float!) {
    productOption(productNo: $productNo) {
      productNo
      productSalePrice
      immediateDiscountAmt
      selectType
      type
      labels
      flatOptions {
        optionNo
        label
        value
        addPrice
        buyPrice
        stockCnt
        saleCnt
        reservationStockCnt
        optionManagementCd
        isRequiredOption
        main
        saleType
        forcedSoldOut
        images {
          main
          url
        }
        children {
          optionNo
          label
          value
          addPrice
          buyPrice
          stockCnt
          saleCnt
          reservationStockCnt
          optionManagementCd
          isRequiredOption
          main
          saleType
          forcedSoldOut
          images {
            main
            url
          }
        }
      }
      multiLevelOptions {
        label
        value
        isRequiredOption
        children {
          optionNo
          label
          value
          addPrice
          buyPrice
          stockCnt
          saleCnt
          reservationStockCnt
          optionManagementCd
          isRequiredOption
          main
          saleType
          forcedSoldOut
          images {
            main
            url
          }
        }
      }
      inputs {
        inputNo
        inputLabel
        inputMatchingType
        required
      }
    }
  }
`;

// 타입 정의
export interface OptionImage {
  main: boolean;
  url: string;
}

export interface OptionItem {
  optionNo: number;
  label: string;
  value: string;
  addPrice: number;
  buyPrice: number;
  stockCnt: number;
  saleCnt: number;
  reservationStockCnt: number;
  optionManagementCd: string;
  isRequiredOption: boolean;
  main: boolean;
  saleType: string;
  forcedSoldOut: boolean;
  images?: OptionImage[];
  children?: OptionItem[];
}

export interface MultiLevelOption {
  label: string;
  value: string;
  isRequiredOption: boolean;
  children: OptionItem[];
}

export interface OptionInput {
  inputNo: number;
  inputLabel: string;
  inputMatchingType: string;
  required: boolean;
}

export interface ProductOptionInfo {
  productNo: number;
  productSalePrice: number;
  immediateDiscountAmt: number;
  selectType: string;
  type: string;
  labels: string[];
  flatOptions: OptionItem[];
  multiLevelOptions: MultiLevelOption[];
  inputs: OptionInput[];
}

export interface GetProductOptionData {
  productOption: ProductOptionInfo;
}

export interface GetProductOptionVariables {
  productNo: number;
}
