import Link from 'next/link';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

const ProductCard = ({ id, name, price, imageUrl }: ProductCardProps) => {
  return (
    <Link href={`/products/${id}`} className={styles.card}>
      <img src={imageUrl} alt={name} className={styles.image} />
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.price}>₩{price.toLocaleString()}</p>
    </Link>
  );
};

export default ProductCard;
