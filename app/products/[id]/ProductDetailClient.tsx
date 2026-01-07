"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { GET_PRODUCT_OPTION, GetProductOptionData, GetProductOptionVariables } from '@/graphql/queries/getProductOption';
import Header from '@/app/(components)/layout/Header/Header';
import styles from './page.module.scss';

interface Product {
    productNo: number;
    productName: string;
    brandName: string;
    salePrice: number;
    immediateDiscountAmt: number;
    imageUrls: string[];
    reviewRating: number;
    totalReviewCount: number;
}

interface ProductDetailClientProps {
    product: Product;
}

interface SelectedOption {
    optionNo: number;
    displayName: string;
    price: number;
    addPrice: number;
    quantity: number;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const router = useRouter();
    const productNo = product.productNo;

    const [showOptions, setShowOptions] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
    const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const dragControls = useDragControls();
    const sheetRef = useRef<HTMLDivElement>(null);

    // 상품 옵션 조회 (클라이언트에서 조회)
    const { data: optionData } = useQuery<GetProductOptionData, GetProductOptionVariables>(
        GET_PRODUCT_OPTION,
        { variables: { productNo } }
    );

    const optionInfo = optionData?.productOption;
    const optionType = optionInfo?.type; // COMBINATION, REQUIRED, DEFAULT 등
    const labels = optionInfo?.labels || [];
    const multiLevelOptions = optionInfo?.multiLevelOptions || [];
    const flatOptions = optionInfo?.flatOptions || [];

    // DEFAULT 타입: 옵션 선택 없이 바로 상품 선택
    const isDefaultType = optionType === 'DEFAULT';

    // children이 있는지 확인 (2단계 옵션인지)
    const hasChildren = multiLevelOptions.some(opt => opt.children && opt.children.length > 0);

    // DEFAULT 타입일 때 바텀시트 열리면 자동으로 상품 추가
    useEffect(() => {
        if (showOptions && isDefaultType && flatOptions.length > 0 && selectedOptions.length === 0) {
            const defaultOption = flatOptions[0];
            setSelectedOptions([{
                optionNo: defaultOption.optionNo,
                displayName: product.productName,
                price: defaultOption.buyPrice,
                addPrice: defaultOption.addPrice,
                quantity: 1,
            }]);
        }
    }, [showOptions, isDefaultType, flatOptions, selectedOptions.length, product.productName]);

    // 옵션 정보 타입
    interface OptionItem {
        value: string;
        addPrice: number;
    }

    // 첫 번째 드롭다운 옵션 목록 (value + addPrice)
    const firstOptions = useMemo((): OptionItem[] => {
        if (optionType === 'COMBINATION') {
            if (hasChildren) {
                // 2단계: multiLevelOptions의 value가 첫 번째 단계 (addPrice 없음)
                return multiLevelOptions.map(opt => ({ value: opt.value, addPrice: 0 })).filter(v => v.value);
            } else {
                // 1단계: flatOptions에서 addPrice 가져오기
                return flatOptions.map(opt => ({ value: opt.value, addPrice: opt.addPrice }));
            }
        } else {
            // REQUIRED 등: 필수옵션 그룹의 children
            const requiredGroup = multiLevelOptions.find(opt => opt.isRequiredOption);
            return requiredGroup?.children?.map(c => ({ value: c.value, addPrice: c.addPrice })) || [];
        }
    }, [optionType, multiLevelOptions, flatOptions, hasChildren]);

    // 두 번째 드롭다운 옵션 목록 (value + addPrice)
    const secondOptions = useMemo((): OptionItem[] => {
        if (optionType === 'COMBINATION') {
            if (!hasChildren) {
                // 1단계 옵션: 두 번째 드롭다운 없음
                return [];
            }
            // 2단계: 선택된 첫 번째 옵션에 따른 두 번째 옵션 목록
            if (!selectedSize) {
                const allColors: OptionItem[] = [];
                const seen = new Set<string>();
                multiLevelOptions.forEach(sizeOpt => {
                    sizeOpt.children?.forEach(colorOpt => {
                        if (!seen.has(colorOpt.value)) {
                            seen.add(colorOpt.value);
                            allColors.push({ value: colorOpt.value, addPrice: colorOpt.addPrice });
                        }
                    });
                });
                return allColors;
            }
            const sizeOpt = multiLevelOptions.find(opt => opt.value === selectedSize);
            return sizeOpt?.children?.map(c => ({ value: c.value, addPrice: c.addPrice })) || [];
        } else {
            // REQUIRED 등: 선택옵션 그룹
            const optionalGroup = multiLevelOptions.find(opt => !opt.isRequiredOption);
            return optionalGroup?.children?.map(c => ({ value: c.value, addPrice: c.addPrice })) || [];
        }
    }, [optionType, selectedSize, multiLevelOptions, hasChildren]);

    // 선택된 옵션 정보 찾기 (flatOptions에서 검색)
    const findOptionBySelection = (first: string, second?: string) => {
        if (optionType === 'COMBINATION') {
            if (hasChildren && second) {
                // 2단계: children에서 찾기
                const sizeOpt = multiLevelOptions.find(opt => opt.value === first);
                return sizeOpt?.children?.find(c => c.value === second);
            } else {
                // 1단계: flatOptions에서 value로 찾기
                return flatOptions.find(opt => opt.value === first);
            }
        } else {
            // REQUIRED: flatOptions에서 value로 찾기
            return flatOptions.find(opt => opt.value === first);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleFirstSelect = (value: string) => {
        setSelectedSize(value);
        setSizeDropdownOpen(false);

        if (optionType === 'COMBINATION') {
            if (hasChildren) {
                // 2단계: 두 번째 옵션도 선택되면 추가
                if (selectedColor) {
                    addOption(value, selectedColor);
                }
            } else {
                // 1단계: 첫 번째 옵션 선택 시 바로 추가
                addOption(value);
            }
        } else {
            // REQUIRED: 첫 번째 옵션 선택 시 바로 추가
            addOption(value);
        }
    };

    const handleSecondSelect = (value: string) => {
        setSelectedColor(value);
        setColorDropdownOpen(false);

        if (optionType === 'COMBINATION') {
            // COMBINATION: 첫 번째 옵션도 선택되면 추가
            if (selectedSize) {
                addOption(selectedSize, value);
            }
        } else {
            // REQUIRED: 선택옵션 선택 시 바로 추가
            addOption(value);
        }
    };

    const addOption = (first: string, second?: string) => {
        const option = findOptionBySelection(first, second);
        if (!option) return;

        // 이미 선택된 옵션인지 확인
        const exists = selectedOptions.find(o => o.optionNo === option.optionNo);
        if (exists) {
            // 이미 있으면 수량 증가
            setSelectedOptions(prev =>
                prev.map(o =>
                    o.optionNo === option.optionNo
                        ? { ...o, quantity: o.quantity + 1 }
                        : o
                )
            );
        } else {
            // 새로 추가
            let displayName = second ? `${first} / ${second}` : first;
            if (option.addPrice !== 0) {
                displayName += ` (${option.addPrice > 0 ? '+' : ''}${option.addPrice.toLocaleString()}원)`;
            }
            setSelectedOptions(prev => [
                ...prev,
                {
                    optionNo: option.optionNo,
                    displayName,
                    price: option.buyPrice,
                    addPrice: option.addPrice,
                    quantity: 1,
                }
            ]);
        }

        // 선택 초기화
        setSelectedSize(null);
        setSelectedColor(null);
    };

    const handleQuantityChange = (optionNo: number, delta: number) => {
        setSelectedOptions(prev =>
            prev.map(opt =>
                opt.optionNo === optionNo
                    ? { ...opt, quantity: Math.max(1, opt.quantity + delta) }
                    : opt
            )
        );
    };

    const handleRemoveOption = (optionNo: number) => {
        setSelectedOptions(prev => prev.filter(opt => opt.optionNo !== optionNo));
    };

    const totalPrice = selectedOptions.reduce((sum, opt) => sum + (opt.price * opt.quantity), 0);

    // 필수옵션이 선택되었는지 확인 (REQUIRED 타입에서만 적용)
    const hasRequiredOptionSelected = useMemo(() => {
        if (optionType !== 'REQUIRED') return true; // COMBINATION 등은 항상 true
        const requiredGroup = multiLevelOptions.find(opt => opt.isRequiredOption);
        if (!requiredGroup?.children) return true;
        // 선택된 옵션 중 필수옵션이 있는지 확인
        const requiredOptionNos = requiredGroup.children.map(c => c.optionNo);
        return selectedOptions.some(opt => requiredOptionNos.includes(opt.optionNo));
    }, [optionType, multiLevelOptions, selectedOptions]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;
        const velocity = info.velocity.y;

        if (info.offset.y > threshold || velocity > 500) {
            setShowOptions(false);
        }
    };

    const discountPercent = product.immediateDiscountAmt > 0
        ? Math.round((product.immediateDiscountAmt / product.salePrice) * 100)
        : 0;
    const finalPrice = product.salePrice - product.immediateDiscountAmt;
    const imageUrl = product.imageUrls[0]?.startsWith('//')
        ? `https:${product.imageUrls[0]}`
        : product.imageUrls[0];

    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <Header variant="detail" />

            {/* 상품 이미지 */}
            <div className={styles.imageSection}>
                <Image
                    src={imageUrl}
                    alt={product.productName}
                    className={styles.productImage}
                    fill
                    sizes="100vw"
                    priority
                />
            </div>

            {/* 상품 정보 */}
            <div className={styles.infoSection}>
                <span className={styles.brand}>{product.brandName}</span>
                <h1 className={styles.productName}>{product.productName}</h1>

                <div className={styles.ratingRow}>
                    <Image src="/images/ic_star.svg" alt="별점" width={12} height={12} />
                    <span className={styles.rating}>{product.reviewRating}</span>
                    <span className={styles.reviewCount}>({product.totalReviewCount})</span>
                </div>

                <div className={styles.priceSection}>
                    {discountPercent > 0 && (
                        <span className={styles.originalPrice}>{product.salePrice.toLocaleString()}원</span>
                    )}
                    <div className={styles.priceRow}>
                        {discountPercent > 0 && (
                            <span className={styles.discount}>{discountPercent}%</span>
                        )}
                        <span className={styles.price}>{finalPrice.toLocaleString()}원</span>
                    </div>
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className={styles.bottomBar}>
                <button className={styles.buyButton} onClick={() => setShowOptions(true)}>
                    바로 구매하기
                </button>
            </div>

            {/* 옵션 선택 바텀시트 */}
            <AnimatePresence>
                {showOptions && (
                    <>
                        <motion.div
                            className={styles.overlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setShowOptions(false)}
                        />

                        <motion.div
                            ref={sheetRef}
                            className={styles.bottomSheet}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 300
                            }}
                            drag="y"
                            dragControls={dragControls}
                            dragListener={false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 0.5 }}
                            onDragEnd={handleDragEnd}
                            onClick={e => e.stopPropagation()}
                        >
                            <div
                                className={styles.sheetHandle}
                                onPointerDown={(e) => dragControls.start(e)}
                                style={{ cursor: 'grab', touchAction: 'none' }}
                            >
                                <div className={styles.handleBar}></div>
                            </div>

                            {/* 옵션 선택 드롭다운들 (DEFAULT 타입이 아닐 때만) */}
                            {!isDefaultType && (
                                <div className={styles.optionSection}>
                                    {/* Size 드롭다운 */}
                                    <div className={styles.dropdownWrapper}>
                                        <button
                                            className={`${styles.dropdownTrigger} ${sizeDropdownOpen ? styles.open : ''}`}
                                            onClick={() => {
                                                setSizeDropdownOpen(!sizeDropdownOpen);
                                                setColorDropdownOpen(false);
                                            }}
                                        >
                                            <span>{selectedSize || `${labels[0] || '옵션'}`}</span>
                                            <motion.svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                                animate={{ rotate: sizeDropdownOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </motion.svg>
                                        </button>

                                        <AnimatePresence>
                                            {sizeDropdownOpen && (
                                                <motion.div
                                                    className={styles.dropdownMenu}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                >
                                                    {firstOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            className={styles.dropdownItem}
                                                            onClick={() => handleFirstSelect(option.value)}
                                                        >
                                                            {option.value}
                                                            {option.addPrice !== 0 && ` (${option.addPrice > 0 ? '+' : ''}${option.addPrice.toLocaleString()}원)`}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* 두 번째 드롭다운 (선택옵션이 있을 때만) */}
                                    {secondOptions.length > 0 && (
                                        <div className={styles.dropdownWrapper}>
                                            {/* 선택 라벨 */}
                                            {optionType === 'REQUIRED' && (
                                                <span className={styles.dropdownLabel}>선택</span>
                                            )}
                                            <button
                                                className={`${styles.dropdownTrigger} ${colorDropdownOpen ? styles.open : ''} ${!hasRequiredOptionSelected ? styles.disabled : ''}`}
                                                onClick={() => {
                                                    if (!hasRequiredOptionSelected) return;
                                                    setColorDropdownOpen(!colorDropdownOpen);
                                                    setSizeDropdownOpen(false);
                                                }}
                                                disabled={!hasRequiredOptionSelected}
                                            >
                                                <span>
                                                    {!hasRequiredOptionSelected
                                                        ? '필수옵션 선택 시 구매 가능합니다'
                                                        : (selectedColor || `${labels[1] || '옵션'}`)}
                                                </span>
                                                <motion.svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 12 12"
                                                    fill="none"
                                                    animate={{ rotate: colorDropdownOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </motion.svg>
                                            </button>

                                            <AnimatePresence>
                                                {colorDropdownOpen && (
                                                    <motion.div
                                                        className={styles.dropdownMenu}
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                    >
                                                        {secondOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                className={styles.dropdownItem}
                                                                onClick={() => handleSecondSelect(option.value)}
                                                            >
                                                                {option.value}
                                                                {option.addPrice !== 0 && ` (${option.addPrice > 0 ? '+' : ''}${option.addPrice.toLocaleString()}원)`}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 선택된 옵션들 */}
                            {selectedOptions.map((option) => (
                                <div
                                    key={option.optionNo}
                                    className={styles.selectedOption}
                                >
                                    <div className={styles.optionInfo}>
                                        <span className={styles.optionName}>{option.displayName}</span>
                                        {!isDefaultType && (
                                            <button
                                                className={styles.removeButton}
                                                onClick={() => handleRemoveOption(option.optionNo)}
                                            >
                                                <img src="/images/ic_close.svg" alt="삭제" width={16} height={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.optionControls}>
                                        <div className={styles.quantityControl}>
                                            <button
                                                className={styles.quantityButton}
                                                onClick={() => handleQuantityChange(option.optionNo, -1)}
                                            >
                                                -
                                            </button>
                                            <span className={styles.quantityValue}>{option.quantity}</span>
                                            <button
                                                className={styles.quantityButton}
                                                onClick={() => handleQuantityChange(option.optionNo, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className={styles.optionPrice}>{(option.price * option.quantity).toLocaleString()}원</span>
                                    </div>
                                </div>
                            ))}

                            {/* 총 금액 */}
                            <div className={styles.totalSection}>
                                <span className={styles.totalLabel}>결제 예상 금액</span>
                                <div className={styles.totalPriceWrapper}>
                                    <motion.span
                                        className={styles.totalPrice}
                                        key={totalPrice}
                                        initial={{ scale: 1.1 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {totalPrice.toLocaleString()}원
                                    </motion.span>
                                    <span className={styles.deliveryNote}>무료배송</span>
                                </div>
                            </div>

                            <div className={styles.buttonWrapper}>
                                <motion.button
                                    className={styles.confirmButton}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    바로 구매하기
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
