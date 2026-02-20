self.onmessage = async (e: MessageEvent) => {
  const file: File = e.data.file;
  
  try {
    if (file.type.startsWith('image/')) {
      const bitmap = await createImageBitmap(file);
      
      let width = bitmap.width;
      let height = bitmap.height;
      const MAX_SIDE = 1920;
      
      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width > height) {
          height = Math.round((height * MAX_SIDE) / width);
          width = MAX_SIDE;
        } else {
          width = Math.round((width * MAX_SIDE) / height);
          height = MAX_SIDE;
        }
      }
      
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');
      
      ctx.drawImage(bitmap, 0, 0, width, height);
      
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.8 });
      const buffer = await blob.arrayBuffer();
      
      // Transfer the buffer natively without copying
      (self as unknown as Worker).postMessage(
        { success: true, buffer, type: 'image/webp', isBuffer: true }, 
        [buffer]
      );
    } else {
      const buffer = await file.arrayBuffer();
      
      // Transfer the buffer natively without copying
      (self as unknown as Worker).postMessage(
        { success: true, buffer, type: file.type, isBuffer: true }, 
        [buffer]
      );
    }
  } catch (err) {
    self.postMessage({ success: false, error: (err as Error).message });
  }
};
