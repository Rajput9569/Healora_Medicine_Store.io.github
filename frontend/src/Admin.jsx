import React, { useEffect, useState } from 'react';
import { Activity, Boxes, ClipboardList, Users, LogOut, Search, Plus, Pencil, Trash2, RefreshCw, ShieldCheck, X, Save, AlertTriangle, LayoutDashboard, Package } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost/healora/backend/api';
const blankProduct = {name:'',category:'Wellness',description:'',price:'',image_url:'',stock:'0',prescription_required:false};
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(n||0));
const date = s => s ? new Date(s.replace(' ','T')).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) : '—';

export default function Admin() {
 const [token,setToken]=useState(()=>sessionStorage.getItem('healora_admin_token')||'');
 const [username,setUsername]=useState(()=>sessionStorage.getItem('healora_admin_user')||'admin');
 const [password,setPassword]=useState('');
 const [section,setSection]=useState('Overview');
 const [data,setData]=useState(null);
 const [products,setProducts]=useState([]);
 const [orders,setOrders]=useState([]);
 const [customers,setCustomers]=useState([]);
 const [search,setSearch]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [editing,setEditing]=useState(null);
 const [productForm,setProductForm]=useState(blankProduct);
 const [showForm,setShowForm]=useState(false);

 async function api(path, options={}) {
   const response=await fetch(`${API}/${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(options.headers||{})}});
   const body=await response.json().catch(()=>({}));
   if(!response.ok) throw new Error(body.error||`Request failed (${response.status})`);
   return body;
 }
 async function login(e) {
   e.preventDefault();setError('');setBusy(true);
   try {
     const response=await fetch(`${API}/admin_login.php`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
     const result=await response.json();
     if(!response.ok)throw new Error(result.error||'Sign in failed.');
     sessionStorage.setItem('healora_admin_token',result.token);sessionStorage.setItem('healora_admin_user',result.username);
     setToken(result.token);setUsername(result.username);setPassword('');
   }catch(e){setError(e.message)}finally{setBusy(false)}
 }
 function logout(){sessionStorage.removeItem('healora_admin_token');sessionStorage.removeItem('healora_admin_user');setToken('');setData(null)}
 async function load() {
   if(!token)return;setError('');
   try {
     if(section==='Overview')setData(await api('admin_dashboard.php'));
     if(section==='Products')setProducts((await api(`admin_products.php?q=${encodeURIComponent(search)}`)).products||[]);
     if(section==='Orders')setOrders((await api(`admin_orders.php?q=${encodeURIComponent(search)}`)).orders||[]);
     if(section==='Customers')setCustomers((await api(`admin_customers.php?q=${encodeURIComponent(search)}`)).customers||[]);
   }catch(e){setError(e.message);if(e.message.toLowerCase().includes('sign-in'))logout()}
 }
 useEffect(()=>{load()},[token,section]);
 async function searchSubmit(e){e?.preventDefault();await load()}
 function openNew(){setEditing(null);setProductForm(blankProduct);setShowForm(true)}
 function openEdit(p){setEditing(p.id);setProductForm({...p,price:String(p.price),stock:String(p.stock),prescription_required:Number(p.prescription_required)===1});setShowForm(true)}
 async function saveProduct(e){
   e.preventDefault();setBusy(true);setError('');
   try{
     const payload={...productForm,price:Number(productForm.price),stock:Number(productForm.stock),prescription_required:!!productForm.prescription_required};
     await api('admin_products.php',{method:editing?'PUT':'POST',body:JSON.stringify(editing?{...payload,id:editing}:payload)});
     setShowForm(false);await load();
   }catch(e){setError(e.message)}finally{setBusy(false)}
 }
 async function deleteProduct(p){
   if(!window.confirm(`Delete "${p.name}"? If it is on an order, set stock to zero instead.`))return;
   try{await api('admin_products.php',{method:'DELETE',body:JSON.stringify({id:p.id})});await load()}catch(e){setError(e.message)}
 }
 async function updateStatus(id,status){try{await api('admin_orders.php',{method:'PATCH',body:JSON.stringify({id,status})});await load()}catch(e){setError(e.message)}}
 const menu=[['Overview',LayoutDashboard],['Products',Package],['Orders',ClipboardList],['Customers',Users]];
 if(!token) return <div className="admin-login-page"><div className="admin-login-card"><a href="/" className="admin-brand"><span><Activity/></span><b>healora<small>ADMIN CONSOLE</small></b></a><div className="admin-login-icon"><ShieldCheck size={28}/></div><h1>Welcome back</h1><p>Sign in to manage your demo store.</p>{error&&<div className="admin-error">{error}</div>}<form onSubmit={login} className="admin-form"><label>Username<input value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label><button className="admin-primary" disabled={busy}>{busy?'Signing in…':'Sign in to dashboard'}</button></form><div className="admin-login-foot"><ShieldCheck size={14}/> Local demo administrator access</div><a href="/" className="admin-back">← Back to storefront</a></div></div>;

 return <div className="admin-shell"><aside className="admin-sidebar"><a href="/" className="admin-brand"><span><Activity/></span><b>healora<small>ADMIN CONSOLE</small></b></a><div className="admin-side-label">WORKSPACE</div><nav>{menu.map(([label,Icon])=><button key={label} className={section===label?'selected':''} onClick={()=>{setSection(label);setSearch('')}}><Icon size={18}/>{label}{label==='Orders'&&data?.stats?.pending_orders>0&&<i>{data.stats.pending_orders}</i>}</button>)}</nav><div className="admin-sidebar-bottom"><div className="admin-avatar">{username.slice(0,1).toUpperCase()}</div><div><b>{username}</b><small>Store administrator</small></div><button title="Sign out" onClick={logout}><LogOut size={17}/></button></div></aside>
 <main className="admin-main"><header className="admin-topbar"><div><span className="admin-breadcrumb">Healora / </span><b>{section}</b></div><div className="admin-top-right"><span className="admin-live"><i/> Local demo</span><button onClick={load} title="Refresh"><RefreshCw size={16}/></button><a href="/" className="admin-store-link">View store ↗</a></div></header>
 <div className="admin-content"><div className="admin-page-heading"><div><div className="admin-kicker">STORE MANAGEMENT</div><h1>{section==='Overview'?'Good day, '+username+'.':section}</h1><p>{section==='Overview'?'Here’s what’s happening with your store today.':section==='Products'?'Create products, manage pricing and keep an eye on stock.':section==='Orders'?'Review customer orders and update fulfilment status.':'Customer details from submitted demo orders.'}</p></div>{section==='Products'&&<button className="admin-primary add-product" onClick={openNew}><Plus size={17}/> Add product</button>}</div>
 {error&&<div className="admin-error admin-inline-error"><AlertTriangle size={16}/>{error}<button onClick={()=>setError('')}><X size={15}/></button></div>}
 {section==='Overview'&&<>{!data?<div className="admin-loading">Loading dashboard…</div>:<><div className="admin-stat-grid"><Stat icon={Boxes} label="Total products" value={data.stats.products} tone="mint"/><Stat icon={ClipboardList} label="Total orders" value={data.stats.orders} tone="blue"/><Stat icon={Users} label="Customers" value={data.stats.customers} tone="peach"/><Stat icon={Activity} label="Order revenue*" value={money(data.stats.revenue)} tone="purple"/></div><div className="admin-stat-grid admin-stat-grid-small"><Stat icon={ClipboardList} label="Pending orders" value={data.stats.pending_orders} tone="peach"/><Stat icon={AlertTriangle} label="Low-stock products (≤5)" value={data.stats.low_stock} tone="rose"/></div><div className="admin-panels"><section className="admin-panel"><div className="admin-panel-head"><div><h2>Recent orders</h2><p>Latest customer activity</p></div><button className="admin-link-btn" onClick={()=>setSection('Orders')}>View all →</button></div><div className="admin-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{data.recent_orders.length?data.recent_orders.map(o=><tr key={o.id}><td>#{o.id}</td><td><b>{o.customer_name}</b><small>{o.email}</small></td><td>{money(o.total)}</td><td><Status status={o.status}/></td></tr>):<tr><td colSpan="4" className="admin-empty">No orders yet.</td></tr>}</tbody></table></div></section><section className="admin-panel"><div className="admin-panel-head"><div><h2>Stock watch</h2><p>Items with the lowest stock first</p></div><button className="admin-link-btn" onClick={()=>setSection('Products')}>Manage →</button></div><div className="stock-list">{data.low_stock_products.map(p=><div key={p.id} className="stock-row"><span className="stock-product-icon"><Package size={17}/></span><div><b>{p.name}</b><small>{p.category}</small></div><strong className={Number(p.stock)<=5?'stock-low':''}>{p.stock} left</strong></div>)}</div></section></div><p className="admin-footnote">*Revenue is a demo calculation from non-cancelled orders. It does not mean payment was collected.</p></>}</>}
 {section==='Products'&&<><SearchBar search={search} setSearch={setSearch} submit={searchSubmit} placeholder="Search products or categories…"/><div className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Prescription</th><th>Actions</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="admin-product-cell"><img src={p.image_url||'https://placehold.co/56x56?text=Item'} alt=""/><div><b>{p.name}</b><small>ID: {p.id}</small></div></div></td><td>{p.category}</td><td>{money(p.price)}</td><td><span className={Number(p.stock)<=5?'stock-pill low':'stock-pill'}>{p.stock}</span></td><td>{Number(p.prescription_required)===1?'Required':'No'}</td><td><div className="admin-actions"><button title="Edit product" onClick={()=>openEdit(p)}><Pencil size={15}/></button><button title="Delete product" onClick={()=>deleteProduct(p)}><Trash2 size={15}/></button></div></td></tr>)}{!products.length&&<tr><td colSpan="6" className="admin-empty">No products match your search.</td></tr>}</tbody></table></div></div></>}
 {section==='Orders'&&<><SearchBar search={search} setSearch={setSearch} submit={searchSubmit} placeholder="Search by order ID, customer or email…"/><div className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>Order / Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update status</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>#{o.id}</b><small>{date(o.created_at)}</small></td><td><b>{o.customer_name}</b><small>{o.email}</small><small>{o.phone}</small></td><td>{(o.items||[]).map(i=><div className="order-item-line" key={i.product_name}>{i.product_name} × {i.quantity}</div>)}</td><td>{money(o.total)}</td><td><Status status={o.status}/></td><td><select className="status-select" value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>{['Pending','Confirmed','Packed','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}{!orders.length&&<tr><td colSpan="6" className="admin-empty">No orders found.</td></tr>}</tbody></table></div></div></>}
 {section==='Customers'&&<><SearchBar search={search} setSearch={setSearch} submit={searchSubmit} placeholder="Search by name, email or phone…"/><div className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Non-cancelled order total*</th><th>Last order</th></tr></thead><tbody>{customers.map((c,i)=><tr key={c.email+i}><td><div className="customer-cell"><span>{c.customer_name?.slice(0,1)?.toUpperCase()||'C'}</span><div><b>{c.customer_name}</b><small>{c.email}</small></div></div></td><td>{c.phone}</td><td>{c.order_count}</td><td>{money(c.total_spend)}</td><td>{date(c.last_order)}</td></tr>)}{!customers.length&&<tr><td colSpan="5" className="admin-empty">No customer records yet. They appear after demo orders are placed.</td></tr>}</tbody></table></div></div><p className="admin-footnote">*Customer information is personal data. Use only for authorised store operations and apply appropriate privacy/security controls before launch.</p></>}
 <footer className="admin-footer">Healora Admin · Local demo environment <span>Secure this setup before public deployment.</span></footer>
 </div></main>
 {showForm&&<div className="admin-modal-backdrop"><form className="admin-product-modal" onSubmit={saveProduct}><div className="admin-modal-head"><div><div className="admin-kicker">{editing?'EDIT LISTING':'NEW LISTING'}</div><h2>{editing?'Edit product':'Add a product'}</h2></div><button type="button" className="admin-close" onClick={()=>setShowForm(false)}><X/></button></div><div className="admin-product-form"><label>Product name<input required maxLength="160" value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})}/></label><div className="admin-form-row"><label>Category<input required value={productForm.category} onChange={e=>setProductForm({...productForm,category:e.target.value})} placeholder="Wellness"/></label><label>Price (₹)<input required type="number" min="0" step=".01" value={productForm.price} onChange={e=>setProductForm({...productForm,price:e.target.value})}/></label></div><label>Description<textarea value={productForm.description||''} onChange={e=>setProductForm({...productForm,description:e.target.value})} rows="3"/></label><label>Image URL<input type="url" value={productForm.image_url||''} onChange={e=>setProductForm({...productForm,image_url:e.target.value})} placeholder="https://…"/></label><div className="admin-form-row"><label>Stock quantity<input required type="number" min="0" step="1" value={productForm.stock} onChange={e=>setProductForm({...productForm,stock:e.target.value})}/></label><label className="admin-checkbox-label"><input type="checkbox" checked={!!productForm.prescription_required} onChange={e=>setProductForm({...productForm,prescription_required:e.target.checked})}/> Prescription required</label></div></div><div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={()=>setShowForm(false)}>Cancel</button><button className="admin-primary" disabled={busy}><Save size={16}/>{busy?'Saving…':'Save product'}</button></div></form></div>}
 </div>;
}
function Stat({icon:Icon,label,value,tone}){return <div className="admin-stat-card"><span className={`admin-stat-icon ${tone}`}><Icon size={20}/></span><div><small>{label}</small><strong>{value}</strong></div></div>}
function Status({status}){return <span className={`order-status ${String(status).toLowerCase()}`}>{status}</span>}
function SearchBar({search,setSearch,submit,placeholder}){return <form className="admin-search" onSubmit={submit}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={placeholder}/><button>Search</button></form>}
