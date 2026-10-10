import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import './App.css';

const products = [
  { id: 1, name: 'Calambour', notes: 'Bougie artisanale Nicolas Flammèche', story: 'La photo officielle de Calambour révèle son verre transparent, sa cire claire et son étiquette cuivrée.', price: 25, originalPrice: 30, badge: 'Offre ouverture', image: '/images/calambour.webp', wax: '#f5ead0', glass: '#d19a62' },
  { id: 2, name: 'Petit Pin', notes: 'Bougie artisanale Nicolas Flammèche', story: 'La photo officielle de Petit Pin révèle son verre transparent, sa cire claire et son étiquette vert olive.', price: 25, originalPrice: 30, badge: 'Offre ouverture', image: '/images/petit-pin.webp', wax: '#f5ead0', glass: '#858344' }
];

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const deliveryRates = { colissimo: 9.59, 'mondial-relay': 5.99 };

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
  const [termsOpen, setTermsOpen] = useState(false);

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

      <section className="marquee" aria-label="Offre spéciale ouverture du site"><div><span>Offre spéciale ouverture du site&nbsp; ✦ &nbsp;Offre spéciale ouverture du site&nbsp; ✦ &nbsp;</span><span aria-hidden="true">Offre spéciale ouverture du site&nbsp; ✦ &nbsp;Offre spéciale ouverture du site&nbsp; ✦ &nbsp;</span></div></section>

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
        <Footer onOpenCart={() => setCartOpen(true)} onOpenTerms={() => setTermsOpen(true)} />
      </main>

      {cartOpen && <CartPage cart={cart} cartCount={cartCount} subtotal={subtotal} deliveryMode={deliveryMode} onDeliveryMode={setDeliveryMode} onClose={() => setCartOpen(false)} onQty={updateQty} onRemove={removeItem} onShop={() => { setCartOpen(false); document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' }); }} />}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />}
      {termsOpen && <ConditionsPage onClose={() => setTermsOpen(false)} />}
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
  const shipping = deliveryMode ? deliveryRates[deliveryMode] : 0;
  const total = subtotal + shipping;
  return <div className="cart-page-backdrop"><main className="cart-page" role="dialog" aria-modal="true" aria-labelledby="cart-page-title">
    <header className="cart-page-header"><a className="brand" href="#top" onClick={onClose}><span>Nicolas</span><em>Flammèche</em></a><button className="cart-back" onClick={onClose}><ArrowLeft size={16} /> Continuer mes achats</button><button className="cart-page-close" onClick={onClose} aria-label="Fermer le panier"><X size={19} /></button></header>
    <div className="cart-page-content"><div className="cart-page-heading"><span className="eyebrow">Votre sélection</span><h2 id="cart-page-title">Le panier</h2><p>{cartCount ? `${cartCount} article${cartCount > 1 ? 's' : ''} choisi${cartCount > 1 ? 's' : ''} avec soin.` : 'Votre panier sommeille encore.'}</p></div>
      {!cart.length ? <section className="cart-empty"><ShoppingBag size={32} strokeWidth={1.2} /><h3>Une lueur vous attend</h3><p>Découvrez Calambour et Petit Pin, deux bougies aux signatures singulières.</p><button className="btn" onClick={onShop}>Découvrir la collection</button></section> : <div className="cart-page-grid">
        <div className="cart-main-column"><section className="cart-section"><div className="cart-section-title"><h3>Vos bougies</h3><span>{cartCount} article{cartCount > 1 ? 's' : ''}</span></div>{cart.map((item) => <article className="cart-line" key={item.id}><div className="cart-line-photo"><ProductVisual product={item} /></div><div className="cart-line-info"><span className="eyebrow">Bougie artisanale</span><h4>{item.name}</h4><p>{euro.format(item.price)} · offre d’ouverture</p><div className="cart-line-actions"><div className="cart-quantity"><button onClick={() => onQty(item.id, -1)} aria-label={`Retirer une ${item.name} du panier`}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => onQty(item.id, 1)} aria-label={`Ajouter une ${item.name} au panier`}><Plus size={14} /></button></div><button className="remove-line" onClick={() => onRemove(item.id)}><Trash2 size={14} /> Retirer</button></div></div><strong className="cart-line-price">{euro.format(item.price * item.quantity)}</strong></article>)}</section>
          <section className="cart-section delivery-section"><div className="cart-section-title"><div><span className="eyebrow">À votre porte</span><h3>Mode de livraison</h3></div><span>Choisissez une option</span></div><div className="delivery-options">
            <label className={`delivery-option ${deliveryMode === 'colissimo' ? 'selected' : ''}`}><input type="radio" name="delivery" value="colissimo" checked={deliveryMode === 'colissimo'} onChange={() => onDeliveryMode('colissimo')} /><span className="delivery-icon"><Truck size={21} /></span><span className="delivery-copy"><strong>Colissimo</strong><small>Livraison à l’adresse de votre choix · France métropolitaine</small></span><span className="delivery-price">{euro.format(deliveryRates.colissimo)}</span></label>
            <label className={`delivery-option ${deliveryMode === 'mondial-relay' ? 'selected' : ''}`}><input type="radio" name="delivery" value="mondial-relay" checked={deliveryMode === 'mondial-relay'} onChange={() => onDeliveryMode('mondial-relay')} /><span className="delivery-icon"><MapPin size={21} /></span><span className="delivery-copy"><strong>Mondial Relay</strong><small>Point Relais® ou Locker · France métropolitaine</small></span><span className="delivery-price">{euro.format(deliveryRates['mondial-relay'])}</span></label>
          </div><p className="delivery-note">Tarifs forfaitaires pour la France métropolitaine. Le point de retrait Mondial Relay sera à choisir avant le paiement.</p></section>
        </div><aside className="cart-summary"><span className="eyebrow">Récapitulatif</span><h3>Votre commande</h3><div className="cart-summary-row"><span>Sous-total</span><strong>{euro.format(subtotal)}</strong></div><div className="cart-summary-row"><span>Livraison</span><strong>{deliveryMode ? euro.format(shipping) : 'À choisir'}</strong></div><div className="cart-summary-total"><span>Total provisoire</span><strong>{euro.format(total)}</strong></div><p className="cart-summary-note">Forfait de livraison pour la France métropolitaine.</p><button className="btn cart-continue" disabled>{deliveryMode ? 'Paiement bientôt disponible' : 'Choisir une livraison'}</button><p className="cart-secure">Le paiement Stripe sera activé dès que le compte sera configuré.</p><button className="cart-continue-shopping" onClick={onShop}>← Retourner à la collection</button></aside>
      </div>}
    </div>
  </main></div>;
}

function ConditionsPage({ onClose }) {
  return <div className="terms-backdrop"><main className="terms-page" role="dialog" aria-modal="true" aria-labelledby="terms-title">
    <header className="cart-page-header"><a className="brand" href="#top" onClick={onClose}><span>Nicolas</span><em>Flammèche</em></a><button className="cart-back" onClick={onClose}><ArrowLeft size={16} /> Retour au site</button><button className="cart-page-close" onClick={onClose} aria-label="Fermer les conditions générales"><X size={19} /></button></header>
    <article className="terms-content">
      <div className="terms-draft-notice"><strong>Version provisoire — boutique non ouverte aux commandes</strong><p>Cette page est publiée à titre informatif. Les éléments entre crochets doivent être complétés avec les informations exactes de l’entreprise avant toute vente. L’absence de nom de domaine ne modifie pas ces obligations. La commande en ligne et les paiements ne sont pas encore activés.</p></div>
      <span className="eyebrow">Informations boutique</span><h1 id="terms-title">Conditions générales de vente</h1><p className="terms-updated">Projet de conditions pour la boutique en ligne Nicolas Flammèche · version du 10 octobre 2026</p>

      <section><h2>1. Vendeur et champ d’application</h2><p>Les présentes conditions encadrent les ventes de bougies artisanales proposées sur le site Nicolas Flammèche aux consommateurs. Le vendeur est :</p><ul><li>Nom ou dénomination sociale : <strong>[NOM ET PRÉNOM DE L’ENTREPRENEUR À COMPLÉTER]</strong></li><li>Nom commercial : Nicolas Flammèche</li><li>Statut et forme juridique : <strong>Entrepreneur individuel relevant du régime micro-entrepreneur</strong></li><li>Adresse postale : <strong>[À COMPLÉTER]</strong></li><li>SIRET : <strong>[À COMPLÉTER]</strong></li><li>Courriel et téléphone : <strong>[À COMPLÉTER]</strong></li><li>TVA : <strong>[RÉGIME ET NUMÉRO À CONFIRMER]</strong></li></ul></section>

      <section><h2>2. Produits et prix</h2><p>La boutique propose notamment les bougies Calambour et Petit Pin. Leurs caractéristiques essentielles sont présentées sur leurs fiches produit. Les prix affichés sont en euros ; leur statut au regard de la TVA et les frais applicables doivent être confirmés par le vendeur avant publication. Les frais de livraison sont indiqués avant la validation de toute commande.</p><p>Les prix et éventuelles réductions applicables sont ceux affichés au moment de la commande. Une commande n’est définitive qu’après confirmation du paiement.</p></section>

      <section><h2>3. Commande et paiement</h2><p>Le client vérifie le contenu de son panier, choisit son mode de livraison et corrige toute erreur avant de confirmer la commande avec obligation de paiement. Les moyens de paiement envisagés sont le paiement sécurisé par carte bancaire, PayPal et le chèque envoyé par courrier. Le chèque devra être établi à l’ordre de <strong>[NOM JURIDIQUE DU BÉNÉFICIAIRE À CONFIRMER]</strong> et envoyé à <strong>[ADRESSE POSTALE À COMPLÉTER]</strong>. La préparation d’une commande réglée par chèque ne commencera qu’après réception et encaissement du chèque ; le délai de règlement à prévoir sera indiqué au client avant la validation.</p><p><strong>Le paiement en ligne n’est pas encore activé et les commandes par chèque ne sont pas encore organisées : aucune commande ne peut actuellement être conclue sur le site.</strong></p></section>

      <section><h2>4. Livraison</h2><p>La livraison prévue est limitée à la France métropolitaine, par Colissimo à domicile ou Mondial Relay en Point Relais®/Locker. Les tarifs actuellement affichés dans le panier sont des forfaits de 9,59 € et 5,99 €. Le point relais, le poids maximal pris en charge et tout éventuel complément restent à préciser.</p><p>Délai de préparation et délai de livraison : <strong>[À CONFIRMER AVANT OUVERTURE DES COMMANDES]</strong>. Adresse de retour : <strong>[À COMPLÉTER]</strong>.</p></section>

      <section><h2>5. Droit de rétractation</h2><p>Pour une vente à distance, le consommateur dispose en principe de quatorze jours à compter de la réception du bien pour notifier sa décision de se rétracter, sans avoir à motiver sa décision. Il dispose ensuite de quatorze jours pour renvoyer le bien. Les frais directs de retour sont à la charge du consommateur si celui-ci en a été informé avant la commande. Le remboursement intervient selon les conditions et délais légaux.</p><p>Depuis le 19 juin 2026, une fonctionnalité gratuite et facilement accessible doit permettre d’exercer le droit de rétractation directement depuis l’interface en ligne. Cette fonctionnalité doit encore être mise en place avant l’ouverture des commandes. Coordonnées et adresse de retour : <strong>[À COMPLÉTER]</strong>.</p><div className="terms-form"><h3>Modèle de formulaire de rétractation</h3><p>À l’attention de [nom du vendeur, adresse postale et adresse électronique] :</p><p>Je vous notifie ma rétractation du contrat portant sur la vente du bien suivant : [produit].</p><p>Commandé le / reçu le : [date] · Nom : [nom] · Adresse : [adresse] · Date : [date].</p></div></section>

      <section><h2>6. Garanties légales</h2><p>Le consommateur bénéficie des garanties légales applicables, notamment de la garantie légale de conformité et de la garantie contre les vices cachés, dans les conditions prévues par le Code de la consommation et le Code civil. Les droits attachés à ces garanties ne sont pas supprimés par les présentes conditions.</p></section>

      <section><h2>7. Réclamations et médiation</h2><p>Pour toute réclamation, le client peut contacter le vendeur à <strong>[ADRESSE ÉLECTRONIQUE ET ADRESSE POSTALE À COMPLÉTER]</strong>. Après une démarche écrite préalable auprès du vendeur, le consommateur peut saisir gratuitement le médiateur de la consommation auquel le vendeur a adhéré :</p><ul><li>Nom du médiateur : <strong>[À COMPLÉTER]</strong></li><li>Adresse et site de saisine : <strong>[À COMPLÉTER]</strong></li></ul></section>

      <section><h2>8. Droit applicable</h2><p>Les présentes conditions relèvent du droit français, sous réserve des dispositions impératives de protection accordées au consommateur par la loi applicable à sa résidence. Les juridictions compétentes sont déterminées conformément aux règles de droit commun.</p></section>

      <section className="terms-checklist"><h2>Informations nécessaires pour finaliser cette page</h2><p>Nom juridique, statut, adresse, SIRET, coordonnées de contact, régime de TVA, médiateur auquel l’entreprise adhère, délais et périmètre de livraison, politique de retour, nom exact du bénéficiaire et adresse d’envoi des chèques, modalités de paiement, poids/limites des colis et identifiant REP si applicable. Le formulaire de rétractation en ligne doit également être développé avant l’ouverture des ventes.</p></section>
      <p className="terms-disclaimer">Ce projet reprend les informations connues et les exigences générales publiées par les autorités françaises. Il doit être complété à partir de la situation réelle du vendeur avant toute publication ou vente.</p>
    </article>
  </main></div>;
}

function Footer({ onOpenCart, onOpenTerms }) {
  return <footer><div className="container footer-grid"><div><a className="brand" href="#top"><span>Nicolas</span><em>Flammèche</em></a><p>Bougies artisanales façonnées dans les Hauts-de-France.</p></div><div><h4>Boutique</h4><a href="#collection">Collection</a><a href="#collection">Nouveautés</a></div><div><h4>Maison</h4><a href="#atelier">Atelier</a><a href="#rituel">Savoir-faire</a></div><div><h4>Service</h4><button className="footer-link" onClick={onOpenCart}>Livraison</button><button className="footer-link" onClick={onOpenTerms}>Conditions générales de vente</button><span className="footer-link-placeholder">Contact</span></div></div></footer>;
}

export default App;




