function ProductCard({ product }) {
  return (
    <article className="product-card">
      <img
        src={product.image_url || 'https://via.placeholder.com/640x480?text=No+Image'}
        alt={product.product_name}
      />
      <div className="product-details">
        <h2>{product.product_name}</h2>
        <p className="meta">
          {product.product_brand || 'Brand'} • {product.product_condition || 'Condition unknown'}
        </p>
        <p className="price">₱{Number(product.product_price ?? 0).toFixed(2)}</p>
        <p className="description">{product.product_description || 'No description available.'}</p>
      </div>
    </article>
  );
}

export default ProductCard;
