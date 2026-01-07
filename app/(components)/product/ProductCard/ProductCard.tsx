"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
    discount?: number;
    tags?: string[];
    deliveryInfo?: string;
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
    discount,
    tags = [],
    deliveryInfo,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
        >
            <Link href={`/products/${id}`} className={styles.card}>
                {/* 상품 이미지 */}
                <div className={styles.imageWrapper}>
                    <img src={imageUrl} alt={name} className={styles.image} />
                </div>

                {/* 상품 정보 */}
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

                    {/* 원가 */}
                    {originalPrice && (
                        <span className={styles.originalPrice}>{originalPrice.toLocaleString()}</span>
                    )}

                    {/* 배송 정보 */}
                    {deliveryInfo && (
                        <span className={styles.deliveryInfo}>{deliveryInfo}</span>
                    )}

                    {/* 별점 및 리뷰 */}
                    {rating !== undefined && (
                        <div className={styles.ratingRow}>
                            <img src="/images/ic_star.svg" alt="별점" width={12} height={12} />
                            <span className={styles.rating}>{rating}</span>
                            {reviewCount !== undefined && (
                                <span className={styles.reviewCount}>({reviewCount})</span>
                            )}
                        </div>
                    )}

                    {/* 태그 */}
                    {tags.length > 0 && (
                        <div className={styles.tags}>
                            {tags.map((tag, idx) => (
                                <span key={idx} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
