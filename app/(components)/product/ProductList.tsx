"use client";

import { useQuery, gql } from '@apollo/client';
import ProductCard from './ProductCard';
import styles from './ProductList.module.scss';

// 예시 GraphQL 쿼리 - 실제 프로젝트에 맞게 수정해야 합니다.
const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
      imageUrl
    }
  }
`;

const ProductList = () => {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) return <p>상품 목록을 불러오는 중...</p>;
  if (error) return <p>오류 발생: {error.message}</p>;

  return (
    <div className={styles.container}>
      <h2>최신 상품</h2>
      <div className={styles.grid}>
        {data.products.map((product: any) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl || '/next.svg'} // Fallback image
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
