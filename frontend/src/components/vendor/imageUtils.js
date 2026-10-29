// Reads an image file, shrinks it, and returns a data URL (keeps storage small).
// Temporary stand-in: with the backend, upload the file and store the returned URL instead.
export function readImage(file, max = 600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        resolve(canvas.toDataURL(type, 0.8))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
