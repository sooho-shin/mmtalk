"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, NetworkStatus } from '@apollo/client';
import { motion } from 'framer-motion';
import { Header } from './(components)/layout';
import { ProductGrid } from './(components)/product';
import { GET_PRODUCTS, GetProductsData, GetProductsVariables, Product } from '@/graphql/queries/getProducts';
import styles from './page.module.scss';

const SCROLL_POSITION_KEY = 'products_scroll_position';
const PAGE_KEY = 'products_current_page';

// 컨테이너 애니메이션
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

export default function Home() {
    const observerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isRestoringScroll = useRef(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [totalPage, setTotalPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const { data, loading, error, networkStatus } = useQuery<GetProductsData, GetProductsVariables>(
        GET_PRODUCTS,
        {
            variables: { limit: 20, page: currentPage },
            notifyOnNetworkStatusChange: true,
        }
    );

    // 새 데이터가 오면 상품 목록에 추가
    useEffect(() => {
        if (data?.products) {
            const newProducts = data.products.products;
            setTotalPage(data.products.meta.totalPage);

            if (currentPage === 1) {
                setAllProducts(newProducts);
            } else {
                setAllProducts(prev => {
                    // 중복 제거
                    const existingIds = new Set(prev.map(p => p.productNo));
                    const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.productNo));
                    return [...prev, ...uniqueNewProducts];
                });
            }
            setIsFetchingMore(false);
        }
    }, [data, currentPage]);

    const hasMore = currentPage < totalPage;
    const isLoadingMore = networkStatus === NetworkStatus.fetchMore || isFetchingMore;

    // API 응답을 컴포넌트 props 형식으로 변환
    const transformedProducts = allProducts.map(product => ({
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
        discount: product.immediateDiscountAmt > 0
            ? Math.round((product.immediateDiscountAmt / product.salePrice) * 100)
            : undefined,
    }));

    // 다음 페이지 로드
    const loadMore = useCallback(() => {
        if (isFetchingMore || !hasMore || loading) return;

        setIsFetchingMore(true);
        setCurrentPage(prev => prev + 1);
    }, [isFetchingMore, hasMore, loading]);

    // 무한스크롤: IntersectionObserver로 하단 감지
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !isFetchingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, isFetchingMore, loadMore]);

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
        if (allProducts.length > 0 && !loading) {
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
    }, [allProducts.length, loading]);

    // 초기 로딩 상태
    if (loading && allProducts.length === 0) {
        return (
            <div className={styles.container}>
                <Header title="쇼핑" />
                <main className={styles.main}>
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Header title="쇼핑" />
                <main className={styles.main}>
                    <div className={styles.error}>오류가 발생했습니다: {error.message}</div>
                </main>
            </div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            className={styles.container}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <Header title="쇼핑" />

            <main className={styles.main}>
                <ProductGrid products={transformedProducts} />

                {/* 무한스크롤 트리거 영역 */}
                <div ref={observerRef} className={styles.loadingTrigger}>
                    {isLoadingMore && (
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
        </motion.div>
    );
}
