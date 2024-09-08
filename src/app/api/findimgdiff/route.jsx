import { NextResponse } from "next/server";
import sharp from "sharp";

// Handle POST requests in Next.js API routes
export async function POST(req) {
  try {
    // Retrieve the form data (which includes the image files)
    const formData = await req.formData();
    const original = formData.get("original"); // Original image file
    const modified = formData.get("modified"); // Modified image file

    if (!original || !modified) {
      return NextResponse.json(
        { error: "Both original and modified images are required" },
        { status: 400 }
      );
    }

    // Read file contents as buffers
    const originalBuffer = Buffer.from(await original.arrayBuffer());
    const modifiedBuffer = Buffer.from(await modified.arrayBuffer());

    // Compare images
    const differences = await compareImages(originalBuffer, modifiedBuffer);

    // Return the comparison result
    return NextResponse.json({
      originalFileName: original.name,
      modifiedFileName: modified.name,
      differences,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Image comparison failed" },
      { status: 500 }
    );
  }
}

// Compare two images using sharp
async function compareImages(buffer1, buffer2) {
  // Ensure both images have an alpha channel and retrieve their buffer data
  const img1 = await sharp(buffer1).ensureAlpha().raw().toBuffer();
  const img2 = await sharp(buffer2).ensureAlpha().raw().toBuffer();

  // Get metadata to compare dimensions
  const metadata1 = await sharp(buffer1).metadata();
  const metadata2 = await sharp(buffer2).metadata();

  if (
    metadata1.width !== metadata2.width ||
    metadata1.height !== metadata2.height
  ) {
    throw new Error("Images must have the same dimensions");
  }

  // if (
  //   metadata1.width !== metadata2.width ||
  //   metadata1.height !== metadata2.height
  // ) {
  //   return NextResponse.json(
  //     { error: "Images must have the same dimensions" },
  //     { status: 400 }
  //   );
  // }

  const width = metadata1.width;
  const height = metadata1.height;

  const differences = [];

  // Compare pixel by pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      const pixel1 =
        (img1[idx] << 24) |
        (img1[idx + 1] << 16) |
        (img1[idx + 2] << 8) |
        img1[idx + 3];
      const pixel2 =
        (img2[idx] << 24) |
        (img2[idx + 1] << 16) |
        (img2[idx + 2] << 8) |
        img2[idx + 3];
      if (pixel1 !== pixel2) {
        differences.push([x, y]);
      }
    }
  }

  return differences;
}
