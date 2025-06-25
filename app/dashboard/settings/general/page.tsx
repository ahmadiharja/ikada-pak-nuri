"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function GeneralSettingsPage() {
  // State untuk form
  const [form, setForm] = useState({
    websiteTitle: "IKADA",
    favicon: "",
    heroAutoplay: true,
    heroInterval: 4000,
    footerCopyright: `© ${new Date().getFullYear()} IKADA. All rights reserved.`,
    footerLinks: [
      { label: "Tentang Kami", url: "/ikada/about" },
      { label: "Blog", url: "/ikada/blog" },
      { label: "Event", url: "/ikada/events" },
      { label: "Donasi", url: "/ikada/donasi" },
      { label: "Marketplace", url: "/ikada/marketplace" },
    ],
    footerSocial: {
      instagram: "",
      facebook: "",
      youtube: "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [heroImages, setHeroImages] = useState<any[]>([]); // [{file, preview} | {src, alt}]
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>("");
  const heroInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch config on mount
  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/settings/general");
        if (!res.ok) throw new Error("Gagal mengambil data pengaturan");
        const data = await res.json();
        setForm({
          websiteTitle: data.websiteTitle || "",
          favicon: data.favicon || "",
          heroAutoplay: data.heroAutoplay ?? true,
          heroInterval: data.heroInterval ?? 4000,
          footerCopyright: data.footerCopyright || `© ${new Date().getFullYear()} IKADA. All rights reserved.`,
          footerLinks: Array.isArray(data.footerLinks) ? data.footerLinks : [],
          footerSocial: data.footerSocial || { instagram: "", facebook: "", youtube: "" },
        });
        setHeroImages(Array.isArray(data.heroImages) ? data.heroImages : []);
        setFaviconPreview(data.favicon || "");
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
    // eslint-disable-next-line
  }, []);

  // Handler
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFooterLinkChange = (idx: number, field: 'label' | 'url', value: string) => {
    setForm((prev) => {
      const links = [...prev.footerLinks];
      links[idx] = { ...links[idx], [field]: value };
      return { ...prev, footerLinks: links };
    });
  };

  const handleAddFooterLink = () => {
    setForm((prev) => ({
      ...prev,
      footerLinks: [...prev.footerLinks, { label: "", url: "" }],
    }));
  };

  const handleRemoveFooterLink = (idx: number) => {
    setForm((prev) => {
      const links = prev.footerLinks.filter((_, i) => i !== idx);
      return { ...prev, footerLinks: links };
    });
  };

  // Handler upload hero image (preview only, not upload)
  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setHeroImages((prev) => [...prev, { file, preview }]);
    if (heroInputRef.current) heroInputRef.current.value = "";
  };

  // Handler hapus gambar
  const handleRemoveHeroImage = (idx: number) => {
    setHeroImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handler drag & drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(heroImages);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setHeroImages(items);
  };

  // Upload favicon to API
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload/favicon", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setFaviconPreview(data.file);
        setForm((prev) => ({ ...prev, favicon: data.file }));
      } else {
        toast.error("Gagal upload favicon");
      }
    } catch {
      toast.error("Gagal upload favicon");
    }
    if (faviconInputRef.current) faviconInputRef.current.value = "";
  };

  // Save config to API
  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Upload semua file baru ke server
      const uploadedImages: any[] = [];
      for (const img of heroImages) {
        if (img.file) {
          const formData = new FormData();
          formData.append("file", img.file);
          const res = await fetch("/api/upload/herohome", { method: "POST", body: formData });
          const data = await res.json();
          if (data.success && data.files && data.files[0]) {
            uploadedImages.push({ src: data.files[0], alt: img.file.name });
          } else {
            throw new Error("Gagal upload gambar hero");
          }
        } else {
          uploadedImages.push(img); // Sudah berupa {src, alt}
        }
      }
      const res = await fetch("/api/settings/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          heroImages: uploadedImages,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      toast.success("Pengaturan berhasil disimpan!");
      // Setelah simpan, update preview dengan hasil upload
      setHeroImages(uploadedImages);
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Umum Website</CardTitle>
          <CardDescription>Atur identitas, slider, dan footer website alumni.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {loading ? (
            <div className="text-center py-12">Loading pengaturan...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-12">{error}</div>
          ) : (
            <form className="space-y-8" onSubmit={handleSave}>
              {/* Website Title & Favicon */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg">Identitas Website</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="websiteTitle">Website Title</Label>
                    <Input
                      id="websiteTitle"
                      name="websiteTitle"
                      value={form.websiteTitle}
                      onChange={handleChange}
                      placeholder="Judul website"
                      required
                    />
                  </div>
                  <div>
                    <Label>Favicon</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*,.ico"
                        ref={faviconInputRef}
                        onChange={handleFaviconUpload}
                        className="hidden"
                        id="favicon-upload"
                      />
                      <Button type="button" onClick={() => faviconInputRef.current?.click()}>
                        Upload Favicon
                      </Button>
                      {faviconPreview && (
                        <Image src={faviconPreview} alt="Favicon Preview" width={32} height={32} className="rounded" />
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Hero Image Slider */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg">Hero Image Slider</h3>
                <div className="flex items-center gap-4">
                  <Switch
                    id="heroAutoplay"
                    name="heroAutoplay"
                    checked={form.heroAutoplay}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, heroAutoplay: checked }))}
                  />
                  <Label htmlFor="heroAutoplay">Autoplay Hero Image Slider</Label>
                  {form.heroAutoplay && (
                    <div className="flex items-center gap-2 ml-4">
                      <Label htmlFor="heroInterval">Interval (ms)</Label>
                      <Input
                        id="heroInterval"
                        name="heroInterval"
                        type="number"
                        min={1000}
                        value={form.heroInterval}
                        onChange={handleChange}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Upload Gambar Slider</Label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={heroInputRef}
                    onChange={handleHeroImageSelect}
                    className="hidden"
                    id="hero-upload"
                  />
                  <Button type="button" onClick={() => heroInputRef.current?.click()} className="mt-2">
                    Unggah Foto
                  </Button>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="heroImages" direction="horizontal">
                      {(provided) => (
                        <div
                          className="flex flex-wrap gap-4 mt-4"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {heroImages.map((img, idx) => (
                            <Draggable key={img.preview || img.src} draggableId={img.preview || img.src} index={idx}>
                              {(dragProvided) => (
                                <div
                                  className="relative group"
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                >
                                  <Image
                                    src={img.preview || img.src}
                                    alt={img.alt || img.file?.name || "Hero"}
                                    width={120}
                                    height={80}
                                    style={{ height: 'auto' }}
                                    className="rounded shadow"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-1 right-1 opacity-80 group-hover:opacity-100"
                                    onClick={() => handleRemoveHeroImage(idx)}
                                  >
                                    Hapus
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </section>

              {/* Footer Section */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg">Footer</h3>
                {/* Footer Copyright */}
                <div>
                  <Label htmlFor="footerCopyright">Footer Copyright</Label>
                  <Input
                    id="footerCopyright"
                    name="footerCopyright"
                    value={form.footerCopyright}
                    onChange={handleChange}
                  />
                </div>
                {/* Footer Links */}
                <div>
                  <Label>Footer Links</Label>
                  <div className="space-y-2">
                    {form.footerLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={link.label}
                          onChange={(e) => handleFooterLinkChange(idx, "label", e.target.value)}
                          placeholder="Label"
                          className="w-32"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => handleFooterLinkChange(idx, "url", e.target.value)}
                          placeholder="URL"
                          className="flex-1"
                        />
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveFooterLink(idx)}>
                          Hapus
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleAddFooterLink}>
                      Tambah Link
                    </Button>
                  </div>
                </div>
                {/* Footer Social Media */}
                <div>
                  <Label>Footer Social Media</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={form.footerSocial.instagram}
                      onChange={(e) => setForm((prev) => ({ ...prev, footerSocial: { ...prev.footerSocial, instagram: e.target.value } }))}
                      placeholder="Instagram URL"
                      className="flex-1"
                    />
                    <Input
                      value={form.footerSocial.facebook}
                      onChange={(e) => setForm((prev) => ({ ...prev, footerSocial: { ...prev.footerSocial, facebook: e.target.value } }))}
                      placeholder="Facebook URL"
                      className="flex-1"
                    />
                    <Input
                      value={form.footerSocial.youtube}
                      onChange={(e) => setForm((prev) => ({ ...prev, footerSocial: { ...prev.footerSocial, youtube: e.target.value } }))}
                      placeholder="YouTube URL"
                      className="flex-1"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 