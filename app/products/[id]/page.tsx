import ProductDetailClient from './ProductDetailClient';
import styles from './page.module.scss';

interface ProductDetailPageProps {
    params: { id: string };
}

const GRAPHQL_ENDPOINT = 'https://assignment.mobile.mmtalk.kr/graphql';

// SSR로 상품 데이터 fetch (GraphQL)
async function getProduct(productNo: number) {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer 2G8QgQ5RCM',
            },
            body: JSON.stringify({
                query: `
                    query GetProduct($productNo: Int!) {
                        product(productNo: $productNo) {
                            productNo
                            productName
                            brandName
                            salePrice
                            immediateDiscountAmt
                            immediateDiscountUnitType
                            imageUrls
                            listImageUrls
                            reviewRating
                            totalReviewCount
                            isSoldOut
                            likeCount
                            saleCnt
                            saleStatusType
                        }
                    }
                `,
                variables: { productNo },
            }),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            throw new Error('GraphQL error');
        }

        if (!result.data?.product) {
            throw new Error('No product data');
        }

        return result.data.product;
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
    }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const productNo = parseInt(params.id);
    const product = await getProduct(productNo);

    if (!product) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>상품을 찾을 수 없습니다.</div>
            </div>
        );
    }

    return <ProductDetailClient product={product} />;
}
