
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
  RefreshCw,
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

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

// const emptyVariant = {
//   sku: "",
//   size: "M",
//   color: "",
//   colorHex: "#292821",
//   stock: 0,
// };

const emptyColor = {
  name: "",
  hex: "#292821",
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

  // Selected size and color options
  const [selectedSizes, setSelectedSizes] = useState(["M"]);
  const [selectedColors, setSelectedColors] = useState([
    { name: "Black", hex: "#292821" },
  ]);

  // Generated size + color combinations
  const [variants, setVariants] = useState([]);

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

  // Load existing product when editing
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

    const existingVariants = (product.variants || []).map((variant) => ({
      sku: variant.sku || "",
      size: variant.size || "M",
      color: variant.color || "",
      colorHex: variant.colorHex || "#292821",
      stock: variant.stock ?? 0,
    }));

    setVariants(existingVariants);

    const sizes = [
      ...new Set(existingVariants.map((variant) => variant.size).filter(Boolean)),
    ];

    const colors = [
      ...new Map(
        existingVariants
          .filter((variant) => variant.color)
          .map((variant) => [
            variant.color.toLowerCase(),
            {
              name: variant.color,
              hex: variant.colorHex || "#292821",
            },
          ])
      ).values(),
    ];

    setSelectedSizes(sizes.length ? sizes : ["M"]);
    setSelectedColors(colors.length ? colors : []);

    setExistingImages(product.images || []);
  }, [productQuery.data]);

  // Image preview URLs
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

      // Backend receives the same variants array structure as before.
      data.append(
        "variants",
        JSON.stringify(
          variants.map((variant) => ({
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

  // Toggle size selection
  const toggleSize = (size) => {
    setSelectedSizes((previous) =>
      previous.includes(size)
        ? previous.filter((item) => item !== size)
        : [...previous, size]
    );
  };

  // Add another color
  const addColor = () => {
    setSelectedColors((previous) => [
      ...previous,
      { ...emptyColor },
    ]);
  };

  // Update color name or hex
  const updateColor = (index, field, value) => {
    setSelectedColors((previous) =>
      previous.map((color, i) =>
        i === index ? { ...color, [field]: value } : color
      )
    );
  };

  // Remove color
  const removeColor = (index) => {
    setSelectedColors((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Generate every size + color combination.
  // Existing SKU and stock values are preserved for matching combinations.
  const generateVariants = () => {
    const sizes = [...new Set(selectedSizes)];
    const colors = selectedColors
      .filter((color) => color.name.trim())
      .filter(
        (color, index, array) =>
          array.findIndex(
            (item) =>
              item.name.trim().toLowerCase() ===
              color.name.trim().toLowerCase()
          ) === index
      );

    if (!sizes.length) {
      toast.error("Please select at least one size.");
      return;
    }

    if (!colors.length) {
      toast.error("Please add at least one color.");
      return;
    }

    const oldVariants = variants;

    const newVariants = colors.flatMap((color) =>
      sizes.map((size) => {
        const existing = oldVariants.find(
          (variant) =>
            variant.size === size &&
            variant.color.trim().toLowerCase() ===
              color.name.trim().toLowerCase()
        );

        const colorCode = color.name
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 5);

        const productCode = form.name
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 5);

        return {
          sku:
            existing?.sku ||
            `${productCode || "FF"}-${colorCode || "COLOR"}-${size
              .replace(/\s+/g, "")
              .toUpperCase()}`,
          size,
          color: color.name.trim(),
          colorHex: color.hex || "#292821",
          stock: existing?.stock ?? 0,
        };
      })
    );

    setVariants(newVariants);
    toast.success(`${newVariants.length} variants generated.`);
  };

  const updateVariant = (index, field, value) => {
    setVariants((previous) =>
      previous.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const combined = [...files, ...selected];

    if (combined.length + existingImages.length > 8) {
      toast.error("You can have a maximum of 8 product images.");
      event.target.value = "";
      return;
    }

    const tooLarge = selected.find(
      (file) => file.size > 5 * 1024 * 1024
    );

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
      (!Number.isFinite(Number(form.compareAtPrice)) ||
        Number(form.compareAtPrice) < Number(form.price))
    ) {
      toast.error("Compare-at price should be at least the selling price.");
      return;
    }

    if (!variants.length) {
      toast.error("Generate at least one product variant.");
      return;
    }

    const invalidVariant = variants.some(
      (variant) =>
        !variant.sku.trim() ||
        !variant.size ||
        !variant.color.trim() ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
    );

    if (invalidVariant) {
      toast.error(
        "Every variant needs a SKU, size, color, and valid stock quantity."
      );
      return;
    }

    const skuList = variants.map((variant) =>
      variant.sku.trim().toLowerCase()
    );

    if (new Set(skuList).size !== skuList.length) {
      toast.error("Each variant must have a unique SKU.");
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
        {/* BASIC INFORMATION */}
        <section className="space-y-5 rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7">
          <div>
            <h2 className="font-semibold text-[#292821]">
              Basic information
            </h2>
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

        {/* PRICING */}
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

        {/* PRODUCT IMAGES */}
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

        {/* MULTIPLE SIZES AND COLORS */}
        <section className="space-y-6 rounded-2xl border border-[#e8e0d3] bg-white p-5 sm:p-7">
          <div>
            <h2 className="font-semibold text-[#292821]">
              Sizes, colors & stock
            </h2>
            <p className="mt-1 text-sm text-[#817665]">
              Select multiple sizes and colors. The system will generate
              individual variants for every combination.
            </p>
          </div>

          {/* SIZE SELECTOR */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[#292821]">
              Available sizes
            </h3>

            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const active = selectedSizes.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`rounded-lg border px-4 py-2 text-sm transition ${
                      active
                        ? "border-[#292821] bg-[#292821] text-white"
                        : "border-[#e8e0d3] bg-[#fbf9f5] text-[#625d52] hover:border-[#817665]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-[#817665]">
              {selectedSizes.length} size(s) selected
            </p>
          </div>

          <div className="border-t border-[#eee8df]" />

          {/* COLOR SELECTOR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-[#292821]">
                  Available colors
                </h3>
                <p className="mt-1 text-xs text-[#817665]">
                  Add each color customers can choose.
                </p>
              </div>

              <button
                type="button"
                onClick={addColor}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e8e0d3] px-3 py-2 text-sm hover:bg-[#f7f3eb]"
              >
                <Plus size={16} />
                Add color
              </button>
            </div>

            {selectedColors.map((color, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-[#eee8df] bg-[#fbf9f5] p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Field label="Color name">
                  <input
                    value={color.name}
                    onChange={(event) =>
                      updateColor(index, "name", event.target.value)
                    }
                    placeholder="Black"
                    className={inputClass}
                  />
                </Field>

                <Field label="Color code">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(color.hex) ? color.hex : "#292821"}
                      onChange={(event) =>
                        updateColor(index, "hex", event.target.value)
                      }
                      aria-label="Choose color"
                      className="h-12 w-14 cursor-pointer rounded-lg border border-[#e8e0d3] bg-white p-1"
                    />
                    <input
                      value={color.hex}
                      onChange={(event) =>
                        updateColor(index, "hex", event.target.value)
                      }
                      placeholder="#292821"
                      className={inputClass}
                    />
                  </div>
                </Field>

                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={selectedColors.length === 1}
                    onClick={() => removeColor(index)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* GENERATE BUTTON */}
          <div className="rounded-xl bg-[#f7f3eb] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#292821]">
                  Generate variant combinations
                </p>
                <p className="mt-1 text-xs text-[#817665]">
                  {selectedSizes.length} size(s) × {selectedColors.filter((color) => color.name.trim()).length} color(s)
                </p>
              </div>

              <button
                type="button"
                onClick={generateVariants}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#292821] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#454338]"
              >
                <RefreshCw size={16} />
                Generate variants
              </button>
            </div>
          </div>

          {/* GENERATED VARIANTS */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#292821]">
                Generated variants ({variants.length})
              </h3>
              <p className="mt-1 text-xs text-[#817665]">
                Set a unique SKU and stock quantity for each size-color combination.
              </p>
            </div>

            {variants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d9d0c3] p-8 text-center">
                <p className="text-sm text-[#817665]">
                  No variants generated yet.
                </p>
                <p className="mt-1 text-xs text-[#aaa092]">
                  Select sizes and colors, then click Generate variants.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div
                    key={`${variant.color}-${variant.size}-${index}`}
                    className="grid gap-4 rounded-xl border border-[#eee8df] bg-[#fbf9f5] p-4 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    <div>
                      <p className="mb-2 text-xs font-medium text-[#817665]">
                        SIZE
                      </p>
                      <div className="rounded-xl border border-[#e8e0d3] bg-white px-4 py-3 text-sm font-medium text-[#292821]">
                        {variant.size}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium text-[#817665]">
                        COLOR
                      </p>
                      <div className="flex items-center gap-2 rounded-xl border border-[#e8e0d3] bg-white px-3 py-3 text-sm text-[#292821]">
                        <span
                          className="h-5 w-5 rounded-full border border-black/10"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        {variant.color}
                      </div>
                    </div>

                    <Field label="SKU *">
                      <input
                        required
                        value={variant.sku}
                        onChange={(event) =>
                          updateVariant(index, "sku", event.target.value)
                        }
                        placeholder="FF-BLACK-M"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Stock quantity *">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ADDITIONAL INFORMATION */}
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

        {/* ACTION BUTTONS */}
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


