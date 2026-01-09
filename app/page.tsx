import { GET_PRODUCTS, GetProductsData } from '@/graphql/queries/getProducts';
import { fetchGraphQL } from '@/utils/graphql';
import HomeClient from './HomeClient';
import { print } from 'graphql';

// SSR로 초기 상품 데이터 fetch (GraphQL)
async function getInitialProducts() {
    try {
        const data = await fetchGraphQL<GetProductsData>(print(GET_PRODUCTS), {
            limit: 20,
            page: 1,
        });

        if (!data?.products) {
            throw new Error('No products data');
        }

        return data.products;
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
