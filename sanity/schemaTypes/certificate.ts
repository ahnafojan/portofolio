import { defineType, defineField } from "sanity";

export default defineType({
  name: "certificate",
  title: "Certificates",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Certificate Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "issuer", title: "Issuer", type: "string" }),
    defineField({ name: "issueDate", title: "Issue Date", type: "date" }),
    defineField({ name: "expiryDate", title: "Expiry Date", type: "date" }),
    defineField({ name: "credentialUrl", title: "Credential URL", type: "url" }),
    defineField({ name: "credentialId", title: "Credential ID", type: "string" }),
    defineField({
      name: "skills",
      title: "Related Skills",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "logos",
      title: "Logos",
      description: "Bisa upload lebih dari satu logo/gambar sertifikat.",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
    }),
    defineField({
      name: "logo",
      title: "Legacy Logo (Single)",
      description: "Field lama. Gunakan Logos untuk input baru.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
});
