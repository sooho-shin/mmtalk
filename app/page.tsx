import { Product } from '@/graphql/queries/getProducts';
import HomeClient from './HomeClient';

// SSR로 초기 상품 데이터 fetch (REST API)
async function getInitialProducts() {
    try {
        const response = await fetch(
            'https://assignment.mobile.mmtalk.kr/api/shopping/products?limit=20&page=1',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Bearer 2G8QgQ5RCM',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.products) {
            throw new Error('No products data');
        }

        return result;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        // 빈 데이터 반환
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
