'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Category {
    id: string;
    name: string;
    code: string;
    description?: string;
    imageUrl?: string | null;
}

interface ProductImage {
    id: string;
    imageUrl: string;
    thumbnailUrl?: string | null;
    fileName: string;
    fileSize: number;
    mimeType: string;
    isPrimary: boolean;
}

interface ProductDocument {
    id: string;
    documentType: string;
    title: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    revision: string;
}

interface Product {
    id: string;
    partNumber: string;
    name: string;
    description?: string;
    categoryId: string;
    category?: { name: string; code: string; imageUrl?: string | null };
    uom: string;
    materialType: string;
    drawingNumber: string | null;
    revisionNumber: string;
    standardCost: string;
    sellingPrice: string;
    minStockLevel: string;
    maxStockLevel: string;
    reorderPoint: string;
    hsnCode: string | null;
    mainImageUrl?: string | null;
    images?: ProductImage[];
    documents?: ProductDocument[];
    isActive: boolean;
}

interface BomItem {
    id: string;
    parentProductId: string;
    rawMaterialProductId: string;
    rawMaterial?: {
        name: string;
        partNumber: string;
        standardCost: string;
    };
    quantityRequired: string;
    scrapAllowancePercent: string;
    machiningTimeMinutes: string;
    toolingCostPerUnit: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [materialFilter, setMaterialFilter] = useState('');

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
    const [selectedProductBom, setSelectedProductBom] = useState<{
        bomItems: BomItem[];
        costingBreakdown?: {
            rawMaterialTotal: string;
            toolingTotal: string;
            totalMachiningMinutes: number;
            machineLaborCost: string;
            totalNetManufacturingCost: string;
        };
    } | null>(null);

    // Zoom Image State
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Media Upload in Product Details
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [mediaUploadType, setMediaUploadType] = useState<'image' | 'document'>('image');
    const [docTypeForm, setDocTypeForm] = useState('engineering_drawing');
    const [docTitleForm, setDocTitleForm] = useState('');

    // Toast
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4500);
    };

    // New Product Form
    const [productForm, setProductForm] = useState({
        partNumber: '',
        name: '',
        description: '',
        categoryId: '',
        uom: 'PCS',
        materialType: 'Steel' as const,
        drawingNumber: '',
        revisionNumber: 'Rev 0',
        standardCost: '250.00',
        sellingPrice: '380.00',
        minStockLevel: '10.00',
        maxStockLevel: '1000.00',
        reorderPoint: '25.00',
        hsnCode: '8483',
        mainImageUrl: '',
        isActive: true,
    });

    // Category Creation
    const [catForm, setCatForm] = useState({
        name: '',
        code: '',
        description: '',
        imageUrl: '',
    });
    const [catImagePreview, setCatImagePreview] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/products/categories');
            const data = await res.json();
            if (data.success && data.categories.length > 0) {
                setCategories(data.categories);
                if (!productForm.categoryId) {
                    setProductForm((prev) => ({ ...prev, categoryId: data.categories[0].id }));
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (categoryFilter) params.set('categoryId', categoryFilter);
            if (materialFilter) params.set('material', materialFilter);

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load full details for a product (Images + CAD Documents + BOM)
    const loadProductDetails = async (productId: string) => {
        try {
            const [mediaRes, bomRes] = await Promise.all([
                fetch(`/api/products/${productId}/media`),
                fetch(`/api/products/${productId}/bom`),
            ]);

            const mediaData = await mediaRes.json();
            const bomData = await bomRes.json();

            if (mediaData.success) {
                setSelectedProductDetails({
                    ...mediaData.product,
                    images: mediaData.images,
                    documents: mediaData.documents,
                });
            }
            if (bomData.success) {
                setSelectedProductBom({
                    bomItems: bomData.bomItems || [],
                    costingBreakdown: bomData.costingBreakdown,
                });
            }
        } catch {
            showToast('Failed to load product details', 'error');
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [search, categoryFilter, materialFilter]);

    // Handle Uploading Product Media (Image or CAD Document)
    const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedProductDetails) return;

        setIsUploadingMedia(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('productId', selectedProductDetails.id);
            formData.append('uploadType', mediaUploadType);
            formData.append('documentType', docTypeForm);
            formData.append('title', docTitleForm || file.name);

            const res = await fetch('/api/products/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                showToast(data.message);
                // Reload details
                loadProductDetails(selectedProductDetails.id);
                fetchProducts();
            } else {
                showToast(data.error || 'Upload failed', 'error');
            }
        } catch {
            showToast('Network error during file upload', 'error');
        } finally {
            setIsUploadingMedia(false);
            e.target.value = '';
        }
    };

    // Handle Category Photo Upload
    const handleCategoryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/categories/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setCatForm((prev) => ({ ...prev, imageUrl: data.url }));
                setCatImagePreview(data.url);
                showToast('Category image uploaded.');
            }
        } catch {
            showToast('Failed to upload category image', 'error');
        }
    };

    // Create Category Submit
    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/products/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catForm),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Product category created successfully!');
                setIsCategoryModalOpen(false);
                fetchCategories();
                setCatForm({ name: '', code: '', description: '', imageUrl: '' });
                setCatImagePreview(null);
            } else {
                showToast(data.error || 'Failed to create category', 'error');
            }
        } catch {
            showToast('Network error creating category', 'error');
        }
    };

    // Create Product Submit
    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm),
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Component ${data.product.partNumber} created successfully!`);
                setIsProductModalOpen(false);
                fetchProducts();
                setProductForm({
                    partNumber: '',
                    name: '',
                    description: '',
                    categoryId: categories[0]?.id || '',
                    uom: 'PCS',
                    materialType: 'Steel',
                    drawingNumber: '',
                    revisionNumber: 'Rev 0',
                    standardCost: '250.00',
                    sellingPrice: '380.00',
                    minStockLevel: '10.00',
                    maxStockLevel: '1000.00',
                    reorderPoint: '25.00',
                    hsnCode: '8483',
                    mainImageUrl: '',
                    isActive: true,
                });
            } else {
                showToast(data.error || 'Failed to create product', 'error');
            }
        } catch {
            showToast('Network error creating product', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toastMessage && (
                <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                        toastMessage.type === 'error'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                >
                    <span>{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Header */}
            <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>📦</span>
                        <span>Products, Parts Master & Technical Media</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">
                        High-precision automotive & aerospace parts catalog, visual galleries, CAD drawings, and BOM costing
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                    >
                        📁 Manage Categories
                    </button>
                    <button
                        onClick={() => setIsProductModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                        <span>+</span>
                        <span>Register Component</span>
                    </button>
                </div>
            </div>

            {/* Visual Category Showcase Filter Bar */}
            {categories.length > 0 && (
                <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Component Categories
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        <button
                            onClick={() => setCategoryFilter('')}
                            className={`p-3 rounded-2xl text-left border transition-all ${
                                categoryFilter === ''
                                    ? 'bg-blue-50 border-blue-600 shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <span className="text-xs font-bold text-slate-900 block">All Parts</span>
                            <span className="text-[10px] text-slate-500">{products.length} Items</span>
                        </button>
                        {categories.map((c) => {
                            const isSelected = categoryFilter === c.id;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setCategoryFilter(isSelected ? '' : c.id)}
                                    className={`p-3 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                                        isSelected
                                            ? 'bg-blue-50 border-blue-600 shadow-sm'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center text-base">
                                        {c.imageUrl ? (
                                            <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                                        ) : (
                                            '⚙️'
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-xs font-bold text-slate-900 truncate block">
                                            {c.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono block">
                                            {c.code}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Search & Filter Toolbar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search part #, name, drawing #, HSN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 w-full sm:w-80 focus:outline-none focus:border-blue-600"
                    />
                    <select
                        value={materialFilter}
                        onChange={(e) => setMaterialFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                    >
                        <option value="">All Materials</option>
                        <option value="Steel">Steel</option>
                        <option value="Aluminium">Aluminium</option>
                        <option value="Stainless Steel">Stainless Steel</option>
                        <option value="Brass">Brass</option>
                        <option value="Tool Steel">Tool Steel</option>
                    </select>
                </div>
                <div className="text-xs text-slate-500">
                    Showing <b>{products.length}</b> precision engineered components
                </div>
            </div>

            {/* Products Table with Real Thumbnail Previews */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                <th className="py-3 px-4 w-14">Photo</th>
                                <th className="py-3 px-4">Part Number</th>
                                <th className="py-3 px-4">Component Name & Category</th>
                                <th className="py-3 px-4">Material & UOM</th>
                                <th className="py-3 px-4">Drawing & Rev</th>
                                <th className="py-3 px-4">Unit Cost</th>
                                <th className="py-3 px-4">Selling Price</th>
                                <th className="py-3 px-4">Media & Docs</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-slate-400">
                                        Loading precision parts catalog...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-slate-400">
                                        No products found. Click "Register Component" above to add your first part.
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Product Thumbnail with Click-to-Zoom */}
                                        <td className="py-3 px-4">
                                            <div
                                                onClick={() => {
                                                    if (p.mainImageUrl) setZoomedImage(p.mainImageUrl);
                                                }}
                                                className={`w-11 h-11 rounded-xl border relative overflow-hidden flex items-center justify-center text-lg shadow-sm ${
                                                    p.mainImageUrl
                                                        ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 border-slate-200'
                                                        : 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                                                }`}
                                                title={p.mainImageUrl ? 'Click to zoom product image' : 'No photo uploaded'}
                                            >
                                                {p.mainImageUrl ? (
                                                    <Image
                                                        src={p.mainImageUrl}
                                                        alt={p.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    '🔧'
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                                            {p.partNumber}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-semibold text-slate-900">{p.name}</div>
                                            <span className="text-[11px] text-slate-400">
                                                {p.category?.name || 'Category Unassigned'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-700">
                                            <div>{p.materialType}</div>
                                            <span className="text-[10px] text-slate-400 font-mono">UOM: {p.uom}</span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">
                                            {p.drawingNumber ? (
                                                <div>
                                                    <span>{p.drawingNumber}</span>
                                                    <span className="text-[10px] text-blue-600 block">{p.revisionNumber}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-700">₹{p.standardCost}</td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{p.sellingPrice}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5 text-[11px]">
                                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                                                    📷 {p.images?.length || (p.mainImageUrl ? 1 : 0)}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                                                    📄 {p.documents?.length || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => loadProductDetails(p.id)}
                                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                            >
                                                Inspect & BOM
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FULL DETAILS DRAWER / MODAL: GALLERY + CAD DOCUMENTS + BOM */}
            {selectedProductDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-blue-700 text-base">
                                        {selectedProductDetails.partNumber}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                        {selectedProductDetails.materialType}
                                    </span>
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                                    {selectedProductDetails.name}
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedProductDetails(null);
                                    setSelectedProductBom(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* SECTION 1: PRODUCT IMAGE GALLERY & UPLOAD */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>📸</span>
                                    <span>Component Visual Gallery ({selectedProductDetails.images?.length || (selectedProductDetails.mainImageUrl ? 1 : 0)})</span>
                                </h3>
                                <label className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-1 transition-colors">
                                    <span>+ Add Gallery Photo</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            setMediaUploadType('image');
                                            handleUploadMedia(e);
                                        }}
                                        disabled={isUploadingMedia}
                                    />
                                </label>
                            </div>

                            {/* Images Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {selectedProductDetails.images && selectedProductDetails.images.length > 0 ? (
                                    selectedProductDetails.images.map((img) => (
                                        <div
                                            key={img.id}
                                            onClick={() => setZoomedImage(img.imageUrl)}
                                            className="group relative h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-500 transition-all"
                                        >
                                            <Image
                                                src={img.imageUrl}
                                                alt={img.fileName}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                            />
                                            {img.isPrimary && (
                                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-blue-600/90 text-white text-[9px] font-bold rounded-md shadow-sm">
                                                    PRIMARY
                                                </span>
                                            )}
                                            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                                                🔍 Zoom
                                            </div>
                                        </div>
                                    ))
                                ) : selectedProductDetails.mainImageUrl ? (
                                    <div
                                        onClick={() => setZoomedImage(selectedProductDetails.mainImageUrl!)}
                                        className="relative h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer shadow-sm"
                                    >
                                        <Image
                                            src={selectedProductDetails.mainImageUrl}
                                            alt={selectedProductDetails.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="col-span-full p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        No product photos uploaded. Click "+ Add Gallery Photo" above to upload JPG, PNG, or WEBP photos (max 10MB).
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION 2: TECHNICAL DOCUMENTS & CAD DRAWINGS */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>📁</span>
                                    <span>Engineering Drawings, CAD & Certificates ({selectedProductDetails.documents?.length || 0})</span>
                                </h3>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={docTypeForm}
                                        onChange={(e) => setDocTypeForm(e.target.value)}
                                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
                                    >
                                        <option value="engineering_drawing">Engineering Drawing</option>
                                        <option value="datasheet">Datasheet</option>
                                        <option value="cad_pdf">CAD / STEP PDF</option>
                                        <option value="certificate">Inspection Certificate</option>
                                    </select>
                                    <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-1 transition-colors">
                                        <span>+ Upload Document</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                setMediaUploadType('document');
                                                handleUploadMedia(e);
                                            }}
                                            disabled={isUploadingMedia}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Documents List */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                                {selectedProductDetails.documents && selectedProductDetails.documents.length > 0 ? (
                                    selectedProductDetails.documents.map((doc) => (
                                        <div key={doc.id} className="p-3.5 bg-slate-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">📄</span>
                                                <div>
                                                    <span className="font-semibold text-slate-900 block">{doc.title}</span>
                                                    <span className="text-[11px] text-slate-500 font-mono">
                                                        {doc.fileName} • {(doc.fileSize / 1024).toFixed(1)} KB • {doc.revision}
                                                    </span>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.fileUrl}
                                                download={doc.fileName}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 font-semibold shadow-sm transition-colors"
                                            >
                                                Download File
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-xs text-slate-400">
                                        No engineering or quality documents uploaded yet for this part.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION 3: BILL OF MATERIALS (BOM) & NET COSTING BREAKDOWN */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <span>⚙️</span>
                                <span>Multi-Level Bill of Materials (BOM) & Machining Costing</span>
                            </h3>

                            {selectedProductBom && selectedProductBom.bomItems.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                                                <tr>
                                                    <th className="p-3">Raw Material Bar / Billet</th>
                                                    <th className="p-3 text-right">Qty Req</th>
                                                    <th className="p-3 text-right">Scrap Factor %</th>
                                                    <th className="p-3 text-right">Machining Time</th>
                                                    <th className="p-3 text-right">Tooling Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedProductBom.bomItems.map((b) => (
                                                    <tr key={b.id} className="hover:bg-slate-50">
                                                        <td className="p-3 font-semibold text-slate-800">
                                                            {b.rawMaterial?.name || 'Raw Material Inward Stock'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono">{b.quantityRequired} kg</td>
                                                        <td className="p-3 text-right font-mono text-amber-700 font-bold">
                                                            +{b.scrapAllowancePercent}% (Turning Chips)
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-blue-700">
                                                            {b.machiningTimeMinutes} mins
                                                        </td>
                                                        <td className="p-3 text-right font-mono">
                                                            ₹{b.toolingCostPerUnit}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Costing Summary */}
                                    {selectedProductBom.costingBreakdown && (
                                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                            <div>
                                                <span className="text-[10px] uppercase text-blue-700 font-bold block">Raw Material Cost</span>
                                                <span className="text-sm font-bold text-slate-900 font-mono">
                                                    ₹{selectedProductBom.costingBreakdown.rawMaterialTotal}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase text-blue-700 font-bold block">Machining Labor (₹450/hr)</span>
                                                <span className="text-sm font-bold text-slate-900 font-mono">
                                                    ₹{selectedProductBom.costingBreakdown.machineLaborCost}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase text-blue-700 font-bold block">Tooling & Inserts</span>
                                                <span className="text-sm font-bold text-slate-900 font-mono">
                                                    ₹{selectedProductBom.costingBreakdown.toolingTotal}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase text-emerald-800 font-bold block">Net Production Cost</span>
                                                <span className="text-base font-bold text-emerald-700 font-mono">
                                                    ₹{selectedProductBom.costingBreakdown.totalNetManufacturingCost}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    No BOM components mapped yet for this component.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FULL-SIZE IMAGE ZOOM MODAL */}
            {zoomedImage && (
                <div
                    onClick={() => setZoomedImage(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 cursor-zoom-out"
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full h-[75vh]">
                        <Image
                            src={zoomedImage}
                            alt="Full Zoom"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}

            {/* MODAL: REGISTER COMPONENT */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>⚙️</span>
                                <span>Register Precision Component</span>
                            </h3>
                            <button
                                onClick={() => setIsProductModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="mt-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Part Number *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. BTL-VMC-202"
                                        value={productForm.partNumber}
                                        onChange={(e) => setProductForm({ ...productForm, partNumber: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                                    <select
                                        required
                                        value={productForm.categoryId}
                                        onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Component Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Stainless Steel 316L Fuel Injector Nozzle"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Material Type *</label>
                                    <select
                                        value={productForm.materialType}
                                        onChange={(e) => setProductForm({ ...productForm, materialType: e.target.value as any })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="Steel">Steel</option>
                                        <option value="Aluminium">Aluminium</option>
                                        <option value="Stainless Steel">Stainless Steel</option>
                                        <option value="Brass">Brass</option>
                                        <option value="Tool Steel">Tool Steel</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">UOM</label>
                                    <select
                                        value={productForm.uom}
                                        onChange={(e) => setProductForm({ ...productForm, uom: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="PCS">PCS</option>
                                        <option value="NOS">NOS</option>
                                        <option value="KG">KG</option>
                                        <option value="SET">SET</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Engineering Drawing #</label>
                                    <input
                                        type="text"
                                        placeholder="DWG-BTL-2026-90"
                                        value={productForm.drawingNumber}
                                        onChange={(e) => setProductForm({ ...productForm, drawingNumber: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Revision Number</label>
                                    <input
                                        type="text"
                                        value={productForm.revisionNumber}
                                        onChange={(e) => setProductForm({ ...productForm, revisionNumber: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Standard Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={productForm.standardCost}
                                        onChange={(e) => setProductForm({ ...productForm, standardCost: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹)</label>
                                    <input
                                        type="number"
                                        value={productForm.sellingPrice}
                                        onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                                >
                                    Register Part Master
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: MANAGE CATEGORY WITH PHOTO UPLOAD */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>📁</span>
                                <span>Add Category with Showcase Image</span>
                            </h3>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCategorySubmit} className="mt-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Category Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 4th-Axis Rotary Flanges"
                                        value={catForm.name}
                                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Category Code *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="CAT-FLG"
                                        value={catForm.code}
                                        onChange={(e) => setCatForm({ ...catForm, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Category Image Upload */}
                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Category Showcase Photo</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50 flex flex-col items-center">
                                    {catImagePreview ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-20 relative rounded-lg overflow-hidden border border-slate-200 mb-2 shadow-sm">
                                                <Image src={catImagePreview} alt="Preview" fill className="object-cover" />
                                            </div>
                                            <span className="text-[11px] text-emerald-600 font-semibold mb-2">Photo uploaded successfully ✓</span>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] text-slate-400 mb-2">JPG, PNG, or WEBP up to 10MB</span>
                                    )}
                                    <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer border border-slate-200">
                                        Choose Image File
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleCategoryPhotoUpload}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                                >
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
