import ProductDetail from "../../../app/(components)/product/ProductDetail";
import Header from "../../../app/(components)/layout/Header";

// Next.js App Router의 dynamic segment는 props.params로 전달됩니다.
// 하지만 ProductDetail 컴포넌트 내에서 useParams를 사용하도록 구성했으므로,
// 여기서는 단순히 ProductDetail을 렌더링하기만 합니다.
export default function ProductDetailPage() {
  return (
    <>
      <Header />
      <ProductDetail />
    </>
  );
}
