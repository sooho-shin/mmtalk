"use client";

import React from 'react';
import Image from 'next/image';
import styles from './Rating.module.scss';

interface RatingProps {
    rating?: number;
    reviewCount?: number;
    likeCount?: number;
    showReviewLabel?: boolean; // "리뷰 N개" 형식으로 표시
    className?: string;
}

/**
 * Rating 컴포넌트
 * 
 * @description 별점, 리뷰 수, 찜 수를 표시하는 컴포넌트
 * @example
 * // 상품 카드용 (간략)
 * <Rating rating={4.8} reviewCount={1234} likeCount={567} />
 * 
 * // 상세 페이지용 (리뷰 라벨)
 * <Rating rating={4.8} reviewCount={1234} showReviewLabel />
 */
const Rating: React.FC<RatingProps> = ({
    rating,
    reviewCount,
    likeCount,
    showReviewLabel = false,
    className,
}) => {
    const hasRating = reviewCount !== undefined && reviewCount > 0;
    const hasLike = likeCount !== undefined && likeCount > 0;

    if (!hasRating && !hasLike) return null;

    return (
        <div className={`${styles.ratingRow} ${className || ''}`}>
            {hasRating && (
                <div className={styles.ratingGroup}>
                    <Image src="/images/ic_star.svg" alt="별점" width={12} height={12} />
                    <span className={styles.rating}>{rating}</span>
                    {showReviewLabel ? (
                        <span className={styles.reviewLabel}>
                            리뷰 {reviewCount?.toLocaleString()}개
                        </span>
                    ) : (
                        <span className={styles.reviewCount}>
                            ({reviewCount?.toLocaleString()})
                        </span>
                    )}
                </div>
            )}
            {hasLike && (
                <div className={styles.likeGroup}>
                    <Image src="/images/ic_heart.svg" alt="좋아요" width={12} height={12} />
                    <span className={styles.likeCount}>{likeCount?.toLocaleString()}</span>
                </div>
            )}
        </div>
    );
};

export default Rating;
