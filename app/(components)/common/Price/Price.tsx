"use client";

import React from 'react';
import styles from './Price.module.scss';

interface PriceProps {
    price: number;
    originalPrice?: number;
    discount?: number;
    size?: 'sm' | 'md' | 'lg';
    showUnit?: boolean;
    className?: string;
}

/**
 * Price 컴포넌트
 * 
 * @description 가격 정보를 표시하는 컴포넌트 (할인율, 가격, 원가)
 * @example
 * // 상품 카드용 (작은 사이즈)
 * <Price price={34000} discount={34} size="sm" />
 * 
 * // 상세 페이지용 (큰 사이즈, 원가 표시)
 * <Price price={104000} originalPrice={240000} discount={38} size="lg" showUnit />
 */
const Price: React.FC<PriceProps> = ({
    price,
    originalPrice,
    discount,
    size = 'md',
    showUnit = false,
    className,
}) => {
    return (
        <div className={`${styles.priceWrapper} ${styles[size]} ${className || ''}`}>
            {/* 원가 (취소선) */}
            {originalPrice && (
                <span className={styles.originalPrice}>
                    {originalPrice.toLocaleString()}원
                </span>
            )}

            {/* 할인율 + 가격 */}
            <div className={styles.priceRow}>
                {discount && discount > 0 && (
                    <span className={styles.discount}>{discount}%</span>
                )}
                <span className={styles.price}>{price.toLocaleString()}</span>
                {showUnit && <span className={styles.unit}>원</span>}
            </div>
        </div>
    );
};

export default Price;
