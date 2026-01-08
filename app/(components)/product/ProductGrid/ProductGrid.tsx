"use client";

import React from 'react';
import styles from './ProductGrid.module.scss';
import ProductCard from '../ProductCard';

interface Product {
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
}

interface ProductGridProps {
    products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    return (
        <div className={styles.grid}>
            {products.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </div>
    );
};

export default ProductGrid;
