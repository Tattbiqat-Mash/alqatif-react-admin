import { UPLOADED_IMAGES_BASE } from "@/config/content-types"
import { apiUpload } from "@/lib/api/client"
import { ApiError } from "@/lib/api/errors"
import { toText } from "@/lib/api/parse"

/**
 * Image upload reply, confirmed for `posts/uploadImage` (rules/api-samples/posts-upload-image.json):
 * `{ status, rowsCount, fileName, filePath }`. ⚠ TBD: assumed identical for `ads/uploadImage`.
 */
type UploadImageResponseDto = {
  status: "success"
  rowsCount?: number | string
  fileName: string
  filePath: string
}

/**
 * Uploads one image (multipart field `attachment`) and resolves to its full URL
 * (`filePath/fileName`) — the format stored in `mainImage` / `image`.
 */
export async function uploadImageTo(
  url: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const form = new FormData()
  form.append("attachment", file)
  const raw = await apiUpload<UploadImageResponseDto>(url, form, { onProgress })
  const fileName = toText(raw?.fileName)
  if (!fileName) {
    throw new ApiError({
      statusCode: 200,
      message: "تم رفع الصورة لكن تعذر قراءة اسمها من رد الخادم.",
      serverMessage: `${url}: no fileName in the response`,
    })
  }
  const folder = (toText(raw?.filePath) || UPLOADED_IMAGES_BASE).replace(/\/+$/, "")
  return `${folder}/${fileName}`
}
