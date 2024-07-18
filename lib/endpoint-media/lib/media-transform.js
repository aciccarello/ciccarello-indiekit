import sharp from "sharp";

// The largest image width on my website + a small buffer
const EXTRA_WIDE_THRESHOLD = 1024 + 64;
/**
 * Apply media transformation
 * @param {object} imageProcessing - Sharp image processing options
 * @param {object} file - File
 * @returns {Promise<object>} Media file
 */
export const mediaTransform = async (imageProcessing, file) => {
  const { resize } = imageProcessing;

  let image = sharp(file.data).resize(resize);
  const metadata = await image.metadata();

  if (["jpeg", "jpg"].includes(metadata.format)) {
    // For high DPI screens, I've been saving images with 2x width and 50% quality
    // But don't want to output small images with 50% quality
    const quality = metadata.width > EXTRA_WIDE_THRESHOLD ? 50 : 80;

    image = image.jpeg({ progressive: true, mozjpeg: true, quality });
  }

  const resizedImage = await image.toBuffer();
  if (resizedImage.byteLength < file.data.byteLength) {
    resizedImage.byteLength;
    file.data = resizedImage;
  } else {
    console.log("Resized image larger than original. Skipping resize");
  }

  return file;
};
