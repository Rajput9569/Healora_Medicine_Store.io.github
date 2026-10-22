import React, { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingBag, HeartPulse, ShieldCheck, Truck, Clock3, Plus, Minus, X, Menu, ArrowRight, Phone, MapPin, CheckCircle2 } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost/healora/backend/api';
const categories = ['All', 'Wellness', 'Vitamins', 'Devices', 'First Aid', 'Personal Care'];
const fallbackProducts = [
 {id:1,name:'Daily Wellness Multivitamin',category:'Wellness',description:'A demo listing for everyday wellness products.',price:'299.00',image_url:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',prescription_required:0,stock:80},
 {id:2,name:'Vitamin C Tablets',category:'Vitamins',description:'Sample vitamin product listing.',price:'189.00',image_url:'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf4?auto=format&fit=crop&w=800&q=80',prescription_required:0,stock:65},
 {id:3,name:'Digital Thermometer',category:'Devices',description:'Digital thermometer for home temperature checks.',price:'249.00',image_url:'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',prescription_required:0,stock:30},
 {id:4,name:'First Aid Kit',category:'First Aid',description:'A compact first-aid kit for household preparedness.',price:'399.00',image_url:'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80',prescription_required:0,stock:25},
 {id:5,name:'Hand Sanitizer',category:'Personal Care',description:'Hand hygiene product demo listing.',price:'99.00',image_url:'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=80',prescription_required:0,stock:100},
 {id:6,name:'Prescription Medicine (Demo Only)',category:'Prescription',description:'Placeholder only. Not available for purchase in this demo.',price:'120.00',image_url:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',prescription_required:1,stock:10}
];

function App() {
 const [products, setProducts] = useState(fallbackProducts);
 const [query, setQuery] = useState('');
 const [category, setCategory] = useState('All');
 const [cart, setCart] = useState([]);
 const [cartOpen, setCartOpen] = useState(false);
 const [checkoutOpen, setCheckoutOpen] = useState(false);
 const [notice, setNotice] = useState('');
 const [loading, setLoading] = useState(false);
 const [mobileMenu, setMobileMenu] = useState(false);
 const [form, setForm] = useState({customer_name:'',email:'',phone:'',address:'',city:'',pincode:''});

 useEffect(() => {
   fetch(`${API}/products.php`).then(r => r.ok ? r.json() : Promise.reject()).then(d => {
     if (Array.isArray(d.products) && d.products.length) setProducts(d.products);
   }).catch(() => setNotice('Preview mode: showing sample products. Start the PHP API to load your database.'));
 }, []);

 const filtered = useMemo(() => products.filter(p =>
   (category === 'All' || p.category === category) &&
   `${p.name} ${p.category} ${p.description || ''}`.toLowerCase().includes(query.toLowerCase()) &&
   Number(p.prescription_required) !== 1
 ), [products, query, category]);
 const count = cart.reduce((n, item) => n + item.quantity, 0);
 const total = cart.reduce((n, item) => n + Number(item.price) * item.quantity, 0);
 const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);

 const add = product => {
   setCart(old => {
     const found = old.find(i => i.id === product.id);
     return found ? old.map(i => i.id === product.id ? {...i,quantity:Math.min(i.quantity+1,20)} : i) : [...old,{...product,quantity:1}];
   });
   setNotice(`${product.name} added to your bag.`);
 };
 const changeQty = (id, delta) => setCart(old => old.map(i => i.id === id ? {...i,quantity:i.quantity+delta} : i).filter(i => i.quantity > 0));
 const setField = e => setForm({...form,[e.target.name]:e.target.value});

 async function placeOrder(e) {
   e.preventDefault();
   if (!cart.length) return;
   setLoading(true); setNotice('');
   try {
     const response = await fetch(`${API}/orders.php`, {
       method:'POST', headers:{'Content-Type':'application/json'},
       body:JSON.stringify({...form,items:cart.map(i=>({product_id:Number(i.id),quantity:i.quantity}))})
     });
     const data = await response.json();
     if (!response.ok) throw new Error(data.error || 'Order could not be placed.');
     setNotice(`Thank you! Demo order #${data.order_id} was placed. Total: ${money(data.total)}. No payment was taken.`);
     setCart([]); setCheckoutOpen(false); setCartOpen(false);
   } catch (err) {
     setNotice(`Checkout unavailable: ${err.message}. Confirm PHP API/database setup. This demo does not take payment.`);
   } finally { setLoading(false); }
 }

 return <div className="app">
   <div className="topbar"><span><Truck size={15}/> Free delivery on demo orders over ₹499</span><span className="top-right">Healthcare essentials, with care <span className="dot">•</span> Customer support: 1800-000-HEAL</span></div>
   <header className="header">
    <button className="icon-btn mobile-only" aria-label="Open menu" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button>
    <a className="brand" href="#home"><span className="brand-mark"><HeartPulse size={25}/></span><span>healora<small>CARE, DELIVERED.</small></span></a>
    <div className="searchbox"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search medicines, vitamins & healthcare..." aria-label="Search products"/><kbd>⌘ K</kbd></div>
    <nav className={mobileMenu?'nav nav-open':'nav'}><a href="#shop" onClick={()=>setMobileMenu(false)}>Shop</a><a href="#benefits" onClick={()=>setMobileMenu(false)}>Why Healora</a><a href="#help" onClick={()=>setMobileMenu(false)}>Help</a></nav>
    <button className="bag-btn" onClick={()=>setCartOpen(true)}><ShoppingBag size={19}/><span>My bag</span><b>{count}</b></button>
   </header>

   {notice && <div className="notice"><span>{notice}</span><button aria-label="Dismiss message" onClick={()=>setNotice('')}><X size={16}/></button></div>}

   <main>
    <section className="hero" id="home">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-icon"><HeartPulse size={14}/></span> YOUR WELLNESS, OUR PRIORITY</div>
       <h1>Feel better.<br/><em>Live brighter.</em></h1>
       <p>Your everyday healthcare essentials, thoughtfully selected and delivered with care. A healthier routine starts with small steps.</p>
       <div className="hero-actions"><a className="primary-btn" href="#shop">Explore products <ArrowRight size={17}/></a><a className="text-btn" href="#benefits">Why shop with us?</a></div>
       <div className="hero-proof"><div className="avatars"><span>✓</span><span>+</span><span>♥</span></div><div><strong>Care you can count on</strong><small>Convenience for everyday wellness</small></div></div>
      </div>
      <div className="hero-art"><div className="hero-image"><img src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=85" alt="Healthcare products arranged neatly"/></div><div className="floating-card card-top"><span className="float-icon green"><ShieldCheck size={20}/></span><div><b>Carefully selected</b><small>Everyday essentials</small></div></div><div className="floating-card card-bottom"><span className="float-icon peach"><Truck size={20}/></span><div><b>At your doorstep</b><small>Easy online shopping</small></div></div><div className="hero-stamp">YOUR<br/>HEALTH<br/><strong>MATTERS</strong></div></div>
    </section>

    <section className="benefit-strip" id="benefits"><div><span><ShieldCheck/></span><p><b>Quality-first selection</b><small>Essentials from trusted categories</small></p></div><div><span><Truck/></span><p><b>Convenient delivery</b><small>Simple checkout experience</small></p></div><div><span><Clock3/></span><p><b>Easy ordering</b><small>Shop at your own pace</small></p></div><div><span><HeartPulse/></span><p><b>Care comes first</b><small>Health and safety matter</small></p></div></section>

    <section className="shop-section" id="shop"><div className="section-heading"><div><div className="eyebrow">THE HEALORA EDIT</div><h2>Everyday care, <em>made easy.</em></h2><p>Explore essentials to support your daily wellness routine.</p></div><span className="product-count">{filtered.length} products</span></div>
     <div className="category-row">{categories.map(c=><button key={c} className={category===c?'category active':'category'} onClick={()=>setCategory(c)}>{c}</button>)}</div>
     {filtered.length ? <div className="product-grid">{filtered.map((p,idx)=><article className="product-card" key={p.id}><div className="product-image"><img src={p.image_url} alt={p.name} loading="lazy"/><span className="product-tag">{idx===0?'BESTSELLER':p.category.toUpperCase()}</span><button className="heart-btn" aria-label={`Add ${p.name} to wishlist`} onClick={()=>setNotice('Wishlist is a visual demo feature. Sign-in can be added next.')}><span>♡</span></button></div><div className="product-info"><small className="product-category">{p.category}</small><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><strong>{money(Number(p.price))}</strong><button className="add-btn" onClick={()=>add(p)}><Plus size={16}/> Add</button></div></div></article>)}</div> : <div className="empty-results"><Search size={28}/><h3>No products found</h3><p>Try another search or choose a different category.</p><button className="text-btn" onClick={()=>{setQuery('');setCategory('All')}}>Clear filters</button></div>}
    </section>

    <section className="care-banner"><div className="care-icon"><HeartPulse size={32}/></div><div><span className="eyebrow">A LITTLE REMINDER</span><h2>Your health is personal.<br/><em>Your care should be, too.</em></h2><p>For diagnosis, medicine choices, or treatment advice, speak with a qualified healthcare professional.</p></div><a href="#help" className="outline-btn">Get in touch <ArrowRight size={16}/></a></section>
    <section className="help-section" id="help"><div><span className="eyebrow">HERE FOR YOU</span><h2>Questions? We're happy to help.</h2><p>This is a sample storefront. Contact and support details should be replaced with your real business information before launch.</p></div><div className="help-item"><Phone/><span><small>Customer care</small><b>1800-000-HEAL</b></span></div><div className="help-item"><MapPin/><span><small>Service area</small><b>India (demo)</b></span></div></section>
   </main>

   <footer><a className="brand footer-brand" href="#home"><span className="brand-mark"><HeartPulse size={22}/></span><span>healora<small>CARE, DELIVERED.</small></span></a><p>© 2026 Healora Demo Store. Built with care.</p><div className="footer-links"><a href="#shop">Shop</a><a href="#benefits">About</a><a href="#help">Contact</a></div><p className="disclaimer">Demo only. Product listings are illustrative and are not medical advice. Prescription medicines require appropriate prescription checks and pharmacist review where applicable.</p></footer>
   {cartOpen && <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setCartOpen(false)}}><aside className="drawer"><div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h2>My bag <small>({count})</small></h2></div><button className="icon-btn" onClick={()=>setCartOpen(false)}><X/></button></div>
    {!cart.length ? <div className="cart-empty"><ShoppingBag size={38}/><h3>Your bag is waiting</h3><p>Add a few healthcare essentials to get started.</p><button className="primary-btn" onClick={()=>setCartOpen(false)}>Explore products <ArrowRight size={16}/></button></div> : <><div className="cart-items">{cart.map(i=><div className="cart-item" key={i.id}><img src={i.image_url} alt=""/><div className="cart-item-info"><b>{i.name}</b><small>{money(Number(i.price))}</small><div className="qty"><button onClick={()=>changeQty(i.id,-1)}><Minus size={13}/></button><span>{i.quantity}</span><button onClick={()=>changeQty(i.id,1)}><Plus size={13}/></button></div></div><strong>{money(Number(i.price)*i.quantity)}</strong></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><b>{money(total)}</b></div><small>Delivery charges, if any, are confirmed by the store.</small><button className="primary-btn full" onClick={()=>{setCartOpen(false);setCheckoutOpen(true)}}>Continue to checkout <ArrowRight size={16}/></button><p className="safe-note"><ShieldCheck size={15}/> Demo checkout — no payment is collected.</p></div></>}
   </aside></div>}
   {checkoutOpen && <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setCheckoutOpen(false)}}><div className="checkout-modal"><div className="drawer-head"><div><span className="eyebrow">ALMOST THERE</span><h2>Delivery details</h2></div><button className="icon-btn" onClick={()=>setCheckoutOpen(false)}><X/></button></div><p className="checkout-intro">Enter your details to create a demo order. No payment will be taken.</p><form onSubmit={placeOrder} className="checkout-form"><label>Full name<input name="customer_name" value={form.customer_name} onChange={setField} required maxLength="140" placeholder="Your full name"/></label><div className="form-pair"><label>Email address<input name="email" type="email" value={form.email} onChange={setField} required placeholder="you@example.com"/></label><label>Phone number<input name="phone" value={form.phone} onChange={setField} required maxLength="30" placeholder="Mobile number"/></label></div><label>Delivery address<textarea name="address" value={form.address} onChange={setField} required maxLength="1000" placeholder="House no., street, area"/></label><div className="form-pair"><label>City<input name="city" value={form.city} onChange={setField} required placeholder="City"/></label><label>PIN code<input name="pincode" value={form.pincode} onChange={setField} required maxLength="12" placeholder="PIN code"/></label></div><div className="checkout-total"><span>Order total</span><b>{money(total)}</b></div><button className="primary-btn full" type="submit" disabled={loading}>{loading?'Placing demo order…':<>Place demo order <ArrowRight size={16}/></>}</button><p className="safe-note"><ShieldCheck size={15}/> Your information is sent to your local demo backend.</p></form></div></div>}
   <div className="toast-space" aria-live="polite"/>
 </div>
}
export default App;
