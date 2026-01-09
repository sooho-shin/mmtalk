"use client";

import React, { forwardRef } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
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
    loadMore?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loadMore }) => {

    return (
        <VirtuosoGrid
            useWindowScroll
            data={products}
            endReached={loadMore}
            overscan={800}

            components={{
                List: forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
                    <div {...props} ref={ref} className={styles.grid}>
                        {children}
                    </div>
                )),
                Item: ({ children, ...props }) => (
                    <div {...props} className={styles.gridItem}>
                        {children}
                    </div>
                )
            }}
            itemContent={(index, product) => (
                <ProductCard
                    key={product.id}
                    {...product}
                    priority={index < 4}
                />
            )}

        />
    );
};

export default ProductGrid;

