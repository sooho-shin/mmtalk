"use client";

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { GET_PRODUCT, GetProductData, GetProductVariables } from '@/graphql/queries/getProduct';
import { GET_PRODUCT_OPTION, GetProductOptionData, GetProductOptionVariables } from '@/graphql/queries/getProductOption';
import styles from './page.module.scss';

interface ProductDetailPageProps {
    params: { id: string };
}

interface SelectedOption {
    optionNo: number;
    displayName: string;
    price: number;
    quantity: number;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const router = useRouter();
    const productNo = parseInt(params.id);

    const [showOptions, setShowOptions] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
    const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const dragControls = useDragControls();
    const sheetRef = useRef<HTMLDivElement>(null);

    // 상품 정보 조회
    const { data: productData, loading: productLoading } = useQuery<GetProductData, GetProductVariables>(
        GET_PRODUCT,
        { variables: { productNo } }
    );

    // 상품 옵션 조회
    const { data: optionData } = useQuery<GetProductOptionData, GetProductOptionVariables>(
        GET_PRODUCT_OPTION,
        { variables: { productNo } }
    );

    const product = productData?.product;
    const optionInfo = optionData?.productOption;
    const labels = optionInfo?.labels || [];
    const multiLevelOptions = optionInfo?.multiLevelOptions || [];

    // Size 옵션 목록
    const sizeOptions = useMemo(() => {
        return multiLevelOptions.map(opt => opt.value);
    }, [multiLevelOptions]);

    // 선택된 Size에 따른 Color 옵션 목록
    const colorOptions = useMemo(() => {
        if (!selectedSize) {
            // 모든 색상 옵션 표시 (중복 제거)
            const allColors = new Set<string>();
            multiLevelOptions.forEach(sizeOpt => {
                sizeOpt.children?.forEach(colorOpt => {
                    allColors.add(colorOpt.value);
                });
            });
            return Array.from(allColors);
        }
        const sizeOpt = multiLevelOptions.find(opt => opt.value === selectedSize);
        return sizeOpt?.children?.map(c => c.value) || [];
    }, [selectedSize, multiLevelOptions]);

    // 선택된 Size + Color 조합의 옵션 정보 찾기
    const findOptionBySelection = (size: string, color: string) => {
        const sizeOpt = multiLevelOptions.find(opt => opt.value === size);
        return sizeOpt?.children?.find(c => c.value === color);
    };

    const handleBack = () => {
        router.back();
    };

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
        setSizeDropdownOpen(false);

        // Size와 Color 모두 선택되면 옵션 추가
        if (selectedColor) {
            addOption(size, selectedColor);
        }
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setColorDropdownOpen(false);

        // Size와 Color 모두 선택되면 옵션 추가
        if (selectedSize) {
            addOption(selectedSize, color);
        }
    };

    const addOption = (size: string, color: string) => {
        const option = findOptionBySelection(size, color);
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
            setSelectedOptions(prev => [
                ...prev,
                {
                    optionNo: option.optionNo,
                    displayName: `${size} / ${color}`,
                    price: option.buyPrice,
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

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;
        const velocity = info.velocity.y;

        if (info.offset.y > threshold || velocity > 500) {
            setShowOptions(false);
        }
    };

    // 로딩 상태
    if (productLoading) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backButton} onClick={handleBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </header>
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backButton} onClick={handleBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </header>
                <div className={styles.loadingState}>상품을 찾을 수 없습니다.</div>
            </div>
        );
    }

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
            <header className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className={styles.headerRight}>
                    <button className={styles.iconButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                        </svg>
                    </button>
                    <button className={styles.iconButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6 6H4.5L5.5 8M5.5 8L8.5 16H18.5L21 8H5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="17" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* 상품 이미지 */}
            <div className={styles.imageSection}>
                <img src={imageUrl} alt={product.productName} className={styles.productImage} />
            </div>

            {/* 상품 정보 */}
            <div className={styles.infoSection}>
                <span className={styles.brand}>{product.brandName}</span>
                <h1 className={styles.productName}>{product.productName}</h1>

                <div className={styles.ratingRow}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 0.5L7.76336 4.07295L11.7063 4.64683L8.85317 7.42705L9.52671 11.3532L6 9.5L2.47329 11.3532L3.14683 7.42705L0.293661 4.64683L4.23664 4.07295L6 0.5Z" fill="#FFC107" />
                    </svg>
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

                            {/* 옵션 선택 드롭다운들 */}
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
                                                {sizeOptions.map((size) => (
                                                    <button
                                                        key={size}
                                                        className={styles.dropdownItem}
                                                        onClick={() => handleSizeSelect(size)}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Color 드롭다운 */}
                                <div className={styles.dropdownWrapper}>
                                    <button
                                        className={`${styles.dropdownTrigger} ${colorDropdownOpen ? styles.open : ''}`}
                                        onClick={() => {
                                            setColorDropdownOpen(!colorDropdownOpen);
                                            setSizeDropdownOpen(false);
                                        }}
                                    >
                                        <span>{selectedColor || `${labels[1] || '옵션'}`}</span>
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
                                                {colorOptions.map((color) => (
                                                    <button
                                                        key={color}
                                                        className={styles.dropdownItem}
                                                        onClick={() => handleColorSelect(color)}
                                                    >
                                                        {color}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* 선택된 옵션들 */}
                            {selectedOptions.map((option) => (
                                <div
                                    key={option.optionNo}
                                    className={styles.selectedOption}
                                >
                                    <div className={styles.optionInfo}>
                                        <span className={styles.optionName}>{option.displayName}</span>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveOption(option.optionNo)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
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
