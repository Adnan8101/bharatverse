'use client'
import Image from 'next/image'

export default function TestImages() {
  const images = [
    '/product_img1.png',
    '/product_img2.png', 
    '/product_img3.png',
    '/product_img4.png',
    '/product_img5.png',
    '/product_img6.png',
    '/product_img7.png',
    '/product_img8.png',
    '/product_img9.png',
    '/product_img10.png',
    '/product_img11.png',
    '/product_img12.png',
    '/gs_logo.jpg',
    '/happy_store.webp',
    '/profile_pic1.jpg',
    '/profile_pic2.jpg',
    '/profile_pic3.jpg'
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Image Loading Test</h1>
      <div className="grid grid-cols-4 gap-4">
        {images.map((src, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">{src}</h3>
            <Image 
              src={src} 
              alt={`Test image ${index + 1}`}
              width={200}
              height={200}
              className="w-full h-auto rounded"
              onError={(e) => {
                console.error(`Failed to load image: ${src}`)
                e.target.style.border = '2px solid red'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
