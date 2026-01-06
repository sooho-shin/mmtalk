"use client";

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import styles from './ProductDetail.module.scss';

// 예시 GraphQL 쿼리 - 실제 프로젝트에 맞게 수정해야 합니다.
const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      imageUrl
    }
  }
`;

const ProductDetail = () => {
  const params = useParams();
  const { id } = params;

  const { loading, error, data } = useQuery(GET_PRODUCT_DETAIL, {
    variables: { id },
  });

  if (loading) return <p>상품 정보를 불러오는 중...</p>;
  if (error) return <p>오류 발생: {error.message}</p>;
  if (!data.product) return <p>상품을 찾을 수 없습니다.</p>;

  const { name, description, price, imageUrl } = data.product;

  return (
    <div className={styles.container}>
      <img src={imageUrl || '/next.svg'} alt={name} className={styles.image} />
      <div className={styles.info}>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.price}>₩{price.toLocaleString()}</p>
        <p className={styles.description}>{description}</p>
        <button className={styles.addToCartButton}>장바구니 담기</button>
      </div>
    </div>
  );
};

export default ProductDetail;
