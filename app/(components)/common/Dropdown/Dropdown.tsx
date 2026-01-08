"use client";

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Dropdown.module.scss';

interface DropdownOption {
    value: string;
    label: string;
    addPrice?: number;
    disabled?: boolean;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string | null;
    placeholder?: string;
    isOpen: boolean;
    disabled?: boolean;
    onToggle: () => void;
    onSelect: (option: DropdownOption) => void;
    className?: string;
}

/**
 * Dropdown 컴포넌트
 * 
 * @description 옵션 선택을 위한 드롭다운 컴포넌트
 * @example
 * <Dropdown
 *   options={[{ value: 'M', label: 'M' }, { value: 'L', label: 'L' }]}
 *   value={selectedSize}
 *   placeholder="사이즈 선택"
 *   isOpen={isOpen}
 *   onToggle={() => setIsOpen(!isOpen)}
 *   onSelect={(opt) => setSelectedSize(opt.value)}
 * />
 */
const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    placeholder = '옵션을 선택하세요',
    isOpen,
    disabled = false,
    onToggle,
    onSelect,
    className,
}) => {
    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    const formatAddPrice = (addPrice: number) => {
        if (addPrice === 0) return '';
        return addPrice > 0 ? ` (+${addPrice.toLocaleString()}원)` : ` (${addPrice.toLocaleString()}원)`;
    };

    return (
        <div className={`${styles.dropdownWrapper} ${className || ''}`}>
            <button
                className={`${styles.trigger} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''}`}
                onClick={onToggle}
                disabled={disabled}
            >
                <span>{selectedLabel}</span>
                <Image
                    src="/images/ic_arrow_down.svg"
                    alt="펼침"
                    width={12}
                    height={12}
                    className={`${styles.icon} ${isOpen ? styles.rotated : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.menu}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                className={`${styles.item} ${option.disabled ? styles.disabled : ''}`}
                                onClick={() => {
                                    if (!option.disabled) {
                                        onSelect(option);
                                    }
                                }}
                                disabled={option.disabled}
                            >
                                {option.label}
                                {option.addPrice !== undefined && formatAddPrice(option.addPrice)}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;
