import { stringify } from 'qs-esm'
import type { Where } from 'payload'
import { Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { toast } from 'react-toastify'
import { Classification, FurnitureModelsMedia, Media } from '@/payload-types'

import {
  getTextureCollection,
  getModelByRoomId,
} from '../components/server/actions'

const getFurnitureData = async () => {
  try {

    const res = await getModelByRoomId(0)

    const docs = res.docs

    // Get unique classifications
    const set = new Set<Classification>(docs.map((doc) => doc.classification as Classification))
    const uniqueClassifications = [...set]
    const loader = new GLTFLoader()
    // Create an object to store documents by classification
    const documentsByClassification = uniqueClassifications.reduce(
      (acc: Categories, classification: Classification) => {
        if (!classification) return acc
        const classified = docs.filter(
          (doc) => (doc.classification as Classification).name === classification.name,
        )
        for (const doc of classified) {
          const asset: Asset = {
            name: doc.name.length > 10 ? doc.name.slice(0, 10) + '...' : doc.name,
            nameRaw: doc.name,
            thumbnail: (doc.thumbnail as Media).url || '',
            uuid: doc.id.toString(),
            load: () => {
              return new Promise((resolve, reject) => {
                loader.load(
                  (doc.model_file as FurnitureModelsMedia).url || '',
                  (gltf) => {
                    resolve(gltf.scene)
                  },
                  undefined,
                  (error) => {
                    toast.error(`Failed to load model: ${doc.name}`)
                    reject(error)
                  },
                )
              })
            },
          }
          if (!acc[classification.name || 'Other']) {
            acc[classification.name || 'Other'] = {
              assets: [],
              thumbnail: (classification.thumbnail as Media).url || null,
            }
          }
          acc[classification.name || 'Other'].assets.push(asset)
        }
        return acc
      },
      {},
    )

    return documentsByClassification
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'An error occurred while fetching furniture data',
    )
    return {}
  }
}

const getTextures = async () => {
  try {
    const res = await getTextureCollection()
    const data = res
    return data.docs
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : 'An error occurred while fetching room types. Check if they are defined in the CMS.',
    )
    return []
  }
}

interface Asset {
  name: string
  thumbnail: string
  nameRaw: string
  uuid: string
  load: () => Promise<Object3D>
}

interface Categories {
  [key: string]: {
    assets: Asset[]
    thumbnail: string | null
  }
}

export default getFurnitureData
export { getTextures }
export type { Categories, Asset, Classification }
