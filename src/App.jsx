import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
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
  const [deliveryMode, setDeliveryMode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState('');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  useEffect(() => {
    document.body.style.overflow = cartOpen || selectedProduct ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen, selectedProduct]);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('nicolas-flammeche-cart') || '[]');
      if (Array.isArray(savedCart)) {
        setCart(savedCart.flatMap(({ id, quantity }) => {
          const product = products.find((item) => item.id === id);
          return product && Number.isInteger(quantity) && quantity > 0
            ? [{ ...product, quantity: Math.min(quantity, 99) }]
            : [];
        }));
      }
    } catch {
      localStorage.removeItem('nicolas-flammeche-cart');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nicolas-flammeche-cart', JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity }))));
  }, [cart]);

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

  return (
    <>
      <nav className="nav">
        <a className="brand" href="#top"><span>Nicolas</span><em>Flammèche</em></a>
        <div className="nav-links">
          <a href="#collection">Collection</a>
          <a href="#rituel">Rituel</a>
          <a href="#atelier">L'Atelier</a>
        </div>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Ouvrir le panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`}>
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
                    <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Ajouter au panier</button>
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

      {cartOpen && <CartPage cart={cart} cartCount={cartCount} subtotal={subtotal} deliveryMode={deliveryMode} onDeliveryMode={setDeliveryMode} onClose={() => setCartOpen(false)} onQty={updateQty} onRemove={removeItem} onShop={() => { setCartOpen(false); document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' }); }} />}
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
  return <div className="modal-backdrop" onClick={onClose}><div className="product-modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={onClose}><X size={18} /></button><div className="modal-visual"><ProductVisual product={product} large /></div><div className="modal-copy"><span className="eyebrow">Expérience produit</span><h2>{product.name}</h2><p className="story">{product.story}</p><p>{product.notes}</p><div className="meta">{details.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><ProductPrice product={product} /><button className="btn" onClick={() => { onAdd(product); onClose(); }}>Ajouter au panier</button></div></div></div>;
}

function CartPage({ cart, cartCount, subtotal, deliveryMode, onDeliveryMode, onClose, onQty, onRemove, onShop }) {
  return <div className="cart-page-backdrop"><main className="cart-page" role="dialog" aria-modal="true" aria-labelledby="cart-page-title">
    <header className="cart-page-header"><a className="brand" href="#top" onClick={onClose}><span>Nicolas</span><em>Flammèche</em></a><button className="cart-back" onClick={onClose}><ArrowLeft size={16} /> Continuer mes achats</button><button className="cart-page-close" onClick={onClose} aria-label="Fermer le panier"><X size={19} /></button></header>
    <div className="cart-page-content"><div className="cart-page-heading"><span className="eyebrow">Votre sélection</span><h2 id="cart-page-title">Le panier</h2><p>{cartCount ? `${cartCount} article${cartCount > 1 ? 's' : ''} choisi${cartCount > 1 ? 's' : ''} avec soin.` : 'Votre panier sommeille encore.'}</p></div>
      {!cart.length ? <section className="cart-empty"><ShoppingBag size={32} strokeWidth={1.2} /><h3>Une lueur vous attend</h3><p>Découvrez Calambour et Petit Pin, deux bougies aux signatures singulières.</p><button className="btn" onClick={onShop}>Découvrir la collection</button></section> : <div className="cart-page-grid">
        <div className="cart-main-column"><section className="cart-section"><div className="cart-section-title"><h3>Vos bougies</h3><span>{cartCount} article{cartCount > 1 ? 's' : ''}</span></div>{cart.map((item) => <article className="cart-line" key={item.id}><div className="cart-line-photo"><ProductVisual product={item} /></div><div className="cart-line-info"><span className="eyebrow">Bougie artisanale</span><h4>{item.name}</h4><p>{euro.format(item.price)} · offre d’ouverture</p><div className="cart-line-actions"><div className="cart-quantity"><button onClick={() => onQty(item.id, -1)} aria-label={`Retirer une ${item.name} du panier`}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => onQty(item.id, 1)} aria-label={`Ajouter une ${item.name} au panier`}><Plus size={14} /></button></div><button className="remove-line" onClick={() => onRemove(item.id)}><Trash2 size={14} /> Retirer</button></div></div><strong className="cart-line-price">{euro.format(item.price * item.quantity)}</strong></article>)}</section>
          <section className="cart-section delivery-section"><div className="cart-section-title"><div><span className="eyebrow">À votre porte</span><h3>Mode de livraison</h3></div><span>Choisissez une option</span></div><div className="delivery-options">
            <label className={`delivery-option ${deliveryMode === 'colissimo' ? 'selected' : ''}`}><input type="radio" name="delivery" value="colissimo" checked={deliveryMode === 'colissimo'} onChange={() => onDeliveryMode('colissimo')} /><span className="delivery-icon"><Truck size={21} /></span><span className="delivery-copy"><strong>Colissimo</strong><small>Livraison à l’adresse de votre choix</small></span><span className="delivery-price">Tarif à confirmer</span></label>
            <label className={`delivery-option ${deliveryMode === 'mondial-relay' ? 'selected' : ''}`}><input type="radio" name="delivery" value="mondial-relay" checked={deliveryMode === 'mondial-relay'} onChange={() => onDeliveryMode('mondial-relay')} /><span className="delivery-icon"><MapPin size={21} /></span><span className="delivery-copy"><strong>Mondial Relay</strong><small>Point Relais® ou Locker à sélectionner</small></span><span className="delivery-price">Tarif à confirmer</span></label>
          </div><p className="delivery-note">Les tarifs seront affichés avant le paiement. Pour Mondial Relay, le choix du point de retrait se fera à l’étape de livraison.</p></section>
        </div><aside className="cart-summary"><span className="eyebrow">Récapitulatif</span><h3>Votre commande</h3><div className="cart-summary-row"><span>Sous-total</span><strong>{euro.format(subtotal)}</strong></div><div className="cart-summary-row"><span>Livraison</span><span className="muted">Selon le mode choisi</span></div><div className="cart-summary-total"><span>Total provisoire</span><strong>{euro.format(subtotal)}</strong></div><p className="cart-summary-note">Le montant de la livraison sera ajouté avant le règlement.</p><button className="btn cart-continue" disabled>{deliveryMode ? 'Paiement bientôt disponible' : 'Choisir une livraison'}</button><p className="cart-secure">Paiement sécurisé bientôt disponible via Stripe.</p><button className="cart-continue-shopping" onClick={onShop}>← Retourner à la collection</button></aside>
      </div>}
    </div>
  </main></div>;
}

function Footer() {
  return <footer><div className="container footer-grid"><div><div className="brand"><span>Nicolas</span><em>Flammèche</em></div><p>Bougies artisanales façonnées dans les Hauts-de-France.</p></div><div><h4>Boutique</h4><a>Collection</a><a>Nouveautés</a></div><div><h4>Maison</h4><a>Atelier</a><a>Savoir-faire</a></div><div><h4>Service</h4><a>Livraison</a><a>Contact</a></div></div></footer>;
}

export default App;

