"use client";
import { useEffect, useState } from "react";

function Form({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    productName: "",
    brandName: "",
    imageUrl: "",
    shortDescription: "",
    application: "",
    keywords: "",
    colorPalette: "",
    productUrl: "",
    ...initial,
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form };
    payload.keywords = String(payload.keywords || "").split(",").map((s) => s.trim()).filter(Boolean);
    payload.colorPalette = String(payload.colorPalette || "").split(",").map((s) => s.trim()).filter(Boolean);
    await onSave(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <input name="productName" value={form.productName} onChange={onChange} placeholder="Product Name" className="input" required />
        <input name="brandName" value={form.brandName} onChange={onChange} placeholder="Brand Name" className="input" />
        <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="Image URL" className="input" />
        <input name="productUrl" value={form.productUrl} onChange={onChange} placeholder="Product URL" className="input" />
        <input name="application" value={form.application} onChange={onChange} placeholder="Application" className="input" />
        <input name="colorwayName" value={form.colorwayName || ''} onChange={onChange} placeholder="Colorway" className="input" />
      </div>
      <textarea name="shortDescription" value={form.shortDescription} onChange={onChange} placeholder="Short description" className="input" />
      <input name="keywords" value={form.keywords} onChange={onChange} placeholder="Keywords (comma-separated)" className="input" />
      <input name="colorPalette" value={form.colorPalette} onChange={onChange} placeholder="Color Palette (comma-separated)" className="input" />
      <div className="flex gap-3">
        <button className="btn-theme">Save</button>
        <button type="button" onClick={onCancel} className="btn-theme bg-gray-200 text-gray-800">Cancel</button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function load(page = 1) {
    const res = await fetch(`/api/products/manage?page=${page}`, { headers: { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || '' } });
    const data = await res.json();
    if (data.success) setItems(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  async function createItem(values) {
    const res = await fetch('/api/products/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || '' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (data.success) { setShowForm(false); load(); }
  }

  async function updateItem(values) {
    const res = await fetch(`/api/products/manage?id=${editing._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || '' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (data.success) { setEditing(null); setShowForm(false); load(); }
  }

  async function deleteItem(id) {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/manage?id=${id}`, { method: 'DELETE', headers: { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || '' } });
    const data = await res.json();
    if (data.success) load();
  }

  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[--theme]">Admin</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-theme">Add Product</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-6">
          <Form
            initial={editing || {}}
            onSave={editing ? updateItem : createItem}
            onCancel={() => { setEditing(null); setShowForm(false); }}
          />
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Image</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Brand</th>
              <th className="text-left p-2">Application</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-2"><img src={p.imageUrl} className="w-14 h-14 object-cover rounded" /></td>
                <td className="p-2">{p.productName}</td>
                <td className="p-2">{p.brandName}</td>
                <td className="p-2">{p.application}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => { setEditing(p); setShowForm(true); }} className="btn-theme">Edit</button>
                  <button onClick={() => deleteItem(p._id)} className="btn-theme bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
