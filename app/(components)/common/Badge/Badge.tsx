"use client";

import React from 'react';
import styles from './Badge.module.scss';

export type BadgeVariant = 'delivery' | 'coupon' | 'default';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

/**
 * Badge 컴포넌트
 * 
 * @description 상품에 표시되는 배지 (무료배송, 쿠폰할인 등)
 * @example
 * <Badge variant="delivery">무료배송</Badge>
 * <Badge variant="coupon">쿠폰할인</Badge>
 */
const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className,
}) => {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${className || ''}`}>
            {children}
        </span>
    );
};

export default Badge;
