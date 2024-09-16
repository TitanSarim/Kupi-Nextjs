import { GetObjectCommand, ListObjectsCommand, type ListObjectsOutput, PutObjectCommand, S3Client, type S3ClientConfig, ObjectCannedACL } from '@aws-sdk/client-s3'
import { createPresignedPost, type PresignedPost } from '@aws-sdk/s3-presigned-post'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import fs, { type ReadStream } from 'fs'
import { Observable } from 'rxjs'
import axios, { type AxiosProgressEvent } from 'axios'
import { type File as FileType } from '@prisma/client'

const S3_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const s3Configuration: S3ClientConfig = {
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_KEY ?? '',
    secretAccessKey: process.env.S3_SECRET ?? ''
  },
  region: process.env.NEXT_PUBLIC_S3_REGION
}

const s3client = new S3Client(s3Configuration)

// export const getSignedURL = async (path: string): Promise<string> => {
//   return `${process.env.NEXT_PUBLIC_ASSETS_URL}/${path}`
// }

export const getSignedURL = async (path: string): Promise<string | null> => {
  try {
    const command = new GetObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET, Key: path })
    const url = await getSignedUrl(s3client, command, { expiresIn: 60 * 60 * 24 * 5 })
    return url
  } catch (error) {
    return null
  }
}

export const getPostSignedURL = async (key: string): Promise<PresignedPost> => {
  return await createPresignedPost(s3client, {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET ?? '',
    Key: key
  })
}


export const downloadFile = async (path: any): Promise<any> => {
  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
    Key: path
  }

  try {
    const { Body }: any = await s3client.send(new GetObjectCommand(params))
    if (Body !== null) {
      console.log('File downloaded successfully:')
      return Body
    }
  } catch (err) {
    console.error('Error downloading file from S3:', err)
    throw err
  }
}

export const uploadFileFromURL = async (url: string, key: string, type: string): Promise<any> => {
  const response = await axios.get(url, { responseType: 'arraybuffer' })
  if (response?.data != null) {
    const result = uploadFile(`${key}`, '', response.data as ReadStream, type)
    return await result
  }
}

export const uploadFile = async (key: string, filePath: string, fileStream?: ReadStream, type?: string): Promise<any> => {
  if (fileStream == null && filePath != null) {
    fileStream = fs.createReadStream(filePath)
  }

  const uploadParams = {
    ACL: ObjectCannedACL.private,
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET ?? '',
    Key: key,
    ContentType: 'image/jpeg',
    Body: fileStream
  }

  return await s3client.send(new PutObjectCommand(uploadParams))
}

export const listFiles = async (): Promise<ListObjectsOutput> => {
  return await new Promise((resolve, reject) => {
    s3client.send(new ListObjectsCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET ?? '' }), (err, data) => {
      if (err != null) reject(err)
      if (data != null) resolve(data)
    })
  })
}

// Usage:
// const uploadToClient = async (event: any) => {
//   if (event.target.files && event.target.files[0]) {
//     uploadToAWS(event.target.files[0]).subscribe((progress) => {});
//   }
// };
export const uploadToAWS = (
  file: File
): Observable<{ progress: number, data?: FileType }> => {
  return new Observable<{ progress: number, data?: FileType }>((subscribe) => {
    // Generate key for file
    const key = `${new Date().getTime()}_${file.name}`

    // Get signed url for file
    const payload: any = { key, action: 'getPostSignedURL' }
    let getSignedUrlResponse: any

    axios
      .request({
        method: 'get',
        url: '/api/s3',
        params: payload
      })
      .then((res) => {
        if (res != null) {
          getSignedUrlResponse = res.data
          if (getSignedUrlResponse != null) {
            const signedUrl = getSignedUrlResponse.url
            const headers: Record<string, string> = getSignedUrlResponse.data

            // Create the form data
            const formBody = new FormData()

            Object.entries(headers).forEach((item: any) => {
              formBody.append(item[0] as string, item[1] as string)
            })

            // sequence of file should be in the last otherwise it will cause an issue
            formBody.append('file', file)

            axios
              .request({
                method: 'post',
                url: signedUrl,
                data: formBody,
                onUploadProgress: (p: AxiosProgressEvent) => {
                  subscribe.next({ progress: p.loaded / (p.total ?? 100) })
                }
              })
              .then((data) => {
                if (data.status === 204) {
                  subscribe.next({ progress: 1 })
                  const fileObject: FileType = {
                    path: `transactions/${key}`,
                    name: file.name,
                    size: file.size,
                    type: file.type
                  }
                  console.log("fileObject", fileObject)
                  subscribe.next({ progress: 1, data: fileObject })
                  subscribe.complete()
                } else {
                  subscribe.error('something went wrong in file uploading')
                }
              })
              .catch((err) => {
                subscribe.error(`${JSON.stringify(err)}`)
              })
          }
        }
      })
      .catch((err) => {
        subscribe.error(`${JSON.stringify(err)}`)
      })
  })
}

export async function uploadFileToS3 (file: any, fileName: string, fileType: string): Promise<void> {
  const uploadParams = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
    Key: fileName,
    ContentType: fileType,
    Body: file
  }
  try {
    await s3client.send(new PutObjectCommand(uploadParams))
  } catch (error) {
    console.log(error)
  }
}
