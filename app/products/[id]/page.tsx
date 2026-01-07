import ProductDetailClient from './ProductDetailClient';
import styles from './page.module.scss';

interface ProductDetailPageProps {
    params: { id: string };
}

// SSR로 상품 데이터 fetch
async function getProduct(productNo: number) {
    try {
        const response = await fetch(
            `https://assignment.mobile.mmtalk.kr/api/shopping/products/${productNo}`,
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
        return result;
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
