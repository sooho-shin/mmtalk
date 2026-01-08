"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Header.module.scss';

type HeaderVariant = 'main' | 'detail';

interface HeaderProps {
    variant?: HeaderVariant;
    title?: string;
    showBack?: boolean;
    onBackClick?: () => void;
    transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    variant = 'main',
    title = '쇼핑',
    showBack = false,
    onBackClick,
    transparent = false,
}) => {
    const router = useRouter();

    const handleBack = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            router.back();
        }
    };

    const handleHome = () => {
        router.push('/');
    };

    // 상세 페이지 헤더
    if (variant === 'detail') {
        return (
            <header className={`${styles.header} ${transparent ? styles.transparent : ''}`}>
                <div className={styles.left}>
                    <button className={styles.iconButton} onClick={handleBack}>
                        <img src="/images/ic_back.svg" alt="뒤로가기" width={24} height={24} />
                    </button>
                </div>

                <div className={styles.right}>
                    {/* 홈 아이콘 */}
                    <button className={styles.iconButton} onClick={handleHome}>
                        <img src="/images/ic_home.svg" alt="홈" width={24} height={24} />
                    </button>

                    {/* 검색 아이콘 */}
                    <button className={styles.iconButton}>
                        <img src="/images/ic_search.svg" alt="검색" width={24} height={24} />
                    </button>

                    {/* 장바구니 아이콘 */}
                    <button className={styles.iconButton}>
                        <img src="/images/ic_cart.svg" alt="장바구니" width={24} height={24} />
                    </button>
                </div>
            </header>
        );
    }

    // 메인 페이지 헤더 (기본)
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {showBack ? (
                    <button className={styles.iconButton} onClick={handleBack}>
                        <img src="/images/ic_back.svg" alt="뒤로가기" width={24} height={24} />
                    </button>
                ) : (
                    <h1 className={styles.title}>{title}</h1>
                )}
            </div>

            <div className={styles.right}>
                {/* 메뉴 아이콘 */}
                <button className={styles.iconButton}>
                    <img src="/images/ic_menu.svg" alt="메뉴" width={24} height={24} />
                </button>

                {/* 검색 아이콘 */}
                <button className={styles.iconButton}>
                    <img src="/images/ic_search.svg" alt="검색" width={24} height={24} />
                </button>

                {/* 장바구니 아이콘 */}
                <button className={styles.iconButton}>
                    <img src="/images/ic_cart.svg" alt="장바구니" width={24} height={24} />
                </button>
            </div>
        </header>
    );
};

export default Header;
