import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import './App.css';

const products = [
  { id: 1, name: 'Calambour', notes: 'Bougie artisanale Nicolas Flammèche', story: 'La photo officielle de Calambour révèle son verre transparent, sa cire claire et son étiquette cuivrée.', price: 25, originalPrice: 30, badge: 'Offre ouverture', image: '/images/calambour.webp', wax: '#f5ead0', glass: '#d19a62' },
  { id: 2, name: 'Petit Pin', notes: 'Bougie artisanale Nicolas Flammèche', story: 'La photo officielle de Petit Pin révèle son verre transparent, sa cire claire et son étiquette vert olive.', price: 25, originalPrice: 30, badge: 'Offre ouverture', image: '/images/petit-pin.webp', wax: '#f5ead0', glass: '#858344' }
];

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function Candle({ product, large = false }) {
  return (
    <svg className={large ? 'candle-svg large' : 'candle-svg'} viewBox="0 0 240 280" aria-hidden="true">
      <defs>
        <linearGradient id={`glass-${product.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7ef" stopOpacity="0.86" />
          <stop offset="100%" stopColor={product.glass} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`wax-${product.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={product.wax} />
          <stop offset="100%" stopColor={product.glass} />
        </linearGradient>
        <radialGradient id={`flame-${product.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff0be" />
          <stop offset="45%" stopColor="#ffb35b" />
          <stop offset="78%" stopColor="#d4621a" />
          <stop offset="100%" stopColor="#782d00" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="252" rx="58" ry="12" fill="rgba(42,32,24,0.12)" />
      <rect x="64" y="62" width="112" height="150" rx="28" fill={`url(#glass-${product.id})`} stroke="rgba(255,255,255,0.55)" />
      <rect x="80" y="90" width="80" height="94" rx="18" fill={`url(#wax-${product.id})`} />
      <ellipse cx="120" cy="88" rx="40" ry="10" fill={product.wax} opacity="0.88" />
      <rect x="116" y="44" width="8" height="48" rx="4" fill="#38271a" />
      <g className="flicker" style={{ transformOrigin: '120px 30px' }}>
        <ellipse cx="120" cy="28" rx="12" ry="22" fill={`url(#flame-${product.id})`} />
        <ellipse cx="120" cy="33" rx="5" ry="10" fill="#fff7cf" />
      </g>
    </svg>
  );
}

function ProductVisual({ product, large = false }) {
  return product.image
    ? <img className={large ? 'product-photo large' : 'product-photo'} src={product.image} alt={`Bougie ${product.name}`} />
    : <Candle product={product} large={large} />;
}

function ProductPrice({ product }) {
  return <span className="product-prices"><del>{euro.format(product.originalPrice)}</del><strong>{euro.format(product.price)}</strong><small>−5 € · offre d’ouverture</small></span>;
}

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState('');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cart.length ? 8 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    document.body.style.overflow = cartOpen || checkoutOpen || selectedProduct ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen, checkoutOpen, selectedProduct]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible'));
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function addToCart(product) {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setToast(`🕯 ${product.name} ajouté au panier`);
  }

  function updateQty(id, delta) {
    setCart((prev) => prev
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function pay() {
    if (!cart.length) return setToast('🕯 Votre panier est vide');
    setCart([]);
    setCheckoutOpen(false);
    setToast('✨ Votre flamme est en préparation');
  }

  return (
    <>
      <nav className="nav">
        <a className="brand" href="#top"><span>Nicolas</span><em>Flammèche</em></a>
        <div className="nav-links">
          <a href="#collection">Collection</a>
          <a href="#rituel">Rituel</a>
          <a href="#atelier">L'Atelier</a>
        </div>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Ouvrir le panier">
          <ShoppingBag size={21} />
          <span>{cartCount}</span>
        </button>
      </nav>

      <main id="top">
        <section className="hero grain">
          <div className="container hero-grid">
            <div className="hero-copy reveal">
              <span className="eyebrow">Maison de parfum d’intérieur — Hauts-de-France</span>
              <h1>La flamme,<em>comme signature</em></h1>
              <p>Une maison artisanale où la lumière devient matière. Chaque bougie est une présence : une chaleur lente, un parfum qui s’installe, une trace qui demeure.</p>
              <div className="hero-actions">
                <a className="btn" href="#collection">Entrer dans la collection</a>
                <a className="ghost-btn" href="#atelier">Découvrir la maison</a>
              </div>
            </div>
            <div className="hero-visual reveal">
              <div className="orb one" />
              <div className="orb two" />
              <div className="hero-candle"><Candle product={products[0]} large /></div>
            </div>
          </div>
        </section>

        <section className="marquee"><div><span>Cire végétale naturelle · Coulée à la main · Fragrances artisanales · Hauts-de-France · Sans paraffine · Mèche en coton · Éco-responsable · </span><span>Cire végétale naturelle · Coulée à la main · Fragrances artisanales · Hauts-de-France · Sans paraffine · Mèche en coton · Éco-responsable · </span></div></section>

        <section className="products" id="collection">
          <div className="container">
            <header className="section-heading reveal">
              <span className="eyebrow">Collection</span>
              <h2>Collection</h2>
              <p>Deux bougies artisanales, chacune avec sa signature : l’éclat cuivré de Calambour et la douceur végétale de Petit Pin.</p>
            </header>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card reveal" key={product.id} onClick={() => setSelectedProduct(product)}>
                  <div className="product-media">
                    {product.badge && <span className="badge">{product.badge}</span>}
                    <ProductVisual product={product} />
                    <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Ajouter à la collection</button>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.notes}</p>
                    <ProductPrice product={product} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <InfoSection />
        <Atelier />
        <Footer />
      </main>

      {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onQty={updateQty} onRemove={removeItem} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <Checkout cart={cart} subtotal={subtotal} shipping={shipping} total={total} onClose={() => setCheckoutOpen(false)} onQty={updateQty} onPay={pay} />}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function InfoSection() {
  const blocks = [
    ['Signature olfactive', 'Lumière', 'Air salin, lin frais, pluie claire. Une entrée délicate qui ouvre l’espace avec douceur.'],
    ['Note de cœur', 'Matière', 'Cire chaude, fleurs blanches, iris poudré. Une présence enveloppante et élégante.'],
    ['Note de fond', 'Trace', 'Résines, bois secs, ambre, fumée. Une empreinte lente et persistante.'],
    ['Le rituel', 'Allumer, attendre', 'Couper la mèche, laisser la cire fondre, puis permettre au parfum d’habiter l’espace.'],
    ['L’écrin', 'Packaging', 'Papier texturé, carte parfumée, sceau doré. Une expérience d’ouverture lente et précieuse.'],
    ['Le moment', 'Présence', 'À la tombée du jour, au cœur d’un dîner, ou dans le silence d’un matin.']
  ];
  return <section className="info" id="rituel"><div className="container info-grid">{blocks.map(([label, title, text]) => <div className="info-card reveal" key={title}><span>{label}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>;
}

function Atelier() {
  return <section className="atelier grain" id="atelier"><div className="container atelier-grid"><div className="atelier-visual reveal"><ProductVisual product={products[1]} large /></div><div className="atelier-copy reveal"><span className="eyebrow">À propos · L'Atelier</span><h2>La maison</h2><p>Dans mon atelier des Hauts-de-France, la main guide la matière et le feu donne sa respiration à chaque création.</p><p>Je choisis des cires végétales naturelles, des mèches en coton et des accords pensés pour durer avec douceur.</p><div className="stats"><div><strong>200+</strong><span>créations</span></div><div><strong>100%</strong><span>naturel</span></div><div><strong>5 ans</strong><span>savoir-faire</span></div></div></div></div></section>;
}

function ProductModal({ product, onClose, onAdd }) {
  const details = [['Intensité', product.intensity], ['Durée', product.burn], ['Tête', product.top], ['Cœur', product.heart], ['Fond', product.base], ['Moment', product.moment], ['Pièce', product.room], ['Rituel', product.ritual]].filter(([, value]) => value);
  return <div className="modal-backdrop" onClick={onClose}><div className="product-modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={onClose}><X size={18} /></button><div className="modal-visual"><ProductVisual product={product} large /></div><div className="modal-copy"><span className="eyebrow">Expérience produit</span><h2>{product.name}</h2><p className="story">{product.story}</p><p>{product.notes}</p><div className="meta">{details.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><ProductPrice product={product} /><button className="btn" onClick={() => { onAdd(product); onClose(); }}>Ajouter à la collection</button></div></div></div>;
}

function CartDrawer({ cart, subtotal, onClose, onQty, onRemove, onCheckout }) {
  return <><div className="overlay" onClick={onClose} /><aside className="cart"><button className="close" onClick={onClose}><X size={18} /></button><span className="eyebrow">Panier</span><h2>Vos lueurs</h2><div className="cart-items">{cart.length ? cart.map((item) => <div className="cart-item" key={item.id}><div className="thumb"><ProductVisual product={item} /></div><div><h3>{item.name}</h3><p>{item.notes}</p><div className="qty"><button onClick={() => onQty(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => onQty(item.id, 1)}>+</button><button onClick={() => onRemove(item.id)}>Retirer</button></div></div><strong>{euro.format(item.price * item.quantity)}</strong></div>) : <p className="empty">Votre panier sommeille encore.</p>}</div><div className="cart-bottom"><div><span>Total</span><strong>{euro.format(subtotal)}</strong></div><button className="btn" onClick={onCheckout}>Finaliser la commande</button></div></aside></>;
}

function Checkout({ cart, subtotal, shipping, total, onClose, onQty, onPay }) {
  return <div className="checkout-backdrop"><div className="checkout"><button className="close" onClick={onClose}><X size={18} /></button><header><span className="eyebrow">Panier & paiement</span><h2>Vérifier votre commande</h2><p>Votre commande sera préparée dans un écrin parfumé, enveloppée de papier texturé et scellée d’une signature dorée.</p></header><div className="checkout-layout"><main><section className="checkout-block"><h3>Votre sélection</h3>{cart.map((item) => <div className="checkout-item" key={item.id}><div className="thumb"><ProductVisual product={item} /></div><div><h4>{item.name}</h4><p>{item.notes}</p></div><div className="qty"><button onClick={() => onQty(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => onQty(item.id, 1)}>+</button></div><strong>{euro.format(item.price * item.quantity)}</strong></div>)}</section><section className="checkout-block"><h3>Livraison</h3><div className="form"><input placeholder="Prénom" /><input placeholder="Nom" /><input placeholder="Email" /><input placeholder="Adresse" /><input placeholder="Ville" /><input placeholder="Code postal" /></div></section><section className="checkout-block"><h3>Paiement</h3><div className="form"><input placeholder="4242 4242 4242 4242" /><input placeholder="08/28" /><input placeholder="CVC" /></div></section></main><aside><div className="packaging-card"><div className="box-visual"><span /></div><h3>L’écrin Nicolas Flammèche</h3><p>Papier texturé, carte parfumée, pli soigné et signature dorée. Une expérience d’ouverture pensée comme un premier rituel.</p></div><div className="summary"><div><span>Sous-total</span><strong>{euro.format(subtotal)}</strong></div><div><span>Livraison</span><strong>{shipping ? euro.format(shipping) : 'Offerte'}</strong></div><div><span>Écrin parfumé</span><strong>Offert</strong></div><hr /><div><span>Total</span><strong>{euro.format(total)}</strong></div><button className="btn" onClick={onPay}>Confirmer la commande</button></div></aside></div></div></div>;
}

function Footer() {
  return <footer><div className="container footer-grid"><div><div className="brand"><span>Nicolas</span><em>Flammèche</em></div><p>Bougies artisanales façonnées dans les Hauts-de-France.</p></div><div><h4>Boutique</h4><a>Collection</a><a>Nouveautés</a></div><div><h4>Maison</h4><a>Atelier</a><a>Savoir-faire</a></div><div><h4>Service</h4><a>Livraison</a><a>Contact</a></div></div></footer>;
}

export default App;

