'use client'
import { insertVideo } from '@/app/(frontend)/components/server/getVideos'
import { getIdByRoomName } from '@/app/(frontend)/components/server/actions'


export default async function uploadRenderPage(
  file: File,
  roomName: string,
  roomType: string,
  onError?: (e: Error) => void,
  onUploadChunk?: (p: number) => void,
  onFinally?: () => void,
): Promise<any> {
  const key = `videos/${file.name}-${Date.now()}.webm`

  try {
    const headers: HeadersInit = new Headers({
      'Content-Type': 'application/octet-stream',
      'x-last-part': 'false',
    })
    const res = await fetch(`/api/get-s3-presigned`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        key: key,
      }),
    })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || res.statusText)
    }
    const { presignedUrl, location } = await res.json()
    const upload = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!upload.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || res.statusText)
    }
    const roomTypes = await getIdByRoomName(roomType as string)
    const result = await insertVideo(location, roomName, roomTypes?.docs[0].id as number )
    console.log(result)
   
  } catch (error: any) {
    if (onError) onError(error)
  } finally {
    if (onFinally) onFinally()
  }
}
