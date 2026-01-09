"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
    id: string;
    name: string;
    brand?: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    rating?: number;
    reviewCount?: number;
    likeCount?: number;
    discount?: number;
    tags?: string[];
    deliveryInfo?: string;
    priority?: boolean;
}


const ProductCard: React.FC<ProductCardProps> = ({
    id,
    name,
    brand,
    price,
    originalPrice,
    imageUrl,
    rating,
    reviewCount,
    likeCount,
    discount,
    tags = [],
    deliveryInfo,
    priority = false,
}) => {

    return (
        <Link href={`/products/${id}`} className={styles.card}>
            {/* 1. 상품 이미지 */}
            <div className={styles.imageWrapper}>
                <Image
                    src={imageUrl}
                    alt={name}
                    className={styles.image}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority={priority}
                />

                <Image
                    src={'/images/ic_like.svg'}
                    alt={'like'}
                    className={styles.likeIcon}
                    width={24}
                    height={24}
                    priority={false}
                />
            </div>

            {/* 2. 상품 정보 */}
            <div className={styles.info}>
                {/* 브랜드명 */}
                {brand && <span className={styles.brand}>{brand}</span>}

                {/* 상품명 */}
                <p className={styles.name}>{name}</p>

                {/* 가격 정보 */}
                <div className={styles.priceRow}>
                    {discount && discount > 0 && (
                        <span className={styles.discount}>{discount}%</span>
                    )}
                    <span className={styles.price}>{price.toLocaleString()}</span>
                </div>

                {/* 배송/쿠폰 태그 */}
                <div className={styles.badges}>
                    <span className={styles.badgeFreeDelivery}>무료배송</span>
                    <span className={styles.badgeCoupon}>쿠폰할인</span>
                </div>
            </div>

            {/* 3. 별점 및 좋아요 */}
            {((reviewCount !== undefined && reviewCount > 0) || (likeCount !== undefined && likeCount > 0)) && (
                <div className={styles.ratingRow}>
                    {reviewCount !== undefined && reviewCount > 0 && (
                        <div className={styles.ratingGroup}>
                            <Image src="/images/ic_star.svg" alt="별점" width={12} height={12} />
                            <span className={styles.rating}>{rating}</span>
                            <span className={styles.reviewCount}>({reviewCount.toLocaleString()})</span>
                        </div>
                    )}
                    {likeCount !== undefined && likeCount > 0 && (
                        <div className={styles.likeGroup}>
                            <Image src="/images/ic_heart.svg" alt="좋아요" width={12} height={12} />
                            <span className={styles.likeCount}>{likeCount.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            )}
        </Link>
    );
};



export default ProductCard;
