import { useEffect, useMemo, useState } from "react";
import "./UserProfile.css";

const API_BASE_URL = "http://localhost:8080/api/users";

const emptyProfile = {
    id: "",
    fullName: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
    addressLine: "",
    landmark: "",
    district: "",
    town: "",
    areaType: "URBAN",
};

const withDefaults = (user) => ({
    ...emptyProfile,
    ...(user || {}),
    areaType: user?.areaType || "URBAN",
});

function UserProfile({ onBack }) {
    const storedUser = useMemo(() => {
        try {
            return withDefaults(JSON.parse(localStorage.getItem("user")));
        } catch {
            return null;
        }
    }, []);

    const [profile, setProfile] = useState(storedUser || emptyProfile);
    const [formData, setFormData] = useState(storedUser || emptyProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(Boolean(storedUser?.id));
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!storedUser?.id) {
                setMessage("Please login to view your profile.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/${storedUser.id}/profile`);

                if (!response.ok) {
                    throw new Error("Profile not found");
                }

                const data = withDefaults(await response.json());
                setProfile(data);
                setFormData(data);
                localStorage.setItem("user", JSON.stringify(data));
            } catch (error) {
                console.log(error);
                setMessage("Unable to load profile from backend.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [storedUser?.id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        setFormData(profile);
        setIsEditing(false);
        setMessage("");
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/${profile.id}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    addressLine: formData.addressLine,
                    landmark: formData.landmark,
                    district: formData.district,
                    town: formData.town,
                    areaType: formData.areaType,
                }),
            });

            if (!response.ok) {
                throw new Error("Update failed");
            }

            const updatedProfile = withDefaults(await response.json());
            setProfile(updatedProfile);
            setFormData(updatedProfile);
            localStorage.setItem("user", JSON.stringify(updatedProfile));
            setIsEditing(false);
            setMessage("Delivery profile updated successfully.");
        } catch (error) {
            console.log(error);
            setMessage("Profile update failed. Please check backend connection.");
        } finally {
            setSaving(false);
        }
    };

    const initials = (profile.fullName || "Anywhere User")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    const addressPreview = [
        profile.addressLine,
        profile.landmark ? `Near ${profile.landmark}` : "",
        profile.town,
        profile.district,
    ].filter(Boolean).join(", ");

    return (
        <section className="profile-page">
            <nav className="profile-nav">
                <button className="profile-back-btn" onClick={onBack}>
                    Back
                </button>
                <div>
                    <span className="profile-brand">Anywhere</span>
                    <span className="profile-location">Delivery account</span>
                </div>
            </nav>

            <div className="profile-shell">
                <aside className="profile-summary">
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar">{initials}</div>
                    </div>
                    <span className="profile-chip">{profile.areaType || "URBAN"} DELIVERY</span>
                    <h1>{profile.fullName || "Your Delivery Profile"}</h1>
                    <p>
                        Manage your contact details and primary address so Anywhere can serve both city streets and village routes clearly.
                    </p>

                    <div className="profile-address-card">
                        <span>Primary address</span>
                        <strong>{addressPreview || "Add your delivery address"}</strong>
                    </div>

                    <div className="profile-stat-grid">
                        <div>
                            <strong>4</strong>
                            <span>Delivery services</span>
                        </div>
                        <div>
                            <strong>{profile.areaType || "URBAN"}</strong>
                            <span>Area type</span>
                        </div>
                    </div>

                    <div className="profile-route-line">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </aside>

                <main className="profile-card">
                    <div className="profile-card-header">
                        <div>
                            <span>Anywhere account</span>
                            <h2>Profile and Delivery Address</h2>
                        </div>

                        {!isEditing && (
                            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="profile-loading">Loading profile...</div>
                    ) : (
                        <form className="profile-form" onSubmit={handleSave}>
                            <div className="profile-section-title">
                                <strong>Personal details</strong>
                                <span>Used for login and delivery updates</span>
                            </div>

                            <label>
                                <span>Name</span>
                                <input
                                    name="fullName"
                                    value={formData.fullName || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </label>

                            <label>
                                <span>Email</span>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </label>

                            <label>
                                <span>Phone</span>
                                <input
                                    name="phone"
                                    value={formData.phone || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </label>

                            <label>
                                <span>Role</span>
                                <input value={formData.role || "CUSTOMER"} disabled />
                            </label>

                            <div className="profile-section-title">
                                <strong>Delivery location</strong>
                                <span>Useful for Tamil Nadu urban and rural service planning</span>
                            </div>

                            <label className="profile-wide">
                                <span>Full Address</span>
                                <textarea
                                    name="addressLine"
                                    value={formData.addressLine || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Door no, street, village or area"
                                    rows="4"
                                    required
                                />
                            </label>

                            <label>
                                <span>Area Type</span>
                                <select
                                    name="areaType"
                                    value={formData.areaType || "URBAN"}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                >
                                    <option value="URBAN">Urban</option>
                                    <option value="RURAL">Rural</option>
                                </select>
                            </label>

                            <label>
                                <span>Nearby Landmark</span>
                                <input
                                    name="landmark"
                                    value={formData.landmark || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Bus stand, temple, school, market"
                                />
                            </label>

                            <label>
                                <span>Town / Village</span>
                                <input
                                    name="town"
                                    value={formData.town || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Example: Kovilpatti"
                                    required
                                />
                            </label>

                            <label>
                                <span>District</span>
                                <input
                                    name="district"
                                    value={formData.district || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Example: Thoothukudi"
                                    required
                                />
                            </label>

                            <div className="profile-service-strip">
                                <span style={{ "--delay": "0ms" }}>Food</span>
                                <span style={{ "--delay": "80ms" }}>Grocery</span>
                                <span style={{ "--delay": "160ms" }}>Medicine</span>
                                <span style={{ "--delay": "240ms" }}>Courier</span>
                            </div>

                            {message && <p className="profile-message">{message}</p>}

                            {isEditing && (
                                <div className="profile-actions">
                                    <button type="button" className="profile-secondary-btn" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="profile-save-btn" disabled={saving}>
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                </main>
            </div>
        </section>
    );
}

export default UserProfile;
