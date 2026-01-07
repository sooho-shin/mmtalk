import { Product } from '@/graphql/queries/getProducts';
import HomeClient from './HomeClient';

const GRAPHQL_ENDPOINT = 'https://assignment.mobile.mmtalk.kr/graphql';

// SSR로 초기 상품 데이터 fetch (GraphQL)
async function getInitialProducts() {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer 2G8QgQ5RCM',
            },
            body: JSON.stringify({
                query: `
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
                `,
                variables: { limit: 20, page: 1 },
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

        if (!result.data?.products) {
            throw new Error('No products data');
        }

        return result.data.products;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return {
            products: [],
            meta: {
                totalCount: 0,
                page: 1,
                limit: 20,
                totalPage: 1,
            }
        };
    }
}

export default async function Home() {
    const productsData = await getInitialProducts();

    return (
        <HomeClient
            initialProducts={productsData.products}
            initialMeta={productsData.meta}
        />
    );
}
