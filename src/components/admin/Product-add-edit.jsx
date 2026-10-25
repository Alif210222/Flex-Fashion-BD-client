
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

const categories = [
  "t-shirts",
  "hoodies",
  "sweatshirts",
  "shirts",
  "fabrics",
  "others",
];

const emptyVariant = {
  sku: "",
  size: "M",
  color: "",
  colorHex: "#292821",
  stock: 0,
};

function unwrap(response) {
  const body = response.data;
  const data = body?.data ?? body;
  return data?.product ?? data;
}

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-[#292821]">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-xs text-[#817665]">{hint}</span>
      )}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#e8e0d3] bg-[#fbf9f5] px-4 py-3 text-sm text-[#292821] outline-none transition placeholder:text-[#aaa092] focus:border-[#817665] focus:bg-white";

export default function ProductEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "t-shirts",
    subcategory: "",
    price: "",
    compareAtPrice: "",
    isFeatured: false,
    status: "active",
    tagsText: "",
    careText: "",
  });

  const [variants, setVariants] = useState([{ ...emptyVariant }]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const productQuery = useQuery({
    queryKey: ["admin-product", id],
    enabled: isEditing,
    queryFn: async () => {
      const response = await api.get(`/products/admin/${id}`);
      return unwrap(response);
    },
  });

  useEffect(() => {
    if (!productQuery.data) return;

    const product = productQuery.data;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      category: product.category || "t-shirts",
      subcategory: product.subcategory || "",
      price: product.price ?? "",
      compareAtPrice: product.compareAtPrice ?? "",
      isFeatured: Boolean(product.isFeatured),
      status: product.status || "active",
      tagsText: (product.tags || []).join(", "),
      careText: (product.careInstructions || []).join("\n"),
    });

    setVariants(
      product.variants?.length
        ? product.variants.map((variant) => ({
            sku: variant.sku || "",
            size: variant.size || "M",
            color: variant.color || "",
            colorHex: variant.colorHex || "#292821",
            stock: variant.stock ?? 0,
          }))
        : [{ ...emptyVariant }]
    );

    setExistingImages(product.images || []);
  }, [productQuery.data]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();

      data.append("name", form.name.trim());
      data.append("slug", form.slug.trim());
      data.append("description", form.description.trim());
      data.append("category", form.category);
      data.append("subcategory", form.subcategory.trim());
      data.append("price", String(Number(form.price)));
      data.append(
        "compareAtPrice",
        form.compareAtPrice === ""
          ? ""
          : String(Number(form.compareAtPrice))
      );
      data.append("isFeatured", String(form.isFeatured));
      data.append("status", form.status);

      data.append(
        "tags",
        JSON.stringify(
          form.tagsText
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      );

      data.append(
        "careInstructions",
        JSON.stringify(
          form.careText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        )
      );

      data.append(
        "variants",
        JSON.stringify(
          variants
            .filter((variant) => variant.sku.trim())
            .map((variant) => ({
              ...variant,
              sku: variant.sku.trim(),
              color: variant.color.trim(),
              stock: Number(variant.stock),
            }))
        )
      );

      files.forEach((file) => data.append("images", file));

      if (isEditing) {
        return api.patch(`/products/${id}`, data);
      }

      return api.post("/products", data);
    },

    onSuccess: () => {
      toast.success(
        isEditing
          ? "Product updated successfully."
          : "Product created successfully."
      );

      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-product", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      navigate("/admin/products");
    },

    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Could not save the product. Please check the fields and try again.";

      toast.error(message);
    },
  });

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "name" && !isEditing
        ? {
            slug: value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
          }
        : {}),
    }));
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const combined = [...files, ...selected];

    if (combined.length > 8) {
      toast.error("You can upload a maximum of 8 images.");
      event.target.value = "";
      return;
    }

    const tooLarge = selected.find((file) => file.size > 5 * 1024 * 1024);

    if (tooLarge) {
      toast.error("Each image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (selected.some((file) => !validTypes.includes(file.type))) {
      toast.error("Use JPG, PNG, WEBP, or AVIF images.");
      event.target.value = "";
      return;
    }

    setFiles(combined);
    event.target.value = "";
  };

  const removeNewFile = (index) => {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    setVariants((previous) =>
      previous.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.slug.trim() || !form.description.trim()) {
      toast.error("Please complete the product name, slug, and description.");
      return;
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      toast.error("Enter a valid product price.");
      return;
    }

    if (
      form.compareAtPrice !== "" &&
      Number(form.compareAtPrice) < Number(form.price)
    ) {
      toast.error("Compare-at price should be at least the selling price.");
      return;
    }

    if (
      variants.some(
        (variant) =>
          !variant.sku.trim() ||
          !Number.isFinite(Number(variant.stock)) ||
          Number(variant.stock) < 0
      )
    ) {
      toast.error("Every variant needs a SKU and valid stock quantity.");
      return;
    }

    if (!isEditing && files.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    saveMutation.mutate();
  };

  if (isEditing && productQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-[#817665]">
        <LoaderCircle className="mr-2 animate-spin" size={20} />
        Loading product...
      </div>
    );
  }

  if (isEditing && productQuery.isError) {
    return (
      <div className="rounded-2xl border border-[#e8e0d3] bg-white p-8 text-center">
        <p className="font-medium text-[#292821]">
          Could not load this product.
        </p>
        <Link
          to="/admin/products"
          className="mt-4 inline-block text-sm underline"
        >
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-[#817665] transition hover:text-[#292821]"
      >
        <ArrowLeft size={17} />
        Back to products
      </Link>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#817665]">
          Inventory management
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#292821]">
          {isEditing ? "Edit product" : "Add a product"}
        </h1>
        <p className="mt-2 text-sm text-[#817665]">
          Add the details your customers need to choose the right item.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-5 rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7">
          <div>
            <h2 className="font-semibold text-[#292821]">Basic information</h2>
            <p className="mt-1 text-sm text-[#817665]">
              Product name, URL, category, and description.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Product name *">
              <input
                required
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Premium Oversized T-Shirt"
                className={inputClass}
              />
            </Field>

            <Field label="Product slug *" hint="Used in product URLs.">
              <input
                required
                name="slug"
                value={form.slug}
                onChange={updateField}
                placeholder="premium-oversized-t-shirt"
                className={inputClass}
              />
            </Field>

            <Field label="Category *">
              <select
                name="category"
                value={form.category}
                onChange={updateField}
                className={inputClass}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace("-", " ")}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Subcategory / style"
              hint="Example: drop-shoulder, oversized."
            >
              <input
                name="subcategory"
                value={form.subcategory}
                onChange={updateField}
                placeholder="drop-shoulder"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description *">
            <textarea
              required
              name="description"
              value={form.description}
              onChange={updateField}
              rows={5}
              placeholder="Describe the fabric, fit, comfort, and other product details..."
              className={`${inputClass} resize-y`}
            />
          </Field>
        </section>

        <section className="space-y-5 rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7">
          <div>
            <h2 className="font-semibold text-[#292821]">Pricing</h2>
            <p className="mt-1 text-sm text-[#817665]">
              Prices are in Bangladeshi taka (BDT).
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Selling price (৳) *">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={updateField}
                placeholder="850"
                className={inputClass}
              />
            </Field>

            <Field
              label="Compare-at price (৳)"
              hint="Optional original price for showing a discount."
            >
              <input
                type="number"
                min="0"
                step="0.01"
                name="compareAtPrice"
                value={form.compareAtPrice}
                onChange={updateField}
                placeholder="1000"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7">
          <div>
            <h2 className="font-semibold text-[#292821]">Product images</h2>
            <p className="mt-1 text-sm text-[#817665]">
              Upload up to 8 images. Each file must be 5 MB or smaller.
              Images upload to Cloudinary through your backend.
            </p>
          </div>

          {existingImages.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-[#625d52]">
                Existing images
              </p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((image, index) => (
                  <img
                    key={image.publicId || image.url || index}
                    src={image.url}
                    alt={image.alt || "Existing product"}
                    className="h-24 w-20 rounded-xl border border-[#e8e0d3] object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfc4b3] bg-[#fbf9f5] p-6 text-center transition hover:bg-[#f7f3eb]">
            <ImagePlus size={27} className="mb-3 text-[#817665]" />
            <span className="text-sm font-medium text-[#292821]">
              Click to select product images
            </span>
            <span className="mt-1 text-xs text-[#817665]">
              JPG, PNG, WEBP or AVIF
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleFiles}
              className="sr-only"
            />
          </label>

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {previews.map((preview, index) => (
                <div key={preview} className="relative">
                  <img
                    src={preview}
                    alt={`Selected product ${index + 1}`}
                    className="h-24 w-20 rounded-xl border border-[#e8e0d3] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    aria-label="Remove selected image"
                    className="absolute -right-2 -top-2 rounded-full bg-[#292821] p-1 text-white"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-[#817665]">
            {files.length} new image(s) selected
          </p>
        </section>

        <section className="space-y-5 rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-[#292821]">Variants & stock</h2>
              <p className="mt-1 text-sm text-[#817665]">
                Configure sizes, colors, SKUs, and inventory.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setVariants((previous) => [
                  ...previous,
                  { ...emptyVariant },
                ])
              }
              className="inline-flex items-center gap-2 rounded-lg border border-[#e8e0d3] px-3 py-2 text-sm hover:bg-[#f7f3eb]"
            >
              <Plus size={16} /> Add variant
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-xl border border-[#eee8df] bg-[#fbf9f5] p-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <Field label="SKU *">
                  <input
                    required
                    value={variant.sku}
                    onChange={(event) =>
                      updateVariant(index, "sku", event.target.value)
                    }
                    placeholder="FF-TS-BLK-M"
                    className={inputClass}
                  />
                </Field>

                <Field label="Size">
                  <select
                    value={variant.size}
                    onChange={(event) =>
                      updateVariant(index, "size", event.target.value)
                    }
                    className={inputClass}
                  >
                    {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map(
                      (size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Color name">
                  <input
                    value={variant.color}
                    onChange={(event) =>
                      updateVariant(index, "color", event.target.value)
                    }
                    placeholder="Black"
                    className={inputClass}
                  />
                </Field>

                <Field label="Color hex">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={variant.colorHex || "#292821"}
                      onChange={(event) =>
                        updateVariant(index, "colorHex", event.target.value)
                      }
                      aria-label="Choose variant color"
                      className="h-12 w-14 cursor-pointer rounded-lg border border-[#e8e0d3] bg-white p-1"
                    />
                    <input
                      value={variant.colorHex}
                      onChange={(event) =>
                        updateVariant(index, "colorHex", event.target.value)
                      }
                      className={inputClass}
                      placeholder="#292821"
                    />
                  </div>
                </Field>

                <Field label="Stock quantity">
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(event) =>
                      updateVariant(index, "stock", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={variants.length === 1}
                    onClick={() =>
                      setVariants((previous) =>
                        previous.filter((_, i) => i !== index)
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                    Remove variant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7">
          <h2 className="font-semibold text-[#292821]">
            Additional information
          </h2>

          <Field
            label="Tags"
            hint="Separate tags with commas, e.g. oversized, cotton, summer."
          >
            <input
              name="tagsText"
              value={form.tagsText}
              onChange={updateField}
              placeholder="oversized, cotton, casual"
              className={inputClass}
            />
          </Field>

          <Field
            label="Care instructions"
            hint="Enter one instruction per line."
          >
            <textarea
              name="careText"
              value={form.careText}
              onChange={updateField}
              rows={3}
              placeholder={"Machine wash cold\nDo not bleach\nDry in shade"}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#e8e0d3] p-4">
              <span>
                <span className="block text-sm font-medium text-[#292821]">
                  Featured product
                </span>
                <span className="mt-1 block text-xs text-[#817665]">
                  Show in the featured section when supported.
                </span>
              </span>
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={updateField}
                className="h-4 w-4 accent-[#292821]"
              />
            </label>

            <Field label="Product status">
              <select
                name="status"
                value={form.status}
                onChange={updateField}
                className={inputClass}
              >
                <option value="active">Active — visible in store</option>
                <option value="draft">Draft — not published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>
        </section>

        <div className="sticky bottom-3 z-20 flex flex-col-reverse justify-end gap-3 rounded-2xl border border-[#e8e0d3] bg-[#f7f3eb]/95 p-3 backdrop-blur sm:flex-row">
          <Link
            to="/admin/products"
            className="rounded-xl border border-[#d9d0c3] px-5 py-3 text-center text-sm font-medium text-[#625d52] hover:bg-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#292821] px-6 py-3 text-sm font-medium text-[#f7f3eb] transition hover:bg-[#454338] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveMutation.isPending && (
              <LoaderCircle size={17} className="animate-spin" />
            )}
            {saveMutation.isPending
              ? "Saving product..."
              : isEditing
                ? "Save changes"
                : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
