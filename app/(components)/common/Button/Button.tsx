"use client";

import React from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
}

/**
 * Button 컴포넌트
 * 
 * @description 공통 버튼 컴포넌트
 * @example
 * <Button variant="primary" size="lg" fullWidth>바로 구매하기</Button>
 * <Button variant="secondary">옵션 변경</Button>
 * <Button variant="ghost" size="sm">취소</Button>
 */
const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    ...props
}) => {
    return (
        <button
            className={`
                ${styles.button}
                ${styles[variant]}
                ${styles[size]}
                ${fullWidth ? styles.fullWidth : ''}
                ${className || ''}
            `}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
