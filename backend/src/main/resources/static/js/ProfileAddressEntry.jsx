/**
 * ProfileAddressEntry - Multi-address management with label, default, edit, delete.
 * Backend APIs: GET/POST/PUT/DELETE /api/users/{userId}/addresses
 *               PUT /api/users/{userId}/addresses/{id}/set-default
 */
function ProfileAddressEntry({ userId, onAddressSaved }) {

    const DISTRICTS = [
        'Chengalpattu','Salem','Chennai','Coimbatore','Madurai','Trichy',
        'Thanjavur','Kanchipuram','Tiruvallur','Tirunelveli','Erode',
        'Vellore','Tiruppur','Dindigul','Namakkal','Karur','Theni',
        'Kanyakumari','Karaikudi','Pollachi','Ooty','Ambur',
        'Tiruvannamalai','Hosur','Villupuram','Ramanathapuram','Pudukkottai'
    ];

    const LABEL_ICONS = { HOME: '🏠', WORK: '💼', OTHER: '📍' };

    // --- List state ---
    const [savedAddresses, setSavedAddresses] = React.useState([]);
    const [listLoading, setListLoading] = React.useState(true);
    const [listError, setListError] = React.useState('');

    // --- Add-form state ---
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [addDistrict, setAddDistrict] = React.useState('Chengalpattu');
    const [addStreet, setAddStreet] = React.useState('');
    const [addLandmark, setAddLandmark] = React.useState('');
    const [addLabel, setAddLabel] = React.useState('HOME');
    const [addCustomLabel, setAddCustomLabel] = React.useState('');
    const [addLocation, setAddLocation] = React.useState(null);
    const [addSaving, setAddSaving] = React.useState(false);
    const [addStatus, setAddStatus] = React.useState('');

    // --- Edit modal state ---
    const [editAddr, setEditAddr] = React.useState(null); // address object being edited
    const [editDistrict, setEditDistrict] = React.useState('');
    const [editStreet, setEditStreet] = React.useState('');
    const [editLandmark, setEditLandmark] = React.useState('');
    const [editLabel, setEditLabel] = React.useState('HOME');
    const [editCustomLabel, setEditCustomLabel] = React.useState('');
    const [editLocation, setEditLocation] = React.useState(null);
    const [editSaving, setEditSaving] = React.useState(false);
    const [editStatus, setEditStatus] = React.useState('');

    // --- Delete confirm state ---
    const [deleteConfirmId, setDeleteConfirmId] = React.useState(null);

    // ── Load addresses ──────────────────────────────────────────────
    const loadAddresses = async () => {
        setListLoading(true);
        setListError('');
        try {
            if (!userId) return setListError('Please sign in to manage addresses.');
            const res = await window.authApi.fetch(`/api/users/${userId}/addresses`);
            if (res.ok) {
                const data = await res.json();
                setSavedAddresses(Array.isArray(data) ? data : []);
            } else {
                setListError('Failed to load addresses.');
            }
        } catch (e) {
            setListError('Network error loading addresses.');
        } finally {
            setListLoading(false);
        }
    };

    React.useEffect(() => { loadAddresses(); }, [userId]);

    // ── Helpers ─────────────────────────────────────────────────────
    const resolveLabel = (addr) => {
        const raw = (addr.addressType || 'HOME').trim().toUpperCase();
        if (raw === 'HOME' || raw === 'WORK' || raw === 'OTHER') return raw;
        return addr.title || raw; // custom label stored in title
    };

    const labelDisplay = (raw) => {
        if (!raw) return '🏠 Home';
        const up = raw.toUpperCase();
        if (up === 'HOME') return '🏠 Home';
        if (up === 'WORK') return '💼 Work';
        if (up === 'OTHER') return '📍 Other';
        return `📌 ${raw}`;
    };

    // ── Add address ─────────────────────────────────────────────────
    const resetAddForm = () => {
        setAddStreet(''); setAddLandmark(''); setAddLabel('HOME');
        setAddCustomLabel(''); setAddLocation(null); setAddStatus('');
        setAddDistrict('Chengalpattu');
    };

    const handleAddSave = async (e) => {
        e.preventDefault();
        const street = addStreet.trim();
        if (!street) { setAddStatus('Please search or type a street address.'); return; }

        setAddSaving(true);
        setAddStatus('');
        const effectiveLabel = addLabel === 'OTHER' && addCustomLabel.trim()
            ? addCustomLabel.trim() : addLabel;

        const payload = {
            title: effectiveLabel,
            address: street,
            street: street,
            district: addDistrict,
            city: addDistrict,
            landmark: addLandmark.trim(),
            addressType: ['HOME','WORK','OTHER'].includes(effectiveLabel.toUpperCase()) ? effectiveLabel.toUpperCase() : 'OTHER',
            pincode: addLocation?.pincode || '',
            latitude: addLocation?.latitude || null,
            longitude: addLocation?.longitude || null,
            isDefault: savedAddresses.length === 0
        };

        try {
            const res = await window.authApi.fetch(`/api/users/${userId}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setAddStatus('✓ Address saved!');
                resetAddForm();
                setShowAddForm(false);
                await loadAddresses();
                if (onAddressSaved) onAddressSaved();
            } else {
                setAddStatus('Failed to save address. Please try again.');
            }
        } catch (err) {
            setAddStatus('Network error. Please try again.');
        } finally {
            setAddSaving(false);
        }
    };

    // ── Edit address ────────────────────────────────────────────────
    const openEdit = (addr) => {
        setEditAddr(addr);
        setEditDistrict(addr.district || 'Chengalpattu');
        setEditStreet(addr.address || addr.street || '');
        setEditLandmark(addr.landmark || '');
        const rawType = (addr.addressType || 'HOME').toUpperCase();
        if (['HOME','WORK','OTHER'].includes(rawType)) {
            setEditLabel(rawType);
            setEditCustomLabel('');
        } else {
            setEditLabel('OTHER');
            setEditCustomLabel(addr.title || rawType);
        }
        setEditLocation(addr.latitude ? { latitude: addr.latitude, longitude: addr.longitude, pincode: addr.pincode } : null);
        setEditStatus('');
    };

    const closeEdit = () => { setEditAddr(null); setEditStatus(''); };

    const handleEditSave = async (e) => {
        e.preventDefault();
        const street = editStreet.trim();
        if (!street) { setEditStatus('Please enter an address.'); return; }
        setEditSaving(true);
        setEditStatus('');
        const effectiveLabel = editLabel === 'OTHER' && editCustomLabel.trim()
            ? editCustomLabel.trim() : editLabel;

        const payload = {
            title: effectiveLabel,
            address: street,
            street: street,
            district: editDistrict,
            city: editDistrict,
            landmark: editLandmark.trim(),
            addressType: ['HOME','WORK','OTHER'].includes(effectiveLabel.toUpperCase()) ? effectiveLabel.toUpperCase() : 'OTHER',
            pincode: editLocation?.pincode || editAddr?.pincode || '',
            latitude: editLocation?.latitude || editAddr?.latitude || null,
            longitude: editLocation?.longitude || editAddr?.longitude || null,
        };

        try {
            const res = await window.authApi.fetch(`/api/users/${userId}/addresses/${editAddr.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                closeEdit();
                await loadAddresses();
            } else {
                setEditStatus('Failed to update. Try again.');
            }
        } catch (err) {
            setEditStatus('Network error.');
        } finally {
            setEditSaving(false);
        }
    };

    // ── Delete address ───────────────────────────────────────────────
    const handleDelete = async (id) => {
        setDeleteConfirmId(null);
        try {
            await window.authApi.fetch(`/api/users/${userId}/addresses/${id}`, { method: 'DELETE' });
            await loadAddresses();
        } catch (e) {
            console.error('Delete failed:', e);
        }
    };

    // ── Set default ──────────────────────────────────────────────────
    const handleSetDefault = async (id) => {
        try {
            await window.authApi.fetch(`/api/users/${userId}/addresses/${id}/set-default`, { method: 'PUT' });
            await loadAddresses();
        } catch (e) {
            console.error('Set default failed:', e);
        }
    };

    // ── Address to delete (for confirm message) ──────────────────────
    const addrToDelete = savedAddresses.find(a => a.id === deleteConfirmId);
    const deletingDefault = addrToDelete?.isDefault;

    // ════════════════════════════════════════════════════════════════
    return (
        <div className="courier-card" style={{ maxWidth: '700px' }}>
            <div className="courier-header">
                <h2>👤 My Saved Addresses</h2>
                <p className="courier-sub">Manage your delivery addresses for 1-click orders</p>
            </div>

            {/* ── Address List ─────────────────────────────────── */}
            {listLoading ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#888' }}>⏳ Loading addresses...</div>
            ) : listError ? (
                <div className="location-status-msg warning" style={{ marginBottom: '16px' }}>{listError}</div>
            ) : savedAddresses.length === 0 ? (
                <div className="addr-empty-state">
                    <div className="empty-icon">🏠</div>
                    <div style={{ fontWeight: 600, marginBottom: '6px', color: '#333' }}>No saved addresses yet</div>
                    <div style={{ marginBottom: '16px' }}>Add your first address to enable 1-click checkout.</div>
                    <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => setShowAddForm(true)}>
                        + Add First Address
                    </button>
                </div>
            ) : (
                <>
                    <div className="addr-section-header">
                        <span className="addr-section-title">📋 Saved Addresses ({savedAddresses.length})</span>
                        <button className="btn btn-primary" style={{ width: 'auto', padding: '7px 16px', fontSize: '0.85rem' }}
                            onClick={() => { resetAddForm(); setShowAddForm(v => !v); }}>
                            {showAddForm ? '✕ Cancel' : '+ Add New'}
                        </button>
                    </div>

                    <div className="addr-cards-list">
                        {savedAddresses.map(addr => {
                            const labelRaw = resolveLabel(addr);
                            return (
                                <div key={addr.id} className={`addr-card ${addr.isDefault ? 'is-default' : ''}`}>
                                    <div className="addr-card-body">
                                        <div className="addr-card-label">
                                            {labelDisplay(labelRaw)}
                                            {addr.isDefault && <span className="default-badge">DEFAULT</span>}
                                        </div>
                                        <div className="addr-card-address" title={addr.address || addr.street}>
                                            {addr.address || addr.street}
                                        </div>
                                        <div className="addr-card-sub">
                                            {addr.district}{addr.landmark ? ` · ${addr.landmark}` : ''}
                                            {addr.latitude ? ` · GPS ✓` : ''}
                                        </div>
                                    </div>
                                    <div className="addr-card-actions">
                                        {!addr.isDefault && (
                                            <button className="addr-action-btn default-btn" onClick={() => handleSetDefault(addr.id)}>
                                                ★ Set Default
                                            </button>
                                        )}
                                        <button className="addr-action-btn" onClick={() => openEdit(addr)}>
                                            ✏️ Edit
                                        </button>
                                        <button className="addr-action-btn danger" onClick={() => setDeleteConfirmId(addr.id)}>
                                            🗑 Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── Add New Address Form ─────────────────────────── */}
            {showAddForm && (
                <div className="addr-form-section">
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '18px' }}>
                        ➕ Add New Address
                    </div>
                    <form onSubmit={handleAddSave} className="form-grid">
                        {/* Label selector */}
                        <div className="form-group">
                            <label className="form-label">🏷️ Address Label</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['HOME','WORK','OTHER'].map(type => (
                                    <button key={type} type="button"
                                        className={`btn ${addLabel === type ? 'btn-primary' : ''}`}
                                        style={{ flex: '1 1 80px', padding: '7px', fontSize: '0.85rem' }}
                                        onClick={() => setAddLabel(type)}>
                                        {LABEL_ICONS[type]} {type.charAt(0) + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                            {addLabel === 'OTHER' && (
                                <input type="text" className="form-control" placeholder="Custom label (e.g. Gym, Parents' Home)"
                                    value={addCustomLabel} onChange={e => setAddCustomLabel(e.target.value)}
                                    style={{ marginTop: '8px' }} />
                            )}
                        </div>

                        {/* District */}
                        <div className="form-group">
                            <label className="form-label">📍 District</label>
                            <select className="form-control" value={addDistrict}
                                onChange={e => { setAddDistrict(e.target.value); setAddStreet(''); setAddLocation(null); }}>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Address autocomplete */}
                        <div className="form-group">
                            <AddressAutocomplete
                                label="🏠 Search Address"
                                placeholder="Search area, landmark or use GPS..."
                                district={addDistrict}
                                value={addStreet}
                                onChange={setAddStreet}
                                onSelect={item => { setAddLocation(item); setAddStreet(item.address || item.name); }}
                                enableGeolocation={true}
                            />
                            {addLocation && (
                                <div className="selected-badge">
                                    ✓ {addLocation.name} ({addLocation.latitude?.toFixed(4)}, {addLocation.longitude?.toFixed(4)})
                                </div>
                            )}
                        </div>

                        {/* Landmark */}
                        <div className="form-group">
                            <label className="form-label">🏢 Landmark / Door No. (Optional)</label>
                            <input type="text" className="form-control"
                                placeholder="e.g. Flat 3B, Near Temple, Main Street"
                                value={addLandmark} onChange={e => setAddLandmark(e.target.value)} />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={addSaving}>
                            {addSaving ? 'Saving...' : '💾 Save Address'}
                        </button>

                        {addStatus && (
                            <div className={`location-status-msg ${addStatus.startsWith('✓') ? 'success' : 'warning'}`}>
                                {addStatus}
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* ── Edit Modal ───────────────────────────────────── */}
            {editAddr && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}>
                    <div className="modal-box">
                        <div className="modal-title">✏️ Edit Address</div>
                        <form onSubmit={handleEditSave} className="form-grid">
                            {/* Label */}
                            <div className="form-group">
                                <label className="form-label">🏷️ Label</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {['HOME','WORK','OTHER'].map(type => (
                                        <button key={type} type="button"
                                            className={`btn ${editLabel === type ? 'btn-primary' : ''}`}
                                            style={{ flex: '1 1 80px', padding: '7px', fontSize: '0.85rem' }}
                                            onClick={() => setEditLabel(type)}>
                                            {LABEL_ICONS[type]} {type.charAt(0) + type.slice(1).toLowerCase()}
                                        </button>
                                    ))}
                                </div>
                                {editLabel === 'OTHER' && (
                                    <input type="text" className="form-control"
                                        placeholder="Custom label" value={editCustomLabel}
                                        onChange={e => setEditCustomLabel(e.target.value)}
                                        style={{ marginTop: '8px' }} />
                                )}
                            </div>

                            {/* District */}
                            <div className="form-group">
                                <label className="form-label">📍 District</label>
                                <select className="form-control" value={editDistrict}
                                    onChange={e => { setEditDistrict(e.target.value); setEditStreet(''); setEditLocation(null); }}>
                                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* Address */}
                            <div className="form-group">
                                <AddressAutocomplete
                                    label="🏠 Address"
                                    placeholder="Search or type address..."
                                    district={editDistrict}
                                    value={editStreet}
                                    onChange={setEditStreet}
                                    onSelect={item => { setEditLocation(item); setEditStreet(item.address || item.name); }}
                                    enableGeolocation={true}
                                />
                                {editLocation && (
                                    <div className="selected-badge">
                                        ✓ GPS: {editLocation.latitude?.toFixed(4)}, {editLocation.longitude?.toFixed(4)}
                                    </div>
                                )}
                            </div>

                            {/* Landmark */}
                            <div className="form-group">
                                <label className="form-label">🏢 Landmark (Optional)</label>
                                <input type="text" className="form-control"
                                    placeholder="e.g. Near Temple, Flat 3B"
                                    value={editLandmark} onChange={e => setEditLandmark(e.target.value)} />
                            </div>

                            {editStatus && (
                                <div className="location-status-msg warning">{editStatus}</div>
                            )}

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={editSaving}>
                                    {editSaving ? 'Saving...' : '💾 Update Address'}
                                </button>
                                <button type="button" className="btn" style={{ flex: 1 }} onClick={closeEdit}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ─────────────────────────── */}
            {deleteConfirmId !== null && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteConfirmId(null); }}>
                    <div className="modal-box" style={{ maxWidth: '380px' }}>
                        <div className="modal-title">🗑 Delete Address?</div>
                        <div style={{ fontSize: '0.9rem', color: '#444', marginBottom: '6px' }}>
                            {addrToDelete && (
                                <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '12px', fontSize: '0.85rem' }}>
                                    <strong>{labelDisplay(resolveLabel(addrToDelete))}</strong>
                                    <div style={{ color: '#555', marginTop: '2px' }}>{addrToDelete.address || addrToDelete.street}</div>
                                </div>
                            )}
                            {deletingDefault ? (
                                <div className="location-status-msg warning" style={{ marginBottom: '8px' }}>
                                    ⚠️ This is your <strong>Default</strong> address. Deleting it will promote the next address as default.
                                </div>
                            ) : (
                                <span>Are you sure you want to delete this address?</span>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                                onClick={() => handleDelete(deleteConfirmId)}>
                                Yes, Delete
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1 }}
                                onClick={() => setDeleteConfirmId(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

window.ProfileAddressEntry = ProfileAddressEntry;
