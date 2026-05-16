function ProductCard({ product }) {
  return (
    <article className="product-card">
      <img
        src={product.image_url || 'https://via.placeholder.com/640x480?text=No+Image'}
        alt={product.title}
      />
      <div className="product-details">
        <h2>{product.title}</h2>
        <p className="meta">{product.category || 'General'} • Posted {new Date(product.created_at).toLocaleDateString()}</p>
        <p className="price">₱{Number(product.price ?? 0).toFixed(2)}</p>
        <p className="description">{product.description || 'No description available.'}</p>
      </div>
    </article>
  );
}

export default ProductCard;
