import { GET_PRODUCT, GetProductData } from '@/graphql/queries/getProduct';
import { fetchGraphQL } from '@/utils/graphql';
import ProductDetailClient from './ProductDetailClient';
import styles from './page.module.scss';
import { print } from 'graphql';

interface ProductDetailPageProps {
    params: { id: string };
}

// SSR로 상품 데이터 fetch (GraphQL)
async function getProduct(productNo: number) {
    try {
        const data = await fetchGraphQL<GetProductData>(print(GET_PRODUCT), {
            productNo
        });

        if (!data?.product) {
            throw new Error('No product data');
        }

        return data.product;
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
