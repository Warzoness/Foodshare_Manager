// Final: No onChange on inputs. Use refs + onClick/Save to commit values.
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import InteractiveMap from "@/components/ui/InteractiveMap";
import { useSellerShop, useUpdateSellerShop } from "@/hooks/useApi";
import { UpdateSellerShopRequest } from "@/types";
import styles from "./page.module.css";
import sharedStyles from "../../../shared.module.css";

export default function EditShopPage({ params }) {
    const router = useRouter();
    const { id: shopId } = params;

    const { data: shop, loading: shopLoading, error: shopError, execute: refetchShop } = useSellerShop(shopId);
    const { execute: updateShop, loading: updating, success: updateSuccess } = useUpdateSellerShop();

    // Only committed values live in state
    const [formData, setFormData] = useState<UpdateSellerShopRequest>({
        name: "",
        address: "",
        phone: "",
        imageUrl: "",
        latitude: 0,
        longitude: 0,
        description: "",
        rating: 0,
        status: "1",
    });

    // Uncontrolled fields: no onChange at all
    const nameRef = useRef<HTMLInputElement | null>(null);
    const phoneRef = useRef<HTMLInputElement | null>(null);
    const descRef = useRef<HTMLTextAreaElement | null>(null);
    const addressRef = useRef<HTMLInputElement | null>(null);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const mapUrl = useMemo(() => {
        const lat = formData.latitude || 0;
        const lng = formData.longitude || 0;
        if (lat === 0 && lng === 0) {
            return `https://www.google.com/maps?output=embed`;
        }
        return `https://www.google.com/maps?q=${lat},${lng}&markers=${lat},${lng}&output=embed`;
    }, [formData.latitude, formData.longitude]);

    useEffect(() => {
        if (shopId) refetchShop();
    }, [shopId, refetchShop]);

    // Seed initial values once (no onChange bindings)
    useEffect(() => {
        if (!shop) return;
        setFormData({
            name: shop.name || "",
            address: shop.address || "",
            phone: shop.phone || "",
            imageUrl: shop.imageUrl || "",
            latitude: shop.latitude || 0,
            longitude: shop.longitude || 0,
            description: shop.description || "",
            rating: shop.rating || 0,
            status: shop.status || "1",
        });

        if (nameRef.current) nameRef.current.value = shop.name || "";
        if (phoneRef.current) phoneRef.current.value = shop.phone || "";
        if (descRef.current) descRef.current.value = shop.description || "";
        if (addressRef.current) addressRef.current.value = shop.address || "";
    }, [shop]);

    const handleLocationChange = useCallback((lat: number, lng: number, address?: string) => {
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, address: address ?? prev.address }));
    }, []);

    const geocodeAndCommitAddress = async () => {
        const raw = addressRef.current?.value?.trim() || "";
        if (!raw) {
            alert("Vui lòng nhập địa chỉ");
            return;
        }
        try {
            const res = await fetch(`https://mapapis.openmap.vn/v1/geocode/forward?address=${encodeURIComponent(raw)}&apikey=WbYy44w6zShkSPqH1gybaEtLcHamjRwM`);
            const data = await res.json();
            if (!data?.results?.[0]?.geometry?.location?.lat) {
                alert("Không tìm thấy địa chỉ!");
                return;
            }
            // Commit ONLY when user clicks
            handleLocationChange(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng, raw);
        } catch (e) {
            console.error(e);
            alert("Lỗi tìm vị trí");
        }
    };

    const handleUpdateShop = async () => {
        // Read latest values from refs at save time (no onChange used)
        const payload: UpdateSellerShopRequest = {
            ...formData,
            name: nameRef.current?.value || "",
            phone: phoneRef.current?.value || "",
            description: descRef.current?.value || "",
            // address/lat/lng already committed via Find location or map interaction
        };

        if (!payload.name || !payload.address || !payload.phone) {
            alert("Vui lòng điền đủ Tên, Địa chỉ, SĐT");
            return;
        }

        await updateShop(shopId, payload);
    };

    useEffect(() => {
        if (updateSuccess) {
            alert("Cập nhật cửa hàng thành công!");
            router.push("/seller/store");
        }
    }, [updateSuccess, router]);

    if (shopLoading) return <div className={sharedStyles.pageContainer}>Đang tải thông tin...</div>;
    if (shopError) return <div className={sharedStyles.pageContainer}>Lỗi: {shopError}</div>;

    return (
        <div className={sharedStyles.pageContainer}>
            <div className={sharedStyles.pageHeader}>
                <h1 className={sharedStyles.pageTitle}>Chỉnh sửa cửa hàng</h1>
                <p className={sharedStyles.pageSubtitle}>Cập nhật thông tin cửa hàng của bạn</p>
            </div>

            <Card className={styles.editFormCard}>
                <div className={styles.formContainer}>
                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>Tên cửa hàng *</label>
                        <input ref={nameRef} className={styles.formInput} placeholder="Nhập tên cửa hàng" />
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>Số điện thoại *</label>
                        <input ref={phoneRef} className={styles.formInput} placeholder="0123456789" />
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>Địa chỉ *</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input ref={addressRef} className={styles.formInput} placeholder="Nhập địa chỉ" />
                            <Button type="button" variant="primary" onClick={geocodeAndCommitAddress}>🔍 Tìm vị trí</Button>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>Vị trí *</label>
                        <div style={{ position: 'relative', height: 300 }}>
                            <div className={styles.mapContainer} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                                <iframe 
                                    key={`${formData.latitude}-${formData.longitude}`}
                                    src={mapUrl} 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0, pointerEvents: 'none' }} 
                                    loading="lazy" 
                                />
                            </div>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
                                <InteractiveMap
                                    latitude={formData.latitude || 0}
                                    longitude={formData.longitude || 0}
                                    address={formData.address || ""}
                                    onLocationChange={handleLocationChange}
                                    height={300}
                                    className=""
                                    mode="edit"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>Trạng thái *</label>
                        <Select
                            value={formData.status}
                            onChange={(v) => setFormData((p) => ({ ...p, status: v }))}
                            options={[
                                { value: "1", label: "Đang hoạt động" },
                                { value: "0", label: "Đóng cửa" },
                                { value: "2", label: "Chờ duyệt" },
                            ]}
                        />
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>Mô tả</label>
                        <textarea ref={descRef} className={styles.formTextarea} placeholder="Mô tả cửa hàng" />
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button variant="secondary" onClick={() => router.back()}>Hủy</Button>
                    <Button variant="primary" onClick={handleUpdateShop} loading={updating}>
                        {updating ? "Đang cập nhật..." : "Cập nhật cửa hàng"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
