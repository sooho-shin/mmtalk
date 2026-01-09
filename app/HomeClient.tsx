"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Header } from './(components)/layout';
import { ProductGrid } from './(components)/product';
import { GET_PRODUCTS, GetProductsData, GetProductsVariables, Product } from '@/graphql/queries/getProducts';
import styles from './page.module.scss';

const SCROLL_POSITION_KEY = 'products_scroll_position';

interface TransformedProduct {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    likeCount: number;
    discount?: number;
}

interface HomeClientProps {
    initialProducts: Product[];
    initialMeta: {
        totalCount: number;
        page: number;
        limit: number;
        totalPage: number;
    };
}

export default function HomeClient({ initialProducts, initialMeta }: HomeClientProps) {

    const containerRef = useRef<HTMLDivElement>(null);
    const isRestoringScroll = useRef(false);
    const lastFetchedPage = useRef(initialMeta.page); // 마지막으로 fetch한 페이지

    // 상태 관리 (SSR 데이터로 시작)
    const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
    const [currentPage, setCurrentPage] = useState(initialMeta.page);
    const [totalPage] = useState(initialMeta.totalPage);
    const [isFetching, setIsFetching] = useState(false);

    // useLazyQuery
    const [fetchProducts, { data, loading }] = useLazyQuery<GetProductsData, GetProductsVariables>(
        GET_PRODUCTS,
        { fetchPolicy: 'network-only' }
    );

    // 데이터 도착 시 useEffect로 처리 (onCompleted 대신)
    useEffect(() => {
        if (data?.products) {
            const newProducts = data.products.products;
            // 중복 제거하여 추가
            setAllProducts(prev => {
                const existingIds = new Set(prev.map(p => p.productNo));
                const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.productNo));
                return [...prev, ...uniqueNewProducts];
            });
            setCurrentPage(data.products.meta.page);
            setIsFetching(false);
        }
    }, [data]);

    const hasMore = currentPage < totalPage;

    // API 응답을 컴포넌트 props 형식으로 변환 (메모이제이션 추가)
    const transformedProducts: TransformedProduct[] = useMemo(() => {
        return allProducts.map(product => ({
            id: String(product.productNo),
            name: product.productName,
            brand: product.brandName,
            price: product.salePrice - product.immediateDiscountAmt,
            originalPrice: product.immediateDiscountAmt > 0 ? product.salePrice : undefined,
            imageUrl: product.listImageUrls[0]?.startsWith('//')
                ? `https:${product.listImageUrls[0]}`
                : product.listImageUrls[0],
            rating: product.reviewRating,
            reviewCount: product.totalReviewCount,
            likeCount: product.likeCount,
            discount: product.immediateDiscountAmt > 0
                ? Math.round((product.immediateDiscountAmt / product.salePrice) * 100)
                : undefined,
        }));
    }, [allProducts]);


    // 다음 페이지 로드
    const handleLoadMore = useCallback(() => {
        const nextPage = lastFetchedPage.current + 1;

        // 이미 fetching 중이거나, 더 이상 페이지가 없거나, 이미 해당 페이지를 요청했으면 스킵
        if (isFetching || loading || nextPage > totalPage) return;

        setIsFetching(true);
        lastFetchedPage.current = nextPage; // 즉시 업데이트 (중복 방지)

        fetchProducts({
            variables: { page: nextPage, limit: 20 }
        });
    }, [fetchProducts, isFetching, loading, totalPage]);

    // 스크롤 위치 저장
    useEffect(() => {
        const handleScroll = () => {
            if (!isRestoringScroll.current) {
                sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 스크롤 위치 복원
    useEffect(() => {
        if (allProducts.length > 0) {
            const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
            if (savedPosition) {
                isRestoringScroll.current = true;
                requestAnimationFrame(() => {
                    window.scrollTo(0, parseInt(savedPosition));
                    setTimeout(() => {
                        isRestoringScroll.current = false;
                    }, 100);
                });
            }
        }
    }, [allProducts.length]);

    return (
        <div
            ref={containerRef}
            className={styles.container}
        >
            <Header title="쇼핑" />

            <main className={styles.main}>
                <ProductGrid
                    products={transformedProducts}
                    loadMore={handleLoadMore}
                />

                {/* 무한스크롤 로딩/종료 영역 */}
                <div className={styles.loadingTrigger}>
                    {(isFetching || loading) && (
                        <div className={styles.loadingMore}>
                            <div className={styles.spinner} />
                        </div>
                    )}
                    {!hasMore && allProducts.length > 0 && (
                        <div className={styles.endMessage}>
                            모든 상품을 불러왔습니다 ({allProducts.length}개)
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}


