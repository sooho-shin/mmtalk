"use client";

import React from 'react';
import styles from './Header.module.scss';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    title = '쇼핑',
    showBack = false,
    onBackClick,
}) => {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {showBack ? (
                    <button className={styles.iconButton} onClick={onBackClick}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                ) : (
                    <h1 className={styles.title}>{title}</h1>
                )}
            </div>

            <div className={styles.right}>
                {/* 메뉴 아이콘 */}
                <button className={styles.iconButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* 검색 아이콘 */}
                <button className={styles.iconButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* 장바구니 아이콘 */}
                <button className={styles.iconButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6H4.5L5.5 8M5.5 8L8.5 16H18.5L21 8H5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="17" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
